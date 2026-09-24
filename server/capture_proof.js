const { chromium } = require('../client/node_modules/playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173/#products');
  await page.waitForTimeout(1500);

  await page.screenshot({ path: 'C:/Users/HP/.gemini/antigravity-ide/brain/bffb577f-bd9b-4f58-a0c2-d3356ca8aebc/products_full_sidebar.png' });

  // Click Electricals
  await page.click('button:has-text("Electricals")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:/Users/HP/.gemini/antigravity-ide/brain/bffb577f-bd9b-4f58-a0c2-d3356ca8aebc/electricals_empty_state.png' });

  // Click Sanitaryware
  await page.click('button:has-text("Sanitaryware")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:/Users/HP/.gemini/antigravity-ide/brain/bffb577f-bd9b-4f58-a0c2-d3356ca8aebc/sanitaryware_empty_state.png' });

  await browser.close();
  console.log('Successfully captured all screenshots!');
})();
