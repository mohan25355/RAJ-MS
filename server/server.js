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

app.use(compression());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
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

const managedCollections = {
  products: ['id', 'name', 'category', 'description', 'price', 'image'],
  categories: ['id', 'name', 'description', 'icon', 'color', 'image', 'display_order', 'is_active', 'count'],
  brands: ['id', 'name', 'category', 'category_id', 'logo', 'websiteUrl', 'website_url', 'description', 'display_order', 'is_active', 'products'],
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

const getContentCacheTTL = () => (parseInt(process.env.CONTENT_CACHE_TTL, 10) || 300) * 1000;

function invalidateContentCache() {
  contentCache = null;
  contentCacheTime = 0;
  inFlightContentPromise = null;
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
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('projects').select('*').order('created_at', { ascending: false }),
    supabase.from('gallery').select('*').order('created_at', { ascending: false }),
    supabase.from('brands').select('*').order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('created_at', { ascending: false }),
    supabase.from('industries').select('*').order('created_at', { ascending: false }),
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

  const payload = {
    ...siteData,
    products: publicRecordsFromRows(productsResult.data, 'products'),
    projects: publicRecordsFromRows(projectsResult.data, 'projects'),
    gallery: galleryRows,
    brands: publicRecordsFromRows(brandsResult.data, 'brands'),
    categories: publicRecordsFromRows(categoriesResult.data, 'categories'),
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

// Optimized Content Endpoint with Server Cache, Stampede Protection & Stale Fallback
app.get('/api/content', async (_req, res, next) => {
  try {
    const now = Date.now();
    const ttl = getContentCacheTTL();

    // 1. Return fresh cache if valid
    if (contentCache && (now - contentCacheTime < ttl)) {
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
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
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      return res.json(payload);
    } catch (dbError) {
      // 3. Stale Cache Fallback
      if (contentCache) {
        console.warn('Upstream database warning, serving stale content cache:', dbError.message);
        res.setHeader('Cache-Control', 'public, max-age=30');
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
  if (['enquiries', 'orders'].includes(req.params.collection)) return next('route');
  return auth(req, res, next);
}, async (req, res, next) => {
  try {
    const collection = req.params.collection;
    if (!managedCollections[collection]) return res.status(404).json({ error: 'Unknown collection.' });
    const item = { ...req.body, id: req.body.id || id() };
    const { data, error } = await supabase.from(collection).insert(rowForCollection(collection, item)).select().single();
    if (error) throw error;
    invalidateContentCache();
    res.status(201).json(recordFromRow(data));
  } catch (error) { next(error); }
});

app.put('/api/:collection/:id', auth, async (req, res, next) => {
  try {
    const collection = req.params.collection;
    if (!managedCollections[collection]) return res.status(404).json({ error: 'Unknown collection.' });
    const existing = await supabase.from(collection).select('*').eq('id', req.params.id).maybeSingle();
    if (existing.error) throw existing.error;
    if (!existing.data) return res.status(404).json({ error: 'Item not found.' });
    const item = { ...recordFromRow(existing.data), ...req.body, id: req.params.id };
    const { data, error } = await supabase.from(collection).update(rowForCollection(collection, item)).eq('id', req.params.id).select().single();
    if (error) throw error;
    invalidateContentCache();
    res.json(recordFromRow(data));
  } catch (error) { next(error); }
});

app.delete('/api/:collection/:id', auth, async (req, res, next) => {
  try {
    const collection = req.params.collection;
    if (!managedCollections[collection]) return res.status(404).json({ error: 'Unknown collection.' });
    const { error, count } = await supabase.from(collection).delete({ count: 'exact' }).eq('id', req.params.id);
    if (error) throw error;
    if (!count) return res.status(404).json({ error: 'Item not found.' });
    invalidateContentCache();
    res.sendStatus(204);
  } catch (error) { next(error); }
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
