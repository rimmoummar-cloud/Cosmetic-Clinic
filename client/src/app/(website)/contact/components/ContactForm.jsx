"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { GlowingButton } from "../../../components/GlowingButtom";
import { FloatingElement } from "../../../components/AnimatedElements";
import api from "../../../../lib/api.js";

export default function ContactForm({ data = {} }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const title = data?.title || data?.heading || "";
  const description = data?.description || data?.summary || "";
  const buttonText = data?.buttonText || data?.ctaText || data?.cta || "Submit";
  const successMessage = data?.successMessage || data?.success || "Your message has been sent successfully!";
  const errorMessage = data?.errorMessage || data?.validationMessage || "something went wrong, please try again.";
  const placeholders = data?.placeholders || {"name": "Your Name", "email": "Your Email", "subject": "Subject", "message": "Your Message"};
  const labels = data?.labels || {"name": "Name", "email": "Email", "subject": "Subject", "message": "Message"};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name?.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.email?.trim()) {
      toast.error("Email is required");
      return;
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!formData.message?.trim()) {
      toast.error("Message is required");
      return;
    }

    // Submit to API
    setIsLoading(true);
    try {
      const response = await api.post("/boxConect", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      });

      // Show success message
      const successMsg = successMessage || "Your message has been sent successfully!";
      toast.success(successMsg);

      // Reset form
   setFormData(() => ({
  name: "",
  email: "",

  message: "",
}));
    } catch (error) {
      // Show error message from server or fallback
      const errorMsg =
        error.response?.data?.message ||
        errorMessage ||
        "Failed to send message. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
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
            
            {title && (
              <h2
                className="text-3xl text-[#2C2C2C] relative z-10"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="text-[#6B6B6B] mt-2 relative z-10">
                {description}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                {labels.name && (
                  <label htmlFor="name" className="block text-[#2C2C2C] mb-2 font-medium">
                    {labels.name}
                  </label>
                )}
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-[#F5F1ED] border border-[#D4AF7A]/20 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all shadow-sm hover:shadow-md"
                  placeholder={placeholders.name || ""}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                {labels.email && (
                  <label htmlFor="email" className="block text-[#2C2C2C] mb-2 font-medium">
                    {labels.email}
                  </label>
                )}
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-[#F5F1ED] border border-[#D4AF7A]/20 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all shadow-sm hover:shadow-md"
                  placeholder={placeholders.email || ""}
                />
              </motion.div>
            </div>

         

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {labels.message && (
                <label htmlFor="message" className="block text-[#2C2C2C] mb-2 font-medium">
                  {labels.message}
                </label>
              )}
              <motion.textarea
                whileFocus={{ scale: 1.02 }}
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-[#F5F1ED] border border-[#D4AF7A]/20 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all resize-none shadow-sm hover:shadow-md"
                  placeholder={placeholders.message || ""}
                />
              </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="pt-4"
            >
              {buttonText && (
                <GlowingButton 
                  type="submit" 
                  variant="primary" 
                  className="w-full"
                  disabled={isLoading}
                >
                  <Send className="w-5 h-5 inline mr-2" />
                  {isLoading ? "Sending..." : buttonText}
                </GlowingButton>
              )}
            </motion.div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}





  //  <motion.div
  //             initial={{ opacity: 0, y: 20 }}
  //             whileInView={{ opacity: 1, y: 0 }}
  //             viewport={{ once: true }}
  //           >
  //             {labels.subject && (
  //               <label htmlFor="subject" className="block text-[#2C2C2C] mb-2 font-medium">
  //                 {labels.subject}
  //               </label>
  //             )}
  //             <motion.input
  //               whileFocus={{ scale: 1.02 }}
  //               type="text"
  //                 id="subject"
  //                 name="subject"
  //                 value={formData.subject}
  //                 onChange={handleChange}
  //                 required
  //                 className="w-full px-4 py-3 rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-[#F5F1ED] border border-[#D4AF7A]/20 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all shadow-sm hover:shadow-md"
  //                 placeholder={placeholders.subject || ""}
  //               />
  //             </motion.div>