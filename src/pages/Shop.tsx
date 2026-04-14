import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Download, Zap, Volume2, Clock, Waves, Loader2 } from "lucide-react";
import xlr8Plugin from "@/assets/xlr8-plugin.png";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const features = [
  {
    icon: Volume2,
    title: "Compressor",
    description: "Smooth, transparent dynamics control with adjustable threshold, ratio, attack, release, and makeup gain. Perfect for vocals, drums, or synths."
  },
  {
    icon: Waves,
    title: "Plate Reverb",
    description: "Classic studio plate sound with decay, size, pre-delay, damping, and modulation controls for a polished, immersive spatial effect."
  },
  {
    icon: Clock,
    title: "Stereo Delay",
    description: "Flexible delay with time, feedback, wet/dry mix, and ping-pong mode — create rhythmic movement or spacious echoes."
  }
];

const highlights = [
  "VST3 format compatible with all major DAWs",
  "Rack-style interface with intuitive controls",
  "Mini digital display for exact parameter values",
  "High-contrast layout designed for clarity",
  "Instant professional sheen for any mix"
];

const Shop = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloadingDemo, setIsDownloadingDemo] = useState(false);

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-xlr8-checkout', {
        body: { product_type: 'full' },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoDownload = () => {
    setIsDownloadingDemo(true);
    // Simulate demo download - in production, this would be a real file URL
    toast.success('Starting XLR8 Demo download...');
    
    // Create a download link for the demo (placeholder URL)
    const demoUrl = '/demo/XLR8_Demo.zip';
    const link = document.createElement('a');
    link.href = demoUrl;
    link.download = 'XLR8_Demo.zip';
    
    // For now, show a message since we don't have an actual demo file
    setTimeout(() => {
      toast.info('Demo download will be available soon. Check back later!');
      setIsDownloadingDemo(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4">
              DJ Maphorisa Signature Plugin
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-primary via-orange-500 to-red-500 bg-clip-text text-transparent">
                XLR8
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium">
              Compress. Plate. Delay. <span className="text-primary">Accelerated.</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-border/50">
              <img
                src={xlr8Plugin}
                alt="XLR8 Plugin Interface"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center text-lg text-muted-foreground max-w-3xl mx-auto mb-12"
          >
            Transform your sound with the ultimate vocal and instrument FX chain. XLR8 combines 
            a precision compressor, lush plate reverb, and versatile stereo delay into a single, 
            rack-inspired plugin designed for producers, engineers, and musicians who demand 
            clarity, depth, and movement in their mix.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Button 
              size="lg" 
              className="gap-2 text-lg px-8 py-6"
              onClick={handlePurchase}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {isLoading ? 'Processing...' : 'Buy Now — $99'}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 text-lg px-8 py-6"
              onClick={handleDemoDownload}
              disabled={isDownloadingDemo}
            >
              {isDownloadingDemo ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
              {isDownloadingDemo ? 'Preparing...' : 'Try Free Demo'}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three powerful effects in one sleek, rack-inspired interface
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why XLR8 Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why XLR8?</h2>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                XLR8 brings speed, precision, and character to your mix. Its rack-inspired 
                design isn't just aesthetic — it's functional, letting you focus on creativity 
                without getting lost in menus. Whether you're polishing vocals, adding depth 
                to instruments, or experimenting with spatial effects, XLR8 gives your tracks 
                instant professional sheen.
              </p>
              <ul className="space-y-3">
                {highlights.map((highlight, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-foreground">{highlight}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-video rounded-xl overflow-hidden bg-muted border border-border">
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Demo Video Coming Soon</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-t from-primary/10 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Step into the future of audio processing
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Accelerate your sound with XLR8.
            </p>
            <Button 
              size="lg" 
              className="gap-2 text-lg px-10 py-6"
              onClick={handlePurchase}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {isLoading ? 'Processing...' : 'Get XLR8 Now — $99'}
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Shop;
