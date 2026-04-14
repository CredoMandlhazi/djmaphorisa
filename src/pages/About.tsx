import { Award, Users, Music2, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/PageTransition";
import maphorisaHero from "@/assets/dj-maphorisa-hero.jpg";

const About = () => {
  const stats = [
    { icon: Music2, label: "Hit Records", value: "100+" },
    { icon: Users, label: "Artists Developed", value: "50+" },
    { icon: Award, label: "Awards Won", value: "30+" },
    { icon: Globe, label: "Countries Reached", value: "40+" },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen pt-24">
        <div className="studio-container py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-2 gap-16 items-center mb-24"
          >
            <div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6">DJ Maphorisa</h1>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Themba Sonnyboy Sekowe, known professionally as DJ Maphorisa, is a South African DJ, 
                  record producer, and songwriter. He is one of the most influential figures in the 
                  African music industry and a pioneer of the Amapiano genre.
                </p>
                <p>
                  Born in Pretoria, South Africa, Maphorisa has been instrumental in shaping the sound 
                  of modern African music. He has worked with international artists including Drake, 
                  Wizkid, and Major Lazer, helping to bring African sounds to the global stage.
                </p>
                <p>
                  As the founder of PHORI LAB, he's now dedicated to developing the next generation 
                  of African artists through structured feedback and real-world hit testing.
                </p>
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img src={maphorisaHero} alt="DJ Maphorisa" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 text-center hover:border-foreground/20 transition-colors">
                  <stat.icon size={28} className="mx-auto mb-4 text-muted-foreground" />
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* PHORI LAB Mission */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <Card className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-6">The PHORI LAB Mission</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                To reduce randomness in artist discovery and increase the probability of export-ready records. 
                PHORI LAB enables African artists to safely test unreleased music in real listening environments, 
                receive structured feedback from trusted tastemakers, and progress through an export-readiness 
                pipeline powered by DJ Maphorisa's curation network.
              </p>
            </Card>
          </motion.div>

          {/* Philosophy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 hover:border-foreground/20 transition-colors">
                <h3 className="text-xl font-bold mb-4">Curation Over Algorithms</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Human insight beats automated discovery. Our network of tastemakers provides 
                  feedback that algorithms simply cannot replicate.
                </p>
              </Card>
              
              <Card className="p-8 hover:border-foreground/20 transition-colors">
                <h3 className="text-xl font-bold mb-4">Signal Over Noise</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We cut through the chaos of the music industry to identify what truly resonates 
                  with audiences and has genuine export potential.
                </p>
              </Card>
              
              <Card className="p-8 hover:border-foreground/20 transition-colors">
                <h3 className="text-xl font-bold mb-4">Progression Over Virality</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Building lasting careers matters more than fleeting moments. We focus on 
                  sustainable artist development, not viral lottery tickets.
                </p>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default About;
