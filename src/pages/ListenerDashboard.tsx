import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TrackPlayButton } from "@/components/TrackPlayButton";
import { toast } from "sonner";
import {
  Headphones,
  Music,
  Star,
  RefreshCw,
  Send,
  ThumbsUp,
  ThumbsDown,
  Repeat,
  Share2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PoolTrack {
  id: string;
  track_id: string;
  pool_id: string;
  position: number;
  tracks: {
    id: string;
    title: string;
    artist_name: string;
    file_url: string | null;
    external_link: string | null;
  };
  test_pools: {
    id: string;
    name: string;
    description: string | null;
  };
}

interface ListenerFeedback {
  rating: number;
  replayIntent: "definitely" | "maybe" | "no";
  shareIntent: "definitely" | "maybe" | "no";
  reaction: string[];
  comment: string;
}

const REACTION_TAGS = [
  "Catchy",
  "Energetic",
  "Chill",
  "Unique",
  "Radio Ready",
  "Club Banger",
  "Emotional",
  "Fresh",
  "Classic Feel",
  "Needs Work",
];

const ListenerDashboard = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<PoolTrack | null>(null);
  const [feedback, setFeedback] = useState<ListenerFeedback>({
    rating: 5,
    replayIntent: "maybe",
    shareIntent: "maybe",
    reaction: [],
    comment: "",
  });

  const isListener = role === "listener" || role === "artist";

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  // Fetch available pool tracks for listener
  const { data: poolTracks, isLoading: tracksLoading, refetch } = useQuery({
    queryKey: ["listener-pool-tracks", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get tracks from active pools
      const { data, error } = await supabase
        .from("pool_tracks")
        .select(`
          id,
          track_id,
          pool_id,
          position,
          tracks (
            id,
            title,
            artist_name,
            file_url,
            external_link
          ),
          test_pools (
            id,
            name,
            description
          )
        `)
        .order("position", { ascending: true });

      if (error) throw error;
      return (data as unknown as PoolTrack[]) || [];
    },
    enabled: !!user?.id,
  });

  // Check if user has already given feedback for a track
  const { data: existingFeedback } = useQuery({
    queryKey: ["listener-feedback", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("feedback")
        .select("track_id")
        .eq("reviewer_id", user.id);

      if (error) throw error;
      return data?.map((f) => f.track_id) || [];
    },
    enabled: !!user?.id,
  });

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async ({ trackId, feedback }: { trackId: string; feedback: ListenerFeedback }) => {
      const { error } = await supabase.from("feedback").insert({
        track_id: trackId,
        reviewer_id: user!.id,
        rating: feedback.rating,
        notes: JSON.stringify({
          replayIntent: feedback.replayIntent,
          shareIntent: feedback.shareIntent,
          reactions: feedback.reaction,
          comment: feedback.comment,
        }),
        is_public: false,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Feedback submitted! Thank you.");
      setFeedbackOpen(false);
      setSelectedTrack(null);
      resetFeedback();
      queryClient.invalidateQueries({ queryKey: ["listener-feedback"] });
    },
    onError: (error) => {
      toast.error(`Failed to submit feedback: ${error.message}`);
    },
  });

  const resetFeedback = () => {
    setFeedback({
      rating: 5,
      replayIntent: "maybe",
      shareIntent: "maybe",
      reaction: [],
      comment: "",
    });
  };

  const openFeedbackDialog = (track: PoolTrack) => {
    setSelectedTrack(track);
    setFeedbackOpen(true);
  };

  const toggleReaction = (tag: string) => {
    setFeedback((prev) => ({
      ...prev,
      reaction: prev.reaction.includes(tag)
        ? prev.reaction.filter((r) => r !== tag)
        : [...prev.reaction, tag],
    }));
  };

  const handleSubmitFeedback = () => {
    if (!selectedTrack) return;
    submitFeedbackMutation.mutate({
      trackId: selectedTrack.track_id,
      feedback,
    });
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

  // Group tracks by pool
  const tracksByPool = poolTracks?.reduce((acc, pt) => {
    const poolId = pt.pool_id;
    if (!acc[poolId]) {
      acc[poolId] = {
        pool: pt.test_pools,
        tracks: [],
      };
    }
    acc[poolId].tracks.push(pt);
    return acc;
  }, {} as Record<string, { pool: PoolTrack["test_pools"]; tracks: PoolTrack[] }>);

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
                  <Headphones className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Listener Dashboard</h1>
                  <p className="text-muted-foreground text-sm">
                    Listen to tracks in your assigned pools and provide feedback
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
          >
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold">{poolTracks?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Available Tracks</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">{Object.keys(tracksByPool || {}).length}</p>
              <p className="text-sm text-muted-foreground">Active Pools</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-green-500">{existingFeedback?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Reviews Given</p>
            </Card>
          </motion.div>

          {/* Pools & Tracks */}
          {!poolTracks?.length ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-12 text-center">
                <Headphones className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-xl font-semibold mb-2">No tracks available</h3>
                <p className="text-muted-foreground">
                  You'll be notified when new test pool tracks are available for review.
                </p>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {Object.entries(tracksByPool || {}).map(([poolId, { pool, tracks }], poolIndex) => (
                <motion.div
                  key={poolId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * poolIndex }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-bold">{pool.name}</h2>
                    <Badge variant="outline">{tracks.length} tracks</Badge>
                  </div>
                  {pool.description && (
                    <p className="text-sm text-muted-foreground mb-4">{pool.description}</p>
                  )}

                  <div className="grid gap-4">
                    {tracks.map((pt, trackIndex) => {
                      const hasReviewed = existingFeedback?.includes(pt.track_id);

                      return (
                        <motion.div
                          key={pt.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * trackIndex }}
                        >
                          <Card className="p-4 hover:border-foreground/20 transition-colors">
                            <div className="flex items-center gap-4">
                              {/* Play Button */}
                              <TrackPlayButton
                                trackId={pt.track_id}
                                fileUrl={pt.tracks.file_url}
                                externalLink={pt.tracks.external_link}
                                trackTitle={pt.tracks.title}
                                artistName={pt.tracks.artist_name}
                                variant="minimal"
                              />

                              {/* Track Info */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">{pt.tracks.title}</h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {pt.tracks.artist_name}
                                </p>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                {hasReviewed ? (
                                  <Badge className="bg-green-500/20 text-green-400 gap-1">
                                    <Star className="w-3 h-3" />
                                    Reviewed
                                  </Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => openFeedbackDialog(pt)}
                                    className="gap-2"
                                  >
                                    <Send className="w-4 h-4" />
                                    Give Feedback
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Rate This Track</DialogTitle>
            <DialogDescription>
              {selectedTrack?.tracks.title} by {selectedTrack?.tracks.artist_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Rating */}
            <div className="space-y-3">
              <Label>Overall Rating: {feedback.rating}/10</Label>
              <Slider
                value={[feedback.rating]}
                min={1}
                max={10}
                step={1}
                onValueChange={(v) => setFeedback((f) => ({ ...f, rating: v[0] }))}
              />
            </div>

            {/* Replay Intent */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Repeat className="w-4 h-4" />
                Would you replay this?
              </Label>
              <div className="flex gap-2">
                {(["definitely", "maybe", "no"] as const).map((option) => (
                  <Button
                    key={option}
                    variant={feedback.replayIntent === option ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFeedback((f) => ({ ...f, replayIntent: option }))}
                    className="flex-1 capitalize"
                  >
                    {option === "definitely" && <ThumbsUp className="w-3 h-3 mr-1" />}
                    {option === "no" && <ThumbsDown className="w-3 h-3 mr-1" />}
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {/* Share Intent */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Would you share this?
              </Label>
              <div className="flex gap-2">
                {(["definitely", "maybe", "no"] as const).map((option) => (
                  <Button
                    key={option}
                    variant={feedback.shareIntent === option ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFeedback((f) => ({ ...f, shareIntent: option }))}
                    className="flex-1 capitalize"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {/* Reaction Tags */}
            <div className="space-y-3">
              <Label>Reaction Tags (select all that apply)</Label>
              <div className="flex flex-wrap gap-2">
                {REACTION_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={feedback.reaction.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => toggleReaction(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-3">
              <Label>Additional Comments (optional)</Label>
              <Textarea
                value={feedback.comment}
                onChange={(e) => setFeedback((f) => ({ ...f, comment: e.target.value }))}
                placeholder="What stood out? Any suggestions?"
                rows={3}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleSubmitFeedback}
              disabled={submitFeedbackMutation.isPending}
            >
              {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default ListenerDashboard;
