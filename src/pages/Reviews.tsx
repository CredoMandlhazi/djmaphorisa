import { useState } from "react";
import { Upload, Link as LinkIcon, Music, Shield, Clock, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AudioPlayer } from "@/components/AudioPlayer";
import { PageTransition } from "@/components/PageTransition";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Supported external platforms for link validation
const SUPPORTED_PLATFORMS = [
  { name: "Spotify", pattern: /spotify\.com/ },
  { name: "Apple Music", pattern: /music\.apple\.com/ },
  { name: "YouTube Music", pattern: /music\.youtube\.com/ },
  { name: "YouTube", pattern: /youtube\.com|youtu\.be/ },
  { name: "SoundCloud", pattern: /soundcloud\.com/ },
  { name: "Google Drive", pattern: /drive\.google\.com/ },
  { name: "Mega", pattern: /mega\.nz/ },
  { name: "WeTransfer", pattern: /wetransfer\.com|we\.tl/ },
  { name: "Dropbox", pattern: /dropbox\.com/ },
  { name: "Box", pattern: /box\.com/ },
];

const validateExternalLink = (url: string): { valid: boolean; platform?: string; error?: string } => {
  try {
    new URL(url);
  } catch {
    return { valid: false, error: "Please enter a valid URL" };
  }

  const matchedPlatform = SUPPORTED_PLATFORMS.find((p) => p.pattern.test(url));
  
  if (matchedPlatform) {
    return { valid: true, platform: matchedPlatform.name };
  }

  return { valid: true, platform: "External Link" };
};

const statusLabels: Record<string, string> = {
  pending: "Pending Review",
  in_review: "In Review",
  in_pool: "In Test Pool",
  shortlisted: "Shortlisted",
  approved: "Export Ready",
  rejected: "Not Selected",
};

const Reviews = () => {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [submitType, setSubmitType] = useState<"upload" | "link">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user's submissions from DB
  const { data: userTracks } = useQuery({
    queryKey: ["user-tracks", user?.id],
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

  const nowReviewing = userTracks?.find(t => t.status === "in_pool") || null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to submit tracks");
      return;
    }

    setIsSubmitting(true);
    const form = e.currentTarget;
    const artistName = (form.elements.namedItem("artistName") as HTMLInputElement).value.trim();
    const trackName = (form.elements.namedItem("trackName") as HTMLInputElement).value.trim();
    const feedbackFocus = (form.elements.namedItem("feedbackFocus") as HTMLTextAreaElement)?.value.trim();

    if (!artistName || !trackName) {
      toast.error("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      if (submitType === "upload") {
        if (!selectedFile) {
          toast.error("Please upload a file.");
          setIsSubmitting(false);
          return;
        }

        // Validate file type
        const fileExt = selectedFile.name.split(".").pop()?.toLowerCase();
        const validExtensions = ["mp3", "wav", "m4a", "ogg", "flac", "aac"];
        
        if (!fileExt || !validExtensions.includes(fileExt)) {
          toast.error("Please upload a valid audio file (MP3, WAV, M4A, OGG, FLAC, AAC)");
          setIsSubmitting(false);
          return;
        }

        // Upload to storage
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("tracks")
          .upload(filePath, selectedFile, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error(`Upload failed: ${uploadError.message}`);
          setIsSubmitting(false);
          return;
        }

        // Create track record in database
        const { error: insertError } = await supabase
          .from("tracks")
          .insert({
            user_id: user.id,
            title: trackName,
            artist_name: artistName,
            submission_type: "upload",
            file_url: filePath,
            status: "pending",
            genre: feedbackFocus || null,
          });

        if (insertError) {
          console.error("Insert error:", insertError);
          toast.error(`Failed to save track: ${insertError.message}`);
          setIsSubmitting(false);
          return;
        }

        setSelectedFile(null);
        toast.success("Track uploaded and submitted to PHORI LAB!");
      }

      if (submitType === "link") {
        const link = (form.elements.namedItem("trackLink") as HTMLInputElement).value.trim();
        if (!link) {
          toast.error("Please enter a link.");
          setIsSubmitting(false);
          return;
        }

        const validation = validateExternalLink(link);
        if (!validation.valid) {
          toast.error(validation.error || "Invalid link");
          setIsSubmitting(false);
          return;
        }

        // Create track record in database
        const { error: insertError } = await supabase
          .from("tracks")
          .insert({
            user_id: user.id,
            title: trackName,
            artist_name: artistName,
            submission_type: "link",
            external_link: link,
            platform: validation.platform,
            status: "pending",
            genre: feedbackFocus || null,
          });

        if (insertError) {
          console.error("Insert error:", insertError);
          toast.error(`Failed to save track: ${insertError.message}`);
          setIsSubmitting(false);
          return;
        }

        toast.success(`${validation.platform} link submitted to PHORI LAB!`);
      }

      // Refresh the tracks list
      queryClient.invalidateQueries({ queryKey: ["user-tracks", user.id] });
      form.reset();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show login prompt if not authenticated
  if (!loading && !user) {
    return (
      <PageTransition>
        <div className="min-h-screen pt-24">
          <div className="studio-container py-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-xl mx-auto"
            >
              <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-6">
                <LogIn className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Submit Your Music</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Sign in to submit tracks to PHORI LAB for structured feedback and hit-testing
              </p>
              <Link to="/auth">
                <Button size="lg" className="gap-2">
                  <LogIn className="w-5 h-5" />
                  Sign In to Submit
                </Button>
              </Link>
            </motion.div>

            {/* Privacy Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto mt-12"
            >
              <Card className="p-6 bg-foreground/5 border-foreground/10">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-foreground shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold mb-2">Your Music is Protected</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      PHORI LAB is private by default. Your tracks are never publicly accessible. 
                      Only assigned test pool members, curators, and admins can access your music. 
                      No downloads, no public links—just controlled listening environments.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-24">
        <div className="studio-container py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">Submit Track</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Upload your unreleased music for structured feedback and hit-testing
            </p>
          </motion.div>

          {/* Privacy Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12"
          >
            <Card className="p-6 bg-foreground/5 border-foreground/10">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-foreground shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-2">Your Music is Protected</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    PHORI LAB is private by default. Your tracks are never publicly accessible. 
                    Only assigned test pool members, curators, and admins can access your music. 
                    No downloads, no public links—just controlled listening environments.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* NOW REVIEWING */}
          {nowReviewing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="p-8 mb-12 bg-card border-foreground/10">
                <div className="flex items-center gap-4 mb-6">
                  <Badge className="bg-foreground text-background">In Test Pool</Badge>
                </div>
                <AudioPlayer
                  trackName={nowReviewing.title}
                  artistName={nowReviewing.artist_name}
                  audioUrl={nowReviewing.file_url || undefined}
                />
              </Card>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-2 gap-12">
            {/* SUBMIT SECTION */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Submit Your Track</h2>

                {/* Toggle Submit Type */}
                <div className="flex gap-4 mb-8">
                  <Button
                    type="button"
                    variant={submitType === "upload" ? "default" : "outline"}
                    onClick={() => setSubmitType("upload")}
                    className="flex-1"
                  >
                    <Upload className="mr-2" size={18} />
                    Upload File
                  </Button>
                  <Button
                    type="button"
                    variant={submitType === "link" ? "default" : "outline"}
                    onClick={() => setSubmitType("link")}
                    className="flex-1"
                  >
                    <LinkIcon className="mr-2" size={18} />
                    Paste Link
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="artistName">Artist / Stage Name</Label>
                    <Input id="artistName" placeholder="Your artist name" required className="mt-2" />
                  </div>

                  <div>
                    <Label htmlFor="trackName">Track Title</Label>
                    <Input id="trackName" placeholder="Your track title" required className="mt-2" />
                  </div>

                  <AnimatePresence mode="wait">
                    {submitType === "upload" ? (
                      <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <Label>Upload Track (WAV preferred, MP3 accepted)</Label>
                        <div
                          className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                            isDragging ? "border-foreground bg-foreground/5" : "hover:border-foreground/50"
                          }`}
                          onClick={() => document.getElementById("fileUpload")?.click()}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file && file.type.startsWith("audio/")) {
                              setSelectedFile(file);
                              toast.success("File selected!");
                            } else {
                              toast.error("Please upload a valid audio file.");
                            }
                          }}
                        >
                          <Upload size={32} className="mx-auto mb-3 text-muted-foreground" />
                          {!selectedFile ? (
                            <p className="text-sm text-muted-foreground">Drag & drop your file here, or click to upload</p>
                          ) : (
                            <p className="font-medium">{selectedFile.name}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">Max size: 100MB</p>
                        </div>

                        <Input
                          id="fileUpload"
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSelectedFile(file);
                              toast.success("File selected!");
                            }
                          }}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="link"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <Label>Private Track Link</Label>
                        <Input
                          id="trackLink"
                          type="url"
                          placeholder="Google Drive, Dropbox, WeTransfer..."
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Supports: Google Drive, Mega, WeTransfer, Dropbox, Box, SoundCloud (private)
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <Label htmlFor="feedbackFocus">Feedback Focus (Optional)</Label>
                    <Textarea 
                      id="feedbackFocus"
                      name="feedbackFocus"
                      placeholder="What specific feedback are you looking for? (e.g., mix quality, hook strength, export readiness)" 
                      className="mt-2 min-h-[100px]" 
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    <Music className="mr-2" size={20} />
                    {isSubmitting ? "Submitting..." : "Submit to PHORI LAB"}
                  </Button>
                </form>
              </Card>
            </motion.div>

            {/* QUEUE SECTION */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-6">Your Submissions</h2>

              {(!userTracks || userTracks.length === 0) ? (
                <Card className="p-12 text-center">
                  <Music size={48} className="mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="text-xl font-semibold mb-2">No tracks submitted</h3>
                  <p className="text-muted-foreground">Submit your first track to start the feedback process</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {userTracks.map((track, index) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-6 hover:border-foreground/20 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center border border-border">
                              <Music size={20} className="text-muted-foreground" />
                            </div>
                            <div>
                              <h4 className="font-semibold mb-1">{track.title}</h4>
                              <p className="text-sm text-muted-foreground">{track.artist_name}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Clock size={12} />
                              {statusLabels[track.status] || track.status}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pipeline Info */}
              <Card className="p-6 mt-8 bg-foreground/5">
                <h3 className="font-bold mb-4">The PHORI LAB Pipeline</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="shrink-0">1</Badge>
                    <span>Submitted → Track enters the queue</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="shrink-0">2</Badge>
                    <span>In Test Pool → Assigned to listeners & curators</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="shrink-0">3</Badge>
                    <span>Feedback Returned → Structured feedback delivered</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="shrink-0">4</Badge>
                    <span>Shortlisted → Selected for deeper review</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="shrink-0">5</Badge>
                    <span>Export Ready → Approved for global distribution</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Reviews;
