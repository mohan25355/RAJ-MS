const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const supabase = require('./supabase');
const express = require('express');
const compression = require('compression');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 10000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-development-secret';

const allowedOrigins = [
  'https://raj-ms-client-seven.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:10000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const envOrigins = `${process.env.CLIENT_ORIGIN || ''},${process.env.CORS_ORIGIN || ''}`
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

envOrigins.forEach(origin => {
  const clean = origin.replace(/\/$/, '');
  if (!allowedOrigins.includes(clean)) {
    allowedOrigins.push(clean);
  }
});

const isAllowedOrigin = o => {
  if (!o) return false;
  const clean = o.trim().replace(/\/$/, '');
  if (allowedOrigins.some(ao => ao.replace(/\/$/, '') === clean)) return true;
  if (clean.startsWith('https://raj-ms-client-') && clean.endsWith('.vercel.app')) return true;
  return false;
};

app.use(compression());
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin && process.env.NODE_ENV !== 'production') {
    // Allow non-browser requests in dev
  } else if (origin && process.env.NODE_ENV !== 'production') {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Pragma, If-None-Match, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});
app.use(express.json({ limit: '20mb' }));

const photo = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;
const LEGACY_PHONE = '9941336125';
const COMPANY_PHONE = '+91 9003900533';
const COMPANY_WHATSAPP = '919003900533';
const replaceLegacyContact = site => { const digits = value => String(value || '').replace(/\D/g, ''); return { ...site, phone: digits(site.phone).endsWith(LEGACY_PHONE) ? COMPANY_PHONE : site.phone, whatsappNumber: digits(site.whatsappNumber).endsWith(LEGACY_PHONE) ? COMPANY_WHATSAPP : site.whatsappNumber }; };
const initialContent = { site: { businessName: "Raja Electricals 'N' Hardware", welcome: "Welcome to Raja Electricals 'N' Hardware", heroTitle: 'Powering Every Project', heroText: 'Electrical · Hardware · Safety · Industrial Solutions', heroImage: photo('photo-1565008447742-97f6f38c985c', 1300), deliveryText: 'Same Day Delivery Available', trustYears: '25+', productCount: '5000+', happyClients: '2000+', supplyTitle: 'Supply that keeps work moving.', supplyText: 'For over two decades, Raja Electricals has helped contractors, facilities and industrial teams source dependable products without unnecessary delays.' }, categories: [{ id: 'electricals', name: 'Electricals', image: photo('photo-1581092160607-ee22621dd758'), count: '250+ Products' }, { id: 'safety', name: 'Industrial Safety', image: photo('photo-1586864387967-d02ef85d93e8'), count: '300+ Products' }, { id: 'tools', name: 'Hardware & Tools', image: photo('photo-1530124566582-a618bc2615dc'), count: '600+ Products' }, { id: 'pumps', name: 'Water Pumps', image: photo('photo-1581093458791-9d09d2e70ae4'), count: '100+ Products' }], products: [{ id: 'cables', name: 'Industrial Cables', image: photo('photo-1544724569-5f546fd6f2b5'), price: 'From ₹450', badge: 'Best Seller', category: 'Electricals', description: 'Reliable cables for industrial and commercial applications.' }, { id: 'helmets', name: 'Safety Helmets', image: photo('photo-1590650153855-d9e808231d41'), price: 'From ₹180', badge: 'Essential', category: 'Industrial Safety', description: 'Comfortable, durable PPE for site teams.' }, { id: 'lighting', name: 'LED Flood Lights', image: photo('photo-1524484485831-a92ffc0de03f'), price: 'From ₹890', badge: 'New', category: 'Electricals', description: 'High-output lighting for indoor and outdoor sites.' }, { id: 'toolkit', name: 'Power Tools Kit', image: photo('photo-1504148455328-c376907d081c'), price: 'From ₹2,499', badge: 'Popular', category: 'Hardware & Tools', description: 'Professional power tools for daily trade work.' }], brands: [{ id: 'havells', name: 'Havells', logo: 'https://dummyimage.com/240x110/ffffff/cc0000&text=HAVELLS', category: 'Electrical', products: '250+', description: 'Electrical equipment and consumer products.' }, { id: 'bosch', name: 'Bosch', logo: 'https://dummyimage.com/240x110/ffffff/e00000&text=BOSCH', category: 'Tools', products: '120+', description: 'Professional tools and accessories.' }, { id: '3m', name: '3M Safety', logo: 'https://dummyimage.com/240x110/ffffff/cc0000&text=3M', category: 'Safety', products: '90+', description: 'Trusted personal protection solutions.' }], industries: [{ id: 'construction', name: 'Construction', image: photo('photo-1503387762-592deb58ef4e'), description: 'Site-ready supply for contractors and infrastructure teams.' }, { id: 'manufacturing', name: 'Manufacturing', image: photo('photo-1513828583688-c52646db42da'), description: 'Maintenance, safety and electrical supplies for plants.' }, { id: 'facilities', name: 'Facilities', image: photo('photo-1497366754035-f200968a6e72'), description: 'Everyday essentials to keep your facility running.' }], gallery: [{ id: 'g1', title: 'Site supply', image: photo('photo-1503387762-592deb58ef4e'), type: 'Projects' }, { id: 'g2', title: 'Safety range', image: photo('photo-1586864387967-d02ef85d93e8'), type: 'Products' }, { id: 'g3', title: 'Tools collection', image: photo('photo-1530124566582-a618bc2615dc'), type: 'Products' }, { id: 'g4', title: 'Delivery ready', image: photo('photo-1565008447742-97f6f38c985c'), type: 'Store' }] };

initialContent.industries = [
  { id: 'construction', name: 'Construction', image: photo('photo-1503387762-592deb58ef4e'), description: 'Site-ready supply for contractors and infrastructure teams.' },
  { id: 'manufacturing', name: 'Manufacturing', image: photo('photo-1565043589221-1a6fd9ae45c7'), description: 'Maintenance, safety and electrical supplies for plants.' },
  { id: 'facilities', name: 'Facilities', image: photo('photo-1581091226825-a6a2a5aee158'), description: 'Everyday essentials to keep your facility running.' },
  { id: 'infrastructure', name: 'Infrastructure', image: photo('photo-1541888946425-d81bb19240f5'), description: 'Safety and site-ready solutions for critical infrastructure.' },
];

const contentSchema = new mongoose.Schema({ key: { type: String, unique: true }, data: mongoose.Schema.Types.Mixed }, { timestamps: true });
const adminSchema = new mongoose.Schema({ email: { type: String, unique: true, lowercase: true, trim: true }, passwordHash: String }, { timestamps: true });
const enquirySchema = new mongoose.Schema({ name: { type: String, required: true, trim: true }, company: String, phone: { type: String, required: true }, email: String, product: String, quantity: String, message: String, status: { type: String, default: 'New', enum: ['New', 'Contacted', 'Closed'] } }, { timestamps: true });
enquirySchema.index({ createdAt: -1 });
const orderSchema = new mongoose.Schema({ customerName: { type: String, required: true, trim: true }, phone: { type: String, required: true }, email: String, company: String, productId: String, productName: { type: String, required: true }, quantity: { type: Number, min: 1, required: true }, notes: String, status: { type: String, default: 'New', enum: ['New', 'Confirmed', 'Processing', 'Completed', 'Cancelled'] } }, { timestamps: true });
orderSchema.index({ createdAt: -1 });
const catalogueSchema = new mongoose.Schema({ productId: { type: String, required: true, unique: true }, fileName: { type: String, required: true }, data: { type: Buffer, required: true }, contentType: { type: String, default: 'application/pdf' }, size: Number }, { timestamps: true });
const productSchema = new mongoose.Schema({ id: { type: String, required: true, unique: true, index: true }, name: { type: String, required: true, trim: true }, category: { type: String, required: true, trim: true, index: true }, price: String, badge: String, description: String, image: String, features: String, specifications: String, colors: String, catalogName: String }, { timestamps: true, strict: true });
productSchema.index({ createdAt: -1 });

const Content = mongoose.model('Content', contentSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Enquiry = mongoose.model('Enquiry', enquirySchema);
const Order = mongoose.model('Order', orderSchema);
const Catalogue = mongoose.model('Catalogue', catalogueSchema);
const Product = mongoose.model('Product', productSchema);

const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
function publicProduct(doc) { const product = doc.toObject ? doc.toObject() : doc; return { ...product, _id: undefined, __v: undefined, catalogUrl: product.catalogName ? `/api/catalogue/${product.id}` : undefined }; }
async function content() { const record = await Content.findOne({ key: 'main' }).lean(); const products = await Product.find().sort({ createdAt: -1 }).lean(); return { ...record.data, products: products.length ? products.map(publicProduct) : (record.data.products || []) }; }
async function updateContent(fn) { const record = await Content.findOne({ key: 'main' }); const next = fn(record.data); record.data = next; record.markModified('data'); await record.save(); return next; }
async function seed() { const record = await Content.findOne({ key: 'main' }); if (!record) await Content.create({ key: 'main', data: initialContent }); else { const defaults = { phone: COMPANY_PHONE, email: 'sales@rkinnovations.com', address: 'No. 15, New No. 101, Periyar Street, Chennai, Tamil Nadu - 600 014.', whatsappNumber: COMPANY_WHATSAPP, whatsappMessage: 'Hello Raja Electricals, I would like to know more about your products.' }; const details = { features: 'High quality construction\nReliable performance\nSuitable for professional use', specifications: 'Brand|RAJA\nMaterial|Premium grade\nApplications|Industrial and commercial', colors: '#f5bd13,#ef2b1c,#ffffff,#111111', catalogUrl: '' }; const data = record.data; data.site = replaceLegacyContact({ ...defaults, ...data.site }); data.products = data.products.map(product => ({ ...details, ...product })); record.data = data; record.markModified('data'); await record.save(); } const email = (process.env.ADMIN_EMAIL || 'admin@rajaelectricals.in').toLowerCase(); if (!await Admin.exists({ email })) await Admin.create({ email, passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Raja@123', 12) }); }
async function migrateProducts() { const record = await Content.findOne({ key: 'main' }).lean(); for (const legacy of record?.data?.products || []) { const product = { ...legacy }; delete product.catalogUrl; await Product.updateOne({ id: product.id }, { $setOnInsert: product }, { upsert: true }); } }
const defaultProjects = [{ id: 'metro-rail', name: 'Chennai Metro Rail Project', category: 'Infrastructure', location: 'Chennai, Tamil Nadu', year: '2024', products: 'Electrical & Safety Products', description: 'Supplied electrical components and safety equipment for station construction and tunnel works.', image: '' }, { id: 'manufacturing-plant', name: 'Manufacturing Plant Supply', category: 'Industrial', location: 'Chennai, Tamil Nadu', year: '2024', products: 'Industrial Hardware & Tools', description: 'Ongoing supply of industrial tools, hardware and maintenance essentials.', image: '' }, { id: 'it-park', name: 'IT Park Construction', category: 'Commercial', location: 'Chennai, Tamil Nadu', year: '2024', products: 'Complete Electrical Package', description: 'Delivered electrical solutions including cables, switchgear and lighting.', image: '' }];
async function ensureContentDefaults() { const record = await Content.findOne({ key: 'main' }); if (!record) return; const data = record.data; data.site = replaceLegacyContact({ phone: COMPANY_PHONE, email: 'sales@rkinnovations.com', address: 'Chennai, Tamil Nadu', whatsappNumber: COMPANY_WHATSAPP, whatsappMessage: 'Hello Raja Electricals', heroImage2: photo('photo-1581092160607-ee22621dd758', 1300), heroImage3: photo('photo-1544724569-5f546fd6f2b5', 1300), aboutKicker: 'ABOUT RAJA ELECTRICALS', aboutTitle: 'Supply that keeps work moving.', aboutIntro: 'A dependable supply partner for professionals building, maintaining and growing.', aboutDescription: 'For over two decades, Raja Electricals has helped contractors, facilities and industrial teams source dependable products without unnecessary delays.', aboutValues: 'Genuine products with warranty\nHelpful technical guidance\nReliable local delivery\nProject and bulk-order support', aboutImage: photo('photo-1516321318423-f06f85e504b3', 1300), ...data.site }); data.products = (data.products || []).map(product => ({ features: 'High quality construction\nReliable performance\nSuitable for professional use', specifications: 'Brand|RAJA\nMaterial|Premium grade\nApplications|Industrial and commercial', colors: '#f5bd13,#ef2b1c,#ffffff,#111111', catalogUrl: '', ...product })); data.projects = (data.projects?.length ? data.projects : defaultProjects); record.data = data; record.markModified('data'); await record.save(); }
function auth(req, res, next) { try { req.admin = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), JWT_SECRET); next(); } catch { res.status(401).json({ error: 'Please sign in to continue.' }); } }

const BUCKET_NAME = 'RAJA_ELE';

const managedCollections = {
  products: ['id', 'name', 'category', 'description', 'price', 'image'],
  categories: ['id', 'name', 'image'],
  brands: ['id', 'name', 'logo'],
  industries: ['id', 'name', 'image'],
  gallery: ['id', 'title', 'image'],
  projects: ['id', 'name', 'description', 'image'],
};
const recordFromRow = row => {
  if (!row) return row;
  const { data, ...columns } = row;
  return { ...columns, ...(data && typeof data === 'object' ? data : {}) };
};
const recordsFromRows = rows => (rows || []).map(recordFromRow);
const rowForCollection = (collection, item) => {
  const columns = Object.fromEntries(
    managedCollections[collection]
      .filter(column => item[column] !== undefined && !(collection === 'products' && column === 'price' && typeof item.price !== 'number'))
      .map(column => [column, item[column]])
  );
  return { ...columns, data: item, updated_at: new Date().toISOString() };
};

async function uploadBase64ToStorage(base64Data, folder, identifier) {
  if (!base64Data || typeof base64Data !== 'string' || !base64Data.startsWith('data:image')) {
    return base64Data;
  }
  const match = base64Data.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!match) return base64Data;

  const contentType = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  let ext = 'png';
  if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg';
  else if (contentType.includes('webp')) ext = 'webp';
  else if (contentType.includes('png')) ext = 'png';

  const safeId = String(identifier || Date.now()).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filePath = `${folder}/${safeId}-${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, { contentType, upsert: true });

  if (error) {
    console.error(`Failed to upload image to Supabase Storage (${filePath}):`, error.message);
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return urlData?.publicUrl || base64Data;
}

async function safelyDeleteStorageImage(imageUrl, currentCollection, recordId) {
  try {
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.includes(`/object/public/${BUCKET_NAME}/`)) {
      return;
    }
    const storagePath = imageUrl.split(`/object/public/${BUCKET_NAME}/`)[1];
    if (!storagePath) return;

    const [pRes, bRes, gRes, cRes, iRes, prRes] = await Promise.all([
      supabase.from('products').select('id, image').neq('id', recordId),
      supabase.from('brands').select('id, logo').neq('id', recordId),
      supabase.from('gallery').select('id, image').neq('id', recordId),
      supabase.from('categories').select('id, image').neq('id', recordId),
      supabase.from('industries').select('id, image').neq('id', recordId),
      supabase.from('projects').select('id, image').neq('id', recordId)
    ]);

    const otherImages = [
      ...(pRes.data || []).map(p => recordFromRow(p)?.image),
      ...(bRes.data || []).map(b => recordFromRow(b)?.logo),
      ...(gRes.data || []).map(g => recordFromRow(g)?.image),
      ...(cRes.data || []).map(c => recordFromRow(c)?.image),
      ...(iRes.data || []).map(i => recordFromRow(i)?.image),
      ...(prRes.data || []).map(pr => recordFromRow(pr)?.image),
    ].filter(Boolean);

    const isReferencedElsewhere = otherImages.some(
      url => typeof url === 'string' && url.includes(storagePath)
    );

    if (isReferencedElsewhere) {
      console.log(`Storage file ${storagePath} is referenced elsewhere. Skipping deletion.`);
      return;
    }

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    if (error) {
      console.warn(`Safe storage cleanup warning for ${storagePath}:`, error.message);
    } else {
      console.log(`Successfully cleaned up unused storage file: ${storagePath}`);
    }
  } catch (err) {
    console.warn(`Exception during safe storage cleanup:`, err.message);
  }
}

// Public DTO Transformation: Strips huge embedded base64 strings from public JSON payload
const publicRecordDTO = (row, collection) => {
  const item = recordFromRow(row);
  if (!item) return item;

  const sanitizeImage = val => {
    if (typeof val === 'string' && val.startsWith('data:image')) {
      return '';
    }
    return val || '';
  };

  if (collection === 'products') {
    let img = item.image || '';
    if (typeof img === 'string' && img.startsWith('data:image')) {
      img = `/api/products/${item.id}/image`;
    }
    return {
      id: item.id || '',
      name: item.name || '',
      category: item.category || '',
      subcategory: item.subcategory || '',
      price: item.price || 'Price on request',
      badge: item.badge || 'Available',
      description: item.description || '',
      image: img,
      updated_at: item.updated_at || item.updatedAt,
      catalogUrl: item.catalogName ? `/api/catalogue/${item.id}` : undefined,
    };
  }

  if (['gallery', 'categories', 'industries', 'projects'].includes(collection)) {
    return {
      ...item,
      image: sanitizeImage(item.image),
    };
  }

  if (collection === 'brands') {
    return {
      ...item,
      logo: sanitizeImage(item.logo),
    };
  }

  return item;
};

const publicRecordsFromRows = (rows, collection) =>
  (rows || []).map(row => publicRecordDTO(row, collection));

// Configurable In-Memory Content Cache with Stampede Protection & Stale Fallback
let contentCache = null;
let contentCacheTime = 0;
let inFlightContentPromise = null;
let globalContentRevision = Date.now();

function invalidateContentCache() {
  contentCache = null;
  contentCacheTime = 0;
  inFlightContentPromise = null;
  globalContentRevision = Date.now();
}

async function fetchFreshContent() {
  const [
    siteResult,
    productsResult,
    projectsResult,
    galleryResult,
    brandsResult,
    categoriesResult,
    industriesResult,
  ] = await Promise.all([
    supabase.from('site_settings').select('data').eq('id', 1).maybeSingle(),
    supabase.from('products').select('*'),
    supabase.from('projects').select('*'),
    supabase.from('gallery').select('*'),
    supabase.from('brands').select('*'),
    supabase.from('categories').select('*'),
    supabase.from('industries').select('*'),
  ]);

  const results = [
    siteResult,
    productsResult,
    projectsResult,
    galleryResult,
    brandsResult,
    categoriesResult,
    industriesResult,
  ];

  const failed = results.find(result => result.error);
  if (failed) {
    throw new Error(failed.error.message || 'Supabase query failed');
  }

  const siteData = siteResult.data?.data || {};

  const galleryRows = publicRecordsFromRows(galleryResult.data, 'gallery');
  galleryRows.sort((a, b) => (Number(a.display_order) || 999) - (Number(b.display_order) || 999));

  const categoriesRows = publicRecordsFromRows(categoriesResult.data, 'categories')
    .filter(c => c.is_active !== false && c.is_active !== 'false');
  categoriesRows.sort((a, b) => (Number(a.display_order) || 999) - (Number(b.display_order) || 999));

  const brandsRows = publicRecordsFromRows(brandsResult.data, 'brands');
  brandsRows.sort((a, b) => (Number(a.display_order) || 999) - (Number(b.display_order) || 999));

  const payload = {
    ...siteData,
    products: publicRecordsFromRows(productsResult.data, 'products'),
    projects: publicRecordsFromRows(projectsResult.data, 'projects'),
    gallery: galleryRows,
    brands: brandsRows,
    categories: categoriesRows,
    industries: publicRecordsFromRows(industriesResult.data, 'industries'),
  };

  contentCache = payload;
  contentCacheTime = Date.now();
  return payload;
}

// Authentication
app.post('/api/auth/login', async (req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'no-store, private');
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const { data: admin, error } = await supabase
      .from('admins')
      .select('email, password_hash')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;

    if (!admin?.password_hash || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ email: admin.email }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({ token });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/logout', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store, private');
  res.sendStatus(204);
});

app.get('/api/health', (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  const connected = mongoose.connection.readyState === 1;
  res.json({ ok: connected, mongodb: connected ? 'connected' : 'disconnected', initialized: isInitialized });
});

app.get('/robots.txt', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(`User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /admin
Disallow: /api/admin
Disallow: /api/auth

Sitemap: https://raj-ms-client-seven.vercel.app/sitemap.xml
`);
});

app.get('/sitemap.xml', (_req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');

  const domain = 'https://raj-ms-client-seven.vercel.app';
  const now = new Date().toISOString();

  const staticUrls = [
    { loc: `${domain}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${domain}/#products`, priority: '0.9', changefreq: 'daily' },
    { loc: `${domain}/#brands`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${domain}/#gallery`, priority: '0.7', changefreq: 'weekly' },
    { loc: `${domain}/#about`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${domain}/#contact`, priority: '0.8', changefreq: 'monthly' }
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.send(xml);
});

// Optimized Content Endpoint with ETag 304 Revalidation & Immediate Admin Update Freshness
const getContentCacheTTL = () => (parseInt(process.env.CONTENT_CACHE_TTL, 10) || 300) * 1000;

app.get('/api/content', async (req, res, next) => {
  try {
    const etag = `W/"rev-${globalContentRevision}"`;
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');

    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    const now = Date.now();
    const ttl = getContentCacheTTL();

    // 1. Return fresh in-memory cache if valid
    if (contentCache && (now - contentCacheTime < ttl)) {
      return res.json(contentCache);
    }

    // 2. Request Coalescing (Stampede Protection)
    if (!inFlightContentPromise) {
      inFlightContentPromise = fetchFreshContent().finally(() => {
        inFlightContentPromise = null;
      });
    }

    try {
      const payload = await inFlightContentPromise;
      return res.json(payload);
    } catch (dbError) {
      // 3. Stale Cache Fallback
      if (contentCache) {
        console.warn('Upstream database warning, serving stale content cache:', dbError.message);
        return res.json(contentCache);
      }
      throw dbError;
    }
  } catch (e) {
    next(e);
  }
});

// Site Settings Update
app.put('/api/site', auth, async (req, res, next) => {
  try {
    const current = await supabase.from('site_settings').select('data').eq('id', 1).maybeSingle();
    if (current.error) throw current.error;
    const site = { ...(current.data?.data?.site || {}), ...req.body };
    const data = { ...(current.data?.data || {}), site };
    const { error } = await supabase.from('site_settings').upsert({ id: 1, data, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    if (error) throw error;
    invalidateContentCache();
    res.json(site);
  } catch (error) { next(error); }
});

// Dynamic Collections Routes
app.post('/api/:collection', (req, res, next) => {
  if (['enquiries', 'orders', 'home-ads'].includes(req.params.collection)) return next('route');
  return auth(req, res, next);
}, async (req, res, next) => {
  try {
    const collection = req.params.collection;
    if (!managedCollections[collection]) return res.status(404).json({ error: 'Unknown collection.' });

    let item = { ...req.body, id: req.body.id || id() };

    // Automatic Supabase Storage upload for Base64 image/logo payloads
    if (item.image && typeof item.image === 'string' && item.image.startsWith('data:image')) {
      item.image = await uploadBase64ToStorage(item.image, collection, item.id);
    }
    if (item.logo && typeof item.logo === 'string' && item.logo.startsWith('data:image')) {
      item.logo = await uploadBase64ToStorage(item.logo, collection, item.id);
    }

    const rowPayload = rowForCollection(collection, item);
    const { data, error } = await supabase.from(collection).insert(rowPayload).select().single();
    if (error) {
      if (item.image && typeof item.image === 'string' && item.image.includes('/object/public/RAJA_ELE/')) {
        safelyDeleteStorageImage(item.image, collection, item.id);
      }
      if (item.logo && typeof item.logo === 'string' && item.logo.includes('/object/public/RAJA_ELE/')) {
        safelyDeleteStorageImage(item.logo, collection, item.id);
      }
      return res.status(400).json({ error: error.message || 'Database insert failed.' });
    }

    invalidateContentCache();
    res.status(201).json(recordFromRow(data));
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to create item.' });
  }
});

app.put('/api/:collection/:id', (req, res, next) => {
  if (req.params.collection === 'home-ads') return next('route');
  return auth(req, res, next);
}, async (req, res, next) => {
  try {
    const collection = req.params.collection;
    if (!managedCollections[collection]) return res.status(404).json({ error: 'Unknown collection.' });

    const existing = await supabase.from(collection).select('*').eq('id', req.params.id).maybeSingle();
    if (existing.error) return res.status(400).json({ error: existing.error.message });
    if (!existing.data) return res.status(404).json({ error: 'Item not found.' });

    const existingRecord = recordFromRow(existing.data);
    let item = { ...existingRecord, ...req.body, id: req.params.id };

    if (req.body.image && typeof req.body.image === 'string' && req.body.image.startsWith('data:image')) {
      item.image = await uploadBase64ToStorage(req.body.image, collection, req.params.id);
    } else if (req.body.image === undefined) {
      item.image = existingRecord.image;
    }

    if (req.body.logo && typeof req.body.logo === 'string' && req.body.logo.startsWith('data:image')) {
      item.logo = await uploadBase64ToStorage(req.body.logo, collection, req.params.id);
    } else if (req.body.logo === undefined) {
      item.logo = existingRecord.logo;
    }

    const rowPayload = rowForCollection(collection, item);
    const { data, error } = await supabase.from(collection).update(rowPayload).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: error.message || 'Database update failed.' });

    if (req.body.image && typeof req.body.image === 'string' && req.body.image.startsWith('data:image') && existingRecord.image && existingRecord.image !== item.image) {
      safelyDeleteStorageImage(existingRecord.image, collection, req.params.id);
    }
    if (req.body.logo && typeof req.body.logo === 'string' && req.body.logo.startsWith('data:image') && existingRecord.logo && existingRecord.logo !== item.logo) {
      safelyDeleteStorageImage(existingRecord.logo, collection, req.params.id);
    }

    invalidateContentCache();
    res.json(recordFromRow(data));
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to update item.' });
  }
});

app.delete('/api/:collection/:id', (req, res, next) => {
  if (req.params.collection === 'home-ads') return next('route');
  return auth(req, res, next);
}, async (req, res, next) => {
  try {
    const collection = req.params.collection;
    if (!managedCollections[collection]) return res.status(404).json({ error: 'Unknown collection.' });

    if (collection === 'categories') {
      const { data: catRow } = await supabase.from('categories').select('*').eq('id', req.params.id).maybeSingle();
      const catName = catRow ? recordFromRow(catRow).name : null;
      if (catName) {
        const { data: linkedBrands } = await supabase.from('brands').select('*');
        const count = (linkedBrands || []).filter(b => {
          const cat = recordFromRow(b).category;
          return cat && cat.trim().toLowerCase() === catName.trim().toLowerCase();
        }).length;
        if (count > 0 && req.query.force !== 'true') {
          return res.status(400).json({
            error: `Cannot delete category "${catName}" because ${count} brand(s) are assigned to it. Reassign or delete the brands first.`
          });
        }
      }
    }

    const { data: existingRow } = await supabase.from(collection).select('*').eq('id', req.params.id).maybeSingle();
    const existingRecord = existingRow ? recordFromRow(existingRow) : null;

    const { error, count } = await supabase.from(collection).delete({ count: 'exact' }).eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message || 'Database delete failed.' });
    if (!count) return res.status(404).json({ error: 'Item not found.' });

    invalidateContentCache();

    if (existingRecord) {
      const imageToClean = existingRecord.image || existingRecord.logo;
      if (imageToClean) {
        safelyDeleteStorageImage(imageToClean, collection, req.params.id);
      }
    }

    res.sendStatus(204);
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to delete item.' });
  }
});

// Product Image Stream Route (Serves product images uploaded via Admin without embedding heavy base64 in content payload)
app.get('/api/products/:id/image', async (req, res, next) => {
  try {
    const { data: row, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    const item = recordFromRow(row);
    const imgData = item?.image;

    if (!imgData || typeof imgData !== 'string') {
      return res.status(404).json({ error: 'Product image not found.' });
    }

    if (imgData.startsWith('data:image')) {
      const match = imgData.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        const contentType = match[1];
        const buffer = Buffer.from(match[2], 'base64');
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        return res.send(buffer);
      }
    }

    if (imgData.startsWith('http://') || imgData.startsWith('https://')) {
      return res.redirect(imgData);
    }

    return res.status(404).json({ error: 'Image not available in binary format.' });
  } catch (error) {
    next(error);
  }
});

// Enquiries & Orders (Public Submissions)
app.post('/api/enquiries', async (req, res, next) => {
  try {
    const { name, phone, company, email, product, quantity, message, source } = req.body || {};
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone number are required.' });
    const submittedAt = new Date().toISOString();
    const enquiry = {
      name: String(name).trim(),
      phone: String(phone).trim(),
      company: String(company || '').trim(),
      email: String(email || '').trim(),
      product: String(product || '').trim(),
      quantity: String(quantity || '').trim(),
      message: String(message || '').trim(),
      source: String(source || 'Contact page').trim(),
      status: 'New',
      submittedAt,
    };
    const { error } = await supabase.from('enquiries').insert({ data: enquiry, created_at: submittedAt });
    if (error) throw error;
    res.status(201).json({ message: 'Thanks — your enquiry has been sent.' });
  } catch (error) { next(error); }
});

app.post('/api/orders', async (req, res, next) => {
  try {
    const { customerName, phone, productName, quantity } = req.body || {};
    if (!customerName || !phone || !productName || !quantity) return res.status(400).json({ error: 'Customer details, product and quantity are required.' });
    const { error } = await supabase.from('orders').insert({ data: { ...req.body, status: 'New' }, created_at: new Date().toISOString() });
    if (error) throw error;
    res.status(201).json({ message: 'Your order request has been received.' });
  } catch (error) { next(error); }
});

// Admin Records Fetch & Patch
app.get('/api/admin/:collection', auth, async (req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'no-store, private');
    if (!['enquiries', 'orders'].includes(req.params.collection)) return res.status(404).json({ error: 'Unknown record type.' });
    const { data, error } = await supabase.from(req.params.collection).select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(recordsFromRows(data));
  } catch (error) { next(error); }
});

app.patch('/api/admin/:collection/:id', auth, async (req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'no-store, private');
    if (!['enquiries', 'orders'].includes(req.params.collection)) return res.status(404).json({ error: 'Unknown record type.' });
    const existing = await supabase.from(req.params.collection).select('*').eq('id', req.params.id).maybeSingle();
    if (existing.error) throw existing.error;
    if (!existing.data) return res.status(404).json({ error: 'Item not found.' });
    const data = { ...(existing.data.data || {}), status: req.body.status };
    const result = await supabase.from(req.params.collection).update({ data }).eq('id', req.params.id).select().single();
    if (result.error) throw result.error;
    res.json(recordFromRow(result.data));
  } catch (error) { next(error); }
});

app.delete('/api/admin/:collection/:id', auth, async (req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'no-store, private');
    const collection = req.params.collection;
    if (!['enquiries', 'orders'].includes(collection)) {
      return res.status(404).json({ error: 'Unknown record type.' });
    }

    const { error, count } = await supabase
      .from(collection)
      .delete({ count: 'exact' })
      .eq('id', req.params.id);

    if (error) return res.status(400).json({ error: error.message || 'Database delete failed.' });
    if (!count) return res.status(404).json({ error: 'Record not found.' });

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

// Home Ads CMS Backend Implementation
async function getHomeAdsFromSettings() {
  try {
    const { data: current, error } = await supabase.from('site_settings').select('data').eq('id', 1).maybeSingle();
    if (error) {
      console.warn('Error reading site_settings for home_ads:', error.message);
      return [];
    }
    const rootData = current?.data || {};
    return Array.isArray(rootData.home_ads) ? rootData.home_ads : [];
  } catch (err) {
    console.warn('Exception reading home_ads from settings:', err.message);
    return [];
  }
}

async function updateHomeAdsInSettings(newHomeAds) {
  const { data: current, error: selectErr } = await supabase.from('site_settings').select('data').eq('id', 1).maybeSingle();
  if (selectErr) throw selectErr;

  const existingRootData = current?.data && typeof current.data === 'object' ? current.data : {};
  const updatedRootData = {
    ...existingRootData,
    home_ads: newHomeAds
  };

  const { error: upsertErr } = await supabase
    .from('site_settings')
    .upsert({ id: 1, data: updatedRootData, updated_at: new Date().toISOString() }, { onConflict: 'id' });

  if (upsertErr) throw upsertErr;
  invalidateContentCache();
  return newHomeAds;
}

async function ensureInitialHomeAdMigration() {
  try {
    const existingAds = await getHomeAdsFromSettings();
    if (existingAds.length > 0) {
      return;
    }

    const fs = require('fs');
    const localImagePath = path.join(__dirname, '../client/src/assets/addimage/add.jpeg');

    if (!fs.existsSync(localImagePath)) {
      console.warn('Initial promo image add.jpeg not found on disk. Skipping initial ad migration.');
      return;
    }

    const buffer = fs.readFileSync(localImagePath);
    const fileName = `home-ads/initial-promotion-banner-${Date.now()}.jpg`;

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });

    if (uploadErr) {
      console.warn('Failed to upload initial promo image add.jpeg to storage:', uploadErr.message);
      return;
    }

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    const publicUrl = urlData?.publicUrl;

    if (!publicUrl) return;

    const initialAd = {
      id: `ad-${Date.now()}`,
      title: 'Special Promotion Banner',
      image_url: publicUrl,
      link_url: '',
      is_active: true,
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await updateHomeAdsInSettings([initialAd]);
    console.log('Successfully migrated initial add.jpeg promo banner to Supabase Storage & home_ads!');
  } catch (err) {
    console.warn('Warning: Initial home ad migration exception:', err.message);
  }
}

// Public Lightweight Endpoint for Active Home Advertisement
app.get('/api/home-ads/active', async (req, res, next) => {
  try {
    const etag = `W/"rev-${globalContentRevision}"`;
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');

    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    const ads = await getHomeAdsFromSettings();
    const activeAd = ads.find(ad => ad.is_active && ad.image_url && typeof ad.image_url === 'string' && ad.image_url.trim() !== '');

    if (!activeAd) {
      return res.json({ success: true, data: null });
    }

    return res.json({
      success: true,
      data: {
        id: activeAd.id,
        title: activeAd.title || 'Special offer',
        image_url: activeAd.image_url,
        link_url: activeAd.link_url || '',
        is_active: true
      }
    });
  } catch (error) {
    res.json({ success: true, data: null });
  }
});

// Admin Home Ads CRUD Routes
app.get('/api/home-ads', auth, async (_req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'no-store, private');
    const ads = await getHomeAdsFromSettings();
    ads.sort((a, b) => (Number(a.display_order) || 999) - (Number(b.display_order) || 999));
    res.json(ads);
  } catch (error) { next(error); }
});

app.post('/api/home-ads', auth, async (req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'no-store, private');
    const { title, image, link_url, is_active, display_order } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Advertisement title is required.' });
    }

    const adId = `ad-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    let imageUrl = image;

    if (typeof image === 'string' && image.startsWith('data:image')) {
      imageUrl = await uploadBase64ToStorage(image, 'home-ads', adId);
    }

    if (!imageUrl) {
      return res.status(400).json({ error: 'Advertisement image is required.' });
    }

    const wantActive = is_active === true || is_active === 'true';
    const existingAds = await getHomeAdsFromSettings();

    const updatedAds = existingAds.map(ad => ({
      ...ad,
      is_active: wantActive ? false : (ad.is_active !== false)
    }));

    const newAd = {
      id: adId,
      title: title.trim(),
      image_url: imageUrl,
      link_url: String(link_url || '').trim(),
      is_active: wantActive || (updatedAds.length === 0),
      display_order: parseInt(display_order, 10) || updatedAds.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (newAd.is_active) {
      updatedAds.forEach(a => { a.is_active = false; });
    }

    updatedAds.push(newAd);
    await updateHomeAdsInSettings(updatedAds);

    res.status(201).json(newAd);
  } catch (error) { next(error); }
});

app.put('/api/home-ads/:id', auth, async (req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'no-store, private');
    const existingAds = await getHomeAdsFromSettings();
    const index = existingAds.findIndex(a => a.id === req.params.id);

    if (index < 0) {
      return res.status(404).json({ error: 'Advertisement not found.' });
    }

    const existingAd = existingAds[index];
    let imageUrl = existingAd.image_url;

    if (req.body.image && typeof req.body.image === 'string' && req.body.image.startsWith('data:image')) {
      imageUrl = await uploadBase64ToStorage(req.body.image, 'home-ads', req.params.id);
    }

    const wantActive = req.body.is_active !== undefined ? (req.body.is_active === true || req.body.is_active === 'true') : existingAd.is_active;

    let updatedAds = existingAds.map(ad => {
      if (ad.id === req.params.id) {
        return {
          ...ad,
          title: req.body.title ? String(req.body.title).trim() : ad.title,
          image_url: imageUrl,
          link_url: req.body.link_url !== undefined ? String(req.body.link_url).trim() : ad.link_url,
          is_active: wantActive,
          display_order: req.body.display_order !== undefined ? parseInt(req.body.display_order, 10) || ad.display_order : ad.display_order,
          updated_at: new Date().toISOString()
        };
      }
      return {
        ...ad,
        is_active: wantActive ? false : ad.is_active
      };
    });

    await updateHomeAdsInSettings(updatedAds);

    if (req.body.image && typeof req.body.image === 'string' && req.body.image.startsWith('data:image') && existingAd.image_url && existingAd.image_url !== imageUrl) {
      safelyDeleteStorageImage(existingAd.image_url, 'home_ads', req.params.id);
    }

    const savedAd = updatedAds.find(a => a.id === req.params.id);
    res.json(savedAd);
  } catch (error) { next(error); }
});

app.patch('/api/home-ads/:id/active', auth, async (req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'no-store, private');
    const existingAds = await getHomeAdsFromSettings();
    const index = existingAds.findIndex(a => a.id === req.params.id);

    if (index < 0) {
      return res.status(404).json({ error: 'Advertisement not found.' });
    }

    const wantActive = req.body.is_active === true || req.body.is_active === 'true';

    const updatedAds = existingAds.map(ad => ({
      ...ad,
      is_active: ad.id === req.params.id ? wantActive : (wantActive ? false : ad.is_active)
    }));

    await updateHomeAdsInSettings(updatedAds);
    const savedAd = updatedAds.find(a => a.id === req.params.id);
    res.json(savedAd);
  } catch (error) { next(error); }
});

app.delete('/api/home-ads/:id', auth, async (req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'no-store, private');
    const existingAds = await getHomeAdsFromSettings();
    const targetAd = existingAds.find(a => a.id === req.params.id);

    if (!targetAd) {
      return res.status(404).json({ error: 'Advertisement not found.' });
    }

    const remainingAds = existingAds.filter(a => a.id !== req.params.id);

    if (targetAd.is_active && remainingAds.length > 0) {
      remainingAds[0].is_active = true;
    }

    await updateHomeAdsInSettings(remainingAds);

    if (targetAd.image_url) {
      safelyDeleteStorageImage(targetAd.image_url, 'home_ads', req.params.id);
    }

    res.sendStatus(204);
  } catch (error) { next(error); }
});

// 404 & Error Handlers
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'API route not found'
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err?.name === 'ValidationError') return res.status(400).json({ error: Object.values(err.errors).map(item => item.message).join(' ') });
  if (err?.code === 11000) return res.status(409).json({ error: 'A record with the same unique value already exists.' });
  if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'The uploaded image or catalogue is too large.' });
  res.status(err.status || 500).json({ error: 'Something went wrong. Please try again.' });
});

let isInitialized = false;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Raja Electricals API running on port ${PORT}`);
  ensureInitialHomeAdMigration();
});

// MongoDB is optional after the Supabase migration.
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => Promise.all([seed(), ensureContentDefaults(), migrateProducts()]))
    .then(() => { isInitialized = true; console.log('Legacy MongoDB initialization complete'); })
    .catch(error => console.error('Legacy MongoDB initialization warning (non-blocking):', error.message));
} else {
  isInitialized = true;
  console.log('Running with Supabase only.');
}

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});
