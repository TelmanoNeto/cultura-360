
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Award } from "lucide-react";
import { Place } from "@/api/entities";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RecentActivity({ checkIns }) {
  const [places, setPlaces] = useState({});

  const loadPlaces = useCallback(async () => {
    if(!checkIns || checkIns.length === 0) return;
    const placeIds = [...new Set(checkIns.slice(0, 5).map(c => c.place_id))];
    const placesData = {};
    
    for (const id of placeIds) {
      try {
        const placeList = await Place.filter({ id }, "", 1);
        if (placeList.length > 0) {
          placesData[id] = placeList[0];
        }
      } catch (error) {
        console.error("Error loading place:", error);
      }
    }
    
    setPlaces(placesData);
  }, [checkIns]);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  const getCategoryColor = (category) => {
    const colors = {
      museu: "bg-purple-100 text-purple-700",
      parque: "bg-green-100 text-green-700",
      teatro: "bg-pink-100 text-pink-700",
      feira: "bg-orange-100 text-orange-700",
      restaurante: "bg-red-100 text-red-700",
      exposição: "bg-blue-100 text-blue-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  if (checkIns.length === 0) {
    return (
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Check-ins Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma atividade ainda</p>
            <p className="text-sm text-gray-400 mt-1">Comece explorando locais culturais!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Check-ins Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checkIns.slice(0, 5).map((checkIn, index) => {
              const place = places[checkIn.place_id];
              
              return (
                <motion.div
                  key={checkIn.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 bg-gradient-to-r from-purple-50 to-orange-50 rounded-xl hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {place?.name || "Local desconhecido"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {format(new Date(checkIn.created_date), "d MMM, HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
                      {place?.category && (
                        <Badge className={getCategoryColor(place.category)}>
                          {place.category}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        <Award className="w-4 h-4" />
                        <span className="font-semibold text-sm">+{checkIn.points_earned}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
