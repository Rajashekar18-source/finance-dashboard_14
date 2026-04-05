import { useState, useMemo, useEffect } from "react";
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// ── Seed Data ──────────────────────────────────────────────────────────────────
const CATEGORIES = ["Food & Dining","Transport","Shopping","Utilities","Health","Entertainment","Salary","Freelance","Investments","Other"];
const CATEGORY_COLORS = {
  "Food & Dining":"#f97316","Transport":"#3b82f6","Shopping":"#a855f7","Utilities":"#14b8a6",
  "Health":"#ec4899","Entertainment":"#f59e0b","Salary":"#22c55e","Freelance":"#06b6d4",
  "Investments":"#8b5cf6","Other":"#94a3b8"
};

const seedTransactions = [
  { id:1,  date:"2026-01-03", desc:"Monthly Salary",          cat:"Salary",         type:"income",  amt:85000 },
  { id:2,  date:"2026-01-05", desc:"Swiggy Order",            cat:"Food & Dining",  type:"expense", amt:450 },
  { id:3,  date:"2026-01-07", desc:"Uber Ride",               cat:"Transport",      type:"expense", amt:280 },
  { id:4,  date:"2026-01-09", desc:"Amazon Purchase",         cat:"Shopping",       type:"expense", amt:3200 },
  { id:5,  date:"2026-01-12", desc:"Electricity Bill",        cat:"Utilities",      type:"expense", amt:1800 },
  { id:6,  date:"2026-01-14", desc:"Gym Membership",          cat:"Health",         type:"expense", amt:2500 },
  { id:7,  date:"2026-01-17", desc:"Netflix Subscription",    cat:"Entertainment",  type:"expense", amt:649 },
  { id:8,  date:"2026-01-20", desc:"Freelance Project A",     cat:"Freelance",      type:"income",  amt:22000 },
  { id:9,  date:"2026-01-22", desc:"Zomato Dinner",           cat:"Food & Dining",  type:"expense", amt:820 },
  { id:10, date:"2026-01-25", desc:"SIP Investment",          cat:"Investments",    type:"expense", amt:10000 },
  { id:11, date:"2026-02-03", desc:"Monthly Salary",          cat:"Salary",         type:"income",  amt:85000 },
  { id:12, date:"2026-02-06", desc:"Grocery Store",           cat:"Food & Dining",  type:"expense", amt:3400 },
  { id:13, date:"2026-02-08", desc:"Metro Card Recharge",     cat:"Transport",      type:"expense", amt:500 },
  { id:14, date:"2026-02-10", desc:"Myntra Order",            cat:"Shopping",       type:"expense", amt:4500 },
  { id:15, date:"2026-02-13", desc:"Water Bill",              cat:"Utilities",      type:"expense", amt:600 },
  { id:16, date:"2026-02-15", desc:"Doctor Visit",            cat:"Health",         type:"expense", amt:900 },
  { id:17, date:"2026-02-18", desc:"Movie Tickets",           cat:"Entertainment",  type:"expense", amt:1200 },
  { id:18, date:"2026-02-20", desc:"Freelance Project B",     cat:"Freelance",      type:"income",  amt:18000 },
  { id:19, date:"2026-02-23", desc:"Restaurant Lunch",        cat:"Food & Dining",  type:"expense", amt:1100 },
  { id:20, date:"2026-02-26", desc:"SIP Investment",          cat:"Investments",    type:"expense", amt:10000 },
  { id:21, date:"2026-03-03", desc:"Monthly Salary",          cat:"Salary",         type:"income",  amt:85000 },
  { id:22, date:"2026-03-05", desc:"Dominos Pizza",           cat:"Food & Dining",  type:"expense", amt:700 },
  { id:23, date:"2026-03-07", desc:"Ola Cabs",                cat:"Transport",      type:"expense", amt:420 },
  { id:24, date:"2026-03-10", desc:"Flipkart Sale",           cat:"Shopping",       type:"expense", amt:6800 },
  { id:25, date:"2026-03-12", desc:"Internet Bill",           cat:"Utilities",      type:"expense", amt:999 },
  { id:26, date:"2026-03-14", desc:"Pharmacy",                cat:"Health",         type:"expense", amt:560 },
  { id:27, date:"2026-03-16", desc:"Spotify Premium",         cat:"Entertainment",  type:"expense", amt:119 },
  { id:28, date:"2026-03-19", desc:"Bonus Payout",            cat:"Salary",         type:"income",  amt:15000 },
  { id:29, date:"2026-03-22", desc:"Cafe Coffee Day",         cat:"Food & Dining",  type:"expense", amt:480 },
  { id:30, date:"2026-03-25", desc:"SIP Investment",          cat:"Investments",    type:"expense", amt:10000 },
  { id:31, date:"2026-03-28", desc:"Miscellaneous",           cat:"Other",          type:"expense", amt:2300 },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);
const fmtShort = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(1)}K` : `₹${n}`;

// ── Components ─────────────────────────────────────────────────────────────────

function SummaryCard({ label, value, sub, color, icon }) {
  return (
    <div style={{
      background:"var(--card)", border:"1px solid var(--border)", borderRadius:16,
      padding:"20px 24px", display:"flex", flexDirection:"column", gap:8,
      borderLeft:`4px solid ${color}`, transition:"transform .15s",
      cursor:"default"
    }}
    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
    onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
    >
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:13,color:"var(--text-muted)",fontFamily:"'DM Sans',sans-serif",letterSpacing:".5px",textTransform:"uppercase"}}>{label}</span>
        <span style={{fontSize:20}}>{icon}</span>
      </div>
      <div style={{fontSize:26,fontWeight:700,color:"var(--text)",fontFamily:"'Syne',sans-serif"}}>{value}</div>
      {sub && <div style={{fontSize:12,color:"var(--text-muted)"}}>{sub}</div>}
    </div>
  );
}

function Badge({ type }) {
  const colors = { income:["#dcfce7","#16a34a"], expense:["#fee2e2","#dc2626"] };
  const dark = { income:["#14532d80","#4ade80"], expense:["#7f1d1d80","#f87171"] };
  const isDark = document.documentElement.dataset.theme === "dark";
  const [bg, fg] = isDark ? dark[type] : colors[type];
  return <span style={{background:bg,color:fg,padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:600,textTransform:"capitalize"}}>{type}</span>;
}

function TransactionRow({ t, role, onEdit }) {
  return (
    <tr style={{borderBottom:"1px solid var(--border)",transition:"background .1s"}}
      onMouseEnter={e=>e.currentTarget.style.background="var(--hover)"}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}
    >
      <td style={{padding:"12px 16px",fontSize:13,color:"var(--text-muted)"}}>{t.date}</td>
      <td style={{padding:"12px 16px",fontSize:14,color:"var(--text)",fontWeight:500}}>{t.desc}</td>
      <td style={{padding:"12px 16px"}}>
        <span style={{background:"var(--tag-bg)",color:CATEGORY_COLORS[t.cat]||"var(--text)",padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:500}}>
          {t.cat}
        </span>
      </td>
      <td style={{padding:"12px 16px"}}><Badge type={t.type}/></td>
      <td style={{padding:"12px 16px",fontSize:14,fontWeight:700,color:t.type==="income"?"#22c55e":"#f87171",textAlign:"right",fontFamily:"'Syne',sans-serif"}}>
        {t.type==="income"?"+":"-"}{fmt(t.amt)}
      </td>
      {role==="admin" && (
        <td style={{padding:"12px 16px",textAlign:"center"}}>
          <button onClick={()=>onEdit(t)} style={{background:"var(--accent)",color:"#fff",border:"none",borderRadius:8,padding:"4px 12px",cursor:"pointer",fontSize:12,fontWeight:600}}>Edit</button>
        </td>
      )}
    </tr>
  );
}

function Modal({ open, onClose, onSave, initial }) {
  const blank = {date:"",desc:"",cat:CATEGORIES[0],type:"expense",amt:""};
  const [form, setForm] = useState(initial || blank);
  useEffect(()=>{ if(open) setForm(initial || blank); },[open]);
  if(!open) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
      <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:20,padding:32,width:420,boxShadow:"0 24px 60px rgba(0,0,0,.3)"}}>
        <h3 style={{margin:"0 0 24px",fontFamily:"'Syne',sans-serif",color:"var(--text)",fontSize:20}}>{initial?"Edit":"Add"} Transaction</h3>
        {[["Date","date","date"],["Description","desc","text"],["Amount","amt","number"]].map(([lbl,key,type])=>(
          <div key={key} style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:12,color:"var(--text-muted)",marginBottom:6,textTransform:"uppercase",letterSpacing:".5px"}}>{lbl}</label>
            <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}
              style={{width:"100%",background:"var(--input-bg)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px",color:"var(--text)",fontSize:14,boxSizing:"border-box",outline:"none"}}/>
          </div>
        ))}
        {[["Category","cat",CATEGORIES],["Type","type",["income","expense"]]].map(([lbl,key,opts])=>(
          <div key={key} style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:12,color:"var(--text-muted)",marginBottom:6,textTransform:"uppercase",letterSpacing:".5px"}}>{lbl}</label>
            <select value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}
              style={{width:"100%",background:"var(--input-bg)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px",color:"var(--text)",fontSize:14,boxSizing:"border-box",outline:"none"}}>
              {opts.map(o=><option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <div style={{display:"flex",gap:12,marginTop:24}}>
          <button onClick={()=>onSave(form)} style={{flex:1,background:"var(--accent)",color:"#fff",border:"none",borderRadius:10,padding:"12px",cursor:"pointer",fontWeight:700,fontSize:14}}>Save</button>
          <button onClick={onClose} style={{flex:1,background:"var(--hover)",color:"var(--text)",border:"1px solid var(--border)",borderRadius:10,padding:"12px",cursor:"pointer",fontWeight:600,fontSize:14}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(false);
  const [role, setRole] = useState("viewer"); // viewer | admin
  const [page, setPage] = useState("dashboard"); // dashboard | transactions | insights
  const [txns, setTxns] = useState(() => {
    try { const s = localStorage.getItem("fin_txns"); return s ? JSON.parse(s) : seedTransactions; }
    catch { return seedTransactions; }
  });
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [modal, setModal] = useState({ open:false, data:null });

  // persist
  useEffect(()=>{ try{localStorage.setItem("fin_txns",JSON.stringify(txns));}catch{} },[txns]);

  // theme vars
  const theme = dark ? {
    "--bg":"#0d1117","--card":"#161b22","--border":"#30363d","--text":"#e6edf3","--text-muted":"#8b949e",
    "--hover":"#1f2937","--tag-bg":"#1f2937","--input-bg":"#0d1117","--accent":"#6366f1","--sidebar":"#161b22"
  } : {
    "--bg":"#f8fafc","--card":"#ffffff","--border":"#e2e8f0","--text":"#0f172a","--text-muted":"#64748b",
    "--hover":"#f1f5f9","--tag-bg":"#f1f5f9","--input-bg":"#f8fafc","--accent":"#6366f1","--sidebar":"#1e293b"
  };

  document.documentElement.dataset.theme = dark ? "dark" : "light";

  // computed
  const income = txns.filter(t=>t.type==="income").reduce((s,t)=>s+t.amt,0);
  const expense = txns.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amt,0);
  const balance = income - expense;

  // monthly area chart data
  const monthlyData = useMemo(()=>{
    const months = ["Jan","Feb","Mar"];
    return months.map((m,i)=>{
      const mo = String(i+1).padStart(2,"0");
      const inc = txns.filter(t=>t.date.startsWith(`2026-${mo}`)&&t.type==="income").reduce((s,t)=>s+t.amt,0);
      const exp = txns.filter(t=>t.date.startsWith(`2026-${mo}`)&&t.type==="expense").reduce((s,t)=>s+t.amt,0);
      return { month:m, Income:inc, Expenses:exp, Balance:inc-exp };
    });
  },[txns]);

  // category pie
  const catData = useMemo(()=>{
    const map = {};
    txns.filter(t=>t.type==="expense").forEach(t=>{ map[t.cat]=(map[t.cat]||0)+t.amt; });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({name,value}));
  },[txns]);

  // filtered transactions
  const filtered = useMemo(()=>{
    let arr = [...txns];
    if(search) arr = arr.filter(t=>t.desc.toLowerCase().includes(search.toLowerCase())||t.cat.toLowerCase().includes(search.toLowerCase()));
    if(filterType !== "all") arr = arr.filter(t=>t.type===filterType);
    if(filterCat !== "all") arr = arr.filter(t=>t.cat===filterCat);
    if(sortBy==="date-desc") arr.sort((a,b)=>b.date.localeCompare(a.date));
    else if(sortBy==="date-asc") arr.sort((a,b)=>a.date.localeCompare(b.date));
    else if(sortBy==="amt-desc") arr.sort((a,b)=>b.amt-a.amt);
    else if(sortBy==="amt-asc") arr.sort((a,b)=>a.amt-b.amt);
    return arr;
  },[txns,search,filterType,filterCat,sortBy]);

  // insights
  const topCat = catData[0];
  const jan = monthlyData[0], feb = monthlyData[1], mar = monthlyData[2];
  const savingsRate = income > 0 ? Math.round((balance/income)*100) : 0;

  // handlers
  const handleSave = (form) => {
    const amt = Number(form.amt);
    if(!form.date||!form.desc||!amt) return;
    if(modal.data) {
      setTxns(prev=>prev.map(t=>t.id===modal.data.id?{...t,...form,amt}:t));
    } else {
      setTxns(prev=>[...prev,{...form,amt,id:Date.now()}]);
    }
    setModal({open:false,data:null});
  };

  const handleExport = () => {
    const header = "Date,Description,Category,Type,Amount\n";
    const rows = txns.map(t=>`${t.date},"${t.desc}",${t.cat},${t.type},${t.amt}`).join("\n");
    const blob = new Blob([header+rows],{type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="transactions.csv"; a.click();
  };

  const nav = (id,label,icon) => (
    <button key={id} onClick={()=>setPage(id)} style={{
      display:"flex",alignItems:"center",gap:12,width:"100%",padding:"12px 20px",
      background:page===id?"rgba(99,102,241,.18)":"transparent",
      border:"none",color:page===id?"#818cf8":"#94a3b8",cursor:"pointer",
      borderRadius:10,fontSize:14,fontWeight:page===id?700:500,
      fontFamily:"'DM Sans',sans-serif",transition:"all .15s"
    }}>
      <span style={{fontSize:18}}>{icon}</span>{label}
    </button>
  );

  const CustomTooltip = ({active,payload,label}) => {
    if(!active||!payload?.length) return null;
    return (
      <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:"12px 16px",boxShadow:"0 8px 24px rgba(0,0,0,.15)"}}>
        <div style={{fontWeight:700,marginBottom:8,color:"var(--text)",fontFamily:"'Syne',sans-serif"}}>{label}</div>
        {payload.map(p=>(
          <div key={p.name} style={{fontSize:13,color:p.color,display:"flex",gap:16,justifyContent:"space-between"}}>
            <span>{p.name}</span><span style={{fontWeight:700}}>{fmtShort(p.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{...Object.fromEntries(Object.entries(theme).map(([k,v])=>[k,v])), display:"flex",minHeight:"100vh",background:"var(--bg)",fontFamily:"'DM Sans',sans-serif"}}>
      {/* inject CSS vars properly via style tag approach */}
      <style>{`
        :root { ${Object.entries(theme).map(([k,v])=>`${k}:${v}`).join(";")} }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:var(--bg); }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:var(--border); border-radius:3px; }
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Sidebar */}
      <div style={{width:240,background:"var(--sidebar)",display:"flex",flexDirection:"column",padding:"28px 16px",gap:4,flexShrink:0}}>
        <div style={{padding:"0 4px 28px",borderBottom:"1px solid rgba(255,255,255,.08)",marginBottom:16}}>
          <div style={{fontSize:22,fontWeight:800,fontFamily:"'Syne',sans-serif",color:"#f8fafc",letterSpacing:"-1px"}}>FinFlow</div>
          <div style={{fontSize:11,color:"#64748b",marginTop:2,letterSpacing:".5px"}}>FINANCE DASHBOARD</div>
        </div>
        {nav("dashboard","Dashboard","📊")}
        {nav("transactions","Transactions","💳")}
        {nav("insights","Insights","💡")}
        <div style={{marginTop:"auto",paddingTop:20,borderTop:"1px solid rgba(255,255,255,.08)",display:"flex",flexDirection:"column",gap:12}}>
          {/* Role switcher */}
          <div>
            <div style={{fontSize:11,color:"#64748b",marginBottom:8,textTransform:"uppercase",letterSpacing:".5px",paddingLeft:4}}>Role</div>
            <select value={role} onChange={e=>setRole(e.target.value)}
              style={{width:"100%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"10px 14px",color:"#e2e8f0",fontSize:13,cursor:"pointer",outline:"none"}}>
              <option value="viewer">👁 Viewer</option>
              <option value="admin">🛡 Admin</option>
            </select>
          </div>
          {/* Dark mode */}
          <button onClick={()=>setDark(d=>!d)} style={{
            display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,.06)",
            border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"10px 14px",
            color:"#94a3b8",cursor:"pointer",fontSize:13,fontWeight:500
          }}>
            {dark?"☀️ Light Mode":"🌙 Dark Mode"}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1,overflow:"auto",padding:"32px 36px"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32}}>
          <div>
            <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:"var(--text)",letterSpacing:"-1px"}}>
              {page==="dashboard"?"Overview":page==="transactions"?"Transactions":"Insights"}
            </h1>
            <p style={{color:"var(--text-muted)",fontSize:14,marginTop:4}}>
              {page==="dashboard"?"Your financial summary at a glance":page==="transactions"?"All your transactions in one place":"Smart observations from your data"}
            </p>
          </div>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <span style={{background:role==="admin"?"#6366f120":"#22c55e20",color:role==="admin"?"#818cf8":"#4ade80",padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:700}}>
              {role==="admin"?"🛡 Admin":"👁 Viewer"}
            </span>
            {role==="admin" && page==="transactions" && (
              <button onClick={()=>setModal({open:true,data:null})} style={{
                background:"var(--accent)",color:"#fff",border:"none",borderRadius:12,
                padding:"10px 20px",cursor:"pointer",fontWeight:700,fontSize:14,
                display:"flex",alignItems:"center",gap:8
              }}>+ Add Transaction</button>
            )}
            <button onClick={handleExport} style={{
              background:"var(--card)",color:"var(--text-muted)",border:"1px solid var(--border)",
              borderRadius:12,padding:"10px 16px",cursor:"pointer",fontSize:13,fontWeight:600
            }}>⬇ Export CSV</button>
          </div>
        </div>

        {/* ── DASHBOARD PAGE ── */}
        {page==="dashboard" && (
          <div style={{display:"flex",flexDirection:"column",gap:28}}>
            {/* Summary cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
              <SummaryCard label="Total Balance" value={fmt(balance)} sub={`${savingsRate}% savings rate`} color="#6366f1" icon="💰"/>
              <SummaryCard label="Total Income" value={fmt(income)} sub="Jan – Mar 2026" color="#22c55e" icon="📈"/>
              <SummaryCard label="Total Expenses" value={fmt(expense)} sub={`${txns.filter(t=>t.type==="expense").length} transactions`} color="#f87171" icon="📉"/>
            </div>

            {/* Charts row */}
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:20}}>
              {/* Area chart */}
              <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:24}}>
                <h3 style={{fontFamily:"'Syne',sans-serif",color:"var(--text)",fontSize:16,marginBottom:20}}>Monthly Overview</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f87171" stopOpacity={.3}/>
                        <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                    <XAxis dataKey="month" tick={{fill:"var(--text-muted)",fontSize:12}} axisLine={false} tickLine={false}/>
                    <YAxis tickFormatter={fmtShort} tick={{fill:"var(--text-muted)",fontSize:11}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend wrapperStyle={{color:"var(--text-muted)",fontSize:12}}/>
                    <Area type="monotone" dataKey="Income" stroke="#22c55e" strokeWidth={2.5} fill="url(#gi)"/>
                    <Area type="monotone" dataKey="Expenses" stroke="#f87171" strokeWidth={2.5} fill="url(#ge)"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Pie */}
              <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:24}}>
                <h3 style={{fontFamily:"'Syne',sans-serif",color:"var(--text)",fontSize:16,marginBottom:16}}>Spending Breakdown</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={catData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {catData.map((e,i)=><Cell key={i} fill={CATEGORY_COLORS[e.name]||"#94a3b8"}/>)}
                    </Pie>
                    <Tooltip formatter={(v)=>fmtShort(v)} contentStyle={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:10}}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:8}}>
                  {catData.slice(0,4).map(d=>(
                    <div key={d.name} style={{display:"flex",alignItems:"center",gap:8,fontSize:12}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:CATEGORY_COLORS[d.name],flexShrink:0}}/>
                      <span style={{color:"var(--text-muted)",flex:1}}>{d.name}</span>
                      <span style={{color:"var(--text)",fontWeight:600}}>{fmtShort(d.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bar chart + recent txns */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:24}}>
                <h3 style={{fontFamily:"'Syne',sans-serif",color:"var(--text)",fontSize:16,marginBottom:20}}>Monthly Savings</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                    <XAxis dataKey="month" tick={{fill:"var(--text-muted)",fontSize:12}} axisLine={false} tickLine={false}/>
                    <YAxis tickFormatter={fmtShort} tick={{fill:"var(--text-muted)",fontSize:11}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="Balance" fill="#6366f1" radius={[6,6,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:24}}>
                <h3 style={{fontFamily:"'Syne',sans-serif",color:"var(--text)",fontSize:16,marginBottom:16}}>Recent Transactions</h3>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {txns.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5).map(t=>(
                    <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:14,color:"var(--text)",fontWeight:500}}>{t.desc}</div>
                        <div style={{fontSize:12,color:"var(--text-muted)"}}>{t.date} · {t.cat}</div>
                      </div>
                      <div style={{fontWeight:700,color:t.type==="income"?"#22c55e":"#f87171",fontFamily:"'Syne',sans-serif",fontSize:14}}>
                        {t.type==="income"?"+":"-"}{fmtShort(t.amt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TRANSACTIONS PAGE ── */}
        {page==="transactions" && (
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            {/* Filters */}
            <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:20,display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
              <input placeholder="🔍 Search transactions…" value={search} onChange={e=>setSearch(e.target.value)}
                style={{flex:1,minWidth:200,background:"var(--input-bg)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px",color:"var(--text)",fontSize:14,outline:"none"}}/>
              {[
                ["Type",filterType,setFilterType,[["all","All Types"],["income","Income"],["expense","Expense"]]],
                ["Category",filterCat,setFilterCat,[["all","All Categories"],...CATEGORIES.map(c=>[c,c])]],
                ["Sort",sortBy,setSortBy,[["date-desc","Newest First"],["date-asc","Oldest First"],["amt-desc","Highest Amount"],["amt-asc","Lowest Amount"]]]
              ].map(([lbl,val,setter,opts])=>(
                <select key={lbl} value={val} onChange={e=>setter(e.target.value)}
                  style={{background:"var(--input-bg)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px",color:"var(--text)",fontSize:14,outline:"none",cursor:"pointer"}}>
                  {opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              ))}
              <span style={{fontSize:13,color:"var(--text-muted)",whiteSpace:"nowrap"}}>{filtered.length} results</span>
            </div>

            {/* Table */}
            <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,overflow:"hidden"}}>
              {filtered.length === 0 ? (
                <div style={{padding:64,textAlign:"center",color:"var(--text-muted)"}}>
                  <div style={{fontSize:40,marginBottom:12}}>🔍</div>
                  <div style={{fontSize:16,fontWeight:600}}>No transactions found</div>
                  <div style={{fontSize:13,marginTop:6}}>Try adjusting your filters</div>
                </div>
              ) : (
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr style={{borderBottom:"2px solid var(--border)",background:"var(--hover)"}}>
                        {["Date","Description","Category","Type","Amount",...(role==="admin"?["Action"]:[])].map(h=>(
                          <th key={h} style={{padding:"14px 16px",textAlign:h==="Amount"?"right":"left",fontSize:12,color:"var(--text-muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".5px"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(t=><TransactionRow key={t.id} t={t} role={role} onEdit={d=>setModal({open:true,data:d})}/>)}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── INSIGHTS PAGE ── */}
        {page==="insights" && (
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            {/* Insight cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
              {[
                {icon:"🏆",title:"Top Spending Category",val:topCat?.name||"—",sub:topCat?`${fmt(topCat.value)} total spent`:"",color:"#f97316"},
                {icon:"💹",title:"Savings Rate",val:`${savingsRate}%`,sub:`${fmt(balance)} saved overall`,color:"#22c55e"},
                {icon:"📅",title:"Best Savings Month",val:monthlyData.reduce((a,b)=>b.Balance>a.Balance?b:a).month,sub:`${fmtShort(monthlyData.reduce((a,b)=>b.Balance>a.Balance?b:a).Balance)} saved`,color:"#6366f1"},
              ].map(({icon,title,val,sub,color})=>(
                <div key={title} style={{background:"var(--card)",border:"1px solid var(--border)",borderLeft:`4px solid ${color}`,borderRadius:16,padding:"22px 24px"}}>
                  <div style={{fontSize:28,marginBottom:10}}>{icon}</div>
                  <div style={{fontSize:12,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>{title}</div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:"var(--text)"}}>{val}</div>
                  <div style={{fontSize:12,color:"var(--text-muted)",marginTop:4}}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Monthly comparison */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:24}}>
                <h3 style={{fontFamily:"'Syne',sans-serif",color:"var(--text)",fontSize:16,marginBottom:20}}>Month-over-Month Expenses</h3>
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  {monthlyData.map((m,i)=>{
                    const prev = i>0?monthlyData[i-1].Expenses:null;
                    const delta = prev ? Math.round(((m.Expenses-prev)/prev)*100) : null;
                    const pct = expense > 0 ? Math.round((m.Expenses/expense)*100) : 0;
                    return (
                      <div key={m.month}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                          <span style={{color:"var(--text)",fontSize:14,fontWeight:600}}>{m.month}</span>
                          <span style={{display:"flex",gap:12,alignItems:"center"}}>
                            <span style={{fontSize:14,color:"var(--text)",fontWeight:700}}>{fmt(m.Expenses)}</span>
                            {delta!==null && <span style={{fontSize:11,color:delta>0?"#f87171":"#4ade80",fontWeight:700}}>{delta>0?"▲":"▼"}{Math.abs(delta)}%</span>}
                          </span>
                        </div>
                        <div style={{background:"var(--hover)",borderRadius:4,height:8,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${pct}%`,background:"#6366f1",borderRadius:4,transition:"width .5s"}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category breakdown list */}
              <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:24}}>
                <h3 style={{fontFamily:"'Syne',sans-serif",color:"var(--text)",fontSize:16,marginBottom:20}}>All Categories Ranked</h3>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {catData.map((d,i)=>{
                    const pct = expense > 0 ? Math.round((d.value/expense)*100) : 0;
                    return (
                      <div key={d.name}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <span style={{fontSize:13,color:"var(--text)",display:"flex",gap:8,alignItems:"center"}}>
                            <span style={{background:CATEGORY_COLORS[d.name],width:8,height:8,borderRadius:"50%",display:"inline-block"}}/>
                            {d.name}
                          </span>
                          <span style={{fontSize:13,color:"var(--text)",fontWeight:700}}>{pct}% · {fmtShort(d.value)}</span>
                        </div>
                        <div style={{background:"var(--hover)",borderRadius:4,height:6}}>
                          <div style={{height:"100%",width:`${pct}%`,background:CATEGORY_COLORS[d.name],borderRadius:4}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Observation cards */}
            <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:24}}>
              <h3 style={{fontFamily:"'Syne',sans-serif",color:"var(--text)",fontSize:16,marginBottom:16}}>Key Observations</h3>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
                {[
                  {icon:"🛍",text:`Shopping expenses were highest in March at ${fmt(txns.filter(t=>t.date.startsWith("2026-03")&&t.cat==="Shopping").reduce((s,t)=>s+t.amt,0))}.`},
                  {icon:"🍽",text:`Food & Dining is your 2nd largest category. Consider meal prepping to reduce costs.`},
                  {icon:"📊",text:`Your income grew by ${fmt(15000)} in March due to a bonus payout.`},
                  {icon:"💼",text:`Freelance income contributed ${fmt(txns.filter(t=>t.cat==="Freelance").reduce((s,t)=>s+t.amt,0))} across 2 projects.`},
                ].map(({icon,text})=>(
                  <div key={text} style={{background:"var(--hover)",borderRadius:12,padding:"16px 18px",display:"flex",gap:14,alignItems:"flex-start"}}>
                    <span style={{fontSize:22,flexShrink:0}}>{icon}</span>
                    <span style={{fontSize:13,color:"var(--text-muted)",lineHeight:1.6}}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={modal.open} onClose={()=>setModal({open:false,data:null})} onSave={handleSave} initial={modal.data}/>
    </div>
  );
}