import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Music, Star, Sparkles, TrendingUp, Mic2 } from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist_name: string;
}

interface FeedbackDialogProps {
  track: Track | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

export const FeedbackDialog = ({ track, open, onOpenChange, onSubmit }: FeedbackDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [productionQuality, setProductionQuality] = useState(5);
  const [originality, setOriginality] = useState(5);
  const [commercialPotential, setCommercialPotential] = useState(5);
  const [notes, setNotes] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const handleSubmit = async () => {
    if (!track) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("submit-feedback", {
        body: {
          trackId: track.id,
          rating,
          productionQuality,
          originality,
          commercialPotential,
          notes,
          isPublic,
        },
      });

      if (error) throw error;

      toast({
        title: "Feedback Submitted",
        description: "Your review has been saved successfully",
      });

      // Reset form
      setRating(5);
      setProductionQuality(5);
      setOriginality(5);
      setCommercialPotential(5);
      setNotes("");
      setIsPublic(false);

      onSubmit();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const RatingSlider = ({ 
    label, 
    value, 
    onChange, 
    icon: Icon 
  }: { 
    label: string; 
    value: number; 
    onChange: (v: number) => void; 
    icon: React.ElementType;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm">{label}</Label>
        </div>
        <span className="text-sm font-bold text-primary">{value}/10</span>
      </div>
      <Slider
        value={[value]}
        min={1}
        max={10}
        step={1}
        onValueChange={([v]) => onChange(v)}
        className="cursor-pointer"
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Review Track
          </DialogTitle>
          {track && (
            <DialogDescription className="text-left">
              <span className="font-medium text-foreground">{track.title}</span>
              <span className="text-muted-foreground"> by {track.artist_name}</span>
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating Sliders */}
          <RatingSlider
            label="Overall Rating"
            value={rating}
            onChange={setRating}
            icon={Star}
          />

          <RatingSlider
            label="Production Quality"
            value={productionQuality}
            onChange={setProductionQuality}
            icon={Mic2}
          />

          <RatingSlider
            label="Originality"
            value={originality}
            onChange={setOriginality}
            icon={Sparkles}
          />

          <RatingSlider
            label="Commercial Potential"
            value={commercialPotential}
            onChange={setCommercialPotential}
            icon={TrendingUp}
          />

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes & Feedback</Label>
            <Textarea
              id="notes"
              placeholder="Share your detailed feedback about this track..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <Label className="text-sm font-medium">Make Public</Label>
              <p className="text-xs text-muted-foreground">
                Allow the artist to see this feedback
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};