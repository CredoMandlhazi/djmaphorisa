import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TrackPlayButtonProps {
  trackId: string;
  fileUrl?: string | null;
  externalLink?: string | null;
  trackTitle: string;
  artistName: string;
  variant?: "minimal" | "full";
  className?: string;
}

const SNIPPET_DURATION = 45; // seconds - snippet length for non-curators

export const TrackPlayButton = ({
  trackId,
  fileUrl,
  externalLink,
  trackTitle,
  artistName,
  variant = "minimal",
  className = "",
}: TrackPlayButtonProps) => {
  const { user, role } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Determine if user can access full track
  const canPlayFullTrack = role === "curator" || role === "super_curator" || role === "admin";
  const maxPlaybackTime = canPlayFullTrack ? Infinity : SNIPPET_DURATION;

  // Get signed URL for playback
  const getPlaybackUrl = async () => {
    if (!fileUrl) {
      // If external link, open in new tab
      if (externalLink) {
        window.open(externalLink, "_blank");
        return null;
      }
      return null;
    }

    try {
      setIsLoading(true);
      
      // Get signed URL with 1 hour expiry
      const { data, error } = await supabase.storage
        .from("tracks")
        .createSignedUrl(fileUrl, 3600);

      if (error) {
        console.error("Error getting signed URL:", error);
        toast.error("Unable to load audio");
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load track");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    audioRef.current.preload = "metadata";

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      
      // Enforce snippet limit for non-curators
      if (!canPlayFullTrack && audio.currentTime >= maxPlaybackTime) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        toast.info("Preview ended. Full access requires curator privileges.");
      }
    };

    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleError = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
    };
  }, [canPlayFullTrack, maxPlaybackTime]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // Get URL if needed
    if (!audioUrl && fileUrl) {
      const url = await getPlaybackUrl();
      if (url) {
        setAudioUrl(url);
        audioRef.current.src = url;
      } else {
        return;
      }
    }

    // Handle external links
    if (!fileUrl && externalLink) {
      window.open(externalLink, "_blank");
      return;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Playback error:", error);
      toast.error("Unable to play audio");
    }
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    const seekTime = value[0];
    
    // Prevent seeking past snippet limit
    if (!canPlayFullTrack && seekTime > maxPlaybackTime) {
      return;
    }
    
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const effectiveDuration = canPlayFullTrack ? duration : Math.min(duration, SNIPPET_DURATION);

  // External link only - show link button
  if (!fileUrl && externalLink) {
    return (
      <Button
        variant="outline"
        size={variant === "minimal" ? "icon" : "sm"}
        onClick={() => window.open(externalLink, "_blank")}
        className={className}
      >
        <Play className="w-4 h-4" />
        {variant === "full" && <span className="ml-2">Open Link</span>}
      </Button>
    );
  }

  // No playback source
  if (!fileUrl) {
    return (
      <Button variant="ghost" size="icon" disabled className={className}>
        <Lock className="w-4 h-4 text-muted-foreground" />
      </Button>
    );
  }

  // Minimal variant - just play button
  if (variant === "minimal") {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={togglePlay}
        disabled={isLoading}
        className={`w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 ${className}`}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
        )}
      </motion.button>
    );
  }

  // Full variant - with progress bar and controls
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePlay}
          disabled={isLoading}
          className="w-12 h-12 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5 text-primary-foreground" />
          ) : (
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
          )}
        </motion.button>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{trackTitle}</span>
            {!canPlayFullTrack && (
              <span className="text-yellow-500">Preview Only</span>
            )}
          </div>
          <Slider
            value={[currentTime]}
            max={effectiveDuration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(effectiveDuration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={(v) => setVolume(v[0] / 100)}
            className="w-20"
          />
        </div>
      </div>
    </div>
  );
};
