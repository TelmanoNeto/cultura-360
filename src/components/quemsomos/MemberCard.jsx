import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Linkedin } from 'lucide-react';

export default function MemberCard({ member, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
      className="h-full"
    >
      <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 bg-white h-full flex flex-col text-center overflow-hidden">
        <div className="relative pt-[100%]">
            <img
            src={member.imageUrl}
            alt={member.name}
            className="absolute top-0 left-0 w-full h-full object-cover object-center"
            />
        </div>
        <CardContent className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
          <p className="text-sm font-medium text-purple-600 mb-4">{member.role}</p>
          <p className="text-gray-600 text-sm flex-grow">{member.bio}</p>
          <div className="mt-6">
            <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" className="rounded-full hover:bg-blue-50">
                <Linkedin className="w-5 h-5 text-blue-600" />
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}