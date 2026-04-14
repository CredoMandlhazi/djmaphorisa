import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Music, FileText, Upload, Download, Play, Pause, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Check if user has passed the password
const isUnlocked = () => {
  return sessionStorage.getItem("indianhill_unlocked") === "true";
};

const IndianHill = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to home if not unlocked
    if (!isUnlocked()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // If not unlocked, don't render anything
  if (!isUnlocked()) {
    return null;
  }

  const demos = [
    { id: "1", title: "Midnight Sessions", artist: "INDIAN HILL", duration: "3:24" },
    { id: "2", title: "Urban Dreams", artist: "INDIAN HILL", duration: "4:12" },
    { id: "3", title: "Echoes", artist: "INDIAN HILL", duration: "2:58" },
  ];

  const privateTracks = [
    { id: "1", title: "Unreleased Demo #1", status: "Draft", date: "2024-12-01" },
    { id: "2", title: "Collab Project", status: "In Progress", date: "2024-11-28" },
    { id: "3", title: "Beat Tape Vol. 3", status: "Mastering", date: "2024-11-25" },
  ];

  const pressKit = [
    { name: "Artist Bio", type: "PDF", size: "2.4 MB" },
    { name: "Press Photos (High Res)", type: "ZIP", size: "45 MB" },
    { name: "Logo Pack", type: "ZIP", size: "8.2 MB" },
    { name: "Album Artwork", type: "ZIP", size: "12 MB" },
  ];

  const contracts = [
    { name: "Standard License Agreement", type: "PDF", date: "2024-01" },
    { name: "Exclusive Rights Contract", type: "PDF", date: "2024-01" },
    { name: "Producer Split Sheet", type: "PDF", date: "2024-01" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[40vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/5 to-background" />
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Lock className="w-12 h-12 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">INDIAN HILL</h1>
            <p className="text-xl text-muted-foreground">Private Record Label Portal</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <section className="studio-container py-16">
        <Tabs defaultValue="demos" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-12 h-auto">
            <TabsTrigger value="demos" className="py-3 text-sm">Demos</TabsTrigger>
            <TabsTrigger value="private" className="py-3 text-sm">Private Tracks</TabsTrigger>
            <TabsTrigger value="press" className="py-3 text-sm">Press Kit</TabsTrigger>
            <TabsTrigger value="contracts" className="py-3 text-sm">Contracts</TabsTrigger>
            <TabsTrigger value="uploads" className="py-3 text-sm">Uploads</TabsTrigger>
          </TabsList>

          {/* Demos Tab */}
          <TabsContent value="demos">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold mb-6">Demo Tracks</h2>
              {demos.map((demo, index) => (
                <motion.div
                  key={demo.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:border-foreground/20 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-full group-hover:bg-foreground group-hover:text-background transition-colors"
                          onClick={() => setIsPlaying(isPlaying === demo.id ? null : demo.id)}
                        >
                          {isPlaying === demo.id ? (
                            <Pause size={20} />
                          ) : (
                            <Play size={20} className="ml-0.5" />
                          )}
                        </Button>
                        <div>
                          <h3 className="font-semibold text-lg">{demo.title}</h3>
                          <p className="text-sm text-muted-foreground">{demo.artist}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-sm text-muted-foreground">{demo.duration}</span>
                        <Button variant="ghost" size="icon">
                          <Download size={18} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Private Tracks Tab */}
          <TabsContent value="private">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold mb-6">Private Tracks</h2>
              <div className="grid gap-4">
                {privateTracks.map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 hover:border-foreground/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center border border-border">
                            <Music size={20} className="text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{track.title}</h3>
                            <p className="text-sm text-muted-foreground">{track.date}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 text-xs font-medium bg-foreground/10 rounded-full">
                          {track.status}
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Press Kit Tab */}
          <TabsContent value="press">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold mb-6">Press Kit</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {pressKit.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 hover:border-foreground/20 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center border border-border group-hover:bg-foreground group-hover:text-background transition-colors">
                            <FileText size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.type} • {item.size}</p>
                          </div>
                        </div>
                        <Download size={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold mb-6">Contracts & Agreements</h2>
              <div className="space-y-4">
                {contracts.map((contract, index) => (
                  <motion.div
                    key={contract.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 hover:border-foreground/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center border border-border">
                            <FileText size={20} className="text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{contract.name}</h3>
                            <p className="text-sm text-muted-foreground">Updated: {contract.date}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="outline" size="sm">
                            <Download size={14} className="mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Uploads Tab */}
          <TabsContent value="uploads">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold mb-6">Upload Files</h2>
              <Card className="p-12 border-2 border-dashed border-border hover:border-foreground/30 transition-colors">
                <div className="text-center">
                  <Upload size={48} className="mx-auto mb-6 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Drop files here</h3>
                  <p className="text-muted-foreground mb-6">or click to browse</p>
                  <Button variant="outline" size="lg">
                    Choose Files
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Supports: MP3, WAV, FLAC, PDF, ZIP (Max 100MB)
                  </p>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default IndianHill;
