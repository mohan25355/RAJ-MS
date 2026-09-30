import { useEffect, useState } from 'react';
import { CtaBand, PageHead } from '../components/ui';
import { resolveApiUrl } from '../lib/api';

import gallery01 from '../assets/gallery/gallery-01.jpeg';
import gallery02 from '../assets/gallery/gallery-02.jpeg';
import gallery03 from '../assets/gallery/gallery-03.jpeg';
import gallery04 from '../assets/gallery/gallery-04.jpeg';
import gallery05 from '../assets/gallery/gallery-05.jpeg';
import gallery06 from '../assets/gallery/gallery-06.jpeg';
import gallery07 from '../assets/gallery/gallery-07.jpeg';

const LOCAL_GALLERY_IMAGES = [
  gallery01,
  gallery02,
  gallery03,
  gallery04,
  gallery05,
  gallery06,
  gallery07,
];

const LOCAL_GALLERY_BY_ID = {
  'g-1113': gallery01,
  '1790257567009-dtkvf': gallery02,
  '1790257343259-t7gj1': gallery03,
  '1790257447637-0piko': gallery04,
  '1790257475316-5src4': gallery05,
  '1790257511023-tr05i': gallery06,
  '1790257529703-8tbqz': gallery07,
};

const galleryAssetModules = import.meta.glob('../assets/gallary/*', { eager: true, import: 'default' });

function resolveGalleryImageUrl(item, idx = 0) {
  if (!item) return '';

  // 1. Resolve by exact record ID if available
  const itemId = typeof item === 'object' ? item.id : item;
  if (itemId && LOCAL_GALLERY_BY_ID[itemId]) {
    return LOCAL_GALLERY_BY_ID[itemId];
  }

  const image = typeof item === 'object' ? item.image : item;
  if (!image) return '';

  // 2. Valid external or data URLs
  if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:'))) {
    return image;
  }

  // 4. Local asset glob fallback
  const fileName = String(image).split('/').pop();
  const matchedKey = Object.keys(galleryAssetModules).find(k => k.endsWith(`/${fileName}`));
  if (matchedKey) {
    return galleryAssetModules[matchedKey];
  }

  return resolveApiUrl(image);
}

export default function GalleryPage({ go, content }) {
  const [filter, setFilter] = useState('All');
  const [failedImages, setFailedImages] = useState({});
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // 1. Filter active items and sort by display_order
  const rawItems = Array.isArray(content?.gallery) ? content.gallery : [];
  const activeItems = rawItems
    .filter(x => x.is_active !== false)
    .sort((a, b) => (Number(a.display_order) || 999) - (Number(b.display_order) || 999));

  // 2. Dynamic Categories (Only show categories that actually exist on active items)
  const existingCategories = Array.from(
    new Set(activeItems.map(x => x.category || x.type).filter(Boolean))
  );

  const categories = existingCategories.length > 0 ? ['All', ...existingCategories] : ['All'];

  // 3. Items filtered by selected category tab
  const filteredItems = activeItems.filter(
    x => filter === 'All' || x.category === filter || x.type === filter
  );

  // 4. Keyboard Navigation & Lock Body Scroll for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxIndex, filteredItems.length]);

  const activeLightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

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
        {categories.length > 1 && (
          <div className="tabs">
            {categories.map(cat => (
              <button
                key={cat}
                className={filter === cat ? 'selected' : ''}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* GALLERY GRID */}
        <div className="gallery-grid">
          {filteredItems.map((item, idx) => {
            const imageSrc = resolveGalleryImageUrl(item, idx);
            const isFailed = failedImages[item.id];

            return (
              <figure
                key={item.id || idx}
                className="gallery-card"
                onClick={() => setLightboxIndex(idx)}
                tabIndex={0}
                role="button"
                aria-label={`View ${item.title || 'gallery image'}`}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setLightboxIndex(idx);
                  }
                }}
              >
                {!isFailed && imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={item.title || 'Raja Electricals Gallery Photograph'}
                    loading="lazy"
                    decoding="async"
                    onError={() => setFailedImages(prev => ({ ...prev, [item.id]: true }))}
                  />
                ) : (
                  <div className="gallery-fallback">
                    <span>🖼️</span>
                    <span>Image unavailable</span>
                  </div>
                )}

                <figcaption className="gallery-card-caption">
                  <b>{item.title}</b>
                  {item.category && <small>{item.category}</small>}
                </figcaption>
              </figure>
            );
          })}

          {activeItems.length === 0 && (
            <p className="no-gallery-msg" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
              No gallery images have been added yet.
            </p>
          )}
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      {activeLightboxItem && (
        <div
          className="lightbox-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setLightboxIndex(null)}
        >
          <div className="lightbox-dialog" onClick={e => e.stopPropagation()}>
            <button
              className="lightbox-close"
              aria-label="Close image preview"
              onClick={() => setLightboxIndex(null)}
            >
              ×
            </button>

            {filteredItems.length > 1 && (
              <>
                <button
                  className="lightbox-nav prev"
                  aria-label="Previous image"
                  onClick={() => setLightboxIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1))}
                >
                  ‹
                </button>
                <button
                  className="lightbox-nav next"
                  aria-label="Next image"
                  onClick={() => setLightboxIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0))}
                >
                  ›
                </button>
              </>
            )}

            <div className="lightbox-content">
              <img
                src={resolveGalleryImageUrl(activeLightboxItem, lightboxIndex)}
                alt={activeLightboxItem.title || 'Gallery photograph preview'}
              />
            </div>

            <div className="lightbox-meta">
              {activeLightboxItem.category && (
                <span className="lightbox-badge">{activeLightboxItem.category}</span>
              )}
              <h3>{activeLightboxItem.title}</h3>
              {activeLightboxItem.description && <p>{activeLightboxItem.description}</p>}
              <small style={{ color: 'var(--muted)', marginTop: '4px' }}>
                Image {lightboxIndex + 1} of {filteredItems.length}
              </small>
            </div>
          </div>
        </div>
      )}

      <CtaBand go={go} />
    </>
  );
}
