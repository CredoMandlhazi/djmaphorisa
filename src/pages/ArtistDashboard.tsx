import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Music, 
  Clock, 
  CheckCircle, 
  MessageSquare, 
  TrendingUp,
  Upload,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import { TrackPlayButton } from "@/components/TrackPlayButton";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending Review", color: "bg-yellow-500/20 text-yellow-400", icon: <Clock className="w-3 h-3" /> },
  in_review: { label: "In Review", color: "bg-blue-500/20 text-blue-400", icon: <MessageSquare className="w-3 h-3" /> },
  in_pool: { label: "In Test Pool", color: "bg-purple-500/20 text-purple-400", icon: <TrendingUp className="w-3 h-3" /> },
  shortlisted: { label: "Shortlisted", color: "bg-green-500/20 text-green-400", icon: <Star className="w-3 h-3" /> },
  approved: { label: "Export Ready", color: "bg-emerald-500/20 text-emerald-400", icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { label: "Not Selected", color: "bg-red-500/20 text-red-400", icon: <Clock className="w-3 h-3" /> },
};

const ArtistDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  // Fetch artist's tracks
  const { data: tracks, isLoading: tracksLoading } = useQuery({
    queryKey: ["artist-tracks", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch feedback for artist's tracks
  const { data: feedbackData } = useQuery({
    queryKey: ["artist-feedback", user?.id],
    queryFn: async () => {
      if (!user?.id || !tracks?.length) return [];
      const trackIds = tracks.map(t => t.id);
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .in("track_id", trackIds)
        .eq("is_public", true);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!tracks?.length,
  });

  // Calculate stats
  const stats = {
    total: tracks?.length || 0,
    pending: tracks?.filter(t => t.status === "pending").length || 0,
    inReview: tracks?.filter(t => ["in_review", "in_pool"].includes(t.status)).length || 0,
    approved: tracks?.filter(t => t.status === "approved").length || 0,
    feedbackCount: feedbackData?.length || 0,
  };

  if (loading || tracksLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
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
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Music className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Artist Dashboard</h1>
                  <p className="text-muted-foreground text-sm">
                    Track your submissions and feedback
                  </p>
                </div>
              </div>
              <Link to="/reviews">
                <Button className="gap-2">
                  <Upload className="w-4 h-4" />
                  Submit New Track
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Tracks</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-400">{stats.inReview}</p>
              <p className="text-sm text-muted-foreground">In Review</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-emerald-400">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </Card>
          </motion.div>

          {/* Tracks List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-4">Your Submissions</h2>
            
            {tracks?.length === 0 ? (
              <Card className="p-12 text-center">
                <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-xl font-semibold mb-2">No tracks yet</h3>
                <p className="text-muted-foreground mb-4">
                  Submit your first track to start the feedback process
                </p>
                <Link to="/reviews">
                  <Button>Submit Your First Track</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {tracks?.map((track, index) => {
                  const status = statusConfig[track.status] || statusConfig.pending;
                  const trackFeedback = feedbackData?.filter(f => f.track_id === track.id) || [];
                  
                  return (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-6 hover:border-foreground/20 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {/* Play Button */}
                            <TrackPlayButton
                              trackId={track.id}
                              fileUrl={track.file_url}
                              externalLink={track.external_link}
                              trackTitle={track.title}
                              artistName={track.artist_name}
                              variant="minimal"
                            />
                            <div>
                              <h3 className="font-semibold">{track.title}</h3>
                              <p className="text-sm text-muted-foreground">{track.artist_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(track.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge className={`gap-1 ${status.color}`}>
                              {status.icon}
                              {status.label}
                            </Badge>
                            
                            {trackFeedback.length > 0 && (
                              <Badge variant="outline" className="gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {trackFeedback.length} Feedback
                              </Badge>
                            )}
                            
                            {track.submission_type === "link" && (
                              <Badge variant="outline" className="text-xs">
                                {track.platform || "Link"}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Feedback Preview */}
                        {trackFeedback.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-sm text-muted-foreground mb-2">Latest Feedback:</p>
                            {trackFeedback.slice(0, 1).map(fb => (
                              <div key={fb.id} className="flex items-center gap-4 text-sm">
                                {fb.production_quality && (
                                  <span>Production: <strong>{fb.production_quality}/10</strong></span>
                                )}
                                {fb.originality && (
                                  <span>Originality: <strong>{fb.originality}/10</strong></span>
                                )}
                                {fb.commercial_potential && (
                                  <span>Commercial: <strong>{fb.commercial_potential}/10</strong></span>
                                )}
                              </div>
                            ))}
                            {trackFeedback[0]?.notes && (
                              <p className="text-sm mt-2 italic text-muted-foreground">
                                "{trackFeedback[0].notes}"
                              </p>
                            )}
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ArtistDashboard;
