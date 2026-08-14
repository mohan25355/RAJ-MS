const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 10000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-development-secret';
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
const initialContent = { site: { businessName: "Raja Electricals 'N' Hardware", welcome: "Welcome to Raja Electricals 'N' Hardware", heroTitle: 'Powering Every Project.', heroText: 'Electrical · Hardware · Safety · Industrial Solutions', heroImage: photo('photo-1565008447742-97f6f38c985c', 1300), deliveryText: 'Same Day Delivery Available', trustYears: '25+', productCount: '5000+', happyClients: '2000+', supplyTitle: 'Supply that keeps work moving.', supplyText: 'For over two decades, Raja Electricals has helped contractors, facilities and industrial teams source dependable products without unnecessary delays.' }, categories: [{ id: 'electricals', name: 'Electricals', image: photo('photo-1581092160607-ee22621dd758'), count: '250+ Products' }, { id: 'safety', name: 'Industrial Safety', image: photo('photo-1586864387967-d02ef85d93e8'), count: '300+ Products' }, { id: 'tools', name: 'Hardware & Tools', image: photo('photo-1530124566582-a618bc2615dc'), count: '600+ Products' }, { id: 'pumps', name: 'Water Pumps', image: photo('photo-1581093458791-9d09d2e70ae4'), count: '100+ Products' }], products: [{ id: 'cables', name: 'Industrial Cables', image: photo('photo-1544724569-5f546fd6f2b5'), price: 'From ₹450', badge: 'Best Seller', category: 'Electricals', description: 'Reliable cables for industrial and commercial applications.' }, { id: 'helmets', name: 'Safety Helmets', image: photo('photo-1590650153855-d9e808231d41'), price: 'From ₹180', badge: 'Essential', category: 'Industrial Safety', description: 'Comfortable, durable PPE for site teams.' }, { id: 'lighting', name: 'LED Flood Lights', image: photo('photo-1524484485831-a92ffc0de03f'), price: 'From ₹890', badge: 'New', category: 'Electricals', description: 'High-output lighting for indoor and outdoor sites.' }, { id: 'toolkit', name: 'Power Tools Kit', image: photo('photo-1504148455328-c376907d081c'), price: 'From ₹2,499', badge: 'Popular', category: 'Hardware & Tools', description: 'Professional power tools for daily trade work.' }], brands: [{ id: 'havells', name: 'Havells', logo: 'https://dummyimage.com/240x110/ffffff/cc0000&text=HAVELLS', category: 'Electrical', products: '250+', description: 'Electrical equipment and consumer products.' }, { id: 'bosch', name: 'Bosch', logo: 'https://dummyimage.com/240x110/ffffff/e00000&text=BOSCH', category: 'Tools', products: '120+', description: 'Professional tools and accessories.' }, { id: '3m', name: '3M Safety', logo: 'https://dummyimage.com/240x110/ffffff/cc0000&text=3M', category: 'Safety', products: '90+', description: 'Trusted personal protection solutions.' }], industries: [{ id: 'construction', name: 'Construction', image: photo('photo-1503387762-592deb58ef4e'), description: 'Site-ready supply for contractors and infrastructure teams.' }, { id: 'manufacturing', name: 'Manufacturing', image: photo('photo-1513828583688-c52646db42da'), description: 'Maintenance, safety and electrical supplies for plants.' }, { id: 'facilities', name: 'Facilities', image: photo('photo-1497366754035-f200968a6e72'), description: 'Everyday essentials to keep your facility running.' }], gallery: [{ id: 'g1', title: 'Site supply', image: photo('photo-1503387762-592deb58ef4e'), type: 'Projects' }, { id: 'g2', title: 'Safety range', image: photo('photo-1586864387967-d02ef85d93e8'), type: 'Products' }, { id: 'g3', title: 'Tools collection', image: photo('photo-1530124566582-a618bc2615dc'), type: 'Products' }, { id: 'g4', title: 'Delivery ready', image: photo('photo-1565008447742-97f6f38c985c'), type: 'Store' }] };

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
function publicItem(doc) { return { ...doc.toObject(), id: doc._id.toString(), _id: undefined }; }

app.get('/api/health', (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.json({ ok: connected, mongodb: connected ? 'connected' : 'disconnected', initialized: isInitialized });
});
app.get('/api/content', async (_req, res, next) => { try { res.json(await content()); } catch (e) { next(e); } });
app.post('/api/auth/login', async (req, res, next) => { try { const admin = await Admin.findOne({ email: String(req.body.email || '').toLowerCase() }); if (!admin || !await bcrypt.compare(req.body.password || '', admin.passwordHash)) return res.status(401).json({ error: 'Invalid email or password.' }); const token = jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' }); res.json({ token, admin: { email: admin.email } }); } catch (e) { next(e); } });
app.post('/api/auth/logout', auth, (_req, res) => res.status(204).end());
app.put('/api/site', auth, async (req, res, next) => { try { const data = await updateContent(data => ({ ...data, site: { ...data.site, ...req.body } })); res.json(data.site); } catch (e) { next(e); } });
app.post('/api/enquiries', async (req, res, next) => { try { const { name, phone, email, company, product, quantity, message } = req.body; if (!name || !phone) return res.status(400).json({ error: 'Name and phone number are required.' }); const enquiry = await Enquiry.create({ name, phone, email, company, product, quantity, message }); res.status(201).json({ enquiry: publicItem(enquiry), message: 'Thanks — your enquiry has been sent.' }); } catch (e) { next(e); } });
app.post('/api/orders', async (req, res, next) => { try { const { customerName, phone, email, company, productId, productName, quantity, notes } = req.body; if (!customerName || !phone || !productName || !quantity) return res.status(400).json({ error: 'Customer details, product and quantity are required.' }); const order = await Order.create({ customerName, phone, email, company, productId, productName, quantity, notes }); res.status(201).json({ order: publicItem(order), message: 'Your order request has been received.' }); } catch (e) { next(e); } });
app.post('/api/products', auth, async (req, res, next) => { try { const product = await Product.create({ ...req.body, id: req.body.id || id() }); res.status(201).json(publicProduct(product)); } catch (e) { next(e); } });
app.put('/api/products/:id/catalogue', auth, async (req, res, next) => { try { const { fileName, data } = req.body || {}; if (!fileName || !data) return res.status(400).json({ error: 'Catalogue file is required.' }); const product = await Product.findOne({ id: req.params.id }); if (!product) return res.status(404).json({ error: 'Product not found.' }); const buffer = Buffer.from(String(data).split(',')[1] || String(data), 'base64'); if (!buffer.length) return res.status(400).json({ error: 'The uploaded file is empty or invalid.' }); product.catalogName = String(fileName).slice(0, 120); await Promise.all([product.save(), Catalogue.findOneAndUpdate({ productId: req.params.id }, { fileName: product.catalogName, data: buffer, contentType: 'application/pdf', size: buffer.length }, { upsert: true })]); res.json(publicProduct(product)); } catch (e) { next(e); } });
app.delete('/api/products/:id/catalogue', auth, async (req, res, next) => { try { const product = await Product.findOneAndUpdate({ id: req.params.id }, { $unset: { catalogName: 1 } }, { new: true }); if (!product) return res.status(404).json({ error: 'Product not found.' }); await Catalogue.deleteOne({ productId: req.params.id }); res.status(204).end(); } catch (e) { next(e); } });
app.put('/api/products/:id', auth, async (req, res, next) => { try { const product = await Product.findOneAndUpdate({ id: req.params.id }, { ...req.body, id: req.params.id }, { new: true, runValidators: true }); if (!product) return res.status(404).json({ error: 'Product not found.' }); res.json(publicProduct(product)); } catch (e) { next(e); } });
app.delete('/api/products/:id', auth, async (req, res, next) => { try { const product = await Product.findOneAndDelete({ id: req.params.id }); if (!product) return res.status(404).json({ error: 'Product not found.' }); await Catalogue.deleteOne({ productId: req.params.id }); res.status(204).end(); } catch (e) { next(e); } });
app.post('/api/:collection', auth, async (req, res, next) => { try { const allowed = ['categories', 'brands', 'industries', 'gallery', 'projects']; if (!allowed.includes(req.params.collection)) return res.status(404).json({ error: 'Unknown collection.' }); const item = { ...req.body, id: req.body.id || id() }; await updateContent(data => ({ ...data, [req.params.collection]: [...(data[req.params.collection] || []), item] })); res.status(201).json(item); } catch (e) { next(e); } });
app.get('/api/catalogue/:productId', async (req, res, next) => { try { const file = await Catalogue.findOne({ productId: req.params.productId }); if (!file) return res.status(404).json({ error: 'Catalogue not found.' }); res.setHeader('Content-Type', file.contentType || 'application/pdf'); res.setHeader('Content-Disposition', `attachment; filename="${String(file.fileName).replace(/[^a-zA-Z0-9._-]/g, '_')}"`); res.setHeader('Content-Length', file.data.length); res.send(file.data); } catch (e) { next(e); } });
app.put('/api/:collection/:id', auth, async (req, res, next) => { try { const allowed = ['categories', 'brands', 'industries', 'gallery', 'projects']; if (!allowed.includes(req.params.collection)) return res.status(404).json({ error: 'Unknown collection.' }); let result; await updateContent(data => { const index = data[req.params.collection].findIndex(x => x.id === req.params.id); if (index < 0) return data; result = { ...data[req.params.collection][index], ...req.body, id: req.params.id }; const items = [...data[req.params.collection]]; items[index] = result; return { ...data, [req.params.collection]: items }; }); if (!result) return res.status(404).json({ error: 'Item not found.' }); res.json(result); } catch (e) { next(e); } });
app.delete('/api/:collection/:id', auth, async (req, res, next) => { try { const allowed = ['categories', 'brands', 'industries', 'gallery', 'projects']; if (!allowed.includes(req.params.collection)) return res.status(404).json({ error: 'Unknown collection.' }); await updateContent(data => ({ ...data, [req.params.collection]: data[req.params.collection].filter(x => x.id !== req.params.id) })); res.status(204).end(); } catch (e) { next(e); } });
app.get('/api/admin/enquiries', auth, async (_req, res, next) => { try { res.json((await Enquiry.find().sort({ createdAt: -1 })).map(publicItem)); } catch (e) { next(e); } });
app.get('/api/admin/orders', auth, async (_req, res, next) => { try { res.json((await Order.find().sort({ createdAt: -1 })).map(publicItem)); } catch (e) { next(e); } });
app.patch('/api/admin/:type/:id', auth, async (req, res, next) => { try { const Model = req.params.type === 'orders' ? Order : req.params.type === 'enquiries' ? Enquiry : null; if (!Model) return res.status(404).json({ error: 'Unknown item type.' }); const item = await Model.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }); if (!item) return res.status(404).json({ error: 'Item not found.' }); res.json(publicItem(item)); } catch (e) { next(e); } });
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Raja Electricals API is running',
    health: '/api/health'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'API route not found'
  });
});
app.use((err, _req, res, _next) => { console.error(err); if (err?.name === 'ValidationError') return res.status(400).json({ error: Object.values(err.errors).map(item => item.message).join(' ') }); if (err?.code === 11000) return res.status(409).json({ error: 'A record with the same unique value already exists.' }); if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'The uploaded image or catalogue is too large.' }); res.status(err.status || 500).json({ error: 'Something went wrong. Please try again.' }); });

if (!MONGODB_URI) { console.error('MONGODB_URI is missing. Add it to your .env file.'); process.exit(1); }

let isInitialized = false;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Raja Electricals API running on port ${PORT}`);
});

// Run initialization in background to not block startup
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => Promise.all([seed(), ensureContentDefaults(), migrateProducts()]))
  .then(() => { isInitialized = true; console.log('Initialization complete'); })
  .catch(error => {
    console.error('Initialization error:', error.message);
    // Continue running even if init fails - API can still respond to requests
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});
