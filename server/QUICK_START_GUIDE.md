# 🚀 CMS QUICK START GUIDE

This guide shows how to use the CMS API for common tasks.

## Installation & Setup

1. Models are already created in `server/models/`
2. Controllers are in `server/controllers/`
3. Routes are in `server/routes/`
4. All endpoints are registered in `server/server.js`

**No additional setup needed!** Start using the API immediately.

---

## ⭐ MOST IMPORTANT FOR FRONTEND

### Fetch a Complete Page

The frontend only needs ONE endpoint to get entire page:

```javascript
// Get complete page with all sections and content
const response = await fetch('/api/pages/detailed/home');
const page = response.json();

// Structure:
// page.id
// page.name
// page.slug
// page.sections[0]
//   ├── id
//   ├── name
//   ├── order
//   └── content[0]
//       └── content: { title, description, image, ... }
```

**That's it!** Use this one endpoint and you have everything.

---

## FRONTEND EXAMPLES

### Example 1: Display Home Page

```javascript
// Next.js page component
import { notFound } from 'next/navigation';

export default async function HomePage() {
  const res = await fetch('http://localhost:5000/api/pages/detailed/home');
  if (!res.ok) return notFound();
  
  const { data: page } = await res.json();

  return (
    <main>
      {page.sections.map((section) => (
        <section key={section.id} id={section.slug}>
          {/* Render based on section name */}
          {section.name === 'hero' && (
            <Hero content={section.content[0].content} />
          )}
          {section.name === 'services' && (
            <Services content={section.content[0].content} />
          )}
        </section>
      ))}
    </main>
  );
}

function Hero({ content }) {
  return (
    <div>
      <h1>{content.title}</h1>
      <p>{content.description}</p>
      <img src={content.image} alt="" />
    </div>
  );
}
```

### Example 2: Dynamic Page Routes

```javascript
// app/(website)/[slug]/page.jsx
import { notFound } from 'next/navigation';

export default async function DynamicPage({ params }) {
  const { slug } = params;

  const res = await fetch(
    `http://localhost:5000/api/pages/detailed/${slug}`
  );
  
  if (!res.ok) return notFound();
  const { data: page } = await res.json();

  return (
    <article>
      <h1>{page.name}</h1>
      {page.sections.map(section => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </article>
  );
}

function SectionRenderer({ section }) {
  const { content } = section.content[0] || {};
  
  switch(section.name) {
    case 'hero':
      return <HeroSection data={content} />;
    case 'testimonials':
      return <TestimonialSection data={content} />;
    case 'contact_form':
      return <ContactFormSection data={content} />;
    default:
      return null;
  }
}
```

---

## DASHBOARD EXAMPLES

### Example 1: Create a New Page

```javascript
// Step 1: Create page
const pageRes = await fetch('/api/pages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Services',
    slug: 'services',
    description: 'All our services',
    is_active: false  // Draft
  })
});
const { data: page } = await pageRes.json();
console.log('Page created:', page.id);

// Step 2: Add hero section
const heroRes = await fetch('/api/sections', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    page_id: page.id,
    name: 'hero',
    section_order: 1,
    is_active: true
  })
});
const { data: heroSection } = await heroRes.json();

// Step 3: Add content to hero
const contentRes = await fetch('/api/section-content', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    section_id: heroSection.id,
    content: {
      title: 'Our Services',
      subtitle: 'Premium Beauty Treatments',
      description: 'Discover our range of...',
      image: 'https://example.com/hero.jpg',
      buttonText: 'Book Now'
    }
  })
});

// Step 4: Publish the page
await fetch(`/api/pages/${page.id}/toggle-active`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ is_active: true })
});
```

### Example 2: Edit Page Content

```javascript
// Update hero content (creates new version)
const updateRes = await fetch('/api/section-content/content-uuid', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Updated Title',
    subtitle: 'Updated Subtitle',
    description: 'Updated description...',
    image: 'https://example.com/new-hero.jpg'
  })
  // ?createNewVersion=true by default
});
```

### Example 3: Revert Changes

```javascript
// View all versions
const historyRes = await fetch('/api/section-content/section/section-uuid/history');
const { data: history } = await historyRes.json();
console.log(history);
// Output: [ { version: 3, created_at: '...' }, { version: 2 }, ... ]

// Revert to version 2
const revertRes = await fetch('/api/section-content/section-uuid/revert/2', {
  method: 'POST'
});
// Now version 3 contains the content from old version 2
```

### Example 4: Manage Sections

```javascript
// Get all sections in page (ordered by order)
const res = await fetch('/api/sections/page/page-uuid');
const { data: sections } = await res.json();

// Reorder sections (drag & drop)
await fetch('/api/sections/section1-uuid/reorder', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ section_order: 3 })
});

// Rename section
await fetch('/api/sections/section-uuid', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'testimonials_updated' })
});

// Unpublish section
await fetch('/api/sections/section-uuid/toggle-active', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ is_active: false })
});
```

---

## API ENDPOINT REFERENCE

### Pages

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/pages` | Get all pages |
| GET | `/api/pages/active` | Get active pages only |
| GET | `/api/pages/detailed/:slug` | ⭐ Get complete page with sections |
| GET | `/api/pages/slug/:slug` | Get page by slug |
| GET | `/api/pages/:id` | Get page by ID |
| POST | `/api/pages` | Create page |
| PUT | `/api/pages/:id` | Update page |
| DELETE | `/api/pages/:id` | Delete page |
| PATCH | `/api/pages/:id/toggle-active` | Publish/unpublish |

### Sections

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/sections` | Get all sections |
| GET | `/api/sections/page/:pageId` | Get sections by page |
| GET | `/api/sections/page/:pageId/active` | Get active sections |
| GET | `/api/sections/:id` | Get section |
| GET | `/api/sections/:id/with-content` | Get section + content |
| POST | `/api/sections` | Create section |
| PUT | `/api/sections/:id` | Update section |
| DELETE | `/api/sections/:id` | Delete section |
| PATCH | `/api/sections/:id/reorder` | Change order |
| PATCH | `/api/sections/:id/toggle-active` | Publish/unpublish |

### Section Content

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/section-content/section/:sectionId/latest` | Get current content |
| GET | `/api/section-content/section/:sectionId` | Get all versions |
| GET | `/api/section-content/section/:sectionId/history` | Get version history |
| GET | `/api/section-content/:id` | Get content by ID |
| GET | `/api/section-content/search` | Search content |
| POST | `/api/section-content` | Create content |
| PUT | `/api/section-content/:id` | Update content |
| DELETE | `/api/section-content/:id` | Delete content |
| DELETE | `/api/section-content/section/:sectionId/all` | Delete all content |
| POST | `/api/section-content/:sectionId/revert/:versionNumber` | Revert version |

---

## COMMON SCENARIOS

### Scenario 1: Website Loads Home Page

```javascript
// Frontend requests:
GET /api/pages/detailed/home

// Receives:
{
  id: "page-uuid",
  name: "Home",
  sections: [
    {
      id: "s1",
      name: "hero",
      content: [{ content: {...} }]
    },
    {
      id: "s2",
      name: "services",
      content: [{ content: {...} }]
    }
  ]
}

// Frontend renders all sections in order
```

### Scenario 2: Admin Updates Hero Title

```javascript
// Admin sends:
PUT /api/section-content/content-uuid
{
  "title": "New Title",
  "description": "New Description",
  ...
}

// Backend:
// 1. Creates version 2 with new data
// 2. Keeps version 1 for audit trail
// 3. Returns new version

// Next frontend request gets new title automatically
```

### Scenario 3: Admin Wants to Revert Changes

```javascript
// Admin sees version history:
GET /api/section-content/section/section-uuid/history
// Returns: [v3, v2, v1]

// Admin reverts to v1:
POST /api/section-content/section-uuid/revert/1
// Creates v4 with content from v1

// Website now shows v4 (which is same as old v1)
```

---

## DATA STRUCTURE EXAMPLE

### Page with all sections and content:

```json
{
  "id": "page-1",
  "name": "Home",
  "slug": "home",
  "is_active": true,
  "sections": [
    {
      "id": "section-1",
      "name": "hero",
      "order": 1,
      "content": [
        {
          "id": "content-1",
          "content": {
            "title": "Reveal Your Natural Glow",
            "subtitle": "Premium Beauty Services",
            "description": "Experience luxury...",
            "image": "https://example.com/hero.jpg",
            "buttonText": "Book Now"
          },
          "version": 1
        }
      ]
    },
    {
      "id": "section-2",
      "name": "services",
      "order": 2,
      "content": [
        {
          "id": "content-2",
          "content": {
            "services": [
              {
                "name": "Facial",
                "price": "$99",
                "image": "https://..."
              }
            ]
          },
          "version": 1
        }
      ]
    }
  ]
}
```

---

## TIPS & BEST PRACTICES

✅ **Always get page by slug** - Use `/api/pages/detailed/home` not by UUID

✅ **Use latest content endpoint** - Frontend should use `/api/section-content/section/:id/latest`

✅ **Enable version control** - Always create new versions when updating content

✅ **Order matters** - Use `section_order` to control display order

✅ **Flexible JSON** - Content field can store any JSON structure

✅ **Cache responses** - Page data can be cached since it's versioned

✅ **Publish before showing** - Only show pages where `is_active = true`

---

## TROUBLESHOOTING

**Q: Content not showing on website?**
- Check if page `is_active = true`
- Check if section `is_active = true`
- Make sure section has content in `section_content` table

**Q: Old content still showing?**
- Check if you're using `/latest` endpoint
- Clear client cache
- Verify new version was created

**Q: Can't revert changes?**
- Go to `/api/section-content/section/:id/history` first
- Check available versions
- Use `/revert/:versionNumber`

**Q: Multiple sections showing in wrong order?**
- Check `section_order` values
- Make sure they're sequential (1, 2, 3...)
- Use `/reorder` endpoint to fix

---

## Next Steps

1. Start with **GET /api/pages/detailed/:slug** on frontend
2. Implement dashboard to **POST /api/pages** and manage content
3. Add versioning UI to view history and revert changes
4. Set up cache strategy for page data

**All CRUD operations are ready!** No additional development needed.
