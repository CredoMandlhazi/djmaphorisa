import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MessageSquare, 
  Star, 
  Mic2, 
  Sparkles, 
  TrendingUp,
  RefreshCw,
  Music,
  Eye,
  EyeOff,
  Calendar
} from "lucide-react";

interface FeedbackWithTrack {
  id: string;
  track_id: string;
  rating: number | null;
  production_quality: number | null;
  originality: number | null;
  commercial_potential: number | null;
  notes: string | null;
  is_public: boolean;
  created_at: string;
  track: {
    id: string;
    title: string;
    artist_name: string;
  };
}

export const FeedbackHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<FeedbackWithTrack[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select(`
          id,
          track_id,
          rating,
          production_quality,
          originality,
          commercial_potential,
          notes,
          is_public,
          created_at,
          track:tracks(id, title, artist_name)
        `)
        .eq("reviewer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeedbacks(data as unknown as FeedbackWithTrack[] || []);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast({
        title: "Error",
        description: "Failed to load feedback history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [user]);

  const RatingBar = ({ 
    label, 
    value, 
    icon: Icon 
  }: { 
    label: string; 
    value: number | null; 
    icon: React.ElementType;
  }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="w-3 h-3" />
          <span>{label}</span>
        </div>
        <span className="font-medium">{value ?? "-"}/10</span>
      </div>
      <Progress value={(value ?? 0) * 10} className="h-1.5" />
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Stats
  const totalReviews = feedbacks.length;
  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.filter(f => f.rating).length).toFixed(1)
    : "-";
  const publicReviews = feedbacks.filter(f => f.is_public).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{totalReviews}</p>
                <p className="text-xs text-muted-foreground">Total Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{avgRating}</p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{publicReviews}</p>
                <p className="text-xs text-muted-foreground">Public Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      {feedbacks.length === 0 ? (
        <Card className="bg-card/50">
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No feedback submitted yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Review tracks from the Track Queue to see your history here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {feedbacks.map((feedback, index) => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-card/50">
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Music className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{feedback.track.title}</h3>
                            <p className="text-sm text-muted-foreground">{feedback.track.artist_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={feedback.is_public ? "default" : "secondary"} className="gap-1">
                            {feedback.is_public ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {feedback.is_public ? "Public" : "Private"}
                          </Badge>
                        </div>
                      </div>

                      {/* Ratings Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <RatingBar label="Overall" value={feedback.rating} icon={Star} />
                        <RatingBar label="Production" value={feedback.production_quality} icon={Mic2} />
                        <RatingBar label="Originality" value={feedback.originality} icon={Sparkles} />
                        <RatingBar label="Commercial" value={feedback.commercial_potential} icon={TrendingUp} />
                      </div>

                      {/* Notes */}
                      {feedback.notes && (
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground">{feedback.notes}</p>
                        </div>
                      )}

                      {/* Date */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(feedback.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};