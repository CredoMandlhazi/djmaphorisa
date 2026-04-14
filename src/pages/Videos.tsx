import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { TikTokCarousel } from "@/components/TikTokCarousel";

const Videos = () => {
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
            <h1 className="text-5xl md:text-7xl font-bold mb-6">Videos</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Music videos, behind-the-scenes content, and production tutorials
            </p>
          </motion.div>

          {/* TikTok Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-20"
          >
            <h2 className="text-2xl font-bold mb-8">Latest TikToks</h2>
            <TikTokCarousel />
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-16 border-t border-border"
          >
            <h3 className="text-3xl font-bold mb-4">Want More?</h3>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Follow me on TikTok for daily content and exclusive previews
            </p>
            <a href="https://www.tiktok.com/@credovdaniels" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2">
                <ExternalLink size={18} />
                Follow on TikTok
              </Button>
            </a>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Videos;
