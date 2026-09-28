async function testExpressEndpoints() {
  console.log('Testing Express server HTTP endpoints on http://localhost:10000...');

  try {
    const resContent = await fetch('http://localhost:10000/api/content');
    console.log('GET /api/content status:', resContent.status, resContent.statusText);
    if (resContent.ok) {
      const data = await resContent.json();
      console.log(' /api/content Payload Summary:');
      console.log(`  - categories: ${data.categories ? data.categories.length : 0}`);
      console.log(`  - brands: ${data.brands ? data.brands.length : 0}`);
      console.log(`  - products: ${data.products ? data.products.length : 0}`);
      console.log(`  - gallery: ${data.gallery ? data.gallery.length : 0}`);
      console.log(`  - siteSettings: ${!!data.siteSettings}`);
    }

    const resAds = await fetch('http://localhost:10000/api/home-ads/active');
    console.log('\nGET /api/home-ads/active status:', resAds.status, resAds.statusText);
    if (resAds.ok) {
      const ads = await resAds.json();
      console.log(' /api/home-ads/active Payload Summary:');
      console.log(`  - ads count: ${ads ? ads.length : 0}`);
    }
  } catch (err) {
    console.error('Express HTTP request error:', err.message);
  }
}

testExpressEndpoints().catch(console.error);
