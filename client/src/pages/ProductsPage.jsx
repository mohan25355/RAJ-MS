import { useState } from 'react';
import { Btn, PageHead } from '../components/ui';

const selectProduct = (item, page, go) => { localStorage.setItem('raja_selected_product', JSON.stringify(item)); go(page, { keepOrder: page === 'contact' }); };

// STATIC PRODUCT DATA - 60 PRODUCTS ACROSS 7 CATEGORIES
const PRODUCTS_DATA = [
  // Electricals (9)
  { id: "e1", name: "LED Ceiling Lights", image: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=900&q=85", price: "", badge: "Best Seller", category: "Electricals", description: "Energy-efficient LED lights for home and office." },
  { id: "e2", name: "Panel Boxes", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=85", price: "", badge: "Popular", category: "Electricals", description: "Heavy-duty MCB distribution boxes for commercial use." },
  { id: "e3", name: "Copper Switches", image: "https://images.unsplash.com/photo-1581092916692-8d3dd2a9b0d0?auto=format&fit=crop&w=900&q=85", price: "", badge: "Premium", category: "Electricals", description: "Durable copper switches with long-lasting design." },
  { id: "e4", name: "Wire Breakers", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=85", price: "", badge: "Essential", category: "Electricals", description: "Automatic circuit breakers for electrical safety." },
  { id: "e5", name: "Power Stabilizers", image: "https://images.unsplash.com/photo-1581092938057-c0a3a6c8c1f0?auto=format&fit=crop&w=900&q=85", price: "", badge: "New", category: "Electricals", description: "Protects appliances from voltage fluctuations." },
  { id: "e6", name: "Socket Covers", image: "https://images.unsplash.com/photo-1581092919629-4f1b8e1e1b1e?auto=format&fit=crop&w=900&q=85", price: "", badge: "Budget", category: "Electricals", description: "Safe covers for unused electrical outlets." },
  { id: "e7", name: "Extension Boards", image: "https://images.unsplash.com/photo-1581093458057-8a1e4c8f8f0e?auto=format&fit=crop&w=900&q=85", price: "", badge: "Popular", category: "Electricals", description: "Multi-outlet extension boards with surge protection." },
  { id: "e8", name: "Bulbs Pack", image: "https://images.unsplash.com/photo-1581093927519-7b8d6b6e6f0e?auto=format&fit=crop&w=900&q=85", price: "", badge: "Value", category: "Electricals", description: "LED bulbs - pack of 10 with warranty." },
  { id: "e9", name: "Wire Ducts", image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=900&q=85", price: "", badge: "Essential", category: "Electricals", description: "Organized cable management and protection system." },

  // Industrial Safety (9)
  { id: "s1", name: "Safety Helmets", image: "https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&w=900&q=85", price: "", badge: "Essential", category: "Industrial Safety", description: "ISI-certified safety helmets with comfort padding." },
  { id: "s2", name: "Safety Gloves", image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=900&q=85", price: "", badge: "Popular", category: "Industrial Safety", description: "Cut and impact resistant work gloves." },
  { id: "s3", name: "Safety Goggles", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?auto=format&fit=crop&w=900&q=85", price: "", badge: "New", category: "Industrial Safety", description: "UV and impact protected safety eyewear." },
  { id: "s4", name: "Respirators", image: "https://images.unsplash.com/photo-1576091160399-d7778b0f0a8f?auto=format&fit=crop&w=900&q=85", price: "", badge: "Essential", category: "Industrial Safety", description: "N95 and FFP2 respirators for dust protection." },
  { id: "s5", name: "Knee Pads", image: "https://images.unsplash.com/photo-1582053921905-a1c9e31c5a21?auto=format&fit=crop&w=900&q=85", price: "", badge: "Budget", category: "Industrial Safety", description: "Comfortable knee protection for construction work." },
  { id: "s6", name: "Safety Vests", image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=900&q=85", price: "", badge: "Popular", category: "Industrial Safety", description: "High-visibility safety vests with reflective strips." },
  { id: "s7", name: "First Aid Kit", image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde0f?auto=format&fit=crop&w=900&q=85", price: "", badge: "Essential", category: "Industrial Safety", description: "Complete workplace first aid kit with supplies." },
  { id: "s8", name: "Safety Harness", image: "https://images.unsplash.com/photo-1578590494309-246790fb33c3?auto=format&fit=crop&w=900&q=85", price: "", badge: "Premium", category: "Industrial Safety", description: "Fall protection harness for height work." },
  { id: "s9", name: "Safety Boots", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85", price: "", badge: "Popular", category: "Industrial Safety", description: "Steel-toed safety boots with slip resistance." },

  // Hardware & Tools (9)
  { id: "t1", name: "Power Drill", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=85", price: "", badge: "Popular", category: "Hardware & Tools", description: "Cordless power drill for professional work." },
  { id: "t2", name: "Hammer Set", image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=85", price: "", badge: "Value", category: "Hardware & Tools", description: "Complete hammer set with different sizes." },
  { id: "t3", name: "Screwdriver Kit", image: "https://images.unsplash.com/photo-1545857707-7f5b18f8b5e0?auto=format&fit=crop&w=900&q=85", price: "", badge: "Essential", category: "Hardware & Tools", description: "24-piece screwdriver set for all applications." },
  { id: "t4", name: "Tape Measure", image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=85", price: "", badge: "Budget", category: "Hardware & Tools", description: "10-meter retractable tape measure." },
  { id: "t5", name: "Wrench Set", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=85", price: "", badge: "Popular", category: "Hardware & Tools", description: "12-piece adjustable wrench set." },
  { id: "t6", name: "Angle Grinder", image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=85", price: "", badge: "Premium", category: "Hardware & Tools", description: "Heavy-duty angle grinder for cutting and grinding." },
  { id: "t7", name: "Hand Saw", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=85", price: "", badge: "Essential", category: "Hardware & Tools", description: "Professional hand saw with comfortable grip." },
  { id: "t8", name: "Tool Box", image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=85", price: "", badge: "New", category: "Hardware & Tools", description: "Durable plastic tool box with organized compartments." },
  { id: "t9", name: "Clamp Set", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=85", price: "", badge: "Popular", category: "Hardware & Tools", description: "Heavy-duty clamps for woodworking and metalwork." },

  // Water Pumps (8)
  { id: "p1", name: "Submersible Pump", image: "https://images.unsplash.com/photo-1581093458791-9d09d2e70ae4?auto=format&fit=crop&w=900&q=85", price: "", badge: "Best Seller", category: "Water Pumps", description: "1HP submersible pump for boreholes and wells." },
  { id: "p2", name: "Surface Pump", image: "https://images.unsplash.com/photo-1581093458791-9d09d2e70ae4?auto=format&fit=crop&w=900&q=85", price: "", badge: "Popular", category: "Water Pumps", description: "Compact surface pump for gardens and construction." },
  { id: "p3", name: "Centrifugal Pump", image: "https://images.unsplash.com/photo-1581093458791-9d09d2e70ae4?auto=format&fit=crop&w=900&q=85", price: "", badge: "New", category: "Water Pumps", description: "Industrial centrifugal pump for heavy-duty use." },
  { id: "p4", name: "Portable Pump", image: "https://images.unsplash.com/photo-1581093458791-9d09d2e70ae4?auto=format&fit=crop&w=900&q=85", price: "", badge: "Budget", category: "Water Pumps", description: "Lightweight portable pump for temporary installations." },
  { id: "p5", name: "Jet Pump", image: "https://images.unsplash.com/photo-1581093458791-9d09d2e70ae4?auto=format&fit=crop&w=900&q=85", price: "", badge: "Premium", category: "Water Pumps", description: "High-performance jet pump for deep wells." },
  { id: "p6", name: "Pump Motor", image: "https://images.unsplash.com/photo-1581093458791-9d09d2e70ae4?auto=format&fit=crop&w=900&q=85", price: "", badge: "Essential", category: "Water Pumps", description: "Heavy-duty motor for pump installations." },
  { id: "p7", name: "Pump Controller", image: "https://images.unsplash.com/photo-1581093458791-9d09d2e70ae4?auto=format&fit=crop&w=900&q=85", price: "", badge: "New", category: "Water Pumps", description: "Automatic pump controller with overload protection." },
  { id: "p8", name: "Pump Accessories", image: "https://images.unsplash.com/photo-1581093458791-9d09d2e70ae4?auto=format&fit=crop&w=900&q=85", price: "", badge: "Value", category: "Water Pumps", description: "Complete pump accessories kit including pipes and fittings." },

  // Plumbing (8)
  { id: "pl1", name: "PVC Pipes", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=85", price: "meter", badge: "Popular", category: "Plumbing", description: "Durable PVC pipes for water supply systems." },
  { id: "pl2", name: "Copper Fittings", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=85", price: "", badge: "Premium", category: "Plumbing", description: "High-quality copper fittings for plumbing." },
  { id: "pl3", name: "Ball Valves", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=85", price: "", badge: "Essential", category: "Plumbing", description: "Brass ball valves for water control." },
  { id: "pl4", name: "Shower Heads", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=85", price: "", badge: "New", category: "Plumbing", description: "Modern shower heads with water-saving features." },
  { id: "pl5", name: "Taps & Mixers", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=85", price: "", badge: "Popular", category: "Plumbing", description: "Stylish kitchen and bathroom taps." },
  { id: "pl6", name: "Water Tank", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=85", price: "", badge: "Best Seller", category: "Plumbing", description: "500-liter water storage tank." },
  { id: "pl7", name: "Plumbing Sealant", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=85", price: "", badge: "Value", category: "Plumbing", description: "Waterproof sealant for pipe joints." },
  { id: "pl8", name: "Pipe Wrench", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=85", price: "", badge: "Essential", category: "Plumbing", description: "Adjustable pipe wrench for all pipe sizes." },

  // Wires & Cables (9)
  { id: "c1", name: "2.5 SQ MM Cable", image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=900&q=85", price: "meter", badge: "Popular", category: "Wires & Cables", description: "Heavy-duty copper cable for main wiring." },
  { id: "c2", name: "1.5 SQ MM Cable", image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=900&q=85", price: "₹meter", badge: "Essential", category: "Wires & Cables", description: "Standard cable for general electrical work." },
  { id: "c3", name: "4 SQ MM Cable", image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=900&q=85", price: "₹meter", badge: "Popular", category: "Wires & Cables", description: "Industrial-grade cable for heavy appliances." },
  { id: "c4", name: "6 SQ MM Cable", image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=900&q=85", price: "meter", badge: "Premium", category: "Wires & Cables", description: "Extra-heavy duty cable for industrial use." },
  { id: "c5", name: "Earth Wire", image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=900&q=85", price: "meter", badge: "Essential", category: "Wires & Cables", description: "Grounding wire for electrical safety." },
  { id: "c6", name: "HDMI Cable", image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=900&q=85", price: "", badge: "New", category: "Wires & Cables", description: "High-speed digital media cable." },
  { id: "c7", name: "USB Cable", image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=900&q=85", price: "", badge: "Value", category: "Wires & Cables", description: "Standard USB charging and data cables." },
  { id: "c8", name: "Telephone Wire", image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=900&q=85", price: "meter", badge: "Budget", category: "Wires & Cables", description: "Twisted pair telephone wiring." },
  { id: "c9", name: "Cable Tray", image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=900&q=85", price: "", badge: "Popular", category: "Wires & Cables", description: "Heavy-duty cable management tray system." },

  // Paints & Coatings (8)
  { id: "pt1", name: "Interior Emulsion", image: "https://images.unsplash.com/photo-1535221228889-f0d0f7f9e0a5?auto=format&fit=crop&w=900&q=85", price: "liter", badge: "Popular", category: "Paints & Coatings", description: "Premium interior wall paint with great coverage." },
  { id: "pt2", name: "Exterior Enamel", image: "https://images.unsplash.com/photo-1535221228889-f0d0f7f9e0a5?auto=format&fit=crop&w=900&q=85", price: "liter", badge: "Best Seller", category: "Paints & Coatings", description: "Weather-resistant outdoor paint." },
  { id: "pt3", name: "Primer", image: "https://images.unsplash.com/photo-1535221228889-f0d0f7f9e0a5?auto=format&fit=crop&w=900&q=85", price: "liter", badge: "Essential", category: "Paints & Coatings", description: "Surface preparation primer for all paint types." },
  { id: "pt4", name: "Metallic Paint", image: "https://images.unsplash.com/photo-1535221228889-f0d0f7f9e0a5?auto=format&fit=crop&w=900&q=85", price: "liter", badge: "Premium", category: "Paints & Coatings", description: "Shimmering metallic finish paint." },
  { id: "pt5", name: "Wood Polish", image: "https://images.unsplash.com/photo-1535221228889-f0d0f7f9e0a5?auto=format&fit=crop&w=900&q=85", price: "liter", badge: "Popular", category: "Paints & Coatings", description: "High-gloss wood finishing polish." },
  { id: "pt6", name: "Paint Thinner", image: "https://images.unsplash.com/photo-1535221228889-f0d0f7f9e0a5?auto=format&fit=crop&w=900&q=85", price: "liter", badge: "Value", category: "Paints & Coatings", description: "Paint solvent for thinning and cleaning." },
  { id: "pt7", name: "Spray Paint", image: "https://images.unsplash.com/photo-1535221228889-f0d0f7f9e0a5?auto=format&fit=crop&w=900&q=85", price: "liter", badge: "New", category: "Paints & Coatings", description: "Aerosol spray paint for quick finishing." },
  { id: "pt8", name: "Anti-Rust Coating", image: "https://images.unsplash.com/photo-1535221228889-f0d0f7f9e0a5?auto=format&fit=crop&w=900&q=85", price: "liter", badge: "Premium", category: "Paints & Coatings", description: "Protective coating against rust and corrosion." }
];

const CATEGORIES_LIST = [
  { id: "electricals", name: "Electricals" },
  { id: "safety", name: "Industrial Safety" },
  { id: "tools", name: "Hardware & Tools" },
  { id: "pumps", name: "Water Pumps" },
  { id: "plumbing", name: "Plumbing" },
  { id: "cables", name: "Wires & Cables" },
  { id: "paints", name: "Paints & Coatings" }
];

export function ProductsPage({ go, content }) {
  const [term, setTerm] = useState(''); 
  const [category, setCategory] = useState(''); 
  const items = PRODUCTS_DATA;
  const categories = CATEGORIES_LIST;
  const filtered = items.filter(item => `${item.name} ${item.category}`.toLowerCase().includes(term.toLowerCase()) && (!category || item.category === category));
  
  return <>
    <PageHead crumb="Products" title={<>Our <em>Products</em></>} desc="Browse our wide range of premium quality 60+ products across 7 categories."/>
    <section className="catalog">
      <aside className="product-categories">
        <h3>Categories</h3>
        <label className={`category-select ${category ? '' : 'selected'}`}>
          <span>Select a category</span>
          <select value={category} onChange={event => setCategory(event.target.value)} aria-label="Select a product category">
            <option value="">All products</option>
            {categories.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
        </label>
        <div className="category-filter-list" aria-label="Product categories">
          <button className={!category ? 'selected' : ''} onClick={() => setCategory('')}>All products</button>
          {categories.map(item => <button className={category === item.name ? 'selected' : ''} key={item.id} onClick={() => setCategory(item.name)}>{item.name}</button>)}
        </div>
        <small className="category-scroll-note">Swipe sideways to see all categories →</small>
      </aside>
      <main>
        <div className="find">
          <input placeholder="Search products..." value={term} onChange={event => setTerm(event.target.value)}/>
          <Btn>Search</Btn>
        </div>
        <p className="product-count">{filtered.length} {filtered.length === 1 ? 'product' : 'products'}{category ? ` in ${category}` : ''}</p>
        <div className="product-grid">
          {filtered.map(item => <article key={item.id} className="product-card">
            <div className="product-badge">{item.badge}</div>
            <button className="product-open" onClick={() => selectProduct(item, 'productdetail', go)}>
              <img src={item.image} alt={item.name}/>
              <h3>{item.name}</h3>
              <p className="product-price">{item.price}</p>
              <p className="product-category">{item.category}</p>
            </button>
            <button className="order-product" onClick={() => selectProduct(item, 'contact', go)}>Order / Quote</button>
          </article>)}
        </div>
        {!filtered.length && <p className="no-products">No products match your search.</p>}
      </main>
    </section>
  </>;
}

export function ProductDetailPage({ go, content }) {
  const selected = (() => { try { return JSON.parse(localStorage.getItem('raja_selected_product')); } catch { return null; } })();
  const product = selected && PRODUCTS_DATA.find(item => item.id === selected.id) || selected;
  if (!product) return <section className="page-loading">Choose a product from our catalogue to view its details.</section>;
  const related = PRODUCTS_DATA.filter(item => item.id !== product.id && item.category === product.category).slice(0, 5);
  const requestProduct = () => selectProduct(product, 'contact', go); 
  const whatsapp = `https://wa.me/${String(content?.site?.whatsappNumber || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello, I am interested in ${product.name}.`)}`;
  const phone = content?.site?.phone || '+91 99413 36125';
  
  return <>
    <div className="crumb">Home / {product.category} / {product.name}</div>
    <section className="detail">
      <div className="product-image">
        <span>{product.badge || 'Product'}</span>
        <img src={product.image} alt={product.name}/>
      </div>
      <div className="detail-copy">
        <small>{product.category}</small>
        <h1>{product.name}</h1>
        <p className="product-detail-price" style={{fontSize:'18px', color:'var(--red)', fontWeight:'700', margin:'10px 0'}}>{product.price}</p>
        <p>{product.description}</p>
        <Btn onClick={requestProduct}>Request this product</Btn>
      </div>
      <aside className="details-box">
        <h3>Product Details</h3>
        <p><b>Category</b><span>{product.category}</span></p>
        <p><b>Price</b><span>{product.price}</span></p>
        <p><b>Availability</b><span>In Stock</span></p>
        <p><b>Warranty</b><span>1 Year</span></p>
        <div className="help">
          <b>Need help?</b>
          <a href={`tel:${phone}`}>{phone}</a>
          <a className="whatsapp-button" href={whatsapp} target="_blank" rel="noreferrer">WhatsApp Us</a>
        </div>
      </aside>
    </section>
    <section className="related">
      <h2>Related Products in {product.category}</h2>
      {related.length > 0 ? (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '20px'}}>
          {related.map(item => <button key={item.id} onClick={() => selectProduct(item, 'productdetail', go)} style={{display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', border: '1px solid var(--line)', borderRadius: '3px', cursor: 'pointer', transition: '.2s', backgroundColor: '#fff'}} onMouseEnter={(e) => {e.target.style.borderColor = 'var(--red)'; e.target.style.transform = 'translateY(-3px)';}} onMouseLeave={(e) => {e.target.style.borderColor = 'var(--line)'; e.target.style.transform = 'translateY(0)';}}><img src={item.image} alt={item.name} style={{width: '100%', height: '100px', objectFit: 'cover'}}/><b style={{fontSize: '12px'}}>{item.name}</b><span style={{fontSize: '11px', color: 'var(--red)', fontWeight: '700'}}>{item.price}</span></button>)}
        </div>
      ) : (
        <p>No other products in this category.</p>
      )}
    </section>
  </>;
}