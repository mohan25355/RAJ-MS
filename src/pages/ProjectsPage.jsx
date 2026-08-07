import { useState } from 'react';
import { projects } from '../data/catalog';
import { Btn, CtaBand, InfoSection, PageHead } from '../components/ui';
import { 
  Building2, Factory, Construction, Landmark, ArrowRight, 
  MapPin, Calendar, Briefcase, CheckCircle2, Users, Award,
  Zap, HardHat, Wrench, Shield, Cable, Star
} from 'lucide-react';

const projectCategories = ['All Projects', 'Industrial', 'Commercial', 'Infrastructure', 'Government'];

const projectDetails = [
  {
    name: 'Chennai Metro Rail Project',
    category: 'Infrastructure',
    image: 'https://picsum.photos/seed/metro/600/400',
    location: 'Chennai, Tamil Nadu',
    year: '2024',
    products: 'Electrical & Safety Products',
    description: 'Supplied critical electrical components and safety equipment for station construction and tunnel works.',
    stats: [
      { icon: Cable, label: '200km+ Cables Supplied' },
      { icon: HardHat, label: '5000+ Safety Helmets' },
      { icon: Shield, label: '100% Quality Pass Rate' }
    ]
  },
  {
    name: 'Ford India Manufacturing Plant',
    category: 'Industrial',
    image: 'https://picsum.photos/seed/fordplant/600/400',
    location: 'Maraimalai Nagar, Tamil Nadu',
    year: '2023',
    products: 'Industrial Hardware & Tools',
    description: 'Ongoing supplier of industrial tools, hardware, and maintenance supplies for manufacturing operations.',
    stats: [
      { icon: Wrench, label: '1000+ Tool Types' },
      { icon: Briefcase, label: 'Monthly Supply Contract' },
      { icon: CheckCircle2, label: '98% On-Time Delivery' }
    ]
  },
  {
    name: 'DLF IT Park Construction',
    category: 'Commercial',
    image: 'https://picsum.photos/seed/dlfitpark/600/400',
    location: 'Porur, Chennai',
    year: '2024',
    products: 'Complete Electrical Package',
    description: 'Delivered comprehensive electrical solutions including switchgear, cables, and lighting systems for the IT park.',
    stats: [
      { icon: Zap, label: '500+ Switchgear Units' },
      { icon: Building2, label: '10 Floor Coverage' },
      { icon: Users, label: '15+ Contractor Teams' }
    ]
  },
  {
    name: 'Tamil Nadu Government Hospital',
    category: 'Government',
    image: 'https://picsum.photos/seed/hospital/600/400',
    location: 'Chennai, Tamil Nadu',
    year: '2024',
    products: 'Safety & Electrical Equipment',
    description: 'Supplied hospital-grade electrical equipment, backup power systems, and safety gear for critical care facilities.',
    stats: [
      { icon: Shield, label: 'Medical Grade Equipment' },
      { icon: Award, label: 'Government Approved Vendor' },
      { icon: CheckCircle2, label: 'Zero Defect Supply' }
    ]
  },
  {
    name: 'Chennai Port Trust Expansion',
    category: 'Infrastructure',
    image: 'https://picsum.photos/seed/porttrust/600/400',
    location: 'Chennai Port, Tamil Nadu',
    year: '2023',
    products: 'Heavy-Duty Electrical Systems',
    description: 'Provided specialized marine-grade electrical systems and safety equipment for port expansion works.',
    stats: [
      { icon: Zap, label: 'Marine-Grade Products' },
      { icon: HardHat, label: '10000+ Safety Units' },
      { icon: Briefcase, label: '24-Month Project Support' }
    ]
  },
  {
    name: 'L&T Industrial Complex',
    category: 'Industrial',
    image: 'https://picsum.photos/seed/ltcomplex/600/400',
    location: 'Sriperumbudur, Tamil Nadu',
    year: '2024',
    products: 'MRO & Safety Supplies',
    description: 'Comprehensive supply of maintenance, repair, and operations materials for large-scale industrial facility.',
    stats: [
      { icon: Wrench, label: '5000+ MRO Items' },
      { icon: Calendar, label: '2-Year Supply Agreement' },
      { icon: Users, label: '200+ Department Users' }
    ]
  }
];

export default function ProjectsPage({ go }) { 
  const [activeTab, setActiveTab] = useState('All Projects');
  const [hoveredProject, setHoveredProject] = useState(null);

  const filteredProjects = activeTab === 'All Projects' 
    ? projectDetails 
    : projectDetails.filter(p => p.category === activeTab);

  return <>
    <PageHead 
      crumb="Projects" 
      title={<>Our <em>Projects</em></>} 
      desc="Delivering quality products and reliable supply support for a stronger tomorrow." 
    />
    
    {/* Hero Stats Banner */}
    <section style={{
      padding: '60px 5%',
      background: 'linear-gradient(135deg, #b8911c 0%,  #9e417c 100%)',
      color: '#fff'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '32px',
        textAlign: 'center'
      }}>
        {[
          { icon: Building2, stat: '50+', label: 'Projects Completed' },
          { icon: Factory, stat: '4', label: 'Industry Sectors' },
          { icon: Users, stat: '200+', label: 'Contractors Served' },
          { icon: Award, stat: '98%', label: 'Client Satisfaction' }
        ].map((item, i) => (
          <div key={i} style={{
            padding: '24px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'transform 0.3s',
            cursor: 'default'
          }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <item.icon size={28} style={{ color: '#3b82f6', marginBottom: '12px' }} />
            <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>{item.stat}</div>
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>{item.label}</div>
          </div>
        ))}
      </div>
    </section>

    {/* Projects Grid Section */}
    <section className="work" style={{ padding: '80px 5%', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#fff',
            padding: '8px 20px',
            borderRadius: '50px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            marginBottom: '20px'
          }}>
            <Briefcase size={16} style={{ color: '#2563eb' }} />
            <span style={{ 
              fontWeight: '600', 
              color: '#2563eb', 
              fontSize: '13px',
              letterSpacing: '2px'
            }}>PORTFOLIO</span>
          </div>
          
          <h2 style={{ 
            fontSize: '42px', 
            fontWeight: '700', 
            color: '#0f172a',
            marginBottom: '16px'
          }}>
            Industries We <span style={{ color: '#2563eb' }}>Serve</span>
          </h2>
          
          <p style={{ 
            color: '#64748b', 
            fontSize: '18px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Delivering excellence across multiple sectors with tailored supply solutions
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="tabs" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '12px',
          marginBottom: '48px',
          flexWrap: 'wrap'
        }}>
          {projectCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              style={{
                padding: '12px 24px',
                border: activeTab === cat ? '2px solid #2563eb' : '2px solid #e2e8f0',
                borderRadius: '12px',
                background: activeTab === cat ? '#eff6ff' : '#fff',
                color: activeTab === cat ? '#2563eb' : '#64748b',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== cat) {
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.color = '#2563eb';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== cat) {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.color = '#64748b';
                }
              }}
            >
              {cat === 'Industrial' && <Factory size={18} />}
              {cat === 'Commercial' && <Building2 size={18} />}
              {cat === 'Infrastructure' && <Construction size={18} />}
              {cat === 'Government' && <Landmark size={18} />}
              {cat === 'All Projects' && <Briefcase size={18} />}
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="project-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '32px',
          marginBottom: '48px'
        }}>
          {filteredProjects.map((project, index) => (
            <article 
              key={project.name}
              onMouseEnter={() => setHoveredProject(index)}
              onMouseLeave={() => setHoveredProject(null)}
              style={{
                background: '#fff',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hoveredProject === index ? 'translateY(-10px)' : 'translateY(0)',
                cursor: 'pointer',
                border: '1px solid #e2e8f0'
              }}
            >
              {/* Project Image */}
              <div style={{ position: 'relative', height: '250px', overflow: 'hidden' }}>
                <img 
                  src={project.image} 
                  alt={project.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.6s',
                    transform: hoveredProject === index ? 'scale(1.1)' : 'scale(1)'
                  }}
                />
                
                {/* Category Badge */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  padding: '8px 16px',
                  background: 'rgba(37,99,235,0.95)',
                  color: '#fff',
                  borderRadius: '50px',
                  fontSize: '12px',
                  fontWeight: '600',
                  letterSpacing: '1px',
                  backdropFilter: 'blur(10px)'
                }}>
                  {project.category}
                </div>

                {/* Hover Overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  padding: '40px 24px 24px',
                  opacity: hoveredProject === index ? 1 : 0,
                  transition: 'opacity 0.3s',
                  color: '#fff'
                }}>
                  <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{project.description}</p>
                </div>
              </div>

              {/* Project Info */}
              <div style={{ padding: '24px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginBottom: '12px',
                  color: '#64748b',
                  fontSize: '13px'
                }}>
                  <MapPin size={14} />
                  <span>{project.location}</span>
                  <span style={{ margin: '0 4px' }}>•</span>
                  <Calendar size={14} />
                  <span>{project.year}</span>
                </div>
                
                <h3 style={{ 
                  fontSize: '22px', 
                  fontWeight: '700', 
                  color: '#0f172a',
                  marginBottom: '8px'
                }}>
                  {project.name}
                </h3>
                
                <p style={{ 
                  color: '#2563eb', 
                  fontWeight: '600', 
                  fontSize: '14px',
                  marginBottom: '20px'
                }}>
                  {project.products}
                </p>

                {/* Stats Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  padding: '16px 0',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  {project.stats.map((stat, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <stat.icon size={16} style={{ color: '#2563eb', marginBottom: '4px' }} />
                      <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => go('contactus')}
            style={{
              padding: '16px 32px',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.3s',
              boxShadow: '0 8px 25px rgba(37,99,235,0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1d4ed8';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(37,99,235,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2563eb';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(37,99,235,0.3)';
            }}
          >
            Discuss Your Project
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </section>

    {/* Why Partner With Us Section */}
    <InfoSection centered title={<>Built for demanding<br /><em style={{ color: '#2563eb' }}>project environments.</em></>}>
      <p style={{ fontSize: '18px', color: '#475569', lineHeight: '1.8', marginBottom: '32px' }}>
        Our product range and supply experience support project teams across manufacturing, construction, commercial facilities, and public infrastructure. We understand project timelines, quality standards, and the importance of reliable supply chains.
      </p>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {[
          { icon: Cable, title: 'Electrical Distribution', desc: 'Complete range of cables, switchgear, panels, and distribution equipment for projects of any scale.' },
          { icon: Shield, title: 'Safety Equipment', desc: 'Personal protective equipment (PPE) and safety systems meeting industrial and government standards.' },
          { icon: Wrench, title: 'Tools & Hardware', desc: 'Professional-grade tools, fasteners, and hardware for construction and maintenance teams.' },
          { icon: CheckCircle2, title: 'Project Supply', desc: 'Scheduled repeat supply for long-term projects with dedicated account management.' }
        ].map((item, i) => (
          <div key={i} style={{
            padding: '24px',
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            transition: 'all 0.3s'
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
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <item.icon size={24} style={{ color: '#2563eb' }} />
            </div>
            <h4 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '8px' }}>{item.title}</h4>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </InfoSection>

    {/* Testimonials Section */}
    <section style={{ padding: '80px 5%', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
            What Our Clients Say
          </h2>
          <p style={{ color: '#64748b', fontSize: '18px' }}>
            Trusted by leading organizations across Tamil Nadu
          </p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {[
            { 
              quote: "Raja Electricals has been our trusted supplier for over 5 years. Their product quality and delivery reliability are exceptional.",
              author: "Project Manager",
              company: "Leading Infrastructure Company",
              rating: 5
            },
            { 
              quote: "The team's technical knowledge and quick response time have made them our go-to partner for all electrical and safety supplies.",
              author: "Procurement Head",
              company: "Manufacturing Plant, Chennai",
              rating: 5
            },
            { 
              quote: "They understand project urgency. Multiple times they've delivered critical supplies within hours to keep our construction on schedule.",
              author: "Site Engineer",
              company: "Commercial Construction Firm",
              rating: 5
            }
          ].map((testimonial, i) => (
            <div key={i} style={{
              background: '#fff',
              padding: '32px',
              borderRadius: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
              }}
            >
              {/* Stars */}
              <div style={{ marginBottom: '16px', display: 'flex', gap: '4px' }}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                ))}
              </div>
              
              <p style={{ 
                color: '#475569', 
                lineHeight: '1.8', 
                fontSize: '16px',
                fontStyle: 'italic',
                marginBottom: '20px'
              }}>
                "{testimonial.quote}"
              </p>
              
              <div style={{
                borderTop: '1px solid #e2e8f0',
                paddingTop: '16px'
              }}>
                <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                  {testimonial.author}
                </div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>
                  {testimonial.company}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <CtaBand go={go} />
  </>;
}
