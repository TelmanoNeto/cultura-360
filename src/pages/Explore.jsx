
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Place } from "@/api/entities";
import { CheckIn } from "@/api/entities";
import { User } from "@/api/entities";
import { PublicProfile } from "@/api/entities";
import { Badge as BadgeEntity } from "@/api/entities";
import { UserBadge } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  Filter,
  CheckCircle,
  Award,
  ExternalLink,
  Map // Adicionado ícone de mapa
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Explore() {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      const placesData = await Place.filter({ is_active: true }, "-created_date");
      setPlaces(placesData);
      setFilteredPlaces(placesData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const filterPlaces = useCallback(() => {
    let filtered = places;

    if (searchQuery) {
      filtered = filtered.filter(place =>
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(place => place.category === selectedCategory);
    }

    if (selectedState !== "all") {
      filtered = filtered.filter(place => place.state === selectedState);
    }

    if (selectedCity !== "all") {
      filtered = filtered.filter(place => place.city === selectedCity);
    }

    setFilteredPlaces(filtered);
  }, [places, searchQuery, selectedCategory, selectedState, selectedCity]);

  useEffect(() => {
    filterPlaces();
  }, [filterPlaces]);

  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedCity("all"); // Reseta a cidade quando o estado muda
  };

  const uniqueStates = useMemo(() => 
    [...new Set(places.map(p => p.state).filter(Boolean))].sort(), 
  [places]);

  const uniqueCities = useMemo(() => {
    if (selectedState === 'all') return [];
    return [...new Set(places.filter(p => p.state === selectedState).map(p => p.city).filter(Boolean))].sort();
  }, [places, selectedState]);

  const handleCheckIn = async (place) => {
    if (!user) return;
    
    setCheckingIn(place.id);
    try {
      await CheckIn.create({
        user_email: user.email,
        place_id: place.id,
        points_earned: place.points_value || 10
      });

      const newPoints = (user.total_points || 0) + (place.points_value || 10);
      const newLevel = Math.floor(newPoints / 100) + 1;
      
      const updatedUserData = {
        total_points: newPoints,
        level: newLevel,
      };

      await User.updateMyUserData(updatedUserData);

      const existingPublicProfile = await PublicProfile.filter({ user_email: user.email }, "", 1);
      const publicProfileData = {
        user_email: user.email,
        full_name: user.full_name,
        total_points: newPoints,
        level: newLevel,
      };

      if (existingPublicProfile.length > 0) {
        await PublicProfile.update(existingPublicProfile[0].id, publicProfileData);
      } else {
        await PublicProfile.create(publicProfileData);
      }

      alert(`Check-in realizado! Você ganhou ${place.points_value || 10} pontos! 🎉`);

      // Badge Awarding Logic
      await checkAndAwardBadges(user);

      loadData();
    } catch (error) {
      console.error("Error checking in:", error);
      alert("Erro ao realizar check-in. Tente novamente.");
    }
    setCheckingIn(null);
  };

  const checkAndAwardBadges = async (currentUser) => {
    try {
      const allBadges = await BadgeEntity.list();
      const userBadges = await UserBadge.filter({ user_email: currentUser.email });
      const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
      const unearnedBadges = allBadges.filter(b => !earnedBadgeIds.has(b.id));

      if (unearnedBadges.length === 0) return;

      const allUserCheckIns = await CheckIn.filter({ user_email: currentUser.email });
      
      const placeIds = [...new Set(allUserCheckIns.map(c => c.place_id))];
      // Fetching all places and then filtering for efficiency, assuming `Place.list()` is cached or not too large.
      // A more optimized approach for large datasets would be `Place.filter({ id__in: placeIds })` if supported.
      const allPlaces = await Place.list(); 
      const placesData = allPlaces.filter(p => placeIds.includes(p.id));

      const placesById = placesData.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {});
      
      const newBadgesAwarded = [];

      for (const badge of unearnedBadges) {
        let requirementMet = false;
        const [key, ...params] = badge.requirement.split(':');

        if (key === 'check_in_count') {
          const requiredCount = parseInt(params[0], 10);
          if (allUserCheckIns.length >= requiredCount) {
            requirementMet = true;
          }
        } else if (key === 'category_check_in_count') {
          const requiredCategory = params[0];
          const requiredCount = parseInt(params[1], 10);

          const uniquePlacesInCategory = new Set();
          allUserCheckIns.forEach(checkIn => {
            const place = placesById[checkIn.place_id];
            if (place && place.category === requiredCategory) {
              uniquePlacesInCategory.add(place.id);
            }
          });

          if (uniquePlacesInCategory.size >= requiredCount) {
            requirementMet = true;
          }
        }

        if (requirementMet) {
          await UserBadge.create({
            user_email: currentUser.email,
            badge_id: badge.id,
            earned_date: new Date().toISOString()
          });
          newBadgesAwarded.push(badge.name);
        }
      }

      if (newBadgesAwarded.length > 0) {
        setTimeout(() => {
          alert(`✨ Novo Badge Conquistado! ✨\n\nVocê ganhou: ${newBadgesAwarded.join(', ')}`);
        }, 500); // Small delay to separate from check-in alert
      }
    } catch (error) {
      console.error("Error checking for badges:", error);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      museu: "bg-purple-100 text-purple-700 border-purple-200",
      parque: "bg-green-100 text-green-700 border-green-200",
      teatro: "bg-pink-100 text-pink-700 border-pink-200",
      feira: "bg-orange-100 text-orange-700 border-orange-200",
      restaurante: "bg-red-100 text-red-700 border-red-200",
      exposição: "bg-blue-100 text-blue-700 border-blue-200",
      evento: "bg-yellow-100 text-yellow-700 border-yellow-200",
      monumento: "bg-indigo-100 text-indigo-700 border-indigo-200",
      esporte: "bg-cyan-100 text-cyan-700 border-cyan-200",
      "mundo animal": "bg-emerald-100 text-emerald-700 border-emerald-200",
      outro: "bg-gray-100 text-gray-700 border-gray-200"
    };
    return colors[category] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
            Explorar Locais
          </h1>
          <p className="text-gray-600">Descubra experiências culturais incríveis na sua cidade e região</p>
        </motion.div>

        {/* Search and Filters */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar locais..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-auto flex-1">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="museu">Museus</SelectItem>
                    <SelectItem value="parque">Parques</SelectItem>
                    <SelectItem value="teatro">Teatros</SelectItem>
                    <SelectItem value="feira">Feiras</SelectItem>
                    <SelectItem value="restaurante">Restaurantes</SelectItem>
                    <SelectItem value="exposição">Exposições</SelectItem>
                    <SelectItem value="evento">Eventos</SelectItem>
                    <SelectItem value="monumento">Monumentos</SelectItem>
                    <SelectItem value="esporte">Esporte</SelectItem>
                    <SelectItem value="mundo animal">Mundo Animal</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedState} onValueChange={handleStateChange}>
                  <SelectTrigger className="w-full sm:w-auto flex-1">
                    <Map className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Estados</SelectItem>
                    {uniqueStates.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCity} onValueChange={setSelectedCity} disabled={selectedState === 'all' || uniqueCities.length === 0}>
                  <SelectTrigger className="w-full sm:w-auto flex-1">
                    <MapPin className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Cidades</SelectItem>
                     {uniqueCities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          {filteredPlaces.length} {filteredPlaces.length === 1 ? 'local encontrado' : 'locais encontrados'}
        </div>

        {/* Places Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredPlaces.map((place, index) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                  {place.image_url && (
                    <div className="h-48 overflow-hidden bg-gradient-to-br from-purple-100 to-orange-100">
                      <img 
                        src={place.image_url} 
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={`${getCategoryColor(place.category)} border`}>
                        {place.category}
                      </Badge>
                      <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                        <Award className="w-4 h-4" />
                        <span className="text-sm font-bold">+{place.points_value || 10}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-xl mb-2 text-gray-900">
                      {place.name}
                    </h3>
                    
                    {place.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {place.description}
                      </p>
                    )}
                    
                    <div className="flex items-start gap-2 text-sm text-gray-500 mb-4">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{place.address}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCheckIn(place)}
                        disabled={checkingIn === place.id}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white"
                      >
                        {checkingIn === place.id ? (
                          <>Realizando...</>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Check-in
                          </>
                        )}
                      </Button>
                      {(place.latitude && place.longitude) && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(`https://www.google.com/maps?q=${place.latitude},${place.longitude}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredPlaces.length === 0 && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-12 text-center">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum local encontrado
              </h3>
              <p className="text-gray-500">
                Tente ajustar os filtros de busca
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
