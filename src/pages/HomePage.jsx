import { useEffect, useState } from 'react';
import { HardHat, Headphones, Truck, Shield, Zap, Wrench, Package, Clock, Award, Users } from 'lucide-react';
import { images, categories } from '../data/catalog';
import { Btn, CtaBand, InfoSection, Stats } from '../components/ui';

export default function HomePage({ go }) { 
  // Replace these three image values with your final banner images when ready.
  const heroSlides = [
    { image: images.hero, alt: 'Electrical equipment and industrial supplies' },
    { image: images.tools, alt: 'Professional tools and hardware' },
    { image: images.safety, alt: 'Industrial safety equipment' }
  ];
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveHeroSlide(current => (current + 1) % heroSlides.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  const services = [
    { icon: Truck, title: 'Fast Supply', desc: 'Responsive fulfilment for urgent site and maintenance needs.', color: '#2563eb' },
    { icon: HardHat, title: 'Site Ready', desc: 'Products selected for demanding industrial environments.', color: '#059669' },
    { icon: Headphones, title: 'Real Support', desc: 'Talk to a knowledgeable team from enquiry to delivery.', color: '#7c3aed' },
    { icon: Shield, title: 'Quality Assured', desc: 'Genuine branded products with warranty protection.', color: '#dc2626' },
    { icon: Package, title: 'Bulk Orders', desc: 'Special pricing and handling for large project quantities.', color: '#ea580c' },
    { icon: Clock, title: '24hr Dispatch', desc: 'Same-day processing for orders placed before 2pm.', color: '#0891b2' }
  ];

  // Using actual brand logos from your image files
  const brands = [
    { name: 'Havells', logo: '/images/brands/havells.png', products: '250+' },
    { name: 'Anchor', logo: '/images/brands/anchor.png', products: '180+' },
    { name: 'Bosch', logo: '/images/brands/bosch.png', products: '120+' },
    { name: '3M', logo: '/images/brands/3m.png', products: '90+' },
    { name: 'Philips', logo: '/images/brands/philips.png', products: '200+' },
    { name: 'Siemens', logo: '/images/brands/siemens.png', products: '150+' }
  ];

  const featuredProducts = [
    { name: 'Industrial Cables', image: '/images/products/cables.jpg', price: 'From ₹450', badge: 'Best Seller' },
    { name: 'Safety Helmets', image: '/images/products/helmet.jpg', price: 'From ₹180', badge: 'Essential' },
    { name: 'LED Flood Lights', image: '/images/products/floodlight.jpg', price: 'From ₹890', badge: 'New' },
    { name: 'Power Tools Kit', image: '/images/products/toolkit.jpg', price: 'From ₹2,499', badge: 'Popular' }
  ];

  // Fallback images for categories if not provided
  const categoryImages = {
    'Electrical': '/images/categories/electrical.jpg',
    'Hardware': '/images/categories/hardware.jpg',
    'Safety': '/images/categories/safety.jpg',
    'Tools': '/images/categories/tools.jpg',
    'Pumps': '/images/categories/pumps.jpg',
    'Lighting': '/images/categories/lighting.jpg'
  };

  return <>
    {/* Hero Section - Enhanced */}
    <section className="home-hero" style={{
      background: 'linear-gradient(115deg, #ffffff 0%, #ffffff 62%, #fff4ee 100%)',
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center',
      padding: '80px 5%',
      color: '#11181d',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none'
      }}></div>
      
      <div className="hero-copy" style={{ flex: 1, zIndex: 1 }}>
        <div className="hero-badge" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: '#fff4f1',
          border: '1px solid #f2b6ad',
          padding: '8px 16px',
          borderRadius: '50px',
          fontSize: '14px',
          marginBottom: '24px'
        }}>
          <Award size={16} color="#e31b16" /> Trusted Since 1998
        </div>
        <small style={{ color: '#000000', fontSize: '16px', display: 'block', marginBottom: '16px' }}>
          Welcome to Raja Electricals 'N' Hardware
        </small>
        
        <h1 style={{ color: '#11181d', fontSize: '64px', lineHeight: '.95', marginBottom: '24px', fontWeight: '800' }}>
          Powering<br /><em style={{ color: '#e31b16', fontStyle: 'normal' }}>Every</em> <i style={{ color: '#ff6b00' }}>Project.</i>
        </h1>
        <p style={{ fontSize: '18px', color: '#48545c', marginBottom: '32px' }}>
          Electrical · Hardware · Safety · Industrial Solutions
        </p>
        <div className="hero-stats-row" style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
          <div className="mini-stat">
            <strong style={{ fontSize: '28px', color: '#e31b16', display: 'block' }}>5000+</strong>
            <span style={{ color: '#657077', fontSize: '14px' }}>Products</span>
          </div>
          <div className="mini-stat">
            <strong style={{ fontSize: '28px', color: '#e31b16', display: 'block' }}>200+</strong>
            <span style={{ color: '#657077', fontSize: '14px' }}>Brands</span>
          </div>
          <div className="mini-stat">
            <strong style={{ fontSize: '28px', color: '#e31b16', display: 'block' }}>24hr</strong>
            <span style={{ color: '#657077', fontSize: '14px' }}>Dispatch</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Btn onClick={() => go('products')}>Explore products</Btn>
          <Btn plain onClick={() => go('contactus')}>Request a quote</Btn>
        </div>
      </div>
      
      <div className="hero-shot" style={{ flex: '0 1 52%', height: '520px', minHeight: '420px', position: 'relative', zIndex: 1, overflow: 'hidden', background: '#fff', clipPath: 'none' }}>
        {heroSlides.map((slide, index) => <img
          key={slide.image}
          src={slide.image}
          alt={slide.alt}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'right center',
            opacity: activeHeroSlide === index ? 1 : 0,
            transform: activeHeroSlide === index ? 'scale(1.08)' : 'scale(1)',
            transformOrigin: 'right center',
            transition: 'opacity 650ms ease, transform 4s ease',
            borderRadius: '20px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
          }}
        />)}
        <div className="hero-card" style={{
          position: 'absolute',
          bottom: '30px',
          left: '-20px',
          background: '#fff',
          color: '#0f172a',
          padding: '16px 24px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          fontWeight: '600'
        }}>
          <Zap size={20} style={{ color: '#f59e0b' }} />
          <span>Same Day Delivery Available</span>
        </div>
        <div style={{ position: 'absolute', right: '18px', bottom: '18px', zIndex: 2, display: 'flex', gap: '8px' }}>
          {heroSlides.map((slide, index) => <button key={slide.image} onClick={() => setActiveHeroSlide(index)} aria-label={`Show slide ${index + 1}`} style={{ width: activeHeroSlide === index ? '24px' : '8px', height: '8px', padding: 0, border: 0, borderRadius: '99px', background: activeHeroSlide === index ? '#e31b16' : '#fff', transition: 'width 200ms ease', boxShadow: '0 1px 4px rgba(0,0,0,.35)' }} />)}
        </div>
      </div>
    </section>

    <Stats />

    {/* Categories Section - Enhanced with Cards */}
    <section className="pad cats" style={{ padding: '80px 5%', background: '#f8fafc' }}>
      <div className="center" style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="badge-outline" style={{
          display: 'inline-block',
          padding: '6px 16px',
          border: '2px solid #3b82f6',
          borderRadius: '50px',
          color: '#3b82f6',
          fontWeight: '600',
          fontSize: '12px',
          letterSpacing: '2px',
          marginBottom: '16px'
        }}>CATEGORIES</span>
        <small className="section-kicker" style={{ display: 'block', color: '#64748b', marginBottom: '8px' }}>
          Our product range
        </small>
        <h2 style={{ fontSize: '42px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
          Everything Your Project Needs
        </h2>
        <p style={{ fontSize: '18px', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
          One dependable source for electricals, hardware, safety, tools, pumps and infrastructure supplies.
        </p>
      </div>
      
      <div className="category-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '24px',
        maxWidth: '1200px',
        margin: '0 auto 48px'
      }}>
        {categories.map(([name, image, count]) => 
          <button 
            className="category" 
            key={name} 
            onClick={() => go('products')}
            style={{
              background: '#fff',
              border: 'none',
              borderRadius: '16px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.3s, box-shadow 0.3s',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
            }}
          >
            <div className="cat-img-wrap" style={{ position: 'relative', overflow: 'hidden', height: '200px' }}>
              <img 
                src={image || categoryImages[name] || `/images/categories/${name.toLowerCase()}.jpg`} 
                alt={name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
              <div className="cat-overlay" style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                padding: '20px',
                color: '#fff',
                opacity: 0,
                transition: 'opacity 0.3s'
              }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
              >
                <span style={{ fontWeight: '600' }}>View All →</span>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <b style={{ fontSize: '20px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>{name}</b>
              <small style={{ color: '#64748b' }}>{count} Products</small>
            </div>
          </button>
        )}
      </div>
      
      <div className="center" style={{ textAlign: 'center' }}>
        <Btn onClick={() => go('products')}>View all products</Btn>
      </div>
    </section>

    {/* Featured Products Row */}
    <section className="pad featured-products" style={{ padding: '80px 5%', background: '#fff' }}>
      <div className="center" style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="badge-outline" style={{
          display: 'inline-block',
          padding: '6px 16px',
          border: '2px solid #f59e0b',
          borderRadius: '50px',
          color: '#f59e0b',
          fontWeight: '600',
          fontSize: '12px',
          letterSpacing: '2px',
          marginBottom: '16px'
        }}>FEATURED</span>
        <h2 style={{ fontSize: '42px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
          Popular Right Now
        </h2>
        <p style={{ fontSize: '18px', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
          Top-selling products our customers trust
        </p>
      </div>
      
      <div className="featured-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {featuredProducts.map((product, i) => (
          <div 
            className="product-card" 
            key={i} 
            onClick={() => go('products')}
            style={{
              background: '#fff',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: '1px solid #e2e8f0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
            }}
          >
            <div className="product-img-wrap" style={{ position: 'relative', height: '280px', background: '#f8fafc' }}>
              <img 
                src={product.image} 
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span className="product-badge" style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#3b82f6',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '50px',
                fontSize: '12px',
                fontWeight: '600'
              }}>{product.badge}</span>
            </div>
            <div className="product-info" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>{product.name}</h4>
              <p className="product-price" style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#3b82f6',
                marginBottom: '16px'
              }}>{product.price}</p>
              <button className="btn-sm" style={{
                width: '100%',
                padding: '12px',
                background: '#0f172a',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'background 0.3s'
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#0f172a'}
              >View Details</button>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Why Choose Us - Enhanced with Service Cards */}
    <InfoSection title={<>Supply that keeps<br /><em style={{ color: '#3b82f6' }}>work moving.</em></>}>
      <p style={{ fontSize: '18px', color: '#64748b', lineHeight: '1.8' }}>
        For over two decades, Raja Electricals 'N' Hardware has helped contractors, facilities and industrial teams source the products they need without unnecessary delays. Our team combines a broad catalogue with practical product knowledge.
      </p>
      <ul className="check-list" style={{ 
        listStyle: 'none', 
        padding: 0, 
        marginBottom: '48px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px'
      }}>
        {['Genuine branded products with warranty', 'Project and bulk-order support', 'Reliable local delivery within 24 hours', 'Helpful technical guidance from experts'].map((item, i) => (
          <li key={i} style={{ 
            paddingLeft: '28px', 
            position: 'relative',
            fontSize: '16px',
            color: '#334155'
          }}>
            <span style={{ 
              position: 'absolute', 
              left: 0, 
              color: '#10b981',
              fontWeight: 'bold'
            }}>✓</span> {item}
          </li>
        ))}
      </ul>
      
      <div className="service-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px',
        maxWidth: '1200px'
      }}>
        {services.map((service, i) => (
          <article 
            key={i} 
            className="service-card"
            style={{
              background: '#fff',
              padding: '32px',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div className="service-icon" style={{ 
              backgroundColor: service.color + '15', 
              color: service.color,
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <service.icon size={27} />
            </div>
            <h3 style={{ fontSize: '22px', color: '#0f172a', marginBottom: '12px' }}>{service.title}</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6' }}>{service.desc}</p>
          </article>
        ))}
      </div>
    </InfoSection>

    {/* Brands Section */}
    <section className="pad brands-section" style={{ padding: '80px 5%', background: '#f8fafc' }}>
      <div className="center" style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="badge-outline" style={{
          display: 'inline-block',
          padding: '6px 16px',
          border: '2px solid #8b5cf6',
          borderRadius: '50px',
          color: '#8b5cf6',
          fontWeight: '600',
          fontSize: '12px',
          letterSpacing: '2px',
          marginBottom: '16px'
        }}>BRANDS</span>
        <h2 style={{ fontSize: '42px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
          Top Brands We Stock
        </h2>
        <p style={{ fontSize: '18px', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
          Authentic products from industry-leading manufacturers
        </p>
      </div>
      
      <div className="brands-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '24px',
        maxWidth: '1200px',
        margin: '0 auto 48px'
      }}>
        {brands.map((brand, i) => (
          <div 
            className="brand-card" 
            key={i}
            style={{
              background: '#fff',
              padding: '32px',
              borderRadius: '16px',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
            }}
          >
            <img 
              src={brand.logo} 
              alt={brand.name}
              style={{ 
                width: '120px', 
                height: '60px', 
                objectFit: 'contain',
                marginBottom: '16px',
                filter: 'grayscale(20%)'
              }}
              onError={(e) => {
                // Fallback if image doesn't load
                e.target.src = `https://picsum.photos/seed/${brand.name.toLowerCase()}/160/80`;
              }}
            />
            <div className="brand-info">
              <strong style={{ display: 'block', fontSize: '16px', color: '#0f172a', marginBottom: '4px' }}>
                {brand.name}
              </strong>
              <span style={{ color: '#64748b', fontSize: '14px' }}>{brand.products} products</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="center" style={{ textAlign: 'center' }}>
        <Btn plain onClick={() => go('products')}>View all brands →</Btn>
      </div>
    </section>

    {/* Trust Indicators */}
    <section className="pad trust-section" style={{ 
      padding: '80px 5%', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#fff'
    }}>
      <div className="trust-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '32px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {[
          { icon: Users, stat: '10,000+', label: 'Happy Customers' },
          { icon: Package, stat: '50,000+', label: 'Orders Delivered' },
          { icon: Award, stat: '25+ Years', label: 'Industry Experience' },
          { icon: Shield, stat: '100%', label: 'Genuine Products' }
        ].map((item, i) => (
          <div 
            className="trust-card" 
            key={i}
            style={{
              textAlign: 'center',
              padding: '32px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'transform 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <item.icon size={32} style={{ color: '#3b82f6', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>
              {item.stat}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '16px' }}>{item.label}</p>
          </div>
        ))}
      </div>
    </section>

    <CtaBand go={go} />
  </>;
}
