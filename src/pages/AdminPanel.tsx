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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Shield, 
  Users, 
  Music, 
  Layers,
  Crown,
  User,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const roleConfig: Record<AppRole, { label: string; color: string; icon: React.ReactNode }> = {
  admin: { label: "Admin", color: "bg-red-500/20 text-red-400", icon: <Crown className="w-3 h-3" /> },
  super_curator: { label: "Super Curator", color: "bg-purple-500/20 text-purple-400", icon: <Shield className="w-3 h-3" /> },
  curator: { label: "Curator", color: "bg-blue-500/20 text-blue-400", icon: <Shield className="w-3 h-3" /> },
  artist: { label: "Artist", color: "bg-green-500/20 text-green-400", icon: <User className="w-3 h-3" /> },
  listener: { label: "Listener", color: "bg-gray-500/20 text-gray-400", icon: <User className="w-3 h-3" /> },
};

const AdminPanel = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPool, setSelectedPool] = useState<string>("");

  const isAdmin = role === "admin";

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  // Fetch all users with roles
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");
      
      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");
      
      if (rolesError) throw rolesError;

      return profiles?.map(profile => ({
        ...profile,
        role: roles?.find(r => r.user_id === profile.user_id)?.role as AppRole || "artist",
      })) || [];
    },
    enabled: isAdmin,
  });

  // Fetch all tracks
  const { data: tracks, isLoading: tracksLoading } = useQuery({
    queryKey: ["admin-tracks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  // Fetch all pools
  const { data: pools } = useQuery({
    queryKey: ["admin-pools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_pools")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update role: ${error.message}`);
    },
  });

  // Add track to pool mutation
  const addToPoolMutation = useMutation({
    mutationFn: async ({ trackId, poolId }: { trackId: string; poolId: string }) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("track-controls", {
        body: { action: "add_to_pool", trackId, poolId },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      toast.success("Track added to pool");
      setSelectedPool("");
    },
    onError: (error) => {
      toast.error(`Failed to add to pool: ${error.message}`);
    },
  });

  if (loading || usersLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
        </div>
      </PageTransition>
    );
  }

  if (!isAdmin) {
    return (
      <PageTransition>
        <div className="min-h-screen pt-32 pb-20">
          <div className="studio-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <AlertTriangle className="w-16 h-16 mx-auto text-destructive" />
              <h1 className="text-3xl font-bold">Access Denied</h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                This panel is only accessible to Administrators.
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
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Crown className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Panel</h1>
                <p className="text-muted-foreground text-sm">
                  Manage users, roles, and track assignments
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <Card className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{users?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </Card>
            <Card className="p-4 text-center">
              <Music className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{tracks?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total Tracks</p>
            </Card>
            <Card className="p-4 text-center">
              <Layers className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{pools?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Test Pools</p>
            </Card>
            <Card className="p-4 text-center">
              <Shield className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">
                {users?.filter(u => ["curator", "super_curator", "admin"].includes(u.role)).length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Curators</p>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="users" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
                <TabsTrigger value="users" className="gap-2">
                  <Users className="w-4 h-4" />
                  <span>User Management</span>
                </TabsTrigger>
                <TabsTrigger value="tracks" className="gap-2">
                  <Music className="w-4 h-4" />
                  <span>Track Queue</span>
                </TabsTrigger>
              </TabsList>

              {/* Users Tab */}
              <TabsContent value="users">
                <Card className="p-0 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Current Role</TableHead>
                        <TableHead>Change Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((u) => {
                        const roleInfo = roleConfig[u.role];
                        return (
                          <TableRow key={u.id}>
                            <TableCell className="font-mono text-xs">
                              {u.user_id.slice(0, 8)}...
                            </TableCell>
                            <TableCell>
                              {u.display_name || u.stage_name || "—"}
                            </TableCell>
                            <TableCell>
                              <Badge className={`gap-1 ${roleInfo.color}`}>
                                {roleInfo.icon}
                                {roleInfo.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={u.role}
                                onValueChange={(value: AppRole) => 
                                  updateRoleMutation.mutate({ userId: u.user_id, newRole: value })
                                }
                                disabled={updateRoleMutation.isPending}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="listener">Listener</SelectItem>
                                  <SelectItem value="artist">Artist</SelectItem>
                                  <SelectItem value="curator">Curator</SelectItem>
                                  <SelectItem value="super_curator">Super Curator</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>

              {/* Tracks Tab */}
              <TabsContent value="tracks">
                <Card className="p-0 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Track</TableHead>
                        <TableHead>Artist</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tracks?.map((track) => (
                        <TableRow key={track.id}>
                          <TableCell className="font-medium">{track.title}</TableCell>
                          <TableCell>{track.artist_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{track.status}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(track.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Select
                                value={selectedPool}
                                onValueChange={setSelectedPool}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue placeholder="Select pool" />
                                </SelectTrigger>
                                <SelectContent>
                                  {pools?.filter(p => p.is_active).map((pool) => (
                                    <SelectItem key={pool.id} value={pool.id}>
                                      {pool.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                disabled={!selectedPool || addToPoolMutation.isPending}
                                onClick={() => 
                                  addToPoolMutation.mutate({ 
                                    trackId: track.id, 
                                    poolId: selectedPool 
                                  })
                                }
                              >
                                Add
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {tracks?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No tracks submitted yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminPanel;
