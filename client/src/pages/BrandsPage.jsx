import { useState } from 'react';
import { PageHead } from '../components/ui';

// ============================================
// PARTNER / BRAND IMAGES
// ============================================

import brand1 from '../assets/PARTNERS/PARTNERS/1.png';
import brand2 from '../assets/PARTNERS/PARTNERS/2.jpg';
import brand3 from '../assets/PARTNERS/PARTNERS/3.jpg';
import brand4 from '../assets/PARTNERS/PARTNERS/4.jpg';
import brand5 from '../assets/PARTNERS/PARTNERS/5.png';
import brand6 from '../assets/PARTNERS/PARTNERS/6.jpg';
import brand7 from '../assets/PARTNERS/PARTNERS/7.png';
import brand8 from '../assets/PARTNERS/PARTNERS/8.jpg';
import brand9 from '../assets/PARTNERS/PARTNERS/9.png';
import brand10 from '../assets/PARTNERS/PARTNERS/10.jpg';
import brand11 from '../assets/PARTNERS/PARTNERS/11.png';
import brand12 from '../assets/PARTNERS/PARTNERS/12.jpg';
import brand13 from '../assets/PARTNERS/PARTNERS/13.png';
import brand14 from '../assets/PARTNERS/PARTNERS/14.jpg';
import brand15 from '../assets/PARTNERS/PARTNERS/15.png';
import brand16 from '../assets/PARTNERS/PARTNERS/16.jpg';
import brand17 from '../assets/PARTNERS/PARTNERS/17.png';
import brand18 from '../assets/PARTNERS/PARTNERS/18.png';
import brand19 from '../assets/PARTNERS/PARTNERS/19.png';
import brand20 from '../assets/PARTNERS/PARTNERS/20.png';
import brand21 from '../assets/PARTNERS/PARTNERS/21.png';
import brand22 from '../assets/PARTNERS/PARTNERS/22.png';
import brand23 from '../assets/PARTNERS/PARTNERS/23.png';
import brand24 from '../assets/PARTNERS/PARTNERS/24.jpg';
import brand25 from '../assets/PARTNERS/PARTNERS/25.png';
import brand26 from '../assets/PARTNERS/PARTNERS/26.png';

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

const brandsData = [
  { id: 'brand-1', name: 'Brand 1', logo: brand1 },
  { id: 'brand-2', name: 'Brand 2', logo: brand2 },
  { id: 'brand-3', name: 'Brand 3', logo: brand3 },
  { id: 'brand-4', name: 'Brand 4', logo: brand4 },
  { id: 'brand-5', name: 'Brand 5', logo: brand5 },
  { id: 'brand-6', name: 'Brand 6', logo: brand6 },
  { id: 'brand-7', name: 'Brand 7', logo: brand7 },
  { id: 'brand-8', name: 'Brand 8', logo: brand8 },
  { id: 'brand-9', name: 'Brand 9', logo: brand9 },
  { id: 'brand-10', name: 'Brand 10', logo: brand10 },
  { id: 'brand-11', name: 'Brand 11', logo: brand11 },
  { id: 'brand-12', name: 'Brand 12', logo: brand12 },
  { id: 'brand-13', name: 'Brand 13', logo: brand13 },
  { id: 'brand-14', name: 'Brand 14', logo: brand14 },
  { id: 'brand-15', name: 'Brand 15', logo: brand15 },
  { id: 'brand-16', name: 'Brand 16', logo: brand16 },
  { id: 'brand-17', name: 'Brand 17', logo: brand17 },
  { id: 'brand-18', name: 'Brand 18', logo: brand18 },
  { id: 'brand-19', name: 'Brand 19', logo: brand19 },
  { id: 'brand-20', name: 'Brand 20', logo: brand20 },
  { id: 'brand-21', name: 'Brand 21', logo: brand21 },
  { id: 'brand-22', name: 'Brand 22', logo: brand22 },
  { id: 'brand-23', name: 'Brand 23', logo: brand23 },
  { id: 'brand-24', name: 'Brand 24', logo: brand24 },
  { id: 'brand-25', name: 'Brand 25', logo: brand25 },
  { id: 'brand-26', name: 'Brand 26', logo: brand26 }
];

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

export default function BrandsPage({ content }) {
  const [term, setTerm] = useState('');

  const filteredBrands = brandsData.filter(item =>
    item.name.toLowerCase().includes(term.toLowerCase())
  );

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
        {/* ============================================
            PARTNERS MARQUEE
        ============================================ */}
        <div className="marquee-container">
          <h2 className="marquee-title" style={{ color: '#e31b16' }}>Our Brands</h2>
          <div className="brand-marquee">
            <div className="brand-marquee-track">
              {[...filteredBrands, ...filteredBrands].map(
                (item, index) => (
                  <div
                    className="brand-logo-item"
                    key={`${item.id}-${index}`}
                    aria-hidden={
                      index >= filteredBrands.length
                        ? true
                        : undefined
                    }
                  >
                    <img
                      src={item.logo}
                      alt={item.name}
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* ============================================
            DEALERS MARQUEE
        ============================================ */}
        <div className="marquee-container">
          <h2 className="marquee-title" style={{ color: '#e31b16' }}> style Our Partners</h2>
          <div className="brand-marquee dealer-marquee">
            <div className="brand-marquee-track dealer-track">
              {[...dealersData, ...dealersData].map(
                (item, index) => (
                  <div
                    className="brand-logo-item"
                    key={`${item.id}-${index}`}
                    aria-hidden={
                      index >= dealersData.length
                        ? true
                        : undefined
                    }
                  >
                    <img
                      src={item.logo}
                      alt={item.name}
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          MARQUEE CSS
      ============================================ */}
      <style>{`
        .brands-section {
          padding: 40px 0;
        }

        .marquee-container {
          margin-bottom: 60px;
        }

        .marquee-title {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 20px;
          text-align: center;
          color: #1a1a1a;
        }

        .brand-marquee {
          width: 100%;
          overflow: hidden;
          position: relative;
          margin-top: 20px;
          padding: 15px 0;
          background: #f8f8f8;
          border-radius: 12px;
        }

        .brand-marquee-track {
          display: flex;
          align-items: center;
          width: max-content;
          gap: 70px;

          animation:
            brand-scroll
            35s
            linear
            infinite;

          will-change: transform;
        }

        /* Dealer marquee scrolls in opposite direction */
        .dealer-track {
          animation:
            brand-scroll-reverse
            30s
            linear
            infinite;
        }

        .brand-logo-item {
          flex: 0 0 auto;

          width: 160px;
          height: 90px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: transparent;
        }

        .brand-logo-item img {
          width: 145px;
          height: 75px;

          max-width: 100%;

          object-fit: contain;

          display: block;

          filter: grayscale(8%);

          opacity: 0.92;

          transition:
            opacity 0.25s ease,
            transform 0.25s ease,
            filter 0.25s ease;
        }

        .brand-logo-item img:hover {
          opacity: 1;

          filter: grayscale(0%);

          transform: scale(1.08);
        }


        /* ============================================
           CONTINUOUS LEFT SCROLL
        ============================================ */
        @keyframes brand-scroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        /* ============================================
           CONTINUOUS RIGHT SCROLL (FOR DEALERS)
        ============================================ */
        @keyframes brand-scroll-reverse {
          from {
            transform: translateX(-50%);
          }

          to {
            transform: translateX(0);
          }
        }


        /* ============================================
           MOBILE
        ============================================ */
        @media (max-width: 700px) {
          .marquee-container {
            margin-bottom: 40px;
          }

          .marquee-title {
            font-size: 22px;
            margin-bottom: 15px;
          }

          .brand-marquee {
            margin-top: 15px;
            padding: 10px 0;
          }

          .brand-marquee-track {
            gap: 35px;

            animation-duration: 25s;
          }

          .dealer-track {
            animation-duration: 22s;
          }

          .brand-logo-item {
            width: 110px;
            height: 65px;
          }

          .brand-logo-item img {
            width: 100px;
            height: 55px;
          }
        }


        /* ============================================
           SMALL MOBILE
        ============================================ */
        @media (max-width: 420px) {
          .brand-marquee-track {
            gap: 25px;

            animation-duration: 22s;
          }

          .dealer-track {
            animation-duration: 20s;
          }

          .brand-logo-item {
            width: 95px;
            height: 60px;
          }

          .brand-logo-item img {
            width: 88px;
            height: 50px;
          }
        }
      `}</style>
    </>
  );
}
