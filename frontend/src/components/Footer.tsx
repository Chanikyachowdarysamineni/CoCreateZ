import { Link } from "react-router-dom";
import { Zap, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    Product: [
      { name: "Features", href: "#features" },
      { name: "Dashboard", href: "/dashboard" },
      { name: "Pricing", href: "/pricing" },
      { name: "Security", href: "/security" }
    ],
    Company: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" }
    ],
    Resources: [
      { name: "Documentation", href: "/docs" },
      { name: "API", href: "/api" },
      { name: "Help Center", href: "/help" },
      { name: "Community", href: "/community" }
    ],
    Legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" }
    ]
  };

  const socialLinks = [
    { icon: Github, href: "https://github.com", label: "GitHub" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" }
  ];

  return (
    <footer className="bg-gradient-card border-t">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2 font-bold text-xl">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-primary rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                CollabSync
              </span>
            </Link>
            
            <p className="text-muted-foreground max-w-md">
              The ultimate real-time collaboration platform that synchronizes your team's 
              creative workflow and eliminates productivity friction.
            </p>
            
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-muted rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h3 className="font-semibold text-foreground">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2024 CollabSync. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/status" className="hover:text-primary transition-colors">
                Status
              </Link>
              <Link to="/changelog" className="hover:text-primary transition-colors">
                Changelog
              </Link>
              <span>Made with ❤️ for teams</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;