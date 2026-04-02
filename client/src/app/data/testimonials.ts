export interface Testimonial {
  id: number;
  name: string;
  rating: number;
  text: string;
  image: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Mitchell",
    rating: 5,
    text: "Shiny Skin transformed my skin completely! The HydraFacial was absolutely divine. My skin has never been this radiant. The staff is incredibly professional and caring.",
    image: "/images/testimonial1.jpg",
  },
  {
    id: 2,
    name: "Emily Rodriguez",
    rating: 5,
    text: "I've been coming here for laser treatments and the results are amazing. The clinic is beautiful and the team makes you feel so comfortable. Highly recommend!",
    image: "/images/testimonial2.jpg",
  },
  {
    id: 3,
    name: "Jessica Chen",
    rating: 5,
    text: "Best skincare clinic in town! The Luxury Gold Facial was an incredible experience. My skin glows for weeks after each visit. Can't imagine going anywhere else.",
    image: "/images/testimonial3.jpg",
  },
  {
    id: 4,
    name: "Amanda Foster",
    rating: 4,
    text: "The body contouring treatment exceeded my expectations. Professional staff, serene environment, and visible results. This place is a gem!",
    image: "/images/testimonial4.jpg",
  },
  {
    id: 5,
    name: "Rachel Thompson",
    rating: 5,
    text: "I had my first chemical peel here and was nervous, but the team was so reassuring. Results were fantastic — clearer, brighter skin in just one session.",
    image: "/images/testimonial5.jpg",
  },
];
