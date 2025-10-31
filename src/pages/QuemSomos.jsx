
import React from 'react';
import { motion } from 'framer-motion';
import MemberCard from '../components/quemsomos/MemberCard';

const teamMembers = [
  {
    name: 'João Pedro Azevedo do Nascimento',
    role: 'Idealizador e Desenvolvedor',
    bio: 'Graduando de Ciência da Computação na UFCG, com experiência profissional como Desenvolvedor Full-Stack na Code Tech e atuação em projeto de Pesquisa, Desenvolvimento e Inovação (PD&I) como QA Automation no Virtus.',
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68de78d9c51f7945d97190c0/7e53023a8_IMG_37485.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/joão-pedro-azevedo-43739a2a3/',
  },
  {
    name: 'Telmano Leite Japiassú Neto',
    role: 'Idealizador e Desenvolvedor',
    bio: 'Graduando de Ciência da Computação na UFCG, com atuação em projeto de Pesquisa, Desenvolvimento e Inovação (PD&I), na área de Inteligência Artificial, no Virtus.',
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68de78d9c51f7945d97190c0/2710906d6_4756fc38-d491-4de9-8fcc-f55e08ee1841.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/telmano-leite-japiassú-neto-867205284/',
  },
  {
    name: 'Vinicius de Oliveira Porto',
    role: 'Idealizador e Desenvolvedor',
    bio: 'Graduando de Ciência da Computação na UFCG, com atuação em projeto de Pesquisa, Desenvolvimento e Inovação (PD&I), na área de Inteligência Artificial, especificamente em Large Language Models (LLMs), no Agents4Good.',
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68de78d9c51f7945d97190c0/33ff27339_f9a70dc6-6bde-41d5-836c-7f2b6683370e2.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/vinicius-porto-/',
  },
];

export default function QuemSomos() {
  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
            Nossa Equipe
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <MemberCard key={member.name} member={member} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
