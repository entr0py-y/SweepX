/* ── SweepX App — Data + State + UI ── */
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36);
const now=()=>new Date().toISOString();
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function timeAgo(iso){const d=Date.now()-new Date(iso).getTime();const s=Math.floor(d/1000);if(s<60)return'Just now';const m=Math.floor(s/60);if(m<60)return m+' min ago';const h=Math.floor(m/60);if(h<24)return h+' hr ago';const dy=Math.floor(h/24);return dy+' days ago'}
function ini(n){return n.split(/[\s_]+/).map(w=>w[0]).join('').toUpperCase().slice(0,2)}
function acCol(n){const c=['#2D5A1B','#1B3A5A','#3A1B5A','#5A3A1B','#1B5A3A','#5A1B2D'];let h=0;for(let i=0;i<n.length;i++)h=(h<<5)-h+n.charCodeAt(i);return c[Math.abs(h)%c.length]}

const S={user:null,screen:'auth',prev:null,users:[],reports:[],missions:[],proofs:[],log:[],detailId:null,filter:'all'};

/* Persist */
function save(){try{localStorage.setItem('sx_u',JSON.stringify(S.users));localStorage.setItem('sx_r',JSON.stringify(S.reports));localStorage.setItem('sx_m',JSON.stringify(S.missions));localStorage.setItem('sx_p',JSON.stringify(S.proofs));localStorage.setItem('sx_l',JSON.stringify(S.log))}catch(e){}}
function load(){try{S.users=JSON.parse(localStorage.getItem('sx_u')||'[]');S.reports=JSON.parse(localStorage.getItem('sx_r')||'[]');S.missions=JSON.parse(localStorage.getItem('sx_m')||'[]');S.proofs=JSON.parse(localStorage.getItem('sx_p')||'[]');S.log=JSON.parse(localStorage.getItem('sx_l')||'[]')}catch(e){S.users=[];S.reports=[];S.missions=[];S.proofs=[];S.log=[]}}
function saveSess(u){localStorage.setItem('sx_s',JSON.stringify({t:uid(),uid:u.id,exp:Date.now()+7*864e5}))}
function loadSess(){try{const r=localStorage.getItem('sx_s');if(!r)return null;const s=JSON.parse(r);if(Date.now()>s.exp){localStorage.removeItem('sx_s');return null}return S.users.find(u=>u.id===s.uid)||null}catch(e){return null}}

/* Validate */
const V={email:v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),user:v=>{if(v.length<3||v.length>20)return'3–20 characters';if(!/^[a-zA-Z0-9_]+$/.test(v))return'Letters, numbers, _ only';return''},pass:v=>{if(v.length<8)return'Min 8 characters';if(!/\d/.test(v))return'Need a number';return''}};

/* Seed */
function seed(){if(S.users.length)return;
const d=[
  {id:uid(),username:'kai_cleans',email:'kai@demo.com',password:'cleanit1',points:1240,level:3,streak:12,mc:8,rs:6,at:new Date(Date.now()-864e5*45).toISOString()},
  {id:uid(),username:'priya_eco',email:'priya@demo.com',password:'greenday2',points:890,level:2,streak:7,mc:5,rs:4,at:new Date(Date.now()-864e5*30).toISOString()},
  {id:uid(),username:'tnguyen',email:'tnguyen@demo.com',password:'sweep123',points:640,level:2,streak:3,mc:4,rs:3,at:new Date(Date.now()-864e5*20).toISOString()},
  {id:uid(),username:'marcus_w',email:'marcus@demo.com',password:'london99',points:310,level:1,streak:1,mc:2,rs:2,at:new Date(Date.now()-864e5*10).toISOString()},
  {id:uid(),username:'zeynep_k',email:'zeynep@demo.com',password:'zemission1',points:150,level:1,streak:0,mc:1,rs:1,at:new Date(Date.now()-864e5*5).toISOString()}
];S.users=d;
const sm=[
  {loc:'Sector 17 Park, east gate',st:'open',ago:14*6e4,dist:'0.4 km',ci:0,desc:'Plastic bags and bottles near the bench.'},
  {loc:'MG Road footpath, Metro exit 3',st:'in-progress',ago:36e5,dist:'1.1 km',ci:1,desc:'Mixed waste blocking the footpath.',ai:2},
  {loc:'Lajpat Nagar market, vegetable stalls',st:'approved',ago:3*36e5,dist:'2.3 km',ci:2,desc:'Old crates and plastic near the drain.'},
  {loc:'Nehru Place parking lot B',st:'open',ago:28*6e4,dist:'0.7 km',ci:3,desc:'Broken chair and paper waste.'},
  {loc:'DLF Phase 2 roadside, roundabout',st:'rejected',ago:5*36e5,dist:'3.1 km',ci:4,desc:'Construction debris in the road.'},
  {loc:'Saket metro station bus stand',st:'open',ago:2*6e4,dist:'0.2 km',ci:0,desc:'Fast-food wrappers around the bus shelter.'}
];
sm.forEach(m=>{const cr=d[m.ci];const rId=uid(),mId=uid(),at=new Date(Date.now()-m.ago).toISOString();
S.reports.push({id:rId,img:null,loc:m.loc,lat:null,lng:null,desc:m.desc,dist:m.dist,by:cr.id,at});
S.missions.push({id:mId,rId,st:m.st,ab:m.ai!=null?d[m.ai].id:null,at,ct:m.st==='approved'?new Date(Date.now()-m.ago+36e5).toISOString():null})});
save()}

function hydrate(m){const r=S.reports.find(x=>x.id===m.rId)||{};const cr=S.users.find(u=>u.id===r.by)||{};const ac=m.ab?S.users.find(u=>u.id===m.ab)||null:null;return{...m,rpt:r,creator:cr,acceptor:ac}}
function getRank(){if(!S.user)return'—';const s=[...S.users].sort((a,b)=>b.points-a.points);const i=s.findIndex(u=>u.id===S.user.id);return i>=0?i+1:'—'}

/* SVG icons */
const I={
pin:'<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
chk:'<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
usrs:'<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
star:'<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
arr:'<svg viewBox="0 0 24 24"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>',
search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
sliders:'<svg viewBox="0 0 24 24"><line x1="4" y1="6" x2="16" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="16" y2="18"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
help:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
bell:'<svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>',
back:'<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>',
up:'<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
cam:'<svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>',
ok:'<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" stroke-width="2.5"/></svg>',
xx:'<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
trash:'<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>',
trphy:'<svg viewBox="0 0 24 24"><path d="M6 9H4a2 2 0 000 4h2M18 9h2a2 2 0 010 4h-2M6 9V5h12v4M6 9c0 5.523 2.686 8 6 8s6-2.477 6-8M9 21h6M12 17v4"/></svg>',
cog:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
logout:'<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
img:'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'
};

/* Badge */
function badge(st){const m={open:'b-open','in-progress':'b-ip',pending:'b-pend',approved:'b-ok',rejected:'b-rej'};const l={open:'Open','in-progress':'In Progress',pending:'Verifying…',approved:'Approved',rejected:'Rejected'};return`<span class="badge ${m[st]||'b-open'}">${l[st]||st}</span>`}

/* Theme map */
const themes={home:'home',missions:'missions',report:'report',leaderboard:'leaderboard',profile:'profile','mission-detail':'missions'};

/* Nav */
function go(s,d){S.prev=S.screen;S.screen=s;if(d?.id)S.detailId=d.id;const phone=document.getElementById('phone');phone.dataset.theme=themes[s]||'home';document.querySelectorAll('.scr').forEach(e=>{e.classList.remove('active');e.style.display='none'});document.querySelectorAll('.nt,.fab').forEach(e=>e.classList.remove('on'));const tab=document.querySelector(`[data-tab="${s}"]`);if(tab)tab.classList.add('on');const nav=document.getElementById('bnav');
if(!S.user||s==='auth'){nav.style.display='none';renderAuth();return}
nav.style.display='flex';
const r={home:renderHome,missions:renderMissions,report:renderReport,'mission-detail':renderDetail,leaderboard:renderLB,profile:renderProfile};(r[s]||renderHome)();
document.getElementById('screen-area').scrollTop=0}

/* Count-up */
function countUp(el,to){let v=0;const dur=600,start=performance.now();function step(ts){const p=Math.min((ts-start)/dur,1);const ease=1-Math.pow(1-p,3);v=Math.round(ease*to);el.textContent=v;if(p<1)requestAnimationFrame(step);else el.textContent=to}requestAnimationFrame(step)}

/* Auth */
let _authMode='login';
function renderAuth(){const s=document.getElementById('s-auth');s.innerHTML=`<div class="auth">
<div class="auth-logo">Sweep<b>X</b></div><div class="auth-tag">Clean it. Earn it.</div>
<div class="auth-tabs"><button class="atab on" id="at-l" onclick="swTab('login')">Login</button><button class="atab" id="at-s" onclick="swTab('signup')">Sign Up</button></div>
<div id="aerr" class="auth-err"></div>
<div class="aform" id="aform">
<div class="fg" id="fg-u" style="display:none"><label>Username</label><input id="f-u" placeholder="your_username"/><div class="ferr" id="e-u"></div></div>
<div class="fg"><label>Email</label><input id="f-e" type="email" placeholder="you@email.com"/><div class="ferr" id="e-e"></div></div>
<div class="fg"><label>Password</label><input id="f-p" type="password" placeholder="••••••••"/><div class="ferr" id="e-p"></div></div>
<button class="btn-p" id="abtn" onclick="doAuth()">Login</button>
</div></div>`;
s.style.display='block';s.classList.add('active');_authMode='login'}

function swTab(m){_authMode=m;document.querySelectorAll('.atab').forEach(t=>t.classList.remove('on'));document.getElementById(m==='signup'?'at-s':'at-l').classList.add('on');document.getElementById('fg-u').style.display=m==='signup'?'':'none';document.getElementById('abtn').textContent=m==='signup'?'Create Account':'Login';document.getElementById('aerr').classList.remove('show');document.querySelectorAll('.ferr').forEach(e=>e.textContent='')}

async function doAuth(){const btn=document.getElementById('abtn'),err=document.getElementById('aerr');btn.disabled=true;btn.innerHTML=`<span class="spin"></span> ${_authMode==='signup'?'Creating…':'Signing in…'}`;err.classList.remove('show');
try{const e=document.getElementById('f-e').value.trim(),p=document.getElementById('f-p').value.trim();
if(_authMode==='signup'){const u=document.getElementById('f-u').value.trim();const ue=V.user(u);if(ue)throw new Error(ue);const pe=V.pass(p);if(pe)throw new Error(pe);if(!e||!V.email(e))throw new Error('Valid email required');if(S.users.find(x=>x.email.toLowerCase()===e.toLowerCase()))throw new Error('Email already exists');
const user={id:uid(),username:u,email:e,password:p,points:0,level:1,streak:1,mc:0,rs:0,at:now()};S.users.push(user);S.user=user;saveSess(user);save()}
else{if(!e||!p)throw new Error('Email and password required');const user=S.users.find(x=>x.email.toLowerCase()===e.toLowerCase());if(!user||user.password!==p)throw new Error('Incorrect email or password');S.user=user;saveSess(user);save()}
await wait(500);go('home')}catch(e){err.textContent=e.message;err.classList.add('show');btn.disabled=false;btn.textContent=_authMode==='signup'?'Create Account':'Login'}}

/* Home */
function renderHome(){const u=S.user,s=document.getElementById('s-home');
const ms=S.missions.map(hydrate);const op=ms.filter(m=>m.st==='open').length,ip=ms.filter(m=>m.st==='in-progress').length,dn=ms.filter(m=>m.st==='approved').length;
const cleaners=new Set(ms.filter(m=>m.ab).map(m=>m.ab)).size||S.users.length;
const recent=ms.filter(m=>m.st==='open'||m.st==='in-progress').slice(0,5);
s.innerHTML=`
<div class="hdr"><div class="hdr-l"><div class="avatar" style="width:36px;height:36px;font-size:13px;background:${acCol(u.username)};border:1.5px solid var(--border-color)">${ini(u.username)}</div><div class="hdr-g"><span>Ready to sweep!</span><span>${u.username}</span></div></div><div class="hdr-r"><div class="icon-btn">${I.help}</div><div class="icon-btn" style="position:relative">${I.bell}<span class="notif-dot"></span></div></div></div>
<div class="srch">${I.search}<input placeholder="Search missions, locations..." readonly/><button class="srch-f">${I.sliders}</button></div>
<div class="sg">
<div class="sc ft"><div class="sc-top"><div class="sc-ico">${I.pin}</div><div class="sc-arr">${I.arr}</div></div><div class="sc-bot"><div class="sc-lbl">Reports</div><div class="sc-val" data-cu="${u.rs||0}">0</div></div></div>
<div class="sc"><div class="sc-top"><div class="sc-ico">${I.chk}</div><div class="sc-arr">${I.arr}</div></div><div class="sc-bot"><div class="sc-lbl">Missions Done</div><div class="sc-val" data-cu="${u.mc||0}">0</div></div></div>
<div class="sc"><div class="sc-top"><div class="sc-ico">${I.usrs}</div><div class="sc-arr">${I.arr}</div></div><div class="sc-bot"><div class="sc-lbl">Active Cleaners</div><div class="sc-val" data-cu="${cleaners}">0</div></div></div>
<div class="sc"><div class="sc-top"><div class="sc-ico">${I.star}</div><div class="sc-arr">${I.arr}</div></div><div class="sc-bot"><div class="sc-lbl">Your Rank</div><div class="sc-val" data-cu="${getRank()}">0</div></div></div>
</div>
<div class="ss"><div class="ss-c"><div class="ss-dr"><div class="ss-dot" style="background:var(--accent)"></div><span class="ss-l">Open</span></div><span class="ss-v">${op}</span></div><div class="ss-c"><div class="ss-dr"><div class="ss-dot" style="background:#4D8EFF"></div><span class="ss-l">In Progress</span></div><span class="ss-v">${ip}</span></div><div class="ss-c"><div class="ss-dr"><div class="ss-dot" style="background:#FF8C42"></div><span class="ss-l">Completed</span></div><span class="ss-v">${dn}</span></div></div>
<div class="sh"><span class="sh-t">Recent Missions</span><button class="sh-a" onclick="go('missions')">See all</button></div>
<div class="ml">${recent.length?recent.map((m,i)=>mRow(m,i)).join(''):'<div class="empty">'+I.pin+'<div class="empty-t">No missions nearby</div><div class="empty-s">Report a garbage location to create one.</div></div>'}</div>
<div style="height:24px"></div>`;
s.style.display='block';s.classList.add('active');
s.querySelectorAll('.sc-val[data-cu]').forEach(el=>{const v=el.dataset.cu;if(v&&!isNaN(v))countUp(el,parseInt(v));else el.textContent=v==='#—'?'#—':'#'+v})}

function mRow(m,i){const meta=[timeAgo(m.at),m.rpt?.dist].filter(Boolean);return`<div class="mr" onclick="go('mission-detail',{id:'${m.id}'})" style="animation:slideUp .22s ease-out both;animation-delay:${i*40}ms"><div class="mr-th">${m.rpt?.img?`<img src="${m.rpt.img}"/>`:I.pin}</div><div class="mr-bd"><div class="mr-loc">${m.rpt?.loc||'Unknown'}</div><div class="mr-meta">${meta.map((t,j)=>(j>0?'<span class="dot"></span>':'')+`<span>${t}</span>`).join('')}</div></div>${badge(m.st)}</div>`}

/* Missions */
let _allMs=[];
function renderMissions(){const s=document.getElementById('s-missions');_allMs=S.missions.map(hydrate);
s.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0 0"><span style="font-size:22px;font-weight:700;color:var(--text-primary)">Missions</span></div>
<div class="fp"><div class="pill on" onclick="filt(this,'all')">All</div><div class="pill" onclick="filt(this,'open')">Open</div><div class="pill" onclick="filt(this,'in-progress')">In Progress</div><div class="pill" onclick="filt(this,'approved')">Completed</div></div>
<div class="ml" id="mlist">${_allMs.map((m,i)=>mCard(m,i)).join('')}</div><div style="height:24px"></div>`;
s.style.display='block';s.classList.add('active')}

function mCard(m,i){return`<div class="mcard" onclick="go('mission-detail',{id:'${m.id}'})" style="animation:slideUp .22s ease-out both;animation-delay:${i*40}ms"><div class="mcard-img">${m.rpt?.img?`<img src="${m.rpt.img}"/>`:I.trash}</div><div class="mcard-bd"><div class="mcard-top"><span class="mcard-loc">${m.rpt?.loc||'Unknown'}</span>${badge(m.st)}</div><div class="mcard-meta"><span><span class="avatar mini-av" style="background:${acCol(m.creator?.username||'U')};display:inline-flex">${ini(m.creator?.username||'U')}</span> ${m.creator?.username||'Anon'}</span><span>${timeAgo(m.at)}</span></div><div class="mcard-pts">${I.trphy} +150 pts</div></div></div>`}

function filt(el,f){document.querySelectorAll('.pill').forEach(p=>p.classList.remove('on'));el.classList.add('on');const ms=f==='all'?_allMs:_allMs.filter(m=>m.st===f);const l=document.getElementById('mlist');l.innerHTML=ms.length?ms.map((m,i)=>mCard(m,i)).join(''):'<div class="empty"><div class="empty-t">No missions</div></div>'}

/* Report */
let _rImg=null,_rLat=null,_rLng=null;
function renderReport(){const s=document.getElementById('s-report');_rImg=null;
s.innerHTML=`<div class="scr-hd"><button class="back-btn" onclick="go('home')">${I.back}</button><span class="scr-hd-t">New Report</span></div>
<div id="rpt-ct" style="display:flex;flex-direction:column;gap:12px;margin-top:12px">
<div class="rpt-card"><div class="rpt-lbl">Photo</div><div class="uzone" id="uz"><input type="file" accept="image/jpeg,image/png,image/webp" onchange="hImg(this)"/>${I.cam}<span>Tap to add photo</span></div><div class="ferr" id="ie"></div></div>
<div class="rpt-card"><div class="rpt-lbl">Location</div><input class="rpt-in" id="f-loc" placeholder="Enter address…"/><div class="ferr" id="le"></div><button class="btn-s" style="margin-top:8px" onclick="getLoc()">📍 Use My Location</button></div>
<div class="rpt-card"><div class="rpt-lbl">Description <span style="font-weight:400;text-transform:none;color:var(--text-muted)">(optional)</span></div><textarea class="rpt-ta" id="f-desc" placeholder="Describe the garbage…" maxlength="120" oninput="cc()"></textarea><div class="char-c" id="dcc">0/120</div></div>
<button class="btn-p" id="rbtn" onclick="subRpt()" disabled>Submit Report</button>
</div>`;
s.style.display='block';s.classList.add('active')}

function cc(){const d=document.getElementById('f-desc'),c=document.getElementById('dcc');if(d&&c)c.textContent=d.value.length+'/120'}
function hImg(inp){const f=inp.files[0];if(!f)return;const err=document.getElementById('ie');if(f.size>10*1024*1024){err.textContent='Max 10MB';_rImg=null;return}err.textContent='';const r=new FileReader();r.onload=e=>{_rImg=e.target.result;document.getElementById('uz').innerHTML=`<input type="file" accept="image/jpeg,image/png,image/webp" onchange="hImg(this)"/><img src="${_rImg}"/>`;chkR()};r.readAsDataURL(f)}
function getLoc(){const btn=document.querySelector('#s-report .btn-s');btn.disabled=true;btn.innerHTML=`<span class="spin" style="border-color:rgba(255,255,255,.2);border-top-color:#fff"></span> Getting…`;
if(!navigator.geolocation){document.getElementById('le').textContent='Not supported';btn.innerHTML='📍 Use My Location';btn.disabled=false;return}
navigator.geolocation.getCurrentPosition(p=>{const addrs=['Sector 17 Park, Chandigarh','Connaught Place, New Delhi','MG Road, Metro exit 2','Saket District Centre'];const a=addrs[Math.floor(Math.random()*addrs.length)];document.getElementById('f-loc').value=a;_rLat=p.coords.latitude;_rLng=p.coords.longitude;btn.innerHTML='📍 Captured ✓';btn.style.color='var(--accent)';chkR()},()=>{document.getElementById('le').textContent='Denied. Enter manually.';btn.innerHTML='📍 Use My Location';btn.disabled=false},{timeout:10000})}
function chkR(){document.getElementById('rbtn').disabled=!(_rImg&&(document.getElementById('f-loc')?.value||'').trim().length>=5)}
document.addEventListener('input',e=>{if(e.target.id==='f-loc')chkR()})

async function subRpt(){const btn=document.getElementById('rbtn');btn.disabled=true;btn.innerHTML=`<span class="spin"></span> Submitting…`;
try{await wait(1000);const loc=document.getElementById('f-loc').value.trim(),desc=document.getElementById('f-desc')?.value||'';
const rId=uid(),mId=uid();S.reports.push({id:rId,img:_rImg,loc,lat:_rLat,lng:_rLng,desc:desc.trim(),dist:'0.3 km',by:S.user.id,at:now()});S.missions.push({id:mId,rId,st:'open',ab:null,at:now(),ct:null});
S.user.rs=(S.user.rs||0)+1;S.user.points=(S.user.points||0)+50;S.user.level=Math.floor(S.user.points/500)+1;S.log.push({id:uid(),uid:S.user.id,amt:50,reason:'Report submitted',at:now()});save();_rImg=null;
document.getElementById('rpt-ct').innerHTML=`<div class="suc"><div class="suc-ring">${I.ok}</div><div class="suc-t">Report Submitted!</div><div style="color:var(--accent);font-weight:700;font-size:20px;font-variant-numeric:tabular-nums">+50 pts</div><div class="suc-s">Your report is now a mission.</div></div>`;
setTimeout(()=>go('home'),1800)}catch(e){btn.disabled=false;btn.textContent='Submit Report'}}

/* Detail */
function renderDetail(){const s=document.getElementById('s-detail');const m=S.missions.find(x=>x.id===S.detailId);if(!m){s.innerHTML='<div class="empty"><div class="empty-t">Not found</div></div>';s.style.display='block';s.classList.add('active');return}
const h=hydrate(m);const img=h.rpt?.img?`<img src="${h.rpt.img}"/>`:`<div style="display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--text-muted)">${I.img}<span style="font-size:12px">No image</span></div>`;
const isMe=S.user&&h.ab===S.user.id,isMine=S.user&&h.rpt?.by===S.user.id;
let act='';
if(h.st==='open'&&!isMine)act=`<div style="font-size:12px;font-weight:600;color:var(--accent);display:flex;align-items:center;gap:6px;margin-bottom:8px">${I.trphy} +150 pts on completion</div><button class="btn-p" id="acbtn" onclick="accM('${h.id}')">${I.ok} Accept Mission</button>`;
else if(h.st==='open'&&isMine)act='<div style="text-align:center;font-size:13px;color:var(--text-secondary);padding:12px 0">Waiting for a volunteer.</div>';
else if(h.st==='in-progress'&&isMe)act=proofHTML(h.id);
else if(h.st==='approved')act=`<div class="res-card ok"><div class="res-ico ok">${I.ok}</div><div class="res-t ok">Cleanup Verified!</div><div class="pts-pop">+150 pts</div><div class="res-s">Points awarded.</div></div>`;
else if(h.st==='rejected')act=`<div class="res-card fail"><div class="res-ico fail">${I.xx}</div><div class="res-t fail">Proof Rejected</div><div class="res-s">Try clearer photos.</div></div>`;
else if(h.st==='in-progress')act=`<div style="text-align:center;font-size:13px;color:var(--text-secondary);padding:12px 0">Being cleaned by ${h.acceptor?.username||'someone'}.</div>`;
s.innerHTML=`<div class="scr-hd"><button class="back-btn" onclick="go('${S.prev||'missions'}')">${I.back}</button><span class="scr-hd-t">Mission Detail</span><div style="margin-left:auto">${badge(h.st)}</div></div>
<div class="det-hero">${img}</div>
<div class="det-card"><div class="det-loc">${h.rpt?.loc||'Unknown'}</div><div class="det-rep"><div class="avatar" style="width:24px;height:24px;font-size:9px;background:${acCol(h.creator?.username||'U')}">${ini(h.creator?.username||'U')}</div><span style="font-size:13px;color:var(--text-secondary);flex:1">${h.creator?.username||'Anon'}</span><span style="font-size:11px;color:var(--text-muted)">${timeAgo(h.at)}</span></div>${h.rpt?.desc?`<div class="det-desc">${h.rpt.desc}</div>`:''}</div>
<div class="det-card" id="parea">${act}</div><div style="height:24px"></div>`;
s.style.display='block';s.classList.add('active')}

let _pImg=null;
function proofHTML(mId){return`<div style="display:flex;flex-direction:column;gap:12px"><div style="font-size:12px;font-weight:600;color:var(--accent);display:flex;align-items:center;gap:6px">${I.trphy} +150 pts reward</div><div class="uzone" id="pz"><input type="file" accept="image/jpeg,image/png,image/webp" onchange="hPrf(this,'${mId}')"/>${I.up}<span>Upload proof</span></div><div class="ferr" id="pe"></div><button class="btn-p" id="pbtn" onclick="subPrf('${mId}')" disabled>Submit Proof</button></div>`}
function hPrf(inp,mId){const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=e=>{_pImg=e.target.result;document.getElementById('pz').innerHTML=`<input type="file" accept="image/jpeg,image/png,image/webp" onchange="hPrf(this,'${mId}')"/><img src="${_pImg}"/>`;document.getElementById('pbtn').disabled=false};r.readAsDataURL(f)}

async function accM(mId){const btn=document.getElementById('acbtn');btn.disabled=true;btn.innerHTML=`<span class="spin"></span> Accepting…`;
try{await wait(600);const m=S.missions.find(x=>x.id===mId);if(!m||m.st!=='open')throw new Error('Unavailable');m.st='in-progress';m.ab=S.user.id;save();
btn.innerHTML=`<span style="color:var(--accent)">${I.ok} Accepted ✓</span>`;
setTimeout(()=>{const area=document.getElementById('parea');if(area){area.innerHTML=proofHTML(mId);area.style.opacity='0';requestAnimationFrame(()=>{area.style.transition='opacity .2s';area.style.opacity='1'})}},400)}catch(e){btn.disabled=false;btn.innerHTML=I.ok+' Accept Mission'}}

async function subPrf(mId){const btn=document.getElementById('pbtn');if(!_pImg)return;btn.disabled=true;btn.innerHTML=`<span class="spin"></span> Verifying…`;
const area=document.getElementById('parea');if(area)area.innerHTML=`<div class="verify-card"><span class="spin" style="border-color:rgba(255,255,255,.15);border-top-color:#fff"></span><div class="ver-t">Verifying cleanup…</div><div style="font-size:12px;color:var(--text-muted)">AI reviewing your photo</div></div>`;
await wait(800);const ok=Math.random()<.8;const m=S.missions.find(x=>x.id===mId);
if(ok){m.st='approved';m.ct=now();S.user.mc=(S.user.mc||0)+1;S.user.points=(S.user.points||0)+150;S.user.level=Math.floor(S.user.points/500)+1;S.log.push({id:uid(),uid:S.user.id,amt:150,reason:'Cleanup approved',at:now()});save();
if(area)area.innerHTML=`<div class="res-card ok"><div class="res-ico ok">${I.ok}</div><div class="res-t ok">Cleanup Verified!</div><div class="pts-pop">+150 pts</div><div class="res-s">Amazing work!</div></div>`}
else{m.st='rejected';save();const reasons=["Photo doesn't show cleanup.","Area only partially cleared.","Poor lighting."];if(area)area.innerHTML=`<div class="res-card fail"><div class="res-ico fail">${I.xx}</div><div class="res-t fail">Proof Rejected</div><div class="res-s">${reasons[Math.floor(Math.random()*reasons.length)]}</div></div>`}
_pImg=null}

/* Leaderboard */
function renderLB(){const s=document.getElementById('s-leaderboard');const users=[...S.users].sort((a,b)=>b.points-a.points);const t3=users.slice(0,3),rest=users.slice(3);
const rc=['r2','r1','r3'];const order=[1,0,2];
s.innerHTML=`<div style="padding:8px 0 0"><div style="font-size:22px;font-weight:700;color:var(--text-primary)">Top Cleaners</div><div style="font-size:12px;color:var(--text-secondary);margin-top:2px">This week's rankings</div></div>
<div class="pod">${order.map(idx=>{const u=t3[idx];if(!u)return'';const me=S.user&&u.id===S.user.id;return`<div class="pod-c ${rc[idx]}${me?' me':''}"><div class="pod-rk">${idx+1}</div><div class="avatar pod-av" style="background:${acCol(u.username)}">${ini(u.username)}</div><div class="pod-nm">${u.username}</div><div class="pod-pt">${u.points} pts</div></div>`}).join('')}</div>
<div class="ml" style="margin-top:16px">${rest.map((u,i)=>{const me=S.user&&u.id===S.user.id;return`<div class="lb-row${me?' me':''}" style="animation:slideUp .22s ease-out both;animation-delay:${i*40}ms"><span class="lb-rk">${i+4}</span><div class="avatar" style="width:32px;height:32px;font-size:11px;background:${acCol(u.username)}">${ini(u.username)}</div><span class="lb-nm">${u.username}${me?'<span class="you-tag">You</span>':''}</span><span class="lb-pt">${u.points}</span></div>`}).join('')}</div><div style="height:24px"></div>`;
s.style.display='block';s.classList.add('active')}

/* Profile */
let _profMs=[];
function renderProfile(){const u=S.user,s=document.getElementById('s-profile');
const da=Math.max(1,Math.ceil((Date.now()-new Date(u.at||Date.now()).getTime())/864e5));
const tot=(u.mc||0)+(u.rs||0);const apr=tot>0?Math.round((u.mc||0)/tot*100):0;const rk=getRank();
_profMs=S.missions.map(hydrate).filter(m=>m.ab===u.id||m.rpt?.by===u.id);
s.innerHTML=`
<div class="hdr"><div class="hdr-l"><div class="avatar" style="width:36px;height:36px;font-size:13px;background:${acCol(u.username)};border:2px dashed var(--accent)">${ini(u.username)}</div><div class="hdr-g"><span>${u.username}</span><span>@${u.username.toLowerCase()}</span></div></div><div class="hdr-r"><div class="icon-btn">${I.cog}</div><div class="icon-btn" onclick="doLogout()">${I.logout}</div></div></div>
<div class="prof-hd"><div class="avatar" style="width:72px;height:72px;font-size:24px;background:${acCol(u.username)};border:2px dashed var(--accent)">${ini(u.username)}</div><div class="prof-nm">${u.username}</div><div class="prof-h">@${u.username.toLowerCase()}</div></div>
<div class="sg">
<div class="sc ft"><div class="sc-top"><div class="sc-ico">${I.star}</div><div class="sc-arr">${I.arr}</div></div><div class="sc-bot"><div class="sc-lbl">Points</div><div class="sc-val" data-cu="${u.points||0}">0</div></div></div>
<div class="sc"><div class="sc-top"><div class="sc-ico">${I.chk}</div><div class="sc-arr">${I.arr}</div></div><div class="sc-bot"><div class="sc-lbl">Missions</div><div class="sc-val" data-cu="${u.mc||0}">0</div></div></div>
<div class="sc"><div class="sc-top"><div class="sc-ico">${I.pin}</div><div class="sc-arr">${I.arr}</div></div><div class="sc-bot"><div class="sc-lbl">Reports</div><div class="sc-val" data-cu="${u.rs||0}">0</div></div></div>
<div class="sc"><div class="sc-top"><div class="sc-ico">${I.trphy}</div><div class="sc-arr">${I.arr}</div></div><div class="sc-bot"><div class="sc-lbl">Level</div><div class="sc-val">Lv ${u.level||1}</div></div></div>
</div>
<div class="ss"><div class="ss-c"><div class="ss-dr"><span class="ss-l">Approval</span></div><span class="ss-v">${apr}%</span></div><div class="ss-c"><div class="ss-dr"><span class="ss-l">Streak</span></div><span class="ss-v">${u.streak||0}d</span></div><div class="ss-c"><div class="ss-dr"><span class="ss-l">Rank</span></div><span class="ss-v">#${rk}</span></div></div>
<div class="sh" style="margin-top:20px"><span class="sh-t">My Missions</span><button class="sh-a" onclick="go('missions')">See all</button></div>
<div class="fp" id="pfp"><div class="pill on" onclick="pFilt(this,'all')">All</div><div class="pill" onclick="pFilt(this,'approved')">Completed</div><div class="pill" onclick="pFilt(this,'open')">Pending</div></div>
<div class="ml" id="phist">${_profMs.length?_profMs.slice(0,6).map((m,i)=>mRow(m,i)).join(''):'<div class="empty"><div class="empty-t">No missions yet</div></div>'}</div>
<div style="padding:16px 0;text-align:center"><button onclick="doLogout()" style="background:none;border:none;color:var(--text-muted);font-size:14px;cursor:pointer;font-family:Inter,sans-serif">Log Out</button></div><div style="height:24px"></div>`;
s.style.display='block';s.classList.add('active');
s.querySelectorAll('.sc-val[data-cu]').forEach(el=>{const v=parseInt(el.dataset.cu);if(!isNaN(v))countUp(el,v)})}

function pFilt(el,f){document.querySelectorAll('#pfp .pill').forEach(p=>p.classList.remove('on'));el.classList.add('on');const ms=f==='all'?_profMs:_profMs.filter(m=>m.st===f);const l=document.getElementById('phist');l.innerHTML=ms.length?ms.slice(0,6).map((m,i)=>mRow(m,i)).join(''):'<div class="empty"><div class="empty-t">None here</div></div>'}

function doLogout(){localStorage.removeItem('sx_s');S.user=null;go('auth')}

/* Boot */
load();seed();S.user=loadSess();go(S.user?'home':'auth');
