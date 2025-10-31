
import React, { useState, useEffect, useMemo } from "react";
import { User } from "@/api/entities";
import { CheckIn } from "@/api/entities";
import { UserBadge } from "@/api/entities";
import { Badge as BadgeEntity } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import RecentActivity from "../components/home/RecentActivity";
import { 
  User as UserIcon, 
  Trophy, 
  Award, 
  MapPin, 
  Calendar,
  TrendingUp,
  Star,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      const userCheckIns = await CheckIn.filter({ user_email: userData.email }, "-created_date");
      setCheckIns(userCheckIns);
      
      const allBadges = await BadgeEntity.list();
      setBadges(allBadges);
      
      const earnedBadges = await UserBadge.filter({ user_email: userData.email });
      setUserBadges(earnedBadges);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
    setLoading(false);
  };

  const getLevelProgress = () => {
    const currentLevel = user?.level || 1;
    // Assuming 100 points for the next level as a simple progression
    const pointsForNextLevel = 100; // For simplicity, let's say each level requires 100 points beyond the current level's threshold
    const currentPointsInLevel = (user?.total_points || 0) % pointsForNextLevel; 
    return (currentPointsInLevel / pointsForNextLevel) * 100;
  };

  const getCheckInsThisMonth = () => {
    const now = new Date();
    return checkIns.filter(c => {
      const checkInDate = new Date(c.created_date);
      return checkInDate.getMonth() === now.getMonth() && 
             checkInDate.getFullYear() === now.getFullYear();
    }).length;
  };

  const getIconComponent = (iconName) => {
    const icons = {
      trophy: Trophy,
      star: Star,
      medal: Award,
      crown: Trophy,
      heart: Star,
      flame: Sparkles,
      sparkles: Sparkles,
      award: Award,
      target: MapPin,
      flag: MapPin
    };
    return icons[iconName] || Star;
  };

  const getBadgeColor = (color) => {
    const colors = {
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600",
      green: "from-green-500 to-green-600",
      blue: "from-blue-500 to-blue-600",
      red: "from-red-500 to-red-600",
      yellow: "from-yellow-500 to-yellow-600",
      pink: "from-pink-500 to-pink-600"
    };
    return colors[color] || "from-gray-500 to-gray-600";
  };

  const sortedBadges = useMemo(() => {
    if (!badges || !userBadges) return [];
    return [...badges].sort((a, b) => {
      const aIsEarned = userBadges.some(ub => ub.badge_id === a.id);
      const bIsEarned = userBadges.some(ub => ub.badge_id === b.id);
      if (aIsEarned && !bIsEarned) return -1; // a (earned) comes before b (unearned)
      if (!aIsEarned && bIsEarned) return 1;  // b (earned) comes before a (unearned)
      return 0; // If both are earned or both unearned, maintain original order
    });
  }, [badges, userBadges]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-none shadow-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-orange-500 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32"></div>
            
            <CardContent className="p-8 lg:p-12 relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl">
                  <span className="text-6xl font-bold">
                    {user?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h1 className="text-4xl font-bold mb-2 truncate">{user?.full_name}</h1>
                  <p className="text-purple-100 mb-4 truncate">{user?.email}</p>
                  
                  <div className="flex flex-wrap gap-3">
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2">
                      <Trophy className="w-4 h-4 mr-2" />
                      {user?.total_points || 0} pontos
                    </Badge>
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2">
                      <Award className="w-4 h-4 mr-2" />
                      Nível {user?.level || 1}
                    </Badge>
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      {checkIns.length} check-ins
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Progresso para o Nível {(user?.level || 1) + 1}</span>
                  <span className="font-bold">{Math.round(getLevelProgress())}%</span>
                </div>
                <Progress value={getLevelProgress()} className="h-4 bg-white/20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto bg-purple-500 rounded-xl flex items-center justify-center mb-3">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-purple-900">{user?.total_points || 0}</p>
                <p className="text-sm text-purple-600 mt-1 h-10 flex items-center justify-center">Pontos Totais</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto bg-blue-500 rounded-xl flex items-center justify-center mb-3">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-blue-900">{userBadges.length}</p>
                <p className="text-sm text-blue-600 mt-1 h-10 flex items-center justify-center">Badges Conquistados</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto bg-orange-500 rounded-xl flex items-center justify-center mb-3">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-orange-900">{checkIns.length}</p>
                <p className="text-sm text-orange-600 mt-1 h-10 flex items-center justify-center">Check-ins Totais</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto bg-green-500 rounded-xl flex items-center justify-center mb-3">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-green-900">{getCheckInsThisMonth()}</p>
                <p className="text-sm text-green-600 mt-1 h-10 flex items-center justify-center">Check-ins no Mês</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Badges Collection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Coleção de Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              {badges.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum badge disponível ainda</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sortedBadges.map((badge) => {
                    const isEarned = userBadges.some(ub => ub.badge_id === badge.id);
                    const IconComponent = getIconComponent(badge.icon);
                    
                    return (
                      <motion.div
                        key={badge.id}
                        whileHover={{ scale: 1.05 }}
                        className={`p-6 rounded-2xl text-center transition-all duration-300 ${
                          isEarned 
                            ? `bg-gradient-to-br ${getBadgeColor(badge.color)} shadow-lg` 
                            : 'bg-gray-100 opacity-50'
                        }`}
                      >
                        <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center ${
                          isEarned ? 'bg-white/20' : 'bg-gray-200'
                        }`}>
                          <IconComponent className={`w-8 h-8 ${isEarned ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <h3 className={`font-bold mb-1 ${isEarned ? 'text-white' : 'text-gray-600'}`}>
                          {badge.name}
                        </h3>
                        <p className={`text-xs ${isEarned ? 'text-white/80' : 'text-gray-400'}`}>
                          {badge.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {/* This component is now being used, replacing the old list */}
          <RecentActivity checkIns={checkIns} />
        </motion.div>
      </div>
    </div>
  );
}
