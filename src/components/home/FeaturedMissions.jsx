import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, ChevronRight, Clock, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function FeaturedMissions({ missions }) {
  const getDifficultyColor = (difficulty) => {
    const colors = {
      fácil: "bg-green-100 text-green-700",
      média: "bg-yellow-100 text-yellow-700",
      difícil: "bg-red-100 text-red-700"
    };
    return colors[difficulty] || "bg-gray-100 text-gray-700";
  };

  if (missions.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
    >
      <Card className="border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Missões em Destaque
          </CardTitle>
          <Link to={createPageUrl("Missions")}>
            <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
              Ver todas
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {missions.slice(0, 3).map((mission, index) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-purple-50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={getDifficultyColor(mission.difficulty)}>
                        {mission.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1 text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                        <Award className="w-4 h-4" />
                        <span className="text-sm font-bold">+{mission.points_reward}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-lg mb-2 text-gray-900">
                      {mission.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {mission.description}
                    </p>
                    
                    {mission.expires_at && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Clock className="w-4 h-4" />
                        <span>
                          Até {format(new Date(mission.expires_at), "d 'de' MMMM", { locale: ptBR })}
                        </span>
                      </div>
                    )}
                    
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white">
                      Iniciar Missão
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}