import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function OptionCard({ icon: Icon, title, description, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.4 }}
      className="h-full"
    >
      <div onClick={onClick} className="block h-full cursor-pointer">
        <Card className="text-left border-none shadow-xl hover:shadow-2xl transition-all duration-300 bg-white h-full flex flex-col">
          <CardContent className="p-8 flex flex-col flex-grow">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-orange-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <Icon className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 flex-grow">{description}</p>
            <div className="mt-8">
              <Button variant="ghost" className="text-purple-600 font-bold hover:bg-purple-50 p-0">
                Começar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}