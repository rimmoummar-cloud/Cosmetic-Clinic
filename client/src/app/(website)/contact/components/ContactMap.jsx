
import { motion } from "framer-motion";
import { getMediaUrl } from "../../../../lib/mediaUrl";
export default function ContactMap({ data = {} }) {
  const title = data?.title || data?.heading || "";
  const description = data?.description || data?.summary || "";

  // 🔥 استخدمنا رابط نظيف (مش pb)
  const mapLink =
    data?.mapLink ||
   "https://www.google.com/maps/search/?api=1&query=3860%20Boulevard%20Notre-Dame%2C%20Laval%2C%20QC%20H7V%202V7%2C%20Canada";

  const embedUrl =
    data?.embedUrl ||
  "https://www.google.com/maps?q=3860+Boulevard+Notre-Dame%2C+Laval%2C+QC+H7V+2V7%2C+Canada&output=embed";

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="rounded-3xl overflow-hidden shadow-xl h-96 relative group"
        >

          {/* 🔥 CLICKABLE OVERLAY (هذا أهم شي) */}
          <a
            href={mapLink}
            target="_blank"
            className="absolute inset-0 z-20"
          />

          {/* MAP */}
          <iframe
          
                src={getMediaUrl(embedUrl)}
            className="w-full h-full border-0"
            loading="lazy"
          />

          {/* INFO */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-white/80 backdrop-blur flex justify-between items-center">
            <div>
              {title && (
                <h3 className="text-lg font-semibold">{title}</h3>
              )}
              {description && (
                <p className="text-sm text-gray-600">{description}</p>
              )}
            </div>

            <span className="text-xs text-gray-500">
              Click anywhere to open Maps →
            </span>
          </div>

        </motion.div>

      </div>
    </section>
  );
}