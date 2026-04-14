import { Mail, MapPin, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/PageTransition";
import { toast } from "sonner";

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
  };

  const contactInfo = [
    { icon: Mail, label: "Email", value: "info@phorilab.com", href: "mailto:info@phorilab.com" },
    { icon: MessageSquare, label: "Business Inquiries", value: "partnerships@phorilab.com", href: "mailto:partnerships@phorilab.com" },
    { icon: MapPin, label: "Location", value: "Johannesburg, South Africa", href: null },
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
            className="mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">Contact</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Interested in PHORI LAB? Get in touch with our team.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your name" className="mt-2" required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="your@email.com" className="mt-2" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="What's this about?" className="mt-2" required />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Tell us about your interest in PHORI LAB..." className="mt-2 min-h-[180px]" required />
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    <Mail className="mr-2" size={20} />
                    Send Message
                  </Button>
                </form>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-2 space-y-4"
            >
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              {contactInfo.map((info, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center border border-border">
                      <info.icon size={18} className="text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{info.label}</div>
                      {info.href ? (
                        <a href={info.href} className="font-medium hover:text-muted-foreground transition-colors">
                          {info.value}
                        </a>
                      ) : (
                        <div className="font-medium">{info.value}</div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {/* Additional Info */}
              <Card className="p-6 mt-8">
                <h3 className="font-bold mb-3">For Artists</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ready to submit your track? Head to the Submit page to upload your music 
                  and join the PHORI LAB pipeline.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold mb-3">For Labels & Partners</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Interested in partnering with PHORI LAB? Contact us for partnership 
                  opportunities and early access to export-ready talent.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Contact;
