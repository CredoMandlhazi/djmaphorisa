import { CheckCircle, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const XLR8Success = () => {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      setIsVerifying(false);
      setError("No session information found");
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { session_id: sessionId },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setVerified(true);
      setCustomerEmail(data.email || "");
    } catch (err) {
      console.error("Verification error:", err);
      setError("Unable to verify payment. Please contact support.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownload = () => {
    // In production, this would be a secure signed URL from your storage
    toast.success("Preparing XLR8 download...");
    // Placeholder - would trigger actual download
    toast.info("Download link will be sent to your email shortly.");
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center pb-24">
      <div className="cinematic-container text-center max-w-2xl px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="mb-8"
        >
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-serif font-bold mb-4"
        >
          Thank You!
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-muted-foreground mb-8"
        >
          {customerEmail 
            ? `Your XLR8 license has been sent to ${customerEmail}`
            : "Your XLR8 purchase was successful!"}
        </motion.p>

        {error ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-destructive mb-8"
          >
            {error}
          </motion.p>
        ) : verified && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-xl p-6 mb-8"
          >
            <h2 className="text-xl font-semibold mb-4">Your XLR8 Plugin</h2>
            <p className="text-muted-foreground mb-4">
              Click below to download your full version of XLR8.
            </p>
            <Button
              size="lg"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download size={20} />
              Download XLR8 (VST3)
            </Button>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4 justify-center"
        >
          <Button asChild>
            <Link to="/shop">Back to Shop</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default XLR8Success;
