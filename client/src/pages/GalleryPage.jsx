import { useState } from 'react'; 
import { CtaBand, PageHead } from '../components/ui';

// STATIC GALLERY DATA
const GALLERY_DATA = [
  { id: "g1", title: "Industrial Site Supply", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=85", type: "Projects" },
  { id: "g2", title: "Safety Equipment Range", image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=900&q=85", type: "Products" },
  { id: "g3", title: "Professional Tools Collection", image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=85", type: "Products" },
  { id: "g4", title: "Fast Delivery Service", image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=900&q=85", type: "Store" }
];

export default function GalleryPage({ go, content }) { 
  const [filter, setFilter] = useState('All'); 
  const items = GALLERY_DATA;
  const types = ['All', ...new Set(items.map(x => x.type || 'Other'))]; 
  
  return <>
    <PageHead crumb="Gallery" title={<>Our <em>Gallery</em></>} desc="A closer look at our products, project support and deliveries."/>
    <section className="gallery">
      <div className="tabs">
        {types.map(x => <button key={x} className={filter === x ? 'selected' : ''} onClick={() => setFilter(x)}>{x}</button>)}
      </div>
      <div>
        {items.filter(x => filter === 'All' || x.type === filter).map(x => <figure key={x.id}>
          <img src={x.image} alt={x.title}/>
          <figcaption>{x.title}</figcaption>
        </figure>)}
      </div>
    </section>
    <CtaBand go={go}/>
  </>; 
}
