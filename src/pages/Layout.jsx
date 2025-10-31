

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home,
  Map,
  Trophy,
  Users,
  Sparkles,
  LogOut,
  Gift,
  Wand2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  useSidebar, // Importar o useSidebar
} from "@/components/ui/sidebar";
import { User as UserEntity } from "@/api/entities";

const navigationItems = [
  {
    title: "Início",
    url: createPageUrl("Home"),
    icon: Home,
  },
  {
    title: "Explorar",
    url: createPageUrl("Explore"),
    icon: Map,
  },
  {
    title: "Missão", // Changed from "Missões" to "Missão"
    url: createPageUrl("Missions"),
    icon: Sparkles,
  },
  {
    title: "Recompensas",
    url: createPageUrl("Rewards"),
    icon: Gift,
  },
  {
    title: "Rankings",
    url: createPageUrl("Rankings"),
    icon: Trophy,
  },
];

const MainLayout = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const { setOpen } = useSidebar(); // Usar o hook useSidebar

  React.useEffect(() => {
    const handleResize = () => {
      // Definir o sidebar como aberto em telas maiores que 1024px (lg breakpoint)
      if (window.innerWidth >= 1024) {
        setOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Chamar na montagem inicial para definir o estado correto
    return () => window.removeEventListener('resize', handleResize);
  }, [setOpen]); // Dependência setOpen para garantir que o efeito seja reexecutado se setOpen mudar (geralmente não muda)

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    try {
      const userData = await UserEntity.me();
      setUser(userData);
    } catch (error) {
      console.error("User not logged in");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await UserEntity.logout();
    window.location.reload();
  };

  return (
    <>
      <style>{`
        :root {
          --primary: 262 83% 58%;
          --primary-foreground: 210 20% 98%;
          --secondary: 25 95% 53%;
          --accent: 142 76% 36%;
        }
      `}</style>

      <div className="min-h-screen flex w-full bg-gradient-to-br from-purple-50 via-orange-50 to-pink-50">
        <Sidebar className="border-r border-purple-100 bg-white/80 backdrop-blur-lg">
          <SidebarHeader className="border-b border-purple-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                  Cultura360
                </h2>
                <p className="text-xs text-gray-500">Explore sua cidade e região</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3 flex flex-col justify-between h-full">
            <div>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationItems.map((item) => {
                      const isActive = location.pathname === item.url;
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            className={`
                              transition-all duration-200 rounded-xl mb-1
                              ${isActive
                                ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-lg hover:brightness-110'
                                : 'hover:bg-purple-100 text-gray-700'
                              }
                            `}
                          >
                            <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                              <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-purple-600'}`} />
                              <span className="font-medium">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </div>

            <div className="space-y-3 p-3">
               <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-2">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        className="transition-all duration-300 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-lg"
                      >
                        <Link to={createPageUrl("Guia")} className="flex items-center justify-center gap-2 px-4 py-3">
                          <Wand2 className="w-5 h-5 text-white" />
                          <span className="font-medium">guIA</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="transition-all duration-200 rounded-xl bg-gray-200 text-gray-900"
                          >
                            <Link to={createPageUrl("QuemSomos")} className="flex items-center justify-center gap-3 px-4 py-3">
                              <Users className="w-5 h-5 text-gray-800" />
                              <span className="font-medium">Quem Somos?</span>
                            </Link>
                          </SidebarMenuButton>
                      </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </div>

          </SidebarContent>

          <SidebarFooter className="border-t border-purple-100 p-4">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-xl">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-9 bg-gray-100 rounded-lg"></div>
              </div>
            ) : user && (
              <div className="space-y-3">
                <Link to={createPageUrl("Profile")} className="block rounded-xl transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-orange-50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {user.full_name || 'Usuário'}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {user.total_points || 0} pontos
                      </p>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-lg border-b border-purple-100 px-6 py-4 lg:hidden shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-purple-50 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                Cultura360
              </h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </>
  );
};

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <MainLayout>{children}</MainLayout>
    </SidebarProvider>
  );
}

