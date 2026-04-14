import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { PageTransition } from "@/components/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrackQueue } from "@/components/curator/TrackQueue";
import { PoolManager } from "@/components/curator/PoolManager";
import { FeedbackHistory } from "@/components/curator/FeedbackHistory";
import { ListMusic, Layers, MessageSquare, Shield } from "lucide-react";

const CuratorDashboard = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  const isCurator = role === "curator" || role === "super_curator" || role === "admin";

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
        </div>
      </PageTransition>
    );
  }

  if (!isCurator) {
    return (
      <PageTransition>
        <div className="min-h-screen pt-32 pb-20">
          <div className="studio-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <Shield className="w-16 h-16 mx-auto text-muted-foreground" />
              <h1 className="text-3xl font-bold">Access Restricted</h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                This dashboard is only accessible to Curators, Super Curators, and Admins.
                Your current role: <span className="text-foreground font-medium">{role || "Artist"}</span>
              </p>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-20">
        <div className="studio-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Curator Dashboard</h1>
                <p className="text-muted-foreground text-sm">
                  {role === "admin" ? "Admin" : role === "super_curator" ? "Super Curator" : "Curator"} Panel
                </p>
              </div>
            </div>
          </motion.div>

          {/* Main Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs defaultValue="queue" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
                <TabsTrigger value="queue" className="gap-2">
                  <ListMusic className="w-4 h-4" />
                  <span className="hidden sm:inline">Track Queue</span>
                  <span className="sm:hidden">Queue</span>
                </TabsTrigger>
                <TabsTrigger value="pools" className="gap-2">
                  <Layers className="w-4 h-4" />
                  <span className="hidden sm:inline">Test Pools</span>
                  <span className="sm:hidden">Pools</span>
                </TabsTrigger>
                <TabsTrigger value="feedback" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Feedback</span>
                  <span className="sm:hidden">Feedback</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="queue">
                <TrackQueue />
              </TabsContent>

              <TabsContent value="pools">
                <PoolManager />
              </TabsContent>

              <TabsContent value="feedback">
                <FeedbackHistory />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default CuratorDashboard;