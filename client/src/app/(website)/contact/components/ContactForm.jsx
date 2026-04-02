"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { GlowingButton } from "../../../components/GlowingButtom";
import { FloatingElement } from "../../../components/AnimatedElements";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    console.log("Contact form submitted:", formData);
    toast.success("Thank you! We'll get back to you within 24 hours.");

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAF8F5] to-white relative">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-[#D4AF7A]/20 border border-[#D4AF7A]/20 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#FFD700]/30 via-[#E8DDD0]/50 to-[#E8C7C3]/30 p-8 relative overflow-hidden">
            <FloatingElement delay={1} duration={4}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FFD700]/40 to-transparent rounded-full blur-2xl" />
            </FloatingElement>
            
            <h2
              className="text-3xl text-[#2C2C2C] relative z-10"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Send Us a Message
            </h2>
            <p className="text-[#6B6B6B] mt-2 relative z-10">
              Fill out the form below and we'll get back to you shortly
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <label htmlFor="name" className="block text-[#2C2C2C] mb-2 font-medium">
                  Your Name *
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-[#F5F1ED] border border-[#D4AF7A]/20 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all shadow-sm hover:shadow-md"
                  placeholder="Enter your name"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <label htmlFor="email" className="block text-[#2C2C2C] mb-2 font-medium">
                  Your Email *
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-[#F5F1ED] border border-[#D4AF7A]/20 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all shadow-sm hover:shadow-md"
                  placeholder="your@email.com"
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <label htmlFor="subject" className="block text-[#2C2C2C] mb-2 font-medium">
                Subject *
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-[#F5F1ED] border border-[#D4AF7A]/20 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all shadow-sm hover:shadow-md"
                placeholder="What is this regarding?"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <label htmlFor="message" className="block text-[#2C2C2C] mb-2 font-medium">
                Your Message *
              </label>
              <motion.textarea
                whileFocus={{ scale: 1.02 }}
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-[#F5F1ED] border border-[#D4AF7A]/20 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all resize-none shadow-sm hover:shadow-md"
                placeholder="Tell us how we can help you..."
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="pt-4"
            >
              <GlowingButton type="submit" variant="primary" className="w-full">
                <Send className="w-5 h-5 inline mr-2" />
                Send Message
              </GlowingButton>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
