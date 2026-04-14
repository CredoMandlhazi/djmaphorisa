import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { CartProvider } from "@/contexts/CartContext";
import { GlobalAudioProvider } from "@/contexts/GlobalAudioContext";
import { AuthProvider } from "@/hooks/useAuth";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { GlobalPlayer } from "./components/GlobalPlayer";
import { LoadingScreen } from "./components/LoadingScreen";
import Home from "./pages/Home";
import Beats from "./pages/Beats";
import Reviews from "./pages/Reviews";
import Music from "./pages/Music";
import Videos from "./pages/Videos";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import IndianHill from "./pages/IndianHill";
import CuratorDashboard from "./pages/CuratorDashboard";
import ArtistDashboard from "./pages/ArtistDashboard";
import ListenerDashboard from "./pages/ListenerDashboard";
import AdminPanel from "./pages/AdminPanel";
import Shop from "./pages/Shop";
import XLR8Success from "./pages/XLR8Success";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <GlobalAudioProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1">
                    <AnimatePresence mode="wait">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/beats" element={<Beats />} />
                        <Route path="/reviews" element={<Reviews />} />
                        <Route path="/music" element={<Music />} />
                        <Route path="/videos" element={<Videos />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/checkout-success" element={<CheckoutSuccess />} />
                        <Route path="/indian-hill" element={<IndianHill />} />
                        <Route path="/curator" element={<CuratorDashboard />} />
                        <Route path="/artist" element={<ArtistDashboard />} />
                        <Route path="/listener" element={<ListenerDashboard />} />
                        <Route path="/admin" element={<AdminPanel />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/xlr8-success" element={<XLR8Success />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </AnimatePresence>
                  </main>
                  <Footer />
                  <ScrollToTop />
                  <GlobalPlayer />
                </div>
              </BrowserRouter>
            </GlobalAudioProvider>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;