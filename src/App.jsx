import { useState, useEffect } from "react";

// ─── Seed data (squad roster) ────────────────────────────────────────────────
const seedData = {
  members: {
    "Tes":         { km:0, runs:0, paceTotal:0, paceKm:0 },
    "Tones":       { km:0, runs:0, paceTotal:0, paceKm:0 },
    "Vaughany":    { km:0, runs:0, paceTotal:0, paceKm:0 },
    "Sharpy":      { km:0, runs:0, paceTotal:0, paceKm:0 },
    "Benny":       { km:0, runs:0, paceTotal:0, paceKm:0 },
    "Fitto":       { km:0, runs:0, paceTotal:0, paceKm:0 },
    "Coop":        { km:0, runs:0, paceTotal:0, paceKm:0 },
    "Moon":        { km:0, runs:0, paceTotal:0, paceKm:0 },
    "Houldsworth": { km:0, runs:0, paceTotal:0, paceKm:0 },
    "Thump":       { km:0, runs:0, paceTotal:0, paceKm:0 },
    "Rabbitoh":    { km:0, runs:0, paceTotal:0, paceKm:0 },
    "Turner":      { km:0, runs:0, paceTotal:0, paceKm:0 },
    "Foz":         { km:0, runs:0, paceTotal:0, paceKm:0 },
    "Hicksy":      { km:0, runs:0, paceTotal:0, paceKm:0 },
    "Wick":        { km:0, runs:0, paceTotal:0, paceKm:0 },
    "Wads":        { km:0, runs:0, paceTotal:0, paceKm:0 },
    "Nutty":       { km:0, runs:0, paceTotal:0, paceKm:0 },
    "Mudders":     { km:0, runs:0, paceTotal:0, paceKm:0 },
    "Jimbob":      { km:0, runs:0, paceTotal:0, paceKm:0 },
    "Colgs":       { km:0, runs:0, paceTotal:0, paceKm:0 },
    "Hodgey":      { km:0, runs:0, paceTotal:0, paceKm:0 },
    "Wallen":      { km:0, runs:0, paceTotal:0, paceKm:0 },
    "Shaz":        { km:0, runs:0, paceTotal:0, paceKm:0 }
  },
  lastUpdated: null,
  firstUpdated: null
};

// ─── Load data: localStorage first, fall back to seedData ────────────────────
function loadDataInstant() {
  try {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.members) return { ...parsed, members: { ...seedData.members, ...parsed.members } };
    }
  } catch {}
  return { ...seedData, members: { ...seedData.members } };
}


const TOTAL_KM = 4000;
const MIN_LB_KM = 35; // Minimum km to appear on leaderboard
const CUTOFF_DATE = new Date("2026-08-15T00:00:00");
const ADMIN_PIN = "1234"; // ← Change this to your preferred PIN

// ─── JSONBin.io config — paste your values here after setup ──────────────────
const JSONBIN_BIN_ID  = "69f92ff2aaba882197700007";
const JSONBIN_API_KEY = "$2a$10$5B/vcaN0geY01AhMkqs3IeoUqSiksT9SOAIQGG9IqYX5ON5Xb/OtK";
// ─────────────────────────────────────────────────────────────────────────────

const LOCAL_KEY = "whale-tracker-cache";

function localCache(data) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); } catch {}
}
function localLoad() {
  try { const v = localStorage.getItem(LOCAL_KEY); return v ? JSON.parse(v) : null; } catch { return null; }
}
function isConfigured() {
  return !JSONBIN_BIN_ID.includes("PASTE") && !JSONBIN_API_KEY.includes("PASTE");
}

// Returns instantly from cache/seed, then syncs JSONBin in background
function loadDataInstant() {
  const cached = localLoad();
  if (cached && cached.members) return { ...cached, members: { ...seedData.members, ...cached.members } };
  return { ...seedData, members: { ...seedData.members } };
}

async function syncFromJsonBin(setData) {
  if (!isConfigured()) return;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout
    const r = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
      headers: { "X-Master-Key": JSONBIN_API_KEY, "X-Bin-Meta": "false" },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (r.ok) {
      const d = await r.json();
      if (d && d.members) {
        const merged = { ...d, members: { ...seedData.members, ...d.members } };
        localCache(merged);
        setData(merged); // update UI with fresh cloud data
      }
    }
  } catch {}
}

async function saveData(data) {
  localCache(data); // instant local save
  if (!isConfigured()) return;
  try {
    await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Master-Key": JSONBIN_API_KEY },
      body: JSON.stringify(data)
    });
  } catch {}
}

function memberTier(v) {
  return getWhaleTier(v.km || 0);
}

// ─── Whale SVG illustrations ────────────────────────────────────────────────
function WhaleGraphic({ id, width = 110 }) {
  const height = Math.round(width * 62 / 110);
  if (id === "orca") return (
    <svg viewBox="0 0 110 62" width={width} height={height} style={{display:"block"}}>
      {/* Body - black */}
      <ellipse cx="52" cy="36" rx="38" ry="17" fill="#0f172a"/>
      {/* White belly */}
      <path d="M 28 42 Q 54 57 80 44 Q 65 60 38 56 Z" fill="white"/>
      {/* White eye patch */}
      <ellipse cx="84" cy="28" rx="10" ry="7" fill="white"/>
      {/* Eye */}
      <circle cx="86" cy="28" r="2.2" fill="#0f172a"/>
      <circle cx="87" cy="27" r="0.8" fill="white"/>
      {/* Grey saddle patch */}
      <path d="M 52 21 Q 64 15 72 23 Q 63 30 52 27 Z" fill="#374151" opacity="0.65"/>
      {/* TALL dorsal fin — orca's most distinctive feature */}
      <path d="M 56 21 L 64 2 L 71 19" fill="#0f172a" stroke="#0f172a" strokeLinejoin="round"/>
      {/* Pectoral fin */}
      <path d="M 70 46 L 62 62 L 76 54 Z" fill="#0f172a"/>
      {/* Tail flukes */}
      <path d="M 14 36 L 3 26 L 14 33 L 25 26 L 14 36" fill="#0f172a"/>
      {/* Tail white */}
      <path d="M 3 26 L 14 33 L 14 36 L 6 32 Z" fill="white" opacity="0.6"/>
    </svg>
  );
  if (id === "minke") return (
    <svg viewBox="0 0 110 62" width={width} height={height} style={{display:"block"}}>
      {/* Sleek streamlined body */}
      <path d="M 92 30 Q 78 20 50 23 Q 22 24 14 30 Q 22 38 50 38 Q 78 40 92 30" fill="#1e3a5f"/>
      {/* Lighter belly */}
      <path d="M 82 30 Q 60 37 35 36 Q 22 36 16 31 Q 24 38 48 39 Q 72 40 82 32 Z" fill="#93c5fd" opacity="0.45"/>
      {/* Distinctive white shoulder/pec stripe — minke trademark */}
      <path d="M 73 24 Q 65 20 60 23 Q 64 28 72 27 Z" fill="white" opacity="0.95"/>
      {/* Small curved dorsal fin */}
      <path d="M 46 23 Q 52 14 57 22 L 52 23 Z" fill="#162d4a"/>
      {/* Pectoral fin */}
      <path d="M 70 33 L 66 46 L 75 40 Z" fill="#162d4a"/>
      {/* Pointed tail */}
      <path d="M 13 30 L 3 22 L 14 28 L 23 22 L 13 30" fill="#1e3a5f"/>
      {/* Eye */}
      <circle cx="88" cy="28" r="1.8" fill="white" opacity="0.8"/>
      <circle cx="88.5" cy="28" r="0.9" fill="#0c1c38"/>
    </svg>
  );
  if (id === "humpback") return (
    <svg viewBox="0 0 110 62" width={width} height={height} style={{display:"block"}}>
      {/* Body */}
      <path d="M 86 30 Q 70 20 44 22 Q 18 22 12 30 Q 18 40 46 42 Q 72 42 86 30" fill="#1e3a5f"/>
      {/* White throat/belly with pleats */}
      <path d="M 76 31 Q 58 40 38 40 Q 22 40 15 33 Q 22 42 44 43 Q 68 43 78 33 Z" fill="#bfdbfe" opacity="0.5"/>
      {/* Throat pleats — humpback trademark */}
      <line x1="24" y1="36" x2="32" y2="42" stroke="#1e40af" strokeWidth="0.8" opacity="0.5"/>
      <line x1="30" y1="35" x2="38" y2="41" stroke="#1e40af" strokeWidth="0.8" opacity="0.5"/>
      <line x1="36" y1="34" x2="44" y2="40" stroke="#1e40af" strokeWidth="0.8" opacity="0.5"/>
      {/* Tubercle knobs on rostrum — humpback trademark */}
      <circle cx="82" cy="26" r="2.2" fill="#162d4a"/>
      <circle cx="78" cy="23" r="1.8" fill="#162d4a"/>
      <circle cx="86" cy="24" r="1.6" fill="#162d4a"/>
      {/* Small hump dorsal */}
      <path d="M 40 22 Q 46 13 52 21 L 47 22 Z" fill="#162d4a"/>
      {/* VERY LONG pectoral fin — humpback's most distinctive feature (~1/3 body) */}
      <path d="M 62 36 L 38 62 L 52 54 L 64 58 L 62 36" fill="#16325c"/>
      {/* White on underside of pec fin */}
      <path d="M 62 36 L 42 60 L 52 54 L 62 36" fill="#bfdbfe" opacity="0.35"/>
      {/* Wide tail flukes */}
      <path d="M 12 30 L 2 21 L 13 27 L 23 21 L 12 30" fill="#1e3a5f"/>
      {/* White on tail underside */}
      <path d="M 2 21 L 13 27 L 12 30 L 5 27 Z" fill="#bfdbfe" opacity="0.5"/>
      {/* Eye */}
      <circle cx="84" cy="30" r="1.8" fill="white" opacity="0.7"/>
      <circle cx="84.5" cy="30" r="0.9" fill="#0f172a"/>
    </svg>
  );
  if (id === "sperm") return (
    <svg viewBox="0 0 110 62" width={width} height={height} style={{display:"block"}}>
      {/* MASSIVE rectangular head — sperm whale's defining feature (~40% body) */}
      <path d="M 105 24 L 64 18 L 64 42 L 105 38 Z" fill="#2d1d0a"/>
      {/* Narrower body tapers to tail */}
      <path d="M 64 22 Q 38 18 16 24 Q 10 30 16 36 Q 38 42 64 40 Z" fill="#3d2d14"/>
      {/* Lower jaw — much smaller than upper head */}
      <path d="M 105 36 L 80 38 L 82 44 L 105 41 Z" fill="#4a3820"/>
      {/* Blowhole — offset to LEFT front on top (unique to sperm whales) */}
      <ellipse cx="100" cy="18" rx="3.5" ry="2" fill="#1a0e04"/>
      {/* Spout from blowhole (angled forward-left) */}
      <path d="M 100 17 Q 96 10 98 6" fill="none" stroke="#7dd3fc" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
      {/* Wrinkle/skin texture lines on body */}
      <line x1="50" y1="20" x2="50" y2="40" stroke="#2a1a08" strokeWidth="0.8" opacity="0.6"/>
      <line x1="42" y1="21" x2="42" y2="40" stroke="#2a1a08" strokeWidth="0.8" opacity="0.6"/>
      <line x1="34" y1="22" x2="34" y2="39" stroke="#2a1a08" strokeWidth="0.8" opacity="0.6"/>
      {/* Back ridges — sperm whales have bumps not a fin */}
      <path d="M 32 20 Q 35 15 38 20" fill="none" stroke="#2a1a08" strokeWidth="2" strokeLinecap="round"/>
      <path d="M 24 22 Q 27 17 30 22" fill="none" stroke="#2a1a08" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M 18 24 Q 21 20 23 24" fill="none" stroke="#2a1a08" strokeWidth="1.4" strokeLinecap="round"/>
      {/* Pec fin */}
      <path d="M 78 38 L 72 52 L 82 45 Z" fill="#2d1d0a"/>
      {/* Wide rectangular tail flukes */}
      <path d="M 15 27 L 4 19 L 15 25 L 25 19 L 15 27" fill="#2d1d0a"/>
      {/* Eye — small, set very far back on head */}
      <circle cx="93" cy="31" r="1.8" fill="#1a0e04"/>
      <circle cx="93.5" cy="30.5" r="0.7" fill="#6b5030"/>
    </svg>
  );
  if (id === "beluga") return (
    <svg viewBox="0 0 110 62" width={width} height={height} style={{display:"block"}}>
      {/* Chubby white body */}
      <ellipse cx="52" cy="34" rx="36" ry="20" fill="#f1f5f9"/>
      {/* VERY round melon forehead — beluga's most distinctive feature */}
      <circle cx="83" cy="25" r="16" fill="#f1f5f9"/>
      {/* Visible neck crease — belugas can turn their head */}
      <path d="M 74 18 Q 72 30 74 42" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/>
      {/* NO dorsal fin — completely smooth back, slight ridge only */}
      <path d="M 32 14 Q 48 11 58 14" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round"/>
      {/* Subtle skin shading/highlights */}
      <ellipse cx="52" cy="26" rx="30" ry="10" fill="white" opacity="0.5"/>
      {/* Short rounded pectoral fin */}
      <path d="M 66 44 L 58 58 L 68 51 Q 72 55 66 44" fill="#e2e8f0"/>
      {/* Smiley mouth — belugas look like they're smiling */}
      <path d="M 93 32 Q 98 35 93 38" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Eye with friendly highlight */}
      <circle cx="89" cy="24" r="3" fill="#334155"/>
      <circle cx="90" cy="23" r="1.1" fill="white"/>
      {/* Tail flukes */}
      <path d="M 16 34 L 5 25 L 16 31 L 26 25 L 16 34" fill="#e2e8f0"/>
      {/* Forehead highlight — melon is reflective */}
      <ellipse cx="80" cy="20" rx="7" ry="5" fill="white" opacity="0.55"/>
    </svg>
  );
  if (id === "baleen") return (
    <svg viewBox="0 0 110 62" width={width} height={height} style={{display:"block"}}>
      {/* Massive arched body — right whale / bowhead style */}
      <path d="M 88 28 Q 72 14 46 16 Q 20 16 12 28 Q 14 42 40 48 Q 66 52 88 38 Z" fill="#1a3320"/>
      {/* Lighter belly */}
      <path d="M 80 34 Q 58 46 36 47 Q 20 46 14 37 Q 18 48 42 52 Q 66 54 82 40 Z" fill="#2d5a3d" opacity="0.7"/>
      {/* HIGHLY ARCHED rostrum — bowhead/right whale signature */}
      <path d="M 88 28 Q 96 22 105 26 Q 100 32 88 36 Z" fill="#1a3320"/>
      {/* Baleen plates hanging from upper jaw — the defining feature */}
      <line x1="92" y1="29" x2="90" y2="38" stroke="#0d4a1a" strokeWidth="1.2" opacity="0.9"/>
      <line x1="96" y1="28" x2="94" y2="37" stroke="#0d4a1a" strokeWidth="1.2" opacity="0.9"/>
      <line x1="100" y1="27" x2="99" y2="36" stroke="#0d4a1a" strokeWidth="1.2" opacity="0.9"/>
      <line x1="104" y1="26" x2="103" y2="35" stroke="#0d4a1a" strokeWidth="1.2" opacity="0.9"/>
      <line x1="89" y1="30" x2="87" y2="39" stroke="#0d4a1a" strokeWidth="1" opacity="0.7"/>
      {/* Callosities on head — right whale trademark rough patches */}
      <ellipse cx="99" cy="22" rx="5" ry="3" fill="#2a5a35" opacity="0.8"/>
      <ellipse cx="91" cy="19" rx="3" ry="2" fill="#2a5a35" opacity="0.7"/>
      <ellipse cx="104" cy="20" rx="3" ry="2" fill="#2a5a35" opacity="0.6"/>
      {/* Very broad rounded back */}
      <path d="M 30 16 Q 50 10 65 16" fill="none" stroke="#254d2e" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Short paddle-like pectoral fin */}
      <path d="M 68 42 L 62 56 L 72 50 Z" fill="#152a1a"/>
      {/* Very wide V-shaped tail flukes */}
      <path d="M 12 30 L 0 20 L 12 27 M 12 27 L 24 20 L 12 30" fill="#1a3320" stroke="#1a3320" strokeLinejoin="round"/>
      {/* White chin patch */}
      <ellipse cx="98" cy="36" rx="5" ry="3" fill="white" opacity="0.35"/>
      {/* Eye */}
      <circle cx="84" cy="28" r="2" fill="#0d2210"/>
      <circle cx="84.5" cy="27.5" r="0.8" fill="#3d7a4a"/>
    </svg>
  );
  return null;
}

// ─── Whale tiers by total km covered ────────────────────────────────────────
const WHALE_TIERS = [
  {
    id:"orca", label:"Killer Whale", sub:"Elite", minKm:160, maxKm:Infinity,
    color:"#06b6d4", bg:"rgba(6,182,212,0.1)", border:"rgba(6,182,212,0.35)", range:"160+ km",
    desc:"The apex predator of the ocean — and of this group. Fast, fearless, and utterly relentless. Killer Whales hunt in coordinated packs and dominate everything in their path.",
  },
  {
    id:"minke", label:"Minke Whale", sub:"Fast", minKm:130, maxKm:160,
    color:"#38bdf8", bg:"rgba(56,189,248,0.09)", border:"rgba(56,189,248,0.28)", range:"130 – 160 km",
    desc:"Agile, sleek, and deceptively quick. One of the fastest baleen whales in the ocean — they cover serious distance without making a fuss about it.",
  },
  {
    id:"humpback", label:"Humpback Whale", sub:"Solid", minKm:100, maxKm:130,
    color:"#60a5fa", bg:"rgba(96,165,250,0.09)", border:"rgba(96,165,250,0.26)", range:"100 – 130 km",
    desc:"Famous for their haunting songs and spectacular breaches. Strong, consistent long-distance migrants — putting in the work week after week.",
  },
  {
    id:"baleen", label:"Baleen Whale", sub:"Building", minKm:60, maxKm:100,
    color:"#34d399", bg:"rgba(52,211,153,0.09)", border:"rgba(52,211,153,0.26)", range:"60 – 100 km",
    desc:"The great filter feeders — patient, powerful, and built for the long haul. Baleen whales move with quiet purpose, covering ground steadily without burning out.",
  },
  {
    id:"sperm", label:"Sperm Whale", sub:"Endurance", minKm:30, maxKm:60,
    color:"#a78bfa", bg:"rgba(167,139,250,0.09)", border:"rgba(167,139,250,0.26)", range:"30 – 60 km",
    desc:"The deep divers. Largest toothed predator on Earth — built for endurance and pressure. They go further than anyone expects, diving deep where others don't dare.",
  },
  {
    id:"beluga", label:"Beluga Whale", sub:"Getting Started", minKm:0, maxKm:30,
    color:"#cbd5e1", bg:"rgba(203,213,225,0.07)", border:"rgba(203,213,225,0.22)", range:"0 – 30 km",
    desc:"The canary of the sea — social, playful, and warming up. Every legend starts somewhere. Belugas are just finding their rhythm and getting the legs (fins) under them.",
  },
]

function getWhaleTier(km) {
  if (km === null || km === undefined) return WHALE_TIERS[WHALE_TIERS.length - 1]; // default beluga
  // Sorted highest first in array, so find first tier where km >= minKm
  return WHALE_TIERS.find(t => km >= t.minKm) || WHALE_TIERS[WHALE_TIERS.length - 1];
}

function parsePace(str) {
  if (!str || !str.trim()) return null;
  str = str.trim();
  if (str.includes(":")) {
    const [rawM, rawS] = str.split(":");
    const m = parseInt(rawM, 10), s = parseInt(rawS || "0", 10);
    if (isNaN(m) || isNaN(s) || s >= 60) return null;
    const total = m * 60 + s;
    return total >= 60 && total < 1800 ? total : null;
  }
  const n = parseFloat(str);
  if (isNaN(n) || n < 1 || n > 30) return null;
  return Math.round(n * 60);
}

function formatPace(sec) {
  if (!sec || sec <= 0) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")} /km`;
}

const STAR_DATA = [
  [15,15,0.5],[35,28,0.65],[70,12,0.4],[105,22,0.6],
  [180,8,0.45],[240,18,0.55],[290,6,0.7],[318,24,0.5],
  [12,50,0.4],[48,42,0.6],[282,38,0.5],[308,55,0.65],
  [25,75,0.4],[62,68,0.55],[330,68,0.45],[275,78,0.5],
];

const ALL_PATH = Array.from({ length: 80 }, (_, i) => {
  const t = i / 79;
  // Path arcs from Antarctica (170,318) → Sydney east coast (210,103)
  return { x: 170 + t * 40 + Math.sin(t * Math.PI) * 15, y: 318 - t * 215, t };
});

const MEDALS = ["🥇","🥈","🥉"];

export default function App() {
  const [data, setData]           = useState({ members: {}, lastUpdated: null });
  const [name, setName]           = useState("");
  const [km, setKm]               = useState("");
  const [pace, setPace]           = useState("");
  const [loaded, setLoaded]       = useState(false);
  const [animated, setAnimated]   = useState(false);
  const [note, setNote]           = useState("");
  const [tab, setTab]             = useState("map");
  const [isAdmin, setIsAdmin]     = useState(false);
  const [showPin, setShowPin]     = useState(false);
  const [pinInput, setPinInput]   = useState("");
  const [pinError, setPinError]   = useState(false);
  const [newMemberName, setNewMemberName]   = useState("");
  const [newMemberTier, setNewMemberTier]   = useState("humpback");
  const [adminTab, setAdminTab]             = useState("log"); // "log" | "addmember" | "edit"
  const [editTarget, setEditTarget]         = useState("");       // member name being edited
  const [editName, setEditName]             = useState("");
  const [editKm, setEditKm]               = useState("");
  const [editPace, setEditPace]           = useState("");
  const [editTier, setEditTier]           = useState("humpback");
  const [lbMode, setLbMode]               = useState("km");      // "km" | "pace"
  const [expandedMember, setExpandedMember] = useState(null);

  useEffect(() => {
    // Load instantly from cache/seed — no waiting
    setData(loadDataInstant());
    setLoaded(true);
    setTimeout(() => setAnimated(true), 80);
    // Then sync from JSONBin in background (updates UI if cloud has newer data)
    syncFromJsonBin(setData);
  }, []);

  const members    = data.members || {};
  const memberList = Object.entries(members).sort((a, b) => (b[1].km - a[1].km) || a[0].localeCompare(b[0]));
  const lbList     = memberList.filter(([,v]) => (v.km||0) >= MIN_LB_KM);
  const totalKm    = memberList.reduce((s,[,v]) => s + (v.km||0), 0);
  const progress   = Math.min(totalKm / TOTAL_KM, 1);
  const pct        = (progress * 100).toFixed(1);
  const kmLeft     = Math.max(0, TOTAL_KM - totalKm);
  const arrived    = progress >= 1;

  const totalRuns      = memberList.reduce((s,[,v]) => s + (v.runs||0), 0);
  const numRunners     = memberList.length;
  const avgKmPerRunner = numRunners > 0 ? (totalKm / numRunners).toFixed(1) : "—";

  let mostActive = null, mostRuns = 0;
  for (const [n, v] of memberList) {
    if ((v.runs||0) > mostRuns) { mostRuns = v.runs||0; mostActive = n; }
  }

  let projectedWeeks = null;
  if (data.firstUpdated && totalKm > 0 && kmLeft > 0) {
    const msElapsed = Date.now() - new Date(data.firstUpdated).getTime();
    const weeksElapsed = msElapsed / (7 * 24 * 3600 * 1000);
    if (weeksElapsed > 0.01) {
      const kmPerWeek = totalKm / weeksElapsed;
      projectedWeeks = (kmLeft / kmPerWeek).toFixed(1);
    }
  }

  const whalePt = (() => {
    const idx = progress * 79;
    const i = Math.floor(idx);
    const frac = idx - i;
    const a = ALL_PATH[Math.min(i, 79)];
    const b = ALL_PATH[Math.min(i + 1, 79)];
    return { x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac };
  })();
  const progressPts = ALL_PATH.slice(0, Math.max(1, Math.ceil(progress * 80)));
  const whaleTx = animated ? "transform 1.6s cubic-bezier(0.25,0.1,0.25,1)" : "none";

  const handleAdd = async () => {
    const n = name.trim();
    const k = parseFloat(km);
    if (!n || isNaN(k) || k <= 0) return;
    const ex = members[n] || { km:0, runs:0, paceTotal:0, paceKm:0 };
    const parsedPace = parsePace(pace);
    const updated = {
      ...members,
      [n]: {
        km:        (ex.km||0) + k,
        runs:      (ex.runs||0) + 1,
        paceTotal: (ex.paceTotal||0) + (parsedPace ? parsedPace * k : 0),
        paceKm:    (ex.paceKm||0)    + (parsedPace ? k : 0),
      }
    };
    const newData = {
      members:      updated,
      lastUpdated:  new Date().toISOString(),
      firstUpdated: data.firstUpdated || new Date().toISOString(),
    };
    setData(newData);
    setKm(""); setPace("");
    setNote(`🐋 +${k}km for ${n}! Now a ${memberTier(updated[n]).label}`);
    setTimeout(() => setNote(""), 3200);
    await saveData(newData);
  };

  const handleReset = async () => {
    if (!confirm("Reset ALL migration data? This cannot be undone.")) return;
    const fresh = { ...seedData, members: { ...seedData.members } };
    setData(fresh);
    await saveData(fresh);
  };

  const handlePinSubmit = () => {
    if (pinInput === ADMIN_PIN) {
      setIsAdmin(true); setShowPin(false); setPinInput(""); setPinError(false);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1400);
    }
  };

  const handleAddMember = async () => {
    const n = newMemberName.trim();
    if (!n) return;
    if (members[n]) { setNote(`⚠️ ${n} is already in the squad`); setTimeout(()=>setNote(""),2500); return; }
    const tier = WHALE_TIERS.find(t => t.id === newMemberTier) || WHALE_TIERS[2];
    // Use midpoint of tier range as seed pace
    const updated = {
      ...members,
      [n]: { km:0, runs:0 }
    };
    const newData = { ...data, members: updated, lastUpdated: new Date().toISOString() };
    setData(newData);
    setNewMemberName("");
    setNote(`✅ ${n} added as ${tier.label}!`);
    setTimeout(()=>setNote(""), 3000);
    await saveData(newData);
  };

  const handleSelectEdit = (memberName) => {
    const v = members[memberName];
    if (!v) return;
    setEditTarget(memberName);
    setEditName(memberName);
    setEditKm(v.km > 0 ? String(v.km) : "");
    const avgSec = v.paceKm > 0 ? Math.round(v.paceTotal / v.paceKm) : null;
    setEditPace(avgSec ? formatPace(avgSec).replace(" /km","") : "");
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    const newName = editName.trim();
    if (!newName) return;
    const k = parseFloat(editKm) || 0;
    const parsedPace = parsePace(editPace);
    const updated = { ...members };
    const existing = updated[editTarget];
    delete updated[editTarget];
    updated[newName] = {
      ...existing,
      km: k,
      runs: existing.runs || 0,
      paceTotal: parsedPace && k > 0 ? parsedPace * k : (existing.paceTotal||0),
      paceKm:    parsedPace && k > 0 ? k               : (existing.paceKm||0),
    };
    const newData = { ...data, members: updated, lastUpdated: new Date().toISOString() };
    setData(newData);
    setEditTarget(""); setEditName(""); setEditKm(""); setEditPace("");
    setNote(`✅ ${editTarget !== newName ? editTarget+" → "+newName : newName} updated`);
    setTimeout(()=>setNote(""), 3000);
    await saveData(newData);
  };

  const handleDeleteMember = async (memberName) => {
    if (!confirm(`Remove ${memberName} from the squad?`)) return;
    const updated = { ...members };
    delete updated[memberName];
    const newData = { ...data, members: updated, lastUpdated: new Date().toISOString() };
    setData(newData);
    setEditTarget(""); setEditName(""); setEditKm(""); setEditPace("");
    setNote(`🗑️ ${memberName} removed`);
    setTimeout(()=>setNote(""), 3000);
    await saveData(newData);
  };

  if (!loaded) return (
    <div style={{ background:"#040f1c", color:"#38bdf8", height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"sans-serif", fontSize:18 }}>
      🐋 Loading...
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(180deg,#040f1c 0%,#071929 50%,#040f1c 100%)", fontFamily:"'DM Sans',system-ui,sans-serif", color:"#cfe8fa", maxWidth:480, margin:"0 auto", paddingBottom:44 }}>
      <style>{`
        @keyframes glowPulse { 0%,100%{opacity:0.85} 50%{opacity:0.35} }
        @keyframes spoutBob  { 0%,100%{opacity:0.9;transform:scaleY(1)} 50%{opacity:0.5;transform:scaleY(0.85)} }
        .wg    { animation: glowPulse 2.8s ease-in-out infinite; }
        .spout { animation: spoutBob  2.2s ease-in-out infinite; }
        input::placeholder { color: rgba(125,211,252,0.35); }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; }
        button { cursor:pointer; }
        button:hover { opacity:0.88; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ textAlign:"center", padding:"20px 16px 8px" }}>
        <h1 style={{ margin:"0 0 4px", fontSize:24, fontFamily:"'Cinzel',serif", fontWeight:700, background:"linear-gradient(135deg,#bae6fd 0%,#38bdf8 55%,#0284c7 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", lineHeight:1.3 }}>
          🐋 Whale Migration Tracker
        </h1>
        <div style={{ fontSize:11, color:"#7dd3fc", opacity:0.7 }}>
          Antarctica → Australia &nbsp;·&nbsp; {TOTAL_KM.toLocaleString()} km journey
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ display:"flex", gap:5, margin:"10px 16px 12px", background:"rgba(0,0,0,0.35)", borderRadius:11, padding:4 }}>
        {[["map","🗺️ Map"],["stats","📊 Stats"],["legend","🐋 Whales"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:"8px 4px", borderRadius:8, border:"none", background: tab===id ? "rgba(56,189,248,0.22)" : "transparent", color: tab===id ? "#38bdf8" : "rgba(224,242,254,0.4)", fontWeight: tab===id ? 800 : 500, fontSize:12, fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s" }}>
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════════ MAP TAB ══════════════════ */}
      {tab === "map" && (
        <>
          <div style={{ margin:"0 16px 12px", borderRadius:18, border:"1px solid rgba(56,189,248,0.18)", overflow:"hidden", background:"rgba(0,0,0,0.28)" }}>
            <svg viewBox="0 0 340 380" width="100%" style={{ display:"block" }}>
              <defs>
                <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0c2e50"/>
                  <stop offset="100%" stopColor="#050f1e"/>
                </linearGradient>
                <radialGradient id="wGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0"/>
                </radialGradient>
                <radialGradient id="destGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35"/>
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0"/>
                </radialGradient>
                <radialGradient id="antGlow" cx="50%" cy="0%" r="80%">
                  <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#93c5fd" stopOpacity="0"/>
                </radialGradient>
              </defs>

              <rect width="340" height="380" fill="url(#oceanGrad)"/>
              {[140,190,240,288].map(oy=>(
                <line key={oy} x1={18} y1={oy} x2={322} y2={oy} stroke="rgba(56,189,248,0.04)" strokeWidth="0.7"/>
              ))}
              {STAR_DATA.map(([sx,sy,op],i)=>(
                <circle key={i} cx={sx} cy={sy} r={i%3===0?1.2:0.8} fill="white" opacity={op}/>
              ))}

              {/* Australia — accurate outline */}
              <ellipse cx={155} cy={65} rx={72} ry={55} fill="rgba(200,169,110,0.08)"/>
              <path
                d="M 115 43 L 138 32 L 145 21 L 162 21 L 162 40 L 172 40 L 172 21 L 180 35 L 192 18 L 196 35 L 210 62 L 219 76 L 212 102 L 196 120 L 185 120 L 175 109 L 158 102 L 142 93 L 122 93 L 91 102 L 88 87 L 88 58 Z"
                fill="#c8a96e" stroke="#ddb86a" strokeWidth="1.5" strokeLinejoin="round"
              />
              <path d="M 91 102 L 88 87 L 88 58 L 115 43" fill="none" stroke="rgba(255,248,220,0.3)" strokeWidth="1"/>
              <text x="153" y="69" textAnchor="middle" fill="#fff3d0" fontSize="8.5" fontWeight="700" letterSpacing="1.5" fontFamily="DM Sans,sans-serif">AUSTRALIA</text>
              <ellipse cx={210} cy={100} rx={18} ry={9} fill="url(#destGlow)"/>
              <circle cx={210} cy={100} r={4} fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.75"/>
              <circle cx={210} cy={100} r={2} fill="#fbbf24" opacity="0.75"/>
              <text x={220} y={99} fill="#fbbf24" fontSize="7" fontWeight="700" fontFamily="DM Sans,sans-serif" opacity="0.8">MOSMAN</text>

              {/* Migration route */}
              <polyline points={ALL_PATH.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")} fill="none" stroke="rgba(56,189,248,0.18)" strokeWidth="1.5" strokeDasharray="5 4"/>
              {[0.25,0.5,0.75].map(t=>{
                const pt = ALL_PATH[Math.floor(t*79)];
                return (
                  <g key={t}>
                    <line x1={pt.x-5} y1={pt.y} x2={pt.x-14} y2={pt.y} stroke="rgba(56,189,248,0.35)" strokeWidth="1"/>
                    <text x={pt.x-16} y={pt.y+3.5} textAnchor="end" fill="rgba(56,189,248,0.45)" fontSize="7" fontFamily="DM Sans,sans-serif">{(t*TOTAL_KM).toLocaleString()} km</text>
                  </g>
                );
              })}

              {/* Progress trail */}
              {progress > 0 && (
                <polyline points={progressPts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")} fill="none" stroke="#38bdf8" strokeWidth="2.5" opacity="0.9" strokeLinecap="round" strokeLinejoin="round"/>
              )}

              {/* Whale */}
              <g transform={`translate(${whalePt.x.toFixed(2)},${whalePt.y.toFixed(2)})`} style={{ transition: whaleTx }}>
                <ellipse cx={0} cy={0} rx={24} ry={28} fill="url(#wGlow)" className="wg"/>
                <ellipse cx={0} cy={0} rx={7.5} ry={15} fill="#1565a8"/>
                <ellipse cx={1.5} cy={2.5} rx={4.5} ry={10} fill="#2d9fd8" opacity="0.5"/>
                <path d="M -7 15 L -14 25 L -1 19 L 12 25 L 7 15" fill="#1050a0"/>
                <path d="M -1 19 L -1 26" fill="none" stroke="#0c3e88" strokeWidth="1"/>
                <circle cx={4.5} cy={-7} r={2.4} fill="white"/>
                <circle cx={5} cy={-7.5} r={1.2} fill="#040f1c"/>
                <circle cx={5.4} cy={-7.9} r={0.4} fill="white"/>
                <path d="M -7.5 -1 L -18 9 L -10 5 Z" fill="#1050a0"/>
                <g className="spout">
                  <path d="M 0 -15 Q -3 -24 -1 -19 Q -4 -30 -1 -25" fill="none" stroke="#93c5fd" strokeWidth="1.6" opacity="0.9" strokeLinecap="round"/>
                  <path d="M 2 -15 Q 4 -22 3 -18" fill="none" stroke="#bae6fd" strokeWidth="1.1" opacity="0.7" strokeLinecap="round"/>
                </g>
              </g>

              {/* Antarctica */}
              <rect x={0} y={345} width={340} height={35} fill="#050f1e"/>
              <ellipse cx={170} cy={345} rx={170} ry={20} fill="url(#antGlow)"/>
              <path d="M 0 348 Q 12 332 44 328 Q 84 317 124 323 Q 162 312 170 317 Q 180 312 218 320 Q 262 314 300 326 Q 328 331 340 344 L 340 380 L 0 380 Z" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1"/>
              <path d="M 0 348 Q 12 332 44 328 Q 84 317 124 323 Q 162 312 170 317 Q 180 312 218 320 Q 262 314 300 326 Q 328 331 340 344" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8"/>
              {[[55,325],[110,320],[170,316],[230,319],[285,323]].map(([ix,iy],i)=>(
                <ellipse key={i} cx={ix} cy={iy} rx={12} ry={4} fill="rgba(255,255,255,0.18)"/>
              ))}
              <text x="170" y="361" textAnchor="middle" fill="#1e3a8a" fontSize="8.5" fontWeight="700" letterSpacing="1.5" fontFamily="DM Sans,sans-serif">ANTARCTICA</text>
              <circle cx={170} cy={319} r={4.5} fill="#0ea5e9" opacity="0.6"/>
              <circle cx={170} cy={319} r={2} fill="#e0f2fe"/>
            </svg>
          </div>

          {arrived && (
            <div style={{ margin:"0 16px 14px", background:"linear-gradient(135deg,rgba(234,179,8,0.12),rgba(234,179,8,0.04))", border:"1px solid rgba(234,179,8,0.45)", borderRadius:12, padding:"13px 16px", textAlign:"center", color:"#fbbf24", fontWeight:800, fontSize:15 }}>
              🎉 The whale has reached Australia! Migration complete! 🎉
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, margin:"0 16px 10px" }}>
            {[
              ["Total km",  `${totalKm.toLocaleString(undefined,{maximumFractionDigits:1})}`],
              ["Progress",  `${pct}%`],
              ["Remaining", `${kmLeft.toLocaleString(undefined,{maximumFractionDigits:1})} km`],
            ].map(([label,val])=>(
              <div key={label} style={{ background:"rgba(56,189,248,0.07)", border:"1px solid rgba(56,189,248,0.17)", borderRadius:10, padding:"10px 6px", textAlign:"center" }}>
                <div style={{ fontSize:9, letterSpacing:2, color:"#7dd3fc", textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:16, fontWeight:800, color:"#e0f2fe" }}>{val}</div>
              </div>
            ))}
          </div>

          <div style={{ margin:"0 16px 16px", background:"rgba(255,255,255,0.06)", borderRadius:999, height:7, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#0369a1,#38bdf8,#7dd3fc)", borderRadius:999, transition:"width 1.6s ease", boxShadow:"0 0 10px rgba(56,189,248,0.6)" }}/>
          </div>

          {/* Leaderboard on map tab */}
          <div style={{ margin:"0 16px", background:"rgba(0,0,0,0.28)", border:"1px solid rgba(56,189,248,0.17)", borderRadius:14, padding:14 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <div style={{ fontSize:10, letterSpacing:3, color:"#38bdf8", textTransform:"uppercase", fontWeight:700 }}>🏆 Leaderboard</div>
              {lbMode === "pace" && <div style={{ fontSize:10, color:"rgba(56,189,248,0.5)" }}>Min {MIN_LB_KM} km to qualify</div>}
            </div>
            {/* km / pace toggle */}
            <div style={{ display:"flex", gap:5, background:"rgba(0,0,0,0.3)", borderRadius:8, padding:3, marginBottom:10 }}>
              {[["km","🏃 Distance"],["pace","⚡ Avg Pace"]].map(([id,label])=>(
                <button key={id} onClick={()=>setLbMode(id)} style={{ flex:1, padding:"6px 4px", borderRadius:6, border:"none", background: lbMode===id?"rgba(56,189,248,0.2)":"transparent", color: lbMode===id?"#38bdf8":"rgba(224,242,254,0.38)", fontWeight: lbMode===id?800:500, fontSize:11, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", transition:"all 0.15s" }}>
                  {label}
                </button>
              ))}
            </div>
            {memberList.length === 0 ? (
              <div style={{ color:"rgba(224,242,254,0.28)", fontSize:13, textAlign:"center", padding:"18px 0" }}>No runners yet — log the first km!</div>
            ) : (() => {
              const displayList = lbMode === "pace"
                ? [...lbList].filter(([,v])=>v.paceKm>0).sort((a,b)=>(a[1].paceTotal/a[1].paceKm)-(b[1].paceTotal/b[1].paceKm))
                : memberList;
              const paceListFull = [...lbList].filter(([,v])=>v.paceKm>0).sort((a,b)=>(a[1].paceTotal/a[1].paceKm)-(b[1].paceTotal/b[1].paceKm));
              return (<>
                {displayList.map(([n,v],i)=>{
                  const share = totalKm > 0 ? ((v.km/totalKm)*100).toFixed(0) : 0;
                  const tier = memberTier(v);
                  const avgPaceSec = v.paceKm > 0 ? v.paceTotal/v.paceKm : null;
                  const isExpanded = expandedMember === n;
                  const paceRank = paceListFull.findIndex(([pn])=>pn===n);
                  return (
                    <div key={n} style={{ marginBottom:5 }}>
                      <div onClick={()=>setExpandedMember(isExpanded?null:n)} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", background: i===0?"rgba(234,179,8,0.07)":i===1?"rgba(148,163,184,0.06)":i===2?"rgba(180,83,9,0.06)":"rgba(255,255,255,0.03)", border:`1px solid ${i===0?"rgba(234,179,8,0.25)":i===1?"rgba(148,163,184,0.18)":i===2?"rgba(180,83,9,0.18)":"rgba(255,255,255,0.05)"}`, borderRadius: isExpanded?"10px 10px 0 0":10, cursor:"pointer" }}>
                        <div style={{ width:20, textAlign:"center", fontSize: i<3?14:11, flexShrink:0 }}>{MEDALS[i]||`#${i+1}`}</div>
                        {tier
                          ? <div style={{ flexShrink:0, opacity:0.9 }}><WhaleGraphic id={tier.id} width={46}/></div>
                          : <div style={{ width:46, flexShrink:0 }}/>
                        }
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:700, fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n}</div>
                          {tier && <div style={{ fontSize:9.5, color:tier.color, marginTop:1 }}>{tier.label}</div>}
                        </div>
                        <div style={{ textAlign:"right", flexShrink:0 }}>
                          <div style={{ fontWeight:800, fontSize:14, color:"#38bdf8" }}>{v.km.toLocaleString(undefined,{maximumFractionDigits:1})} km</div>
                          {avgPaceSec && <div style={{ fontSize:9, color:"rgba(224,242,254,0.4)", marginTop:1 }}>{formatPace(Math.round(avgPaceSec))}</div>}
                        </div>
                        <div style={{ fontSize:10, color:"rgba(224,242,254,0.28)", flexShrink:0 }}>{isExpanded?"▲":"▼"}</div>
                      </div>
                      {isExpanded && (
                        <div style={{ background:"rgba(56,189,248,0.05)", border:`1px solid ${tier?.border||"rgba(56,189,248,0.15)"}`, borderTop:"none", borderRadius:"0 0 10px 10px", padding:"11px 13px" }}>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7, marginBottom:9 }}>
                            {[
                              ["Total km", `${v.km.toFixed(1)} km`],
                              ["Runs",     `${v.runs||0}`],
                              ["Avg pace", avgPaceSec ? formatPace(Math.round(avgPaceSec)) : "—"],
                              ["Group %",  `${share}%`],
                              ["Pace rank",avgPaceSec && paceRank>=0 ? `#${paceRank+1}` : "—"],
                              ["Species",  tier?.label||"—"],
                            ].map(([lbl,val])=>(
                              <div key={lbl} style={{ background:"rgba(0,0,0,0.28)", borderRadius:7, padding:"7px 5px", textAlign:"center" }}>
                                <div style={{ fontSize:8, color:"rgba(125,211,252,0.5)", textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>{lbl}</div>
                                <div style={{ fontSize:11, fontWeight:800, color:"#e0f2fe" }}>{val}</div>
                              </div>
                            ))}
                          </div>
                          {tier && (
                            <div style={{ display:"flex", alignItems:"center", gap:9, background:tier.bg, border:`1px solid ${tier.border}`, borderRadius:8, padding:"8px 11px" }}>
                              <WhaleGraphic id={tier.id} width={58}/>
                              <div>
                                <div style={{ fontWeight:700, fontSize:12, color:tier.color }}>{tier.label}</div>
                                <div style={{ fontSize:10, color:"rgba(224,242,254,0.45)", marginTop:2, lineHeight:1.5 }}>{tier.desc}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {lbMode==="pace" && paceListFull.length < lbList.length && (
                  <div style={{ textAlign:"center", fontSize:10, color:"rgba(224,242,254,0.28)", marginTop:6 }}>
                    {lbList.length - paceListFull.length} qualified runner{lbList.length-paceListFull.length!==1?"s":""} without pace data not shown
                  </div>
                )}
                {/* Runners not yet qualified — only show in pace mode */}
                {lbMode === "pace" && memberList.filter(([,v])=>(v.km||0)<MIN_LB_KM).length > 0 && (
                  <div style={{ marginTop:10, paddingTop:9, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize:9, color:"rgba(224,242,254,0.25)", letterSpacing:2, textTransform:"uppercase", marginBottom:7 }}>Working towards {MIN_LB_KM} km</div>
                    {memberList.filter(([,v])=>(v.km||0)<MIN_LB_KM).map(([n,v])=>{
                      const tier = memberTier(v);
                      const needed = MIN_LB_KM - (v.km||0);
                      const pct35 = Math.min(100, ((v.km||0)/MIN_LB_KM*100)).toFixed(0);
                      return (
                        <div key={n} style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 8px", marginBottom:3, background:"rgba(255,255,255,0.02)", borderRadius:8, opacity:0.65 }}>
                          {tier && <div style={{ flexShrink:0 }}><WhaleGraphic id={tier.id} width={36}/></div>}
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontWeight:600, fontSize:12 }}>{n}</div>
                            <div style={{ height:3, background:"rgba(255,255,255,0.06)", borderRadius:999, marginTop:4, overflow:"hidden" }}>
                              <div style={{ width:`${pct35}%`, height:"100%", background:"rgba(56,189,248,0.4)", borderRadius:999 }}/>
                            </div>
                          </div>
                          <div style={{ fontSize:11, color:"rgba(224,242,254,0.35)", flexShrink:0 }}>{v.km.toFixed(1)} km</div>
                          <div style={{ fontSize:10, color:"rgba(224,242,254,0.22)", flexShrink:0 }}>-{needed.toFixed(1)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>);
            })()}
          </div>
        </>
      )}

      {/* ══════════════════ STATS TAB ══════════════════ */}
      {tab === "stats" && (
        <div style={{ margin:"0 16px" }}>
          {/* Days remaining */}
          {(() => {
            const now = new Date();
            const daysLeft = Math.max(0, Math.ceil((CUTOFF_DATE - now) / (1000*60*60*24)));
            const pct = Math.min(100, ((TOTAL_KM - kmLeft) / TOTAL_KM * 100)).toFixed(1);
            const isOver = now > CUTOFF_DATE;
            return (
              <div style={{ background: isOver ? "rgba(239,68,68,0.08)" : "rgba(56,189,248,0.07)", border:`1px solid ${isOver ? "rgba(239,68,68,0.3)" : "rgba(56,189,248,0.2)"}`, borderRadius:12, padding:"14px 16px", marginBottom:12, textAlign:"center" }}>
                <div style={{ fontSize:10, letterSpacing:2, color: isOver ? "#fca5a5" : "#7dd3fc", textTransform:"uppercase", fontWeight:700, marginBottom:6 }}>
                  {isOver ? "⛔ Challenge Ended" : "⏳ Challenge Ends Aug 15, 2026"}
                </div>
                <div style={{ fontSize:28, fontWeight:800, color: isOver ? "#fca5a5" : "#38bdf8" }}>
                  {isOver ? "Done!" : `${daysLeft} days left`}
                </div>
                {!isOver && <div style={{ fontSize:11, color:"rgba(224,242,254,0.4)", marginTop:4 }}>{pct}% of journey complete</div>}
              </div>
            );
          })()}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:12 }}>
            {[
              ["🏃 Runners",          numRunners],
              ["📍 Total runs",        totalRuns],
              ["📏 Avg km / runner",   numRunners > 0 ? `${avgKmPerRunner} km` : "—"],
              ["🏆 Most km",           memberList[0] ? `${memberList[0][0].split(" ")[0]} (${memberList[0][1].km.toFixed(1)}km)` : "—"],
              ["🔥 Most active",       mostActive ? `${mostActive.split(" ")[0]} (${mostRuns} runs)` : "—"],
              ["🐋 Killer Whales",     memberList.filter(([,v])=>memberTier(v)?.id==="orca").length],
              ["🐋 Minke Whales",      memberList.filter(([,v])=>memberTier(v)?.id==="minke").length],
              ["🐋 Humpbacks",         memberList.filter(([,v])=>memberTier(v)?.id==="humpback").length],
            ].map(([label,val])=>(
              <div key={label} style={{ background:"rgba(56,189,248,0.07)", border:"1px solid rgba(56,189,248,0.15)", borderRadius:12, padding:"13px 12px" }}>
                <div style={{ fontSize:11, color:"rgba(125,211,252,0.55)", marginBottom:6 }}>{label}</div>
                <div style={{ fontSize:17, fontWeight:800, color:"#e0f2fe" }}>{val}</div>
              </div>
            ))}
          </div>

          {projectedWeeks && (
            <div style={{ background:"rgba(56,189,248,0.06)", border:"1px solid rgba(56,189,248,0.2)", borderRadius:12, padding:"12px 16px", marginBottom:12, textAlign:"center" }}>
              <div style={{ fontSize:10, letterSpacing:2, color:"#7dd3fc", textTransform:"uppercase", fontWeight:700, marginBottom:5 }}>⏱ Projected arrival</div>
              <div style={{ fontSize:22, fontWeight:800, color:"#38bdf8" }}>{projectedWeeks} weeks</div>
              <div style={{ fontSize:11, color:"rgba(224,242,254,0.4)", marginTop:3 }}>
                at current rate of {(totalKm / Math.max((Date.now() - new Date(data.firstUpdated).getTime())/(7*24*3600*1000),0.01)).toFixed(0)} km/week
              </div>
            </div>
          )}

          <div style={{ background:"rgba(0,0,0,0.25)", border:"1px solid rgba(56,189,248,0.15)", borderRadius:14, padding:14 }}>
            <div style={{ fontSize:10, letterSpacing:3, color:"#38bdf8", textTransform:"uppercase", fontWeight:700, marginBottom:12 }}>Full Standings</div>
            {memberList.length === 0 ? (
              <div style={{ color:"rgba(224,242,254,0.28)", fontSize:13, textAlign:"center", padding:"18px 0" }}>No runners yet</div>
            ) : memberList.map(([n,v],i)=>{
              const tier = memberTier(v);
              return (
                <div key={n} style={{ padding:"10px 12px", marginBottom:7, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize: i<3?14:12, flexShrink:0 }}>{MEDALS[i]||`#${i+1}`}</span>
                    {tier
                      ? <div style={{ flexShrink:0, opacity:0.9 }}><WhaleGraphic id={tier.id} width={52}/></div>
                      : <div style={{ width:52, flexShrink:0 }}/>
                    }
                    <span style={{ flex:1, fontWeight:700, fontSize:14 }}>{n}</span>
                    <span style={{ fontWeight:800, color:"#38bdf8", fontSize:15 }}>{v.km.toLocaleString(undefined,{maximumFractionDigits:1})} km</span>
                  </div>
                  <div style={{ display:"flex", gap:14, marginTop:5, paddingLeft:26, flexWrap:"wrap" }}>
                    <span style={{ fontSize:11, color:"rgba(224,242,254,0.4)" }}>{v.runs||0} run{(v.runs||0)!==1?"s":""}</span>
                    {tier && <span style={{ fontSize:11, color: tier.color }}>{tier.label} · {tier.range}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════ LEGEND TAB ══════════════════ */}
      {tab === "legend" && (
        <div style={{ margin:"0 16px" }}>
          <div style={{ fontSize:12, color:"rgba(224,242,254,0.45)", textAlign:"center", marginBottom:16, lineHeight:1.7 }}>
            Your whale species is based on your<br/>average pace across all logged runs
          </div>
          {WHALE_TIERS.map(t=>{
            const runners = memberList.filter(([,v])=>{
              return memberTier(v)?.id === t.id;
            });
            return (
              <div key={t.id} style={{ marginBottom:11, background:t.bg, border:`1px solid ${t.border}`, borderRadius:14, overflow:"hidden" }}>
                {/* Top row: graphic + name/range */}
                <div style={{ display:"flex", alignItems:"center", gap:0 }}>
                  {/* SVG graphic panel */}
                  <div style={{ flexShrink:0, padding:"10px 6px 4px 10px", display:"flex", alignItems:"center" }}>
                    <WhaleGraphic id={t.id}/>
                  </div>
                  {/* Name + pace */}
                  <div style={{ flex:1, padding:"14px 14px 10px 4px" }}>
                    <div style={{ fontWeight:800, fontSize:15, color:t.color, lineHeight:1.2 }}>{t.label}</div>
                    <div style={{ fontSize:10, letterSpacing:1.5, textTransform:"uppercase", color:t.color, opacity:0.65, marginTop:3 }}>{t.sub}</div>
                    <div style={{ display:"inline-block", marginTop:6, background:"rgba(0,0,0,0.25)", border:`1px solid ${t.border}`, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700, color:t.color, letterSpacing:0.5 }}>
                      {t.range}
                    </div>
                  </div>
                </div>
                {/* Description */}
                <div style={{ padding:"0 14px 12px 14px", fontSize:12, color:"rgba(224,242,254,0.62)", lineHeight:1.65 }}>
                  {t.desc}
                </div>
                {/* Members in this tier */}
                {runners.length > 0 && (
                  <div style={{ borderTop:`1px solid ${t.border}`, padding:"8px 14px", display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ fontSize:10, color:t.color, fontWeight:700, letterSpacing:1, textTransform:"uppercase", flexShrink:0 }}>Your pod:</div>
                    <div style={{ fontSize:12, color:"rgba(224,242,254,0.75)", flex:1 }}>{runners.map(([n])=>n).join(", ")}</div>
                    <div style={{ fontSize:18, fontWeight:800, color:t.color, flexShrink:0 }}>{runners.length}</div>
                  </div>
                )}
              </div>
            );
          })}
          <div style={{ marginTop:8, fontSize:11, color:"rgba(224,242,254,0.25)", textAlign:"center", lineHeight:1.7, paddingBottom:4 }}>
            Tier assigned once pace has been recorded for a runner
          </div>
        </div>
      )}

      {/* ══════════════════ ADMIN PANEL ══════════════════ */}
      {!isAdmin ? (
        /* ── Locked state ── */
        <div style={{ textAlign:"center", margin:"18px 16px 4px" }}>
          {!showPin ? (
            <button
              onClick={()=>setShowPin(true)}
              style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(224,242,254,0.35)", borderRadius:8, padding:"7px 16px", fontSize:11, fontFamily:"'DM Sans',sans-serif", letterSpacing:1 }}
            >
              🔒 Admin
            </button>
          ) : (
            <div style={{ display:"inline-flex", flexDirection:"column", alignItems:"center", gap:8, background:"rgba(0,0,0,0.35)", border:"1px solid rgba(56,189,248,0.2)", borderRadius:12, padding:"14px 18px" }}>
              <div style={{ fontSize:11, color:"rgba(224,242,254,0.5)", letterSpacing:1 }}>Enter PIN</div>
              <div style={{ display:"flex", gap:8 }}>
                <input
                  type="password" value={pinInput}
                  onChange={e=>setPinInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handlePinSubmit()}
                  maxLength={8}
                  style={{ width:90, background:"rgba(0,0,0,0.5)", border:`1px solid ${pinError?"rgba(239,68,68,0.6)":"rgba(56,189,248,0.3)"}`, borderRadius:7, padding:"8px 12px", color:"#e0f2fe", fontSize:16, outline:"none", fontFamily:"'DM Sans',sans-serif", textAlign:"center", letterSpacing:4, transition:"border-color 0.2s" }}
                  autoFocus
                />
                <button
                  onClick={handlePinSubmit}
                  style={{ background:"rgba(56,189,248,0.15)", border:"1px solid rgba(56,189,248,0.3)", color:"#38bdf8", borderRadius:7, padding:"8px 14px", fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight:700 }}
                >
                  →
                </button>
              </div>
              {pinError && <div style={{ fontSize:11, color:"rgba(239,68,68,0.8)" }}>Incorrect PIN</div>}
              <button onClick={()=>{setShowPin(false);setPinInput("");}} style={{ background:"none", border:"none", color:"rgba(224,242,254,0.25)", fontSize:11, fontFamily:"'DM Sans',sans-serif" }}>cancel</button>
            </div>
          )}
        </div>
      ) : (
        /* ── Admin panel ── */
        <div style={{ margin:"16px 16px 10px", background:"rgba(14,165,233,0.06)", border:"1px solid rgba(56,189,248,0.22)", borderRadius:14, padding:14 }}>
          {/* ── Admin header ── */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ fontSize:10, letterSpacing:3, color:"#38bdf8", textTransform:"uppercase", fontWeight:700 }}>🔓 Admin</div>
            <button onClick={()=>setIsAdmin(false)} style={{ background:"none", border:"none", color:"rgba(224,242,254,0.25)", fontSize:11, fontFamily:"'DM Sans',sans-serif" }}>🔒 lock</button>
          </div>

          {/* ── Setup warning if JSONBin not configured ── */}
          {!isConfigured() && (
            <div style={{ background:"rgba(234,179,8,0.1)", border:"1px solid rgba(234,179,8,0.4)", borderRadius:9, padding:"10px 13px", marginBottom:12, fontSize:12, color:"#fcd34d", lineHeight:1.6 }}>
              ⚠️ <strong>Cross-device sync not set up.</strong> Data only saves on this device. See the setup guide to fix this.
            </div>
          )}

          {/* ── Admin sub-tabs ── */}
          <div style={{ display:"flex", gap:5, background:"rgba(0,0,0,0.3)", borderRadius:9, padding:3, marginBottom:14 }}>
            {[["log","📍 Log a Run"],["addmember","➕ Add Member"],["edit","✏️ Edit"]].map(([id,label])=>(
              <button key={id} onClick={()=>setAdminTab(id)} style={{ flex:1, padding:"7px 4px", borderRadius:7, border:"none", background: adminTab===id ? "rgba(56,189,248,0.2)" : "transparent", color: adminTab===id ? "#38bdf8" : "rgba(224,242,254,0.38)", fontWeight: adminTab===id ? 800 : 500, fontSize:12, fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}>
                {label}
              </button>
            ))}
          </div>

          {/* ══ LOG A RUN ══ */}
          {adminTab === "log" && (<>

            <div style={{ display:"flex", gap:7, marginBottom:8 }}>
              <select value={name} onChange={e=>setName(e.target.value)}
                style={{ flex:2, background:"rgba(0,0,0,0.7)", border:"1px solid rgba(56,189,248,0.25)", borderRadius:8, padding:"9px 12px", color: name ? "#e0f2fe" : "rgba(125,211,252,0.35)", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", minWidth:0, appearance:"none", WebkitAppearance:"none", cursor:"pointer" }}
              >
                <option value="" disabled>Select runner…</option>
                {memberList.map(([n])=>(<option key={n} value={n} style={{background:"#071929",color:"#e0f2fe"}}>{n}</option>))}
              </select>
              <input value={km} onChange={e=>setKm(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAdd()}
                placeholder="km" type="number" min="0" step="0.1"
                style={{ width:60, background:"rgba(0,0,0,0.45)", border:"1px solid rgba(56,189,248,0.25)", borderRadius:8, padding:"9px 10px", color:"#e0f2fe", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif" }}
              />
            </div>
            <div style={{ display:"flex", gap:7 }}>
              <input value={pace} onChange={e=>setPace(e.target.value)} placeholder="Pace e.g. 5:30  (optional)"
                style={{ flex:1, background:"rgba(0,0,0,0.45)", border:"1px solid rgba(56,189,248,0.25)", borderRadius:8, padding:"9px 12px", color:"#e0f2fe", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", minWidth:0 }}
              />
              <button onClick={handleAdd}
                style={{ background:"linear-gradient(135deg,#0284c7,#38bdf8)", border:"none", borderRadius:8, padding:"9px 18px", color:"white", fontWeight:800, fontSize:13, fontFamily:"'DM Sans',sans-serif", flexShrink:0 }}
              >+ ADD</button>
            </div>
          </>)}

          {/* ══ ADD MEMBER ══ */}
          {adminTab === "addmember" && (<>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, color:"rgba(224,242,254,0.45)", marginBottom:8 }}>Name</div>
              <input value={newMemberName} onChange={e=>setNewMemberName(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleAddMember()}
                placeholder="e.g. Smithy"
                style={{ width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,0.45)", border:"1px solid rgba(56,189,248,0.25)", borderRadius:8, padding:"10px 12px", color:"#e0f2fe", fontSize:14, outline:"none", fontFamily:"'DM Sans',sans-serif" }}
              />
            </div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, color:"rgba(224,242,254,0.45)", marginBottom:8 }}>Starting category</div>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {WHALE_TIERS.map(t=>(
                  <button key={t.id} onClick={()=>setNewMemberTier(t.id)}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, border:`1px solid ${newMemberTier===t.id ? t.border : "rgba(255,255,255,0.07)"}`, background: newMemberTier===t.id ? t.bg : "rgba(255,255,255,0.02)", cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}
                  >
                    <div style={{ flexShrink:0 }}><WhaleGraphic id={t.id} width={52}/></div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:13, color: newMemberTier===t.id ? t.color : "rgba(224,242,254,0.65)" }}>{t.label}</div>
                      <div style={{ fontSize:11, color:"rgba(224,242,254,0.35)", marginTop:1 }}>{t.range}</div>
                    </div>
                    <div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${newMemberTier===t.id ? t.color : "rgba(255,255,255,0.15)"}`, background: newMemberTier===t.id ? t.color : "transparent", flexShrink:0, transition:"all 0.15s" }}/>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleAddMember}
              style={{ width:"100%", background:"linear-gradient(135deg,#0284c7,#38bdf8)", border:"none", borderRadius:8, padding:"11px", color:"white", fontWeight:800, fontSize:14, fontFamily:"'DM Sans',sans-serif", cursor:"pointer" }}
            >
              ➕ Add to Squad
            </button>
          </>)}

          {/* ══ EDIT MEMBER ══ */}
          {adminTab === "edit" && (<>
            {/* Member picker */}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, color:"rgba(224,242,254,0.45)", marginBottom:8 }}>Select member to edit</div>
              <div style={{ display:"flex", flexDirection:"column", gap:5, maxHeight:200, overflowY:"auto" }}>
                {memberList.map(([n, v]) => {
                  const tier = memberTier(v);
                  return (
                    <button key={n} onClick={()=>handleSelectEdit(n)}
                      style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:9, border:`1px solid ${editTarget===n ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.07)"}`, background: editTarget===n ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.02)", cursor:"pointer", textAlign:"left" }}
                    >
                      {tier && <div style={{flexShrink:0}}><WhaleGraphic id={tier.id} width={38}/></div>}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, fontSize:13, color: editTarget===n ? "#38bdf8" : "rgba(224,242,254,0.8)" }}>{n}</div>
                        <div style={{ fontSize:10, color:"rgba(224,242,254,0.35)" }}>{v.km.toFixed(1)} km · {v.runs||0} run{(v.runs||0)!==1?"s":""}</div>
                      </div>
                      {editTarget===n && <div style={{color:"#38bdf8",fontSize:12}}>✎</div>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Edit form */}
            {editTarget && (
              <div style={{ background:"rgba(56,189,248,0.05)", border:"1px solid rgba(56,189,248,0.18)", borderRadius:11, padding:12 }}>
                <div style={{ fontSize:11, color:"#38bdf8", fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Editing: {editTarget}</div>

                <div style={{ marginBottom:8 }}>
                  <div style={{ fontSize:11, color:"rgba(224,242,254,0.4)", marginBottom:4 }}>Name</div>
                  <input value={editName} onChange={e=>setEditName(e.target.value)}
                    style={{ width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,0.4)", border:"1px solid rgba(56,189,248,0.25)", borderRadius:7, padding:"8px 11px", color:"#e0f2fe", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif" }}
                  />
                </div>

                <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, color:"rgba(224,242,254,0.4)", marginBottom:4 }}>Total km</div>
                    <input value={editKm} onChange={e=>setEditKm(e.target.value)} type="number" min="0" step="0.1"
                      style={{ width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,0.4)", border:"1px solid rgba(56,189,248,0.25)", borderRadius:7, padding:"8px 11px", color:"#e0f2fe", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif" }}
                    />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, color:"rgba(224,242,254,0.4)", marginBottom:4 }}>Avg pace</div>
                    <input value={editPace} onChange={e=>setEditPace(e.target.value)} placeholder="e.g. 5:30"
                      style={{ width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,0.4)", border:"1px solid rgba(56,189,248,0.25)", borderRadius:7, padding:"8px 11px", color:"#e0f2fe", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif" }}
                    />
                  </div>
                </div>

                {/* Category is now auto-calculated from km — no manual override needed */}
                {(() => {
                  const previewKm = parseFloat(editKm) || 0;
                  const previewTier = getWhaleTier(previewKm);
                  return (
                    <div style={{ marginBottom:12, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:9, padding:"10px 12px" }}>
                      <div style={{ fontSize:11, color:"rgba(224,242,254,0.4)", marginBottom:6 }}>Category (auto from km)</div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <WhaleGraphic id={previewTier.id} width={42}/>
                        <div>
                          <div style={{ fontWeight:700, fontSize:13, color:previewTier.color }}>{previewTier.label}</div>
                          <div style={{ fontSize:11, color:"rgba(224,242,254,0.35)" }}>{previewTier.range}</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={handleSaveEdit}
                    style={{ flex:1, background:"linear-gradient(135deg,#0284c7,#38bdf8)", border:"none", borderRadius:8, padding:"10px", color:"white", fontWeight:800, fontSize:13, fontFamily:"'DM Sans',sans-serif", cursor:"pointer" }}
                  >Save Changes</button>
                  <button onClick={()=>handleDeleteMember(editTarget)}
                    style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"10px 14px", color:"rgba(239,68,68,0.8)", fontWeight:700, fontSize:13, fontFamily:"'DM Sans',sans-serif", cursor:"pointer" }}
                  >🗑️</button>
                </div>
              </div>
            )}
          </>)}

          {note && (
            <div style={{ marginTop:10, background: note.startsWith("✅") ? "rgba(34,197,94,0.1)" : note.startsWith("⚠️") ? "rgba(234,179,8,0.1)" : "rgba(56,189,248,0.12)", border:`1px solid ${note.startsWith("✅") ? "rgba(34,197,94,0.25)" : note.startsWith("⚠️") ? "rgba(234,179,8,0.25)" : "rgba(56,189,248,0.22)"}`, borderRadius:8, padding:"8px 12px", fontSize:12, color: note.startsWith("✅") ? "#86efac" : note.startsWith("⚠️") ? "#fcd34d" : "#7dd3fc", textAlign:"center", lineHeight:1.5 }}>
              {note}
            </div>
          )}

          <div style={{ marginTop:12, paddingTop:10, borderTop:"1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ marginBottom:8, background:"rgba(56,189,248,0.06)", border:"1px solid rgba(56,189,248,0.18)", borderRadius:9, padding:"10px 12px" }}>
              <div style={{ fontSize:10, color:"#7dd3fc", letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:6 }}>📋 Export Data</div>
              <div style={{ fontSize:11, color:"rgba(224,242,254,0.5)", marginBottom:8, lineHeight:1.5 }}>Backup: copy this JSON and paste into <strong style={{color:"rgba(224,242,254,0.75)"}}>src/data.json</strong> on GitHub as a backup</div>
              <button onClick={()=>{
                const json = JSON.stringify(data, null, 2);
                navigator.clipboard.writeText(json).then(()=>{
                  setNote("📋 Data copied! Paste into src/data.json on GitHub");
                  setTimeout(()=>setNote(""),4000);
                });
              }} style={{ width:"100%", background:"rgba(56,189,248,0.15)", border:"1px solid rgba(56,189,248,0.3)", color:"#38bdf8", borderRadius:7, padding:"8px", fontSize:12, fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor:"pointer" }}>
                Copy JSON to Clipboard
              </button>
            </div>
            <div style={{ textAlign:"center" }}>
              <button onClick={handleReset} style={{ background:"transparent", border:"1px solid rgba(239,68,68,0.22)", color:"rgba(239,68,68,0.45)", borderRadius:6, padding:"5px 14px", fontSize:11, fontFamily:"'DM Sans',sans-serif" }}>
                Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {data.lastUpdated && (
        <div style={{ textAlign:"center", fontSize:10, color:"rgba(224,242,254,0.18)", margin:"8px 0 4px" }}>
          Last updated {new Date(data.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
}
