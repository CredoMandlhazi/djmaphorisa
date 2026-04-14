import { Play, Pause, ShoppingCart, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useGlobalAudio } from "@/contexts/GlobalAudioContext";
import { useCart } from "@/contexts/CartContext";
import { PageTransition } from "@/components/PageTransition";
import logo from "@/assets/logo.png";

interface Beat {
  id: number;
  name: string;
  price: number;
  audioUrl: string;
}

const beats: Beat[] = [
  { id: 1, name: "Chikatetsu", price: 30, audioUrl: "/audio/Chikatetsu.mp3" },
  { id: 2, name: "D R O W N I N N O T W A V I N", price: 30, audioUrl: "/audio/D_R_O_W_N_I_N_N_O_T_W_A_V_I_N.mp3" },
  { id: 3, name: "Dr Doctor", price: 30, audioUrl: "/audio/Dr_Doctor.mp3" },
  { id: 4, name: "Fallin", price: 30, audioUrl: "/audio/Fallin.mp3" },
  { id: 5, name: "See You Go", price: 30, audioUrl: "/audio/See_You_Go.mp3" },
  { id: 6, name: "TKYOSKY", price: 30, audioUrl: "/audio/TKYOSKY.mp3" },
];

const Beats = () => {
  const { currentTrack, isPlaying, volume, playTrack, setVolume } = useGlobalAudio();
  const { addToCart } = useCart();

  const handleAddToCart = (beat: Beat) => {
    addToCart({ id: beat.id, name: beat.name, price: beat.price });
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-24">
        <div className="studio-container py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">Beats</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Premium beats crafted with precision, ready to elevate your next project.
            </p>
          </motion.div>

          {/* Beats Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-4">
                {beats.map((beat) => {
                  const isCurrentTrack = currentTrack?.id === beat.id;
                  const isThisPlaying = isCurrentTrack && isPlaying;

                  return (
                    <CarouselItem key={beat.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <Card className="overflow-hidden hover:border-foreground/20 transition-all group">
                        <div className="p-6">
                          <div className="flex flex-col items-center text-center">
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="relative w-full aspect-square rounded-xl overflow-hidden cursor-pointer mb-4"
                              onClick={() => playTrack(beat)}
                            >
                              <img src={logo} alt={beat.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {isThisPlaying ? <Pause size={48} /> : <Play size={48} className="ml-1" />}
                              </div>
                            </motion.div>

                            <h3 className="text-lg font-bold mb-2 line-clamp-1">{beat.name}</h3>
                            <Badge variant="secondary" className="text-lg px-4 py-1 mb-4">${beat.price}</Badge>

                            <div className="w-full space-y-3">
                              <div className="flex items-center justify-center gap-3">
                                <button
                                  onClick={() => playTrack(beat)}
                                  className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center hover:bg-foreground/90 transition-colors"
                                >
                                  {isThisPlaying ? (
                                    <Pause size={18} className="text-background" />
                                  ) : (
                                    <Play size={18} className="text-background ml-0.5" />
                                  )}
                                </button>
                                
                                <div className="flex items-center gap-2 flex-1 max-w-[120px]">
                                  <button onClick={() => setVolume(volume === 0 ? 0.7 : 0)} className="text-muted-foreground hover:text-foreground transition-colors">
                                    {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                  </button>
                                  <Slider value={[volume * 100]} max={100} step={1} onValueChange={(value) => setVolume(value[0] / 100)} className="flex-1" />
                                </div>
                              </div>

                              <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => handleAddToCart(beat)}>
                                <ShoppingCart size={14} />
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="-left-4 md:-left-12" />
              <CarouselNext className="-right-4 md:-right-12" />
            </Carousel>
          </motion.div>

          {/* License Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <Card className="inline-block p-8 max-w-2xl">
              <h3 className="text-2xl font-bold mb-4">License Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                All beats include a non-exclusive license for unlimited distribution. Files are delivered in high-quality WAV and MP3 formats.
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Beats;
