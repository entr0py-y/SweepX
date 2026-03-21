/* ── SweepX Data Layer ── */
const S = {
  user: null, screen: 'auth', prev: null,
  users: [], reports: [], missions: [], proofs: [], log: [],
  detailId: null, filter: 'all'
};

const uid = () => Math.random().toString(36).slice(2,9)+Date.now().toString(36);
const now = () => new Date().toISOString();
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ── Human-readable timestamps ── */
function timeAgo(iso) {
  const d = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(d/1000);
  if(sec < 60) return 'Just now';
  const min = Math.floor(sec/60);
  if(min < 60) return min + ' min ago';
  const hr = Math.floor(min/60);
  if(hr < 24) return hr + ' hr ago';
  const dy = Math.floor(hr/24);
  if(dy < 7) return dy + ' days ago';
  const dt = new Date(iso);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return dt.getDate() + ' ' + months[dt.getMonth()];
}

function initials(n){ return n.split(/[\s_]+/).map(w=>w[0]).join('').toUpperCase().slice(0,2); }
function acColor(n){ const c=['#2D5A1B','#1B3A5A','#3A1B5A','#5A3A1B','#1B5A3A','#5A1B2D']; let h=0; for(let i=0;i<n.length;i++) h=(h<<5)-h+n.charCodeAt(i); return c[Math.abs(h)%c.length]; }

/* ── Persistence ── */
function persist(){
  try{
    localStorage.setItem('sx_users', JSON.stringify(S.users));
    localStorage.setItem('sx_reports', JSON.stringify(S.reports));
    localStorage.setItem('sx_missions', JSON.stringify(S.missions));
    localStorage.setItem('sx_proofs', JSON.stringify(S.proofs));
    localStorage.setItem('sx_log', JSON.stringify(S.log));
  } catch(e){}
}

function loadData(){
  try{
    S.users    = JSON.parse(localStorage.getItem('sx_users')||'[]');
    S.reports  = JSON.parse(localStorage.getItem('sx_reports')||'[]');
    S.missions = JSON.parse(localStorage.getItem('sx_missions')||'[]');
    S.proofs   = JSON.parse(localStorage.getItem('sx_proofs')||'[]');
    S.log      = JSON.parse(localStorage.getItem('sx_log')||'[]');
  } catch(e){ S.users=[]; S.reports=[]; S.missions=[]; S.proofs=[]; S.log=[]; }
}

/* ── Session tokens ── */
function saveSession(user){
  const sess = {
    token: uid(),
    userId: user.id,
    username: user.username,
    expiresAt: Date.now() + 7*24*60*60*1000
  };
  localStorage.setItem('sx_sess', JSON.stringify(sess));
}
function loadSession(){
  try{
    const raw = localStorage.getItem('sx_sess');
    if(!raw) return null;
    const sess = JSON.parse(raw);
    if(!sess.token || !sess.userId || !sess.expiresAt) return null;
    if(Date.now() > sess.expiresAt){ clearSession(); return null; }
    const user = S.users.find(u=>u.id===sess.userId);
    if(!user){ clearSession(); return null; }
    return user;
  } catch(e){ clearSession(); return null; }
}
function clearSession(){
  localStorage.removeItem('sx_sess');
  S.user = null;
}

/* ── Seed Data ── */
function seedDemo(){
  if(S.users.length) return;
  const demo = [
    {id:uid(),username:'kai_cleans',  email:'kai@demo.com',    password:'cleanit1', points:1240,level:3,streak:12,missionsCompleted:8,reportsSubmitted:6, createdAt:new Date(Date.now()-864e5*45).toISOString()},
    {id:uid(),username:'priya_eco',   email:'priya@demo.com',  password:'greenday2',points:890, level:2,streak:7, missionsCompleted:5,reportsSubmitted:4, createdAt:new Date(Date.now()-864e5*30).toISOString()},
    {id:uid(),username:'tnguyen',     email:'tnguyen@demo.com',password:'sweep123', points:640, level:2,streak:3, missionsCompleted:4,reportsSubmitted:3, createdAt:new Date(Date.now()-864e5*20).toISOString()},
    {id:uid(),username:'marcus_w',    email:'marcus@demo.com', password:'london99', points:310, level:1,streak:1, missionsCompleted:2,reportsSubmitted:2, createdAt:new Date(Date.now()-864e5*10).toISOString()},
    {id:uid(),username:'zeynep_k',    email:'zeynep@demo.com', password:'zemission1',points:150,level:1,streak:0, missionsCompleted:1,reportsSubmitted:1, createdAt:new Date(Date.now()-864e5*5).toISOString()},
  ];
  S.users = demo;

  const seedMissions = [
    { location: 'Sector 17 Park, near the east gate',                status:'open',        ago: 14*60*1000,    distance:'0.4 km', creatorIdx:0, desc:'Plastic bags and water bottles scattered near the park bench. Pedestrians walking around it.' },
    { location: 'MG Road footpath, outside Metro exit 3',            status:'in-progress', ago: 3600*1000,     distance:'1.1 km', creatorIdx:1, desc:'Mixed waste including food containers and packaging. Blocking half the footpath.', acceptorIdx:2 },
    { location: 'Lajpat Nagar market, behind the vegetable stalls',  status:'approved',    ago: 3*3600*1000,   distance:'2.3 km', creatorIdx:2, desc:'Old crates, vegetable scraps, and plastic wrapping piled up near the drain.' },
    { location: 'Nehru Place parking lot B, northwest corner',        status:'open',        ago: 28*60*1000,    distance:'0.7 km', creatorIdx:3, desc:'Somebody dumped a broken office chair and paper waste in the lot.' },
    { location: 'DLF Phase 2 roadside, near the roundabout',          status:'rejected',    ago: 5*3600*1000,   distance:'3.1 km', creatorIdx:4, desc:'Construction debris — bricks and sand bags spilling into the road.' },
    { location: 'Saket metro station bus stand',                      status:'open',        ago: 2*60*1000,     distance:'0.2 km', creatorIdx:0, desc:'Fast-food wrappers and cups spreading around the bus shelter.' },
  ];

  seedMissions.forEach((sm, i) => {
    const cr = demo[sm.creatorIdx];
    const rId = uid(), mId = uid();
    const createdAt = new Date(Date.now() - sm.ago).toISOString();
    S.reports.push({
      id: rId, imageUrl: null, location: sm.location, lat: null, lng: null,
      description: sm.desc, distance: sm.distance,
      createdBy: cr.id, createdAt
    });
    const mission = {
      id: mId, reportId: rId, status: sm.status,
      acceptedBy: sm.acceptorIdx!=null ? demo[sm.acceptorIdx].id : null,
      createdAt, completedAt: sm.status==='approved' ? new Date(Date.now() - sm.ago + 60*60*1000).toISOString() : null
    };
    S.missions.push(mission);
  });
  persist();
}

function hydrate(m){
  const r = S.reports.find(x=>x.id===m.reportId)||{};
  const cr = S.users.find(u=>u.id===r.createdBy)||{};
  const ac = m.acceptedBy ? S.users.find(u=>u.id===m.acceptedBy)||{} : null;
  return {...m,report:{...r, distance: r.distance||null},creator:cr,acceptor:ac};
}

/* ── Validation helpers ── */
const V = {
  email(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); },
  username(v){
    if(v.length<3 || v.length>20) return 'Username must be 3–20 characters';
    if(!/^[a-zA-Z0-9_]+$/.test(v)) return 'Only letters, numbers, and underscores allowed';
    return '';
  },
  password(v){
    if(v.length<8) return 'Password must be at least 8 characters';
    if(!/\d/.test(v)) return 'Include at least one number';
    return '';
  }
};

/* ── Auth API ── */
const Auth = {
  async signup(username, email, password){
    await wait(600);
    const uErr = V.username(username);
    if(uErr) throw new Error(uErr);
    if(!email || !V.email(email)) throw new Error('Enter a valid email address');
    const pErr = V.password(password);
    if(pErr) throw new Error(pErr);
    if(S.users.find(u=>u.username.toLowerCase()===username.toLowerCase())) throw new Error('This username is taken. Try a different one.');
    if(S.users.find(u=>u.email.toLowerCase()===email.toLowerCase())) throw new Error('An account with this email already exists.');
    const user = {id:uid(),username,email,password,points:0,level:1,streak:1,missionsCompleted:0,reportsSubmitted:0,createdAt:now()};
    S.users.push(user); S.user = user;
    saveSession(user); persist(); return user;
  },
  async login(email, password){
    await wait(500);
    if(!email || !password) throw new Error('Incorrect email or password.');
    const user = S.users.find(u=>u.email.toLowerCase()===email.toLowerCase());
    if(!user || user.password!==password) throw new Error('Incorrect email or password.');
    S.user = user; saveSession(user); persist(); return user;
  },
  logout(){
    clearSession();
    S.user = null;
    persist();
    navigate('auth');
  }
};

/* ── Reports API ── */
const Reports = {
  async create(imageUrl, location, description, lat, lng){
    await wait(1000);
    if(!imageUrl) throw new Error('Please add a photo of the garbage');
    if(!location || location.trim().length<5) throw new Error('Please enter or capture a location');
    const rId=uid(), mId=uid();
    S.reports.push({id:rId,imageUrl,location:location.trim(),lat:lat||null,lng:lng||null,description:(description||'').trim(),createdBy:S.user.id,createdAt:now()});
    S.missions.push({id:mId,reportId:rId,status:'open',acceptedBy:null,createdAt:now(),completedAt:null});
    Points.award(S.user.id, 50, 'Submitted a garbage report');
    S.user.reportsSubmitted = (S.user.reportsSubmitted||0)+1;
    persist();
    return {reportId:rId,missionId:mId};
  }
};

/* ── Missions API ── */
const Missions = {
  async getAll(){ await wait(300); return S.missions.map(hydrate); },
  async getById(id){ await wait(150); const m=S.missions.find(x=>x.id===id); if(!m) throw new Error('Mission not found.'); return hydrate(m); },
  async accept(mId){
    await wait(600);
    const m = S.missions.find(x=>x.id===mId);
    if(!m) throw new Error('Mission not found.');
    if(m.status!=='open') throw new Error('This mission was just accepted by someone else.');
    m.status='in-progress'; m.acceptedBy=S.user.id; persist(); return hydrate(m);
  },
  async submitProof(mId, imgUrl){
    if(!imgUrl) throw new Error('Please upload a photo showing the cleanup');
    const m = S.missions.find(x=>x.id===mId);
    if(!m) throw new Error('Mission not found.');
    if(m.status!=='in-progress') throw new Error('Mission is not in progress.');
    if(m.acceptedBy!==S.user.id) throw new Error('You need to accept this mission before submitting proof.');
    const proof = {id:uid(),missionId:mId,afterImage:imgUrl,submittedBy:S.user.id,status:'pending',reviewedAt:null};
    S.proofs.push(proof); m.status='pending'; persist();
    return await Verify.run(proof,m);
  }
};

/* ── Verification ── */
const Verify = {
  async run(proof,mission){
    await wait(800);
    const ok = Math.random()<0.8;
    proof.reviewedAt = now();
    if(ok){
      proof.status='approved'; mission.status='approved'; mission.completedAt=now();
      Points.award(S.user.id, 150, 'Mission cleanup approved');
      S.user.missionsCompleted = (S.user.missionsCompleted||0)+1;
      persist(); return {ok:true,pts:150};
    } else {
      proof.status='rejected'; mission.status='rejected'; persist();
      const reasons = [
        "After image doesn't clearly show the area is cleaned.",
        "Image appears identical to the before photo.",
        "Area is only partially cleared — please complete the full area.",
        "Poor lighting makes it hard to verify the cleanup."
      ];
      return {ok:false,reason:reasons[Math.floor(Math.random()*reasons.length)]};
    }
  }
};

/* ── Points ── */
const Points = {
  award(userId, amount, reason){
    const u = S.users.find(x=>x.id===userId); if(!u) return;
    const oldLevel = u.level;
    u.points = (u.points||0) + amount;
    u.level = Math.floor(u.points/500) + 1;
    S.log.push({id:uid(),userId,amount,reason,createdAt:now()});
    if(S.user && S.user.id===userId){ S.user.points=u.points; S.user.level=u.level; }
    persist();
    // return level-up info for UI
    return { leveled: u.level > oldLevel, newLevel: u.level };
  }
};

/* ── Leaderboard ── */
const Leaderboard = { async get(){ await wait(250); return [...S.users].sort((a,b)=>b.points-a.points); } };

/* ── Geolocation addresses (simulated reverse geocode) ── */
const GEO_ADDRESSES = [
  'Sector 17 Park, Chandigarh',
  'Connaught Place, New Delhi',
  'MG Road, near Metro exit 2',
  'Saket District Centre',
  'Hauz Khas Village, South Delhi',
  'Nehru Place, Block A',
  'Lajpat Nagar Central Market',
  'DLF Cyber Hub, Gurgaon',
  'Khan Market, Central Delhi',
  'Janpath Road, near Palika Bazaar'
];
function reverseGeocode(lat, lng){
  const idx = Math.abs(Math.floor(lat*10 + lng*10)) % GEO_ADDRESSES.length;
  return GEO_ADDRESSES[idx];
}
