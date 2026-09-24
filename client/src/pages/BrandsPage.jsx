import { useState } from 'react';
import { PageHead } from '../components/ui';
import {
  Bath,
  Cable,
  Camera,
  Droplets,
  ExternalLink,
  Fan,
  House,
  Lightbulb,
  Package,
  PaintRoller,
  ShieldCheck,
  Thermometer,
  Wrench,
} from 'lucide-react';

const partnerLogoModules = import.meta.glob('../assets/PARTNERS/PARTNERS/*', {
  eager: true,
  import: 'default',
  query: '?url',
});

const dealerLogoModules = import.meta.glob('../assets/DEALERS/DEALERS/*', {
  eager: true,
  import: 'default',
  query: '?url',
});

const resolveLogoUrl = logo => {
  if (!logo) return null;
  if (logo.startsWith('http') || logo.startsWith('data:')) return logo;

  if (logo.startsWith('d')) {
    const file = logo.slice(1);
    return dealerLogoModules[`../assets/DEALERS/DEALERS/${file}`] || null;
  }
  return partnerLogoModules[`../assets/PARTNERS/PARTNERS/${logo}`] || null;
};

const ICON_MAP = {
  PaintRoller,
  Cable,
  Droplets,
  Wrench,
  Lightbulb,
  Fan,
  Thermometer,
  Bath,
  ShieldCheck,
  Camera,
  House,
  Package,
};

const DEFAULT_CATEGORIES = [
  { id: 'cat-paints', name: 'Paints & Coatings', description: 'Colours for a brighter tomorrow.', icon: 'PaintRoller', color: 'rose', image: 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?auto=format&fit=crop&w=800&q=85', display_order: 1, is_active: true },
  { id: 'cat-cables', name: 'Wires & Cables', description: 'Powering a safer tomorrow.', icon: 'Cable', color: 'gold', image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=85', display_order: 2, is_active: true },
  { id: 'cat-pipes', name: 'Pipes & Plumbing', description: 'Flowing solutions for life.', icon: 'Droplets', color: 'blue', image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=85', display_order: 3, is_active: true },
  { id: 'cat-switches', name: 'Switches & Electrical', description: 'Smart solutions for modern spaces.', icon: 'Wrench', color: 'purple', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=85', display_order: 4, is_active: true },
  { id: 'cat-fans', name: 'Fans', description: 'Cool comfort. Every day.', icon: 'Fan', color: 'blue', image: 'https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=800&q=85', display_order: 5, is_active: true },
  { id: 'cat-lighting', name: 'Lighting', description: 'Bright ideas for every space.', icon: 'Lightbulb', color: 'gold', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=85', display_order: 6, is_active: true },
  { id: 'cat-sanitary', name: 'Sanitaryware & Bathroom', description: 'Elegance for everyday living.', icon: 'Bath', color: 'mint', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=85', display_order: 7, is_active: true },
  { id: 'cat-heaters', name: 'Water Heaters', description: 'Hot water. Happier living.', icon: 'Thermometer', color: 'rose', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=85', display_order: 8, is_active: true },
  { id: 'cat-pumps', name: 'Water Pumps', description: 'Reliable flow. Always.', icon: 'Droplets', color: 'blue', image: 'https://images.unsplash.com/photo-1581093458791-9d09d2e70ae4?auto=format&fit=crop&w=800&q=85', display_order: 9, is_active: true },
  { id: 'cat-waterproofing', name: 'Waterproofing', description: 'Stronger spaces. Longer life.', icon: 'ShieldCheck', color: 'green', image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=85', display_order: 10, is_active: true },
  { id: 'cat-security', name: 'Security & Protection', description: 'Safety for a better tomorrow.', icon: 'Camera', color: 'purple', image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=85', display_order: 11, is_active: true },
  { id: 'cat-appliances', name: 'Home Appliances', description: 'Everyday essentials. Trusted brands.', icon: 'House', color: 'orange', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=85', display_order: 12, is_active: true },
];

const DEFAULT_BRANDS = [
  // 1. Paints & Coatings (4)
  { id: 'b-birla', name: 'Birla Opus', category: 'Paints & Coatings', logo: '1.png', display_order: 1, is_active: true },
  { id: 'b-nippon', name: 'Nippon Paint', category: 'Paints & Coatings', logo: null, display_order: 2, is_active: true },
  { id: 'b-nerolac', name: 'Kansai Nerolac', category: 'Paints & Coatings', logo: '10.jpg', display_order: 3, is_active: true },
  { id: 'b-vapour', name: 'Vapour Paints', category: 'Paints & Coatings', logo: '26.png', display_order: 4, is_active: true },

  // 2. Wires & Cables (4)
  { id: 'b-finolex-c', name: 'Finolex Cables', category: 'Wires & Cables', logo: '3.jpg', display_order: 1, is_active: true },
  { id: 'b-rrkabel', name: 'RR Kabel', category: 'Wires & Cables', logo: '24.jpg', display_order: 2, is_active: true },
  { id: 'b-orbit-w', name: 'Orbit', category: 'Wires & Cables', logo: '25.png', display_order: 3, is_active: true },
  { id: 'b-luker-w', name: 'Luker', category: 'Wires & Cables', logo: '25.png', display_order: 4, is_active: true },

  // 3. Pipes & Plumbing (3)
  { id: 'b-astral-p', name: 'Astral Pipes', category: 'Pipes & Plumbing', logo: '4.jpg', display_order: 1, is_active: true },
  { id: 'b-finolex-p', name: 'Finolex Pipes', category: 'Pipes & Plumbing', logo: '15.png', display_order: 2, is_active: true },
  { id: 'b-ashirvad', name: 'Ashirvad', category: 'Pipes & Plumbing', logo: '9.png', display_order: 3, is_active: true },

  // 4. Switches & Electrical (7)
  { id: 'b-legrand', name: 'Legrand', category: 'Switches & Electrical', logo: '5.png', display_order: 1, is_active: true },
  { id: 'b-norwood', name: 'Norwood', category: 'Switches & Electrical', logo: '11.png', display_order: 2, is_active: true },
  { id: 'b-norisys', name: 'Norisys', category: 'Switches & Electrical', logo: '23.png', display_order: 3, is_active: true },
  { id: 'b-gm', name: 'GM', category: 'Switches & Electrical', logo: null, display_order: 4, is_active: true },
  { id: 'b-anchor', name: 'Anchor by Panasonic', category: 'Switches & Electrical', logo: '7.png', display_order: 5, is_active: true },
  { id: 'b-roma', name: 'Roma', category: 'Switches & Electrical', logo: null, display_order: 6, is_active: true },
  { id: 'b-orbit-se', name: 'Orbit', category: 'Switches & Electrical', logo: '25.png', display_order: 7, is_active: true },

  // 5. Fans (8)
  { id: 'b-crompton-f', name: 'Crompton', category: 'Fans', logo: '16.jpg', display_order: 1, is_active: true },
  { id: 'b-atomberg', name: 'Atomberg', category: 'Fans', logo: 'd1.jpg', display_order: 2, is_active: true },
  { id: 'b-almonard', name: 'Almonard', category: 'Fans', logo: 'd2.png', display_order: 3, is_active: true },
  { id: 'b-orient-f', name: 'Orient Electric', category: 'Fans', logo: '22.png', display_order: 4, is_active: true },
  { id: 'b-polar', name: 'Polar', category: 'Fans', logo: 'd4.png', display_order: 5, is_active: true },
  { id: 'b-polstar', name: 'Polstar', category: 'Fans', logo: 'd3.jpg', display_order: 6, is_active: true },
  { id: 'b-bajaj-f', name: 'Bajaj', category: 'Fans', logo: '8.jpg', display_order: 7, is_active: true },
  { id: 'b-luker-f', name: 'Luker', category: 'Fans', logo: '25.png', display_order: 8, is_active: true },

  // 6. Lighting (4)
  { id: 'b-philips', name: 'Philips', category: 'Lighting', logo: '14.jpg', display_order: 1, is_active: true },
  { id: 'b-jaquar-l', name: 'Jaquar Lighting', category: 'Lighting', logo: '20.png', display_order: 2, is_active: true },
  { id: 'b-luker-l', name: 'Luker', category: 'Lighting', logo: '25.png', display_order: 3, is_active: true },
  { id: 'b-orbit-l', name: 'Orbit', category: 'Lighting', logo: '25.png', display_order: 4, is_active: true },

  // 7. Sanitaryware & Bathroom (4)
  { id: 'b-jaquar-s', name: 'Jaquar', category: 'Sanitaryware & Bathroom', logo: '20.png', display_order: 1, is_active: true },
  { id: 'b-essco', name: 'Essco by Jaquar', category: 'Sanitaryware & Bathroom', logo: '6.jpg', display_order: 2, is_active: true },
  { id: 'b-parryware-s', name: 'Parryware', category: 'Sanitaryware & Bathroom', logo: '13.png', display_order: 3, is_active: true },
  { id: 'b-geberit', name: 'Geberit', category: 'Sanitaryware & Bathroom', logo: '17.png', display_order: 4, is_active: true },

  // 8. Water Heaters (6)
  { id: 'b-aosmith', name: 'A. O. Smith', category: 'Water Heaters', logo: '21.png', display_order: 1, is_active: true },
  { id: 'b-bajaj-h', name: 'Bajaj', category: 'Water Heaters', logo: '8.jpg', display_order: 2, is_active: true },
  { id: 'b-crompton-h', name: 'Crompton', category: 'Water Heaters', logo: '16.jpg', display_order: 3, is_active: true },
  { id: 'b-orient-h', name: 'Orient Electric', category: 'Water Heaters', logo: '22.png', display_order: 4, is_active: true },
  { id: 'b-luker-h', name: 'Luker', category: 'Water Heaters', logo: '25.png', display_order: 5, is_active: true },
  { id: 'b-parryware-h', name: 'Parryware', category: 'Water Heaters', logo: '13.png', display_order: 6, is_active: true },

  // 9. Water Pumps (2)
  { id: 'b-cri', name: 'C.R.I. Pumps', category: 'Water Pumps', logo: '19.png', display_order: 1, is_active: true },
  { id: 'b-hasten', name: 'Hasten', category: 'Water Pumps', logo: '18.png', display_order: 2, is_active: true },

  // 10. Waterproofing (2)
  { id: 'b-drfixit', name: 'Dr. Fixit', category: 'Waterproofing', logo: '12.jpg', display_order: 1, is_active: true },
  { id: 'b-zycocil', name: 'Zycocil+', category: 'Waterproofing', logo: 'd5.png', display_order: 2, is_active: true },

  // 11. Security & Protection (1)
  { id: 'b-europa', name: 'Europa', category: 'Security & Protection', logo: '2.jpg', display_order: 1, is_active: true },

  // 12. Home Appliances (1)
  { id: 'b-vguard', name: 'V-Guard', category: 'Home Appliances', logo: '13.png', display_order: 1, is_active: true },
];

const CATEGORY_DISPLAY_NAMES = {
  'Pipes & Plumbing': 'Pipes & Fittings',
  'Security & Protection': 'Security',
  'Water Pumps': 'Water Management',
};

const BRAND_DISPLAY_NAMES = {
  'A. O. Smith': 'AO Smith',
  'Essco by Jaquar': 'Essco',
  'Vapour Paints': 'Vapocure Paints',
  'Zycocil+': 'Zycosil+',
  'Europa': 'Europaa',
};

function BrandLogoCard({ brand }) {
  const [hasError, setHasError] = useState(false);
  const isUrl = brand.websiteUrl && /^https?:\/\//i.test(brand.websiteUrl);
  const logoSrc = resolveLogoUrl(brand.logo);
  const displayName = BRAND_DISPLAY_NAMES[brand.name] || brand.name;

  const content = (
    <div className="brand-logo-card" title={displayName}>
      {logoSrc && !hasError ? (
        <img
          src={logoSrc}
          alt={displayName}
          loading="lazy"
          decoding="async"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="brand-fallback-text">{displayName}</span>
      )}
    </div>
  );

  if (isUrl) {
    return (
      <a href={brand.websiteUrl} target="_blank" rel="noopener noreferrer" className="brand-link-wrapper">
        {content}
      </a>
    );
  }

  return content;
}

export default function BrandsPage({ content }) {
  const apiCategories = content?.categories;
  const rawCategories = Array.isArray(apiCategories) && apiCategories.length > 0 ? apiCategories : DEFAULT_CATEGORIES;

  const apiBrands = content?.brands;
  const rawBrands = Array.isArray(apiBrands) && apiBrands.length > 0 ? apiBrands : DEFAULT_BRANDS;

  const categories = rawCategories
    .filter(cat => cat.is_active !== false && cat.is_active !== 'false')
    .sort((a, b) => (Number(a.display_order) || 999) - (Number(b.display_order) || 999));

  const brands = rawBrands
    .filter(brand => brand.is_active !== false && brand.is_active !== 'false')
    .sort((a, b) => (Number(a.display_order) || 999) - (Number(b.display_order) || 999));

  const categoriesWithBrands = categories
    .map(cat => {
      const catBrands = brands.filter(
        b => (b.category || '').trim().toLowerCase() === (cat.name || '').trim().toLowerCase()
      );
      return { ...cat, brands: catBrands };
    })
    .filter(cat => cat.brands.length > 0);

  return (
    <>
      <PageHead
        crumb="Brands"
        title={
          <>
            Trusted <em>Brands</em>
          </>
        }
        desc="Top quality brands for your home, business and every project need."
      />

      <div className="brands-page-wrapper">
        <div className="brands-page-header">
          <span className="brands-page-badge">OUR BRANDS</span>
          <h1 className="brands-page-title">Trusted Brands. Better Living.</h1>
          <p className="brands-page-desc">
            Top quality brands for your home, business and every project need.
          </p>
        </div>

        <section className="brands-category-grid" aria-label="Brands by category">
          {categoriesWithBrands.map(category => {
            const IconComponent = ICON_MAP[category.icon] || Package;
            const themeColor = category.color || 'blue';
            const categoryTitle = CATEGORY_DISPLAY_NAMES[category.name] || category.name;

            return (
              <article className={`category-card category-card--${themeColor}`} key={category.id || category.name}>
                <div className="category-card-header">
                  {category.image && (
                    <img className="category-card-bg-image" src={category.image} alt="" loading="lazy" decoding="async" />
                  )}
                  <div className={`category-card-overlay ${themeColor}`} />

                  <div className="category-icon-wrapper">
                    <IconComponent size={20} strokeWidth={2.4} />
                  </div>

                  <h2 className="category-card-title">{categoryTitle}</h2>
                  {category.description && <p className="category-card-desc">{category.description}</p>}
                </div>

                <div className="category-brands-body">
                  <div className="category-brand-grid">
                    {category.brands.map(brand => (
                      <BrandLogoCard key={brand.id || brand.name} brand={brand} />
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>

      <style>{`
        .brands-page-wrapper {
          padding: 54px 6% 64px;
          background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
          min-height: 80vh;
        }

        .brands-page-header {
          max-width: 1360px;
          margin: 0 auto 40px;
          text-align: center;
        }

        .brands-page-badge {
          display: inline-block;
          padding: 6px 16px;
          background: #fee2e2;
          color: #dc2626;
          font-weight: 800;
          font-size: 12px;
          letter-spacing: 0.08em;
          border-radius: 20px;
          margin-bottom: 12px;
        }

        .brands-page-title {
          font-size: clamp(26px, 2.6vw, 38px);
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.03em;
          margin: 0 0 10px;
        }

        .brands-page-desc {
          font-size: clamp(14px, 1.4vw, 16px);
          color: #64748b;
          max-width: 680px;
          margin: 0 auto;
          line-height: 1.5;
        }

        .brands-category-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
          max-width: 1360px;
          margin: 0 auto;
          align-items: stretch;
        }

        .category-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          box-sizing: border-box;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
          overflow: hidden;
          position: relative;
          isolation: isolate;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }

        .category-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.09);
          border-color: #cbd5e1;
        }

        .category-card-header {
          position: relative;
          padding: 18px 20px 16px;
          min-height: 105px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          flex-shrink: 0;
          overflow: hidden;
          isolation: isolate;
        }

        .category-card-bg-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: -2;
          opacity: 0.35;
        }

        .category-card-overlay {
          position: absolute;
          inset: 0;
          z-index: -1;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.88) 100%);
        }

        .category-card-overlay.rose { background: linear-gradient(180deg, rgba(159, 18, 57, 0.82) 0%, rgba(136, 19, 55, 0.94) 100%); }
        .category-card-overlay.gold { background: linear-gradient(180deg, rgba(146, 64, 14, 0.82) 0%, rgba(120, 53, 15, 0.94) 100%); }
        .category-card-overlay.blue { background: linear-gradient(180deg, rgba(30, 58, 138, 0.82) 0%, rgba(23, 37, 84, 0.94) 100%); }
        .category-card-overlay.purple { background: linear-gradient(180deg, rgba(88, 28, 135, 0.82) 0%, rgba(58, 12, 99, 0.94) 100%); }
        .category-card-overlay.mint { background: linear-gradient(180deg, rgba(15, 118, 110, 0.82) 0%, rgba(19, 78, 74, 0.94) 100%); }
        .category-card-overlay.green { background: linear-gradient(180deg, rgba(20, 83, 45, 0.82) 0%, rgba(20, 83, 45, 0.94) 100%); }
        .category-card-overlay.orange { background: linear-gradient(180deg, rgba(194, 65, 12, 0.82) 0%, rgba(154, 52, 18, 0.94) 100%); }

        .category-icon-wrapper {
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          color: #ffffff;
          margin-bottom: 10px;
        }

        .category-card-title {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          line-height: 1.2;
        }

        .category-card-desc {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.82);
          margin: 4px 0 0;
          line-height: 1.35;
        }

        .category-brands-body {
          padding: 18px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .category-brand-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          align-content: start;
        }

        .brand-link-wrapper {
          text-decoration: none;
          display: block;
        }

        .brand-logo-card {
          height: 84px;
          min-height: 84px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px 14px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .brand-logo-card:hover {
          transform: translateY(-3px);
          border-color: #cbd5e1;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
        }

        .brand-logo-card img {
          max-width: 88%;
          max-height: 58px;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }

        .brand-fallback-text {
          font-size: 14px;
          font-weight: 700;
          color: #334155;
          text-align: center;
          word-break: break-word;
          line-height: 1.25;
        }

        @media (max-width: 1280px) {
          .brands-category-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 18px;
            align-items: stretch;
          }
        }

        @media (max-width: 960px) {
          .brands-category-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
            align-items: stretch;
          }
          .brand-logo-card {
            height: 84px;
            min-height: 84px;
            padding: 8px 12px;
          }
          .brand-logo-card img {
            max-height: 56px;
          }
        }

        @media (max-width: 640px) {
          .brands-page-wrapper {
            padding: 28px 14px 36px;
          }
          .brands-category-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .category-card-header {
            padding: 16px 18px 14px;
            min-height: 90px;
          }
          .category-brands-body {
            padding: 14px 12px;
          }
          .category-brand-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }
          .brand-logo-card {
            height: 96px;
            min-height: 96px;
            padding: 10px 12px;
            border-radius: 12px;
          }
          .brand-logo-card img {
            max-width: 88%;
            max-height: 70px;
            width: auto;
            height: auto;
            object-fit: contain;
          }
          .brand-fallback-text {
            font-size: clamp(14px, 3.8vw, 17px);
            font-weight: 800;
            color: #1e293b;
            letter-spacing: -0.01em;
            line-height: 1.25;
            padding: 0 4px;
          }
        }

        @media (max-width: 380px) {
          .brands-page-wrapper {
            padding: 20px 10px 30px;
          }
          .category-brands-body {
            padding: 12px 10px;
          }
          .category-brand-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }
          .brand-logo-card {
            height: 90px;
            min-height: 90px;
            padding: 8px 10px;
          }
          .brand-logo-card img {
            max-width: 90%;
            max-height: 64px;
          }
          .brand-fallback-text {
            font-size: clamp(13px, 3.6vw, 15px);
          }
        }

        @media (max-width: 330px) {
          .category-brand-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }
        }
      `}</style>
    </>
  );
}
