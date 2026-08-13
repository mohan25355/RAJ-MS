import { useState } from 'react';
import { CtaBand, PageHead } from '../components/ui';

// STATIC GALLERY DATA — 6 IMAGES
const GALLERY_DATA = [
  {
    id: 'g1',
    title: 'Raja Electricals Store',
    image: 'src/assets/gallary/1.webp',
    type: 'Store'
  },
  {
    id: 'g2',
    title: 'Electrical Products',
    image: 'src/assets/gallary/2.webp',
    type: 'Products'
  },
  {
    id: 'g3',
    title: 'Safety Equipment Range',
    image: 'src/assets/gallary/3.webp',
    type: 'Products'
  },
  {
    id: 'g4',
    title: 'Professional Tools Collection',
    image: 'src/assets/gallary/4.webp',
    type: 'Products'
  },
  {
    id: 'g5',
    title: 'Industrial Site Supply',
    image: 'src/assets/gallary/5.webp',
    type: 'Projects'
  },
  {
    id: 'g6',
    title: 'Fast Delivery Service',
    image: 'src/assets/gallary/6.webp',
    type: 'Store'
  }
];

export default function GalleryPage({ go, content }) {
  const [filter, setFilter] = useState('All');

  const items = GALLERY_DATA;

  const types = [
    'All',
    ...new Set(items.map(x => x.type || 'Other'))
  ];

  return (
    <>
      <PageHead
        crumb="Gallery"
        title={
          <>
            Our <em>Gallery</em>
          </>
        }
        desc="A closer look at our products, project support and deliveries."
      />

      <section className="gallery">

        {/* FILTER TABS */}
        <div className="tabs">
          {types.map(x => (
            <button
              key={x}
              className={filter === x ? 'selected' : ''}
              onClick={() => setFilter(x)}
            >
              {x}
            </button>
          ))}
        </div>

        {/* GALLERY GRID */}
        <div className="gallery-grid">
          {items
            .filter(
              x => filter === 'All' || x.type === filter
            )
            .map(x => (
              <figure key={x.id}>
                <img
                  src={x.image}
                  alt={x.title}
                  loading="lazy"
                />

                <figcaption>
                  {x.title}
                </figcaption>
              </figure>
            ))}
        </div>

      </section>

      <CtaBand go={go} />
    </>
  );
}