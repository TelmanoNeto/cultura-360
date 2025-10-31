import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Wand2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const messages = [
  "Novas memórias podem estar a poucos passos. Peça ajuda à guIA e descubra o que te espera!",
  "Sem planos para hoje? Deixe a guIA te mostrar o que está rolando de bom pela cidade!",
  "Quer sair da rotina? Deixe a guIA montar um rolê que é a sua cara!",
  "Cansado de ver TV em casa? A guIA te ajuda a encontrar a opção ideal para uma saidinha",
  "Não sabe por onde começar seu passeio? A guIA monta o roteiro ideal com base no que você curte!",
  "Transforme seu passeio em uma experiência completa. Planeje com a guIA e descubra o que ninguém te contou!",
];

export default function AIPromptBox() {
  const [displayedText, setDisplayedText] = useState("");
  const [currentMessage] = useState(() => messages[Math.floor(Math.random() * messages.length)]);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    setDisplayedText("");
    setIsTypingComplete(false);

    const typingInterval = setInterval(() => {
      if (currentIndex < currentMessage.length) {
        setDisplayedText(currentMessage.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTypingComplete(true);
        clearInterval(typingInterval);
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, [currentMessage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <Link to={createPageUrl("Guia")} className="block group">
        <div className="rounded-xl p-[3px] bg-gradient-to-r from-purple-600 to-orange-500">
          <Card className="rounded-xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 lg:p-8">
              <h3 className="font-bold text-lg lg:text-xl mb-3 bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent flex items-center gap-2">
                <Wand2 className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                A guIA te ajuda!
              </h3>
              <p className="text-gray-700 text-base lg:text-lg leading-relaxed">
                {displayedText}
                {!isTypingComplete && (
                  <span className="inline-block w-0.5 h-5 bg-purple-600 ml-1 animate-pulse"></span>
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      </Link>
    </motion.div>
  );
}