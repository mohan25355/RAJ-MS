# Raja Electricals 'N' Hardware — Master Project Documentation

**Production Domain**: [https://rajaelectrical.com](https://rajaelectrical.com)  
**Production API Domain**: [https://api.rajaelectrical.com](https://api.rajaelectrical.com)  
**Database Host**: NEW Supabase (`ueohqicjodxwkwdxcrnj.supabase.co`)  
**Storage Bucket**: `RAJA_ELE`  
**Last Baseline Verification**: September 29, 2026  
**Production Status**: **FROZEN & PRODUCTION READY**

---

## 1. Project Overview

**Raja Electricals 'N' Hardware** is a full-featured web application and digital product showcase for a premier electrical, sanitaryware, industrial safety, hardware, tools, and water pump supplier based in Chennai, Tamil Nadu, India.

The platform provides a modern, fast catalog with real-time category filtering, instant product search, high-resolution product imagery, direct WhatsApp inquiry integration, an online quote request system, and an administrative dashboard for real-time inventory and site content management.

---

## 2. Business Purpose

For over two decades, Raja Electricals has supplied contractors, facilities management companies, infrastructure teams, and retail customers. The website serves to:
- Showcase over 180+ commercial & industrial electrical, sanitaryware, and safety products.
- Present major partner brands (Havells, Anchor, Finolex, Cera, Parryware, Bosch, 3M, Legrand, Crompton, etc.).
- Enable direct customer inquiries and quotation requests via automated WhatsApp deep-links and Web API forms.
- Provide a secure CMS for administrators to manage products, categories, brand relationships, gallery imagery, and homepage announcements.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 6
- **Language**: JavaScript (ES2022+)
- **Styling**: Vanilla CSS (Custom design system with modern glassmorphism, responsive grid, dynamic badges, CSS variables)
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express 4
- **Database Client**: `@supabase/supabase-js` v2
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **Utility**: CORS, `dotenv`

### Database & Storage
- **Database**: Supabase PostgreSQL (`ueohqicjodxwkwdxcrnj.supabase.co`)
- **Object Storage**: Supabase Storage (`RAJA_ELE` bucket)

### Production Infrastructure & Hosting
- **Frontend Hosting**: Hostinger (`https://rajaelectrical.com`)
- **Backend Hosting**: Hostinger Node.js Application Service (`https://api.rajaelectrical.com`)

---

## 4. System Architecture

```
[ Browser / Client ] 
        │
        ├─────────────► React 18 / Vite SPA (rajaelectrical.com)
        │                       │
        │               HTTP REST API Calls
        │                       │
        ▼                       ▼
[ Express API Server ] ◄────────┘ (api.rajaelectrical.com)
   │ (JWT Auth / ETag Cache / Base64 Storage Upload / In-Memory Coalescing)
   │
   ▼
[ NEW Supabase Production ] (ueohqicjodxwkwdxcrnj.supabase.co)
   ├── PostgreSQL Database (products, categories, brands, gallery, site_settings, admins)
   └── Storage Bucket: RAJA_ELE (products/, brands/, gallery/, home-ads/)
```

> **Security Rule**: The frontend web application strictly consumes public API endpoints. Secret keys (`SUPABASE_SECRET_KEY`, `JWT_SECRET`) reside exclusively on the backend server.

---

## 5. Complete Project Structure

```
main electric/
├── README.md                           # Master Project Documentation
├── client/                             # Frontend React + Vite Application
│   ├── index.html                      # SEO, OpenGraph, JSON-LD Structured Data
│   ├── package.json                    # Frontend dependencies & scripts
│   ├── vite.config.js                  # Vite configuration & dev server proxy
│   ├── public/                         # Static public assets
│   │   ├── robots.txt                  # Search engine crawler instructions
│   │   ├── sitemap.xml                 # XML Sitemap for search engines
│   │   └── assets/                     # Local asset fallbacks & Sanitaryware images
│   │       └── sanitaryware/           # Sanitaryware product imagery (san/ source)
│   └── src/                            # React application source code
│       ├── main.jsx                    # Application entrypoint & Hash Router
│       ├── styles.css                  # Core CSS design system
│       ├── overrides.css               # Design system overrides
│       ├── mobile.css                  # Mobile responsive styles
│       ├── cms.css                     # Admin panel styling
│       ├── fixes.css                   # Custom visual fixes
│       ├── components/                 # Reusable UI components (Header, Footer, etc.)
│       ├── pages/                      # Page components
│       │   ├── HomePage.jsx            # Landing page
│       │   ├── AboutPage.jsx           # Company overview
│       │   ├── ProductsPage.jsx        # Product catalog & Detail views
│       │   ├── BrandsPage.jsx          # Partner brands showcase
│       │   ├── GalleryPage.jsx         # Project & store gallery
│       │   ├── ContactPage.jsx         # Contact form & location details
│       │   └── DashboardPage.jsx       # Admin Panel & CMS
│       ├── lib/                        # API client (`api.js`)
│       └── utils/                      # Utilities & `productImageResolver.js`
├── server/                             # Express Backend Server
│   ├── server.js                       # Express app, Auth, API routes, Supabase integration
│   ├── package.json                    # Backend dependencies & scripts
│   ├── .env.example                    # Backend environment template
│   └── scripts/                        # Operational & test scripts
│       └── admin_audit_full_test.js    # Master administrative regression test suite
└── san/                                # Source directory for Sanitaryware high-res imagery
```

---

## 6. Frontend Architecture

- **Routing**: Lightweight hash router (`#home`, `#products`, `#brands`, `#gallery`, `#contact`, `#dashboard`) implemented in `client/src/main.jsx`.
- **Image Resolver**: `client/src/utils/productImageResolver.js` maps database image references to local asset fallbacks, remote Supabase Storage URLs, and verified local assets.
- **State Management**: React state hooks (`useState`, `useEffect`) manage content, search queries, active category filters, and admin authentication tokens.
- **Resilience**: React `ErrorBoundary` wraps page components to prevent complete app crashes if individual components fail.

---

## 7. Backend Architecture

- **Express Entrypoint**: `server/server.js` initializes CORS, JSON parsing, routes, and error handling middleware.
- **Performance Caching**:
  - `fetchFreshContent()` aggregates site settings, products, projects, gallery, brands, categories, and industries.
  - **In-Memory Cache & TTL**: `CONTENT_CACHE_TTL` (default 300s) prevents database thrashing.
  - **Request Coalescing**: Stampede protection ensures simultaneous incoming requests share a single in-flight database promise.
  - **ETag & 304 Revalidation**: Generates revision ETags (`W/"rev-<timestamp>"`) allowing browsers to receive `304 Not Modified` responses.
- **Immediate Cache Invalidation**: Admin mutations (`POST`, `PUT`, `DELETE`) call `invalidateContentCache()`, forcing the next public request to load fresh data from Supabase.

---

## 8. Authentication

- **Admin Login Endpoint**: `POST /api/auth/login`
  - Validates email & password against `admins` table records using `bcryptjs`.
  - On success, issues a 12-hour signed JWT (`jwt.sign({ email }, JWT_SECRET, { expiresIn: '12h' })`).
- **Protected Middleware**: `auth` middleware checks `req.headers.authorization` for a valid `Bearer <token>`. Returns `401 Unauthorized` for missing or invalid tokens.
- **Logout Endpoint**: `POST /api/auth/logout` returns HTTP `204 No Content` and clears client token state.

---

## 9. Admin Panel

Accessible via `https://rajaelectrical.com/#dashboard`.

### Supported Operations:
1. **Dashboard Metrics**: Real-time record counts for products, categories, brands, and gallery items.
2. **Products Management**: Full CRUD. Supports name, category, brand, price, description, specifications, availability, badge, and image upload.
3. **Categories Management**: Full CRUD. Supports name, image, description, display order, and active state.
4. **Brands Management**: Full CRUD. Supports brand name, category, logo upload, website URL, and display order.
5. **Gallery Management**: Full CRUD. Supports title, image upload, category tag, and display order.
6. **Site Settings CMS**: Allows updating company welcome message, hero title, hero text, delivery text, trust metrics, and supply banners.
7. **Storage Upload Pipeline**: Base64 data URLs uploaded via admin panel are automatically converted to binary buffers, uploaded to Supabase Storage bucket `RAJA_ELE`, and assigned public URLs.
8. **Automated Storage Cleanup**: Deleting a record triggers `safelyDeleteStorageImage()`, purging orphaned objects from Supabase Storage while preserving files referenced by other items.

---

## 10. Database Schema & Tables

The project operates on the **NEW Supabase PostgreSQL instance**:

| Table Name | Primary Columns | Purpose |
|---|---|---|
| `products` | `id`, `name`, `category`, `description`, `price`, `image`, `data`, `created_at`, `updated_at` | Product catalog items & specs |
| `categories` | `id`, `name`, `image`, `data`, `created_at`, `updated_at` | Product categories & navigation groupings |
| `brands` | `id`, `name`, `logo`, `data`, `created_at`, `updated_at` | Manufacturer & partner brand listings |
| `gallery` | `id`, `title`, `image`, `data`, `created_at`, `updated_at` | Projects, store, and showcase media |
| `site_settings` | `id`, `data`, `created_at`, `updated_at` | Site-wide CMS settings (single row `id=1`) |
| `admins` | `id`, `email`, `password_hash`, `name`, `created_at` | Authorized admin login credentials |
| `enquiries` | `id`, `name`, `phone`, `email`, `message`, `created_at` | Customer inquiry records |
| `orders` | `id`, `customer_name`, `items`, `total`, `created_at` | Customer quote/order records |

---

## 11. Database Baseline Counts

As of September 29, 2026, the verified local production baseline count is:

- **Products**: 189
- **Categories**: 30
- **Brands**: 51
- **Gallery**: 6
- **Site Settings**: 1
- **Admins**: 2

> *Note: These counts represent the verified production baseline at the finalization date and should not be assumed permanent.*

---

## 12. Supabase Storage

- **Bucket Name**: `RAJA_ELE` (Public Bucket)
- **Base URL**: `https://ueohqicjodxwkwdxcrnj.supabase.co/storage/v1/object/public/RAJA_ELE/`
- **Folders**:
  - `products/`: Product card & detail images
  - `brands/`: Brand partner logos
  - `gallery/`: Project & facility photos
  - `home-ads/`: Promotional homepage banners

---

## 13. Image Pipeline & Sanitaryware Policy

- **Pipeline**: Supabase Storage URL → Express API (`/api/content`) → Product Object → `productImageResolver.js` → React `<img src="..." />`.
- **Sanitaryware Image Policy**: All Sanitaryware product images are sourced directly from the project's `san/` asset directory (`client/public/assets/sanitaryware/`). **These assets are official images and MUST NOT be replaced with AI-generated or generic studio renders.**

---

## 14. Production API Endpoint Reference

| Method | Endpoint Path | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Healthcheck endpoint returning DB connection status |
| `GET` | `/api/content` | No | Public aggregated site content (Supports ETag & 304) |
| `POST` | `/api/auth/login` | No | Admin login; returns JWT token |
| `POST` | `/api/auth/logout` | No | Admin logout endpoint |
| `PUT` | `/api/site` | Yes (Bearer) | Update site CMS settings |
| `POST` | `/api/:collection` | Yes (Bearer) | Create new item in `products`, `categories`, `brands`, or `gallery` |
| `PUT` | `/api/:collection/:id` | Yes (Bearer) | Update existing item in managed collection |
| `DELETE`| `/api/:collection/:id` | Yes (Bearer) | Delete item & clean up unused storage file |
| `GET` | `/robots.txt` | No | Serves crawler configuration |
| `GET` | `/sitemap.xml` | No | Dynamic XML Sitemap |

---

## 15. Environment Variables Configuration

### Server Environment (`server/.env.example`)
```ini
NODE_ENV=production
PORT=10000
JWT_SECRET=your_jwt_secret_key_here
SUPABASE_URL=https://ueohqicjodxwkwdxcrnj.supabase.co
SUPABASE_SECRET_KEY=your_supabase_secret_key_here
CLIENT_ORIGIN=https://rajaelectrical.com
CORS_ORIGIN=https://rajaelectrical.com
```

### Client Environment (`client/.env.example`)
```ini
VITE_API_URL=https://api.rajaelectrical.com
VITE_API_BASE_URL=https://api.rajaelectrical.com
VITE_SUPABASE_URL=https://ueohqicjodxwkwdxcrnj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key_here
```

---

## 16. Local Development Instructions

### Prerequisites
- Node.js v18+
- npm v9+

### Step-by-Step Setup
1. **Install Backend Dependencies**:
   ```bash
   cd server
   npm install
   ```
2. **Install Frontend Dependencies**:
   ```bash
   cd ../client
   npm install
   ```
3. **Start Backend API Server**:
   ```bash
   cd ../server
   npm run dev
   ```
   *Runs on `http://localhost:10000`*

4. **Start Frontend Vite Dev Server**:
   ```bash
   cd ../client
   npm run dev
   ```
   *Runs on `http://localhost:5173`*

---

## 17. Production Build & Deployment

### Building Client Bundle
```bash
cd client
npm run build
```
Generates optimized static bundle in `client/dist/` containing `index.html`, minified JavaScript chunks, CSS, `robots.txt`, and `sitemap.xml`.

---

## 18. Hostinger Deployment Architecture

- **Domain Mapping**:
  - `https://rajaelectrical.com` → Serves `client/dist/` build files.
  - `https://api.rajaelectrical.com` → Runs Node.js Express server (`server/server.js`).
- **CORS Configuration**: Server handles requests from `https://rajaelectrical.com` cleanly.

---

## 19. Security Rules & Standards

1. **Secret Isolation**: `SUPABASE_SECRET_KEY` and `JWT_SECRET` must NEVER be placed in client-side code or `VITE_*` environment variables.
2. **Git Hygiene**: Ensure `.env`, `.env.local`, and sensitive credentials are in `.gitignore`.
3. **JWT Expiry**: Admin JWT tokens expire after 12 hours.

---

## 20. Egress & Performance Protection

To prevent exceeding free-tier egress limits on Supabase:
- Aggregated content endpoint (`GET /api/content`) utilizes in-memory caching (`CONTENT_CACHE_TTL=300s`).
- Request coalescing merges simultaneous queries into a single database fetch.
- ETag header (`W/"rev-..."`) enables `304 Not Modified` responses for unchanged content.

---

## 21. SEO, AEO & GEO Optimization

- **Meta Tags & OpenGraph**: `client/index.html` includes meta title, meta description, OpenGraph (`og:title`, `og:description`, `og:image`, `og:url`), and Twitter Cards.
- **Canonical URLs**: Fixed to `https://rajaelectrical.com/`.
- **Search Crawlers**: `robots.txt` and `sitemap.xml` configured for production indexing.
- **Structured Data (JSON-LD)**: Includes schema specifications for:
  - `Organization` & `LocalBusiness` (Chennai electrical & hardware supplier).
  - `WebSite` & `ItemList` (Catalog structure).
  - `Product` (Item specifications & categories).
- **Answer Engine & Generative Engine Optimization (AEO/GEO)**: Clear heading hierarchy (`h1`, `h2`, `h3`), natural language FAQs, concise business descriptions, and semantic HTML elements (`header`, `main`, `section`, `footer`).

---

## 22. Automated Testing

To run the complete automated administrative regression test suite:
```bash
node server/scripts/admin_audit_full_test.js
```
Tests login, invalid login rejection, protected route enforcement, CRUD operations across products/categories/brands/gallery, site settings CMS, storage uploads/cleanups, error handling, zero lingering test data, and count integrity.

---

## 23. Production Pre-Flight Checklist

- [x] All obsolete markdown reports deleted.
- [x] Master `README.md` created & updated.
- [x] Environment files cleaned of old Supabase references (`yfbzapzceoqkwzsmsjmk`).
- [x] Public client build succeeds (`npm run build`).
- [x] Backend starts cleanly on Node.js runtime.
- [x] 0 references to old Supabase project in runtime code.
- [x] All 189 baseline products, 30 categories, 51 brands, 6 gallery items verified intact.
- [x] Sanitaryware images verified against `san/` directory.

---

## 24. Maintenance Guide

- **Adding Products**: Log into `https://rajaelectrical.com/#dashboard`, navigate to Products, click "Add Product", fill details, attach image, and save.
- **Updating Site Announcements**: Go to Dashboard → Site Settings, update text, and click Save.
- **Brand Additions**: Go to Dashboard → Brands, add brand name and logo image.

---

## 25. Important Rules for Future AI Agents & Developers

1. **DO NOT** migrate Supabase projects without explicit user approval.
2. **DO NOT** replace Sanitaryware images from `san/` with generated/placeholder images.
3. **DO NOT** hardcode secrets (`SUPABASE_SECRET_KEY`, `JWT_SECRET`) in source files.
4. **DO NOT** alter database schemas casually.
5. **ALWAYS** run `npm run build` in `client/` after making frontend changes.
6. **ALWAYS** run `node server/scripts/admin_audit_full_test.js` to verify admin functionality before deploying.
7. **ALWAYS** clean up all test records created during administrative testing.

---

# Final Production Verification

**Date**: September 29, 2026  
**Status**: **PRODUCTION READY — LOCAL VERIFICATION PASSED & FROZEN**

```
Frontend build          : PASS
Backend startup         : PASS
Supabase connection     : PASS (ueohqicjodxwkwdxcrnj.supabase.co)
Admin login             : PASS
Admin route protection  : PASS
Products CRUD           : PASS
Categories CRUD         : PASS
Brands CRUD             : PASS
Gallery CRUD            : PASS
Site settings CMS       : PASS
Sanitaryware images     : PASS
Cable Tie image         : PASS
PVC Conduit Pipe image  : PASS
Gallery images          : PASS
SEO / AEO / GEO         : PASS
Environment audit       : PASS
Old Supabase references : 0
Test data remaining     : 0
Build secrets exposed   : 0
Runtime console errors  : 0
```
