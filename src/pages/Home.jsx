
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trophy,
  Award,
  MapPin,
  TrendingUp,
  Gift,
  Clock, // Clock icon is no longer needed in Mission Timer Box but kept in imports in case it's used elsewhere
  Target
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { addDays, differenceInHours } from "date-fns";

import StatsOverview from "../components/home/StatsOverview";
import RecentActivity from "../components/home/RecentActivity";
import AIPromptBox from "../components/home/AIPromptBox";

export default function Home() {
  const [user, setUser] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [completedMissions, setCompletedMissions] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(null);
  const [userMission, setUserMission] = useState(null);
  const [loading, setLoading] = useState(true);

  const getWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();

    let mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    if (dayOfWeek === 1 && hour < 14) {
      mondayOffset -= 7;
    }

    const monday = addDays(now, mondayOffset);
    monday.setHours(14, 0, 0, 0);
    return monday;
  };

  // getNextWeekStart and getTimeUntilNextWeek functions are removed as they are no longer used.

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const weekStart = getWeekStart();
      setCurrentWeekStart(weekStart);

      const userCheckIns = await base44.entities.CheckIn.filter({ user_email: userData.email }, "-created_date");
      setCheckIns(userCheckIns);

      const userCompletedMissions = await base44.entities.UserWeeklyMission.filter({
        user_email: userData.email,
        is_completed: true
      });
      setCompletedMissions(userCompletedMissions);

      const [existingMission] = await base44.entities.UserWeeklyMission.filter({
        user_email: userData.email,
        week_start: weekStart.toISOString()
      }, "", 1);

      if (existingMission) {
        setUserMission(existingMission);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const getLevelProgress = () => {
    const currentLevel = user?.level || 1;
    const pointsForNextLevel = 100;
    const currentPointsInLevel = (user?.total_points || 0) % pointsForNextLevel;
    return (currentPointsInLevel / pointsForNextLevel) * 100;
  };

  const getMissionMessage = () => {
    if (!userMission) {
      return "Comece sua missão cultural da semana";
    }
    if (userMission.is_completed) {
      return "Aguarde a próxima semana para começar uma nova missão";
    }
    return "Conclua sua missão enquanto há tempo";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const missionCompleted = userMission?.is_completed;

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-none shadow-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-orange-500 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

            <CardContent className="p-6 lg:p-12 relative z-10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-3">
                    Olá, {user?.full_name?.split(' ')[0] || 'Explorador'}! 👋
                  </h1>
                  <p className="text-purple-100 text-lg mb-6">
                    Continue explorando a cultura da sua cidade e região
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 flex-1 text-center lg:flex-initial">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Trophy className="w-5 h-5" />
                        <span className="text-sm font-medium">Pontos</span>
                      </div>
                      <p className="text-3xl font-bold">{user?.total_points || 0}</p>
                    </div>

                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 flex-1 text-center lg:flex-initial">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Award className="w-5 h-5" />
                        <span className="text-sm font-medium">Nível</span>
                      </div>
                      <p className="text-3xl font-bold">{user?.level || 1}</p>
                    </div>

                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 flex-1 text-center lg:flex-initial hidden lg:block">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <MapPin className="w-5 h-5" />
                        <span className="text-sm font-medium">Check-ins</span>
                      </div>
                      <p className="text-3xl font-bold">{checkIns.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 w-full lg:min-w-[200px] lg:w-auto">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Próximo Nível</span>
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <Progress value={getLevelProgress()} className="h-3 mb-2 bg-white/20" />
                  <p className="text-sm text-purple-100">
                    {Math.round(getLevelProgress())}% completo
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <StatsOverview checkIns={checkIns} completedMissionsCount={completedMissions.length} user={user} />

        {/* AI Prompt Box */}
        <AIPromptBox />

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          <Link to={createPageUrl("Explore")} className="group">
            <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-blue-900">Explorar Locais</h3>
                    <p className="text-sm text-blue-700">Descubra novos lugares</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Rewards")} className="group">
            <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-purple-900">Resgatar Recompensas</h3>
                    <p className="text-sm text-purple-700">Ganhe prêmios reais</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Rankings")} className="group">
            <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-orange-900">Ver Rankings</h3>
                    <p className="text-sm text-orange-700">Compare seu progresso</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Mission Timer Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Link to={createPageUrl("Missions")} className="block group">
            <Card className="border-2 border-green-700 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-green-50 to-teal-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-bold text-lg mb-1 text-green-900 flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-700" />
                        {missionCompleted ? "Missão Concluída!" : "Missão Cultural"}
                      </h3>
                      <p className="text-sm text-green-700">
                        {getMissionMessage()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Recent Activity */}
        <RecentActivity checkIns={checkIns} />
      </div>
    </div>
  );
}
