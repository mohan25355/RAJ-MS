import drFixitLogo from '../assets/brands/dr-fixit.png';
import fosrocLogo from '../assets/brands/fosroc.png';
import zycosilLogo from '../assets/brands/zycosil-plus.png';
import mynkLogo from '../assets/brands/mynk.png';
import ramcoLogo from '../assets/brands/ramco-supergrade.png';
import rkInnovationsLogo from '../assets/brands/rk-innovations.jpg';
import veloraLogo from '../assets/brands/velora.jpg';

export const CONSTRUCTION_BRAND_LOGOS = {
  'dr. fixit': drFixitLogo,
  'dr fixit': drFixitLogo,
  'b-drfixit-cc': drFixitLogo,
  'fosroc': fosrocLogo,
  'b-fosroc': fosrocLogo,
  'zycosil+': zycosilLogo,
  'zycocil+': zycosilLogo,
  'zycosil': zycosilLogo,
  'b-zycosil-cc': zycosilLogo,
  'mynk': mynkLogo,
  'b-mynk': mynkLogo,
  'ramco supergrade': ramcoLogo,
  'ramco': ramcoLogo,
  'b-ramco': ramcoLogo,
  'rk innovations': rkInnovationsLogo,
  'rk-innovations': rkInnovationsLogo,
  '1790259867309-9xf5a': rkInnovationsLogo,
  'b-rk-innovations': rkInnovationsLogo,
  'velora': veloraLogo,
  '1790259662780-dxurm': veloraLogo,
  'b-velora': veloraLogo,
};

export function getConstructionBrandLogo(nameOrId) {
  if (!nameOrId) return null;
  const key = String(nameOrId).trim().toLowerCase();
  return CONSTRUCTION_BRAND_LOGOS[key] || null;
}

