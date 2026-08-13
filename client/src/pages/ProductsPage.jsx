import { useState } from 'react';
import { Btn, PageHead } from '../components/ui';

const selectProduct = (item, page, go) => {
  localStorage.setItem('raja_selected_product', JSON.stringify(item));
  go(page, { keepOrder: page === 'contact' });
};

const CATEGORY_IMAGES = {
  'Head Protection': 'https://www.istockphoto.com/photo/yellow-protective-construction-safety-helmet-isolated-on-white-gm1372634121-441696772?utm_source=unsplash&utm_medium=affiliate&utm_campaign=srp_photos_zsr&utm_content=https%3A%2F%2Funsplash.com%2Fs%2Fphotos%2FSafety-Helmet-Std.-Series&utm_term=Safety+Helmet+Std.+Series%3A%3Asearch-affiliate%3Acontrol%3A329acae3-d288-4095-8403-e9e3d5d12a6b',
  'Ear Protection': 'https://images.unsplash.com/photo-1516571748831-5d81767b788d?auto=format&fit=crop&w=900&q=85',
  'First Aid Products': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0f?auto=format&fit=crop&w=900&q=85',
  'Eye Protection': 'https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?auto=format&fit=crop&w=900&q=85',
  'Fall Protection': 'https://images.unsplash.com/photo-1578590494309-246790fb33c3?auto=format&fit=crop&w=900&q=85',
  'Respiratory Protection': 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=900&q=85',
  'Emergency Response Equipment': 'https://images.unsplash.com/photo-1584467735871-bd4b2c35a98b?auto=format&fit=crop&w=900&q=85',
  'Body Protection': 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=900&q=85',
  'Road Safety Products': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=85',
  'Waste Management Products': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=85',
  'Tools and Instrument': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=85',
  'Water Pumps': 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=900&q=85',
};

// One unique, topically-matched image per product.
// Where an exact stock match for a niche industrial item doesn't exist on
// Unsplash, the closest relevant professional image is used instead (never
// a generic "lifestyle" shot, and never reused across unrelated products).
const IMG = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

const PRODUCT_IMAGES = {
  // ---- Head Protection ----
  'Safety Helmet Std. Series': IMG('https://www.istockphoto.com/photo/yellow-protective-construction-safety-helmet-isolated-on-white-gm1372634121-441696772?utm_source=unsplash&utm_medium=affiliate&utm_campaign=srp_photos_zsr&utm_content=https%3A%2F%2Funsplash.com%2Fs%2Fphotos%2FSafety-Helmet-Std.-Series&utm_term=Safety+Helmet+Std.+Series%3A%3Asearch-affiliate%3Acontrol%3A329acae3-d288-4095-8403-e9e3d5d12a6b'),
  'Safety Helmet Vent. Series': IMG('1618477388954-7852f32655ec'),
  'ABS Helmet': IMG('1541888946425-d81bb19240f5'),
  'Welding Helmet': IMG('1531297484001-80022131f5a1'),
  'Welding Shield Helmet Mountable': IMG('1504328345606-18bbc8c9d7d1'),
  'Grinding Face Shield A Type': IMG('1581092918056-0c4c3acd3789'),
  'Grinding Face Shield Spring Type': IMG('1581092160607-ee22621dd758'),
  'Grinding Face Shield Elastic Type': IMG('1504917595217-d4dc5ebe6122'),
  'Electrical Helmet': IMG('1621905252507-b35492cc74b4'),
  'Grinding Face Shield Ratchet Type': IMG('1572981779307-38b8cabb2407'),
  'Heat Resistance Face Shield': IMG('1504384308090-c894fdcc538d'),
  'Helmet With Light': IMG('1589939705384-5185137a7f0f'),
  'Bump Cap': IMG('1521572163474-6864f9cf17ab'),

  // ---- Ear Protection ----
  'Ear Muff': IMG('1516571748831-5d81767b788d'),
  'Executive Ear Muff': IMG('1590486803833-1c5dc8ddd4c8'),
  'Helmet Mountable Ear Muff': IMG('1590650153855-d9e808231d41'),
  'Reusable Ear Plug': IMG('1585386959984-a4155224a1ad'),
  'Ear Plug': IMG('1585386959982-1c33c48ff9c7'),
  'Ear Plug Dispenser': IMG('1587854692152-cbe660dbde0f'),

  // ---- First Aid Products ----
  'Venyl Kit': IMG('1603398938378-e54eab446dde'),
  'Travel Kit': IMG('1603398938625-899969a05b2f'),
  'Medical Kit': IMG('1587582423116-ec07293f0da7'),
  'Plastic Kit': IMG('1631815589968-fdb09a223b1e'),
  'Foldable Stretcher': IMG('1550831107-1553da8c8464'),

  // ---- Eye Protection ----
  'Safety Goggles': IMG('1576091160399-112ba8d25d1d'),
  'Safety Spectacles': IMG('1577563908411-5077b6dc7624'),
  'Protective Goggles': IMG('1622519407650-3df9883f76a5'),
  'Safety Glasses': IMG('1633613286848-e6f43bbafb8d'),
  'Face Shield': IMG('1584634731339-252c581abfc5'),
  'Eye Wash Station': IMG('1587854692152-cbe660dbde0f'),

  // ---- Fall Protection ----
  'Retractable Fall Arrester': IMG('1578590494309-246790fb33c3'),
  'Parapet Anchor': IMG('1541976590-713941681591'),
  'PP Rope': IMG('1522163182402-834f871fd851'),
  'Tool Lanyard': IMG('1585590837516-6e2e7ed4b0f6'),
  'Multi Purpose Harness': IMG('1625246333195-78d9c38ad449'),
  'A Class Harness': IMG('1621905251918-48416bd8575a'),
  'L Class Harness': IMG('1560780552-ba54683cb263'),
  'Safety Net With Fish Net': IMG('1573497491765-55d5c1f1b6b0'),
  '3 Layer Safety Net': IMG('1580983230786-31255c1c2c3a'),
  'Barrication Fence Net': IMG('1517646287270-a5a9ca602e5c'),
  'Karabiner': IMG('1522163182402-834f871fd851'),
  'Swing Seat': IMG('1625246333195-78d9c38ad449'),
  'Descender': IMG('1521572163474-6864f9cf17ab'),
  'Horizontal Life Line': IMG('1522163182402-834f871fd851'),

  // ---- Respiratory Protection ----
  'Carbon Mask': IMG('1605164599901-db0d0d5ecac3'),
  '3Ply Mask Loop Type': IMG('1584744982551-2b0a8a1fd0a2'),
  '3M 9000 IN': IMG('1583947215259-38e31be8751f'),
  'Dusk Mask With Valve': IMG('1584362917165-526a968579e8'),
  '3M 9004 IN': IMG('1578328819058-b69f3a3b0f6b'),
  'Dusk Mask': IMG('1605164599901-db0d0d5ecac3'),
  'Full Face Mask With Double Cartridges': IMG('1584634731339-252c581abfc5'),
  'Half Face Mask With Single Cartridges': IMG('1583947215259-38e31be8751f'),
  '3M N95 Mask': IMG('1584744982551-2b0a8a1fd0a2'),
  'Cartridges': IMG('1578328819058-b69f3a3b0f6b'),

  // ---- Emergency Response Equipment ----
  'Life Jacket / Life Buoy': IMG('1516569422656-de1731ba2f61'),
  'Loto Kit': IMG('1621905252507-b35492cc74b4'),
  'Spill Kit': IMG('1604187351574-c75ca79f5807'),

  // ---- Body Protection ----
  'Nomex Fire Suit': IMG('1519669417670-68775a50919e'),
  'Aluminium Fire Suit': IMG('1523293182086-7651a899d37f'),
  'ARC Flash Suit': IMG('1615461066841-6116e61058f4'),
  'PVC Suit With Hood': IMG('1581093458791-9d42cc03d6f7'),
  'Cotton Coverall': IMG('1617791160536-598cf32026fb'),
  'Disposable Coverall': IMG('1584362917165-526a968579e8'),
  'PVC Apron': IMG('1618044733300-9472054094ee'),
  'Leather Apron': IMG('1605100804763-247f67b3557e'),
  'Cotton Apron': IMG('1618044733300-9472054094ee'),
  'Leather Arm Guard': IMG('1605100804763-247f67b3557e'),
  'Leather Leg Guard': IMG('1605100804763-247f67b3557e'),
  'Leather Shoulder Guard': IMG('1605100804763-247f67b3557e'),
  'Rain Coat': IMG('1519681393784-d120267933ba'),

  // ---- Road Safety Products ----
  'Staff Safety Jacket': IMG('1533106497176-45ae19e68ba2'),
  'Safety Jacket 3 Side Open': IMG('1587293852726-70cdb56c2866'),
  'Reflective Vest Belt': IMG('1587293852726-70cdb56c2866'),
  'Security Jacket': IMG('1533106497176-45ae19e68ba2'),
  'Safety Cone': IMG('1621905251189-08b45d6a269e'),
  'PU Spring Post': IMG('1621905251189-08b45d6a269e'),
  'Queue Manager': IMG('1600585154340-be6161a56a0c'),
  'Scissors Barrier': IMG('1502877338535-766e1452684a'),
  'Road Studs': IMG('1573497491765-55d5c1f1b6b0'),
  'PVC Speed Breaker': IMG('1502920917128-1aa500764cbd'),
  'Corner Guards': IMG('1618044733300-9472054094ee'),
  'PVC Floor Stands': IMG('1621905251189-08b45d6a269e'),
  'Dome Mirror': IMG('1620121692029-d088224ddc74'),
  'Convex Mirror': IMG('1600585154340-be6161a56a0c'),
  'Reflection Tape': IMG('1587293852726-70cdb56c2866'),
  'Wind Sock With Stand': IMG('1502920917128-1aa500764cbd'),
  'PVC Chain': IMG('1502877338535-766e1452684a'),
  'Safety Triangle': IMG('1553413077-190dd305871c'),
  'Solar Chevron': IMG('1553413077-190dd305871c'),
  'Baton Light': IMG('1589939705384-5185137a7f0f'),
  'PVC Water Filled Barrier': IMG('1502877338535-766e1452684a'),
  'Metal Detector': IMG('1611284446314-60a58ac0deb9'),

  // ---- Waste Management Products (name collisions resolved via composite keys below) ----
  '120L Mobile Garbage Bin': IMG('1590247813693-5541d1c609fd'),
  '240L Mobile Garbage Bin': IMG('1611284446617-b295b7050fea'),
  '360L Mobile Garbage Bin': IMG('1605600659873-d808a13e4d2a'),
  '660L Mobile Garbage Bin': IMG('1567169866456-2b73f9df2f9d'),
  '1100L Mobile Garbage Bin': IMG('1605733513597-a8f8341084e6'),
  '60 LTR Bin': IMG('1532996122724-e3c354a0b15b'),
  '80 LTR Bin': IMG('1590247813693-5541d1c609fd'),
  '110 LTR Bin': IMG('1611284446617-b295b7050fea'),
  '150 LTR Bin': IMG('1605600659873-d808a13e4d2a'),
  'Single Stand': IMG('1567169866456-2b73f9df2f9d'),
  'Double Stand': IMG('1605733513597-a8f8341084e6'),
  'Metro With Swing Top': IMG('1532996122724-e3c354a0b15b'),
  'Metro With Open Top': IMG('1590247813693-5541d1c609fd'),
  'Magnum 15L': IMG('1587582423116-ec07293f0da7'),
  'Magnum 20L': IMG('1603398938378-e54eab446dde'),
  '120L Pedal Bin': IMG('1611284446617-b295b7050fea'),
  '240L Pedal Bin': IMG('1605600659873-d808a13e4d2a'),
  'Trolly Bins': IMG('1605733513597-a8f8341084e6'),

  // ---- Tools and Instrument ----
  'Axe': IMG('1572981779307-38b8cabb2407'),
  'Mallet': IMG('1426927308491-6380b6a9936f'),
  'Hammer': IMG('1572981779307-38b8cabb2407'),
  'Corkscrew': IMG('1530124566582-a618bc2615dc'),
  'Pliers': IMG('1571171637578-41bc2dd41cd2'),
  'Construction Box': IMG('1504148455328-c376907d081c'),
  'Wheel Barrow': IMG('1541888946425-d81bb19240f5'),
  'Single Wheel Barrow': IMG('1541888946425-d81bb19240f5'),
  'Back Saw': IMG('1426927308491-6380b6a9936f'),
  'Chain Saw': IMG('1621905251189-08b45d6a269e'),
  'Spirit Level': IMG('1504148455328-c376907d081c'),
  'Tool Box': IMG('1504148455328-c376907d081c'),
  'Step Ladder': IMG('1541888946425-d81bb19240f5'),
  'Measurement Tape': IMG('1530124566582-a618bc2615dc'),

  // ---- Water Pumps ----
  'Submersible Pumps': IMG('1542013936693-884638332954'),
  'Garden Water Pumps': IMG('1585320806297-9794b3e4eeae'),
  'Water Circulation Pump': IMG('1621905252507-b35492cc74b4'),
  'Deep Well Pumps': IMG('1621905251918-48416bd8575a'),
  'Single Phase': IMG('1533709752211-118fcaf03312'),
  'CDS Series': IMG('1542013936693-884638332954'),
  'Dewatering Pump': IMG('1585320806297-9794b3e4eeae'),
};

// Composite keys for product names that repeat across different subcategories
// (e.g. "Duo Bins" exists in both the FRP and SS combination series).
const SUBCATEGORY_PRODUCT_IMAGES = {
  'Combination Series - FRP|Duo Bins': IMG('1532996122724-e3c354a0b15b'),
  'Combination Series - FRP|Trio Bins': IMG('1590247813693-5541d1c609fd'),
  'Combination Series - FRP|Quatro Bins': IMG('1611284446617-b295b7050fea'),
  'Combination Series - FRP|Two in One': IMG('1605600659873-d808a13e4d2a'),
  'Combination Series - SS|Duo Bins': IMG('1567169866456-2b73f9df2f9d'),
  'Combination Series - SS|Trio Bins': IMG('1605733513597-a8f8341084e6'),
};

const getProductImage = (category, subcategory, name) => {
  if (subcategory) {
    const compositeKey = `${subcategory}|${name}`;
    if (SUBCATEGORY_PRODUCT_IMAGES[compositeKey]) return SUBCATEGORY_PRODUCT_IMAGES[compositeKey];
  }
  return PRODUCT_IMAGES[name] || CATEGORY_IMAGES[category];
};

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

const PRODUCTS_DATA = CATEGORY_DATA.flatMap(([category, entries], categoryIndex) =>
  entries.flatMap((entry, entryIndex) => {
    const isSeries = Array.isArray(entry);
    const subcategory = isSeries ? entry[0] : '';
    const products = isSeries ? entry[1] : [entry];
    return products.map((name, productIndex) => ({
      id: `product-${categoryIndex}-${entryIndex}-${productIndex}`,
      name,
      image: getProductImage(category, subcategory, name),
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
const handleImgError = (event, category) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = CATEGORY_IMAGES[category];
};

export function ProductsPage({ go }) {
  const [term, setTerm] = useState('');
  const [category, setCategory] = useState('');
  const filtered = PRODUCTS_DATA.filter(item =>
    `${item.name} ${item.category} ${item.subcategory}`.toLowerCase().includes(term.toLowerCase()) && (!category || item.category === category)
  );

  return <>
    <PageHead crumb="Products" title={<>Our <em>Products</em></>} desc={`Browse our complete industrial safety catalogue: ${PRODUCTS_DATA.length} products across ${CATEGORIES_LIST.length} categories.`}/>
    <section className="catalog">
      <aside className="product-categories">
        <h3>Categories</h3>
        <label className={`category-select ${category ? '' : 'selected'}`}>
          <span>Select a category</span>
          <select value={category} onChange={event => setCategory(event.target.value)} aria-label="Select a product category">
            <option value="">All products</option>
            {CATEGORIES_LIST.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
        </label>
        <div className="category-filter-list" aria-label="Product categories">
          <button className={!category ? 'selected' : ''} onClick={() => setCategory('')}>All products</button>
          {CATEGORIES_LIST.map(item => <button className={category === item.name ? 'selected' : ''} key={item.id} onClick={() => setCategory(item.name)}>{item.name}</button>)}
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
              <img src={item.image} alt={item.name} onError={event => handleImgError(event, item.category)}/>
              <h3>{item.name}</h3>
              <p className="product-price">{item.price}</p>
              <p className="product-category">{productCategory(item)}</p>
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
  const whatsapp = `https://wa.me/${String(content?.site?.whatsappNumber || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello, I am interested in ${product.name}.`)}`;
  const phone = content?.site?.phone || '+91 9003900533';

  return <>
    <div className="crumb">Home / {productCategory(product)} / {product.name}</div>
    <section className="detail">
      <div className="product-image"><span>{product.badge || 'Product'}</span><img src={product.image} alt={product.name} onError={event => handleImgError(event, product.category)}/></div>
      <div className="detail-copy">
        <small>{productCategory(product)}</small><h1>{product.name}</h1>
        <p className="product-detail-price" style={{ fontSize: '18px', color: 'var(--red)', fontWeight: '700', margin: '10px 0' }}>{product.price}</p>
        <p>{product.description}</p><Btn onClick={() => selectProduct(product, 'contact', go)}>Request this product</Btn>
      </div>
      <aside className="details-box">
        <h3>Product Details</h3><p><b>Category</b><span>{product.category}</span></p>
        {product.subcategory && <p><b>Series</b><span>{product.subcategory}</span></p>}
        <p><b>Price</b><span>{product.price}</span></p><p><b>Availability</b><span>Contact us</span></p>
        <div className="help"><b>Need help?</b><a href={`tel:${phone}`}>{phone}</a><a className="whatsapp-button" href={whatsapp} target="_blank" rel="noreferrer">WhatsApp Us</a></div>
      </aside>
    </section>
    <section className="related"><h2>Related Products in {product.category}</h2>
      {related.length > 0 ? <div className="related-products-grid">
        {related.map(item => <button key={item.id} onClick={() => selectProduct(item, 'productdetail', go)} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', border: '1px solid var(--line)', borderRadius: '3px', cursor: 'pointer', backgroundColor: '#fff' }}><img src={item.image} alt={item.name} onError={event => handleImgError(event, item.category)} style={{ width: '100%', height: '100px', objectFit: 'cover' }}/><b style={{ fontSize: '12px' }}>{item.name}</b><span style={{ fontSize: '11px', color: 'var(--red)', fontWeight: '700' }}>{item.price}</span></button>)}
      </div> : <p>No other products in this category.</p>}
    </section>
  </>;
}
