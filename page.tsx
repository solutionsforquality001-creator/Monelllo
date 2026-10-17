"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const PLANS = [
  { id: "starter", name: "STARTER", subtitle: "Capital Builder", min: 100, max: 1000, roi: 25, duration: "3 Days", days: 3, color: "#2E7D32" },
  { id: "gold", name: "GOLD", subtitle: "Wealth Accelerator", min: 1100, max: 10000, roi: 55, duration: "7 Days", days: 7, color: "#C9A86A" },
  { id: "realestate", name: "REAL ESTATE", subtitle: "Legacy Portfolio", min: 10000, max: 50000, roi: 70, duration: "14 Days", days: 14, color: "#0A4A3A" },
];

const CRYPTOS = [
  { id: "btc", name: "Bitcoin", symbol: "BTC", network: "BTC (SegWit)", address: "bc1qxy2kgy95k5v3m9z8w0p7r6t4e5f6g7h8j9k0l2m3", icon: "₿", rate: 67432, confirmations: 1 },
  { id: "eth", name: "Ethereum", symbol: "ETH", network: "ERC-20", address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18", icon: "Ξ", rate: 3812, confirmations: 12 },
  { id: "usdt_trc", name: "Tether USD", symbol: "USDT", network: "TRC-20", address: "TQk9a1c2d3e4f5g6h7j8k9l0m1n2o3p4q5r6s7t8", icon: "₮", rate: 1, confirmations: 20 },
  { id: "usdt_erc", name: "Tether USD", symbol: "USDT", network: "ERC-20", address: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B", icon: "₮", rate: 1, confirmations: 20 },
  { id: "bnb", name: "BNB", symbol: "BNB", network: "BEP-20", address: "bnb1grpf0955h0ykzq3e7d6w4r5t6y7u8i9o0p1a2s3d", icon: "B", rate: 612, confirmations: 15 },
  { id: "ltc", name: "Litecoin", symbol: "LTC", network: "LTC", address: "ltc1qxy2kgy95k5v3m9z8w0p7r6t4e5f6g7h8j9k0l2m3n4o5p6", icon: "Ł", rate: 84, confirmations: 6 },
];

function QRPlaceholder({ address }: { address: string }) {
  // simple fake QR pattern with CSS grid
  return (
    <div className="w-[180px] h-[180px] bg-white p-3 rounded-2xl border shadow-sm mx-auto">
      <div className="w-full h-full bg-[#0A1628] rounded-xl grid grid-cols-10 gap-[2px] p-2">
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className={`rounded-[1px] ${((address.charCodeAt(i % address.length) + i) % 3 === 0) ? "bg-white" : "bg-[#0A1628]"}`} />
        ))}
      </div>
      <div className="text-[9px] mono text-center mt-1 opacity-60">SCAN TO PAY • {address.slice(0, 10)}…</div>
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [showAuth, setShowAuth] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "fund" | "invest" | "withdraw" | "history">("overview");
  const [selectedCrypto, setSelectedCrypto] = useState(CRYPTOS[0]);
  const [depositAmount, setDepositAmount] = useState("500");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [selectedWithdrawCrypto, setSelectedWithdrawCrypto] = useState(CRYPTOS[0]);
  const [investPlan, setInvestPlan] = useState(PLANS[1]);
  const [investAmount, setInvestAmount] = useState(2500);
  const [investments, setInvestments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [livePrice, setLivePrice] = useState({ btc: 67432, eth: 3812 });

  useEffect(() => {
    const u = localStorage.getItem("monello_user");
    if (u) setUser(JSON.parse(u));
    const inv = localStorage.getItem("monello_investments");
    if (inv) setInvestments(JSON.parse(inv));
    const tx = localStorage.getItem("monello_tx");
    if (tx) setTransactions(JSON.parse(tx));
    const bal = localStorage.getItem("monello_balance");
    if (bal) setBalance(parseFloat(bal));
    const i = setInterval(() => setLivePrice(p => ({ btc: p.btc + (Math.random()-0.5)*50, eth: p.eth + (Math.random()-0.5)*10 })), 2500);
    return () => clearInterval(i);
  }, []);

  const notify = (m: string) => { setToast(m); setTimeout(()=>setToast(null), 3000); };

  const saveTx = (tx: any) => {
    const next = [tx, ...transactions];
    setTransactions(next);
    localStorage.setItem("monello_tx", JSON.stringify(next));
  };

  const handleAuth = async (mode: "login"|"register") => {
    if(!authForm.email || !authForm.password) return notify("Fill all fields");
    try{ await fetch("/api/auth", {method:"POST", body: JSON.stringify({...authForm, action: mode}), headers:{"Content-Type":"application/json"}})}catch{}
    const u={name: authForm.name || authForm.email.split("@")[0], email: authForm.email};
    localStorage.setItem("monello_user", JSON.stringify(u));
    setUser(u); setShowAuth(false); notify(mode==="register"?"Account created — Welcome to Monello World":"Welcome back");
  };

  const handleDeposit = () => {
    const amt = parseFloat(depositAmount);
    if(!amt || amt<10) return notify("Minimum deposit $10");
    const newBal = balance + amt;
    setBalance(newBal);
    localStorage.setItem("monello_balance", String(newBal));
    saveTx({ id: Date.now(), type: "Deposit", method: `${selectedCrypto.symbol} • ${selectedCrypto.network}`, amount: amt, status: "Confirmed", date: new Date().toLocaleString(), crypto: selectedCrypto.symbol });
    notify(`Deposit request: Send ${ (amt/selectedCrypto.rate).toFixed(6)} ${selectedCrypto.symbol} to address. Credited after ${selectedCrypto.confirmations} confirmations.`);
    // also call API
    fetch("/api/deposit", {method:"POST", body: JSON.stringify({amount: amt, crypto: selectedCrypto.id}), headers:{"Content-Type":"application/json"}}).catch(()=>{});
  };

  const handleInvest = () => {
    if(investAmount < investPlan.min || investAmount > investPlan.max) return notify(`Amount must be $${investPlan.min} — $${investPlan.max}`);
    if(investAmount > balance) return notify("Insufficient balance — please fund account first via crypto");
    const newBal = balance - investAmount;
    setBalance(newBal);
    localStorage.setItem("monello_balance", String(newBal));
    const expected = Math.round(investAmount * (1 + investPlan.roi/100));
    const item = {
      id: Date.now(),
      plan: investPlan.name,
      planId: investPlan.id,
      amount: investAmount,
      roi: investPlan.roi,
      days: investPlan.days,
      expected,
      profit: expected - investAmount,
      start: new Date(),
      end: new Date(Date.now() + investPlan.days*24*60*60*1000),
      status: "Active",
      daily: Math.round((expected - investAmount)/investPlan.days),
      progress: 27 // simulated
    };
    const next=[item, ...investments];
    setInvestments(next);
    localStorage.setItem("monello_investments", JSON.stringify(next));
    saveTx({ id: Date.now()+1, type: "Investment", method: item.plan, amount: -investAmount, status: "Active", date: new Date().toLocaleString() });
    fetch("/api/invest", {method:"POST", body: JSON.stringify({plan: investPlan.id, amount: investAmount}), headers:{"Content-Type":"application/json"}}).catch(()=>{});
    notify(`$${investAmount.toLocaleString()} invested in ${investPlan.name} — ${investPlan.roi}% in ${investPlan.duration}. Daily: $${item.daily}`);
    setTab("overview");
  };

  const handleWithdraw = () => {
    const amt=parseFloat(withdrawAmount);
    if(!amt) return notify("Enter amount");
    if(!withdrawAddress) return notify("Enter withdrawal wallet address");
    if(amt > balance) return notify("Insufficient balance");
    if(amt < 20) return notify("Minimum withdrawal $20");
    const fee = Math.max(2, amt*0.015);
    const net = amt - fee;
    const newBal = balance - amt;
    setBalance(newBal);
    localStorage.setItem("monello_balance", String(newBal));
    saveTx({ id: Date.now(), type: "Withdrawal", method: `${selectedWithdrawCrypto.symbol} → ${withdrawAddress.slice(0,12)}…`, amount: -amt, status: "Processing (≈15 mins)", date: new Date().toLocaleString(), net });
    notify(`Withdrawal ${amt} USD → ${(net/selectedWithdrawCrypto.rate).toFixed(6)} ${selectedWithdrawCrypto.symbol} initiated. Fee $${fee.toFixed(2)}. You'll receive notification once sent.`);
    fetch("/api/withdraw", {method:"POST", body: JSON.stringify({amount: amt, address: withdrawAddress, crypto: selectedWithdrawCrypto.id}), headers:{"Content-Type":"application/json"}}).catch(()=>{});
    setWithdrawAmount(""); setWithdrawAddress("");
  };

  const totalInvested = investments.reduce((s,i)=>s+i.amount,0);
  const totalExpected = investments.reduce((s,i)=>s+i.expected,0);
  const totalProfit = totalExpected - totalInvested;
  const activeCount = investments.filter(i=>i.status==="Active").length;

  // growth simulation for chart
  const growthData = Array.from({length: 14}, (_, i) => {
    const base = balance*0.6 + totalInvested*0.4;
    return Math.round(base * (1 + (totalProfit/(totalInvested||1))*0.6 * (i/14)) + Math.sin(i)*20);
  });

  if(!user){
    return (
      <div className="min-h-screen bg-[#F8F5F0] grid place-items-center p-4">
        <div className="w-full max-w-[440px] bg-white rounded-[28px] border p-8 shadow-xl">
          <Link href="/" className="text-xs tracking-widest opacity-60 hover:opacity-100">← Back to Monello World</Link>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-10 h-10 rounded-xl bg-[#0A1628] grid place-items-center text-[#C9A86A] serif text-xl">M</div>
            <div><div className="font-bold tracking-widest text-sm">MONELLO WORLD</div><div className="text-xs opacity-60">Investor Dashboard • Crypto Payments Only</div></div>
          </div>
          <h1 className="serif text-[28px] leading-none mt-6">Access your <span className="italic text-[#C9A86A]">wealth</span> dashboard.</h1>
          <p className="text-sm opacity-60 mt-2">Fund via crypto, initiate plans, withdraw instantly, track growth daily.</p>
          <div className="mt-6 space-y-3">
            <input value={authForm.name} onChange={e=>setAuthForm({...authForm, name:e.target.value})} placeholder="Full name (for registration)" className="w-full bg-[#F8F5F0] rounded-full px-4 py-3 text-sm outline-none border focus:border-[#C9A86A]" />
            <input value={authForm.email} onChange={e=>setAuthForm({...authForm, email:e.target.value})} placeholder="Email address" className="w-full bg-[#F8F5F0] rounded-full px-4 py-3 text-sm outline-none border focus:border-[#C9A86A]" />
            <input type="password" value={authForm.password} onChange={e=>setAuthForm({...authForm, password:e.target.value})} placeholder="Password" className="w-full bg-[#F8F5F0] rounded-full px-4 py-3 text-sm outline-none border focus:border-[#C9A86A]" />
            <button onClick={()=>handleAuth("login")} className="w-full bg-[#0A1628] text-white font-semibold py-3 rounded-full">Login →</button>
            <button onClick={()=>handleAuth("register")} className="w-full bg-[#C9A86A] text-[#0A1628] font-semibold py-3 rounded-full">Create Account (Free)</button>
            <div className="text-center text-xs opacity-50">By continuing you agree to Terms • Deposits & withdrawals in crypto only</div>
          </div>
        </div>
        {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0A1628] text-white px-5 py-3 rounded-full text-sm">{toast}</div>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-[280px] bg-[#0A1628] text-white flex-col p-6 sticky top-0 h-screen">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C9A86A] grid place-items-center serif font-bold text-[#0A1628]">M</div>
          <div><div className="font-bold tracking-widest text-xs">MONELLO WORLD</div><div className="text-[10px] tracking-widest opacity-60">GLOBAL PARTNERS AG</div></div>
        </Link>
        <div className="mt-6 bg-white/10 border border-white/10 rounded-2xl p-4">
          <div className="text-xs opacity-60 tracking-widest">WELCOME</div>
          <div className="font-semibold">{user.name}</div>
          <div className="text-xs opacity-60">{user.email}</div>
          <div className="mt-2 inline-flex text-[11px] bg-[#C9A86A] text-[#0A1628] px-2 py-1 rounded-full font-bold">VERIFIED • KYC ✓</div>
        </div>
        <nav className="mt-6 space-y-1">
          {[
            {id:"overview", label:"Overview", icon:"◈"},
            {id:"fund", label:"Fund Account (Crypto)", icon:"₿"},
            {id:"invest", label:"Initiate Plan", icon:"↗"},
            {id:"withdraw", label:"Withdraw (Crypto)", icon:"↘"},
            {id:"history", label:"Transactions", icon:"≡"},
          ].map(item=>(
            <button key={item.id} onClick={()=>setTab(item.id as any)} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-sm ${tab===item.id ? "bg-white text-[#0A1628] font-semibold" : "text-white/70 hover:bg-white/10"}`}>
              <span className="w-7 h-7 rounded-lg bg-white/10 grid place-items-center text-xs">{item.icon}</span> {item.label}
              {item.id==="fund" && <span className="ml-auto text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full">INSTANT</span>}
            </button>
          ))}
        </nav>
        <div className="mt-auto bg-[#C9A86A] rounded-2xl p-4 text-[#0A1628]">
          <div className="text-xs font-bold tracking-widest">CRYPTO ONLY</div>
          <div className="text-xs leading-relaxed mt-1">Deposits & withdrawals exclusively in BTC, ETH, USDT, BNB, LTC. No fiat.</div>
          <div className="text-[11px] mt-2 opacity-70">Networks: BTC, ERC-20, TRC-20, BEP-20</div>
        </div>
        <button onClick={()=>{localStorage.removeItem("monello_user"); setUser(null);}} className="mt-4 text-xs opacity-60 hover:opacity-100">Logout →</button>
      </aside>

      {/* Mobile top */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#0A1628] text-white z-20 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold tracking-widest text-sm">MONELLO WORLD</Link>
        <div className="flex gap-1">
          {["overview","fund","invest","withdraw","history"].map(t=>(
            <button key={t} onClick={()=>setTab(t as any)} className={`px-3 py-1.5 rounded-full text-xs ${tab===t ? "bg-white text-[#0A1628]":"bg-white/10"}`}>{t}</button>
          ))}
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 lg:ml-0 pt-[56px] lg:pt-0">
        {/* Top bar */}
        <div className="bg-white border-b sticky top-0 z-10 px-4 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-xs tracking-widest opacity-50">DASHBOARD • LIVE</div>
              <div className="font-bold">Hi, {user.name} — your wealth, compounding.</div>
            </div>
            <div className="hidden md:flex items-center gap-3 text-xs mono bg-[#F8F5F0] px-3 py-2 rounded-full">
              <span>BTC <b>${livePrice.btc.toFixed(0)}</b> <span className="text-emerald-600">+1.1%</span></span>
              <span className="opacity-20">|</span>
              <span>ETH <b>${livePrice.eth.toFixed(0)}</b></span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#F8F5F0] rounded-full px-4 py-2">
              <div className="text-[11px] opacity-60">AVAILABLE BALANCE</div>
              <div className="font-bold">${balance.toLocaleString(undefined,{minimumFractionDigits:2})}</div>
            </div>
            <Link href="/" className="hidden md:inline px-4 py-2 rounded-full border text-sm">← Home</Link>
          </div>
        </div>

        <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">
          {/* OVERVIEW */}
          {tab==="overview" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-[#0A1628] text-white rounded-[24px] p-6">
                  <div className="text-xs tracking-widest opacity-60">TOTAL BALANCE</div>
                  <div className="text-2xl font-bold mt-1">${balance.toLocaleString()}</div>
                  <div className="text-xs text-emerald-400 mt-1">+ funded via crypto</div>
                </div>
                <div className="bg-white border rounded-[24px] p-6">
                  <div className="text-xs tracking-widest opacity-60">TOTAL INVESTED</div>
                  <div className="text-2xl font-bold">${totalInvested.toLocaleString()}</div>
                  <div className="text-xs opacity-60">{activeCount} active plans</div>
                </div>
                <div className="bg-[#C9A86A] rounded-[24px] p-6 text-[#0A1628]">
                  <div className="text-xs tracking-widest opacity-60">PROJECTED RETURN</div>
                  <div className="text-2xl font-bold">${totalExpected.toLocaleString()}</div>
                  <div className="text-xs opacity-70">+${totalProfit.toLocaleString()} profit</div>
                </div>
                <div className="bg-white border rounded-[24px] p-6">
                  <div className="text-xs tracking-widest opacity-60">GROWTH RATE</div>
                  <div className="text-2xl font-bold">+47.3%</div>
                  <div className="text-xs text-emerald-600">avg per cycle</div>
                </div>
              </div>

              {/* Growth chart */}
              <div className="bg-white rounded-[24px] border p-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Investment Growth — Real-time Monitor</h3>
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border">● LIVE UPDATING</span>
                </div>
                <div className="flex items-end gap-2 h-[120px] mt-6">
                  {growthData.map((v,i)=>(
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-[#0A1628] rounded-t-lg transition-all" style={{height: `${40 + (v % 80)}px`, background: i===13 ? "#C9A86A" : "#0A1628"}} />
                      <span className="text-[10px] mono opacity-40">D{i+1}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="bg-[#F8F5F0] rounded-2xl p-4 text-center"><div className="text-xs opacity-60">DAILY EARNED TODAY</div><div className="font-bold text-emerald-700">+${investments.reduce((s,i)=>s+(i.daily||0),0) || 84}</div></div>
                  <div className="bg-[#F8F5F0] rounded-2xl p-4 text-center"><div className="text-xs opacity-60">NEXT PAYOUT</div><div className="font-bold">{investments[0] ? new Date(investments[0].end).toLocaleDateString() : "—"}</div></div>
                  <div className="bg-[#F8F5F0] rounded-2xl p-4 text-center"><div className="text-xs opacity-60">COMPOUND AVAILABLE</div><div className="font-bold">Yes • Auto</div></div>
                </div>
              </div>

              {/* Active investments */}
              <div className="bg-white rounded-[24px] border p-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Active Investments</h3>
                  <button onClick={()=>setTab("invest")} className="text-sm bg-[#0A1628] text-white px-4 py-1.5 rounded-full">+ Initiate New Plan</button>
                </div>
                {investments.length===0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 rounded-full bg-[#F8F5F0] grid place-items-center mx-auto">◈</div>
                    <div className="font-medium mt-3">No active investments</div>
                    <div className="text-sm opacity-60">Fund via crypto, then initiate your first plan from $100.</div>
                    <button onClick={()=>setTab("fund")} className="mt-4 bg-[#C9A86A] px-6 py-2 rounded-full font-semibold text-sm">Fund Account →</button>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {investments.map(inv=>(
                      <div key={inv.id} className="bg-[#F8F5F0] rounded-2xl p-4">
                        <div className="flex flex-wrap justify-between gap-3">
                          <div>
                            <div className="font-bold">{inv.plan} • ${inv.amount.toLocaleString()} → ${inv.expected.toLocaleString()} <span className="text-emerald-700">(+{inv.roi}%)</span></div>
                            <div className="text-xs opacity-60">{inv.days} days • Daily ${inv.daily} • Started {new Date(inv.start).toLocaleDateString()} → Ends {new Date(inv.end).toLocaleDateString()}</div>
                          </div>
                          <span className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full h-fit">● Active • {inv.progress}%</span>
                        </div>
                        <div className="mt-3 bg-white rounded-full h-2 overflow-hidden">
                          <div className="h-full bg-[#C9A86A]" style={{width: `${inv.progress}%`}} />
                        </div>
                        <div className="flex justify-between text-xs mt-1 opacity-60"><span>Progress</span><span>${(inv.amount + inv.profit * inv.progress/100).toFixed(0)} accrued</span></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FUND */}
          {tab==="fund" && (
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
              <div className="bg-white rounded-[24px] border p-6">
                <h3 className="font-semibold text-lg">Fund Your Account — Crypto Only</h3>
                <p className="text-sm opacity-60 mt-1">Choose asset & network. Send exact amount to the address. Credited after confirmations. Minimum $10.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-5">
                  {CRYPTOS.map(c=>(
                    <button key={c.id} onClick={()=>setSelectedCrypto(c)} className={`p-3 rounded-2xl border text-left ${selectedCrypto.id===c.id ? "bg-[#0A1628] text-white border-[#0A1628]" : "bg-[#F8F5F0] border-transparent hover:border-black/10"}`}>
                      <div className="flex items-center gap-2"><span className="w-7 h-7 rounded-lg bg-white text-[#0A1628] grid place-items-center text-xs font-bold">{c.icon}</span><span className="font-bold text-sm">{c.symbol}</span></div>
                      <div className="text-xs opacity-60 mt-1">{c.name}</div>
                      <div className="text-[11px] mt-1 bg-white/10 inline-block px-2 py-0.5 rounded-full">{c.network}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-6">
                  <label className="text-xs font-medium">Amount in USD</label>
                  <div className="flex gap-2 mt-2">
                    <input value={depositAmount} onChange={e=>setDepositAmount(e.target.value)} type="number" className="flex-1 bg-[#F8F5F0] rounded-full px-4 py-3 outline-none border focus:border-[#C9A86A]" placeholder="500" />
                    <div className="bg-[#0A1628] text-white rounded-full px-5 py-3 text-sm mono">≈ {(parseFloat(depositAmount||"0")/selectedCrypto.rate).toFixed(6)} {selectedCrypto.symbol}</div>
                  </div>
                  <div className="flex gap-2 mt-2 text-xs">
                    {[100,500,1000,5000].map(v=>(
                      <button key={v} onClick={()=>setDepositAmount(String(v))} className="bg-[#F8F5F0] px-3 py-1 rounded-full hover:bg-[#0A1628] hover:text-white">${v}</button>
                    ))}
                  </div>
                </div>
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs">
                  <div className="font-semibold">⚠️ Important: Crypto payments only</div>
                  <div className="opacity-70 mt-1">Send only <b>{selectedCrypto.symbol} on {selectedCrypto.network}</b> to the address below. Sending other assets/networks will be lost. Include memo/tag if required.</div>
                </div>
              </div>
              <div className="bg-[#0A1628] text-white rounded-[24px] p-6">
                <div className="text-xs tracking-widest opacity-60">DEPOSIT ADDRESS • {selectedCrypto.network}</div>
                <div className="font-bold mt-1">{selectedCrypto.name} ({selectedCrypto.symbol})</div>
                <div className="mt-4 bg-white rounded-2xl p-4">
                  <QRPlaceholder address={selectedCrypto.address} />
                </div>
                <div className="mt-4 bg-white/10 border border-white/15 rounded-2xl p-3">
                  <div className="text-xs opacity-60">Wallet Address — Tap to copy</div>
                  <div className="mono text-sm break-all mt-1">{selectedCrypto.address}</div>
                  <button onClick={()=>{navigator.clipboard.writeText(selectedCrypto.address); notify("Address copied ✓")}} className="mt-2 w-full bg-white text-[#0A1628] font-semibold py-2 rounded-full text-sm">Copy Address</button>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                  <div className="bg-white/10 rounded-xl p-3 text-center"><div className="opacity-60">You Send</div><div className="font-bold mono">{(parseFloat(depositAmount||"0")/selectedCrypto.rate).toFixed(6)} {selectedCrypto.symbol}</div></div>
                  <div className="bg-white/10 rounded-xl p-3 text-center"><div className="opacity-60">Network</div><div className="font-bold">{selectedCrypto.network}</div></div>
                  <div className="bg-white/10 rounded-xl p-3 text-center"><div className="opacity-60">Confirmations</div><div className="font-bold">{selectedCrypto.confirmations}</div></div>
                </div>
                <button onClick={handleDeposit} className="w-full mt-4 bg-[#C9A86A] text-[#0A1628] font-bold py-3 rounded-full">I’ve Sent Crypto — Confirm Deposit</button>
                <div className="text-xs text-center opacity-60 mt-2">After you send, click confirm. Our system detects on-chain after {selectedCrypto.confirmations} conf.</div>
              </div>
            </div>
          )}

          {/* INVEST */}
          {tab==="invest" && (
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
              <div className="bg-white rounded-[24px] border p-6">
                <h3 className="font-semibold text-lg">Initiate an Investment Plan</h3>
                <p className="text-sm opacity-60">Balance: <b>${balance.toLocaleString()}</b> — you can only invest what you’ve funded via crypto.</p>
                <div className="grid gap-3 mt-5">
                  {PLANS.map(p=>(
                    <button key={p.id} onClick={()=>{setInvestPlan(p); setInvestAmount(p.min)}} className={`text-left p-4 rounded-2xl border-2 flex justify-between items-center ${investPlan.id===p.id ? "bg-[#0A1628] text-white border-[#0A1628]" : "bg-[#F8F5F0] border-transparent"}`}>
                      <div><div className="text-xs tracking-widest opacity-60">{p.name}</div><div className="font-bold">{p.subtitle} • {p.roi}% in {p.duration}</div><div className="text-xs opacity-60">${p.min} — ${p.max.toLocaleString()}</div></div>
                      <span className="w-6 h-6 rounded-full border grid place-items-center text-xs">{investPlan.id===p.id?"✓":""}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-6">
                  <div className="flex justify-between text-sm font-medium"><span>Investment Amount (USD)</span><span className="mono">${investAmount.toLocaleString()}</span></div>
                  <input type="range" min={investPlan.min} max={investPlan.max} step={50} value={investAmount} onChange={e=>setInvestAmount(parseInt(e.target.value))} className="w-full mt-3 accent-[#C9A86A]" />
                  <div className="flex justify-between text-xs mono opacity-50"><span>${investPlan.min}</span><span>${investPlan.max.toLocaleString()}</span></div>
                </div>
              </div>
              <div className="bg-[#0A1628] text-white rounded-[24px] p-6">
                <div className="text-xs tracking-widest opacity-60">INVESTMENT PREVIEW</div>
                <div className="mt-3 bg-white text-[#0A1628] rounded-2xl p-5">
                  <div className="text-xs opacity-60">{investPlan.name} PLAN</div>
                  <div className="text-2xl font-bold">${investAmount.toLocaleString()} → ${Math.round(investAmount*(1+investPlan.roi/100)).toLocaleString()}</div>
                  <div className="text-sm text-emerald-700 font-medium">+${Math.round(investAmount*investPlan.roi/100).toLocaleString()} profit • {investPlan.days} days • Daily ${Math.round(investAmount*investPlan.roi/100/investPlan.days)}</div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#F8F5F0] rounded-xl p-3"><div className="opacity-60">You Pay</div><div className="font-bold">${investAmount.toLocaleString()}</div></div>
                    <div className="bg-[#C9A86A] rounded-xl p-3"><div className="opacity-60">You Receive</div><div className="font-bold">${Math.round(investAmount*(1+investPlan.roi/100)).toLocaleString()}</div></div>
                  </div>
                </div>
                <div className="mt-4 bg-white/10 border border-white/15 rounded-2xl p-4 text-xs">
                  <div>Growth timeline: Daily accrual, full maturity in {investPlan.days} days. Withdraw instantly after term.</div>
                  <div className="mt-2 flex gap-2">
                    {Array.from({length: investPlan.days}).map((_,i)=>(
                      <div key={i} className="flex-1 h-2 rounded-full bg-[#C9A86A]" />
                    ))}
                  </div>
                </div>
                <button onClick={handleInvest} className="w-full mt-4 bg-[#C9A86A] text-[#0A1628] font-bold py-3 rounded-full">Confirm & Initiate Plan →</button>
                <div className="text-xs text-center opacity-60 mt-2">Funds deducted from crypto balance. Audited & insured.</div>
              </div>
            </div>
          )}

          {/* WITHDRAW */}
          {tab==="withdraw" && (
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
              <div className="bg-white rounded-[24px] border p-6">
                <h3 className="font-semibold text-lg">Withdraw — Crypto Payout Only</h3>
                <p className="text-sm opacity-60">Withdrawals are processed exclusively in cryptocurrency to your external wallet. Min $20, fee 1.5% (min $2). ETA ~15 mins.</p>
                <div className="mt-5">
                  <label className="text-xs font-medium">Select Payout Asset & Network</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {CRYPTOS.slice(0,4).map(c=>(
                      <button key={c.id} onClick={()=>setSelectedWithdrawCrypto(c)} className={`p-3 rounded-2xl border text-left flex items-center gap-2 ${selectedWithdrawCrypto.id===c.id ? "bg-[#0A1628] text-white border-[#0A1628]" : "bg-[#F8F5F0]"}`}>
                        <span className="w-7 h-7 rounded-lg bg-white text-[#0A1628] grid place-items-center text-xs font-bold">{c.icon}</span>
                        <div><div className="text-sm font-bold">{c.symbol}</div><div className="text-xs opacity-60">{c.network}</div></div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-xs font-medium">Your {selectedWithdrawCrypto.symbol} Wallet Address ({selectedWithdrawCrypto.network})</label>
                  <input value={withdrawAddress} onChange={e=>setWithdrawAddress(e.target.value)} placeholder={selectedWithdrawCrypto.address.slice(0,30)+"…"} className="w-full mt-2 bg-[#F8F5F0] rounded-full px-4 py-3 mono text-sm outline-none border focus:border-[#C9A86A]" />
                  <div className="text-[11px] opacity-50 mt-1">Double-check: sending to wrong network = lost funds.</div>
                </div>
                <div className="mt-4">
                  <label className="text-xs font-medium">Amount (USD)</label>
                  <input value={withdrawAmount} onChange={e=>setWithdrawAmount(e.target.value)} type="number" placeholder="200" className="w-full mt-2 bg-[#F8F5F0] rounded-full px-4 py-3 outline-none border focus:border-[#C9A86A]" />
                  <div className="flex gap-2 mt-2 text-xs">
                    <button onClick={()=>setWithdrawAmount(String(Math.floor(balance*0.25)))} className="bg-[#F8F5F0] px-3 py-1 rounded-full">25%</button>
                    <button onClick={()=>setWithdrawAmount(String(Math.floor(balance*0.5)))} className="bg-[#F8F5F0] px-3 py-1 rounded-full">50%</button>
                    <button onClick={()=>setWithdrawAmount(String(Math.floor(balance)))} className="bg-[#F8F5F0] px-3 py-1 rounded-full">MAX</button>
                    <span className="ml-auto opacity-60">Available ${balance.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-4 bg-[#F8F5F0] rounded-2xl p-4 text-xs">
                  <div className="flex justify-between"><span>Amount</span><span>${parseFloat(withdrawAmount||"0").toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Fee (1.5%)</span><span>${Math.max(2, parseFloat(withdrawAmount||"0")*0.015).toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold"><span>You Receive</span><span>{((Math.max(0, parseFloat(withdrawAmount||"0") - Math.max(2, parseFloat(withdrawAmount||"0")*0.015))/selectedWithdrawCrypto.rate) || 0).toFixed(6)} {selectedWithdrawCrypto.symbol}</span></div>
                </div>
              </div>
              <div className="bg-[#0A1628] text-white rounded-[24px] p-6">
                <div className="text-xs tracking-widest opacity-60">CRYPTO WITHDRAWAL SUMMARY</div>
                <div className="mt-4 bg-white text-[#0A1628] rounded-2xl p-5">
                  <div className="text-xs opacity-60">PAYOUT TO</div>
                  <div className="font-bold text-sm mono break-all">{withdrawAddress || "— enter wallet address —"}</div>
                  <div className="text-xs opacity-60 mt-2">{selectedWithdrawCrypto.network} • Estimated 15 mins • On-chain</div>
                </div>
                <div className="mt-4 bg-amber-500/20 border border-amber-500/30 rounded-2xl p-4 text-xs">
                  <div className="font-semibold">Crypto-only policy</div>
                  <div className="opacity-80 mt-1">Monello World settles all deposits/withdrawals in crypto for speed & privacy. No bank transfers. Keep your wallet safe.</div>
                </div>
                <button onClick={handleWithdraw} className="w-full mt-4 bg-[#C9A86A] text-[#0A1628] font-bold py-3 rounded-full">Request Withdrawal →</button>
                <div className="text-xs text-center opacity-60 mt-2">You’ll get email + dashboard notification with TxHash.</div>
              </div>
            </div>
          )}

          {/* HISTORY */}
          {tab==="history" && (
            <div className="bg-white rounded-[24px] border p-6">
              <h3 className="font-semibold">Transaction History</h3>
              <div className="mt-4 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs opacity-60"><tr><th className="text-left py-2">Date</th><th className="text-left">Type</th><th className="text-left">Method / Plan</th><th className="text-right">Amount</th><th className="text-right">Status</th></tr></thead>
                  <tbody>
                    {transactions.length===0 ? (
                      <tr><td colSpan={5} className="text-center py-10 opacity-50">No transactions yet. Fund via crypto to begin.</td></tr>
                    ) : transactions.map(tx=>(
                      <tr key={tx.id} className="border-t">
                        <td className="py-3 text-xs opacity-60">{tx.date}</td>
                        <td><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${tx.type==="Deposit" ? "bg-emerald-50 text-emerald-700" : tx.type==="Withdrawal" ? "bg-amber-50 text-amber-700" : "bg-[#0A1628] text-white"}`}>{tx.type}</span></td>
                        <td className="mono text-xs">{tx.method}</td>
                        <td className={`text-right font-bold ${tx.amount<0?"text-red-600":"text-emerald-700"}`}>{tx.amount<0?"":"+"}${tx.amount.toLocaleString()}</td>
                        <td className="text-right text-xs"><span className="bg-[#F8F5F0] px-2 py-1 rounded-full">{tx.status}</span></td>
                      </tr>
                    ))}
                    {/* demo seed */}
                    <tr className="border-t opacity-60"><td className="py-3 text-xs">Apr 10, 2025</td><td><span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs">Deposit</span></td><td className="mono text-xs">BTC • BTC (SegWit)</td><td className="text-right font-bold text-emerald-700">+$1,100.00</td><td className="text-right text-xs"><span className="bg-[#F8F5F0] px-2 py-1 rounded-full">Confirmed</span></td></tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={()=>notify("CSV exported")} className="bg-[#0A1628] text-white px-4 py-2 rounded-full text-sm">Export CSV</button>
                <button onClick={()=>notify("Support ticket opened")} className="border px-4 py-2 rounded-full text-sm">Need help?</button>
              </div>
            </div>
          )}
        </div>
      </main>
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0A1628] text-white px-5 py-3 rounded-full text-sm shadow-xl z-50">{toast}</div>}
    </div>
  );
}
