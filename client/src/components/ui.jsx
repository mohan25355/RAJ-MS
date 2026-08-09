import { ArrowRight, ShieldCheck } from 'lucide-react';

export const Btn = ({ children, onClick, plain = false, type = 'button', disabled = false }) => <button type={type} disabled={disabled} onClick={onClick} className={`btn ${plain ? 'plain' : ''}`}>{children}</button>;
export function PageHead({ crumb, title, desc }) { return <div className="page-head"><div><small>Home / {crumb}</small><h1>{title}</h1>{desc && <p>{desc}</p>}</div></div>; }
export function Stats() { return <div className="stats">{[['25+', 'Years of Trust'], ['5000+', 'Products'], ['2000+', 'Happy Clients'], ['100+', 'Ongoing Projects']].map(([value, label]) => <div key={value}><ShieldCheck /><b>{value}</b><small>{label}</small></div>)}</div>; }
export function InfoSection({ title, children, centered = false }) { return <section className="intro-section" style={centered ? { alignItems: 'center' } : undefined}><div><small className="section-kicker">Why choose Raja</small><h2>{title}</h2></div><div>{children}</div></section>; }
export function CtaBand({ go }) { return <section className="cta-band"><div><small className="section-kicker">Let's build better</small><h2>Have a requirement?<br />We are ready to help.</h2><p>Speak with our product specialists for quotes, bulk orders and technical guidance.</p></div><Btn onClick={() => go('contactus')}>Request a quote <ArrowRight size={15} /></Btn></section>; }
