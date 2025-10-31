import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { User } from "@/api/entities";
import { PublicProfile } from "@/api/entities";
import { CheckIn } from "@/api/entities";
import { Place } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, Crown, TrendingUp, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function RankingCategory() {
  const query = useQuery();
  const category = query.get("category") || "geral";
  
  const [rankingData, setRankingData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState("nacional");
  const [userLocation, setUserLocation] = useState({ state: null, city: null });

  const formatUserName = (fullName) => {
    if (!fullName) return "";
    const names = fullName.trim().split(" ");
    if (names.length > 1) {
      return `${names[0]} ${names[names.length - 1]}`;
    }
    return fullName;
  };

  const calculateRankings = useCallback(async () => {
    setLoading(true);
    try {
      const [allCheckIns, allPlaces, allProfiles, userData] = await Promise.all([
        CheckIn.list(),
        Place.list(),
        PublicProfile.list(),
        User.me(),
      ]);
      setCurrentUser(userData);

      const placesById = allPlaces.reduce((acc, place) => {
        acc[place.id] = place;
        return acc;
      }, {});
      
      let locationForScope = { state: null, city: null };

      if (scope === "estadual" || scope === "municipal") {
          const userCheckIns = allCheckIns.filter(c => c.user_email === userData.email);
          const userPlaces = userCheckIns.map(c => placesById[c.place_id]).filter(Boolean);
          
          if (userPlaces.length > 0) {
              const stateCounts = userPlaces.reduce((acc, p) => { acc[p.state] = (acc[p.state] || 0) + 1; return acc; }, {});
              const mostFrequentState = Object.keys(stateCounts).sort((a, b) => stateCounts[b] - stateCounts[a])[0];
              locationForScope.state = mostFrequentState;
              setUserLocation(prev => ({ ...prev, state: mostFrequentState }));
              
              if (scope === "municipal") {
                  const cityCounts = userPlaces.filter(p => p.state === mostFrequentState).reduce((acc, p) => { acc[p.city] = (acc[p.city] || 0) + 1; return acc; }, {});
                  const mostFrequentCity = Object.keys(cityCounts).sort((a, b) => cityCounts[b] - cityCounts[a])[0];
                  locationForScope.city = mostFrequentCity;
                  setUserLocation(prev => ({ ...prev, city: mostFrequentCity }));
              }
          }
      } else {
        setUserLocation({ state: null, city: null });
      }

      // Se for ranking geral, usar total_points do perfil público
      if (category === 'geral') {
        let filteredProfiles = allProfiles;
        
        if (scope === 'estadual' || scope === 'municipal') {
          // Para escopo estadual/municipal, filtrar usuários que tem check-ins na região
          const usersInRegion = new Set();
          allCheckIns.forEach(checkIn => {
            const place = placesById[checkIn.place_id];
            if (!place) return;
            
            let scopeMatch = false;
            if (scope === 'estadual') {
              scopeMatch = place.state === locationForScope.state;
            } else if (scope === 'municipal') {
              scopeMatch = place.city === locationForScope.city && place.state === locationForScope.state;
            }
            
            if (scopeMatch) {
              usersInRegion.add(checkIn.user_email);
            }
          });
          
          filteredProfiles = allProfiles.filter(p => usersInRegion.has(p.user_email));
        }
        
        const rankedProfiles = filteredProfiles
          .map(profile => ({
            ...profile,
            points: profile.total_points || 0,
          }))
          .filter(p => p.points > 0)
          .sort((a, b) => b.points - a.points);
        
        setRankingData(rankedProfiles);
      } else {
        // Para categorias específicas, calcular pontos por check-ins
        const pointsByUser = {};
        allCheckIns.forEach(checkIn => {
          const place = placesById[checkIn.place_id];
          if (!place) return;

          const categoryMatch = place.category === category;
          let scopeMatch = false;
          if (scope === 'nacional') {
            scopeMatch = true;
          } else if (scope === 'estadual') {
            scopeMatch = place.state === locationForScope.state;
          } else if (scope === 'municipal') {
            scopeMatch = place.city === locationForScope.city && place.state === locationForScope.state;
          }

          if (categoryMatch && scopeMatch) {
            pointsByUser[checkIn.user_email] = (pointsByUser[checkIn.user_email] || 0) + checkIn.points_earned;
          }
        });

        const rankedProfiles = allProfiles
          .map(profile => ({
            ...profile,
            points: pointsByUser[profile.user_email] || 0,
          }))
          .filter(p => p.points > 0)
          .sort((a, b) => b.points - a.points);
        
        setRankingData(rankedProfiles);
      }
    } catch (error) {
      console.error("Error calculating rankings:", error);
    }
    setLoading(false);
  }, [category, scope]);
  
  useEffect(() => {
    calculateRankings();
  }, [calculateRankings]);

  const getRankIcon = (position) => {
    if (position === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (position === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (position === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return null;
  };
  
  const getRankBadgeColor = (position) => {
    if (position === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
    if (position === 2) return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
    if (position === 3) return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
    return "bg-gray-100 text-gray-700";
  };

  const currentUserData = useMemo(() => {
    if (!currentUser) return null;
    const data = rankingData.find(u => u.user_email === currentUser.email);
    if (!data) return null;
    const rank = rankingData.findIndex(u => u.user_email === currentUser.email) + 1;
    return { ...data, rank };
  }, [currentUser, rankingData]);
  
  const categoryName = useMemo(() => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }, [category]);
  
  const scopeName = useMemo(() => {
    if (scope === 'estadual') return `Estadual (${userLocation.state || 'N/A'})`;
    if (scope === 'municipal') return `Municipal (${userLocation.city || 'N/A'})`;
    return 'Nacional';
  }, [scope, userLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-4">
            <Link to={createPageUrl("Rankings")}>
              <Button variant="outline" size="icon" className="h-10 w-10 flex-shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                Ranking de {categoryName}
              </h1>
              <p className="text-gray-600">Classificação: {scopeName}</p>
            </div>
          </div>
        </motion.div>

        <Card>
          <CardContent className="p-4">
             <Select value={scope} onValueChange={setScope}>
                <SelectTrigger className="w-full lg:w-[280px]">
                  <SelectValue placeholder="Selecionar escopo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nacional">Nacional</SelectItem>
                  <SelectItem value="estadual">Estadual</SelectItem>
                  <SelectItem value="municipal">Municipal</SelectItem>
                </SelectContent>
              </Select>
          </CardContent>
        </Card>

        {currentUserData && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
            <Card className="border-none shadow-xl bg-gradient-to-br from-purple-600 via-purple-500 to-orange-500 text-white">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold">{currentUser.full_name?.charAt(0) || 'U'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-purple-100 mb-1">Sua Posição</p>
                      <h2 className="text-2xl font-bold truncate">{formatUserName(currentUser.full_name)}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Trophy className="w-4 h-4" />
                        <span className="font-semibold">{currentUserData.points} pontos</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center sm:text-right pt-4 sm:pt-0">
                    <div className="text-4xl sm:text-5xl font-bold mb-1">#{currentUserData.rank}</div>
                    <Badge className="bg-white/20 text-white border-white/30">Nível {currentUser.level || 1}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Card className="border-none shadow-xl">
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-6 h-6 text-purple-600" />Ranking Completo</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankingData.map((user, index) => {
                const position = index + 1;
                const isCurrentUser = currentUser && user.user_email === currentUser.email;
                
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${isCurrentUser ? 'bg-gradient-to-r from-purple-100 to-orange-100 shadow-md' : 'bg-gray-50 hover:bg-gray-100'}`}
                  >
                    <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0">
                      <Badge className={`w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-base lg:text-lg font-bold flex-shrink-0 ${getRankBadgeColor(position)}`}>{position}</Badge>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate flex items-center gap-2">
                          {formatUserName(user.full_name)}
                          {isCurrentUser && <Badge variant="outline" className="text-xs hidden sm:inline-block">Você</Badge>}
                        </h4>
                        <p className="text-xs text-gray-500">Nível {user.level || 1}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-gray-900">
                          <Trophy className="w-4 h-4 text-orange-500 flex-shrink-0" />
                          <span className="text-base font-bold">{user.points}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {rankingData.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Ninguém pontuou neste ranking ainda.</p>
                <p className="text-sm text-gray-400">Seja o primeiro a explorar!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}