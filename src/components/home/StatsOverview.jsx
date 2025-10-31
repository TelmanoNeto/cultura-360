import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Flame, CheckCircle, Calendar } from "lucide-react";

export default function StatsOverview({ checkIns, completedMissionsCount, user }) {

  const getConsecutiveActiveWeeks = (activities) => {
    if (!activities || activities.length === 0) return 0;
  
    const getStartOfWeek = (date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day;
      return new Date(d.setDate(diff)).setHours(0, 0, 0, 0);
    };
  
    const activeWeeksTimestamps = new Set(
      activities.map(a => getStartOfWeek(new Date(a.created_date)))
    );
  
    if (activeWeeksTimestamps.size === 0) return 0;
  
    let consecutiveWeeks = 0;
    const weekInMillis = 7 * 24 * 60 * 60 * 1000;
    
    let currentWeekStart = getStartOfWeek(new Date());

    const latestActivityDate = Math.max(...Array.from(activeWeeksTimestamps));
    if(currentWeekStart > latestActivityDate) {
        currentWeekStart = latestActivityDate;
    }
  
    while (activeWeeksTimestamps.has(currentWeekStart)) {
      consecutiveWeeks++;
      currentWeekStart -= weekInMillis;
    }
  
    return consecutiveWeeks;
  };
  
  const getCheckInsThisMonth = (checkIns) => {
    const now = new Date();
    return checkIns.filter(c => {
      const checkInDate = new Date(c.created_date);
      return checkInDate.getMonth() === now.getMonth() && 
             checkInDate.getFullYear() === now.getFullYear();
    }).length;
  };

  const stats = [
    {
      label: "Missões Concluídas",
      value: completedMissionsCount,
      icon: CheckCircle,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
      className: ""
    },
    {
      label: "Semanas Ativas",
      value: getConsecutiveActiveWeeks(checkIns),
      icon: Flame,
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-50 to-orange-100",
      className: ""
    },
    {
      label: "Check-ins no Mês",
      value: getCheckInsThisMonth(checkIns),
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      className: ""
    },
    {
      label: "Check-ins Totais",
      value: checkIns.length,
      icon: Sparkles,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
      className: "lg:hidden"
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 * index }}
          className={stat.className}
        >
          <Card className={`border-none shadow-lg bg-gradient-to-br ${stat.bgColor}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600 font-medium h-10 flex items-center">{stat.label}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}