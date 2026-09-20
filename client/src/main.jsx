import React, { useEffect, useState, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

import { Footer, Header } from './components/Layout';
import HomePage from './pages/HomePage';

const AboutPage = lazy(() => import('./pages/AboutPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then(m => ({ default: m.ProductsPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductsPage').then(m => ({ default: m.ProductDetailPage })));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const BrandsPage = lazy(() => import('./pages/BrandsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

import { API, getContent, resolveApiUrl } from './lib/api';

import preloaderLogoSrc from './assets/logo/logo.png';
import promotionImage from './assets/addimage/add.jpeg';

import './styles.css';
import './overrides.css';
import './mobile.css';
import './cms.css';
import './fixes.css';
import './footer-fix.css';
import './about.css';
import './home.css';

/* -------------------------------------------------------
   REACT ERROR BOUNDARY FOR RESILIENCE
------------------------------------------------------- */

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '80px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>Something went wrong loading this section</h2>
          <p style={{ color: '#666', margin: '15px 0' }}>{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            style={{ padding: '10px 20px', background: '#e31b16', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* -------------------------------------------------------
   PAGE CONFIGURATION
------------------------------------------------------- */

const pages = {
  home: HomePage,
  about: AboutPage,
  aboutus: AboutPage,
  products: ProductsPage,
  productdetail: ProductDetailPage,
  gallery: GalleryPage,
  brands: BrandsPage,
  contact: ContactPage,
  contactus: ContactPage,
  dashboard: DashboardPage,
};

/* -------------------------------------------------------
   ROUTING
------------------------------------------------------- */

const getPage = () =>
  window.location.hash
    .slice(1)
    .toLowerCase()
    .replaceAll('-', '') || 'home';

/* -------------------------------------------------------
   COMPANY CONTACT DETAILS
------------------------------------------------------- */

const LEGACY_PHONE = '9941336125';
const COMPANY_PHONE = '+91 9003900533';
const COMPANY_WHATSAPP = '919003900533';

/* -------------------------------------------------------
   CONTACT DATA CLEANUP
------------------------------------------------------- */

const replaceLegacyContact = (data) => {
  const digits = (value) =>
    String(value || '').replace(/\D/g, '');

  if (!data?.site) {
    return data;
  }

  const site = data.site;

  return {
    ...data,
    site: {
      ...site,
      phone: digits(site.phone).endsWith(LEGACY_PHONE)
        ? COMPANY_PHONE
        : site.phone,

      whatsappNumber: digits(site.whatsappNumber).endsWith(LEGACY_PHONE)
        ? COMPANY_WHATSAPP
        : site.whatsappNumber,
    },
  };
};

/* -------------------------------------------------------
   PRELOADER
------------------------------------------------------- */

function Preloader() {
  return (
    <div
      className="site-preloader"
      role="status"
      aria-label="Loading Raja Electricals"
    >
      <div className="preloader-brand" aria-hidden="true">
        <span className="preloader-mark-frame">
          <img
            src={preloaderLogoSrc}
            alt=""
          />
        </span>
        <span className="preloader-copy">
          <strong>RAJA</strong>
          <small style={{ color: '#ffffff' }}>
            Electrical 'N' Hardwares
          </small>
        </span>
      </div>

      <div className="preloader-track">
        <i />
      </div>

      <small>
        Loading your electrical solutions
      </small>
    </div>
  );
}

/* -------------------------------------------------------
   MAIN APP
------------------------------------------------------- */

function App() {
  const [page, setPage] = useState(getPage);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeAd, setActiveAd] = useState(null);
  const [activeAdImage, setActiveAdImage] = useState(promotionImage);
  const [showPromotion, setShowPromotion] = useState(false);

  /* -----------------------------------------------------
     LOAD WEBSITE CONTENT
  ----------------------------------------------------- */

  const refreshContent = async (force = false) => {
    try {
      const data = await getContent(force);
      setContent(replaceLegacyContact(data));
    } catch (error) {
      console.error('Failed to load website content:', error);
      setContent({});
    }
  };

  /* -----------------------------------------------------
     DYNAMIC HOME ADVERTISEMENT LOAD (NON-BLOCKING WITH FALLBACK)
  ----------------------------------------------------- */

  const loadActiveAd = async (mountedRef) => {
    try {
      const response = await fetch(`${API}/home-ads/active`);
      if (!response.ok) throw new Error('API request failed');
      const result = await response.json();
      const ad = result?.data;

      if (ad && ad.image_url && typeof ad.image_url === 'string' && ad.image_url.trim() !== '') {
        const resolvedUrl = resolveApiUrl(ad.image_url);
        const seenKey = `raja_home_ad_seen_${ad.id}`;

        if (sessionStorage.getItem(seenKey) === 'true') {
          return;
        }

        let handled = false;
        const triggerShow = () => {
          if (handled) return;
          handled = true;
          if (mountedRef.current) {
            setActiveAd(ad);
            setActiveAdImage(resolvedUrl);
            setShowPromotion(true);
          }
        };

        const img = new Image();
        img.onload = triggerShow;
        img.onerror = () => {
          if (handled) return;
          handled = true;
          if (mountedRef.current && sessionStorage.getItem('raja_home_ad_seen_default') !== 'true') {
            setActiveAd(null);
            setActiveAdImage(promotionImage);
            setShowPromotion(true);
          }
        };
        img.src = resolvedUrl;

        // Immediate check for cached images (critical for page refresh & mobile viewports)
        if (img.complete && img.naturalWidth !== 0) {
          triggerShow();
        }
      } else {
        if (mountedRef.current && sessionStorage.getItem('raja_home_ad_seen_default') !== 'true') {
          setActiveAd(null);
          setActiveAdImage(promotionImage);
          setShowPromotion(true);
        }
      }
    } catch (err) {
      if (mountedRef.current && sessionStorage.getItem('raja_home_ad_seen_default') !== 'true') {
        setActiveAd(null);
        setActiveAdImage(promotionImage);
        setShowPromotion(true);
      }
    }
  };

  /* -----------------------------------------------------
     INITIAL APP LOAD & DATA-AWARE PRELOADER
  ----------------------------------------------------- */

  const mountedRef = React.useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const startTime = Date.now();

    refreshContent().finally(() => {
      if (!mountedRef.current) return;
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 300 - elapsed);
      setTimeout(() => {
        if (mountedRef.current) setLoading(false);
      }, remaining);
    });

    loadActiveAd(mountedRef);

    const fallbackTimer = window.setTimeout(() => {
      if (mountedRef.current) setLoading(false);
    }, 6000);

    const refreshOnAdminSave = (event) => {
      if (event.type === 'raja-content-updated' || event.key === 'raja_content_updated') {
        refreshContent(true);
        loadActiveAd(mountedRef);
      }
    };

    window.addEventListener('storage', refreshOnAdminSave);
    window.addEventListener('raja-content-updated', refreshOnAdminSave);

    return () => {
      mountedRef.current = false;
      window.clearTimeout(fallbackTimer);
      window.removeEventListener('storage', refreshOnAdminSave);
      window.removeEventListener('raja-content-updated', refreshOnAdminSave);
    };
  }, []);

  const handleClosePromotion = () => {
    setShowPromotion(false);
    if (activeAd?.id) {
      sessionStorage.setItem(`raja_home_ad_seen_${activeAd.id}`, 'true');
    } else {
      sessionStorage.setItem('raja_home_ad_seen_default', 'true');
    }
  };

  const handleAdClick = () => {
    if (activeAd?.link_url) {
      const link = activeAd.link_url.trim();
      if (link.startsWith('#')) {
        go(link.replace(/^#/, ''));
        handleClosePromotion();
      } else if (link.startsWith('http://') || link.startsWith('https://')) {
        window.open(link, '_blank', 'noopener,noreferrer');
        handleClosePromotion();
      } else if (link.startsWith('/')) {
        const hashTarget = link.replace(/^\/#?/, '');
        if (hashTarget) go(hashTarget);
        handleClosePromotion();
      }
    }
  };

  /* -----------------------------------------------------
     DYNAMIC SEO & ROUTING MANAGEMENT
  ----------------------------------------------------- */

  const seoConfig = {
    home: {
      title: "Raja Electricals 'N' Hardware | Electrical, Hardware & Industrial Solutions",
      description: "Raja Electricals 'N' Hardware is a premier supplier of industrial electricals, safety PPE, hardware tools, water pumps, cables, switchgear, and site supplies in Chennai, Tamil Nadu."
    },
    products: {
      title: "Electrical & Hardware Products | Raja Electricals 'N' Hardware",
      description: "Explore our extensive catalogue of genuine electrical cables, safety helmets, power tools, LED flood lights, pumps, and hardware supplies in Chennai."
    },
    brands: {
      title: "Leading Electrical & Hardware Brands | Raja Electricals 'N' Hardware",
      description: "Authorized products from trusted global brands including Havells, Bosch, 3M Safety, Finolex, Legrand, Nippon Paint, and more."
    },
    gallery: {
      title: "Projects & Product Gallery | Raja Electricals 'N' Hardware",
      description: "Browse images of our recent site supplies, project executions, electrical inventory, and store infrastructure in Chennai."
    },
    about: {
      title: "About Raja Electricals 'N' Hardware | Dependable Supply Partner",
      description: "Over 25 years of excellence in powering construction, manufacturing, and facility projects with genuine electrical and hardware solutions."
    },
    aboutus: {
      title: "About Raja Electricals 'N' Hardware | Dependable Supply Partner",
      description: "Over 25 years of excellence in powering construction, manufacturing, and facility projects with genuine electrical and hardware solutions."
    },
    contact: {
      title: "Contact Raja Electricals 'N' Hardware | Chennai, Tamil Nadu",
      description: "Get in touch with our expert sales team for product enquiries, price quotes, bulk orders, and same-day local delivery options in Chennai."
    },
    contactus: {
      title: "Contact Raja Electricals 'N' Hardware | Chennai, Tamil Nadu",
      description: "Get in touch with our expert sales team for product enquiries, price quotes, bulk orders, and same-day local delivery options in Chennai."
    }
  };

  const updatePageSEO = (currentPage) => {
    const config = seoConfig[currentPage] || seoConfig.home;
    document.title = config.title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = config.description;

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = config.title;

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = config.description;

    let breadcrumbScript = document.getElementById('dynamic-breadcrumb-schema');
    if (!breadcrumbScript) {
      breadcrumbScript = document.createElement('script');
      breadcrumbScript.id = 'dynamic-breadcrumb-schema';
      breadcrumbScript.type = 'application/ld+json';
      document.head.appendChild(breadcrumbScript);
    }

    const breadcrumbs = [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://raj-ms-client-seven.vercel.app/" }
    ];

    if (currentPage !== 'home') {
      const pageName = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
      breadcrumbs.push({
        "@type": "ListItem",
        "position": 2,
        "name": pageName,
        "item": `https://raj-ms-client-seven.vercel.app/#${currentPage}`
      });
    }

    breadcrumbScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs
    });
  };

  useEffect(() => {
    const syncPage = () => {
      const currentPage = getPage();
      setPage(currentPage);
      updatePageSEO(currentPage);
      window.scrollTo(0, 0);
    };

    syncPage();
    window.addEventListener('hashchange', syncPage);
    return () => {
      window.removeEventListener('hashchange', syncPage);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showPromotion) {
        handleClosePromotion();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPromotion, activeAd]);

  /* -----------------------------------------------------
     NAVIGATION
  ----------------------------------------------------- */

  const go = (target, options = {}) => {
    if (
      (target === 'contact' || target === 'contactus') &&
      !options.keepOrder
    ) {
      localStorage.removeItem('raja_selected_product');
    }

    setPage(target);
    window.location.hash = target;
    window.scrollTo(0, 0);
  };

  const Page = pages[page] || HomePage;

  if (page === 'dashboard') {
    return (
      <ErrorBoundary>
        <Suspense fallback={<div className="page-loading" style={{ padding: '60px', textAlign: 'center' }}>Loading Admin Dashboard...</div>}>
          <Page />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <>
      {/* PRELOADER */}
      {loading && <Preloader />}

      {/* HEADER */}
      <Header
        go={go}
        site={content?.site}
        currentPage={page}
      />

      {/* PAGE WITH ERROR BOUNDARY & SUSPENSE */}
      <ErrorBoundary>
        <Suspense fallback={<div className="page-loading" style={{ padding: '60px', textAlign: 'center' }}>Loading page content...</div>}>
          <Page
            go={go}
            content={content}
          />
        </Suspense>
      </ErrorBoundary>

      {/* FOOTER */}
      <Footer
        go={go}
        site={content?.site}
      />

      {/* PROMOTION POPUP (VISIBLE ONLY ON HOME PAGE) */}
      {!loading && showPromotion && page === 'home' && (
        <div
          className="promotion-popup"
          role="dialog"
          aria-modal="true"
          aria-label={activeAd?.title || 'Special offer'}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleClosePromotion();
            }
          }}
        >
          <div className="promotion-card">
            <button
              type="button"
              className="promotion-close"
              onClick={handleClosePromotion}
              aria-label="Close promotion"
            >
              ×
            </button>

            <img
              src={activeAdImage}
              alt={activeAd?.title || 'Special offer'}
              loading="eager"
              decoding="async"
              onClick={activeAd?.link_url ? handleAdClick : undefined}
              style={{ cursor: activeAd?.link_url ? 'pointer' : 'default' }}
            />

            <button
              type="button"
              className="promotion-cancel"
              onClick={handleClosePromotion}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* -------------------------------------------------------
   START REACT
------------------------------------------------------- */

createRoot(
  document.getElementById('root')
).render(
  <App />
);
