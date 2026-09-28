const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, '../final_images_report.json');
if (fs.existsSync(reportPath)) {
  const content = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  console.log(`Total records in final_images_report.json: ${content.length}`);
  const sanitarywareInReport = content.filter(item => item.category && item.category.toLowerCase().includes('sanitary'));
  console.log(`Sanitaryware items in final_images_report.json: ${sanitarywareInReport.length}`);
  sanitarywareInReport.forEach(item => {
    console.log(`- ${item.product} | ${item.dimensions} | ${item.size} | URL: ${item.url}`);
  });
} else {
  console.log('final_images_report.json not found');
}
