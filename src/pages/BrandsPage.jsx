import { useState } from 'react';
import { images } from '../data/catalog';
import { Btn, CtaBand, PageHead } from '../components/ui';
import { 
  Shield, Award, Star, CheckCircle2, ExternalLink, 
  Building2, BadgeCheck, Truck, Users, Zap 
} from 'lucide-react';

const brands = [
  { 
    name: 'Havells', 
    logo: 'https://picsum.photos/seed/havells/200/100',
    category: 'Electrical',
    products: '250+ Products',
    since: '2005',
    description: 'India\'s leading electrical equipment manufacturer',
    authorized: true
  },
  { 
    name: 'Schneider Electric', 
    logo: 'https://picsum.photos/seed/schneider/200/100',
    category: 'Electrical',
    products: '180+ Products',
    since: '2008',
    description: 'Global specialist in energy management and automation',
    authorized: true
  },
  { 
    name: 'KSB Pumps', 
    logo: 'https://picsum.photos/seed/ksbpumps/200/100',
    category: 'Pumps',
    products: '120+ Products',
    since: '2010',
    description: 'World-class pumps, valves and systems manufacturer',
    authorized: true
  },
  { 
    name: '3M Safety', 
    logo: 'https://picsum.photos/seed/3msafety/200/100',
    category: 'Safety',
    products: '90+ Products',
    since: '2012',
    description: 'Global leader in personal protective equipment',
    authorized: true
  },
  { 
    name: 'Bosch', 
    logo: 'https://picsum.photos/seed/bosch/200/100',
    category: 'Tools',
    products: '200+ Products',
    since: '2006',
    description: 'Professional power tools and accessories',
    authorized: true
  },
  { 
    name: 'Finolex', 
    logo: 'https://picsum.photos/seed/finolex/200/100',
    category: 'Cables',
    products: '150+ Products',
    since: '2003',
    description: 'India\'s most trusted cable manufacturer',
    authorized: true
  },
  { 
    name: 'Asian Paints', 
    logo: 'https://picsum.photos/seed/asianpaints/200/100',
    category: 'Paints',
    products: '300+ Products',
    since: '2015',
    description: 'India\'s largest paint company',
    authorized: true
  },
  { 
    name: 'Stanley', 
    logo: 'https://picsum.photos/seed/stanley/200/100',
    category: 'Tools',
    products: '170+ Products',
    since: '2007',
    description: 'Professional hand tools and storage solutions',
    authorized: true
  },
  { 
    name: 'Crompton', 
    logo: 'https://picsum.photos/seed/crompton/200/100',
    category: 'Electrical',
    products: '220+ Products',
    since: '2004',
    description: 'Leading manufacturer of pumps, fans, and lighting',
    authorized: true
  },
  { 
    name: 'Pidilite', 
    logo: 'https://picsum.photos/seed/pidilite/200/100',
    category: 'Hardware',
    products: '140+ Products',
    since: '2011',
    description: 'Adhesives, sealants, and construction chemicals',
    authorized: true
  },
  { 
    name: 'Honeywell', 
    logo: 'https://picsum.photos/seed/honeywell/200/100',
    category: 'Safety',
    products: '100+ Products',
    since: '2013',
    description: 'Advanced safety and automation solutions',
    authorized: true
  },
  { 
    name: 'L&T Electrical', 
    logo: 'https://picsum.photos/seed/lnt/200/100',
    category: 'Electrical',
    products: '190+ Products',
    since: '2009',
    description: 'Premium switchgear and electrical solutions',
    authorized: true
  }
];

const brandCategories = ['All Brands', 'Electrical', 'Safety', 'Tools', 'Pumps', 'Cables', 'Paints', 'Hardware'];

export default function BrandsPage({ go }) { 
  const [activeCategory, setActiveCategory] = useState('All Brands');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBrands = brands.filter(brand => {
    const matchesCategory = activeCategory === 'All Brands' || brand.category === activeCategory;
    const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return <>
    <PageHead 
      crumb="Brands" 
      title={<>Brands We <em>Trust</em></>} 
      desc="Products from leading manufacturers, sourced for professional and industrial use." 
    />
    
    {/* Trust Banner */}
    <section style={{
      padding: '60px 5%',
      background: 'linear-gradient(135deg, #c27511 0%, #9e417c 100%)',
      color: '#fff'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '32px',
        textAlign: 'center'
      }}>
        {[
          { icon: Building2, stat: '12+', label: 'Authorized Partners' },
          { icon: Shield, stat: '100%', label: 'Genuine Products' },
          { icon: Award, stat: '20+ Years', label: 'Partnerships' },
          { icon: Zap, stat: '2,000+', label: 'Brand Products' }
        ].map((item, i) => (
          <div key={i} style={{
            padding: '32px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'transform 0.3s',
            cursor: 'default'
          }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <item.icon size={32} style={{ color: '#3b82f6', marginBottom: '16px' }} />
            <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>
              {item.stat}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '16px' }}>{item.label}</div>
          </div>
        ))}
      </div>
    </section>

    {/* Brands Section */}
    <section className="brands" style={{ padding: '80px 5%', background: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Brand Intro with Image */}
        <div className="brand-intro" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '60px',
          alignItems: 'center',
          marginBottom: '60px',
          padding: '48px',
          background: 'linear-gradient(135deg, #f8fafc, #eff6ff)',
          borderRadius: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ position: 'relative' }}>
            <img 
              src={images?.tools || 'https://picsum.photos/seed/brandtools/600/500'} 
              alt="Quality brands"
              style={{ 
                width: '100%', 
                borderRadius: '20px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              right: '-20px',
              background: '#fff',
              padding: '20px',
              borderRadius: '16px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <BadgeCheck size={28} style={{ color: '#2563eb' }} />
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>
                  Authorized Partner
                </div>
                <div style={{ color: '#64748b', fontSize: '12px' }}>
                  All Leading Brands
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#fff',
              padding: '8px 20px',
              borderRadius: '50px',
              marginBottom: '20px',
              border: '1px solid #e2e8f0'
            }}>
              <Shield size={16} style={{ color: '#2563eb' }} />
              <span style={{ 
                fontWeight: '600', 
                color: '#2563eb', 
                fontSize: '13px',
                letterSpacing: '2px'
              }}>OUR PROMISE</span>
            </div>
            
            <h2 style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: '#0f172a',
              lineHeight: '1.3',
              marginBottom: '20px'
            }}>
              Quality starts with the{' '}
              <span style={{ color: '#2563eb' }}>right brands</span>.
            </h2>
            
            <p style={{ 
              fontSize: '17px', 
              color: '#475569', 
              lineHeight: '1.8',
              marginBottom: '24px'
            }}>
              We carefully choose manufacturers known for performance, safety, and service. 
              Each brand partnership represents years of trust, consistent quality, and reliable after-sales support. 
              That gives every customer a more dependable project result, whether the requirement is one item or a complete site supply.
            </p>
            
            <div style={{ 
              display: 'flex', 
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '24px'
            }}>
              {['Genuine Products', 'Warranty Support', 'Technical Backup'].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#059669',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  <CheckCircle2 size={16} />
                  {item}
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => go('contactus')}
                style={{
                  padding: '14px 28px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s',
                  fontSize: '15px',
                  boxShadow: '0 8px 25px rgba(37,99,235,0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1d4ed8';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Ask for a Catalogue
              </button>
              
              <button
                onClick={() => go('products')}
                style={{
                  padding: '14px 28px',
                  background: '#fff',
                  color: '#2563eb',
                  border: '2px solid #2563eb',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s',
                  fontSize: '15px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#eff6ff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <ExternalLink size={18} />
                View Products
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div style={{ marginBottom: '40px' }}>
          {/* Search Bar */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '24px' 
          }}>
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '500px'
            }}>
              <input
                type="text"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  paddingLeft: '48px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.3s',
                  background: '#fff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              />
              <svg 
                style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }} 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
            </div>
          </div>

          {/* Category Filters */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            {brandCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '10px 20px',
                  border: activeCategory === cat ? '2px solid #2563eb' : '2px solid #e2e8f0',
                  borderRadius: '10px',
                  background: activeCategory === cat ? '#eff6ff' : '#fff',
                  color: activeCategory === cat ? '#2563eb' : '#64748b',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => {
                  if (activeCategory !== cat) {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.color = '#2563eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeCategory !== cat) {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.color = '#64748b';
                  }
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Brands Grid */}
        <div className="brand-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {filteredBrands.map((brand, index) => (
            <article 
              key={brand.name}
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '32px',
                border: '1px solid #e2e8f0',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              {/* Number Badge */}
              <span style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                fontSize: '40px',
                fontWeight: '900',
                color: '#f1f5f9',
                zIndex: 0,
                lineHeight: '1'
              }}>
                {String(index + 1).padStart(2, '0')}
              </span>

              {/* Authorized Badge */}
              {brand.authorized && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#f0fdf4',
                  padding: '4px 10px',
                  borderRadius: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  zIndex: 1
                }}>
                  <BadgeCheck size={14} style={{ color: '#059669' }} />
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#059669' }}>
                    Authorized
                  </span>
                </div>
              )}

              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Brand Logo */}
                <div style={{
                  width: '100%',
                  height: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <img 
                    src={brand.logo} 
                    alt={brand.name}
                    style={{
                      maxWidth: '80%',
                      maxHeight: '60px',
                      objectFit: 'contain',
                      filter: 'grayscale(0%)',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                </div>

                {/* Brand Info */}
                <div style={{ textAlign: 'center' }}>
                  <b style={{ 
                    fontSize: '20px', 
                    color: '#0f172a',
                    display: 'block',
                    marginBottom: '4px'
                  }}>
                    {brand.name}
                  </b>
                  
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: '#eff6ff',
                    borderRadius: '6px',
                    marginBottom: '12px'
                  }}>
                    <small style={{ color: '#2563eb', fontWeight: '600', fontSize: '12px' }}>
                      {brand.category}
                    </small>
                  </div>
                  
                  <p style={{ 
                    color: '#64748b', 
                    fontSize: '13px',
                    marginBottom: '16px',
                    lineHeight: '1.5'
                  }}>
                    {brand.description}
                  </p>

                  {/* Stats Row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '24px',
                    paddingTop: '16px',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                        {brand.products}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Products</div>
                    </div>
                    <div style={{ 
                      width: '1px', 
                      background: '#e2e8f0' 
                    }}></div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                        Since {brand.since}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Partner</div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* No Results */}
        {filteredBrands.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#64748b'
          }}>
            <Building2 size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <h3 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>
              No brands found
            </h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </section>

    {/* Why Choose Our Brands Section */}
    <section style={{ padding: '80px 5%', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
            Why Partner Brands Matter
          </h2>
          <p style={{ color: '#64748b', fontSize: '18px' }}>
            The difference between buying products and building projects
          </p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {[
            { 
              icon: Shield, 
              title: 'Authenticity Guaranteed', 
              desc: 'Every product comes directly from authorized distributors with full manufacturer warranty and traceability.',
              color: '#2563eb'
            },
            { 
              icon: Award, 
              title: 'Quality Consistency', 
              desc: 'Partner brands maintain rigorous quality standards, ensuring every batch meets specifications.',
              color: '#059669'
            },
            { 
              icon: Truck, 
              title: 'Reliable Availability', 
              desc: 'Strong brand relationships mean better stock availability and faster delivery for your projects.',
              color: '#7c3aed'
            },
            { 
              icon: Users, 
              title: 'Technical Support', 
              desc: 'Direct access to manufacturer technical teams for product selection and application guidance.',
              color: '#dc2626'
            },
            { 
              icon: BadgeCheck, 
              title: 'Warranty Protection', 
              desc: 'Full manufacturer warranty coverage with hassle-free claim processing through us.',
              color: '#ea580c'
            },
            { 
              icon: Building2, 
              title: 'Project Confidence', 
              desc: 'Using recognized brands builds trust with clients and ensures compliance with specifications.',
              color: '#0891b2'
            }
          ].map((item, i) => (
            <div key={i} style={{
              background: '#fff',
              padding: '32px',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s',
              cursor: 'default'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = item.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: item.color + '15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <item.icon size={28} style={{ color: item.color }} />
              </div>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                color: '#0f172a',
                marginBottom: '12px'
              }}>
                {item.title}
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.7', fontSize: '15px' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <CtaBand go={go} />
  </>;
}