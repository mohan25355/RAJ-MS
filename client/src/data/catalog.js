import safetyHelmetImage from '../assets/product image/Head Protection/Safety Helmet Std. Series.jpg';

export const images = {
  worker: 'https://images.openai.com/static-rsc-4/b7Jn2hdiJYiHiqVFxeJXXEtp2E48TpV_ZssZHxV7kMmrnJvG9AwJvIMBgVDq4qHDIdkviORzg-1_wFmyfOKcApTtKpuFwBMkkKQtE3FGvJIReYawsV5yKu0V12toTmcDgPp88dA4evKK45U3uBONzQh_P1XGVJGlu7c0qVl-GytXfUhiBjUtKidZWfQWbcKK?purpose=fullsize',
  helmet: safetyHelmetImage,
  tools: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=700&q=85',
  // The previous Unsplash asset is no longer available. Keep a dependable
  // industrial-supply image here so the Water Pump card never renders broken.
  pump: 'https://images.openai.com/static-rsc-4/r1i_7ROnzsBSpBE0e-aCkqqfc9QRvxTcQDWI9kwavPsQTRQr06E3kvZjz7thRWFvcQ9l2uMPAmoWNmSBuExOyfCKobIqNICkdVv2pnOthnN52hxUkl-7R9wlnpORJ717l_GS_iZTPxDK-D_Rhx2ycrXogkRWJBp3AA3aIH-Zb2w?purpose=inline',
  plant: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1000&q=85',
  site: 'https://images.openai.com/static-rsc-4/sDTcQvzqu_8_EIfWTtgx-d7mesR2gkciyjPcxi6KRmV2TBnfyRulLt3S7uP59KupoBqtCFK4Um3qzuj_spWYBIvmzsqQLiMXN4g_0Md7e6RTExX31J8ZaRoBMHSN8lnrl7u8081B7vyvPhVHjAYnbX5GxHonTVPUrx6jV4XLMy91wA-D9LVKBxzSehlrBTf1?purpose=inline',
  safety: 'https://images.openai.com/static-rsc-4/Ir_suSW7ksEe-dMVCJO2SqGO_gvV_6hcvoTrOMIRk_uQoQSosozkGpUl7E3QE2KDLhF-KUy99v26Fv1RivKixFWqQMxxJTc4GqE1aISEMJinJ65qikIfLdnO2qmC30-zZEpx3o767HR20EaYbKOwuMNoz90ff1-G-0g8vz97y8M?purpose=inline',
  pipes: 'https://images.openai.com/static-rsc-4/sM0VS4b69O-PgcAA_7P6NRT9sLUa-ZcXIdVFzi97G2ry3g2kHthhLf3qiwWkfdfSN6QaOQQ6QAjB5NliwxmgjYu4gSyWGusF9W5r2nYBUm7xyYwe2sFS4hH4wBdSOl2fCkJtSgRvkZScyee0fWVGHq8VoD5-AxcsoJ0kDY8XZJ8?purpose=inline',
};

export const categories = [
  ['Electricals', images.hero, '250+ Products'], ['Industrial Safety', images.safety, '300+ Products'],
  ['Hardware & Tools', images.tools, '600+ Products'], ['Water Pumps', images.pump, '100+ Products'],
  ['Plumbing', images.pipes, '200+ Products'], ['Paints', images.site, '150+ Products'],
  ['Wires & Cables', images.hero, '150+ Products'],
];

export const projects = [['Chennai Metro Rail', images.plant], ['Reliance Industries', images.worker], ['L&T Construction', images.site], ['HPCL Refinery', images.plant]];
