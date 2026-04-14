import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FeedbackDialog } from "./FeedbackDialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Music,
  User,
  ExternalLink,
  Filter
} from "lucide-react";
import { TrackPlayButton } from "@/components/TrackPlayButton";

interface Track {
  id: string;
  title: string;
  artist_name: string;
  file_url: string | null;
  external_link: string | null;
  submission_type: string;
  platform: string | null;
  status: string;
  created_at: string;
  user_id: string;
}

export const TrackQueue = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const fetchTracks = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("tracks")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTracks(data || []);
    } catch (error) {
      console.error("Error fetching tracks:", error);
      toast({
        title: "Error",
        description: "Failed to load tracks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, [statusFilter]);

  const updateTrackStatus = async (trackId: string, newStatus: string) => {
    try {
      const { error } = await supabase.functions.invoke("track-controls", {
        body: { action: "status_update", trackId, status: newStatus },
      });

      if (error) throw error;

      setTracks(prev => 
        prev.map(t => t.id === trackId ? { ...t, status: newStatus } : t)
      );

      toast({
        title: "Status Updated",
        description: `Track marked as ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update track status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      in_review: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      approved: "bg-green-500/10 text-green-500 border-green-500/20",
      rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return styles[status] || "bg-muted text-muted-foreground";
  };

  const openFeedback = (track: Track) => {
    setSelectedTrack(track);
    setFeedbackOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tracks</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTracks} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", count: tracks.length, icon: Music },
          { label: "Pending", count: tracks.filter(t => t.status === "pending").length, icon: Clock },
          { label: "Approved", count: tracks.filter(t => t.status === "approved").length, icon: CheckCircle },
          { label: "Rejected", count: tracks.filter(t => t.status === "rejected").length, icon: XCircle },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <stat.icon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{stat.count}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Track List */}
      {tracks.length === 0 ? (
        <Card className="bg-card/50">
          <CardContent className="py-12 text-center">
            <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No tracks found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {tracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-card/50 hover:bg-card transition-colors">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Play Button + Track Info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <TrackPlayButton
                          trackId={track.id}
                          fileUrl={track.file_url}
                          externalLink={track.external_link}
                          trackTitle={track.title}
                          artistName={track.artist_name}
                          variant="minimal"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold truncate">{track.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="w-3 h-3" />
                            <span className="truncate">{track.artist_name}</span>
                          </div>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-2 lg:gap-4">
                        <Badge variant="outline" className={getStatusBadge(track.status)}>
                          {track.status.replace("_", " ")}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {track.submission_type}
                        </Badge>
                        {track.platform && (
                          <Badge variant="outline" className="text-xs">
                            {track.platform}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(track.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {track.external_link && (
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <a href={track.external_link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        
                        <Select
                          value={track.status}
                          onValueChange={(value) => updateTrackStatus(track.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_review">In Review</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => openFeedback(track)}
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Feedback Dialog */}
      <FeedbackDialog
        track={selectedTrack}
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        onSubmit={() => {
          setFeedbackOpen(false);
          fetchTracks();
        }}
      />
    </div>
  );
};