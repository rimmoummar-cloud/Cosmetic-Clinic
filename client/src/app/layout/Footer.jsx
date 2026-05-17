"use client"

import { Sparkles, Instagram, Facebook, Twitter } from "lucide-react";
import { motion } from  "framer-motion";
void motion;
export function Footer() {


  const socialLinks = [
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "Facebook", icon: Facebook, href: "#" },
    { name: "Twitter", icon: Twitter, href: "#" },
  ];

  return (
    <footer className="bg-gradient-to-b from-white to-[#FAF8F5] border-t border-[#D4AF7A]/20 mt-20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#FFD700]/10 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#E8C7C3]/20 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-1 md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 bg-gradient-to-br from-[#FFD700] via-[#D4AF7A] to-[#C9A66B] rounded-2xl flex items-center justify-center shadow-lg shadow-[#D4AF7A]/30"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <div className="text-lg" style={{ fontFamily: 'var(--font-serif)' }}>
                  <span className="font-semibold bg-gradient-to-r from-[#D4AF7A] to-[#C9A66B] bg-clip-text text-transparent">
                    Shiny Skin
                  </span>
                </div>
                <div className="text-xs text-[#6B6B6B] -mt-1">Aesthetic & Beauty Clinic</div>
              </div>
            </div>
            <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-md mb-6">
              Your trusted partner in beauty and aesthetic treatments. We combine luxury with professional care to help you look and feel your best.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-gradient-to-br from-[#FFD700]/20 to-[#D4AF7A]/20 rounded-xl flex items-center justify-center text-[#D4AF7A] hover:from-[#FFD700]/30 hover:to-[#D4AF7A]/30 transition-all shadow-md hover:shadow-lg"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-sm font-medium text-[#2C2C2C] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
          Working Hours :
            </h4>

  <div className="flex flex-col gap-2 text-sm text-[#6B6B6B]">
              <p> Mon-Fri: 9am-8pm</p>
              <p>Sat-Sun: 10am-6pm</p>
              <p className="mt-2 text-[#D4AF7A]">exapte sun day</p>
              <p className="text-[#D4AF7A]"></p>
            </div>


            {/* <div className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-sm text-[#6B6B6B] hover:text-[#D4AF7A] transition-colors hover:translate-x-1 inline-block"
                >
                  {item.name}
                </Link>
              ))}
            </div> */}
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-sm font-medium text-[#2C2C2C] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              Contact
            </h4>
            <div className="flex flex-col gap-2 text-sm text-[#6B6B6B]">
              <p>123 Beauty Lane</p>
              <p>New York, NY 10001</p>
              <p className="mt-2 text-[#D4AF7A]">hello@shinyskin.com</p>
              <p className="text-[#D4AF7A]">(555) 123-4567</p>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 pt-8 border-t border-[#D4AF7A]/20 text-center"
        >
          <p className="text-sm text-[#6B6B6B]">
            © 2026 Shiny Skin Aesthetic & Beauty Clinic. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
