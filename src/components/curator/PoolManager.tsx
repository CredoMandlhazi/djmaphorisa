import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Layers, 
  Music, 
  Trash2, 
  RefreshCw,
  Users,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

interface TestPool {
  id: string;
  name: string;
  description: string | null;
  curator_id: string;
  is_active: boolean;
  max_tracks: number | null;
  created_at: string;
  track_count?: number;
}

interface PoolTrack {
  id: string;
  track_id: string;
  position: number | null;
  added_at: string;
  track: {
    id: string;
    title: string;
    artist_name: string;
    status: string;
  };
}

export const PoolManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pools, setPools] = useState<TestPool[]>([]);
  const [selectedPool, setSelectedPool] = useState<TestPool | null>(null);
  const [poolTracks, setPoolTracks] = useState<PoolTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPoolName, setNewPoolName] = useState("");
  const [newPoolDescription, setNewPoolDescription] = useState("");

  const fetchPools = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("test_pools")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch track counts for each pool
      const poolsWithCounts = await Promise.all(
        (data || []).map(async (pool) => {
          const { count } = await supabase
            .from("pool_tracks")
            .select("*", { count: "exact", head: true })
            .eq("pool_id", pool.id);
          return { ...pool, track_count: count || 0 };
        })
      );

      setPools(poolsWithCounts);
    } catch (error) {
      console.error("Error fetching pools:", error);
      toast({
        title: "Error",
        description: "Failed to load test pools",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPoolTracks = async (poolId: string) => {
    try {
      const { data, error } = await supabase
        .from("pool_tracks")
        .select(`
          id,
          track_id,
          position,
          added_at,
          track:tracks(id, title, artist_name, status)
        `)
        .eq("pool_id", poolId)
        .order("position", { ascending: true });

      if (error) throw error;
      setPoolTracks(data as unknown as PoolTrack[] || []);
    } catch (error) {
      console.error("Error fetching pool tracks:", error);
    }
  };

  useEffect(() => {
    fetchPools();
  }, []);

  useEffect(() => {
    if (selectedPool) {
      fetchPoolTracks(selectedPool.id);
    }
  }, [selectedPool]);

  const createPool = async () => {
    if (!newPoolName.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from("test_pools")
        .insert({
          name: newPoolName,
          description: newPoolDescription || null,
          curator_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setPools(prev => [{ ...data, track_count: 0 }, ...prev]);
      setNewPoolName("");
      setNewPoolDescription("");
      setCreateDialogOpen(false);

      toast({
        title: "Pool Created",
        description: `"${data.name}" is now ready for tracks`,
      });
    } catch (error) {
      console.error("Error creating pool:", error);
      toast({
        title: "Error",
        description: "Failed to create test pool",
        variant: "destructive",
      });
    }
  };

  const togglePoolActive = async (pool: TestPool) => {
    try {
      const { error } = await supabase
        .from("test_pools")
        .update({ is_active: !pool.is_active })
        .eq("id", pool.id);

      if (error) throw error;

      setPools(prev =>
        prev.map(p => p.id === pool.id ? { ...p, is_active: !p.is_active } : p)
      );

      toast({
        title: pool.is_active ? "Pool Deactivated" : "Pool Activated",
        description: `"${pool.name}" is now ${pool.is_active ? "inactive" : "active"}`,
      });
    } catch (error) {
      console.error("Error toggling pool:", error);
      toast({
        title: "Error",
        description: "Failed to update pool status",
        variant: "destructive",
      });
    }
  };

  const removeTrackFromPool = async (poolTrackId: string) => {
    if (!selectedPool) return;

    try {
      const { error } = await supabase
        .from("pool_tracks")
        .delete()
        .eq("id", poolTrackId);

      if (error) throw error;

      setPoolTracks(prev => prev.filter(pt => pt.id !== poolTrackId));
      setPools(prev =>
        prev.map(p => p.id === selectedPool.id 
          ? { ...p, track_count: (p.track_count || 1) - 1 } 
          : p
        )
      );

      toast({
        title: "Track Removed",
        description: "Track removed from pool",
      });
    } catch (error) {
      console.error("Error removing track:", error);
      toast({
        title: "Error",
        description: "Failed to remove track",
        variant: "destructive",
      });
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {pools.length} Test Pool{pools.length !== 1 ? "s" : ""}
          </span>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Pool
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Test Pool</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="poolName">Pool Name</Label>
                <Input
                  id="poolName"
                  placeholder="e.g., Amapiano Summer 2026"
                  value={newPoolName}
                  onChange={(e) => setNewPoolName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="poolDescription">Description (optional)</Label>
                <Textarea
                  id="poolDescription"
                  placeholder="Describe the purpose of this test pool..."
                  value={newPoolDescription}
                  onChange={(e) => setNewPoolDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={createPool} disabled={!newPoolName.trim()} className="flex-1">
                Create Pool
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {pools.map((pool, index) => (
            <motion.div
              key={pool.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedPool?.id === pool.id ? "ring-2 ring-primary" : ""
                } ${!pool.is_active ? "opacity-60" : ""}`}
                onClick={() => setSelectedPool(pool)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{pool.name}</CardTitle>
                      {pool.description && (
                        <CardDescription className="line-clamp-2 mt-1">
                          {pool.description}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant={pool.is_active ? "default" : "secondary"}>
                      {pool.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Music className="w-4 h-4" />
                      <span>{pool.track_count || 0} tracks</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePoolActive(pool);
                      }}
                    >
                      {pool.is_active ? (
                        <ToggleRight className="w-5 h-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Selected Pool Detail */}
      {selectedPool && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedPool.name}</CardTitle>
                  <CardDescription>
                    {poolTracks.length} track{poolTracks.length !== 1 ? "s" : ""} in this pool
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPool(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {poolTracks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tracks in this pool yet</p>
                  <p className="text-sm">Add tracks from the Track Queue tab</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {poolTracks.map((pt) => (
                    <div
                      key={pt.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                          <Music className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{pt.track.title}</p>
                          <p className="text-xs text-muted-foreground">{pt.track.artist_name}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTrackFromPool(pt.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};