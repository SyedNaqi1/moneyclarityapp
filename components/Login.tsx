 "use client";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
export default function Login(){
 return <main className="auth-page"><div className="auth-card"><Link href="/" className="brand"><span className="brand-mark">M</span><span>Money <b>Clarity</b></span></Link><div className="auth-icon"><LockKeyhole size={22}/></div><h1>Welcome back</h1><p>Sign in to your business money cockpit.</p><form onSubmit={(e)=>{e.preventDefault(); window.location.href="/dashboard"}}><label>Email<input type="email" required placeholder="you@business.com"/></label><label>Password<input type="password" required placeholder="••••••••"/></label><button className="button primary full">Sign in</button></form><div className="auth-divider"><span>or</span></div><Link href="/dashboard" className="demo-link">Continue with demo data</Link><Link href="/" className="back"><ArrowLeft size={15}/> Back to home</Link></div></main>
}
