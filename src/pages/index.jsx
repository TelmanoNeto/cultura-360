import Layout from "./Layout.jsx";

import Home from "./Home";

import Explore from "./Explore";

import Missions from "./Missions";

import Rankings from "./Rankings";

import Profile from "./Profile";

import Rewards from "./Rewards";

import Guia from "./Guia";

import QuemSomos from "./QuemSomos";

import RankingCategory from "./RankingCategory";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Explore: Explore,
    
    Missions: Missions,
    
    Rankings: Rankings,
    
    Profile: Profile,
    
    Rewards: Rewards,
    
    Guia: Guia,
    
    QuemSomos: QuemSomos,
    
    RankingCategory: RankingCategory,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Explore" element={<Explore />} />
                
                <Route path="/Missions" element={<Missions />} />
                
                <Route path="/Rankings" element={<Rankings />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Rewards" element={<Rewards />} />
                
                <Route path="/Guia" element={<Guia />} />
                
                <Route path="/QuemSomos" element={<QuemSomos />} />
                
                <Route path="/RankingCategory" element={<RankingCategory />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}