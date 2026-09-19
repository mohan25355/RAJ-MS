import { useState } from 'react';
import { Btn, PageHead } from '../components/ui';
import { resolveApiUrl } from '../lib/api';

// ============================================
// DYNAMIC PRODUCT ASSET RESOLUTION (Vite import.meta.glob)
// Replaces 137+ static imports to optimize initial JS bundle size
// ============================================

const productAssetModules = import.meta.glob('../assets/product image/**/*', { eager: true, import: 'default' });

const WATER_PUMP_FALLBACK = 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=900&q=85';
const WHATSAPP_ORDER_NUMBER = '919003900533';

const PRODUCT_IMAGES = {};
const CATEGORY_IMAGES = {
  'Water Pumps': WATER_PUMP_FALLBACK,
};

for (const [path, url] of Object.entries(productAssetModules)) {
  const parts = path.split('/');
  const filenameWithExt = parts[parts.length - 1];
  const filename = filenameWithExt.replace(/\.(jpg|jpeg|png|webp)$/i, '');
  PRODUCT_IMAGES[filename] = url;

  if (parts.length >= 3) {
    const categoryFolder = parts[parts.length - 2];
    if (!CATEGORY_IMAGES[categoryFolder]) {
      CATEGORY_IMAGES[categoryFolder] = url;
    }
  }
}

// Fallback & specific aliases
PRODUCT_IMAGES['Life Jacket / Life Buoy'] = PRODUCT_IMAGES['Life JacketLife Buoy'] || CATEGORY_IMAGES['Emergency Response Equipment'];
PRODUCT_IMAGES['Scissors Barrier'] = PRODUCT_IMAGES['Queue Manager'];
PRODUCT_IMAGES['Quatro Bins'] = PRODUCT_IMAGES['Trio Bins'];
PRODUCT_IMAGES['Two in One'] = PRODUCT_IMAGES['Duo Bins'];

PRODUCT_IMAGES['Submersible Pumps'] = WATER_PUMP_FALLBACK;
PRODUCT_IMAGES['Garden Water Pumps'] = WATER_PUMP_FALLBACK;
PRODUCT_IMAGES['Water Circulation Pump'] = WATER_PUMP_FALLBACK;
PRODUCT_IMAGES['Deep Well Pumps'] = WATER_PUMP_FALLBACK;
PRODUCT_IMAGES['Single Phase'] = WATER_PUMP_FALLBACK;
PRODUCT_IMAGES['CDS Series'] = WATER_PUMP_FALLBACK;
PRODUCT_IMAGES['Dewatering Pump'] = WATER_PUMP_FALLBACK;

const productWhatsAppLink = product =>
  `https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${encodeURIComponent(`Hello Raja Electricals, I would like to order / request a quote for ${product.name}.`)}`;

const selectProduct = (item, page, go) => {
  localStorage.setItem('raja_selected_product', JSON.stringify(item));
  go(page, { keepOrder: page === 'contact' });
};

// ============================================
// CATEGORY DATA
// ============================================

const CATEGORY_DATA = [
  ['Head Protection', ['Safety Helmet Std. Series', 'Safety Helmet Vent. Series', 'ABS Helmet', 'Welding Helmet', 'Welding Shield Helmet Mountable', 'Grinding Face Shield A Type', 'Grinding Face Shield Spring Type', 'Grinding Face Shield Elastic Type', 'Electrical Helmet', 'Grinding Face Shield Ratchet Type', 'Heat Resistance Face Shield', 'Helmet With Light', 'Bump Cap']],
  ['Ear Protection', ['Ear Muff', 'Executive Ear Muff', 'Helmet Mountable Ear Muff', 'Reusable Ear Plug', 'Ear Plug', 'Ear Plug Dispenser']],
  ['First Aid Products', ['Venyl Kit', 'Travel Kit', 'Medical Kit', 'Plastic Kit', 'Foldable Stretcher']],
  ['Eye Protection', ['Safety Goggles', 'Safety Spectacles', 'Protective Goggles', 'Safety Glasses', 'Face Shield', 'Eye Wash Station']],
  ['Fall Protection', ['Retractable Fall Arrester', 'Parapet Anchor', 'PP Rope', 'Tool Lanyard', 'Multi Purpose Harness', 'A Class Harness', 'L Class Harness', 'Safety Net With Fish Net', '3 Layer Safety Net', 'Barrication Fence Net', 'Karabiner', 'Swing Seat', 'Descender', 'Horizontal Life Line']],
  ['Respiratory Protection', ['Carbon Mask', '3Ply Mask Loop Type', '3M 9000 IN', 'Dusk Mask With Valve', '3M 9004 IN', 'Dusk Mask', 'Full Face Mask With Double Cartridges', 'Half Face Mask With Single Cartridges', '3M N95 Mask', 'Cartridges']],
  ['Emergency Response Equipment', ['Life Jacket / Life Buoy', 'Loto Kit', 'Spill Kit']],
  ['Body Protection', ['Nomex Fire Suit', 'Aluminium Fire Suit', 'ARC Flash Suit', 'PVC Suit With Hood', 'Cotton Coverall', 'Disposable Coverall', 'PVC Apron', 'Leather Apron', 'Cotton Apron', 'Leather Arm Guard', 'Leather Leg Guard', 'Leather Shoulder Guard', 'Rain Coat']],
  ['Road Safety Products', ['Staff Safety Jacket', 'Safety Jacket 3 Side Open', 'Reflective Vest Belt', 'Security Jacket', 'Safety Cone', 'PU Spring Post', 'Queue Manager', 'Scissors Barrier', 'Road Studs', 'PVC Speed Breaker', 'Corner Guards', 'PVC Floor Stands', 'Dome Mirror', 'Convex Mirror', 'Reflection Tape', 'Wind Sock With Stand', 'PVC Chain', 'Safety Triangle', 'Solar Chevron', 'Baton Light', 'PVC Water Filled Barrier', 'Metal Detector']],
  ['Waste Management Products', [
    ['Combination Series - FRP', ['Duo Bins', 'Trio Bins', 'Quatro Bins', 'Two in One']],
    ['Combination Series - SS', ['Duo Bins', 'Trio Bins']],
    ['Mobile Garbage Bins', ['120L Mobile Garbage Bin', '240L Mobile Garbage Bin', '360L Mobile Garbage Bin', '660L Mobile Garbage Bin', '1100L Mobile Garbage Bin']],
    ['Classic Free Stand Series', ['60 LTR Bin', '80 LTR Bin', '110 LTR Bin', '150 LTR Bin', 'Single Stand', 'Double Stand', 'Metro With Swing Top', 'Metro With Open Top']],
    ['Bio Medical Pedal Series', ['Magnum 15L', 'Magnum 20L', '120L Pedal Bin', '240L Pedal Bin', 'Trolly Bins']],
  ]],
  ['Tools and Instrument', ['Axe', 'Mallet', 'Hammer', 'Corkscrew', 'Pliers', 'Construction Box', 'Wheel Barrow', 'Single Wheel Barrow', 'Back Saw', 'Chain Saw', 'Spirit Level', 'Tool Box', 'Step Ladder', 'Measurement Tape']],
  ['Water Pumps', ['Submersible Pumps', 'Garden Water Pumps', 'Water Circulation Pump', 'Deep Well Pumps', 'Single Phase', 'CDS Series', 'Dewatering Pump']],
];

// ============================================
// HELPER FUNCTIONS
// ============================================

const getProductImage = (category, name) => {
  return PRODUCT_IMAGES[name] || CATEGORY_IMAGES[category] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
};

const resolveProductImage = product => {
  if (!product) return WATER_PUMP_FALLBACK;

  const rawImage = typeof product.image === 'string' ? product.image.trim() : '';

  if (rawImage !== '') {
    if (
      rawImage.startsWith('http://') ||
      rawImage.startsWith('https://') ||
      rawImage.startsWith('data:image')
    ) {
      if (product.updated_at || product.updatedAt) {
        const v = new Date(product.updated_at || product.updatedAt).getTime();
        if (!isNaN(v)) {
          return rawImage.includes('?') ? `${rawImage}&v=${v}` : `${rawImage}?v=${v}`;
        }
      }
      return rawImage;
    }

    if (rawImage.startsWith('/api/') || rawImage.startsWith('/')) {
      const fullUrl = resolveApiUrl(rawImage);
      if (product.updated_at || product.updatedAt) {
        const v = new Date(product.updated_at || product.updatedAt).getTime();
        if (!isNaN(v)) {
          return fullUrl.includes('?') ? `${fullUrl}&v=${v}` : `${fullUrl}?v=${v}`;
        }
      }
      return fullUrl;
    }

    const fileName = rawImage.split('/').pop().replace(/\.(jpg|jpeg|png|webp)$/i, '');
    if (PRODUCT_IMAGES[fileName]) {
      return PRODUCT_IMAGES[fileName];
    }

    return rawImage;
  }

  return getProductImage(product.category, product.name);
};

const handleImgError = (event, category) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = CATEGORY_IMAGES[category] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
};

// ============================================
// BUILD PRODUCTS DATA
// ============================================

const PRODUCTS_DATA = CATEGORY_DATA.flatMap(([category, entries], categoryIndex) =>
  entries.flatMap((entry, entryIndex) => {
    const isSeries = Array.isArray(entry);
    const subcategory = isSeries ? entry[0] : '';
    const products = isSeries ? entry[1] : [entry];
    return products.map((name, productIndex) => ({
      id: `product-${categoryIndex}-${entryIndex}-${productIndex}`,
      name,
      image: getProductImage(category, name),
      price: 'Price on request',
      badge: 'Available',
      category,
      subcategory,
      description: `${name} from our ${subcategory ? `${subcategory} - ` : ''}${category} range. Contact us for specifications and a quotation.`,
    }));
  })
);

const CATEGORIES_LIST = CATEGORY_DATA.map(([name]) => ({ id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name }));
const productCategory = item => item.subcategory ? `${item.category} / ${item.subcategory}` : item.category;

const catalogueFromContent = content => {
  const databaseProducts = Array.isArray(content?.products) ? content.products : null;
  const databaseCategories = Array.isArray(content?.categories) ? content.categories : null;
  return {
    products: databaseProducts !== null ? databaseProducts : PRODUCTS_DATA,
    categories: databaseCategories !== null && databaseCategories.length ? databaseCategories : CATEGORIES_LIST,
  };
};

// ============================================
// PRODUCTS PAGE COMPONENT
// ============================================

const HIDDEN_SIDEBAR_CATEGORIES = new Set([
  'Home Appliances',
  'Security & Protection',
  'Waterproofing',
  'Sanitaryware & Bathroom',
  'Water Heaters',
  'Fans',
  'Lighting',
  'Switches & Electrical',
  'Pipes & Plumbing',
  'Wires & Cables',
  'Paints & Coatings',
]);

export function ProductsPage({ go, content }) {
  const [term, setTerm] = useState('');
  const [category, setCategory] = useState('');
  const { products, categories } = catalogueFromContent(content);
  const sidebarCategories = categories.filter(item => !HIDDEN_SIDEBAR_CATEGORIES.has(item.name));
  const filtered = products.filter(item =>
    `${item.name} ${item.category} ${item.subcategory}`.toLowerCase().includes(term.toLowerCase()) && (!category || item.category === category)
  );

  return <>
    <PageHead crumb="Products" title={<>Our <em>Products</em></>} desc={`Browse our complete industrial safety catalogue: ${products.length} products across ${categories.length} categories.`}/>
    <section className="catalog">
      <aside className="product-categories">
        <h3>Categories</h3>
        <label className={`category-select ${category ? '' : 'selected'}`}>
          <span>Select a category</span>
          <select value={category} onChange={event => setCategory(event.target.value)} aria-label="Select a product category">
            <option value="">All products</option>
            {sidebarCategories.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
        </label>
        <div className="category-filter-list" aria-label="Product categories">
          <button className={!category ? 'selected' : ''} onClick={() => setCategory('')}>All products</button>
          {sidebarCategories.map(item => <button className={category === item.name ? 'selected' : ''} key={item.id} onClick={() => setCategory(item.name)}>{item.name}</button>)}
        </div>
      </aside>
      <main>
        <div className="find">
          <input placeholder="Search products or series..." value={term} onChange={event => setTerm(event.target.value)}/>
          <Btn>Search</Btn>
        </div>
        <p className="product-count">{filtered.length} {filtered.length === 1 ? 'product' : 'products'}{category ? ` in ${category}` : ''}</p>
        <div className="product-grid">
          {filtered.map(item => <article key={item.id} className="product-card">
            <div className="product-badge">{item.badge}</div>
            <button className="product-open" onClick={() => selectProduct(item, 'productdetail', go)}>
              <img src={resolveProductImage(item)} alt={item.name} onError={event => handleImgError(event, item.category)} loading="lazy" decoding="async"/>
              <h3>{item.name}</h3>
              <p className="product-price">{item.price}</p>
              <p className="product-category">{productCategory(item)}</p>
            </button>
            <a className="order-product" href={productWhatsAppLink(item)} target="_blank" rel="noreferrer" style={{ display: 'block', boxSizing: 'border-box', textAlign: 'center', textDecoration: 'none' }}>Order / Quote on WhatsApp</a>
          </article>)}
        </div>
        {!filtered.length && <p className="no-products">No products match your search.</p>}
      </main>
    </section>
  </>;
}

// ============================================
// PRODUCT DETAIL PAGE COMPONENT
// ============================================

export function ProductDetailPage({ go, content }) {
  const { products } = catalogueFromContent(content);
  const [product, setProduct] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('raja_selected_product'));
    } catch {
      return null;
    }
  });
  if (!product) return <section className="page-loading">Choose a product from our catalogue to view its details.</section>;
  const currentProduct = products.find(item => item.id === product.id) || product;
  const related = products.filter(item => item.id !== currentProduct.id && item.category === currentProduct.category).slice(0, 5);
  const whatsapp = productWhatsAppLink(currentProduct);
  const phone = content?.site?.phone || '+91 9003900533';
  const openRelatedProduct = item => {
    localStorage.setItem('raja_selected_product', JSON.stringify(item));
    setProduct(item);
    window.scrollTo(0, 0);
  };

  return <>
    <div className="crumb">Home / {productCategory(currentProduct)} / {currentProduct.name}</div>
    <section className="detail">
      <div className="product-image"><span>{currentProduct.badge || 'Product'}</span><img src={resolveProductImage(currentProduct)} alt={currentProduct.name} onError={event => handleImgError(event, currentProduct.category)} loading="eager" decoding="async"/></div>
      <div className="detail-copy">
        <small>{productCategory(currentProduct)}</small><h1>{currentProduct.name}</h1>
        <p className="product-detail-price" style={{ fontSize: '18px', color: 'var(--red)', fontWeight: '700', margin: '10px 0' }}>{currentProduct.price}</p>
        <p>{currentProduct.description}</p><a className="btn" href={whatsapp} target="_blank" rel="noreferrer">Request this product on WhatsApp</a>
      </div>
      <aside className="details-box">
        <h3>Product Details</h3><p><b>Category</b><span>{currentProduct.category}</span></p>
        {currentProduct.subcategory && <p><b>Series</b><span>{currentProduct.subcategory}</span></p>}
        <p><b>Price</b><span>{currentProduct.price}</span></p><p><b>Availability</b><span>Contact us</span></p>
        <div className="help"><b>Need help?</b><a href={`tel:${phone}`}>{phone}</a><a className="whatsapp-button" href={whatsapp} target="_blank" rel="noreferrer">WhatsApp Us</a></div>
      </aside>
    </section>
    <section className="related"><h2>Related Products in {currentProduct.category}</h2>
      {related.length > 0 ? <div className="related-products-grid">
        {related.map(item => <button key={item.id} onClick={() => openRelatedProduct(item)}><img src={resolveProductImage(item)} alt={item.name} onError={event => handleImgError(event, item.category)} loading="lazy" decoding="async"/><b>{item.name}</b><span>{item.price}</span></button>)}
      </div> : <p>No other products in this category.</p>}
    </section>
  </>;
}
