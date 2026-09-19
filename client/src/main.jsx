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

import { getContent } from './lib/api';

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
  const [showPromotion, setShowPromotion] = useState(true);

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
     INITIAL APP LOAD & DATA-AWARE PRELOADER
  ----------------------------------------------------- */

  useEffect(() => {
    let mounted = true;
    const startTime = Date.now();

    refreshContent().finally(() => {
      if (!mounted) return;
      // Smooth transition with ~300ms min visual duration for aesthetics
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 300 - elapsed);
      setTimeout(() => {
        if (mounted) setLoading(false);
      }, remaining);
    });

    // Fallback safety timeout (6s max) so network hiccups never trap the user permanently
    const fallbackTimer = window.setTimeout(() => {
      if (mounted) setLoading(false);
    }, 6000);

    const refreshOnAdminSave = (event) => {
      if (event.type === 'raja-content-updated' || event.key === 'raja_content_updated') {
        refreshContent(true);
      }
    };

    window.addEventListener('storage', refreshOnAdminSave);
    window.addEventListener('raja-content-updated', refreshOnAdminSave);

    return () => {
      mounted = false;
      window.clearTimeout(fallbackTimer);
      window.removeEventListener('storage', refreshOnAdminSave);
      window.removeEventListener('raja-content-updated', refreshOnAdminSave);
    };
  }, []);

  /* -----------------------------------------------------
     HASH / PAGE CHANGE (ROUTING ONLY, NO NETWORK REFETCH)
  ----------------------------------------------------- */

  useEffect(() => {
    const syncPage = () => {
      setPage(getPage());
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', syncPage);
    return () => {
      window.removeEventListener('hashchange', syncPage);
    };
  }, []);

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

      {/* PROMOTION POPUP */}
      {!loading && showPromotion && (
        <div
          className="promotion-popup"
          role="dialog"
          aria-modal="true"
          aria-label="Special offer"
        >
          <div className="promotion-card">
            <button
              type="button"
              className="promotion-close"
              onClick={() => setShowPromotion(false)}
              aria-label="Close promotion"
            >
              ×
            </button>

            <img
              src={promotionImage}
              alt="Special offer"
              loading="lazy"
              decoding="async"
            />

            <button
              type="button"
              className="promotion-cancel"
              onClick={() => setShowPromotion(false)}
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
