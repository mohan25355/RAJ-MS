import { useState } from 'react'; 
import { PageHead } from '../components/ui';

// STATIC BRANDS DATA
const BRANDS_DATA = [
  { 
    id: "havells", 
    name: "Havells", 
    logo: "https://dummyimage.com/240x110/ffffff/cc0000&text=HAVELLS", 
    category: "Electrical", 
    products: "250+", 
    description: "Premium electrical equipment and consumer products for modern living." 
  },
  { 
    id: "bosch", 
    name: "Bosch", 
    logo: "https://dummyimage.com/240x110/ffffff/e00000&text=BOSCH", 
    category: "Tools", 
    products: "120+", 
    description: "Professional power tools and accessories for industrial applications." 
  },
  { 
    id: "3m", 
    name: "3M Safety", 
    logo: "https://dummyimage.com/240x110/ffffff/cc0000&text=3M", 
    category: "Safety", 
    products: "90+", 
    description: "Trusted personal protection equipment and safety solutions worldwide." 
  },
  { 
    id: "apollo", 
    name: "Apollo Pipes", 
    logo: "https://dummyimage.com/240x110/ffffff/0066cc&text=APOLLO", 
    category: "Plumbing", 
    products: "80+", 
    description: "High-quality plumbing pipes and fittings for residential and commercial." 
  }
];

export default function BrandsPage({ content }) { 
  const [term, setTerm] = useState(''); 
  const brands = BRANDS_DATA.filter(x => x.name.toLowerCase().includes(term.toLowerCase())); 
  
  return <>
    <PageHead crumb="Brands" title={<>Brands We <em>Trust</em></>} desc="Products from leading manufacturers, sourced for professional and industrial use."/>
    <section className="brands">
      <input className="brand-search" placeholder="Search brands..." value={term} onChange={e => setTerm(e.target.value)}/>
      <div className="brand-grid">
        {brands.map(x => <article key={x.id}>
          <img src={x.logo} alt={x.name}/>
          <b>{x.name}</b>
          <span>{x.category} · {x.products} products</span>
          <small>{x.description}</small>
        </article>)}
      </div>
    </section>
  </>; 
}
