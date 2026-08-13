export const images = {
  worker: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=85',
  helmet: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&w=900&q=85',
  tools: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=700&q=85',
  // The previous Unsplash asset is no longer available. Keep a dependable
  // industrial-supply image here so the Water Pump card never renders broken.
  pump: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=700&q=85',
  plant: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1000&q=85',
  site: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=85',
  safety: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=700&q=85',
  pipes: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=700&q=85',
};

export const categories = [
  ['Electricals', images.hero, '250+ Products'], ['Industrial Safety', images.safety, '300+ Products'],
  ['Hardware & Tools', images.tools, '600+ Products'], ['Water Pumps', images.pump, '100+ Products'],
  ['Plumbing', images.pipes, '200+ Products'], ['Paints', images.site, '150+ Products'],
  ['Wires & Cables', images.hero, '150+ Products'], ['Road Safety', images.safety, '100+ Products'],
];

export const projects = [['Chennai Metro Rail', images.plant], ['Reliance Industries', images.worker], ['L&T Construction', images.site], ['HPCL Refinery', images.plant]];
