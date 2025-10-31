
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { User } from "@/api/entities";
import { Reward } from "@/api/entities";
import { UserReward } from "@/api/entities";
import { Badge as BadgeEntity } from "@/api/entities";
import { UserBadge } from "@/api/entities";
import { PublicProfile } from "@/api/entities";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

import { Gift, Ticket, ShoppingBag, Star, Sparkles, Check, Lock, X, Filter, Map, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RewardCard = ({ reward, onClaimClick, checkEligibility, isClaimed }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { eligible, reasons } = checkEligibility(reward);
  const claimed = isClaimed(reward.id);
  const outOfStock = reward.stock !== null && reward.stock <= 0;

  const categoryIcons = {
    desconto: <Ticket className="w-5 h-5" />,
    produto: <ShoppingBag className="w-5 h-5" />,
    experiência: <Star className="w-5 h-5" />,
    ingresso: <Ticket className="w-5 h-5" />,
  };
  
  const needsTruncation = reward.description && reward.description.length > 100;

  return (
    <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col h-full">
      {reward.image_url && (
        <div className="h-48 overflow-hidden bg-gray-100">
          <img 
            src={reward.image_url} 
            alt={reward.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      )}
      <CardContent className="p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-3">
          <Badge className="bg-purple-100 text-purple-700 border-purple-200 capitalize flex items-center gap-2">
            {categoryIcons[reward.category]}
            {reward.category}
          </Badge>
          <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-bold">{reward.cost_in_points} pts</span>
          </div>
        </div>
        
        <h3 className="font-bold text-xl mb-1 text-gray-900">{reward.title}</h3>
        <p className="text-sm text-gray-500 mb-3">Oferecido por: {reward.partner_name}</p>
        
        <div className="text-sm text-gray-600 mb-4 flex-grow">
          <p className={!isExpanded && needsTruncation ? 'line-clamp-2' : ''}>
            {reward.description}
          </p>
          {needsTruncation && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="text-purple-600 hover:text-purple-800 font-semibold text-sm mt-1"
            >
              {isExpanded ? 'Ver menos' : 'Ver mais'}
            </button>
          )}
        </div>
        
        <div className="mt-auto">
          <Button
            onClick={() => onClaimClick(reward)}
            disabled={!eligible || claimed || outOfStock}
            className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white disabled:opacity-50 disabled:bg-gray-400"
          >
            {claimed ? (
              <><Check className="w-4 h-4 mr-2" /> Resgatado</>
            ) : !eligible ? (
              <><Lock className="w-4 h-4 mr-2" /> Bloqueado</>
            ) : outOfStock ? (
               <><X className="w-4 h-4 mr-2" /> Esgotado</>
            ): (
              <><Gift className="w-4 h-4 mr-2" /> Resgatar</>
            )}
          </Button>
          {!claimed && !eligible && reasons[0] && (
              <p className="text-xs text-red-500 mt-2 text-center">{reasons[0]}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};


export default function Rewards() {
  const [rewards, setRewards] = useState([]);
  const [filteredRewards, setFilteredRewards] = useState([]);
  const [user, setUser] = useState(null);
  const [userBadges, setUserBadges] = useState([]);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");

  const [selectedReward, setSelectedReward] = useState(null);
  const [dialogState, setDialogState] = useState(null); // 'confirm', 'success'
  const [redemptionCode, setRedemptionCode] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [userData, rewardsData, allUserBadges, allClaimedRewards] = await Promise.all([
        User.me(),
        Reward.filter({ is_active: true }),
        UserBadge.list(),
        UserReward.list()
      ]);
      
      setUser(userData);
      setRewards(rewardsData);
      setFilteredRewards(rewardsData); // Initialize filtered rewards

      const currentUserBadges = allUserBadges.filter(b => b.user_email === userData.email);
      setUserBadges(currentUserBadges);

      const currentUserClaimedRewards = allClaimedRewards.filter(r => r.user_email === userData.email);
      setClaimedRewards(currentUserClaimedRewards);

      const publicProfiles = await PublicProfile.list("-total_points");
      const rank = publicProfiles.findIndex(p => p.user_email === userData.email) + 1;
      setUserRank(rank > 0 ? rank : null);

    } catch (error) {
      console.error("Error loading rewards data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filterRewards = useCallback(() => {
    let currentFiltered = rewards;

    if (selectedCategory !== "all") {
      currentFiltered = currentFiltered.filter(reward => reward.category === selectedCategory);
    }
    if (selectedState !== "all") {
      currentFiltered = currentFiltered.filter(reward => reward.state === selectedState);
    }
    if (selectedCity !== "all") {
      currentFiltered = currentFiltered.filter(reward => reward.city === selectedCity);
    }

    setFilteredRewards(currentFiltered);
  }, [rewards, selectedCategory, selectedState, selectedCity]);

  useEffect(() => {
    filterRewards();
  }, [filterRewards]);

  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedCity("all"); // Reset city when state changes
  };

  const uniqueStates = useMemo(() => 
    [...new Set(rewards.map(r => r.state).filter(Boolean))].sort(), 
  [rewards]);

  const uniqueCities = useMemo(() => {
    if (selectedState === 'all') return [];
    return [...new Set(rewards.filter(r => r.state === selectedState).map(r => r.city).filter(Boolean))].sort();
  }, [rewards, selectedState]);

  const checkEligibility = useCallback((reward) => {
    if (!user) return { eligible: false, reasons: ["Usuário não carregado"] };

    const reasons = [];
    let eligible = true;

    if (user.total_points < reward.cost_in_points) {
      eligible = false;
      reasons.push(`Pontos insuficientes. Você tem ${user.total_points}, precisa de ${reward.cost_in_points}.`);
    }
    if (reward.required_badge_id && !userBadges.some(b => b.badge_id === reward.required_badge_id)) {
      eligible = false;
      reasons.push("Badge necessário não conquistado.");
    }
    if (reward.required_rank && (!userRank || userRank > reward.required_rank)) {
      eligible = false;
      reasons.push(`Rank insuficiente. Você está no rank ${userRank}, precisa estar no top ${reward.required_rank}.`);
    }

    return { eligible, reasons };
  }, [user, userBadges, userRank]);

  const isClaimed = useCallback((rewardId) => {
    return claimedRewards.some(cr => cr.reward_id === rewardId);
  }, [claimedRewards]);

  const handleClaimClick = (reward) => {
    setSelectedReward(reward);
    setDialogState("confirm");
  };

  const confirmClaim = async () => {
    if (!selectedReward) return;

    const { eligible } = checkEligibility(selectedReward);
    if (!eligible) {
      alert("Você não cumpre os requisitos para resgatar esta recompensa.");
      return;
    }

    try {
      // Os pontos não são mais deduzidos, apenas servem como requisito.
      // A criação do registro 'UserReward' impede o resgate duplicado.

      // Generate redemption code and create UserReward record
      const code = `C360-${user.full_name.slice(0, 3).toUpperCase()}${Date.now().toString().slice(-4)}`;
      setRedemptionCode(code);

      await UserReward.create({
        user_email: user.email,
        reward_id: selectedReward.id,
        claimed_date: new Date().toISOString(),
        redemption_code: code
      });
      
      // Update stock if applicable
      if(selectedReward.stock !== null){
        await Reward.update(selectedReward.id, {stock: selectedReward.stock - 1});
      }

      setDialogState("success");
      loadData(); // Refresh data
    } catch (error) {
      console.error("Error claiming reward:", error);
      alert("Ocorreu um erro ao resgatar a recompensa.");
      setDialogState(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
            Central de Recompensas
          </h1>
          <p className="text-gray-600">Use seus pontos e conquistas para resgatar prêmios!</p>
        </motion.div>

        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-orange-50">
          <CardContent className="p-6 flex justify-center items-center">
            <p className="text-lg text-gray-800">
              Você tem <strong className="text-purple-600 text-xl">{user?.total_points || 0}</strong> pontos.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full flex-1">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="desconto">Desconto</SelectItem>
                  <SelectItem value="produto">Produto</SelectItem>
                  <SelectItem value="experiência">Experiência</SelectItem>
                  <SelectItem value="ingresso">Ingresso</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedState} onValueChange={handleStateChange}>
                <SelectTrigger className="w-full flex-1">
                  <Map className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Estados</SelectItem>
                  {uniqueStates.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCity} onValueChange={setSelectedCity} disabled={selectedState === 'all' || uniqueCities.length === 0}>
                <SelectTrigger className="w-full flex-1">
                  <MapPin className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Cidades</SelectItem>
                  {uniqueCities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredRewards.map((reward, index) => {
              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <RewardCard
                    reward={reward}
                    onClaimClick={handleClaimClick}
                    checkEligibility={checkEligibility}
                    isClaimed={isClaimed}
                  />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      <Dialog open={!!dialogState} onOpenChange={() => setDialogState(null)}>
        <DialogContent>
          {dialogState === 'confirm' && selectedReward && (
            <>
              <DialogHeader>
                <DialogTitle>Confirmar Resgate</DialogTitle>
                <DialogDescription>
                  Você está prestes a resgatar <span className="font-bold">{selectedReward.title}</span>. Para isso, é necessário ter <span className="font-bold">{selectedReward.cost_in_points}</span> pontos. Esta ação não gastará seus pontos, mas um registro será feito e a recompensa não poderá ser resgatada novamente.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setDialogState(null)}>Cancelar</Button>
                <Button onClick={confirmClaim}>Confirmar e Resgatar</Button>
              </DialogFooter>
            </>
          )}
          {dialogState === 'success' && (
             <>
              <DialogHeader>
                <DialogTitle className="text-green-600 flex items-center gap-2"><Check /> Recompensa Resgatada!</DialogTitle>
                <DialogDescription>
                  Parabéns! Apresente o código abaixo no estabelecimento parceiro para receber sua recompensa.
                </DialogDescription>
              </DialogHeader>
              <div className="my-4 p-4 bg-purple-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">Seu código de resgate:</p>
                <p className="text-2xl font-bold text-purple-700 tracking-widest">{redemptionCode}</p>
              </div>
              <DialogFooter>
                <Button onClick={() => setDialogState(null)}>Fechar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
