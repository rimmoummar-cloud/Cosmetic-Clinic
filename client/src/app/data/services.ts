export interface Service {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  description: string;
  shortDescription: string;
  duration: string;
  price: number;
  image: string;
  whatToExpect: string[];
  beforeInstructions: string[];
  afterInstructions: string[];
  recommendedFrequency: string;
  recoveryTime: string;
  faqs: { question: string; answer: string }[];
  reviews: { name: string; rating: number; text: string; date: string }[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  image: string;
}

export const categories: Category[] = [
  {
    id: "facial-treatments",
    name: "Facial Treatments",
    icon: "✨",
    description: "Rejuvenate your skin with our premium facial treatments designed to restore your natural glow.",
    image: "/images/facial.jpg",
  },
  {
    id: "laser-treatments",
    name: "Laser Treatments",
    icon: "💫",
    description: "Advanced laser technology for skin resurfacing, pigmentation, and rejuvenation.",
    image: "/images/laser.jpg",
  },
  {
    id: "skin-care",
    name: "Skin Care",
    icon: "🌸",
    description: "Customized skincare solutions for every skin type and concern.",
    image: "/images/skincare.jpg",
  },
  {
    id: "body-treatments",
    name: "Body Treatments",
    icon: "💆",
    description: "Luxurious body treatments for toning, firming, and relaxation.",
    image: "/images/body.jpg",
  },
  {
    id: "hair-removal",
    name: "Hair Removal",
    icon: "🌟",
    description: "Gentle and effective hair removal solutions for smooth, lasting results.",
    image: "/images/hair.jpg",
  },
];

export const services: Service[] = [
  // Facial Treatments
  {
    id: "hydrafacial",
    name: "HydraFacial",
    category: "Facial Treatments",
    categoryId: "facial-treatments",
    description: "A revolutionary facial treatment that cleanses, exfoliates, extracts, and hydrates your skin. Using patented Vortex-Fusion technology, this treatment delivers immediate results with no downtime. Perfect for all skin types, the HydraFacial addresses fine lines, wrinkles, congested pores, and uneven skin tone.",
    shortDescription: "Deep cleansing and hydrating facial with instant results.",
    duration: "60 min",
    price: 250,
    image: "/images/hydrafacial.jpg",
    whatToExpect: [
      "Skin analysis and consultation",
      "Deep cleansing and exfoliation",
      "Gentle acid peel application",
      "Painless extraction of impurities",
      "Hydrating serum infusion",
      "LED light therapy",
      "Moisturizer and SPF application"
    ],
    beforeInstructions: [
      "Avoid sun exposure 48 hours before",
      "Do not use retinol products 3 days prior",
      "Come with clean, makeup-free skin",
      "Stay hydrated"
    ],
    afterInstructions: [
      "Avoid sun exposure for 24 hours",
      "Do not apply makeup for 6 hours",
      "Use gentle cleanser for 48 hours",
      "Apply SPF 30+ daily",
      "Avoid hot water on face for 24 hours"
    ],
    recommendedFrequency: "Every 4 weeks",
    recoveryTime: "No downtime",
    faqs: [
      { question: "Is HydraFacial painful?", answer: "No, HydraFacial is a gentle, non-invasive treatment. Most clients find it relaxing and comfortable." },
      { question: "How long do results last?", answer: "Results are immediate and can last 5-7 days. Regular treatments provide cumulative benefits." },
      { question: "Can I wear makeup after?", answer: "We recommend waiting at least 6 hours before applying makeup to allow your skin to absorb the serums." }
    ],
    reviews: [
      { name: "Sarah M.", rating: 5, text: "My skin has never looked better! The HydraFacial gave me an instant glow.", date: "2024-01-15" },
      { name: "Emily R.", rating: 5, text: "Love this treatment! It's become part of my monthly skincare routine.", date: "2024-02-20" },
      { name: "Jessica L.", rating: 4, text: "Great results, very relaxing experience. Will definitely come back!", date: "2024-03-10" }
    ]
  },
  {
    id: "chemical-peel",
    name: "Chemical Peel",
    category: "Facial Treatments",
    categoryId: "facial-treatments",
    description: "Our medical-grade chemical peels remove damaged outer layers of skin, revealing smoother, more youthful skin beneath. Customized to your skin type and concerns, our peels target pigmentation, acne scars, fine lines, and uneven texture.",
    shortDescription: "Medical-grade peel for skin renewal and brightness.",
    duration: "45 min",
    price: 180,
    image: "/images/chemical-peel.jpg",
    whatToExpect: ["Skin assessment", "Cleansing preparation", "Peel application", "Neutralization", "Soothing mask", "Post-care instructions"],
    beforeInstructions: ["Avoid retinol for 1 week", "No waxing for 2 weeks prior", "Avoid sun exposure"],
    afterInstructions: ["Apply healing balm as directed", "No sun exposure for 1 week", "Do not peel or pick skin", "Use SPF 50+"],
    recommendedFrequency: "Every 4-6 weeks",
    recoveryTime: "3-7 days",
    faqs: [
      { question: "Will my skin peel?", answer: "Yes, mild to moderate peeling is expected 2-4 days after treatment, depending on the peel depth." },
      { question: "How many sessions do I need?", answer: "A series of 3-6 peels spaced 4-6 weeks apart is recommended for optimal results." }
    ],
    reviews: [
      { name: "Anna K.", rating: 5, text: "The chemical peel transformed my skin. Dark spots are nearly gone!", date: "2024-02-10" },
      { name: "Maria S.", rating: 4, text: "Noticeable improvement in my skin texture after just two sessions.", date: "2024-03-05" }
    ]
  },
  {
    id: "microneedling",
    name: "Microneedling",
    category: "Facial Treatments",
    categoryId: "facial-treatments",
    description: "Stimulate your skin's natural healing process with microneedling. Tiny needles create controlled micro-injuries that boost collagen and elastin production, improving scars, wrinkles, and overall skin texture.",
    shortDescription: "Collagen-boosting treatment for smoother, firmer skin.",
    duration: "75 min",
    price: 300,
    image: "/images/microneedling.jpg",
    whatToExpect: ["Numbing cream application", "Microneedling treatment", "Hyaluronic acid application", "Soothing mask", "Post-care routine"],
    beforeInstructions: ["No blood thinners 1 week before", "Avoid alcohol 24 hours prior", "No active breakouts"],
    afterInstructions: ["Avoid sun for 1 week", "No makeup for 24 hours", "Use gentle products only", "Stay hydrated"],
    recommendedFrequency: "Every 4-6 weeks",
    recoveryTime: "2-3 days",
    faqs: [
      { question: "Is microneedling painful?", answer: "A numbing cream is applied before treatment, making it very comfortable." },
      { question: "When will I see results?", answer: "Initial improvement is visible in 1-2 weeks, with full results after a series of treatments." }
    ],
    reviews: [
      { name: "Rachel T.", rating: 5, text: "My acne scars have significantly faded. Amazing treatment!", date: "2024-01-20" }
    ]
  },
  // Laser Treatments
  {
    id: "laser-skin-resurfacing",
    name: "Laser Skin Resurfacing",
    category: "Laser Treatments",
    categoryId: "laser-treatments",
    description: "Our state-of-the-art fractional CO2 laser treatment addresses deep wrinkles, scars, and sun damage by creating thousands of microscopic treatment zones that stimulate rapid healing and new collagen formation.",
    shortDescription: "Advanced laser for deep skin renewal and scar reduction.",
    duration: "90 min",
    price: 500,
    image: "/images/laser-resurfacing.jpg",
    whatToExpect: ["Consultation and photos", "Numbing cream application", "Laser treatment", "Cooling and soothing", "Post-treatment care"],
    beforeInstructions: ["No sun exposure 2 weeks before", "Stop retinol 1 week prior", "Inform us of medications"],
    afterInstructions: ["Ice as needed", "Apply healing ointment", "Avoid sun for 2 weeks", "No strenuous activity for 48 hours"],
    recommendedFrequency: "Every 3-6 months",
    recoveryTime: "5-7 days",
    faqs: [
      { question: "How many treatments do I need?", answer: "Most patients see significant results after 1-3 treatments." },
      { question: "Is there downtime?", answer: "Expect 5-7 days of redness and peeling. Most clients take a week off from social activities." }
    ],
    reviews: [
      { name: "Diana P.", rating: 5, text: "Worth every penny! My skin looks 10 years younger.", date: "2024-02-25" }
    ]
  },
  {
    id: "ipl-photofacial",
    name: "IPL Photofacial",
    category: "Laser Treatments",
    categoryId: "laser-treatments",
    description: "Intense Pulsed Light therapy targets sun damage, age spots, rosacea, and broken capillaries, leaving your skin clearer and more even-toned.",
    shortDescription: "Light therapy for sun damage and even skin tone.",
    duration: "45 min",
    price: 350,
    image: "/images/ipl.jpg",
    whatToExpect: ["Skin consultation", "Protective eyewear", "Cooling gel application", "IPL treatment", "Soothing cream"],
    beforeInstructions: ["No tanning for 4 weeks", "Avoid self-tanners", "No aspirin for 1 week"],
    afterInstructions: ["Use SPF 50+", "Avoid heat for 48 hours", "Dark spots may darken before fading"],
    recommendedFrequency: "Every 4 weeks (3-5 sessions)",
    recoveryTime: "1-3 days",
    faqs: [
      { question: "Does IPL hurt?", answer: "Most describe it as a mild snapping sensation. It's very tolerable." }
    ],
    reviews: [
      { name: "Lisa W.", rating: 5, text: "My sun spots are almost completely gone after 3 sessions!", date: "2024-03-15" }
    ]
  },
  // Skin Care
  {
    id: "luxury-facial",
    name: "Luxury Gold Facial",
    category: "Skin Care",
    categoryId: "skin-care",
    description: "Indulge in our signature luxury facial featuring 24-karat gold-infused products. This premium treatment deeply nourishes, firms, and brightens the skin while providing ultimate relaxation.",
    shortDescription: "Premium 24K gold facial for ultimate skin nourishment.",
    duration: "90 min",
    price: 400,
    image: "/images/gold-facial.jpg",
    whatToExpect: ["Deep cleansing", "Gold mask application", "Facial massage", "LED therapy", "Gold serum infusion", "Moisturizing finish"],
    beforeInstructions: ["Come makeup-free", "Avoid exfoliation 48 hours before"],
    afterInstructions: ["Let serums absorb for 4 hours", "Avoid washing face for 6 hours", "Apply SPF next morning"],
    recommendedFrequency: "Monthly",
    recoveryTime: "No downtime",
    faqs: [
      { question: "Is gold safe for skin?", answer: "Yes! Gold has been used in skincare for centuries. It has anti-inflammatory and antioxidant properties." }
    ],
    reviews: [
      { name: "Victoria B.", rating: 5, text: "The most luxurious facial I've ever had. My skin was glowing for days!", date: "2024-01-30" }
    ]
  },
  {
    id: "acne-treatment",
    name: "Advanced Acne Treatment",
    category: "Skin Care",
    categoryId: "skin-care",
    description: "Comprehensive acne treatment combining extraction, blue light therapy, and medical-grade products to clear breakouts and prevent future ones.",
    shortDescription: "Clinical-grade acne clearing treatment.",
    duration: "60 min",
    price: 200,
    image: "/images/acne.jpg",
    whatToExpect: ["Skin analysis", "Deep cleansing", "Extractions", "Blue LED therapy", "Healing mask", "Product recommendations"],
    beforeInstructions: ["Stop acne medication 3 days before", "No picking at skin"],
    afterInstructions: ["Use prescribed products only", "Avoid makeup for 12 hours", "Do not touch treated areas"],
    recommendedFrequency: "Every 2-3 weeks initially",
    recoveryTime: "1-2 days",
    faqs: [
      { question: "Will my acne get worse before better?", answer: "Some initial purging may occur as impurities are drawn out, but this subsides quickly." }
    ],
    reviews: [
      { name: "Sophie A.", rating: 5, text: "Finally clear skin! This treatment changed my life.", date: "2024-02-14" }
    ]
  },
  // Body Treatments
  {
    id: "body-contouring",
    name: "Body Contouring",
    category: "Body Treatments",
    categoryId: "body-treatments",
    description: "Non-invasive body contouring using advanced radiofrequency technology to reduce stubborn fat pockets, tighten skin, and sculpt your body without surgery.",
    shortDescription: "Non-surgical body sculpting and skin tightening.",
    duration: "60 min",
    price: 450,
    image: "/images/body-contouring.jpg",
    whatToExpect: ["Body assessment", "Treatment area marking", "RF energy application", "Cooling technology", "Lymphatic massage"],
    beforeInstructions: ["Drink plenty of water", "Avoid alcohol 24 hours before", "Wear comfortable clothing"],
    afterInstructions: ["Drink 2L water daily", "Maintain healthy diet", "Exercise regularly", "Avoid alcohol for 48 hours"],
    recommendedFrequency: "Weekly for 6-8 sessions",
    recoveryTime: "No downtime",
    faqs: [
      { question: "How many sessions needed?", answer: "Typically 6-8 sessions for optimal results, with visible improvements after 3 sessions." }
    ],
    reviews: [
      { name: "Kate M.", rating: 4, text: "Great non-invasive alternative to liposuction. Results are gradual but real.", date: "2024-03-01" }
    ]
  },
  {
    id: "cellulite-treatment",
    name: "Cellulite Reduction",
    category: "Body Treatments",
    categoryId: "body-treatments",
    description: "Advanced cellulite treatment combining mechanical massage, infrared light, and radiofrequency to smooth dimpled skin and improve overall skin texture.",
    shortDescription: "Smooth and firm skin with anti-cellulite therapy.",
    duration: "45 min",
    price: 300,
    image: "/images/cellulite.jpg",
    whatToExpect: ["Assessment", "Mechanical massage", "Infrared therapy", "RF treatment", "Moisturizing"],
    beforeInstructions: ["Exfoliate treatment area", "Stay hydrated", "No caffeine 4 hours before"],
    afterInstructions: ["Apply firming cream daily", "Dry brushing recommended", "Stay active"],
    recommendedFrequency: "Twice weekly for 4-6 weeks",
    recoveryTime: "No downtime",
    faqs: [
      { question: "Are results permanent?", answer: "Results can last with maintenance sessions and a healthy lifestyle." }
    ],
    reviews: [
      { name: "Laura G.", rating: 4, text: "Noticeable improvement in my thigh area after 5 sessions. Very happy!", date: "2024-02-28" }
    ]
  },
  // Hair Removal
  {
    id: "laser-hair-removal",
    name: "Laser Hair Removal",
    category: "Hair Removal",
    categoryId: "hair-removal",
    description: "Permanent hair reduction using advanced diode laser technology. Safe for all skin tones, our laser targets hair follicles precisely for smooth, long-lasting results.",
    shortDescription: "Permanent hair reduction with advanced laser technology.",
    duration: "30-60 min",
    price: 200,
    image: "/images/laser-hair.jpg",
    whatToExpect: ["Skin assessment", "Test patch if needed", "Cooling gel application", "Laser treatment", "Soothing cream"],
    beforeInstructions: ["Shave treatment area 24 hours before", "No waxing for 4 weeks", "No sun exposure for 2 weeks", "No self-tanners"],
    afterInstructions: ["Apply aloe vera gel", "Avoid sun exposure", "No hot baths for 24 hours", "Exfoliate gently after 1 week"],
    recommendedFrequency: "Every 4-6 weeks (6-8 sessions)",
    recoveryTime: "Minimal",
    faqs: [
      { question: "Is it painful?", answer: "Most describe it as a mild rubber band snap. Our cooling system makes it very comfortable." },
      { question: "How many sessions needed?", answer: "6-8 sessions are typically needed for permanent reduction, as hair grows in cycles." }
    ],
    reviews: [
      { name: "Nina H.", rating: 5, text: "After 6 sessions, I'm practically hair-free. Best investment ever!", date: "2024-02-05" }
    ]
  },
  {
    id: "waxing",
    name: "Full Body Waxing",
    category: "Hair Removal",
    categoryId: "hair-removal",
    description: "Professional waxing services using premium, gentle wax formulas that minimize discomfort while delivering smooth, hair-free skin that lasts for weeks.",
    shortDescription: "Gentle, professional waxing for silky smooth skin.",
    duration: "60-90 min",
    price: 150,
    image: "/images/waxing.jpg",
    whatToExpect: ["Skin preparation", "Pre-wax oil application", "Professional waxing", "Soothing lotion", "Aftercare advice"],
    beforeInstructions: ["Hair should be 1/4 inch long", "Exfoliate 24 hours before", "No moisturizer on treatment day"],
    afterInstructions: ["Avoid hot water for 24 hours", "No tight clothing", "Exfoliate after 3 days", "Moisturize daily"],
    recommendedFrequency: "Every 4-6 weeks",
    recoveryTime: "Minimal redness for a few hours",
    faqs: [
      { question: "How long should hair be?", answer: "Hair should be at least 1/4 inch (about 2 weeks of growth) for best results." }
    ],
    reviews: [
      { name: "Amanda C.", rating: 5, text: "Best waxing experience ever. Very gentle and thorough!", date: "2024-03-12" }
    ]
  }
];
