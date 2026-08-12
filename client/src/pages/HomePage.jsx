import { useEffect, useState } from 'react';
import { Award, Boxes, CheckCircle2, Clock, HardHat, Headphones, Package, Shield, Star, Truck, Users, Wrench, Zap } from 'lucide-react';
import { categories as staticCategories, images } from '../data/catalog';
import { Btn, CtaBand } from '../components/ui';

const fallbackImage = item => item?.image || item?.logo || images.worker;
const homeContent = {
  site: { welcome: 'Welcome to Raja Electricals', heroTitle: 'Powering Every Project.', heroText: 'Electrical · Hardware · Safety · Industrial Solutions', trustYears: '25+', productCount: '5,000+', happyClients: '2,000+', deliveryText: 'Same Day Delivery Available', supplyText: 'For over two decades, Raja Electricals has helped contractors, facilities and industrial teams source dependable products without unnecessary delays.' },
  categories: staticCategories.map(([name, image, count], id) => ({ id, name, image: image || images.worker, count })),
  products: [{ id: 1, name: 'Industrial Safety Helmet', image: images.helmet, price: 'Contact for price', badge: 'Popular' }, { id: 2, name: 'Power Tools', image: images.tools, price: 'Contact for price', badge: 'Featured' }, { id: 3, name: 'Water Pump', image: images.pump, price: 'Contact for price', badge: 'Reliable' }, { id: 4, name: 'Electrical Supplies', image: images.worker, price: 'Contact for price', badge: 'Top rated' }],
  brands: [{ id: 1, name: 'Electrical Brands', logo: images.worker, products: 'Electrical supplies' }, { id: 2, name: 'Safety Brands', logo: images.safety, products: 'Safety products' }, { id: 3, name: 'Tool Brands', logo: images.tools, products: 'Tools and hardware' }, { id: 4, name: 'Pump Brands', logo: images.pump, products: 'Pumps and plumbing' }],
  industries: [{ id: 1, name: 'Construction', image: images.site, description: 'Reliable supplies for active worksites.' }, { id: 2, name: 'Manufacturing', image: images.plant, description: 'Industrial products for daily operations.' }, { id: 3, name: 'Facilities', image: images.worker, description: 'Maintenance and repair essentials.' }, { id: 4, name: 'Infrastructure', image: images.safety, description: 'Safety and site-ready solutions.' }],
};

export default function HomePage({ go }) {
  const [slide, setSlide] = useState(0);
  const { site, categories, products, brands, industries } = homeContent;

  const slides = [site.heroImage, site.heroImage2, site.heroImage3].filter(Boolean);
  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = setInterval(() => setSlide(current => (current + 1) % slides.length), 4500);
    return () => clearInterval(timer);
  }, [slides.length]);


  const services = [
    { icon: Truck, title: 'Fast Supply', desc: 'Responsive fulfilment for urgent site and maintenance needs.', color: '#e31b16' },
    { icon: HardHat, title: 'Site Ready', desc: 'Products selected for demanding industrial environments.', color: '#ff6b00' },
    { icon: Headphones, title: 'Real Support', desc: 'Talk to a knowledgeable team from enquiry to delivery.', color: '#0d9488' },
    { icon: Shield, title: 'Quality Assured', desc: 'Genuine branded products with warranty protection.', color: '#16a34a' },
    { icon: Package, title: 'Bulk Orders', desc: 'Special pricing and handling for large project quantities.', color: '#7c3aed' },
    { icon: Clock, title: '24hr Dispatch', desc: 'Same-day processing for orders placed before 2pm.', color: '#f59e0b' },
  ];

  const trustStats = [
    { icon: Award, value: site.trustYears || '25+', label: 'Years of Trust' },
    { icon: Users, value: site.happyClients || '10,000+', label: 'Happy Customers' },
    { icon: Package, value: site.productCount || '5,000+', label: 'Products' },
    { icon: Shield, value: '100%', label: 'Genuine Products' },
  ];

  return (
    <>
      <section className="cms-hero">
        <div>
          <span className="hero-badge"><Award size={16} /> Trusted since 1998</span>
          <small>{site.welcome || 'Welcome to Raja Electricals'}</small>
          <HeroTitle title={site.heroTitle || 'Powering Every Project.'} />
          <p>{site.heroText || 'Electrical · Hardware · Safety · Industrial Solutions'}</p>
          <div className="hero-numbers">
            <b>{site.trustYears || '25+'}<span>Years of Trust</span></b>
            <b>{site.productCount || '5000+'}<span>Products</span></b>
            <b>{site.happyClients || '2000+'}<span>Happy Clients</span></b>
          </div>
          <Btn onClick={() => go('products')}>Explore products</Btn> <Btn plain onClick={() => go('contactus')}>Request a quote</Btn>
        </div>
        <div className="hero-image">
          {slides.length
            ? <img key={slides[slide]} src={slides[slide]} alt="Raja Electricals supplies" />
            : <img src={images.worker} alt="Raja Electricals supplies" />}
          <span><Truck size={19} />{site.deliveryText || 'Same Day Delivery Available'}</span>
          {slides.length > 1 && (
            <div className="hero-dots">
              {slides.map((_, index) => (
                <button key={index} aria-label={`Show hero image ${index + 1}`} className={slide === index ? 'active' : ''} onClick={() => setSlide(index)} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Section pill="CATEGORIES" featured sectionClass="category-section" eyebrow="OUR PRODUCT RANGE" title="Everything Your Project Needs" text="One dependable source for electricals, hardware, safety, tools, pumps and infrastructure supplies.">
        <div className="cms-grid category-cms-grid">
          {categories.map(item => (
            <button key={item.id} className="image-card" onClick={() => go('products')}>
              <img src={fallbackImage(item)} alt={item.name} />
              <div><b>{item.name}</b><small>{item.count}</small></div>
            </button>
          ))}
        </div>
      </Section>

      <Section pill="FEATURED" tone="amber" title="Popular Right Now" text="Top-selling products our customers trust.">
        <div className="cms-grid product-cms-grid">
          {products.slice(0, 4).map(item => (
            <article className="product-cms-card" key={item.id}>
              <div><img src={fallbackImage(item)} alt={item.name} /><span>{item.badge}</span></div>
              <h3>{item.name}</h3>
              <p>{item.price}</p>
              <button onClick={() => { localStorage.setItem('raja_selected_product', JSON.stringify(item)); go('productdetail'); }}>View details</button>
            </article>
          ))}
        </div>
      </Section>

      <section className="intro-section">
        <div>
          <small className="section-kicker">Why choose Raja</small>
          <h2>Supply that keeps <em>work moving.</em></h2>
        </div>
        <div>
          <p style={{ fontSize: '15px', lineHeight: '1.85', color: 'var(--muted)', margin: '0 0 22px' }}>
            {site.supplyText || 'For over two decades, Raja Electricals has helped contractors, facilities and industrial teams source dependable products without unnecessary delays.'}
          </p>
          <ul className="check-list">
            {['Genuine branded products with warranty', 'Project and bulk-order support', 'Reliable local delivery within 24 hours', 'Helpful technical guidance from experts'].map(item => <li key={item}>{item}</li>)}
          </ul>
          <div className="service-grid">
            {services.map(service => {
              const Icon = service.icon;
              return (
                <article key={service.title}>
                  <span style={{ display: 'grid', placeItems: 'center', width: '54px', height: '54px', borderRadius: '12px', background: `${service.color}18`, color: service.color, marginBottom: '16px' }}><Icon size={26} /></span>
                  <h3>{service.title}</h3>
                  <p>{service.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <Section pill="BRANDS" tone="violet" title="Top Brands We Stock" text="Authentic products from industry-leading manufacturers.">
        <div className="cms-grid brand-cms-grid">
          {brands.map(item => (
            <article className="brand-cms-card" key={item.id}>
              <img src={item.logo} alt={item.name} />
              <b>{item.name}</b>
              <small>{item.products} products</small>
            </article>
          ))}
        </div>
      </Section>

      <Section pill="INDUSTRIES" tone="green" title="Industries We Serve" text="Products and support shaped around your work.">
        <div className="cms-grid industry-cms-grid">
          {industries.map(item => (
            <article className="image-card" key={item.id}>
              <img src={fallbackImage(item)} alt={item.name} />
              <div><b>{item.name}</b><small>{item.description}</small></div>
            </article>
          ))}
        </div>
      </Section>

      <section className="home-trust">
        <div className="home-trust-grid">
          {trustStats.map(stat => {
            const Icon = stat.icon;
            return (
              <div className="home-trust-card" key={stat.label}>
                <Icon size={30} />
                <b>{stat.value}</b>
                <small>{stat.label}</small>
              </div>
            );
          })}
        </div>
      </section>

      <CtaBand go={go} />
    </>
  );
}

function HeroTitle({ title = '' }) {
  const [first, ...rest] = title.replace(/\.$/, '').split(' ');
  return <h1><span>{first}</span>{rest.length > 0 && <strong>{rest.join(' ')}.</strong>}</h1>;
}

function Section({ pill, tone = 'red', title, text, eyebrow, featured = false, sectionClass = '', children }) {
  const tones = { red: 'var(--red)', amber: '#f59e0b', violet: '#7c3aed', green: '#16a34a' };
  const color = tones[tone] || tones.red;
  const header = featured ? (
    <header className="range-featured">
      <small className="section-pill" style={{ borderColor: color, color, margin: 0, alignSelf: 'start' }}>{pill}</small>
      {eyebrow && <small className="range-eyebrow">{eyebrow}</small>}
      <h2 style={{ margin: 0 }}>{title}</h2>
      <p style={{ margin: 0 }}>{text}</p>
    </header>
  ) : (
    <header>
      <span className="section-pill" style={{ borderColor: color, color }}>{pill}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </header>
  );
  return (
    <section className={`cms-section ${sectionClass}`.trim()}>
      {header}
      {children}
    </section>
  );
}

