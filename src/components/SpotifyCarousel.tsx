import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SpotifyItem {
  type: "track" | "album";
  id: string;
  height: number;
}

const spotifyItems: SpotifyItem[] = [
  { type: "track", id: "6eAara6VH8fJ1Zaa3xIWDe", height: 352 },
  { type: "track", id: "794VnZGkK62Y8IvkxBCzJm", height: 352 },
  { type: "track", id: "2sfIUBOUYbeD28SvJL2j30", height: 352 },
  { type: "album", id: "47FmEJShz02eaVSgXgHw1S", height: 352 },
  { type: "album", id: "6d8o3GQ182UXlzijQDn1it", height: 352 },
];

export const SpotifyCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', checkScroll);
      return () => scrollEl.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative">
      {/* Scroll buttons */}
      {canScrollLeft && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-background/90 backdrop-blur-sm rounded-full border border-border hover:bg-card transition-colors"
        >
          <ChevronLeft size={24} />
        </motion.button>
      )}
      {canScrollRight && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-background/90 backdrop-blur-sm rounded-full border border-border hover:bg-card transition-colors"
        >
          <ChevronRight size={24} />
        </motion.button>
      )}

      {/* Carousel container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 items-end"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {spotifyItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-[300px]"
          >
            <div 
              className="bg-card rounded-xl overflow-hidden border border-border hover:border-foreground/20 transition-colors"
              style={{ height: item.height }}
            >
              <iframe
                src={`https://open.spotify.com/embed/${item.type}/${item.id}?utm_source=generator&theme=0`}
                width="100%"
                height={item.height}
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title={`Spotify ${item.type} ${index + 1}`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
