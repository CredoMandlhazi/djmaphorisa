import { Link } from "react-router-dom";
import { ArrowRight, Upload, Users, Mic2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HeroCarousel } from "@/components/HeroCarousel";
import { PageTransition } from "@/components/PageTransition";
import phoriLabLogo from "@/assets/phori-lab-logo.png";

const Home = () => {
  const howItWorksSteps = [
    {
      icon: Upload,
      title: "Submit Your Track",
      description: "Upload your unreleased music securely to the PHORI LAB platform.",
    },
    {
      icon: Users,
      title: "Curated Testing",
      description: "Your track enters controlled test pools with trusted tastemakers and listeners.",
    },
    {
      icon: Mic2,
      title: "Structured Feedback",
      description: "Receive detailed, actionable feedback from curators and industry professionals.",
    },
    {
      icon: CheckCircle,
      title: "Export Ready",
      description: "Progress through the pipeline to become export-ready for global distribution.",
    },
  ];

  const whoItsFor = [
    {
      title: "African Artists",
      description: "Emerging and established artists looking to test their music in real listening environments before release.",
    },
    {
      title: "Curators & Tastemakers",
      description: "Industry professionals who want to discover and shape the next wave of African music.",
    },
    {
      title: "Labels & Partners",
      description: "Record labels seeking pre-vetted, export-ready talent from Africa's vibrant music scene.",
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen pt-20">
        {/* Hero Section */}
        <section className="min-h-[90vh] flex items-center">
          <div className="studio-container w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left - Title */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="order-2 lg:order-1"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <img src={phoriLabLogo} alt="PHORI LAB" className="w-12 h-12 rounded-lg" />
                  <span className="text-muted-foreground uppercase tracking-[0.3em] text-sm">
                    Artist Development Platform
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="hero-title mb-8"
                >
                  PHORI<br />LAB
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="text-lg text-muted-foreground mb-10 max-w-md"
                >
                  A curated artist development and hit-testing platform. Test unreleased music in real listening environments, receive structured feedback, and progress through an export-readiness pipeline.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link to="/reviews">
                    <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 px-8">
                      <Upload className="mr-2" size={18} />
                      Submit Your Track
                    </Button>
                  </Link>
                  <Link to="/about">
                    <Button size="lg" variant="outline" className="px-8 border-foreground/20">
                      Learn More
                      <ArrowRight className="ml-2" size={18} />
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right - Carousel */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="order-1 lg:order-2"
              >
                <HeroCarousel />
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-card/50">
          <div className="studio-container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A structured pipeline that takes your music from submission to export-ready
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorksSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="p-8 bg-card rounded-xl border border-border hover:border-foreground/20 transition-all text-center"
                >
                  <div className="w-14 h-14 bg-foreground/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <step.icon size={24} className="text-foreground" />
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">Step {index + 1}</div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Curation & Trust Section */}
        <section className="py-24">
          <div className="studio-container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Curation Over<br />Algorithms
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    PHORI LAB is powered by DJ Maphorisa's curation network—a trusted ecosystem of tastemakers, 
                    DJs, and industry professionals who understand what makes music resonate.
                  </p>
                  <p>
                    Unlike algorithmic platforms that prioritize virality, we focus on quality, cultural fit, 
                    and export readiness. Every track is evaluated by real people who know the industry.
                  </p>
                  <p className="font-semibold text-foreground">
                    Signal over noise. Progression over virality.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-card rounded-2xl p-8 border border-border"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img src={phoriLabLogo} alt="PHORI LAB" className="w-16 h-16 rounded-xl" />
                  <div>
                    <h3 className="text-xl font-bold">DJ Maphorisa</h3>
                    <p className="text-sm text-muted-foreground">Super Curator</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "PHORI LAB is about creating a proper pipeline for African artists. We test music in real 
                  environments, give structured feedback, and help artists become truly export-ready. 
                  This isn't about luck—it's about development."
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Who It's For Section */}
        <section className="py-24 bg-card/50">
          <div className="studio-container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Who It's For</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                PHORI LAB serves everyone in the African music ecosystem
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {whoItsFor.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="p-8 bg-card rounded-xl border border-border hover:border-foreground/20 transition-all"
                >
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="studio-container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Ready to Test<br />Your Music?
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Join PHORI LAB and take the first step toward becoming export-ready
              </p>
              <Link to="/reviews">
                <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 px-10">
                  Get Started
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default Home;
