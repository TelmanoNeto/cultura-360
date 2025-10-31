import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Globe, 
  Landmark, 
  TreePine, 
  Theater, 
  Tent, 
  UtensilsCrossed, 
  Palette, 
  Calendar, 
  Building2,
  Dumbbell,
  Squirrel
} from 'lucide-react';

const categories = [
  { name: 'Geral', icon: Globe, color: 'from-purple-500 to-orange-500', category: 'geral' },
  { name: 'Museus', icon: Landmark, color: 'from-indigo-500 to-blue-500', category: 'museu' },
  { name: 'Parques', icon: TreePine, color: 'from-green-500 to-teal-500', category: 'parque' },
  { name: 'Teatros', icon: Theater, color: 'from-pink-500 to-rose-500', category: 'teatro' },
  { name: 'Feiras', icon: Tent, color: 'from-amber-500 to-yellow-500', category: 'feira' },
  { name: 'Restaurantes', icon: UtensilsCrossed, color: 'from-red-500 to-orange-500', category: 'restaurante' },
  { name: 'Exposições', icon: Palette, color: 'from-sky-500 to-cyan-500', category: 'exposição' },
  { name: 'Eventos', icon: Calendar, color: 'from-fuchsia-500 to-purple-500', category: 'evento' },
  { name: 'Monumentos', icon: Building2, color: 'from-slate-500 to-gray-500', category: 'monumento' },
  { name: 'Esporte', icon: Dumbbell, color: 'from-emerald-500 to-green-600', category: 'esporte' },
  { name: 'Mundo Animal', icon: Squirrel, color: 'from-amber-600 to-yellow-700', category: 'mundo animal' },
];

const CategoryCard = ({ item, index }) => {
  const { name, icon: Icon, color, category } = item;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="h-full"
    >
      <Link to={createPageUrl(`RankingCategory?category=${category}`)} className="h-full block group">
        <Card className={`border-none shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br ${color} text-white h-full flex flex-col justify-between`}>
          <CardContent className="p-6">
            <Icon className="w-12 h-12 mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            <h2 className="text-xl font-bold">{name}</h2>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default function RankingsHub() {
  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
            Central de Rankings
          </h1>
          <p className="text-gray-600">Explore as classificações por categoria e local</p>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((item, index) => (
            <CategoryCard key={item.name} item={item} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}