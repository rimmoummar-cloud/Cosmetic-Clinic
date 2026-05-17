// mkc.js
// Seed initial CMS content for pages, sections, and section_content.
// Usage: node mkc.js
// Note: Only CMS tables are touched (pages, sections, section_content).
// Business tables (categories, services, service_details, bookings, users) remain untouched.

import db from './config/db.js';
import { randomUUID } from 'crypto';

// Define initial CMS structure and static content
const pagesData = [
  {
    name: 'Home',
    slug: 'home',
    description: 'Landing page',
    sections: [
      {
        name: 'hero',
        slug: 'hero',
        order: 1,
        content: {
          title: 'Reveal Your Natural Glow',
          subtitle: 'Premium Aesthetic & Wellness Care',
          description:
            'Luxury treatments, medical expertise, and personalized plans that help you look and feel your best.',
          buttonText: 'Book a visit',
          buttonLink: '/booking',
          image:
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
        },
      },
      {
        // Static labels only; services remain dynamic via API
        name: 'services_heading',
        slug: 'services-heading',
        order: 2,
        content: {
          eyebrow: 'Services',
          title: 'Tailored treatments crafted for you',
          description:
            'Explore our curated menu of facials, injectables, laser, and body services delivered by experts.',
          ctaText: 'View all services',
          ctaLink: '/services',
        },
      },
      {
        name: 'benefits',
        slug: 'benefits',
        order: 3,
        content: {
          eyebrow: 'Why Choose Us',
          title: 'Your Beauty, Our Priority',
          description:
            'At Shiny Skin, we combine expertise with luxury to deliver exceptional results. Every treatment is personalized to your unique needs.',
          items: [
            'Licensed & Certified Professionals',
            'Premium Quality Products',
            'Personalized Treatment Plans',
            'Relaxing Atmosphere',
            'Latest Technology & Techniques',
            'Aftercare Support',
          ],
          image:
            'https://images.unsplash.com/photo-1731514693674-a32211b63996?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        },
      },
      {
        name: 'testimonials',
        slug: 'testimonials',
        order: 4,
        content: {
          title: 'What our clients say',
          subtitle: 'Real stories, real results',
          items: [
            {
              quote:
                'I finally feel confident in my skin. The team is warm, skilled, and honest about what works.',
              author: 'Layla M.',
              role: 'Skin rejuvenation',
            },
            {
              quote:
                'Beautiful clinic, attentive staff, and results that look natural. Highly recommend.',
              author: 'Sara K.',
              role: 'Lip enhancement',
            },
          ],
        },
      },
      {
        name: 'cta',
        slug: 'cta',
        order: 5,
        content: {
          title: 'Ready for your glow-up?',
          description: 'Schedule a consultation and design your personalized treatment plan.',
          buttonText: 'Schedule now',
          buttonLink: '/booking',
        },
      },
    ],
  },
  {
    name: 'About',
    slug: 'about',
    description: 'About the clinic',
    sections: [
      {
        name: 'hero',
        slug: 'about-hero',
        order: 1,
        content: {
          title: 'Science-led beauty with a human touch',
          subtitle: 'Meet the team behind your glow',
          image:
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
        },
      },
      {
        name: 'story',
        slug: 'story',
        order: 2,
        content: {
          title: 'Our story',
          paragraphs: [
            'Founded by board-certified clinicians, our clinic blends medical rigor with luxurious care.',
            'We believe in honest guidance, subtle results, and safety-first protocols for every guest.',
          ],
        },
      },
      {
        name: 'team',
        slug: 'team',
        order: 3,
        content: {
          title: 'The experts behind your results',
          subtitle: 'A multidisciplinary team of doctors, nurses, and skincare specialists.',
          members: [
            { name: 'Dr. Maya Haddad', role: 'Medical Director', bio: 'Dermatology & aesthetics.' },
            { name: 'Nour Kassem, RN', role: 'Aesthetic Nurse', bio: 'Injectables & lasers.' },
          ],
        },
      },
      {
        name: 'values',
        slug: 'values',
        order: 4,
        content: {
          title: 'Our promise',
          items: [
            { label: 'Safety first', detail: 'Evidence-based protocols and medical oversight.' },
            { label: 'Natural results', detail: 'Enhance, never overdo.' },
            { label: 'Personalized care', detail: 'Plans tailored to your skin, goals, and lifestyle.' },
          ],
        },
      },
    ],
  },
  {
    name: 'Services',
    slug: 'services',
    description: 'Services overview page',
    sections: [
      {
        name: 'hero',
        slug: 'services-hero',
        order: 1,
        content: {
          eyebrow: 'Our menu',
          title: 'Advanced treatments, tailored to you',
          description:
            'From rejuvenating facials to injectables and body contouring, discover services built around your goals.',
          buttonText: 'Explore categories',
          buttonLink: '/services',
        },
      },
      {
        name: 'services_intro',
        slug: 'services-intro',
        order: 2,
        content: {
          title: 'Curated categories',
          description:
            'Browse by category to find the right treatment. Service cards remain dynamic; this copy is CMS-managed.',
        },
      },
    ],
  },
  {
    name: 'Contact',
    slug: 'contact',
    description: 'Contact and visit info',
    sections: [
      {
        name: 'hero',
        slug: 'contact-hero',
        order: 1,
        content: {
          title: 'We’re here to help',
          subtitle: 'Book, ask questions, or plan your visit.',
        },
      },
      {
        name: 'contact_info',
        slug: 'contact-info',
        order: 2,
        content: {
          phone: '+961 1 234 567',
          email: 'hello@clinic.com',
          address: 'Beirut Central District, Lebanon',
          hours: 'Sun–Thu: 10:00 – 19:00',
        },
      },
      {
        name: 'contact_form_copy',
        slug: 'contact-form-copy',
        order: 3,
        content: {
          title: 'Send us a message',
          description: 'Share your goals and our coordinators will get back to you within one business day.',
          submitLabel: 'Send message',
        },
      },
    ],
  },
];

const findPageIdBySlug = async (client, slug) => {
  const res = await client.query('SELECT id FROM pages WHERE slug = $1 LIMIT 1', [slug]);
  return res.rows[0]?.id;
};

const findSectionIdBySlug = async (client, pageId, slug) => {
  const res = await client.query(
    'SELECT id FROM sections WHERE page_id = $1 AND slug = $2 LIMIT 1',
    [pageId, slug]
  );
  return res.rows[0]?.id;
};

const hasSectionContent = async (client, sectionId) => {
  const res = await client.query('SELECT 1 FROM section_content WHERE section_id = $1 LIMIT 1', [
    sectionId,
  ]);
  return Boolean(res.rows[0]);
};

// Insert a page and return its UUID (explicit for clarity & reproducibility)
const insertPage = async (client, page) => {
  const { slug, name, description } = page;
  const existingId = await findPageIdBySlug(client, slug);
  if (existingId) return existingId;

  const id = randomUUID();
  await client.query(
    `INSERT INTO pages (id, name, slug, description, is_active)
     VALUES ($1, $2, $3, $4, TRUE)`,
    [id, name, slug, description]
  );
  return id;
};

// Insert a section tied to a page (is_active defaulted to TRUE)
const insertSection = async (client, pageId, section) => {
  const { name, slug, order } = section;
  const existingId = await findSectionIdBySlug(client, pageId, slug);
  if (existingId) return existingId;

  const id = randomUUID();
  await client.query(
    `INSERT INTO sections (id, page_id, name, slug, section_order, is_active)
     VALUES ($1, $2, $3, $4, $5, TRUE)`,
    [id, pageId, name, slug, order]
  );
  return id;
};

// Insert initial content for a section (version 1)
const insertSectionContent = async (client, sectionId, content) => {
  const alreadyHasContent = await hasSectionContent(client, sectionId);
  if (alreadyHasContent) return;

  const id = randomUUID();
  await client.query(
    `INSERT INTO section_content (id, section_id, content, version)
     VALUES ($1, $2, $3, 1)`,
    [id, sectionId, JSON.stringify(content)]
  );
};

const seed = async () => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    for (const page of pagesData) {
      // Page insert
      const pageId = await insertPage(client, page);

      // Sections + their content
      for (const section of page.sections) {
        const sectionId = await insertSection(client, pageId, section);
        await insertSectionContent(client, sectionId, section.content);
      }
    }

    await client.query('COMMIT');
    console.log('CMS seed completed: pages, sections, section_content inserted.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed, rolled back.', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await db.end();
  }
};

seed();
