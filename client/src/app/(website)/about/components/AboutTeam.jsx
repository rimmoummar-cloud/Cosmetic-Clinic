"use client";
import { motion } from "framer-motion";
import { ImageFallBack } from "../../../components/EmageFullBack";
import { SectionHeader } from "../../../components/sectionHeader";

export default function AboutTeam({ data = {} }) {

  const team =
    (Array.isArray(data?.team) && data.team) ||
    (Array.isArray(data?.members) && data.members) ||
    (Array.isArray(data?.people) && data.people) ||
    [];

  const title = data?.title || data?.heading || "";
  const label = data?.label || data?.eyebrow || "";
  const description = data?.subtitle || data?.summary || "";

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          label={label}
          title={title}
          description={description}
        />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -12 }}
              className="group"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-[#D4AF7A]/10 hover:shadow-2xl hover:shadow-[#D4AF7A]/20 transition-all">
                {/* {member?.image && (
                  <ImageFallBack
                    src={member.image}
                    alt={member?.name || member?.role || ""}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )} */}
                {member?.image ? (
  <ImageFallBack
    src={member.image}
    alt={member?.name || member?.role || ""}
    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
  />
) : (
  <div className="w-full h-80 bg-gray-200 flex items-center justify-center text-gray-500">
    No Image
  </div>
)}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 
                    className="text-2xl mb-1"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {member?.name}
                  </h3>
                  <p className="text-[#FFD700]">{member?.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
