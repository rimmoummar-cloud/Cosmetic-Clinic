"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
void motion;
import { ImageFallBack } from "../../../components/EmageFullBack";
import { FloatingElement } from "../../../components/AnimatedElements";
import { SectionHeader } from "../../../components/sectionHeader";

export default function ServicesGrid({ categories, data }) {
  const [openCategory, setOpenCategory] = useState(null);
  
const [services, setServices] = useState([]);
const [loading, setLoading] = useState(false);

async function fetchServicesByCategory(id) {
  try {
    setLoading(true);

    const res = await fetch(
      `http://localhost:5000/api/services/samecategories/${id}`
    );

    const data = await res.json();

    setServices(data || []);
console.log("STATE AFTER SET:", services);
  } catch (error) {
    console.error("Fetch error:", error);
  } finally {
    setLoading(false);
  }
}

  const label = data?.label || data?.eyebrow;
  const title = data?.title || data?.heading;
  const description = data?.description || data?.subtitle;
  const showAllLabel = data?.ctaText || data?.ctaLabel || "Show All Services";

  return (
  
    <div className="w-full overflow-hidden">


      {/* Services Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#FAF8F5]">
        <div className="max-w-7xl mx-auto space-y-32">
          {(label || title || description) && (
            <div className="relative">
              <SectionHeader
                label={label}
                title={title}
                description={description}
              />
            </div>
          )}
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-12 relative">
              {/* Decorative glow */}
              <FloatingElement delay={categoryIndex} duration={5}>
                <div className={`absolute ${categoryIndex % 2 === 0 ? 'right-0' : 'left-0'} top-0 w-72 h-72 bg-gradient-to-br from-[#FFD700]/10 to-transparent rounded-full blur-3xl`} />
              </FloatingElement>
              
              {/* Category Header */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                <motion.div
                  initial={{ opacity: 0, x: categoryIndex % 2 === 1 ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={categoryIndex % 2 === 1 ? "lg:order-2" : ""}
                >
                  <h2
                    className="text-5xl md:text-6xl mb-6 text-[#2C2C2C]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {category.name}
                  
               
                  </h2>
                  <p className="text-xl text-[#6B6B6B] leading-relaxed">
                    {category.description}
                  </p>






                  <div className="mt-6 flex flex-col gap-3">
                    {/* <link
                    href={`/services/${category.id}`}
                    > */}
                    <button
                      type="button"
                      // onClick={() =>
                      //   setOpenCategory((prev) => (prev === category.id ? null : category.id))
                      // }
//                       onClick={() => {
//   if (openCategory === category.id) {
//     setOpenCategory(null);
//     return;
//   }
//  setServices([]);  
//   setOpenCategory(category.id);
//   fetchServicesByCategory(category.id);

// }}
                      className="inline-flex items-center gap-2 text-[#D4AF7A] hover:text-[#FFD700] transition-colors relative z-10 font-medium w-fit"
                    >
                      {/* Show All Services   */}

   <Link
                    href={`/services/${category.id}`}
                    >
<div>   {showAllLabel}  </div>
</Link>



                      {/* <motion.span
                        animate={{ rotate: openCategory === category.id ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="flex items-center justify-center"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </motion.span> */}
                    </button>
{/* </link> */}
 

                    {/* <motion.div
                      initial={false}
                      animate={{
                        height: openCategory === category.id ? "auto" : 0,
                        opacity: openCategory === category.id ? 1 : 0,
                        y: openCategory === category.id ? 0 : -10,
                      }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="overflow-hidden"
                    > */}


                      {/* ----------------------------------------- */}
                      {/* <div className="flex flex-col gap-2">
                        {services.map((service, serviceIndex) => (
                            <Link
                             href="/"
                              className="hover:text-[#D4AF7A] transition-colors"
                                  key={serviceIndex}>
              
           
                          <motion.span
                        
                            initial={{ opacity: 0, y: -4 }}
                            animate={{
                              opacity: openCategory === categoryIndex ? 1 : 0,
                              y: openCategory === categoryIndex ? 0 : -4,
                            }}
                            transition={{
                              duration: 0.3,
                              delay: openCategory === categoryIndex ? serviceIndex * 0.04 : 0,
                              ease: "easeInOut",
                            }}
                            className="inline-block text-[#6B6B6B] text-lg leading-relaxed font-normal antialiased transition-colors duration-300 hover:text-[#D4AF7A] hover:drop-shadow-sm w-fit border-b border-[#E8DDD0]/60 last:border-none sm:border-none py-1.5 sm:py-0"
                          >
                            {service.name}
                          </motion.span>
                             </Link>
                        ))}
                      </div> */}

{/* 

{openCategory === category.id && (
  <>
    {loading && (
      <p>Loading...</p>
    )}

    {services.length === 0 && !loading && (
      <p>No services</p>
    )}

    {services.map((service) => (
      <Link
        key={service.id}
       href={`/services/${category.id}`}
      >
        <div  className="text-[#6B6B6B] text-lg leading-relaxed font-normal antialiased transition-colors duration-300 hover:text-[#D4AF7A] hover:drop-shadow-sm w-fit border-b border-[#E8DDD0]/60 last:border-none sm:border-none py-1.5 sm:py-0"
                        
        >   
            {service.name}
        </div>
   
      </Link>
    ))}
  </>
)} */}

   {/* <link
                    href={`/services/${category.id}`}
                    >
<div>   Show All Services  </div>
</link> */}


                    {/* </motion.div> */}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: categoryIndex % 2 === 1 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={categoryIndex % 2 === 1 ? "lg:order-1" : ""}
                >
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#D4AF7A]/20 group">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                    >
                      <ImageFallBack
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-[400px] object-cover"
                      />
                    </motion.div>
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF7A]/30 to-transparent" />
                    
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{
                        x: ["-100%", "200%"],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                        delay: categoryIndex * 0.5,
                      }}
                    />
                  </div>
                </motion.div>
              </div>

            </div>
          ))}
        </div>
      </section>

    


    </div>

  );
}



