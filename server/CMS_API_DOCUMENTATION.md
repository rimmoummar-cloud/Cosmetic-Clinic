# 📘 CMS API DOCUMENTATION

## Overview

This document describes all API endpoints for the Content Management System (CMS) built with Express.js and PostgreSQL.

The CMS has 3 main resources:
- **Pages**: Website pages (Home, About, Services, Contact, etc.)
- **Sections**: Parts of a page (Hero, Testimonials, Services Grid, etc.)
- **Section Content**: Actual data stored as flexible JSON

### Hierarchy
```
Page
├── Section 1 (Hero)
│   ├── Content v1
│   ├── Content v2 (latest)
├── Section 2 (Services)
│   ├── Content v1 (latest)
```

---

## 1. PAGES API

### GET /api/pages
Get all pages (admin dashboard view)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Home",
      "slug": "home",
      "description": "Homepage",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### GET /api/pages/active
Get only published pages (for website)

**Used by:** Frontend website navigation
**Response:** Array of only active pages

---

### GET /api/pages/detailed/:slug
⭐ **MOST IMPORTANT FOR FRONTEND**

Get complete page with all sections and content in one request

**Example:** `GET /api/pages/detailed/home`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "page-uuid",
    "name": "Home",
    "slug": "home",
    "description": "Home page",
    "is_active": true,
    "sections": [
      {
        "id": "section-uuid",
        "name": "hero",
        "slug": "hero-section",
        "order": 1,
        "content": [
          {
            "id": "content-uuid",
            "content": {
              "title": "Reveal Your Natural Glow",
              "description": "Experience luxury...",
              "buttonText": "Book Now",
              "image": "https://..."
            },
            "version": 1
          }
        ]
      }
    ]
  }
}
```

---

### GET /api/pages/slug/:slug
Get page metadata by slug

**Example:** `GET /api/pages/slug/about`

---

### GET /api/pages/:id
Get page by UUID

**Example:** `GET /api/pages/550e8400-e29b-41d4-a716-446655440000`

---

### POST /api/pages
Create a new page

**Body:**
```json
{
  "name": "Services",
  "slug": "services",
  "description": "Our premium services",
  "is_active": true
}
```

**Returns:** Created page object with UUID

---

### PUT /api/pages/:id
Update a page

**Body:** (any fields to update)
```json
{
  "name": "Updated Name",
  "is_active": false
}
```

---

### DELETE /api/pages/:id
Delete a page and all its sections/content

⚠️ **WARNING:** This cascades and deletes all sections and content!

---

### PATCH /api/pages/:id/toggle-active
Publish/unpublish a page

**Body:**
```json
{
  "is_active": true
}
```

---

## 2. SECTIONS API

### GET /api/sections
Get all sections from all pages

---

### GET /api/sections/page/:pageId
Get all sections for a specific page (ordered by section_order)

**Example:** `GET /api/sections/page/550e8400-e29b-41d4-a716-446655440000`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "section-uuid",
      "page_id": "page-uuid",
      "name": "hero",
      "slug": "hero-section",
      "section_order": 1,
      "is_active": true
    },
    {
      "id": "section-uuid-2",
      "page_id": "page-uuid",
      "name": "services",
      "slug": "services",
      "section_order": 2,
      "is_active": true
    }
  ]
}
```

---

### GET /api/sections/page/:pageId/active
Get only active sections for a page

**Used by:** Frontend rendering

---

### GET /api/sections/:id
Get a single section by ID

---

### GET /api/sections/:id/with-content
Get section with all its content versions

**Response includes:** Section metadata + content array

---

### POST /api/sections
Create a new section

**Body:**
```json
{
  "page_id": "page-uuid",
  "name": "testimonials",
  "slug": "testimonials",
  "section_order": 3,
  "is_active": true
}
```

---

### PUT /api/sections/:id
Update a section

**Body:** (any fields to update)
```json
{
  "name": "updated_name",
  "section_order": 2
}
```

---

### DELETE /api/sections/:id
Delete a section and all its content

⚠️ **Cascades and deletes all section_content!**

---

### PATCH /api/sections/:id/reorder
Change section order (for drag-drop)

**Body:**
```json
{
  "section_order": 2
}
```

---

### PATCH /api/sections/:id/toggle-active
Publish/unpublish a section

**Body:**
```json
{
  "is_active": false
}
```

---

## 3. SECTION CONTENT API

### GET /api/section-content/section/:sectionId/latest
⭐ **Get current/latest content for a section**

**Used by:** Frontend rendering

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "content-uuid",
    "section_id": "section-uuid",
    "content": {
      "title": "Reveal Your Glow",
      "description": "Experience luxury treatments",
      "image": "https://example.com/img.jpg",
      "buttonText": "Book Now"
    },
    "version": 2
  }
}
```

---

### GET /api/section-content/section/:sectionId
Get all content versions for a section (complete history)

**Response:** Array sorted by version DESC

---

### GET /api/section-content/section/:sectionId/history
Get version history timeline

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "version": 3,
      "created_at": "2024-01-15T11:00:00Z"
    },
    {
      "version": 2,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### GET /api/section-content/:id
Get specific content by ID

---

### GET /api/section-content/search
Search content by JSON field

**Query params:**
- `sectionId`: Section UUID (required)
- `field`: JSON field path like "title" (required)
- `value`: Search value (required)

**Example:** `GET /api/section-content/search?sectionId=abc&field=title&value=glow`

---

### POST /api/section-content
Create new content for a section

**Body:**
```json
{
  "section_id": "section-uuid",
  "content": {
    "title": "Reveal Your Natural Glow",
    "description": "Experience luxury beauty treatments",
    "image": "https://example.com/image.jpg",
    "buttonText": "Book Your Appointment"
  }
}
```

**Note:** Content is flexible JSON - store any data structure!

---

### PUT /api/section-content/:id
Update content (creates new version by default)

**Query params:**
- `createNewVersion=true` (default): Creates version 3 with new data
- `createNewVersion=false`: Updates in place

**Body:** Updated content object

**Best practice:** Always use createNewVersion=true to maintain audit trail

---

### DELETE /api/section-content/:id
Delete specific content version

---

### DELETE /api/section-content/section/:sectionId/all
Delete ALL content for a section

⚠️ **WARNING: Deletes entire content history!**

---

### POST /api/section-content/:sectionId/revert/:versionNumber
Restore section to previous version

**Example:** `POST /api/section-content/abc-123/revert/2`

Creates new version (3) with content from version 2

**Used by:** Dashboard "Revert to Version" feature

---

## USAGE EXAMPLES

### Example 1: Frontend Rendering a Page

```javascript
// Next.js page component
async function getPageData(slug) {
  const res = await fetch(`/api/pages/detailed/${slug}`);
  const { data } = await res.json();
  return data;
}

// Returns complete page with all sections and content
export default function Page() {
  const page = await getPageData('home');
  
  return (
    <div>
      {page.sections.map(section => (
        <Section key={section.id} section={section} />
      ))}
    </div>
  );
}
```

---

### Example 2: Dashboard Creating a Page

```javascript
// Create new page
const newPage = await fetch('/api/pages', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Services',
    slug: 'services',
    description: 'Our services',
    is_active: false  // Draft
  })
});

// Add section to page
const newSection = await fetch('/api/sections', {
  method: 'POST',
  body: JSON.stringify({
    page_id: newPage.id,
    name: 'hero',
    section_order: 1
  })
});

// Add content to section
await fetch('/api/section-content', {
  method: 'POST',
  body: JSON.stringify({
    section_id: newSection.id,
    content: {
      title: 'Our Services',
      description: 'Premium treatments',
      image: 'https://...'
    }
  })
});

// Publish page
await fetch(`/api/pages/${newPage.id}/toggle-active`, {
  method: 'PATCH',
  body: JSON.stringify({ is_active: true })
});
```

---

### Example 3: Content Versioning

```javascript
// Update content (creates new version)
await fetch('/api/section-content/content-uuid', {
  method: 'PUT',
  body: JSON.stringify({
    title: 'Updated Title',
    description: 'Updated description'
  })
  // createNewVersion=true by default
});

// Get all versions
const allVersions = await fetch('/api/section-content/section/section-uuid');

// Revert to previous version
await fetch('/api/section-content/section-uuid/revert/1', {
  method: 'POST'
});
```

---

## Common Patterns

### Pattern 1: Get Complete Page for Frontend
```
GET /api/pages/detailed/:slug
Returns: Complete page with all sections and latest content
```

### Pattern 2: Get Page for Dashboard
```
GET /api/pages/:id
+ GET /api/sections/page/:pageId
+ GET /api/section-content/section/:sectionId
```

### Pattern 3: Publish Section
```
PATCH /api/sections/:id/toggle-active
Body: { "is_active": true }
```

### Pattern 4: Reorder Sections
```
PATCH /api/sections/:id/reorder
Body: { "section_order": 3 }
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200  | OK - Request successful |
| 201  | Created - Resource created |
| 400  | Bad Request - Invalid data |
| 404  | Not Found - Resource doesn't exist |
| 500  | Server Error - Something went wrong |

---

## Error Responses

```json
{
  "success": false,
  "error": "Error message",
  "message": "User-friendly message"
}
```

---

## Notes

✅ **All endpoints are CRUD ready** (Create, Read, Update, Delete)

✅ **Content is stored as flexible JSON** - any field structure

✅ **Version control supported** - keep audit trail of changes

✅ **Relationships managed** - Page → Sections → Content
