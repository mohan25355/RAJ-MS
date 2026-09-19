const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);

// 100% Verified visually inspected logo map
const verifiedLogoMap = {
  'Birla Opus': '1.png',           // Verified Birla Opus logo
  'Nippon Paint': '26.png',        // Verified Nippon Paint logo
  'Kansai Nerolac': '10.jpg',      // Verified Kansai Nerolac logo
  'Vapour Paints': 'd17.jpg',      // Verified MRF Vapocure Paints logo (d17.jpg)
  'Finolex Cables': '3.jpg',       // Verified Finolex Cables logo
  'RR Kabel': '24.jpg',            // Verified RR Kabel logo
  'Orbit': 'd10.png',              // Verified Orbit logo (d10.png)
  'Luker': '21.png',               // Verified Luker logo
  'Astral Pipes': '4.jpg',         // Verified Astral Pipes logo
  'Finolex Pipes': '9.png',        // Verified Finolex Pipes logo
  'Ashirvad': '15.png',            // Verified Ashirvad logo
  'Legrand': '5.png',              // Verified Legrand logo
  'Norwood': '7.png',              // Verified Norwood logo
  'Norisys': '23.png',             // Verified Norisys logo
  'GM': 'd7.png',                  // Verified GM Modular logo (d7.png)
  'Anchor by Panasonic': '25.png', // Verified Anchor by Panasonic logo
  'Roma': 'd15.jpg',               // Verified Roma Switches logo (d15.jpg)
  'Crompton': '22.png',            // Verified Crompton logo
  'Atomberg': '16.jpg',            // Verified Atomberg logo
  'Almonard': 'd1.jpg',            // Verified Almonard Fans logo (d1.jpg)
  'Orient Electric': '8.jpg',      // Verified Orient Electric logo
  'Polar': 'd9.jpg',               // Verified Polar Fans logo (d9.jpg)
  'Polstar': 'd11.jpg',            // Verified Polstar Fans logo (d11.jpg)
  'Bajaj': 'd4.png',               // Verified Bajaj logo (d4.png)
  'Philips': '14.jpg',             // Verified Philips logo
  'Jaquar Lighting': '20.png',     // Verified Jaquar Lighting logo
  'Jaquar': '20.png',              // Verified Jaquar logo
  'Essco by Jaquar': '6.jpg',      // Verified Essco by Jaquar logo
  'Parryware': '13.png',           // Verified Parryware logo
  'Geberit': '17.png',             // Verified Geberit logo
  'A. O. Smith': 'd2.png',         // Verified A. O. Smith logo (d2.png)
  'C.R.I. Pumps': '19.png',        // Verified C.R.I. Pumps logo
  'Hasten': null,                  // Text badge (no unverified fake logo)
  'Dr. Fixit': 'd16.jpg',          // Verified Dr. Fixit logo (d16.jpg)
  'Zycocil+': '12.jpg',            // Verified Zycosil+ logo
  'Europa': '2.jpg'                // Verified Europa logo
};

async function syncLogos() {
  console.log('=== SYNCING VERIFIED ACCURATE BRAND LOGOS IN SUPABASE ===');
  const { data: brands, error } = await supabase.from('brands').select('*');
  if (error) {
    console.error('Fetch error:', error);
    return;
  }

  let count = 0;
  for (const b of (brands || [])) {
    const brandName = b.name.trim();
    if (verifiedLogoMap.hasOwnProperty(brandName)) {
      const correctLogo = verifiedLogoMap[brandName];
      const updatedData = {
        ...b.data,
        logo: correctLogo
      };
      await supabase.from('brands').update({
        logo: correctLogo,
        data: updatedData
      }).eq('id', b.id);
      count++;
      console.log(`Synced "${brandName}" (${b.data?.category || b.category}) -> logo: ${correctLogo || 'NULL (Text Badge)'}`);
    }
  }

  console.log(`\nLogo sync complete! Updated ${count} brand placement rows.`);
}

syncLogos().catch(console.error);
