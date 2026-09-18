import { PageHead } from '../components/ui';
import { ArrowRight, Bath, Cable, Camera, Droplets, Fan, HardHat, House, Lightbulb, PaintRoller, ShieldCheck, Thermometer, Wrench } from 'lucide-react';

const partnerLogoModules = import.meta.glob('../assets/PARTNERS/PARTNERS/*', {
  eager: true,
  import: 'default',
  query: '?url',
});

const partnerLogo = file => partnerLogoModules[`../assets/PARTNERS/PARTNERS/${file}`];

// ============================================
// PARTNER / BRAND IMAGES
// ============================================

// import brand1 from '../assets/PARTNERS/PARTNERS/1.png';
// import brand2 from '../assets/PARTNERS/PARTNERS/2.jpg';
// import brand3 from '../assets/PARTNERS/PARTNERS/3.jpg';
// import brand4 from '../assets/PARTNERS/PARTNERS/4.jpg';
// import brand5 from '../assets/PARTNERS/PARTNERS/5.png';
// import brand6 from '../assets/PARTNERS/PARTNERS/6.jpg';
// import brand7 from '../assets/PARTNERS/PARTNERS/7.png';
// import brand8 from '../assets/PARTNERS/PARTNERS/8.jpg';
// import brand9 from '../assets/PARTNERS/PARTNERS/9.png';
// import brand10 from '../assets/PARTNERS/PARTNERS/10.jpg';
// import brand11 from '../assets/PARTNERS/PARTNERS/11.png';
// import brand12 from '../assets/PARTNERS/PARTNERS/12.jpg';
// import brand13 from '../assets/PARTNERS/PARTNERS/13.png';
// import brand14 from '../assets/PARTNERS/PARTNERS/14.jpg';
// import brand15 from '../assets/PARTNERS/PARTNERS/15.png';
// import brand16 from '../assets/PARTNERS/PARTNERS/16.jpg';
// import brand17 from '../assets/PARTNERS/PARTNERS/17.png';
// import brand18 from '../assets/PARTNERS/PARTNERS/18.png';
// import brand19 from '../assets/PARTNERS/PARTNERS/19.png';
// import brand20 from '../assets/PARTNERS/PARTNERS/20.png';
// import brand21 from '../assets/PARTNERS/PARTNERS/21.png';
// import brand22 from '../assets/PARTNERS/PARTNERS/22.png';
// import brand23 from '../assets/PARTNERS/PARTNERS/23.png';
// import brand24 from '../assets/PARTNERS/PARTNERS/24.jpg';
// import brand25 from '../assets/PARTNERS/PARTNERS/25.png';
// import brand26 from '../assets/PARTNERS/PARTNERS/26.png';

// ============================================
// DEALER IMAGES
// ============================================

import dealer1 from '../assets/DEALERS/DEALERS/1.jpg';
import dealer2 from '../assets/DEALERS/DEALERS/2.png';
import dealer3 from '../assets/DEALERS/DEALERS/3.jpg';
import dealer4 from '../assets/DEALERS/DEALERS/4.png';
import dealer5 from '../assets/DEALERS/DEALERS/5.png';
import dealer6 from '../assets/DEALERS/DEALERS/6.jpg';
import dealer7 from '../assets/DEALERS/DEALERS/7.png';
import dealer8 from '../assets/DEALERS/DEALERS/8.png';
import dealer9 from '../assets/DEALERS/DEALERS/9.jpg';
import dealer10 from '../assets/DEALERS/DEALERS/10.png';
import dealer11 from '../assets/DEALERS/DEALERS/11.jpg';
import dealer12 from '../assets/DEALERS/DEALERS/12.png';
import dealer13 from '../assets/DEALERS/DEALERS/13.jpg';
import dealer14 from '../assets/DEALERS/DEALERS/14.png';
import dealer15 from '../assets/DEALERS/DEALERS/15.jpg';
import dealer16 from '../assets/DEALERS/DEALERS/16.jpg';
import dealer17 from '../assets/DEALERS/DEALERS/17.jpg';
import dealer18 from '../assets/DEALERS/DEALERS/18.jpg';
import dealer19 from '../assets/DEALERS/DEALERS/19.jpg';
import dealer20 from '../assets/DEALERS/DEALERS/20.png';

// ============================================
// BRANDS DATA (PARTNERS)
// ============================================

// const brandsData = [
  // { id: 'brand-1', name: 'Brand 1', logo: brand1 },
  // { id: 'brand-2', name: 'Brand 2', logo: brand2 },
  // { id: 'brand-3', name: 'Brand 3', logo: brand3 },
  // { id: 'brand-4', name: 'Brand 4', logo: brand4 },
  // { id: 'brand-5', name: 'Brand 5', logo: brand5 },
  // { id: 'brand-6', name: 'Brand 6', logo: brand6 },
  // { id: 'brand-7', name: 'Brand 7', logo: brand7 },
  // { id: 'brand-8', name: 'Brand 8', logo: brand8 },
  // { id: 'brand-9', name: 'Brand 9', logo: brand9 },
  // { id: 'brand-10', name: 'Brand 10', logo: brand10 },
  // { id: 'brand-11', name: 'Brand 11', logo: brand11 },
  // { id: 'brand-12', name: 'Brand 12', logo: brand12 },
  // { id: 'brand-13', name: 'Brand 13', logo: brand13 },
  // { id: 'brand-14', name: 'Brand 14', logo: brand14 },
  // { id: 'brand-15', name: 'Brand 15', logo: brand15 },
  // { id: 'brand-16', name: 'Brand 16', logo: brand16 },
  // { id: 'brand-17', name: 'Brand 17', logo: brand17 },
  // { id: 'brand-18', name: 'Brand 18', logo: brand18 },
  // { id: 'brand-19', name: 'Brand 19', logo: brand19 },
  // { id: 'brand-20', name: 'Brand 20', logo: brand20 },
  // { id: 'brand-21', name: 'Brand 21', logo: brand21 },
  // { id: 'brand-22', name: 'Brand 22', logo: brand22 },
  // { id: 'brand-23', name: 'Brand 23', logo: brand23 },
  // { id: 'brand-24', name: 'Brand 24', logo: brand24 },
  // { id: 'brand-25', name: 'Brand 25', logo: brand25 },
  // { id: 'brand-26', name: 'Brand 26', logo: brand26 }
// ];

// ============================================
// DEALERS DATA
// ============================================

const dealersData = [
  { id: 'dealer-1', name: 'Dealer 1', logo: dealer1 },
  { id: 'dealer-2', name: 'Dealer 2', logo: dealer2 },
  { id: 'dealer-3', name: 'Dealer 3', logo: dealer3 },
  { id: 'dealer-4', name: 'Dealer 4', logo: dealer4 },
  { id: 'dealer-5', name: 'Dealer 5', logo: dealer5 },
  { id: 'dealer-6', name: 'Dealer 6', logo: dealer6 },
  { id: 'dealer-7', name: 'Dealer 7', logo: dealer7 },
  { id: 'dealer-8', name: 'Dealer 8', logo: dealer8 },
  { id: 'dealer-9', name: 'Dealer 9', logo: dealer9 },
  { id: 'dealer-10', name: 'Dealer 10', logo: dealer10 },
  { id: 'dealer-11', name: 'Dealer 11', logo: dealer11 },
  { id: 'dealer-12', name: 'Dealer 12', logo: dealer12 },
  { id: 'dealer-13', name: 'Dealer 13', logo: dealer13 },
  { id: 'dealer-14', name: 'Dealer 14', logo: dealer14 },
  { id: 'dealer-15', name: 'Dealer 15', logo: dealer15 },
  { id: 'dealer-16', name: 'Dealer 16', logo: dealer16 },
  { id: 'dealer-17', name: 'Dealer 17', logo: dealer17 },
  { id: 'dealer-18', name: 'Dealer 18', logo: dealer18 },
  { id: 'dealer-19', name: 'Dealer 19', logo: dealer19 },
  { id: 'dealer-20', name: 'Dealer 20', logo: dealer20 }
];

// ============================================
// BRANDS PAGE
// ============================================

function LegacyBrandsPage({ content }) {
  return (
    <>
      <PageHead
        crumb="Brands"
        title={
          <>
            Brands We <em>Trust</em>
          </>
        }
        desc="Products from leading manufacturers, sourced for professional and industrial use."
      />

      <section className="brands-section">
        <div className="logo-group">
          <h2 className="marquee-title" style={{ color: '#e31b16' }}>OUR BRANDS</h2>
          <div className="logo-wall">
            <div className="logo-grid">
              {dealersData.map((item, index) => (
                <div className="logo-card" key={item.id} style={{ '--logo-order': index }}>
                  <img src={item.logo} alt={item.name} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          LOGO WALL CSS
      ============================================ */}
      <style>{`
        .brands-section {
          padding: 54px 8% 20px;
          background: #fff;
        }

        .logo-group {
          max-width: 1280px;
          margin: 0 auto 58px;
        }

        .marquee-title {
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 22px;
          text-align: center;
          color: #1a1a1a;
        }

        .logo-wall {
          padding: clamp(18px, 3vw, 38px);
          background: linear-gradient(135deg, #f7f9fc, #fff);
          border: 1px solid #e4e9ed;
          border-radius: 22px;
          box-shadow: 0 18px 45px rgba(21, 32, 43, .07);
        }

        .logo-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 14px;
        }

        .logo-card {
          min-height: 108px;
          display: grid;
          place-items: center;
          padding: 16px;
          background: #fff;
          border: 1px solid #e7ebef;
          border-radius: 12px;
          animation: logo-card-reveal .55s both;
          animation-delay: calc(var(--logo-order) * 55ms);
          animation-timeline: view();
          animation-range: entry 8% cover 28%;
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
        }

        .logo-card:hover {
          transform: translateY(-5px);
          border-color: #f2b4b0;
          box-shadow: 0 12px 25px rgba(227, 27, 22, .12);
        }

        .logo-card img {
          width: 100%;
          max-width: 145px;
          height: 68px;
          object-fit: contain;
          display: block;
        }

        @keyframes logo-card-reveal {
          from { opacity: 0; transform: translateY(18px) scale(.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }


        /* ============================================
           MOBILE
        ============================================ */
        @media (max-width: 700px) {
          .brands-section { padding: 40px 18px 10px; }
          .logo-group { margin-bottom: 42px; }

          .marquee-title {
            font-size: 22px;
            margin-bottom: 16px;
          }

          .logo-wall { padding: 14px; border-radius: 16px; }
          .logo-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
          .logo-card { min-height: 82px; padding: 10px; }
          .logo-card img { height: 50px; }
        }


        /* ============================================
           SMALL MOBILE
        ============================================ */
        @media (max-width: 420px) {
          .logo-card { min-height: 72px; }
          .logo-card img { height: 44px; }
        }
      `}</style>
    </>
  );
}

export default function BrandsPage() {
  return <BrandShowcase />;
}

const brandGroups = [
  ['Paints & Coatings', 'Colours for a brighter tomorrow.', PaintRoller, 'rose', 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?auto=format&fit=crop&w=1000&q=85', [partnerLogo('1.png'), partnerLogo('10.jpg'), partnerLogo('26.png')]],
  ['Wires & Cables', 'Powering a safer tomorrow.', Cable, 'gold', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1000&q=85', [partnerLogo('3.jpg'), partnerLogo('24.jpg')]],
  ['Pipes & Plumbing', 'Flowing solutions for life.', Droplets, 'blue', 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1000&q=85', [partnerLogo('4.jpg'), partnerLogo('9.png'), partnerLogo('15.png')]],
  ['Switches & Electrical', 'Smart solutions for modern spaces.', Wrench, 'purple', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1000&q=85', [partnerLogo('5.png'), partnerLogo('7.png'), partnerLogo('11.png'), partnerLogo('23.png'), partnerLogo('25.png')]],
  ['Lighting', 'Bright ideas for every space.', Lightbulb, 'gold', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=85', [partnerLogo('14.jpg'), partnerLogo('20.png'), partnerLogo('21.png')]],
  ['Fans', 'Cool comfort. Every day.', Fan, 'blue', 'https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=1000&q=85', [partnerLogo('16.jpg'), dealer1, partnerLogo('22.png'), partnerLogo('8.jpg')]],
  ['Water Heaters', 'Hot water. Happier living.', Thermometer, 'rose', 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1000&q=85', [partnerLogo('22.png'), partnerLogo('8.jpg'), partnerLogo('21.png'), partnerLogo('13.png')]],
  ['Sanitaryware & Bathroom', 'Elegance for everyday living.', Bath, 'mint', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=85', [partnerLogo('20.png'), partnerLogo('6.jpg'), partnerLogo('17.png'), partnerLogo('13.png')]],
  ['Water Pumps', 'Reliable flow. Always.', Droplets, 'blue', 'https://images.unsplash.com/photo-1581093458791-9d09d2e70ae4?auto=format&fit=crop&w=1000&q=85', [partnerLogo('19.png'), partnerLogo('18.png')]],
  ['Waterproofing', 'Stronger spaces. Longer life.', ShieldCheck, 'green', 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1000&q=85', [partnerLogo('12.jpg')]],
  ['Security & Protection', 'Safety for a better tomorrow.', Camera, 'purple', 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1000&q=85', [partnerLogo('2.jpg')]],
  ['Home Appliances', 'Everyday essentials. Trusted brands.', House, 'orange', 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1000&q=85', [partnerLogo('8.jpg'), partnerLogo('16.jpg')]],
];

function BrandShowcase() {
  return <main className="brand-showcase" id="top">
    <h1 className="brand-page-label">OUR BRANDS</h1>
    <section className="brand-group-grid" aria-label="Brands by category">
      {brandGroups.map(([name, description, Icon, color, image, logos]) => <article className={`brand-group brand-group--${color}`} key={name}>
        <img className="brand-group-image" src={image} alt="" />
        <div className="brand-group-copy"><span className="brand-group-icon"><Icon size={22} strokeWidth={2.5} /></span><h2>{name}</h2><p>{description}</p></div>
        <div className="brand-logo-grid">{logos.filter(Boolean).map((logo, index) => <div className="brand-logo" key={`${name}-${index}`}><img src={logo} alt={`${name} brand`} /></div>)}</div>
      </article>)}
    </section>

    <section className="brand-promise"><span className="brand-award"><HardHat size={38} /></span><div><h2>Quality Brands. Trusted by Generations.</h2><p>We bring you the best brands to build a better, smarter and brighter future.</p></div><a href="#top">Explore All Brands <ArrowRight size={19} /></a></section>

    <style>{`
      .brand-showcase{padding:58px clamp(16px,4vw,64px) 44px;background:linear-gradient(135deg,#fafcff,#f5f8ff);color:#101722}.brand-page-label{max-width:1420px;margin:0 auto 24px;font-size:clamp(24px,2.3vw,32px);letter-spacing:-.04em}.brand-group-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;max-width:1420px;margin:auto}.brand-group{position:relative;isolation:isolate;display:flex;flex-direction:column;min-height:333px;overflow:hidden;padding:18px 18px 16px;border:1px solid #e1e7f0;border-radius:13px;background:linear-gradient(135deg,#fff,#f7faff);box-shadow:0 8px 22px rgba(38,66,114,.05)}.brand-group-image{position:absolute;z-index:-1;inset:0 0 auto auto;width:67%;height:45%;object-fit:cover;opacity:.34;mask-image:linear-gradient(to left,#000 35%,transparent 100%);-webkit-mask-image:linear-gradient(to left,#000 35%,transparent 100%)}.brand-group-copy{min-height:105px}.brand-group-icon{display:grid;place-items:center;width:44px;height:44px;border-radius:12px;margin-bottom:8px;background:#dfe9ff;color:#1955c9}.brand-group h2{margin:0;font-size:19px;line-height:1.18;letter-spacing:-.035em}.brand-group p{margin:5px 0 0;color:#6b7a90;font-size:14px;line-height:1.35}.brand-logo-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;flex:1}.brand-logo{display:grid;place-items:center;min-height:58px;padding:8px;border:1px solid #e8edf3;border-radius:10px;background:rgba(255,255,255,.88);box-shadow:0 3px 10px rgba(45,70,100,.035)}.brand-logo img{display:block;max-width:100%;width:100%;height:42px;object-fit:contain}.brand-view-all{display:inline-flex;align-items:center;gap:7px;width:max-content;margin-top:15px;padding:4px 0;border:0;background:transparent;color:#2455bd;font:800 14px inherit;cursor:pointer}.brand-view-all:hover{color:#102e80;gap:10px}.brand-group--rose .brand-group-icon{background:#ffe0e9;color:#e5265d}.brand-group--gold .brand-group-icon{background:#fff0c7;color:#bc7600}.brand-group--purple .brand-group-icon{background:#e8e0ff;color:#6934d8}.brand-group--mint .brand-group-icon{background:#d9f7ef;color:#008d75}.brand-group--green .brand-group-icon{background:#dcf8df;color:#148044}.brand-group--orange .brand-group-icon{background:#ffe7d4;color:#eb6a1e}.brand-promise{display:flex;align-items:center;gap:20px;max-width:1420px;margin:30px auto 0;padding:27px 36px;border:1px solid #dce5ff;border-radius:14px;background:linear-gradient(110deg,#edf1ff,#f9faff 62%,#e9edff)}.brand-award{display:grid;place-items:center;color:#1838bf}.brand-promise h2{margin:0;font-size:22px;letter-spacing:-.04em}.brand-promise p{margin:4px 0 0;color:#71809a;font-size:14px}.brand-promise a{display:inline-flex;align-items:center;gap:9px;flex:0 0 auto;margin-left:auto;padding:14px 22px;border-radius:10px;background:#3157de;color:#fff;text-decoration:none;font-size:14px;font-weight:800}.brand-promise a:hover{background:#1f43c0}@media(max-width:1000px){.brand-group-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:700px){.brand-showcase{padding:38px 16px 28px}.brand-page-label{margin-bottom:18px}.brand-group-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.brand-group{min-height:284px;padding:14px 13px}.brand-group-copy{min-height:94px}.brand-group h2{font-size:17px}.brand-logo{min-height:51px;padding:6px}.brand-logo img{height:35px}.brand-promise{flex-wrap:wrap;padding:22px 20px;gap:12px}.brand-promise h2{font-size:19px}.brand-promise a{width:100%;justify-content:center;margin:6px 0 0}}@media(max-width:400px){.brand-group-grid{grid-template-columns:1fr}.brand-group{min-height:250px}}
    `}</style>
  </main>;
}
