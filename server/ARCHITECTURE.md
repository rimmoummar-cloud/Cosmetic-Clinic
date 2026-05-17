# 🏗️ CMS ARCHITECTURE OVERVIEW

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                          │
│                                                                   │
│  Makes requests → GET /api/pages/detailed/:slug                 │
│  Receives ← Complete page with all sections and content          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   EXPRESS SERVER (server.js)                     │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐        │
│  │   Routes    │→ │ Controllers  │→ │     Models       │        │
│  │             │  │              │  │                  │        │
│  │ pageRoutes  │  │ pageCtrl     │  │ pages.js         │        │
│  │ sectionCtrl │  │ sectionCtrl  │  │ sections.js      │        │
│  │ contentCtrl │  │ contentCtrl  │  │ sectionContent.js│        │
│  └─────────────┘  └──────────────┘  └──────────────────┘        │
│                                              ↓                   │
│                                    Database Queries              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│               PostgreSQL Database                                │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐       │
│  │   pages      │  │  sections    │  │ section_content  │       │
│  ├──────────────┤  ├──────────────┤  ├──────────────────┤       │
│  │ id (UUID)    │  │ id (UUID)    │  │ id (UUID)        │       │
│  │ name         │  │ page_id (FK) |→ │ section_id (FK)  |→      │
│  │ slug (unique)│  │ name         │  │ content (JSONB)  │       │
│  │ description  │  │ section_order│  │ version          │       │
│  │ is_active    │  │ is_active    │  │ created_at       │       │
│  │ created_at   │  │ created_at   │  │ updated_at       │       │
│  │ updated_at   │  │ updated_at   │  │                  │       │
│  └──────────────┘  └──────────────┘  └──────────────────┘       │
│        ↑                ↑                        ↑               │
│        └── Relationships via Foreign Keys ──────┘               │
│                                                                   │
│   CASCADE DELETE: Deleting page deletes sections & content       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1️⃣ Frontend Fetching Home Page

```
Browser
├─ GET /api/pages/detailed/home
│
└─→ Express Server
    └─→ Routes (pageRoutes.js)
        └─→ Controller (pageController.getPageWithSectionsAndContent)
            └─→ Model (pages.getPageWithSectionsAndContent)
                └─→ SQL Query:
                    SELECT pages, sections, section_content
                    WHERE slug = 'home' AND is_active = true
                    
                    └─→ PostgreSQL
                        ├─ pages table ✓
                        ├─ sections table ✓
                        └─ section_content table ✓
                        
                    └─→ Return combined data
                    
            └─→ Transform flat SQL result into hierarchy
                {
                  pages: { ... },
                  sections: [
                    { 
                      section: {...},
                      content: [...]
                    }
                  ]
                }
                
    ←──── Response to Browser
    
Browser Renders Page ✓
```

### 2️⃣ Dashboard Creating New Page

```
Admin Dashboard
├─ 1. Click "Create Page"
│     POST /api/pages
│     { name: "Services", slug: "services", is_active: false }
│
├─→ Express Server → Model → Database
│   INSERT into pages
│   ↓ returns page.id
│
├─ 2. Click "Add Section"
│     POST /api/sections
│     { page_id: page.id, name: "hero", section_order: 1 }
│
├─→ Express Server → Model → Database
│   INSERT into sections
│   ↓ returns section.id
│
├─ 3. Click "Add Content"
│     POST /api/section-content
│     { section_id: section.id, content: {...} }
│
├─→ Express Server → Model → Database
│   INSERT into section_content
│   ↓ returns content.id, version: 1
│
├─ 4. Click "Publish"
│     PATCH /api/pages/:id/toggle-active
│     { is_active: true }
│
├─→ Express Server → Model → Database
│   UPDATE pages SET is_active = true
│   ↓ updated_at = NOW()
│
└─ Page Published! ✓
  Frontend can now see it at /services
```

### 3️⃣ Content Versioning Update

```
Admin edits hero content
├─ Click "Edit"
│  View: GET /api/section-content/:id/latest
│
├─ Make changes: "New Title"
│
├─ Click "Save"
│  POST /api/section-content/:id
│  { title: "New Title", ... }
│  (Query param: createNewVersion=true by default)
│
├─→ Express Server → Model
│   ├─ Get current version: 1
│   ├─ Calculate next version: 2
│   ├─ Insert new record (version 2)
│   ├─ Return new version
│
├─→ Database
│   Version 1: { title: "Old Title", ... }
│   Version 2: { title: "New Title", ... }
│
├─ Frontend automatically sees Version 2
│  (when using /latest endpoint)
│
└─ Admin can see all versions:
   GET /api/section-content/section/:id/history
   [Version 2, Version 1]
   
└─ Admin can revert:
   POST /api/section-content/:id/revert/1
   Creates Version 3 with same content as Version 1
```

---

## Request/Response Flow Example

### Example: Get Home Page (Most Common)

**Request:**
```
GET http://localhost:5000/api/pages/detailed/home
```

**Express Router** (pageRoutes.js)
```javascript
router.get('/detailed/:slug', getPageWithSectionsAndContent);
```

**Controller** (pageController.js)
```javascript
export const getPageWithSectionsAndContent = async (req, res) => {
  const { slug } = req.params; // "home"
  const page = await PageModel.getPageWithSectionsAndContent(slug);
  res.json({ success: true, data: page });
};
```

**Model** (pages.js)
```javascript
export const getPageWithSectionsAndContent = async (slug) => {
  const result = await db.query(`
    SELECT p.*, s.*, sc.*
    FROM pages p
    LEFT JOIN sections s ON p.id = s.page_id
    LEFT JOIN section_content sc ON s.id = sc.section_id
    WHERE p.slug = $1 AND p.is_active = TRUE
  `, [slug]);
  
  // Transform and return hierarchical data
  return transformToHierarchy(result.rows);
};
```

**Database Query**
```sql
SELECT 
  p.*, 
  s.*, 
  sc.*
FROM pages p
LEFT JOIN sections s ON p.id = s.page_id AND s.is_active = TRUE
LEFT JOIN section_content sc ON s.id = sc.section_id
WHERE p.slug = 'home' AND p.is_active = TRUE
ORDER BY s.section_order ASC;
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "page-uuid",
    "name": "Home",
    "slug": "home",
    "sections": [
      {
        "id": "section-1",
        "name": "hero",
        "section_order": 1,
        "content": [
          {
            "id": "content-1",
            "content": {
              "title": "Reveal Your Glow",
              "description": "...",
              "image": "..."
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

## API Layer Structure

```
┌─ Routes (HTTP Endpoints) ─────────────────────────────────┐
│                                                             │
│  GET    /api/pages                                         │
│  GET    /api/pages/detailed/:slug         ⭐ Frontend      │
│  POST   /api/pages                        📝 Create         │
│  PUT    /api/pages/:id                    ✏️ Update         │
│  DELETE /api/pages/:id                    🗑️ Delete        │
│  PATCH  /api/pages/:id/toggle-active      📢 Publish       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
           ↓ (routes/pageRoutes.js)
┌─ Controllers (Business Logic) ─────────────────────────────┐
│                                                             │
│  getAllPages() {                                           │
│    return await PageModel.getAllPages()                   │
│  }                                                          │
│                                                             │
│  getPageWithSectionContent() {                             │
│    return await PageModel.getPageWithSectionsAndContent()  │
│  }                                                          │
│                                                             │
│  [+ 7 more controller functions]                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
           ↓ (controllers/pageController.js)
┌─ Models (Database Queries) ────────────────────────────────┐
│                                                             │
│  getAllPages() {                                           │
│    return db.query('SELECT * FROM pages')                 │
│  }                                                          │
│                                                             │
│  createPage(data) {                                        │
│    return db.query('INSERT INTO pages VALUES(...)')       │
│  }                                                          │
│                                                             │
│  [+ 8 more model functions]                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
           ↓ (models/pages.js)
┌─ Database (PostgreSQL) ────────────────────────────────────┐
│                                                             │
│  CREATE TABLE pages (                                      │
│    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),         │
│    name VARCHAR(100) NOT NULL,                            │
│    slug VARCHAR(100) UNIQUE NOT NULL,                     │
│    description TEXT,                                       │
│    is_active BOOLEAN DEFAULT TRUE,                        │
│    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        │
│    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP         │
│  );                                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Resource Hierarchy

```
TOP LEVEL: Pages
├─ Home
├─ About  
├─ Services
└─ Contact

SECOND LEVEL: Sections (within each page)
├─ Home
│  ├─ Hero
│  ├─ Services Preview
│  ├─ Benefits
│  ├─ Testimonials
│  └─ CTA
├─ About
│  ├─ Hero
│  ├─ Story
│  ├─ Values
│  ├─ Team
│  └─ CTA
└─ [Service Page]

THIRD LEVEL: Content (within each section)
├─ Home > Hero
│  ├─ Version 1: { title: "...", ... }
│  ├─ Version 2: { title: "...", ... }
│  └─ Version 3: { title: "...", ... } [LATEST]
├─ Home > Services Preview
│  ├─ Version 1: { services: [...] } [LATEST]
└─ [Content...]
```

---

## CRUD Operations Summary

### Pages

| Operation | Endpoint | HTTP | Use Case |
|-----------|----------|------|----------|
| **C**reate | /api/pages | POST | Create new page |
| **R**ead | /api/pages/detailed/:slug | GET | Fetch page for rendering |
| **U**pdate | /api/pages/:id | PUT | Edit page name/slug |
| **D**elete | /api/pages/:id | DELETE | Remove page |
| Publish | /api/pages/:id/toggle-active | PATCH | Show/hide from website |

### Sections

| Operation | Endpoint | HTTP | Use Case |
|-----------|----------|------|----------|
| **C**reate | /api/sections | POST | Add section to page |
| **R**ead | /api/sections/:id | GET | Get section details |
| **U**pdate | /api/sections/:id | PUT | Rename section |
| **D**elete | /api/sections/:id | DELETE | Remove section |
| Reorder | /api/sections/:id/reorder | PATCH | Change display order |
| Publish | /api/sections/:id/toggle-active | PATCH | Show/hide section |

### Section Content

| Operation | Endpoint | HTTP | Use Case |
|-----------|----------|------|----------|
| **C**reate | /api/section-content | POST | Add content to section |
| **R**ead | /api/section-content/:id/latest | GET | Get current content |
| **U**pdate | /api/section-content/:id | PUT | Edit content (new version) |
| **D**elete | /api/section-content/:id | DELETE | Remove content version |
| Revert | /api/section-content/:id/revert/:v | POST | Restore old version |
| History | /api/section-content/:id/history | GET | View all versions |

---

## Key Design Patterns

### 1. Versioning Pattern
```
Every content update creates a new version (immutable history)

Version 1: { title: "Original" }
Version 2: { title: "Updated" }  ← Latest used by frontend
Version 3: { title: "Another" }

Can revert to any previous version anytime
```

### 2. Soft Delete Pattern (Publish/Unpublish)
```
Instead of deleting:
  is_active = false  (unpublish)
  
To publish:
  is_active = true   (publish)
  
Frontend:
  WHERE is_active = TRUE  (shows only published)
```

### 3. Hierarchical Retrieval Pattern
```
Frontend uses ONE endpoint:
  GET /api/pages/detailed/:slug

Returns:
  ├─ page
  ├─ sections (ordered)
  └─ content (latest for each section)

Dashboard can fetch at each level:
  ├─ /api/pages
  ├─ /api/sections/page/:pageId
  └─ /api/section-content/section/:sectionId
```

### 4. Flexible JSON Storage Pattern
```
section_content.content is JSONB

Can store:
  { title: "...", description: "..." }  ← Hero
  { services: [...] }                   ← Services
  { phone: "...", email: "..." }        ← Contact
  { testimonials: [...] }               ← Testimonials

No schema changes needed for new structures
```

---

## Performance Considerations

### Indexing
```sql
-- Already in schemas for fast lookups:
- pages.slug (UNIQUE)
- sections.page_id
- section_content.section_id
```

### Caching Strategy
```
1. Cache /api/pages/detailed/:slug at CDN level
   (Revalidate on content update)

2. Cache sections list per page
   (Invalidate when sections reordered)

3. Cache latest content
   (Invalidate on content update)
```

### Query Optimization
```
Use the /detailed/:slug endpoint instead of:
  1. GET /api/pages/:id
  2. GET /api/sections/page/:pageId
  3. GET /api/section-content/section/:sectionId (multiple)

ONE request vs FOUR+ requests
```

---

## Summary

✅ **Clean architecture** with separation of concerns
✅ **Single responsibility** - Models query, Controllers handle, Routes expose
✅ **Hierarchical data** - GET /detailed/:slug gets everything needed
✅ **Versioning** - Complete audit trail of content changes
✅ **Flexible schema** - JSON storage accommodates any data
✅ **Publish/unpublish** - Control what appears on website
✅ **Reordering** - Drag-drop section ordering
✅ **Ready to scale** - All CRUD operations implemented

Start using it now! 🚀
