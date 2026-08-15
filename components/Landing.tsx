 "use client";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, Sparkles, BarChart3, Receipt, Users, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Landing() {
  const [open, setOpen] = useState(false);
  return (
    <main className="landing">
      <nav className="landing-nav">
        <Link href="/" className="brand"><span className="brand-mark">M</span><span>Money <b>Clarity</b></span></Link>
        <div className="desktop-links">
          <a href="#how">How it works</a><a href="#features">Features</a><a href="#trust">Trust</a>
          <Link href="/login" className="nav-login">Sign in</Link>
          <Link href="/dashboard" className="button primary small">Start tracking free <ArrowRight size={16}/></Link>
        </div>
        <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Menu">{open?<X/>:<Menu/>}</button>
      </nav>
      {open && <div className="mobile-links"><a href="#how">How it works</a><a href="#features">Features</a><Link href="/login">Sign in</Link><Link href="/dashboard" className="button primary">Start tracking free</Link></div>}
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15}/> Simple money clarity for small businesses</div>
          <h1>Finally understand where your <em>business money</em> is going.</h1>
          <p>Track income and expenses, organize transactions, and get useful insights — without learning accounting software.</p>
          <div className="hero-actions"><Link href="/dashboard" className="button primary">Start tracking for free <ArrowRight size={17}/></Link><a href="#how" className="button secondary">See how it works</a></div>
          <div className="micro-proof"><ShieldCheck size={17}/> Built around traceable numbers and reversible workflows.</div>
        </div>
        <DashboardPreview/>
      </section>
      <section id="how" className="section centered">
        <div className="eyebrow">THE SIMPLE WORKFLOW</div><h2>Capture. Structure. Understand. Act.</h2>
        <p className="section-lead">Money Clarity turns a pile of transactions into a handful of numbers you can act on.</p>
        <div className="steps"><Step n="01" icon={<Receipt/>} title="Capture" text="Add a transaction in seconds or safely import a CSV."/><Step n="02" icon={<BarChart3/>} title="Understand" text="See revenue, expenses, net and what changed this month."/><Step n="03" icon={<Users/>} title="Act" text="Know which customers, suppliers and categories need attention."/></div>
      </section>
      <section id="features" className="section feature-band">
        <div><div className="eyebrow">BUILT FOR THE REAL WORLD</div><h2>All the clarity. None of the accounting jargon.</h2><p className="section-lead">Made for freelancers, tradies, consultants, creators and micro-SMEs who want a reliable glance at their money.</p></div>
        <div className="feature-list"><Feature title="Fast transaction entry" text="A compact, focused flow with recent values remembered."/><Feature title="Action Needed" text="Uncategorized items, missing receipts and meaningful alerts in one place."/><Feature title="Plain-English insights" text="Know what changed without having to interpret a chart."/><Feature title="Safe CSV import" text="Preview, validate, skip duplicates and keep imports reversible."/><Feature title="Customers & suppliers" text="See who drives revenue and where spending is concentrated."/><Feature title="Tax-ready exports" text="Filter deductible spending and export your data when needed."/></div>
      </section>
      <section id="trust" className="section trust-section"><div className="trust-card"><ShieldCheck size={30}/><div><h3>Trust is a product feature.</h3><p>Every total should trace back to its transactions. Money Clarity is designed around transparent calculations, safe imports and business-scoped data.</p></div></div></section>
      <footer><div className="brand"><span className="brand-mark">M</span><span>Money <b>Clarity</b></span></div><span>© 2026 Money Clarity</span><span>Clarity over complexity.</span></footer>
    </main>
  );
}
function Step({n,icon,title,text}:{n:string,icon:React.ReactNode,title:string,text:string}){return <div className="step"><span>{n}</span><div className="step-icon">{icon}</div><h3>{title}</h3><p>{text}</p></div>}
function Feature({title,text}:{title:string,text:string}){return <div className="feature"><Check size={18}/><div><b>{title}</b><p>{text}</p></div></div>}
function DashboardPreview(){
 return <div className="preview-wrap"><div className="preview-window"><div className="preview-top"><span>Money <b>Clarity</b></span><small>Dashboard</small></div><div className="preview-content"><div className="preview-kpis">{[['REVENUE','$12,400'],['EXPENSES','$7,800'],['NET','$4,600']].map(([a,b])=><div key={a}><small>{a}</small><strong>{b}</strong></div>)}</div><div className="preview-grid"><div className="mini-chart"><div className="chart-head"><b>Money movement</b><small>This month</small></div><div className="bars">{[42,64,48,76,60,88,71,94,78].map((h,i)=><i style={{height:`${h}%`}} key={i}/>)}</div></div><div className="mini-action"><b>Action Needed</b><p><span>18</span> transactions uncategorized</p><p><span>18%</span> fuel spending increased</p><p><span>3</span> receipts missing</p></div></div></div></div></div>
}
