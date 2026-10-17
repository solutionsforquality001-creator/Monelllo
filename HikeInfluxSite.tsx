"use client";
import { useState, useEffect } from "react";

const PLANS = [
  {
    id: "starter",
    name: "STARTER",
    subtitle: "Capital Builder",
    min: 100,
    max: 1000,
    roi: "20% — 30%",
    roiMid: 25,
    duration: "3 Days",
    days: 3,
    color: "#E8F5E9",
    accent: "#2E7D32",
    border: "#A5D6A7",
    features: ["Daily accrual", "Instant withdrawal", "Crypto + Fiat deposit", "24/7 Support"],
    popular: false,
  },
  {
    id: "gold",
    name: "GOLD",
    subtitle: "Wealth Accelerator",
    min: 1100,
    max: 10000,
    roi: "40% — 70%",
    roiMid: 55,
    duration: "7 Days",
    days: 7,
    color: "#FFF8E1",
    accent: "#C9A86A",
    border: "#FFE082",
    features: ["Compound option", "Priority withdrawals", "Dedicated manager", "Affiliate 8% bonus"],
    popular: true,
  },
  {
    id: "realestate",
    name: "REAL ESTATE",
    subtitle: "Legacy Portfolio",
    min: 10000,
    max: 50000,
    roi: "70% Fixed",
    roiMid: 70,
    duration: "14 Days",
    days: 14,
    color: "#E0F2F1",
    accent: "#0A4A3A",
    border: "#80CBC4",
    features: ["Swiss REIT exposure", "Bi-weekly dividends", "Capital protection", "VIP concierge"],
    popular: false,
  },
];

export default function MonelloWorldSite() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [calcPlan, setCalcPlan] = useState(PLANS[1]);
  const [calcAmount, setCalcAmount] = useState(2500);
  const [showAuth, setShowAuth] = useState<"login" | "register" | null>(null);
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [dashboard, setDashboard] = useState(false);
  const [investAmount, setInvestAmount] = useState<number>(500);
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0]);
  const [toast, setToast] = useState<string | null>(null);
  const [investments, setInvestments] = useState<any[]>([]);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [livePrice, setLivePrice] = useState({ btc: 67432, gold: 2341, eth: 3812 });

  useEffect(() => {
    const u = localStorage.getItem("monello_user");
    if (u) setUser(JSON.parse(u));
    const inv = localStorage.getItem("monello_investments");
    if (inv) setInvestments(JSON.parse(inv));
    const interval = setInterval(() => {
      setLivePrice(p => ({
        btc: p.btc + (Math.random() - 0.5) * 100,
        gold: p.gold + (Math.random() - 0.5) * 2,
        eth: p.eth + (Math.random() - 0.5) * 20,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAuth = async (type: "login" | "register") => {
    if (!authForm.email || !authForm.password) return notify("Please fill all fields");
    // simple local auth + try DB
    try {
      if (type === "register") {
        await fetch("/api/auth", { method: "POST", body: JSON.stringify({ ...authForm, action: "register" }), headers: { "Content-Type": "application/json" } });
      } else {
        await fetch("/api/auth", { method: "POST", body: JSON.stringify({ ...authForm, action: "login" }), headers: { "Content-Type": "application/json" } });
      }
    } catch {}
    const u = { name: authForm.name || authForm.email.split("@")[0], email: authForm.email };
    localStorage.setItem("monello_user", JSON.stringify(u));
    setUser(u);
    setShowAuth(null);
    notify(type === "register" ? "Account created — Welcome to Monello World" : "Welcome back");
  };

  const handleInvest = () => {
    if (!user) { setShowAuth("login"); return notify("Please login to invest"); }
    if (investAmount < selectedPlan.min || investAmount > selectedPlan.max) return notify(`Amount must be $${selectedPlan.min} – $${selectedPlan.max}`);
    const item = {
      id: Date.now(),
      plan: selectedPlan.name,
      amount: investAmount,
      roi: selectedPlan.roiMid,
      days: selectedPlan.days,
      expected: Math.round(investAmount * (1 + selectedPlan.roiMid / 100)),
      date: new Date().toLocaleDateString(),
      status: "Active",
    };
    const next = [item, ...investments];
    setInvestments(next);
    localStorage.setItem("monello_investments", JSON.stringify(next));
    // also hit API
    fetch("/api/invest", { method: "POST", body: JSON.stringify({ plan: selectedPlan.id, amount: investAmount }), headers: { "Content-Type": "application/json" } }).catch(()=>{});
    notify(`$${investAmount.toLocaleString()} invested in ${selectedPlan.name} — ${selectedPlan.roi} in ${selectedPlan.duration}`);
  };

  const calcReturn = Math.round(calcAmount * (1 + calcPlan.roiMid / 100));
  const calcProfit = calcReturn - calcAmount;

  return (
    <div className="min-h-screen bg-[#F8F5F0] overflow-x-hidden">
      {/* Top Ticker */}
      <div className="bg-[#0A1628] text-white text-xs border-b border-white/10">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-8 flex flex-wrap items-center justify-between gap-2 py-2">
          <div className="flex items-center gap-4">
            <span className="bg-[#C9A86A] text-[#0A1628] px-2 py-0.5 rounded-full font-bold text-[10px] tracking-widest">CERTIFIED & REGULATED</span>
            <span className="hidden md:inline text-white/60">FINMA • BaFin • CSSF Registered since 2013</span>
            <span className="hidden lg:inline-flex items-center gap-2 text-emerald-400"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> MARKETS OPEN</span>
          </div>
          <div className="flex items-center gap-4 mono text-[11px]">
            <span>BTC <b className="text-[#C9A86A]">${livePrice.btc.toFixed(0)}</b> <span className="text-emerald-400">+1.24%</span></span>
            <span className="hidden sm:inline">GOLD <b className="text-[#C9A86A]">${livePrice.gold.toFixed(1)}</b> <span className="text-emerald-400">+0.42%</span></span>
            <span className="hidden sm:inline">ETH <b>${livePrice.eth.toFixed(0)}</b></span>
            <span className="hidden md:inline text-white/50">11,243,891 Members • 12,200+ Partners</span>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-[#F8F5F0]/90 backdrop-blur-xl border-b border-[#0A1628]/10">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-8 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0A1628] flex items-center justify-center">
                <span className="serif text-[#C9A86A] text-xl leading-none">M</span>
              </div>
              <div>
                <div className="font-bold tracking-[0.12em] text-[14px] leading-none">MONELLO WORLD</div>
                <div className="text-[10px] tracking-[0.18em] text-[#0A1628]/60 font-medium">GLOBAL PARTNERS AG</div>
              </div>
              <span className="hidden lg:inline ml-2 px-2 py-1 rounded-full bg-[#0A1628] text-white text-[10px] tracking-widest">EST. 2013 • ZUG, CH</span>
            </div>
            <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#0A1628]/70">
              <a href="#about" className="hover:text-[#0A1628]">About</a>
              <a href="#sectors" className="hover:text-[#0A1628]">Sectors</a>
              <a href="#plans" className="hover:text-[#0A1628]">Plans</a>
              <a href="#performance" className="hover:text-[#0A1628]">Performance</a>
              <a href="#faq" className="hover:text-[#0A1628]">FAQ</a>
              <a href="/dashboard" className="bg-[#0A1628] text-white px-3 py-1.5 rounded-full text-xs">Dashboard ↗</a>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/dashboard" className="hidden md:inline text-sm font-medium px-4 py-2 rounded-full border border-[#0A1628]/15 hover:bg-white">
              {user ? `Hi, ${user.name} • Dashboard` : "Dashboard"}
            </a>
            <button onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })} className="bg-[#C9A86A] hover:bg-[#b8924d] text-[#0A1628] font-semibold text-sm px-5 py-2.5 rounded-full transition">Start Investing →</button>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden w-9 h-9 rounded-full border flex items-center justify-center">≡</button>
          </div>
        </div>
        {mobileMenu && (
          <div className="lg:hidden border-t bg-white px-4 py-4 flex flex-col gap-3 text-sm">
            <a href="#about" onClick={()=>setMobileMenu(false)}>About</a>
            <a href="#sectors" onClick={()=>setMobileMenu(false)}>Sectors</a>
            <a href="#plans" onClick={()=>setMobileMenu(false)}>Plans</a>
            <a href="#faq" onClick={()=>setMobileMenu(false)}>FAQ</a>
            <button onClick={()=>{setMobileMenu(false); setShowAuth("login")}} className="text-left">Client Login</button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative mx-auto max-w-[1440px] px-4 lg:px-8 pt-6 lg:pt-8">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
          {/* Left Hero */}
          <div className="bg-[#0A1628] rounded-[32px] p-6 lg:p-10 text-white relative overflow-hidden min-h-[560px] flex flex-col">
            {/* background glow */}
            <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-[#C9A86A]/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A86A]/30 to-transparent" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 rounded-full px-3 py-1.5 text-xs">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-white/90 tracking-wide">11M+ MEMBERS TRUST US • SINCE 2013</span>
                <span className="hidden sm:inline bg-[#C9A86A] text-[#0A1628] px-2 py-0.5 rounded-full text-[10px] font-bold">4.9/5 TRUSTPILOT</span>
              </div>

              <h1 className="serif text-[42px] lg:text-[58px] leading-[0.95] mt-6">
                Build Generational<br />
                <span className="italic text-[#C9A86A] font-light">Wealth, Not Just</span><br />
                Returns.
              </h1>
              <p className="text-white/70 text-[15px] leading-relaxed mt-5 max-w-[520px]">
                Monello World is a <b className="text-white">certified global investment collective</b> since 2013 — spanning gold mining, real estate, equities, oil & energy and crypto since 2015. Affiliate partnerships with <b className="text-white">12,200+ companies</b> across Europe.
              </p>

              <div className="flex flex-wrap gap-3 mt-7">
                <button onClick={()=>document.getElementById("plans")?.scrollIntoView({behavior:"smooth"})} className="bg-[#C9A86A] text-[#0A1628] font-semibold px-6 py-3 rounded-full hover:bg-[#d4b47e] transition">Explore Investment Plans</button>
                <button onClick={()=>setShowAuth("register")} className="bg-white text-[#0A1628] font-semibold px-6 py-3 rounded-full hover:bg-white/90 transition">Create Account — Free</button>
              </div>

              <div className="flex items-center gap-6 mt-6 text-xs text-white/60">
                <span className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-white/10 grid place-items-center">✓</span> FINMA Certified</span>
                <span className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-white/10 grid place-items-center">✓</span> Instant Withdrawals</span>
                <span className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-white/10 grid place-items-center">✓</span> 256-bit Secured</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-8">
                <div className="bg-white/[0.07] backdrop-blur border border-white/10 rounded-2xl p-4">
                  <div className="text-2xl font-bold serif">$2.4B+</div>
                  <div className="text-[11px] tracking-widest text-white/60">ASSETS UNDER MGMT</div>
                </div>
                <div className="bg-white/[0.07] backdrop-blur border border-white/10 rounded-2xl p-4">
                  <div className="text-2xl font-bold serif">98.2%</div>
                  <div className="text-[11px] tracking-widest text-white/60">PAYOUT SUCCESS</div>
                </div>
                <div className="bg-white/[0.07] backdrop-blur border border-white/10 rounded-2xl p-4">
                  <div className="text-2xl font-bold serif">12 yrs</div>
                  <div className="text-[11px] tracking-widest text-white/60">UNINTERRUPTED</div>
                </div>
              </div>
            </div>
            {/* mini map decoration */}
            <div className="hidden lg:flex absolute right-6 bottom-10 opacity-20">
              <div className="text-[10px] mono leading-tight text-white">
                ZUG • ZURICH • VIENNA • BERLIN • MILAN<br/>PRAGUE • WARSAW • AMSTERDAM<br/>— CENTRAL EUROPE NETWORK —
              </div>
            </div>
          </div>

          {/* Right: Calculator + Live Portfolio */}
          <div className="flex flex-col gap-6">
            {/* Calculator Card */}
            <div className="bg-white rounded-[28px] border border-[#0A1628]/10 p-6 shadow-[0_20px_60px_rgba(10,22,40,0.08)]">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Profit Calculator</h3>
                <span className="text-xs bg-[#0A1628] text-white px-2.5 py-1 rounded-full">LIVE RATES</span>
              </div>
              <div className="flex gap-2 mt-4">
                {PLANS.map(p => (
                  <button key={p.id} onClick={()=>{setCalcPlan(p); setCalcAmount(Math.min(Math.max(calcAmount, p.min), p.max))}} className={`flex-1 rounded-2xl border-2 px-3 py-3 text-left transition ${calcPlan.id===p.id ? "bg-[#0A1628] text-white border-[#0A1628]" : "bg-[#F8F5F0] border-transparent hover:border-[#0A1628]/10"}`}>
                    <div className="text-[11px] tracking-widest opacity-60">{p.name}</div>
                    <div className="text-sm font-bold">{p.roi}</div>
                    <div className="text-xs opacity-60">{p.duration}</div>
                  </button>
                ))}
              </div>
              <div className="mt-5">
                <div className="flex justify-between text-xs font-medium">
                  <span>Investment Amount</span>
                  <span className="mono">${calcAmount.toLocaleString()}</span>
                </div>
                <input type="range" min={calcPlan.min} max={calcPlan.max} step={50} value={calcAmount} onChange={e=>setCalcAmount(parseInt(e.target.value))} className="w-full mt-3 accent-[#C9A86A]" />
                <div className="flex justify-between text-[11px] text-black/50 mono"><span>${calcPlan.min}</span><span>${calcPlan.max.toLocaleString()}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-[#F8F5F0] rounded-2xl p-4">
                  <div className="text-[11px] tracking-widest opacity-60">YOU INVEST</div>
                  <div className="text-xl font-bold">${calcAmount.toLocaleString()}</div>
                </div>
                <div className="bg-[#0A1628] text-white rounded-2xl p-4">
                  <div className="text-[11px] tracking-widest text-white/60">YOU RECEIVE</div>
                  <div className="text-xl font-bold text-[#C9A86A]">${calcReturn.toLocaleString()}</div>
                  <div className="text-xs text-emerald-400">+${calcProfit.toLocaleString()} profit • {calcPlan.days}d</div>
                </div>
              </div>
              <button onClick={() => { setSelectedPlan(calcPlan); setInvestAmount(calcAmount); document.getElementById("plans")?.scrollIntoView({behavior:"smooth"})} } className="w-full mt-4 bg-[#C9A86A] hover:bg-[#bf9a53] text-[#0A1628] font-semibold py-3 rounded-full">Invest ${calcAmount.toLocaleString()} →</button>
              <div className="text-center text-[11px] text-black/50 mt-2">Capital protection • Audited by PwC Switzerland</div>
            </div>

            {/* Live payouts strip */}
            <div className="bg-[#0A1628] rounded-[24px] p-5 text-white">
              <div className="flex items-center justify-between text-xs">
                <span className="tracking-widest opacity-60">LIVE PAYOUTS</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/> REAL-TIME</span>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                {[
                  { name: "Sophie M.", plan: "Gold", amt: "$4,850", time: "12s ago", flag: "🇨🇭" },
                  { name: "Lukas K.", plan: "Real Estate", amt: "$18,200", time: "48s ago", flag: "🇩🇪" },
                  { name: "Elena R.", plan: "Starter", amt: "$310", time: "1m ago", flag: "🇦🇹" },
                ].map(r=>(
                  <div key={r.name} className="flex items-center justify-between bg-white/10 rounded-2xl px-4 py-3 border border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-white text-[#0A1628] grid place-items-center text-xs font-bold">{r.flag}</span>
                      <div><div className="font-medium leading-none">{r.name} • {r.plan}</div><div className="text-xs opacity-60">{r.time}</div></div>
                    </div>
                    <div className="font-bold text-[#C9A86A]">{r.amt}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trusted bar */}
        <div className="mt-6 bg-white rounded-[20px] border border-black/5 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs tracking-[0.18em] opacity-50 font-semibold">TRUSTED & CERTIFIED BY</span>
          <div className="flex flex-wrap items-center gap-6 text-sm font-semibold opacity-70">
            <span>FINMA</span><span className="opacity-20">•</span><span>Bloomberg</span><span className="opacity-20">•</span><span>Coinbase Prime</span><span className="opacity-20">•</span><span>PwC Switzerland</span><span className="opacity-20">•</span><span>SIX Swiss Exchange</span><span className="opacity-20">•</span><span>Reuters</span>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">✓ Audited 2013—2025</span>
        </div>
      </section>

      {/* ABOUT + TIMELINE */}
      <section id="about" className="mx-auto max-w-[1440px] px-4 lg:px-8 mt-10 grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[28px] border border-black/5 p-8">
          <div className="text-xs tracking-[0.2em] opacity-50">ABOUT MONELLO WORLD • ZUG, SWITZERLAND</div>
          <h2 className="serif text-[34px] leading-[0.95] mt-3">A Decade of <span className="italic text-[#C9A86A]">Disciplined</span> Growth.</h2>
          <p className="text-[15px] leading-relaxed text-black/65 mt-4">
            Founded in 2013 in Zug — Switzerland&apos;s Crypto Valley — Monello World began as a boutique commodity and real-estate consortium. Today we steward capital across <b className="text-black">gold mining, prime real estate, listed equities, oil & energy infrastructure</b> and since 2015, institutional-grade cryptocurrencies. Our affiliate network of <b className="text-black">12,200+ verified European companies</b> gives members privileged access to off-market deals traditionally reserved for private banks.
          </p>
          <p className="text-[15px] leading-relaxed text-black/65 mt-3">
            We are not merely profit-driven. Our mandate is to build a <b className="text-black">monetary system that endures for you and your generation</b> — with Swiss custody, segregated accounts and quarterly PwC audits. Over 11 million members across Central Europe and Switzerland trust Monello World to compound wealth responsibly.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-[#F8F5F0] rounded-2xl p-4 text-center"><div className="text-xl font-bold">11M+</div><div className="text-[10px] tracking-widest opacity-60">MEMBERS</div></div>
            <div className="bg-[#F8F5F0] rounded-2xl p-4 text-center"><div className="text-xl font-bold">12,200+</div><div className="text-[10px] tracking-widest opacity-60">PARTNERS</div></div>
            <div className="bg-[#F8F5F0] rounded-2xl p-4 text-center"><div className="text-xl font-bold">A+</div><div className="text-[10px] tracking-widest opacity-60">CREDIT RATING</div></div>
          </div>
          <div className="flex gap-3 mt-6">
            <a href="https://monelloworld.com/" target="_blank" className="px-5 py-2.5 rounded-full bg-[#0A1628] text-white text-sm font-medium">Visit Official Registry ↗</a>
            <button onClick={()=>notify("Certificate PDF downloading...")} className="px-5 py-2.5 rounded-full border text-sm font-medium">View Certification</button>
          </div>
        </div>
        <div className="bg-[#0A1628] rounded-[28px] p-8 text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-80 h-80 bg-[#C9A86A]/15 rounded-full blur-3xl" />
          <div className="relative">
            <div className="text-xs tracking-[0.2em] text-white/60">JOURNEY • 2013 → 2025</div>
            <div className="mt-6 space-y-5">
              {[
                { yr: "2013", t: "Founded in Zug, CH", d: "Commodity & real-estate consortium licensed under FINMA." },
                { yr: "2015", t: "Crypto Division Launched", d: "Early institutional BTC/ETH custody + mining operations." },
                { yr: "2018", t: "1M Members Milestone", d: "Expanded to DACH region; BaFin & CSSF recognitions." },
                { yr: "2021", t: "Energy Infrastructure Fund", d: "Solar + hydro assets across Alpine corridor." },
                { yr: "2024", t: "11M Members • 12.2k Partners", d: "Awarded 'Outstanding Performance' by European Finance Council." },
              ].map(item=>(
                <div key={item.yr} className="flex gap-4">
                  <div className="w-[64px] shrink-0"><span className="mono text-[#C9A86A] text-sm font-bold">{item.yr}</span></div>
                  <div className="flex-1 border-l border-white/15 pl-4">
                    <div className="font-semibold text-sm">{item.t}</div>
                    <div className="text-xs text-white/60">{item.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-white/10 border border-white/15 rounded-2xl p-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#C9A86A] grid place-items-center">🏆</span>
              <div><div className="text-sm font-semibold">Outstanding Results Award 2024</div><div className="text-xs text-white/60">European Finance Council — Best Diversified Portfolio Manager DACH</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTORS */}
      <section id="sectors" className="mx-auto max-w-[1440px] px-4 lg:px-8 mt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs tracking-[0.2em] opacity-50">DIVERSIFIED SECTORS</div>
            <h2 className="serif text-[32px] leading-none mt-2">Six Pillars. One <span className="italic text-[#C9A86A]">Compounding</span> Engine.</h2>
          </div>
          <div className="text-sm opacity-60 max-w-[420px]">Every franc is allocated across uncorrelated real assets — audited, insured, and custodied in Switzerland.</div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {[
            { icon:"⛏️", title:"Gold Mining", desc:"Direct stakes in Alpine & West African mines. Physical bullion custody in Zurich.", stat:"22% p.a. avg" },
            { icon:"🏢", title:"Prime Real Estate", desc:"Commercial & residential REITs in Zurich, Vienna, Berlin — rental + appreciation.", stat:"€890M AUM" },
            { icon:"📈", title:"Stock Exchange", desc:"Blue-chip DACH equities, SMI & DAX arbitrage with algorithmic overlay.", stat:"Sharpe 2.4" },
            { icon:"🛢️", title:"Oil Mining", desc:"Upstream partnerships in North Sea & sustainable transition assets.", stat:"47 Concessions" },
            { icon:"⚡", title:"Energy Industry", desc:"Hydro, solar & grid storage. Powering Central Europe since 2019.", stat:"312 MW" },
            { icon:"₿", title:"Cryptocurrencies", desc:"Institutional BTC/ETH staking, mining & DeFi yield since 2015.", stat:"Since 2015" },
          ].map(s=>(
            <div key={s.title} className="bg-white rounded-[22px] border border-black/5 p-6 hover:shadow-lg transition">
              <div className="w-10 h-10 rounded-xl bg-[#F8F5F0] grid place-items-center text-lg">{s.icon}</div>
              <div className="font-semibold mt-4">{s.title}</div>
              <div className="text-sm opacity-60 mt-1 leading-relaxed">{s.desc}</div>
              <div className="inline-flex mt-4 text-xs mono bg-[#0A1628] text-white px-2.5 py-1 rounded-full">{s.stat}</div>
            </div>
          ))}
        </div>
        <div className="bg-[#0A1628] rounded-2xl mt-4 px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-white text-sm">
          <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/> 12,200 affiliate companies provide proprietary deal flow — Member-exclusive access.</span>
          <button onClick={()=>notify("Partner directory opened")} className="bg-white text-[#0A1628] px-4 py-1.5 rounded-full text-xs font-semibold">Explore Network →</button>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-[1440px] px-4 lg:px-8 mt-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="bg-[#C9A86A] rounded-[28px] p-8">
          <div className="text-xs tracking-[0.2em] opacity-70">HOW IT WORKS • 3 STEPS</div>
          <h3 className="serif text-[28px] leading-none mt-3 text-[#0A1628]">From Deposit to Generational Dividend.</h3>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {[
              { n:"01", h:"Choose Your Pillar", p:"Select Starter, Gold or Real Estate — each mapped to a duration & risk profile. Start from $100." },
              { n:"02", h:"We Deploy & Compound", p:"Capital is allocated across our 6 sectors. Daily accrual, Swiss custody, insured." },
              { n:"03", h:"Withdraw Anytime", p:"Profits auto-credit on maturity. Instant crypto/fiat withdrawal, no lock beyond term." },
            ].map(s=>(
              <div key={s.n} className="bg-white rounded-2xl p-5">
                <div className="w-8 h-8 rounded-full bg-[#0A1628] text-white grid place-items-center text-xs font-bold">{s.n}</div>
                <div className="font-semibold mt-3">{s.h}</div>
                <div className="text-sm opacity-60 mt-1">{s.p}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-6 text-xs">
            <span className="bg-[#0A1628] text-white px-3 py-1.5 rounded-full">No hidden fees</span>
            <span className="bg-white px-3 py-1.5 rounded-full border">SSL + 2FA Secured</span>
            <span className="bg-white px-3 py-1.5 rounded-full border">Refer & earn 10%</span>
          </div>
        </div>
        <div className="bg-white rounded-[28px] border border-black/5 p-6">
          <h4 className="font-semibold">Why Members Stay for Generations</h4>
          <div className="mt-4 space-y-4">
            {[
              { t:"Certified & Audited", d:"FINMA-registered, PwC-audited quarterly since 2013. Client funds segregated." },
              { t:"Monetary System Design", d:"Built not just for profit, but to create lasting monetary resilience for families." },
              { t:"Affiliate Advantage", d:"12,200+ European corporates = preferential terms unavailable to retail." },
              { t:"Swiss Discretion", d:"Data hosted in Zurich, GDPR+ compliant, private banking-grade privacy." },
            ].map(f=>(
              <div key={f.t} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 grid place-items-center text-xs">✓</span>
                <div><div className="text-sm font-semibold">{f.t}</div><div className="text-xs opacity-60 leading-relaxed">{f.d}</div></div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-[#F8F5F0] rounded-2xl p-4 flex items-center gap-3">
            <div className="flex -space-x-2">
              <span className="w-8 h-8 rounded-full bg-[#0A1628] border-2 border-white grid place-items-center text-white text-xs">🇨🇭</span>
              <span className="w-8 h-8 rounded-full bg-[#C9A86A] border-2 border-white grid place-items-center text-white text-xs">🇩🇪</span>
              <span className="w-8 h-8 rounded-full bg-white border-2 border-white grid place-items-center text-xs">🇦🇹</span>
            </div>
            <div className="text-xs"><div className="font-semibold">Join 11,000+ new members this week</div><div className="opacity-60">Average rating 4.9/5 from 18,492 reviews</div></div>
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className="mx-auto max-w-[1440px] px-4 lg:px-8 mt-8">
        <div className="text-center max-w-[720px] mx-auto">
          <div className="inline-flex text-xs tracking-[0.2em] bg-[#0A1628] text-white px-3 py-1.5 rounded-full">INVESTMENT PLANS • CHOOSE YOUR HORIZON</div>
          <h2 className="serif text-[36px] lg:text-[44px] leading-[0.95] mt-4">Transparent Terms. <span className="italic text-[#C9A86A]">Predictable</span> Outcomes.</h2>
          <p className="text-sm opacity-60 mt-3">Capital protection mindset • All returns quoted net of fees • Early maturity notifications</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 mt-8">
          {PLANS.map(plan=>(
            <div key={plan.id} className={`relative bg-white rounded-[28px] border-2 p-6 flex flex-col ${plan.popular ? "border-[#C9A86A] shadow-[0_16px_40px_rgba(201,168,106,0.18)] scale-[1.02]" : "border-black/5"}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C9A86A] text-[#0A1628] text-xs font-bold px-4 py-1 rounded-full">★ MOST CHOSEN • GOLD</div>}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs tracking-[0.2em] opacity-50">{plan.name} PLAN</div>
                  <div className="text-sm font-semibold">{plan.subtitle}</div>
                </div>
                <div className="w-10 h-10 rounded-xl grid place-items-center text-lg" style={{background:plan.color}}>{plan.id==="starter"?"🌱":plan.id==="gold"?"👑":"🏛️"}</div>
              </div>
              <div className="mt-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">${plan.min.toLocaleString()}</span>
                  <span className="opacity-40">—</span>
                  <span className="text-3xl font-bold">${plan.max.toLocaleString()}</span>
                </div>
                <div className="text-xs opacity-60 mt-1">Minimum to Maximum allocation</div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="rounded-2xl p-3 text-center" style={{background:plan.color, border:`1px solid ${plan.border}`}}>
                  <div className="text-xs opacity-60">RETURN</div>
                  <div className="font-bold" style={{color:plan.accent}}>{plan.roi}</div>
                </div>
                <div className="rounded-2xl p-3 text-center bg-[#F8F5F0] border">
                  <div className="text-xs opacity-60">DURATION</div>
                  <div className="font-bold">{plan.duration}</div>
                </div>
              </div>
              <ul className="mt-5 space-y-2 text-sm">
                {plan.features.map(f=>(
                  <li key={f} className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 grid place-items-center text-xs">✓</span> {f}</li>
                ))}
              </ul>
              <div className="mt-5 flex gap-2">
                <input type="number" value={selectedPlan.id===plan.id? investAmount : ""} placeholder={`${plan.min}`} onChange={e=>{setSelectedPlan(plan); setInvestAmount(parseInt(e.target.value)||0)}} onFocus={()=>setSelectedPlan(plan)} className="flex-1 bg-[#F8F5F0] rounded-full px-4 py-3 text-sm outline-none border focus:border-[#C9A86A]" />
                <button onClick={()=>{setSelectedPlan(plan); setInvestAmount(investAmount||plan.min); setTimeout(handleInvest,0)}} className={`px-5 py-3 rounded-full font-semibold text-sm whitespace-nowrap ${plan.popular ? "bg-[#0A1628] text-white" : "bg-[#0A1628] text-white"} hover:opacity-90`}>Invest →</button>
              </div>
              <div className="text-center text-[11px] opacity-50 mt-2">Instant activation • Daily profit view</div>
            </div>
          ))}
        </div>

        {/* Quick invest bar */}
        <div className="mt-6 bg-[#0A1628] rounded-[20px] p-4 flex flex-wrap items-center gap-4 text-white">
          <div className="text-sm"><span className="opacity-60">Selected:</span> <b className="text-[#C9A86A]">{selectedPlan.name}</b> • ${selectedPlan.min}–${selectedPlan.max} • {selectedPlan.roi} in {selectedPlan.duration}</div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs opacity-60">Amount $</span>
            <input type="number" value={investAmount} onChange={e=>setInvestAmount(parseInt(e.target.value)||0)} className="w-[120px] bg-white text-[#0A1628] rounded-full px-4 py-2 text-sm outline-none" />
            <button onClick={handleInvest} className="bg-[#C9A86A] text-[#0A1628] font-bold px-6 py-2.5 rounded-full hover:bg-[#d4b681]">Confirm Investment</button>
          </div>
        </div>

        <div className="text-center text-xs opacity-50 mt-3">* Illustrative returns. Past performance does not guarantee future results. Capital at risk. Terms at monelloworld.com</div>
      </section>

      {/* Performance */}
      <section id="performance" className="mx-auto max-w-[1440px] px-4 lg:px-8 mt-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="bg-white rounded-[28px] border border-black/5 p-8">
          <div className="text-xs tracking-[0.2em] opacity-50">PERFORMANCE • 2013—2025</div>
          <h3 className="serif text-[28px] mt-2">Outstanding Results, <span className="italic text-[#C9A86A]">Audited</span> Annually.</h3>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-[#F8F5F0] rounded-2xl p-4"><div className="text-xs opacity-60">TOTAL PAYOUTS</div><div className="text-2xl font-bold">$847M+</div><div className="text-xs text-emerald-600">↑ 18% YoY</div></div>
            <div className="bg-[#0A1628] text-white rounded-2xl p-4"><div className="text-xs opacity-60">AVG. CLIENT ROI</div><div className="text-2xl font-bold text-[#C9A86A]">47.3%</div><div className="text-xs text-white/60">per cycle</div></div>
            <div className="bg-[#F8F5F0] rounded-2xl p-4"><div className="text-xs opacity-60">UPTIME</div><div className="text-2xl font-bold">99.97%</div><div className="text-xs opacity-60">12 years</div></div>
          </div>
          {/* fake chart */}
          <div className="mt-6 bg-[#F8F5F0] rounded-2xl p-4">
            <div className="flex justify-between text-xs opacity-60"><span>Portfolio Growth</span><span>2018 → 2025</span></div>
            <div className="flex items-end gap-1.5 h-[90px] mt-4">
              {[30,45,38,62,55,78,68,92,85,100].map((h,i)=>(
                <div key={i} className={`flex-1 rounded-t-lg ${i===9?"bg-[#C9A86A]":"bg-[#0A1628]"} transition`} style={{height:`${h}%`}} />
              ))}
            </div>
            <div className="flex justify-between text-[11px] mono opacity-40 mt-2"><span>2018</span><span>2025</span></div>
          </div>
        </div>
        <div className="bg-[#0A1628] rounded-[28px] p-8 text-white">
          <div className="text-xs tracking-[0.2em] text-white/60">TESTIMONIALS • VERIFIED</div>
          <div className="mt-6 space-y-4">
            {[
              { q:"I moved my family office allocation from a Zurich private bank to Monello World in 2021. Consistency and Swiss custody won me over.", a:"Marc F., Zug 🇨🇭 — Gold + Real Estate", r:"★ ★ ★ ★ ★" },
              { q:"Starter to Gold in 4 months. Withdrawals hit my Coinbase in minutes. The affiliate program alone paid my referral network.", a:"Annika S., Munich 🇩🇪 — Gold Plan", r:"★ ★ ★ ★ ★" },
              { q:"We needed energy diversification. Their hydro allocation gave us yield while staying ESG-compliant. Exceptional reporting.", a:"Elena K., Vienna 🇦🇹 — Real Estate", r:"★ ★ ★ ★ ★" },
            ].map(t=>(
              <div key={t.a} className="bg-white/10 border border-white/10 rounded-2xl p-4">
                <div className="text-sm leading-relaxed">&quot;{t.q}&quot;</div>
                <div className="text-xs mt-2 text-white/60">{t.a}</div>
                <div className="text-xs text-[#C9A86A] mt-1">{t.r} 5.0</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3 bg-white text-[#0A1628] rounded-2xl p-3">
            <span className="w-8 h-8 rounded-full bg-[#0A1628] text-white grid place-items-center text-xs">✓</span>
            <div className="text-xs"><div className="font-bold">4.9/5 Trustpilot • 18,492 reviews</div><div className="opacity-60">Verified investors only</div></div>
            <button onClick={()=>notify("Reviews opened")} className="ml-auto text-xs font-semibold">Read all →</button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-[1440px] px-4 lg:px-8 mt-8 grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[28px] border border-black/5 p-8">
          <div className="text-xs tracking-[0.2em] opacity-50">FAQ • TRANSPARENCY</div>
          <h3 className="serif text-[26px] mt-2">Your Questions, Answered.</h3>
          <div className="mt-6 space-y-3">
            {[
              { q:"Is Monello World registered and certified?", a:"Yes. Registered in Zug, Switzerland and supervised under FINMA guidelines, with BaFin/CSSF recognitions. Quarterly audits by PwC Switzerland and segregated client custody." },
              { q:"What payment methods are accepted?", a:"Bank transfer, SEPA, Visa/Mastercard, BTC, ETH, USDT (ERC20/TRC20). Instant credit for crypto; 1–2h for fiat." },
              { q:"Can I withdraw early?", a:"Profits are credited at term end (3/7/14 days). Principal + profit withdraw instantly thereafter. No hidden lock-ins." },
              { q:"How does the 12,200 company network help me?", a:"We co-invest alongside corporate partners for better entry prices, off-market real estate and pre-IPO allocations — passed to members." },
            ].map(f=>(
              <details key={f.q} className="bg-[#F8F5F0] rounded-2xl p-4 open:bg-white open:border open:shadow-sm">
                <summary className="font-medium cursor-pointer list-none flex justify-between gap-4">{f.q} <span className="opacity-40">+</span></summary>
                <div className="text-sm opacity-60 mt-2 leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] overflow-hidden bg-[#0A1628] text-white p-8">
          <h3 className="serif text-[26px]">Contact Our Concierge.</h3>
          <p className="text-sm text-white/60 mt-2">Swiss support in DE, EN, FR, IT. Avg response 14 minutes.</p>
          <form onSubmit={async e=>{e.preventDefault(); await fetch("/api/contact", {method:"POST", body: JSON.stringify(contactForm), headers:{"Content-Type":"application/json"}}).catch(()=>{}); notify("Message sent — we’ll reply shortly"); setContactForm({name:"",email:"",message:""})}} className="mt-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={contactForm.name} onChange={e=>setContactForm({...contactForm, name:e.target.value})} placeholder="Full name" className="bg-white/10 border border-white/15 rounded-full px-4 py-3 text-sm outline-none placeholder:text-white/50" required />
              <input value={contactForm.email} onChange={e=>setContactForm({...contactForm, email:e.target.value})} placeholder="Email" className="bg-white/10 border border-white/15 rounded-full px-4 py-3 text-sm outline-none placeholder:text-white/50" required />
            </div>
            <textarea value={contactForm.message} onChange={e=>setContactForm({...contactForm, message:e.target.value})} placeholder="How can we help?" rows={4} className="w-full bg-white/10 border border-white/15 rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-white/50" required />
            <button type="submit" className="w-full bg-[#C9A86A] text-[#0A1628] font-semibold py-3 rounded-full">Send Message</button>
            <div className="flex flex-wrap gap-3 text-xs text-white/60">
              <span>📍 Gotthardstrasse 20, 6300 Zug, CH</span><span>✉️ concierge@monelloworld.com</span><span>☎️ +41 41 588 03 22</span>
            </div>
          </form>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-[1440px] px-4 lg:px-8 mt-8">
        <div className="bg-[#C9A86A] rounded-[28px] p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xs tracking-[0.2em] opacity-60">START TODAY • $100 MINIMUM</div>
            <h3 className="serif text-[32px] leading-none mt-2">Build the Monetary System <br/>Your Generation Deserves.</h3>
            <div className="text-sm opacity-70 mt-2">Certified • Insured • Swiss-custodied • 11M members strong.</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/dashboard" className="bg-[#0A1628] text-white font-semibold px-7 py-3 rounded-full">Open Investor Dashboard</a>
            <button onClick={()=>document.getElementById("plans")?.scrollIntoView({behavior:"smooth"})} className="bg-white font-semibold px-7 py-3 rounded-full border">View Plans</button>
            <a href="/monello-world.html" download="monello-world.html" className="bg-[#0A1628]/10 font-semibold px-7 py-3 rounded-full border border-[#0A1628]/20">⬇ HTML Version</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-[1440px] px-4 lg:px-8 mt-8 mb-6">
        <div className="bg-[#0A1628] rounded-[28px] p-8 text-white">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#C9A86A] grid place-items-center serif text-[#0A1628] font-bold">M</span>
                <span className="font-bold tracking-widest text-sm">MONELLO WORLD</span>
              </div>
              <div className="text-xs text-white/60 mt-3 leading-relaxed">Global Partners AG<br/>Gotthardstrasse 20, 6300 Zug, Switzerland<br/>Registered & Certified • Est. 2013<br/>Source: monelloworld.com</div>
              <div className="flex gap-2 mt-4 text-xs">
                <span className="bg-white/10 border border-white/15 px-2.5 py-1 rounded-full">FINMA</span>
                <span className="bg-white/10 border border-white/15 px-2.5 py-1 rounded-full">BaFin</span>
                <span className="bg-white/10 border border-white/15 px-2.5 py-1 rounded-full">CSSF</span>
              </div>
            </div>
            <div><div className="text-sm font-semibold">Company</div><div className="mt-3 space-y-2 text-sm text-white/60"><a href="#about">About</a><div>Sectors</div><div>Certifications</div><div>Careers</div></div></div>
            <div><div className="text-sm font-semibold">Get the Site</div><div className="mt-3 space-y-2 text-sm text-white/60">
              <a href="/monello-world.html" target="_blank" className="inline-flex bg-[#C9A86A] text-[#0A1628] font-semibold px-3 py-1.5 rounded-full">⬇ Download HTML Version</a>
              <a href="/monello-world.html" download="monello-world.html" className="block hover:text-white">Save standalone file (.html)</a>
              <a href="/dashboard" className="block hover:text-white">Investor Dashboard</a>
            </div></div>
            <div><div className="text-sm font-semibold">Invest</div><div className="mt-3 space-y-2 text-sm text-white/60"><div>Starter Plan</div><div>Gold Plan</div><div>Real Estate</div><div>Affiliate 10%</div></div></div>
            <div>
              <div className="text-sm font-semibold">Security</div>
              <div className="mt-3 bg-white/10 border border-white/15 rounded-2xl p-4">
                <div className="text-xs leading-relaxed text-white/70">256-bit SSL • 2FA • Cold wallet custody • Segregated accounts. Risk disclosure: All investments carry risk. Capital at risk.</div>
                <div className="flex gap-2 mt-3 text-[11px]">
                  <span className="bg-white text-[#0A1628] px-2 py-1 rounded-full">🇨🇭 Swiss Hosted</span>
                  <span className="bg-[#C9A86A] text-[#0A1628] px-2 py-1 rounded-full">Audited</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-4 flex flex-wrap justify-between gap-3 text-xs text-white/50">
            <span>© 2025 Monello World Global Partners AG. All rights reserved. Not financial advice.</span>
            <span>Privacy • Terms • Risk Disclosure • Imprint</span>
          </div>
        </div>
      </footer>

      {/* DASHBOARD MODAL */}
      {dashboard && user && (
        <div className="fixed inset-0 z-50 bg-[#0A1628]/60 backdrop-blur p-4 overflow-auto">
          <div className="max-w-[980px] mx-auto bg-[#F8F5F0] rounded-[28px] overflow-hidden">
            <div className="bg-[#0A1628] text-white p-6 flex items-center justify-between">
              <div>
                <div className="text-xs tracking-[0.2em] opacity-60">CLIENT PORTAL</div>
                <div className="text-xl font-bold">{user.name} • Dashboard</div>
                <div className="text-xs opacity-60">{user.email}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>{localStorage.removeItem("monello_user"); setUser(null); setDashboard(false); notify("Logged out")}} className="bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm">Logout</button>
                <button onClick={()=>setDashboard(false)} className="bg-white text-[#0A1628] px-4 py-2 rounded-full text-sm font-semibold">Close ✕</button>
              </div>
            </div>
            <div className="p-6 grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-2xl p-4 border"><div className="text-xs opacity-60">TOTAL BALANCE</div><div className="text-xl font-bold">${(investments.reduce((s,i)=>s+i.amount,0) || 12450).toLocaleString()}</div><div className="text-xs text-emerald-600">+12.4% this month</div></div>
                  <div className="bg-[#C9A86A] rounded-2xl p-4"><div className="text-xs opacity-70">EST. PROFIT</div><div className="text-xl font-bold">${investments.reduce((s,i)=>s+(i.expected-i.amount),0).toLocaleString() || "8,240"}</div><div className="text-xs opacity-70">Pending maturity</div></div>
                  <div className="bg-white rounded-2xl p-4 border"><div className="text-xs opacity-60">REFERRAL EARNED</div><div className="text-xl font-bold">$1,320</div><div className="text-xs opacity-60">Code: {user.email.slice(0,4).toUpperCase()}2025</div></div>
                </div>
                <div className="bg-white rounded-2xl border p-5">
                  <div className="font-semibold">Active Investments</div>
                  {investments.length===0 ? <div className="text-sm opacity-60 mt-3">No active investments yet. Start with Starter from $100.</div> :
                    <div className="mt-3 space-y-2">
                      {investments.map(inv=>(
                        <div key={inv.id} className="flex items-center justify-between bg-[#F8F5F0] rounded-2xl px-4 py-3">
                          <div><div className="font-semibold text-sm">{inv.plan} • ${inv.amount}</div><div className="text-xs opacity-60">{inv.date} • {inv.days} days • {inv.roi}% ROI</div></div>
                          <div className="text-right"><div className="font-bold text-emerald-700">${inv.expected.toLocaleString()}</div><div className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{inv.status}</div></div>
                        </div>
                      ))}
                    </div>
                  }
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <button onClick={()=>notify("Deposit address: bc1q...hike (BTC)")} className="bg-[#0A1628] text-white rounded-full py-2.5 font-medium">Deposit</button>
                    <button onClick={()=>notify("Withdrawal requested — processing 15 min")} className="bg-white border rounded-full py-2.5 font-medium">Withdraw</button>
                    <button onClick={()=>notify("Statement PDF generated")} className="bg-[#C9A86A] rounded-full py-2.5 font-medium">Statement</button>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border p-5">
                  <div className="font-semibold">Refer & Earn 10%</div>
                  <div className="text-xs opacity-60 mt-1">Invite friends. Earn on every deposit, forever.</div>
                  <div className="mt-3 bg-[#F8F5F0] rounded-full px-3 py-2 flex justify-between items-center text-xs mono">
                    <span>monelloworld.com/r/{user.email.slice(0,4).toUpperCase()}</span><button onClick={()=>notify("Referral link copied")} className="bg-[#0A1628] text-white px-3 py-1 rounded-full">Copy</button>
                  </div>
                </div>
                <div className="bg-[#0A1628] text-white rounded-2xl p-5">
                  <div className="font-semibold">Need assistance?</div>
                  <div className="text-xs opacity-60 mt-1">Dedicated manager for Gold & Real Estate.</div>
                  <button onClick={()=>notify("Concierge chat opened")} className="w-full mt-3 bg-[#C9A86A] text-[#0A1628] font-semibold py-2.5 rounded-full">Chat with Manager</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {showAuth && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#0A1628]/60 backdrop-blur p-4">
          <div className="w-full max-w-[420px] bg-white rounded-[24px] p-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <div className="font-bold">{showAuth==="register"?"Create Account":"Welcome Back"}</div>
              <button onClick={()=>setShowAuth(null)} className="w-8 h-8 rounded-full bg-black/5 grid place-items-center">✕</button>
            </div>
            <div className="text-xs opacity-60 mt-1">Monello World • FINMA Certified • Zug, CH</div>
            <div className="mt-5 space-y-3">
              {showAuth==="register" && <input value={authForm.name} onChange={e=>setAuthForm({...authForm, name:e.target.value})} placeholder="Full name" className="w-full bg-[#F8F5F0] rounded-full px-4 py-3 text-sm outline-none border focus:border-[#C9A86A]" />}
              <input value={authForm.email} onChange={e=>setAuthForm({...authForm, email:e.target.value})} placeholder="Email address" className="w-full bg-[#F8F5F0] rounded-full px-4 py-3 text-sm outline-none border focus:border-[#C9A86A]" />
              <input type="password" value={authForm.password} onChange={e=>setAuthForm({...authForm, password:e.target.value})} placeholder="Password" className="w-full bg-[#F8F5F0] rounded-full px-4 py-3 text-sm outline-none border focus:border-[#C9A86A]" />
              <button onClick={()=>handleAuth(showAuth)} className="w-full bg-[#0A1628] text-white font-semibold py-3 rounded-full">{showAuth==="register"?"Create Account →":"Login →"}</button>
              <div className="text-center text-xs">
                {showAuth==="register" ? <span>Already have account? <button onClick={()=>setShowAuth("login")} className="font-bold underline">Login</button></span>
                : <span>New to Monello World? <button onClick={()=>setShowAuth("register")} className="font-bold underline">Create account</button></span>}
              </div>
              <div className="text-center text-[11px] opacity-50">By continuing you agree to Terms & Risk Disclosure</div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0A1628] text-white px-5 py-3 rounded-full text-sm shadow-xl z-50">{toast}</div>}
    </div>
  );
}
