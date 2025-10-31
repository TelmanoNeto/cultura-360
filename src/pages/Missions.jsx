
import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Award, 
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  Calendar,
  Trophy,
  RefreshCw,
  Zap,
  MapPin,
  ExternalLink
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Missions() {
  const [user, setUser] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(null);
  const [availableMissions, setAvailableMissions] = useState([]);
  const [displayedMissions, setDisplayedMissions] = useState([]);
  const [userMission, setUserMission] = useState(null);
  const [missionSteps, setMissionSteps] = useState([]);
  const [stepPlaces, setStepPlaces] = useState({});
  const [userProgress, setUserProgress] = useState([]);
  const [userCheckIns, setUserCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingInStep, setCheckingInStep] = useState(null); // New state for check-in loading
  const [showComingSoon, setShowComingSoon] = useState(false); // New state for coming soon dialog

  const MISSIONS_PER_PAGE = 3;

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

  const getNextWeekStart = () => {
    if (!currentWeekStart) return null; // Ensure currentWeekStart is set before calculating next
    return addDays(currentWeekStart, 7);
  };

  const getTimeUntilNextWeek = () => {
    if (!currentWeekStart) return "0 minutos";
    const next = getNextWeekStart();
    const now = new Date();
    const totalMinutes = Math.floor((next.getTime() - now.getTime()) / 1000 / 60);
    
    if (totalMinutes < 0) return "0 minutos";
    
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor(totalMinutes / 60); // Total hours from now

    if (days > 0) {
      return `${days} dia${days !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hora${hours !== 1 ? 's' : ''}`;
    } else {
      return `${totalMinutes} minuto${totalMinutes !== 1 ? 's' : ''}`;
    }
  };

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
      
      // Buscar todas as missões ativas disponíveis
      const allMissions = await base44.entities.MissionTemplate.filter({ is_active: true });
      setAvailableMissions(allMissions);
      
      // Selecionar 3 missões aleatórias para exibir
      const shuffled = [...allMissions].sort(() => 0.5 - Math.random());
      setDisplayedMissions(shuffled.slice(0, MISSIONS_PER_PAGE));
      
      // Buscar check-ins do usuário
      const checkIns = await base44.entities.CheckIn.filter({ user_email: userData.email });
      setUserCheckIns(checkIns);
      
      // Verificar se usuário já tem missão ativa nesta semana
      const [existingMission] = await base44.entities.UserWeeklyMission.filter({
        user_email: userData.email,
        week_start: weekStart.toISOString()
      }, "", 1);
      
      if (existingMission) {
        setUserMission(existingMission);
        await loadMissionProgress(existingMission);
      }
      
    } catch (error) {
      console.error("Error loading missions:", error);
    }
    setLoading(false);
  };

  const loadMissionProgress = async (mission) => {
    try {
      const [steps, progress] = await Promise.all([
        base44.entities.MissionStep.filter({ mission_template_id: mission.mission_template_id }),
        base44.entities.UserMissionProgress.filter({ user_weekly_mission_id: mission.id })
      ]);
      
      setMissionSteps(steps);
      setUserProgress(progress);
      
      // Buscar os places de cada step
      const places = {};
      for (const step of steps) {
        if (step.place_id) {
          const [place] = await base44.entities.Place.filter({ id: step.place_id }, "", 1);
          if (place) {
            places[step.id] = place;
          }
        }
      }
      setStepPlaces(places);
      
      // Verificar se a missão foi completada
      if (steps.length > 0 && progress.length === steps.length && !mission.is_completed) {
        await completeMission(mission);
      }
    } catch (error) {
      console.error("Error loading mission progress:", error);
    }
  };

  const completeMission = async (mission) => {
    try {
      const template = availableMissions.find(m => m.id === mission.mission_template_id);
      if (!template) return;
      
      // Atualizar missão como completa
      await base44.entities.UserWeeklyMission.update(mission.id, {
        is_completed: true,
        completed_at: new Date().toISOString()
      });
      
      // Adicionar pontos ao usuário
      const newPoints = (user.total_points || 0) + template.total_points;
      const newLevel = Math.floor(newPoints / 100) + 1;
      
      await base44.auth.updateMe({
        total_points: newPoints,
        level: newLevel
      });
      
      // Atualizar perfil público
      const [publicProfile] = await base44.entities.PublicProfile.filter({ user_email: user.email }, "", 1);
      if (publicProfile) {
        await base44.entities.PublicProfile.update(publicProfile.id, {
          total_points: newPoints,
          level: newLevel
        });
      }
      
      alert(`🎉 Missão Concluída! Você ganhou ${template.total_points} pontos!`);
      loadData();
    } catch (error) {
      console.error("Error completing mission:", error);
    }
  };

  // The handleRefreshMissions is removed as it's replaced by the "coming soon" dialog.

  const handleSelectMission = async (template) => {
    try {
      const newUserMission = await base44.entities.UserWeeklyMission.create({
        user_email: user.email,
        mission_template_id: template.id,
        week_start: currentWeekStart.toISOString(),
        started_at: new Date().toISOString()
      });
      
      setUserMission(newUserMission);
      await loadMissionProgress(newUserMission);
    } catch (error) {
      console.error("Error selecting mission:", error);
      alert("Erro ao escolher missão.");
    }
  };

  const handleCheckIn = async (step, place) => {
    if (!user || !userMission) return;
    
    setCheckingInStep(step.id); // Set loading state for this specific step
    try {
      // Criar check-in
      const checkIn = await base44.entities.CheckIn.create({
        user_email: user.email,
        place_id: place.id,
        points_earned: place.points_value || 10
      });

      // Registrar progresso na missão
      await base44.entities.UserMissionProgress.create({
        user_email: user.email,
        user_weekly_mission_id: userMission.id,
        step_id: step.id,
        check_in_id: checkIn.id,
        completed_at: new Date().toISOString()
      });

      // Atualizar pontos do usuário
      const newPoints = (user.total_points || 0) + (place.points_value || 10);
      const newLevel = Math.floor(newPoints / 100) + 1;
      
      await base44.auth.updateMe({
        total_points: newPoints,
        level: newLevel
      });

      // Atualizar perfil público
      const [publicProfile] = await base44.entities.PublicProfile.filter({ user_email: user.email }, "", 1);
      if (publicProfile) {
        await base44.entities.PublicProfile.update(publicProfile.id, {
          total_points: newPoints,
          level: newLevel
        });
      }

      alert(`Check-in realizado! Você ganhou ${place.points_value || 10} pontos! 🎉`);
      
      // Recarregar dados
      loadData();
    } catch (error) {
      console.error("Error checking in:", error);
      alert("Erro ao realizar check-in. Tente novamente.");
    } finally {
      setCheckingInStep(null); // Reset loading state regardless of success or failure
    }
  };

  const getProgressPercentage = () => {
    if (missionSteps.length === 0) return 0;
    return (userProgress.length / missionSteps.length) * 100;
  };

  const isStepCompleted = (stepId) => {
    return userProgress.some(p => p.step_id === stepId);
  };

  const getMissionTemplate = (templateId) => {
    return availableMissions.find(m => m.id === templateId);
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

  const activeMissionTemplate = userMission ? getMissionTemplate(userMission.mission_template_id) : null;

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
            Missão Cultural
          </h1>
          <p className="text-gray-600">Viva novas experiências toda semana</p>
        </motion.div>

        {/* Timer até próxima semana */}
        <Card className="border-none shadow-lg bg-gradient-to-r from-purple-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Próxima missão em:</p>
                  <p className="text-xl font-bold text-gray-900">{getTimeUntilNextWeek()}</p>
                </div>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        {/* Box de Missão Concluída */}
        {userMission && userMission.is_completed && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-none shadow-xl bg-green-500 text-white">
              <CardContent className="p-6 text-center">
                <Trophy className="w-16 h-16 mx-auto mb-3 text-yellow-300" />
                <h3 className="text-2xl font-bold mb-2">Missão Concluída!</h3>
                <p className="text-green-100">Aguarde a próxima semana para uma nova missão</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Missão Ativa */}
        {userMission && activeMissionTemplate && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-none shadow-xl bg-gradient-to-br from-purple-600 via-purple-500 to-orange-500 text-white">
              {/* Removed image display for active mission */}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">
                      {activeMissionTemplate.title}
                    </CardTitle>
                    <p className="text-purple-100">
                      {activeMissionTemplate.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Progresso</span>
                    <span className="font-bold">{userProgress.length}/{missionSteps.length} etapas</span>
                  </div>
                  <Progress value={getProgressPercentage()} className="h-3 bg-white/20" />
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-lg">Locais para visitar:</h4>
                  {missionSteps.map((step) => {
                    const completed = isStepCompleted(step.id);
                    const place = stepPlaces[step.id];
                    if (!place) return null;
                    
                    return (
                      <div key={step.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          {completed ? (
                            <CheckCircle2 className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
                          ) : (
                            <Circle className="w-6 h-6 text-white/50 flex-shrink-0 mt-1" />
                          )}
                          <div className="flex-1">
                            <h5 className="font-bold text-lg mb-1">{place.name}</h5>
                            {place.description && (
                              <p className="text-sm text-purple-100 mb-2">{place.description}</p>
                            )}
                            <div className="flex items-start gap-2 text-sm text-purple-100 mb-3">
                              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2">{place.address}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={`${getCategoryColor(place.category)} border`}>
                                {place.category}
                              </Badge>
                              <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                <Award className="w-4 h-4" />
                                <span className="text-sm font-bold">+{place.points_value || 10}</span>
                              </div>
                            </div>
                            {!completed && (
                              <div className="flex gap-2 mt-3">
                                <Button
                                  onClick={() => handleCheckIn(step, place)}
                                  disabled={checkingInStep === step.id} // Disable button if this step is being checked in
                                  className="flex-1 bg-white text-purple-600 hover:bg-purple-50"
                                >
                                  {checkingInStep === step.id ? ( // Show loading text/spinner
                                    <>Realizando...</>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Fazer Check-in
                                    </>
                                  )}
                                </Button>
                                {(place.latitude && place.longitude) && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => window.open(`https://www.google.com/maps?q=${place.latitude},${place.longitude}`, '_blank')}
                                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Seleção de Missões */}
        {!userMission && (
          <>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Escolha sua Missão</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {displayedMissions.map((mission, index) => (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col overflow-hidden">
                      {mission.image_url && (
                        <div className="h-48 overflow-hidden bg-gray-100">
                          <img 
                            src={mission.image_url} 
                            alt={mission.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                            <Award className="w-4 h-4" />
                            <span className="font-bold">+{mission.total_points}</span>
                          </div>
                        </div>
                        <CardTitle className="text-xl">{mission.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <p className="text-gray-600 mb-4 flex-1">{mission.description}</p>
                        <Button
                          onClick={() => handleSelectMission(mission)}
                          className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Escolher Missão
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Botão Gerar Outra Opção */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => setShowComingSoon(true)} // Changed onClick to show the dialog
                size="lg"
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Gerar outra opção (3 restantes)
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Coming Soon Dialog */}
      <Dialog open={showComingSoon} onOpenChange={setShowComingSoon}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
              Em Breve! 🚀
            </DialogTitle>
            <DialogDescription className="text-base pt-4">
              Esta funcionalidade estará disponível em breve. Estamos trabalhando para trazer ainda mais opções de missões para você explorar!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button 
              onClick={() => setShowComingSoon(false)}
              className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
            >
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
