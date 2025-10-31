import React, { useState } from 'react';
import { motion } from 'framer-motion';
import OptionCard from '../components/guia/OptionCard';
import { MapPinned, PartyPopper } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function GuiaPage() {
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleComingSoon = () => {
    setShowComingSoon(true);
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
            guIA
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Deixe nossa inteligência artificial sugerir as melhores experiências para você. Explore o que a cidade e região tem de melhor.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
          <OptionCard
            icon={MapPinned}
            title="Planejador de Roteiros"
            description="Perfeito para turistas! Crie um roteiro de viagem personalizado com base nos seus interesses, tempo e orçamento."
            onClick={handleComingSoon}
          />
          <OptionCard
            icon={PartyPopper}
            title="Sugestão de Rolês"
            description="Ideal para moradores! Receba sugestões pontuais e criativas para a sua tarde, noite ou final de semana. Descubra o que está acontecendo na cidade e região agora."
            onClick={handleComingSoon}
          />
        </div>
      </div>

      <Dialog open={showComingSoon} onOpenChange={setShowComingSoon}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
              Em Breve! 🚀
            </DialogTitle>
            <DialogDescription className="text-base pt-4">
              Esta funcionalidade estará disponível em breve. Estamos trabalhando para trazer a melhor experiência para você explorar a cultura da sua cidade e região!
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