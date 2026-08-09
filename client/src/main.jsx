import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BottomNav, Footer, Header } from './components/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import { ProductDetailPage, ProductsPage } from './pages/ProductsPage';
import ProjectsPage from './pages/ProjectsPage';
import GalleryPage from './pages/GalleryPage';
import BrandsPage from './pages/BrandsPage';
import ContactPage from './pages/ContactPage';
import DashboardPage from './pages/DashboardPage';
import { getContent } from './lib/api';
import './styles.css';
import './overrides.css';
import './mobile.css';
import './cms.css';
import './fixes.css';
import './about.css';
import './home.css';

const pages = { home: HomePage, about: AboutPage, aboutus: AboutPage, products: ProductsPage, productdetail: ProductDetailPage, projects: ProjectsPage, gallery: GalleryPage, brands: BrandsPage, contact: ContactPage, contactus: ContactPage, dashboard: DashboardPage };
const getPage = () => window.location.hash.slice(1).toLowerCase().replaceAll('-', '') || 'home';
function App() { const [page, setPage] = useState(getPage); const [content, setContent] = useState(null); const refreshContent = () => getContent().then(setContent).catch(() => setContent({})); useEffect(() => { refreshContent(); const refreshOnAdminSave = event => { if (event.key === 'raja_content_updated') refreshContent(); }; const refreshOnFocus = () => refreshContent(); window.addEventListener('storage', refreshOnAdminSave); window.addEventListener('focus', refreshOnFocus); return () => { window.removeEventListener('storage', refreshOnAdminSave); window.removeEventListener('focus', refreshOnFocus); }; }, []); useEffect(() => { const syncPage = () => { setPage(getPage()); refreshContent(); window.scrollTo(0, 0); }; window.addEventListener('hashchange', syncPage); return () => window.removeEventListener('hashchange', syncPage); }, []); const go = target => { setPage(target); window.location.hash = target; window.scrollTo(0, 0); }; const Page = pages[page] || HomePage; if (page === 'dashboard') return <Page />; return <><Header go={go} site={content?.site} /><Page go={go} content={content} /><Footer go={go} site={content?.site} /><BottomNav go={go} /></>; }
createRoot(document.getElementById('root')).render(<App />);
