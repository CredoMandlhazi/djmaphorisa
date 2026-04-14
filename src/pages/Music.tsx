import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { SpotifyCarousel } from "@/components/SpotifyCarousel";

const Music = () => {
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
            <h1 className="text-5xl md:text-7xl font-bold mb-6">My Music</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              A curated collection of my released tracks and albums
            </p>
          </motion.div>

          {/* Spotify Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-20"
          >
            <h2 className="text-2xl font-bold mb-8">Latest Releases</h2>
            <SpotifyCarousel />
          </motion.div>

          {/* Streaming Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="py-16 border-t border-border"
          >
            <h2 className="text-2xl font-bold mb-8 text-center">Listen Everywhere</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { name: "Spotify", href: "https://open.spotify.com/artist/1bSx64uUOuvPGgmr3tDmVc" },
                { name: "Apple Music", href: "https://music.apple.com/us/artist/credo-v-daniels/1793654405" },
                { name: "YouTube Music", href: "https://music.youtube.com/channel/UCHxYVrz7rpElk0XOOzRe7sw" },
                { name: "SoundCloud", href: "https://soundcloud.com/credo-daniels" },
              ].map((platform) => (
                <motion.a
                  key={platform.name}
                  href={platform.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-card border border-border rounded-full text-sm font-medium hover:border-foreground/20 transition-colors"
                >
                  {platform.name}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Music;
