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
import './styles.css';
import './overrides.css';
import './mobile.css';

const pages = { home: HomePage, about: AboutPage, aboutus: AboutPage, products: ProductsPage, productdetail: ProductDetailPage, projects: ProjectsPage, gallery: GalleryPage, brands: BrandsPage, contact: ContactPage, contactus: ContactPage, dashboard: DashboardPage };
const getPage = () => window.location.hash.slice(1).toLowerCase().replaceAll('-', '') || 'home';
function App() { const [page, setPage] = useState(getPage); useEffect(() => { const syncPage = () => { setPage(getPage()); window.scrollTo(0, 0); }; window.addEventListener('hashchange', syncPage); return () => window.removeEventListener('hashchange', syncPage); }, []); const go = target => { setPage(target); window.location.hash = target; window.scrollTo(0, 0); }; const Page = pages[page] || HomePage; if (page === 'dashboard') return <Page />; return <><Header go={go} /><Page go={go} /><Footer go={go} /><BottomNav go={go} /></>; }
createRoot(document.getElementById('root')).render(<App />);
