import safetyHelmetImage from '../assets/product image/Head Protection/Safety Helmet Std. Series.jpg';
import paintsCategoryImage from '../assets/paints-category.png';

export const images = {
  worker: 'https://images.openai.com/static-rsc-4/b7Jn2hdiJYiHiqVFxeJXXEtp2E48TpV_ZssZHxV7kMmrnJvG9AwJvIMBgVDq4qHDIdkviORzg-1_wFmyfOKcApTtKpuFwBMkkKQtE3FGvJIReYawsV5yKu0V12toTmcDgPp88dA4evKK45U3uBONzQh_P1XGVJGlu7c0qVl-GytXfUhiBjUtKidZWfQWbcKK?purpose=fullsize',
  helmet: safetyHelmetImage,
  tools: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=700&q=85',
  // The previous Unsplash asset is no longer available. Keep a dependable
  // industrial-supply image here so the Water Pump card never renders broken.
  pump: 'https://images.openai.com/static-rsc-4/r1i_7ROnzsBSpBE0e-aCkqqfc9QRvxTcQDWI9kwavPsQTRQr06E3kvZjz7thRWFvcQ9l2uMPAmoWNmSBuExOyfCKobIqNICkdVv2pnOthnN52hxUkl-7R9wlnpORJ717l_GS_iZTPxDK-D_Rhx2ycrXogkRWJBp3AA3aIH-Zb2w?purpose=inline',
  plant: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1000&q=85',
  construction: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=85',
  manufacturing: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1000&q=85',
  facilities: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=85',
  infrastructure: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1000&q=85',
  site: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=85',
  safety: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=1000&q=85',
  pipes: 'https://images.openai.com/static-rsc-4/sM0VS4b69O-PgcAA_7P6NRT9sLUa-ZcXIdVFzi97G2ry3g2kHthhLf3qiwWkfdfSN6QaOQQ6QAjB5NliwxmgjYu4gSyWGusF9W5r2nYBUm7xyYwe2sFS4hH4wBdSOl2fCkJtSgRvkZScyee0fWVGHq8VoD5-AxcsoJ0kDY8XZJ8?purpose=inline',
  paints: paintsCategoryImage,
};

export const categories = [
  ['Electricals', images.hero, '250+ Products'], ['Industrial Safety', images.safety, '300+ Products'],
  ['Hardware & Tools', images.tools, '600+ Products'], ['Water Pumps', images.pump, '100+ Products'],
  ['Plumbing', images.pipes, '200+ Products'], ['Paints', images.paints, '150+ Products'],
  ['Wires & Cables', images.hero, '150+ Products'],
];

export const projects = [['Chennai Metro Rail', images.plant], ['Reliance Industries', images.worker], ['L&T Construction', images.site], ['HPCL Refinery', images.plant]];
