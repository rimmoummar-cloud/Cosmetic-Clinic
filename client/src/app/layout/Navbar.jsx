"use client"
// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {BookingForm} from "../../app/feutures/booking/BookingForm";
void motion;

export default function Navbar() {
  // for the buttom
  const [openBooking, setOpenBooking] = useState(false);
  const location = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "home", path: "/" },
    { name: "services", path: "/services" },
 
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  // const isActive = (path) => {
  //   if (path === "/") {
  //     return location.pathname === "/";
  //   }
  //   return location.pathname.startsWith(path);
  // };



const isActive = (path) => {
  if (!location) return false;
  return path === "/" ? location === "/" : location.startsWith(path);
};


const [isScrolled, setIsScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 50);
  };

  window.addEventListener("scroll", handleScroll);

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);
  
  return (
    <>
    {/* the booking form */}
<BookingForm 
  isOpen={openBooking} 
  onClose={() => setOpenBooking(false)} 
/>
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
     className={`sticky top-0 z-50 transition-all duration-300 ${
  isScrolled
    ? "bg-white/80 backdrop-blur-xl border-b border-[#D4AF7A]/20 shadow-lg shadow-[#D4AF7A]/5"
    : "bg-transparent"
}`}  >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="w-12 h-12 bg-gradient-to-br from-[#FFD700] via-[#D4AF7A] to-[#C9A66B] rounded-2xl flex items-center justify-center shadow-lg shadow-[#D4AF7A]/40 group-hover:shadow-xl group-hover:shadow-[#D4AF7A]/60 transition-shadow relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-2xl" />
              <Sparkles className="w-6 h-6 text-white relative z-10" />
            </motion.div>
            <div>
              <div className="text-xl" style={{ fontFamily: 'var(--font-serif)' }}>
                <span className="font-semibold bg-gradient-to-r from-[#D4AF7A] to-[#C9A66B] bg-clip-text text-transparent">
                  Shiny Skin
                </span>
              </div>
              <div className="text-xs text-[#6B6B6B] -mt-1">Aesthetic & Beauty Clinic</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="relative"
              >
                <motion.span
                  whileHover={{ y: -2 }}
                  className={`text-sm transition-colors ${
                    isActive(item.path)
                      ? "text-[#D4AF7A]"
                      : "text-[#2C2C2C] hover:text-[#D4AF7A]"
                  }`}
                >
                  {item.name}
                </motion.span>
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FFD700] via-[#D4AF7A] to-[#C9A66B]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          
          <div className="hidden md:block">
            {/* <Link to="/booking"> */}
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(212, 175, 122, 0.6)" }}
                whileTap={{ scale: 0.95 }}
             onClick={() => setOpenBooking(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#FFD700] via-[#D4AF7A] to-[#C9A66B] text-white rounded-full font-medium shadow-lg shadow-[#D4AF7A]/40 hover:shadow-xl relative overflow-hidden group"
              >
                <span className="relative z-10">Book Now</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#C9A66B] to-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                />
              </motion.button>
            {/* </Link> */}
          </div>



          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#2C2C2C] hover:bg-[#D4AF7A]/10 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden border-t border-[#D4AF7A]/10"
            >
              <div className="flex flex-col gap-2 py-4">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-3 px-4 rounded-xl transition-all ${
                        isActive(item.path)
                          ? "bg-gradient-to-r from-[#FFD700]/20 to-[#D4AF7A]/20 text-[#D4AF7A] shadow-md"
                          : "text-[#2C2C2C] hover:bg-[#D4AF7A]/10"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                {/* <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navigation.length * 0.1 }}
                >
                  <Link
                    // to="/"
                    onClick={() =>{ setMobileMenuOpen(false);
                       setOpenBooking(true)
                    }}
                    className="block px-6 py-3 mt-2 bg-gradient-to-r from-[#FFD700] via-[#D4AF7A] to-[#C9A66B] text-white rounded-full text-center shadow-lg"
                  >
                    Book Now
                  </Link>
                </motion.div> */}


   <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(212, 175, 122, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>{ setMobileMenuOpen(false);
                       setOpenBooking(true)
                    }}
                className="px-6 py-3 bg-gradient-to-r from-[#FFD700] via-[#D4AF7A] to-[#C9A66B] text-white rounded-full font-medium shadow-lg shadow-[#D4AF7A]/40 hover:shadow-xl relative overflow-hidden group"
              >
                <span className="relative z-10">Book Now</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#C9A66B] to-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                />
              </motion.button>








              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
    </>
  );
}
