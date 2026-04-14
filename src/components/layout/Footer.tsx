import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PasswordModal } from "@/components/PasswordModal";

// Social media links
const socialLinks = [
  { name: "TikTok", href: "https://www.tiktok.com/@djmaphorisa", icon: "tiktok" },
  { name: "Instagram", href: "https://www.instagram.com/djmaphorisa/", icon: "instagram" },
  { name: "X", href: "https://x.com/DjMaphorisa", icon: "x" },
];

const siteLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Submit", path: "/reviews" },
  { name: "Contact", path: "/contact" },
];

// Social Icon Component
const SocialIcon = ({ icon }: { icon: string }) => {
  if (icon === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    );
  }
  if (icon === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    );
  }
  if (icon === "x") {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  }
  return null;
};

export const Footer = () => {
  const navigate = useNavigate();
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleLogoClick = () => {
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    
    if (newCount >= 3) {
      setShowPasswordModal(true);
      setLogoClickCount(0);
    }
    
    // Reset count after 2 seconds of no clicks
    setTimeout(() => {
      setLogoClickCount(0);
    }, 2000);
  };

  const handlePasswordSuccess = () => {
    setShowPasswordModal(false);
    navigate("/indian-hill");
  };

  return (
    <>
      <PasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordSuccess}
      />
      <footer className="bg-card border-t border-border">
        <div className="studio-container py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <motion.button
                onClick={handleLogoClick}
                className="inline-block mb-4 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <h3 className="text-lg font-bold">PHORI LAB</h3>
              </motion.button>
              <p className="text-muted-foreground text-sm leading-relaxed">
                A curated artist development and hit-testing platform powered by DJ Maphorisa's curation network.
              </p>
            </div>

            {/* Site Links */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Navigate</h4>
              <div className="space-y-3">
                {siteLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Platform Info */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Platform</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Track Submission</p>
                <p>Test Pools</p>
                <p>Structured Feedback</p>
                <p>Export Pipeline</p>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Connect</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <span className="text-foreground">Business:</span>
                  <br />
                  <a href="mailto:info@phorilab.com" className="hover:text-foreground transition-colors">
                    info@phorilab.com
                  </a>
                </p>
                <p>
                  <span className="text-foreground">Location:</span>
                  <br />
                  Johannesburg, South Africa
                </p>
              </div>

              {/* Social Links */}
              <div className="flex gap-4 mt-6">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    title={social.name}
                  >
                    <SocialIcon icon={social.icon} />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>All Rights Reserved © {new Date().getFullYear()} PHORI LAB</p>
            <p className="text-center">Curation over algorithms. Signal over noise. Progression over virality.</p>
          </div>
        </div>
      </footer>
    </>
  );
};
