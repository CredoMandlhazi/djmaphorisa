import { CheckCircle, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DownloadItem {
  name: string;
  url: string;
}

const CheckoutSuccess = () => {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
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
    
    // Clear cart silently
    clearCart(true);
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

      setDownloads(data.downloads || []);
      setCustomerEmail(data.email || "");
    } catch (err) {
      console.error("Verification error:", err);
      setError("Unable to verify payment. Please contact support.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloading ${name}`);
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
      <div className="cinematic-container text-center max-w-2xl">
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
          Payment Successful!
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-muted-foreground mb-8"
        >
          {customerEmail 
            ? `A confirmation has been sent to ${customerEmail}`
            : "Thank you for your purchase!"}
        </motion.p>

        {error ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-destructive mb-8"
          >
            {error}
          </motion.p>
        ) : downloads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-xl p-6 mb-8"
          >
            <h2 className="text-xl font-semibold mb-4">Your Downloads</h2>
            <div className="space-y-3">
              {downloads.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <span className="font-medium">{item.name}</span>
                  <Button
                    size="sm"
                    onClick={() => handleDownload(item.url, item.name)}
                    className="gap-2"
                  >
                    <Download size={16} />
                    Download
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4 justify-center"
        >
          <Button asChild>
            <Link to="/beats">Browse More Beats</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
