import { useState } from 'react';
import { Boxes, Clock, MessageCircle, ShieldCheck, Users, Wrench, Award, Target, Heart, Star, TrendingUp, Globe, Play, Quote, Building2, MapPin } from 'lucide-react';
import { images } from '../data/catalog';
import { CtaBand, InfoSection, PageHead } from '../components/ui';

// ... (keep the journey and values arrays as they were)

export default function AboutPage({ go }) { 
  const [activeYear, setActiveYear] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  return <>
    <PageHead 
      crumb="About Us" 
      title={<>Built on <em>Trust.</em><br />Powered by <i>Experience.</i></>} 
      desc="A dependable supply partner for professionals building, maintaining and growing." 
    />
    
    {/* Redesigned Hero Story Section */}
    <section style={{ 
      padding: '100px 5%', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #f0f9ff 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        left: '-100px',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }}></div>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Section Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '80px',
          animation: 'fadeInUp 1s ease-out'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: '#fff',
            padding: '8px 24px',
            borderRadius: '50px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            marginBottom: '24px',
            border: '1px solid #e2e8f0'
          }}>
            <Building2 size={18} style={{ color: '#2563eb' }} />
            <span style={{ 
              fontWeight: '600', 
              color: '#2563eb', 
              fontSize: '14px',
              letterSpacing: '2px'
            }}>THE RAJA STORY</span>
          </div>
          
          <h2 style={{ 
            fontSize: 'clamp(32px, 5vw, 48px)', 
            fontWeight: '800', 
            color: '#0f172a',
            lineHeight: '1.2',
            marginBottom: '16px',
            maxWidth: '700px',
            margin: '0 auto 24px'
          }}>
            From a Small Store to a{' '}
            <span style={{ 
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Trusted Industry Partner
            </span>
          </h2>
          
          <p style={{ 
            color: '#64748b', 
            fontSize: '18px', 
            maxWidth: '600px', 
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            A 25-year journey of growth, trust, and unwavering commitment to quality
          </p>
        </div>

        {/* Main Content Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '60px',
          alignItems: 'center'
        }}>
          {/* Left Side - Content */}
          <div style={{ animation: 'fadeInLeft 1s ease-out 0.3s both' }}>
            {/* Stat Cards Row */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '16px',
              marginBottom: '32px'
            }}>
              {[
                { number: '25+', label: 'Years', icon: Clock },
                { number: '10K+', label: 'Customers', icon: Users },
                { number: '5K+', label: 'Products', icon: Boxes }
              ].map((stat, i) => (
                <div key={i} style={{
                  background: '#fff',
                  padding: '20px 16px',
                  borderRadius: '16px',
                  textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
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
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                  }}
                >
                  <stat.icon size={20} style={{ color: '#2563eb', marginBottom: '8px' }} />
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: '800', 
                    color: '#0f172a',
                    lineHeight: '1'
                  }}>{stat.number}</div>
                  <div style={{ 
                    color: '#64748b', 
                    fontSize: '13px',
                    marginTop: '4px'
                  }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Story Content */}
            <div style={{
              background: '#fff',
              padding: '32px',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
              position: 'relative'
            }}>
              {/* Quote Icon */}
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: '30px',
                background: '#2563eb',
                padding: '10px',
                borderRadius: '12px',
                boxShadow: '0 8px 20px rgba(37,99,235,0.3)'
              }}>
                <Quote size={24} style={{ color: '#fff' }} />
              </div>

              <div style={{ marginTop: '20px' }}>
                <p style={{ 
                  fontSize: '17px', 
                  color: '#475569', 
                  lineHeight: '1.8', 
                  marginBottom: '16px' 
                }}>
                  Raja Electricals 'N' Hardware & RK Innovations began its journey in{' '}
                  <strong style={{ color: '#2563eb' }}>2000</strong> as a modest electrical store in{' '}
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    color: '#0f172a',
                    fontWeight: '600'
                  }}>
                    <MapPin size={14} style={{ color: '#dc2626' }} />
                    Chennai
                  </span>. 
                  What started with a handful of products and a strong commitment to service has grown into one of the region's most dependable suppliers.
                </p>
                
                <p style={{ 
                  fontSize: '17px', 
                  color: '#475569', 
                  lineHeight: '1.8', 
                  marginBottom: '16px' 
                }}>
                  Over <strong style={{ color: '#2563eb' }}>25 years</strong>, we've earned the trust of thousands of contractors, facility managers, and industrial teams who value genuine products, timely delivery, and practical product knowledge.
                </p>
                
                <p style={{ 
                  fontSize: '17px', 
                  color: '#475569', 
                  lineHeight: '1.8',
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  borderLeft: '4px solid #2563eb',
                  fontStyle: 'italic'
                }}>
                  "Today, with 5000+ products across 200+ brands, we continue to serve Chennai's growing industrial landscape with the same dedication that defined our earliest days."
                </p>
              </div>

              {/* CTA Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                marginTop: '24px',
                flexWrap: 'wrap'
              }}>
                <button 
                  onClick={() => go('products')}
                  style={{
                    padding: '12px 24px',
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
                    fontSize: '15px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1d4ed8';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#2563eb';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Boxes size={18} />
                  Explore Products
                </button>
                
                <button 
                  onClick={() => go('contactus')}
                  style={{
                    padding: '12px 24px',
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
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <MessageCircle size={18} />
                  Get in Touch
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Animated Gallery/Showcase */}
          <div style={{ 
            animation: 'fadeInRight 1s ease-out 0.6s both',
            position: 'relative'
          }}>
            {/* Main Image Card */}
            <div style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
              transform: 'rotate(-2deg)',
              transition: 'all 0.5s',
              cursor: 'pointer',
              background: '#fff'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'rotate(0deg) scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'rotate(-2deg) scale(1)';
              }}
            >
              <img 
                src={images?.worker || 'https://picsum.photos/seed/warehouse/600/700'} 
                alt="Raja Electricals warehouse"
                style={{ 
                  width: '100%', 
                  height: '400px', 
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              
              {/* Overlay */}
              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                padding: '40px 24px 24px',
                color: '#fff'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <Star size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                  <Star size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                  <Star size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                  <Star size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                  <Star size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                  <span style={{ marginLeft: '4px', fontWeight: '600' }}>4.8/5</span>
                </div>
                <p style={{ fontSize: '14px', opacity: '0.9', margin: 0 }}>
                  Trusted by 500+ business clients across Chennai
                </p>
              </div>
            </div>

            {/* Floating Cards */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '-20px',
              background: '#fff',
              padding: '16px',
              borderRadius: '16px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              animation: 'float 3s ease-in-out infinite'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award size={24} style={{ color: '#fff' }} />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '18px', color: '#0f172a' }}>25+</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Years of Excellence</div>
              </div>
            </div>

            <div style={{
              position: 'absolute',
              bottom: '40px',
              left: '-30px',
              background: '#fff',
              padding: '16px 20px',
              borderRadius: '16px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              animation: 'float 3s ease-in-out infinite 1.5s'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={24} style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '16px', color: '#0f172a' }}>100% Genuine</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Authentic Products Guaranteed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </section>








        {/* ... rest of the page ... */}
  </>;
}