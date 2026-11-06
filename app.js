(function(){
'use strict';
var ENV=window.CP_ENV||{};
var ATHLETE=!!ENV.athlete;
function BLOB(id){return ENV.blob?ENV.blob(id):'/_blob/'+id}
var PAGE_TITLE='Cheerbook Beta';
var FONT_HREF='https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;800&family=Figtree:wght@400;500;600;700&display=swap';
var DEFAULT_RESET=':root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}';
var ROLES=['Flyer','Base','Backspot','Tumbler'];
var SECTION_NAMES=['Opening','Standing Tumbling','Running Tumbling','Stunts','Pyramid','Basket Tosses','Jumps','Dance','Transition'];
var LETTERS='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var GROUP_COLORS=['#f0a020','#0ea5e9','#a855f7','#22c55e','#f43f5e','#eab308','#06b6d4','#f97316'];
var SHEETS={
 allstar:{name:'All Star (Varsity · United Scoring 26-27)',max:150,
  note:'Building and Tumbling follow the 26-27 United Scoring rubric. MOST and MAX mean a share of your team set by roster size. Check your event’s current level rubric.',
  src:[['Varsity All Star scoring','https://www.varsity.com/all-star/scoring/'],['26-27 United Scoring rubric','https://www.varsity.com/wp-content/uploads/2026/01/26-27-United-Scoring-Rubric-Performance-Elite.pdf'],['USASF scoring','https://www.usasf.net/scoring']],
  cats:[{cat:'Building',items:[
    {k:'stunt',n:'Stunt skills',need:4,tip:'Top difficulty asks for 4 different level-appropriate skills by MOST of the team, rippled or synced, without recycling athletes.'},
    {k:'pyr',n:'Pyramid structures',need:2,tip:'2 structures, each with 2 or more stunts connected by 2 or more top persons. More skills by MOST raise the range.'},
    {k:'toss',n:'Basket toss',need:1,tip:'A MAJORITY performs a level-appropriate toss, rippled or synced in the same section.'}]},
   {cat:'Tumbling',items:[
    {k:'stand',n:'Standing tumbling',need:1,tip:'Top difficulty needs MOST of the team on a level-appropriate pass. Passes must land on feet.'},
    {k:'run',n:'Running tumbling',need:1,tip:'MOST of the team on a level-appropriate pass. Advanced or elite skills by MAX earn participation credit.'},
    {k:'jumps',n:'Jumps',need:1,tip:'3 connected advanced jumps (or 2 connected plus 1 more), synced, with at least 2 different jumps and a whip approach. Top score asks for MAX of the team.'}]},
   {cat:'Performance',items:[
    {k:'dance',n:'Dance',need:1,tip:'A full-team dance section shows choreography, sharp motions and synchronization.'},
    {k:'form',n:'Formations & transitions',need:1,tip:'Visual formation changes and smooth transitions between sections.'},
    {k:'show',n:'Showmanship moment',need:1,tip:'Plan clear crowd-facing moments, often the opening and the final pose.'}]}]},
 school:{name:'School performance (UCA School/Rec, 100 pts)',max:150,
  note:'Points follow the Varsity Spirit School/Rec performance sheet: Crowd Leading & Skill Incorporation 30, Building 50, Overall 20.',
  src:[['UCA rules & scoring','https://www.varsity.com/uca/school/competitions/rules-scoring/'],['Performance routine scoresheet','https://khsaa.org/common_documents/UCADocuments/20252026/Performance Routine Scoresheet.pdf']],
  cats:[{cat:'Crowd leading & skill incorporation · 30',items:[
    {k:'crowd',n:'Crowd leading',need:1,pts:10,tip:'Crowd-effective material and motions, with signs, poms, megaphones, rally towels or flags.'},
    {k:'skillinc',n:'Skills used to lead the crowd',need:1,pts:15,tip:'Stunts, jumps or tumbling placed to drive crowd response, cleanly and in sync.'}]},
   {cat:'Building · 50',items:[
    {k:'stunt',n:'Partner stunts',need:2,pts:25,tip:'Difficulty counts skill level, number of stunts, bases used, transitions and variety.'},
    {k:'pyr',n:'Pyramid',need:1,pts:25,tip:'Execution and difficulty: skill level, number of stunts, transitions and variety.'}]},
   {cat:'Overall · 20',items:[
    {k:'tumble',n:'Standing or running tumbling',need:1,pts:10,tip:'Skill level and number of skills, with form and synchronization.'},
    {k:'jumps',n:'Jumps',need:1,pts:5,tip:'Type of jumps, connections or combinations, and variety.'},
    {k:'dance',n:'Choreography, motions & formations',need:1,pts:5,tip:'Overall choreography, dance, visual appeal, flow, formations and transitions.'}]}]},
 gameday:{name:'Game Day (UCA)',max:180,
  note:'Game Day routines run four parts in 3:00 or less. The fight song may hold up to 3 consecutive 8-counts of stunts, tumbling or jumps.',
  src:[['UCA Game Day overview','https://www.varsity.com/?p=11972'],['UCA rules & scoring','https://www.varsity.com/uca/school/competitions/rules-scoring/']],
  cats:[{cat:'Routine parts',items:[
    {k:'band',n:'Band chant',need:1,tip:'Sharp motions, high energy and synchronization. Skills are limited to kicks and jumps.'},
    {k:'side',n:'Situational sideline',need:1,tip:'Respond to the offense or defense cue with the matching sideline. Keep skills minimal.'},
    {k:'timeout',n:'Time out cheer',need:1,tip:'The place to show crowd-effective skills, with signs, poms or flags.'},
    {k:'fight',n:'Fight song',need:1,tip:'Performed to the school fight song.'}]},
   {cat:'Crowd leading',items:[
    {k:'props',n:'Crowd leading tools',need:1,tip:'Signs, poms, megaphones or flags used to get a crowd response.'},
    {k:'fightskill',n:'Fight song skills',need:1,max:3,tip:'Up to 3 consecutive 8-counts of crowd-effective stunts, tumbling or jumps.'}]}]},
 custom:{name:'My own checklist',max:150,note:'Only your own items below.',src:[],cats:[]}
};
var MAX_SECS=150, MAX_BYTES=20*1024*1024, MOVE=4, LS=ENV.ls||'cheer-playbook-beta-v1', LS_LAYOUT='cheer-playbook-beta-layout-v1';
var app=document.getElementById('app');

function uid(){return Math.random().toString(36).slice(2,9)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function initials(n){var p=String(n||'').trim().split(/\s+/).filter(Boolean);if(!p.length)return '?';return (p[0][0]+(p[1]?p[1][0]:(p[0][1]||''))).toUpperCase()}
function clone(o){return JSON.parse(JSON.stringify(o))}
function r2(x){return Math.round(x*100)/100}
function fmt(sec){sec=Math.max(0,Math.round(sec||0));return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0')}
function fmtT(sec){sec=Math.max(0,sec||0);var m=Math.floor(sec/60),s=sec-m*60;return m+':'+(s<10?'0':'')+s.toFixed(1)}
function eight(pos,counts,note){return {id:uid(),counts:counts||['','','','','','','',''],note:note||'',pos:clone(pos||{}),tags:[],build:{},links:[],bend:{}}}
function copyEights(list){return list.map(function(e){var c=clone(e);c.id=uid();if(!c.tags)c.tags=[];return c})}

function makeSample(){
  var A=[['Ava','Flyer'],['Mia','Flyer'],['Jordan','Base'],['Kayla','Base'],['Sophie','Base'],['Riley','Base'],['Taylor','Backspot'],['Brooke','Backspot']]
    .map(function(a){return {id:uid(),name:a[0],role:a[1]}});
  var ids=A.map(function(a){return a.id});
  function P(list){var o={};list.forEach(function(xy,i){o[ids[i]]=xy});return o}
  return {sample:true,name:'Sample routine',bpm:150,athletes:A,sections:[
    {id:uid(),name:'Opening',eights:[eight(P([[15,30],[39,30],[11,22],[23,30],[31,30],[43,22],[21,22],[33,22]]),['Hit','','Head snap','','Turn','','Clasp','Hold'],'')]}]};
}
function blankRoutine(team){return fixRoutine({id:uid(),sample:false,name:'Untitled routine',bpm:150,athletes:clone(team||[]),sections:[{id:uid(),name:'Opening',eights:[eight({})]}]})}

/* ---- data model: routine → sections → versions of a section (A original, B/C alternates) → 8-counts ---- */
function fixVariant(v,i){if(!v.id)v.id=uid();if(!v.label)v.label=LETTERS[i]||String(i+1);if(!v.eights||!v.eights.length)v.eights=[eight({})];if(v.video===undefined)v.video=null;if(typeof v.videoOffset!=='number')v.videoOffset=0;v.eights.forEach(function(e){if(!e.tags)e.tags=[];if(!e.build||typeof e.build!=='object')e.build={};if(!Array.isArray(e.links))e.links=[];if(!e.bend||typeof e.bend!=='object')e.bend={}});return v}
function fixSection(s){if(!s.id)s.id=uid();if(!s.variants){s.variants=[{id:uid(),label:'A',eights:s.eights||[eight({})],video:null,videoOffset:0}];delete s.eights}
  s.variants.forEach(fixVariant);if(!s.variants.some(function(v){return v.id===s.active}))s.active=s.variants[0].id;return s}
function fixRoutine(r){if(!r.id)r.id=uid();if(r.music==null)r.music='';if(r.audio===undefined)r.audio=null;if(r.video===undefined)r.video=null;
  if(typeof r.musicStart!=='number')r.musicStart=0;if(typeof r.videoOffset!=='number')r.videoOffset=0;if(!r.bpm)r.bpm=150;if(!r.versions)r.versions=[];if(!r.groups)r.groups=[];if(!r.sheet||!SHEETS[r.sheet.tpl])r.sheet={tpl:(r.sheet&&r.sheet.tpl)||'allstar',custom:(r.sheet&&r.sheet.custom)||[]};if(!SHEETS[r.sheet.tpl])r.sheet.tpl='allstar';
  if(!r.sections||!r.sections.length)r.sections=[{id:uid(),name:'Opening',eights:[eight({})]}];r.sections.forEach(fixSection);delete r.savedAt;delete r.editedAt;return r}
function upgrade(x){
  if(!x)return null;
  if(x.routines&&x.routines.length){x.routines.forEach(fixRoutine);if(!x.routines.some(function(r){return r.id===x.cur}))x.cur=x.routines[0].id;return x}
  if(x.sections&&x.sections.length){var sv=x.savedAt||0,ed=x.editedAt||0;fixRoutine(x);return {v:3,savedAt:sv,editedAt:ed,cur:x.id,routines:[x]}}
  return null;
}
var D=null, R=null, dirty=false;
try{D=upgrade(JSON.parse(document.getElementById('state').textContent))}catch(e){D=null}
var draft=null,LS_BASE=LS+'-sync',sync={on:false,busy:false,pending:false,timer:0,retry:0,again:false,err:null,cached:false,first:true,remote:{},defin:{},base:{},unsub:[]};
try{draft=upgrade(JSON.parse(localStorage.getItem(LS)||'null'))}catch(e){draft=null}
try{sync.base=JSON.parse(localStorage.getItem(LS_BASE)||'{}')||{}}catch(e){sync.base={}}
/* a device that has synced before trusts its own copy of the shared playbook over the copy built into the page */
if(draft&&Object.keys(sync.base).length){D=draft;dirty=false}
else{sync.base={};if(draft&&(!D||(draft.editedAt||0)>(D.savedAt||0))){D=draft;dirty=!!D.editedAt;sync.localDirty=dirty}}
if(D){if(!Array.isArray(D.views))D.views=[];if(!Array.isArray(D.templates))D.templates=[]}
if(!D){var smp=fixRoutine(makeSample());D={v:3,savedAt:0,editedAt:0,cur:smp.id,routines:[smp]}}
if(!Array.isArray(D.views))D.views=[];if(!Array.isArray(D.templates))D.templates=[];
if(ATHLETE){D=athFeedData(ENV.athlete.feed)}else ensureTeams();
var cur=null, showGhost=true;
var downloadsApi=null, artApi=null, assetsApi=null, saving=false, readOnly=false;

function activeVar(s){return s.variants.find(function(v){return v.id===s.active})||s.variants[0]}
function ev(s){return activeVar(s).eights}
function secLabel(s){return (s.name||'Untitled section')+(s.variants.length>1?' '+activeVar(s).label:'')}
function flat(){var out=[];R.sections.forEach(function(s,si){ev(s).forEach(function(e,ei){out.push({s:s,e:e,si:si,ei:ei})})});return out}
function find(id){var f=flat();for(var i=0;i<f.length;i++)if(f[i].e.id===id){var r=f[i];r.n=i;r.list=f;return r}var z=f[0];z.n=0;z.list=f;cur=z.e.id;return z}
function defaultPos(i){return [6+(i%8)*6,4+Math.floor(i/8)*4]}
function posOf(e,a,i){var p=e.pos[a.id];if(!p){p=defaultPos(i);e.pos[a.id]=p}return p}
function summary(e){var t=e.counts.map(function(c,i){return c?((i+1)+' '+c):''}).filter(Boolean).join(' · ');return t||'Empty — tap to fill in'}

/* ---- undo / redo: whole-playbook snapshots, typing bursts merged ---- */
/* each undo step is a copy of the whole playbook, so the stack is capped by size as well as count (big playbooks with many saved versions) */
var undoS=[],redoS=[],lastSnap=JSON.stringify(D),burst=0,undoChars=0,UNDO_MAX_CHARS=24e6;
function pushUndo(s){undoS.push(s);undoChars+=s.length;while(undoS.length>1&&(undoS.length>80||undoChars>UNDO_MAX_CHARS))undoChars-=undoS.shift().length}
function popUndo(){var s=undoS.pop();undoChars-=s.length;return s}
/* this device's copy: written once a burst of edits settles (not on every keystroke), and right away when the page is hidden or closed.
   If the browser refuses it (storage full), the stale copy and its sync fingerprints are removed, so a reload takes the shared copy
   instead of pushing an older local one over it. */
var localOK=true,localPending=false;
function saveLocal(s){localPending=false;
  try{localStorage.setItem(LS,s==null?JSON.stringify(D):s);localOK=true}
  catch(e){var was=localOK;localOK=false;try{localStorage.removeItem(LS);localStorage.removeItem(LS_BASE)}catch(x){}
    if(was&&!sync.on)flash('This playbook is too big to keep on this device. Use Import / Export to save a copy.')}}
function saveBase(){if(!localOK)return;try{localStorage.setItem(LS_BASE,JSON.stringify(sync.base))}catch(e){}}
function flushLocal(){if(localPending){if(burst)commitBurst();else saveLocal(lastSnap)}}
function commitBurst(){if(burst){clearTimeout(burst);burst=0;lastSnap=JSON.stringify(D);if(localPending)saveLocal(lastSnap)}}
function markDirty(){
  if(!burst){pushUndo(lastSnap);redoS=[]}else clearTimeout(burst);
  burst=setTimeout(function(){burst=0;lastSnap=JSON.stringify(D);if(localPending)saveLocal(lastSnap);updateUndo()},800);
  D.editedAt=Date.now();dirty=true;localPending=true;
  if(view==='editor'&&R){R.updated=Date.now();if(R.teamId)pushTeamFromRoutine(R)}
  if(R.sample){R.sample=false;var b=document.getElementById('banner');if(b)b.hidden=true}
  updateStatus();updateUndo();scheduleSync();
}
function applySnap(s){var keep=D.savedAt;D=JSON.parse(s);D.savedAt=keep;lastSnap=s;
  R=D.routines.find(function(r){return r.id===D.cur})||D.routines[0];D.cur=R.id;find(cur);
  D.editedAt=Date.now();dirty=true;saveLocal();
  range=null;loadAudio();buildVideos();render();scheduleSync()}
function undo(){commitBurst();if(!undoS.length)return;if(playing)pause();redoS.push(JSON.stringify(D));applySnap(popUndo());flash('Undone.')}
function redo(){commitBurst();if(!redoS.length)return;if(playing)pause();pushUndo(JSON.stringify(D));applySnap(redoS.pop());flash('Redone.')}
function updateUndo(){var u=document.getElementById('undoBtn'),r=document.getElementById('redoBtn');if(u)u.disabled=!undoS.length&&!burst;if(r)r.disabled=!redoS.length}

/* ---- personal tile layout (kept on this device) ---- */
/* practice-video upload and sync is switched off for now (songs still sync). Turn VIDEO_ON back on to bring the Video tile, tab and uploads back; stored videos are kept. */
var VIDEO_ON=false;
var TILES=VIDEO_ON?{video:'Video',mat:'Formation',sheet:'Count sheet',score:'Scoresheet',setup:'Setup'}:{mat:'Formation',sheet:'Count sheet',score:'Scoresheet',setup:'Setup'};
var DEF_LAYOUT={order:VIDEO_ON?['video','mat','sheet','score','setup']:['mat','sheet','score','setup'],size:{video:'half',mat:'half',sheet:'half',score:'half',setup:'half'},collapsed:{},hidden:{}};
function okIdLoose(x){return typeof x==='string'&&/^[A-Za-z0-9_-]{1,40}$/.test(x)?x:null}
var PHONE=window.matchMedia&&window.matchMedia('(max-width:700px)').matches;if(PHONE)document.body.classList.add('m');
/* tablets (touch screens 701–1400 px wide) and the athlete view use the app layout; tablets get a side-by-side version of it */
var TABLET=!PHONE&&!!(window.matchMedia&&window.matchMedia('(min-width:701px) and (max-width:1400px) and (pointer:coarse)').matches);
if(TABLET||ATHLETE){PHONE=true;document.body.classList.add('m')}if(TABLET)document.body.classList.add('tab');if(ATHLETE)document.body.classList.add('athm');
if(PHONE){DEF_LAYOUT.order=VIDEO_ON?['mat','sheet','video','score','setup']:['mat','sheet','score','setup'];DEF_LAYOUT.collapsed={score:true,setup:true}}
/* layouts saved before the Setup tile existed: put Setup where Team, Music & video or Versions used to be */
function migrateLayoutObj(o){if(!o||!Array.isArray(o.order))return o;var old=['team','media','versions'],ord=o.order.slice();
  if(ord.indexOf('setup')<0){var ix=ord.findIndex(function(id){return old.indexOf(id)>=0});if(ix>=0)ord.splice(ix,0,'setup')}
  o.order=ord.filter(function(id){return TILES[id]});o.size=o.size||{};o.collapsed=o.collapsed||{};o.hidden=o.hidden||{};
  if(!o.size.setup){var sz=old.map(function(k){return o.size[k]}).filter(Boolean)[0];if(sz)o.size.setup=sz}
  if(o.collapsed.setup==null&&old.some(function(k){return k in o.collapsed}))o.collapsed.setup=old.every(function(k){return o.collapsed[k]});
  old.forEach(function(k){delete o.size[k];delete o.collapsed[k]});return o}
var L=clone(DEF_LAYOUT);
try{var ls=migrateLayoutObj(JSON.parse(localStorage.getItem(LS_LAYOUT)||'null'));if(ls&&ls.order){L.order=ls.order.filter(function(id){return TILES[id]});Object.keys(TILES).forEach(function(id){if(L.order.indexOf(id)<0)L.order.push(id)});
  L.size=Object.assign({},DEF_LAYOUT.size,ls.size||{});L.collapsed=ls.collapsed||{};L.hidden=ls.hidden&&typeof ls.hidden==='object'?ls.hidden:{};L.free=!!ls.free;L.help=!!ls.help;L.traffic=ls.traffic!==false;L.matView=ls.matView==='front'?'front':'top';L.theme={light:1,dark:1}[ls.theme]?ls.theme:'system';L.setupTab=typeof ls.setupTab==='string'?ls.setupTab:null;L.spot=okIdLoose(ls.spot);L.solo=!!ls.solo;L.view=typeof ls.view==='string'?ls.view:'home';L.pTeam=okIdLoose(ls.pTeam);L.pAth=okIdLoose(ls.pAth)}}catch(e){}
function cleanHidden(h){var o={};Object.keys(h||{}).forEach(function(k){if(h[k]&&TILES[k])o[k]=true});return o}
function viewLayout(){return {order:L.order.slice(),size:clone(L.size),collapsed:clone(L.collapsed||{}),hidden:cleanHidden(L.hidden)}}
function sameLayout(a,b){return JSON.stringify([a.order,a.size,a.collapsed||{},cleanHidden(a.hidden)])===JSON.stringify([b.order,b.size,b.collapsed||{},cleanHidden(b.hidden)])}
function applyLayout(v){v=migrateLayoutObj(clone(v));var o=(v.order||[]).filter(function(id){return TILES[id]});Object.keys(TILES).forEach(function(id){if(o.indexOf(id)<0)o.push(id)});
  L.order=o;L.size=Object.assign({},DEF_LAYOUT.size,v.size||{});L.collapsed=clone(v.collapsed||{});L.hidden=cleanHidden(v.hidden);if(Object.keys(TILES).every(function(k){return L.hidden[k]}))L.hidden={}}
function currentView(){return D.views.find(function(v){return sameLayout(v.layout,viewLayout())})||null}
D.views.forEach(function(v){v.layout=migrateLayoutObj(v.layout)});
(function(){var sv=D.startView&&D.views.find(function(v){return v.id===D.startView});if(sv)applyLayout(sv.layout)})();
function saveLayout(){try{localStorage.setItem(LS_LAYOUT,JSON.stringify(L))}catch(e){}}
var reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/* FLIP: remember where each tile is on screen, change the layout, then slide every tile from its old spot to its new one */
function flip(mutate,skip){
  var before={};document.querySelectorAll('#tiles .tile').forEach(function(t){before[t.dataset.tile]=t.getBoundingClientRect()});
  mutate();if(reduceMotion)return;
  var moving=[];
  document.querySelectorAll('#tiles .tile').forEach(function(t){var id=t.dataset.tile,b=before[id];if(!b||id===skip)return;
    t.style.transition='none';t.style.transform='';var a=t.getBoundingClientRect(),dx=b.left-a.left,dy=b.top-a.top;
    if(Math.abs(dx)<1&&Math.abs(dy)<1)return;t.style.transform='translate('+dx+'px,'+dy+'px)';moving.push(t)});
  if(!moving.length)return;document.body.offsetWidth;
  moving.forEach(function(t){t.style.transition='transform 280ms cubic-bezier(.2,.8,.2,1)';t.style.transform='';
    t.addEventListener('transitionend',function h(){t.style.transition='';t.removeEventListener('transitionend',h)})});
}

/* ---- timeline: where each section falls on the music, and on the original video ---- */
function spb(){return 60/(R.bpm||150)}
function timeline(){var t=R.musicStart||0,o=t,out=[];R.sections.forEach(function(s){var v=activeVar(s),v0=s.variants[0],len=v.eights.length*8*spb(),olen=v0.eights.length*8*spb();
  out.push({s:s,v:v,start:t,end:t+len,ostart:o,oend:o+olen,alt:v!==v0});t+=len;o+=olen});return out}
function routineSecs(){return flat().length*8*spb()}
function eightStart(n){return (R.musicStart||0)+n*8*spb()}
function total(){if(R.audio)return R.audio.dur||audioEl.duration||MAX_SECS;var end=(R.musicStart||0)+routineSecs();if(VIDEO_ON&&R.video)end=Math.max(end,(R.video.dur||0)-(R.videoOffset||0));return Math.max(1,end)}
function beatAt(t){var b=(t-(R.musicStart||0))/spb(),r=Math.round(b);return Math.abs(b-r)<1e-6?r:b}
function videoTarget(t){
  var tl=timeline();if(!tl.length)return null;
  var base=function(vt){return R.video?{key:'base',time:vt+(R.videoOffset||0),dur:R.video.dur,label:'Original video'}:{msg:''}};
  if(t<tl[0].start)return base(t);
  for(var i=0;i<tl.length;i++){var g=tl[i];if(t<g.end){
    if(g.alt){if(g.v.video)return {key:g.v.id,time:t-g.start+(g.v.videoOffset||0),dur:g.v.video.dur,label:'Alternate clip · '+secLabel(g.s)};
      return {msg:'No clip for '+secLabel(g.s)+' yet. Upload one in Music & video, or switch back to '+g.s.variants[0].label+'.'}}
    return base(g.ostart+(t-g.start))}}
  var last=tl[tl.length-1];return base(last.oend+(t-last.end));
}

/* ---- playback ---- */
var audioEl=new Audio();audioEl.preload='auto';
var vids={}, T=0, playing=false, raf=0, t0=0, scrubbing=false, range=null, loop=false;
function loadAudio(){audioEl.pause();if(R.audio){audioEl.src=BLOB(R.audio.id)}else{audioEl.removeAttribute('src');try{audioEl.load()}catch(e){}}}
audioEl.addEventListener('ended',function(){if(!playing)return;if(loop){seek(range?range.a:0);audioEl.play().catch(function(){})}else pause()});
audioEl.addEventListener('error',function(){if(R.audio)setMsg('The song file didn’t load. Check your connection, or upload it again.',true)});
function clockNow(){return R.audio?audioEl.currentTime:(performance.now()-t0)/1000}
var lastMsg=null;
function syncVideos(force){
  var tg=videoTarget(T),key=tg&&tg.key&&vids[tg.key]?tg.key:null,keys=Object.keys(vids);
  keys.forEach(function(k){var v=vids[k];if(k!==key){if(!v.paused)v.pause();v.hidden=true}});
  var msgEl=document.getElementById('vidMsg'),cap=document.getElementById('vidCap');
  var html=!keys.length?'<div><p>Add a video of the routine and it plays here, in step with the music and the mat.</p><button class="btn small" data-act="upVideo"'+(assetsApi?'':' disabled')+'>Upload video</button></div>'
    :(!key&&tg&&tg.msg?'<div><p>'+esc(tg.msg)+'</p></div>':'');
  if(msgEl&&html!==lastMsg){lastMsg=html;msgEl.innerHTML=html;msgEl.hidden=!html}
  if(cap)cap.textContent=key?tg.label:'';
  if(!key)return;
  var v=vids[key],vd=tg.dur||v.duration||0,t=tg.time;v.hidden=false;
  if(t<0||(vd&&t>vd)){if(!v.paused)v.pause();var c=Math.max(0,Math.min(vd||0,t));if(Math.abs(v.currentTime-c)>0.05){try{v.currentTime=c}catch(e){}}return}
  if(force||Math.abs(v.currentTime-t)>0.25){try{v.currentTime=t}catch(e){}}
  if(playing&&v.paused){var p=v.play();if(p&&p.catch)p.catch(function(){if(!v.muted){v.muted=true;v.play().catch(function(){})}})}
  if(!playing&&!v.paused)v.pause();
}
function play(){
  if(playing){pause();return}
  var end=range&&range.b!=null?range.b:total();
  if(range&&(T<range.a-0.01||T>=end-0.05))T=range.a;else if(T>=end-0.05)T=range?range.a:0;
  playing=true;updatePlayBtn();
  if(R.audio){audioEl.currentTime=T;var p=audioEl.play();if(p&&p.catch)p.catch(function(){playing=false;updatePlayBtn();flash('The song is still loading. Tap Play again in a moment.')})}
  else t0=performance.now()-T*1000;
  syncVideos(true);
  cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);
}
function pause(){playing=false;audioEl.pause();Object.keys(vids).forEach(function(k){vids[k].pause()});cancelAnimationFrame(raf);updatePlayBtn();updateLive(true)}
function tick(){if(!playing)return;T=clockNow();
  var end=Math.min(range&&range.b!=null?range.b:Infinity,total());
  if(T>=end){if(loop){seek(range?range.a:0);if(R.audio&&audioEl.paused)audioEl.play().catch(function(){})}else{T=end;pause();return}}
  syncVideos(false);updateLive(false);raf=requestAnimationFrame(tick)}
function seek(t){
  T=Math.max(0,Math.min(total(),t));
  if(R.audio){try{audioEl.currentTime=T}catch(e){}}else t0=performance.now()-T*1000;
  syncVideos(true);updateLive(true);
}
function playRange(a,b,label){if(playing)pause();range={a:a,b:b,label:label};updateRangeUI();seek(a);play()}
function clearRange(){range=null;updateRangeUI()}
function updateRangeUI(){var el=document.getElementById('rangeBox');if(!el)return;
  el.innerHTML=range?'<span class="rangechip">'+esc(range.label)+'<button class="ib" data-act="clearRange" aria-label="Back to the full routine">✕</button></span>':'<span class="sub">Full routine</span>'}
function ease(k){return k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2}
/* travel from one formation to the next follows a curve: start → (midpoint + bend offset) → end */
function pathAt(p0,p1,off,u){var cx=(p0[0]+p1[0])/2+(off?off[0]:0),cy=(p0[1]+p1[1])/2+(off?off[1]:0),v=1-u;
  return [v*v*p0[0]+2*v*u*cx+u*u*p1[0],v*v*p0[1]+2*v*u*cy+u*u*p1[1]]}
function clampMat(q){return [Math.max(0,Math.min(54,q[0])),Math.max(0,Math.min(42,q[1]))]}
function pathD(p0,p1,off){var cx=(p0[0]+p1[0])/2+(off?off[0]:0),cy=(p0[1]+p1[1])/2+(off?off[1]:0);
  return 'M'+p0[0].toFixed(2)+' '+p0[1].toFixed(2)+'Q'+cx.toFixed(2)+' '+cy.toFixed(2)+' '+p1[0].toFixed(2)+' '+p1[1].toFixed(2)}
/* ---- traffic: athletes who cross too close, share a spot, or must sprint ---- */
var TOO_CLOSE=1.8, SAME_SPOT=1.5, SPRINT=11;
function trafficFor(f,k){var e=f[k].e,a=k>0?f[k-1].e:null,out=[],N=33,paths={},moved={};
  R.athletes.forEach(function(x,i){var q=posOf(e,x,i),p=a?posOf(a,x,i):q,off=(e.bend||{})[x.id],pts=[];
    for(var s0=0;s0<N;s0++)pts.push(a?clampMat(pathAt(p,q,off,moveT(e,x.id,8*s0/(N-1)))):q);paths[x.id]=pts;
    var len=0;for(var s1=1;s1<N;s1++)len+=Math.hypot(pts[s1][0]-pts[s1-1][0],pts[s1][1]-pts[s1-1][1]);moved[x.id]=len;
    if(a&&len/(8*spb())>SPRINT)out.push({type:'sprint',ids:[x.id],at:q,text:x.name.trim()+' travels '+Math.round(len)+' ft in one 8-count. That’s a full sprint.'})});
  for(var i=0;i<R.athletes.length;i++)for(var j=i+1;j<R.athletes.length;j++){var A=R.athletes[i],B=R.athletes[j];
    if(GROUPS_ON&&A.group&&A.group===B.group)continue;var pa=paths[A.id],pb=paths[B.id],end=Math.hypot(pa[N-1][0]-pb[N-1][0],pa[N-1][1]-pb[N-1][1]);
    if(end<SAME_SPOT){out.push({type:'overlap',ids:[A.id,B.id],at:pa[N-1],text:A.name.trim()+' and '+B.name.trim()+' end up on the same spot.'});continue}
    if(!a||(moved[A.id]<.5&&moved[B.id]<.5))continue;
    var best=1e9,bs=0,startD=Math.hypot(pa[0][0]-pb[0][0],pa[0][1]-pb[0][1]);for(var s2=0;s2<N;s2++){var dd=Math.hypot(pa[s2][0]-pb[s2][0],pa[s2][1]-pb[s2][1]);if(dd<best){best=dd;bs=s2}}
    /* a real crossing: they come together and then separate again (not two athletes meeting up or splitting off) */
    if(best<TOO_CLOSE&&best<startD-.6&&best<end-.6){var cnt=Math.min(8,1+Math.floor(bs/(N-1)*8));
      out.push({type:'cross',ids:[A.id,B.id],at:[(pa[bs][0]+pb[bs][0])/2,(pa[bs][1]+pb[bs][1])/2],text:A.name.trim()+' and '+B.name.trim()+' pass '+best.toFixed(1)+' ft apart on count '+cnt+'.'})}}
  return out}
var trafficCache=null;
function allTraffic(){var f=flat(),key=JSON.stringify([R.id,R.bpm,f.map(function(r){return [r.e.id,r.e.pos,r.e.bend,r.e.move,r.e.moveBy]}),R.athletes.map(function(a){return [a.id,a.group]})]);
  if(trafficCache&&trafficCache.key===key)return trafficCache.v;var v={},n=0;f.forEach(function(r,k){var t=trafficFor(f,k);v[r.e.id]=t;n+=t.length});v.total=n;trafficCache={key:key,v:v};return v}
/* bend handles: one per moving athlete, or one per stunt group that moves together */
function bendTargets(e,prev){var out=[],done={},sp=spotAth();
  RG().forEach(function(g){var ms=membersOf(g.id);if(ms.length<2)return;var d0=null,same=true;
    ms.forEach(function(a){var i=R.athletes.indexOf(a),p=posOf(prev,a,i),q=posOf(e,a,i),d=[q[0]-p[0],q[1]-p[1]];if(!d0)d0=d;else if(Math.abs(d[0]-d0[0])>.6||Math.abs(d[1]-d0[1])>.6)same=false});
    if(same&&Math.hypot(d0[0],d0[1])>.5&&(!sp||ms.indexOf(sp)>=0)){var lead=flyerOf(g.id)||ms[0];out.push({gid:g.id,ids:ms.map(function(a){return a.id}),lead:lead});ms.forEach(function(a){done[a.id]=1})}});
  R.athletes.forEach(function(a,i){if(done[a.id]||(sp&&sp!==a))return;var p=posOf(prev,a,i),q=posOf(e,a,i);if(Math.hypot(q[0]-p[0],q[1]-p[1])>.5)out.push({ids:[a.id],lead:a})});
  return out}
function setBend(e,ids,off){if(!e.bend)e.bend={};ids.forEach(function(id){if(off&&Math.hypot(off[0],off[1])>.3)e.bend[id]=[r2(off[0]),r2(off[1])];else delete e.bend[id]})}
function posAtBeat(b,f){
  var k=Math.floor(b/8),u=b-8*k;if(k<0){k=0;u=8}if(k>=f.length){k=f.length-1;u=8}
  var a=k>0?f[k-1].e:f[k].e,e=f[k].e,o={};
  R.athletes.forEach(function(x,i){var p=posOf(a,x,i),q=posOf(e,x,i);o[x.id]=a===e?q:clampMat(pathAt(p,q,(e.bend||{})[x.id],moveT(e,x.id,u)))});
  return o;
}
var liveCountKey='';
function updateLive(force){
  var f=flat();if(!f.length)return;
  var b=beatAt(T),k=Math.floor(b/8),count=b>=0?Math.floor(b-8*k)+1:0,inRange=b>=0&&k<f.length,kk=Math.max(0,Math.min(f.length-1,k));
  if(playing||force){if(f[kk].e.id!==cur||force){cur=f[kk].e.id;refreshCurrent()}}
  liveBeat=b-8*Math.max(0,Math.min(f.length-1,k));
  if(playing)renderMat(posAtBeat(b,f));else if(force)renderMat();
  /* the count highlights only change 8 times per 8-count, not every frame */
  var ck0=(inRange?count:0)+'|'+kk;
  if(force||ck0!==liveCountKey){liveCountKey=ck0;
    document.querySelectorAll('.cell').forEach(function(c,i){c.classList.toggle('now',inRange&&i===count-1)});
    var pips=document.getElementById('pips');
    if(pips)Array.prototype.forEach.call(pips.children,function(p,i){p.className=inRange?(i===count-1?'on':(i<count-1?'past':'')):''})}
  var nl=document.getElementById('nowLbl');
  if(nl)nl.textContent=b<0?('Count 1 in '+(-(b*spb())).toFixed(1)+'s'):(k>=f.length?'End of routine':(secLabel(f[kk].s)+' · 8-count '+(kk+1)+' · count '+count));
  var ck=document.getElementById('clock');if(ck)ck.textContent=fmtT(T)+' / '+fmt(total());
  var sc=document.getElementById('scrub');if(sc&&!scrubbing){sc.max=String(total());sc.value=String(T)}
}
function refreshCurrent(){
  var it=find(cur);
  for(var i=0;i<8;i++){var c=document.getElementById('c'+i);if(c&&document.activeElement!==c)c.value=it.e.counts[i]||''}
  var n=document.getElementById('note');if(n&&document.activeElement!==n)n.value=it.e.note||'';
  document.querySelectorAll('.erow').forEach(function(r){r.classList.toggle('on',r.dataset.id===cur)});
  var ed=document.getElementById('eightEditor'),li=document.querySelector('.eights li[data-eight="'+cur+'"]');
  if(ed&&li&&ed.parentNode!==li&&!PHONE){li.appendChild(ed);document.querySelectorAll('#eightEditor .tag').forEach(function(t){var on=(it.e.tags||[]).indexOf(t.dataset.k)>=0;t.classList.toggle('on',on);t.setAttribute('aria-pressed',on)})}
  updateTitles();
}
function updatePlayBtn(){var b=document.getElementById('playBtn');if(b)b.textContent=playing?'❚❚ Pause':'▶ Play'}

/* ---- persistent pieces: video stack, mat, transport ---- */
var vidWrap=document.createElement('div');vidWrap.className='tbody';
vidWrap.innerHTML='<div class="vidbox" id="vidbox"><div class="vidmsg" id="vidMsg"></div></div><div class="vidcap" id="vidCap"></div>';
var matWrap=document.createElement('div');matWrap.className='tbody';
(function(){var spots='';for(var k=0;k<9;k++)spots+='<text class="spot" x="'+(3+k*6)+'" y="45.2">'+(k+1)+'</text>';
  var lines='';for(var j=1;j<9;j++)lines+='<line class="pl" x1="'+(j*6)+'" y1="0" x2="'+(j*6)+'" y2="42"/>';
  for(var c=0;c<9;c++)lines+='<line class="cl" x1="'+(3+c*6)+'" y1="0" x2="'+(3+c*6)+'" y2="42"/>';
  matWrap.innerHTML='<div class="frontwrap" id="frontBox" hidden><svg id="front" viewBox="0 0 64 40" role="img" aria-label="Front view of the formation, as the judges see it"></svg></div>'
   +'<div class="matwrap" id="matBox"><svg id="mat" viewBox="-2 -4 58 51" role="img" aria-label="Competition mat with athlete positions">'
   +'<rect class="edge" x="-2" y="-4" width="58" height="51"/><rect x="0" y="0" width="54" height="42" fill="var(--mat)"/>'+lines
   +'<text class="side" x="27" y="-1.4">BACK OF MAT</text><text class="side" x="27" y="46.6">FRONT · JUDGES</text>'+spots
   +'<g id="spotPath"></g><g id="ghosts"></g><g id="traffic"></g><line id="guide" x1="0" y1="0" x2="0" y2="42" visibility="hidden"/><g id="dots"></g><g id="gboxes"></g><g id="bends"></g><rect id="marquee" class="marquee" x="0" y="0" width="0" height="0" visibility="hidden"/></svg><button class="zoomreset" id="zoomReset" data-act="zoomReset" hidden>Reset zoom</button></div>'
   +'<div class="ctl"><label class="tog"><input type="checkbox" id="ghostTog" data-f="ghost" checked> Show moves from last 8-count</label>'
   +'<label class="tog"><input type="checkbox" id="freeTog" data-f="free"> Free move</label>'
   +'<label class="tog"><input type="checkbox" id="trafTog" data-f="traf" checked> Traffic warnings</label>'
   +'<button class="btn small" id="selBtn" data-act="selMode">Select athletes</button>'
   +'<label class="tog">Spotlight <select class="field" id="spotSel" data-f="spot" style="width:auto"></select></label>'
   +(GROUPS_ON?'<button class="btn small" data-act="formAll" title="Every stunt group lines up for a lift in this 8-count">Form lifts</button>':'')+'</div>'
   +'<div class="ctl ftools"><span class="fl">Formation</span><button class="btn small" data-act="fCopy" title="Copy this 8-count’s formation">Copy</button><button class="btn small" data-act="fPaste" title="Paste the copied formation into this 8-count (only the selected athletes, if any are selected)">Paste</button><button class="btn small" data-act="fMirror" title="Flip left to right (only the selected athletes, if any are selected)">Mirror ↔</button><button class="btn small" data-act="fLine" title="Put the selected athletes in a straight row or column">Line up</button><button class="btn small" data-act="fSpace" title="Space the selected athletes evenly">Space evenly</button></div>'
   +'<div class="selbar" id="selBar" hidden></div><div id="trafficBox"></div>'
   +'<div class="legend">'+ROLES.map(function(r){return '<span><i style="background:var(--'+r.toLowerCase()+')"></i>'+r+'</span>'}).join('')+'<span>Judges sit at the bottom, spots 1–9.</span></div>'
   +'<p class="hint help">Athletes snap to a panel line or the center of a panel (over its number). Turn on Free move to place them anywhere. Drag athletes into each 8-count’s formation, or drag a box around several to group them. During playback they travel there on counts 1–4, then hold. Drag the small round handle on a travel path to bend it around other athletes; double-tap the handle to straighten it. Front view shows the 8-count as the judges see it, with lifts at the height noted in building notes.</p>'})();
var transportEl=document.createElement('div');transportEl.className='transport';
transportEl.innerHTML='<div class="tin"><div class="trow"><button class="btn primary playbtn" id="playBtn" data-act="play">▶ Play</button>'
  +'<button class="btn small" data-act="prev" aria-label="Previous 8-count">‹</button><button class="btn small" data-act="next" aria-label="Next 8-count">›</button><button class="btn small runbtn" data-act="runOpen" aria-label="Full-screen run-through" title="Full-screen run-through (F)">⤢</button>'
  +'<input type="range" id="scrub" data-f="scrub" min="0" step="0.01" value="0" aria-label="Position in routine"><span class="clock" id="clock"></span></div>'
  +'<div class="trow"><span class="now" id="nowLbl"></span><span class="pips" id="pips"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>'
  +'<span id="rangeBox"></span><span id="spotBox"></span><label class="tog" style="margin-left:auto"><input type="checkbox" id="loopTog" data-f="loop"> Loop</label></div></div>';
document.body.appendChild(transportEl);
function buildVideos(){
  Object.keys(vids).forEach(function(k){try{vids[k].pause()}catch(e){}vids[k].remove()});vids={};lastMsg=null;
  var box=vidWrap.querySelector('#vidbox');
  function add(key,info,eager){var v=document.createElement('video');v.playsInline=true;v.setAttribute('playsinline','');v.preload=eager?'auto':'metadata';v.muted=!!R.audio;v.hidden=true;
    v.addEventListener('loadedmetadata',function(){syncVideos(true)});
    v.addEventListener('error',function(){setMsg('A video didn’t load. Check your connection, or upload it again.',true)});
    v.src=BLOB(info.id);box.insertBefore(v,box.firstChild);vids[key]=v}
  if(VIDEO_ON){if(R.video)add('base',R.video,true);
  R.sections.forEach(function(s){s.variants.forEach(function(v,i){if(i>0&&v.video)add(v.id,v.video,false)})})}
  syncVideos(true);
}

/* ---- scoresheet planning ---- */
function sheetCats(){var sh=SHEETS[R.sheet.tpl]||SHEETS.allstar,cats=sh.cats.slice();
  if(R.sheet.custom.length)cats=cats.concat([{cat:'Your items',items:R.sheet.custom.map(function(c){return {k:c.k,n:c.n,need:c.need,custom:true}})}]);return cats}
function sheetItems(){var out=[];sheetCats().forEach(function(c){out=out.concat(c.items)});return out}
/* building notes (pyramid notation): per 8-count, each stunt group's skill and the count it hits, plus which groups connect */
var STUNT_SKILLS=['Load','Prep','Extension','Lib','Heel stretch','Arabesque','Scale','Scorpion','Bow and arrow','Needle','Tick-tock','Full up','Cradle','Twist down','Thigh stand','Shoulder sit','Chair','Basket toss','Toe touch basket','Kick double basket'];
function liveLinks(e){return (e.links||[]).filter(function(l){return RG().some(function(g){return g.id===l[0]})&&RG().some(function(g){return g.id===l[1]})})}
function isLinked(e,a,b){return liveLinks(e).some(function(l){return (l[0]===a&&l[1]===b)||(l[0]===b&&l[1]===a)})}
function flyerOf(gid){var ms=membersOf(gid);return ms.find(function(a){return a.role==='Flyer'})||ms[0]||null}
function buildText(e){var b=e.build||{},lk=liveLinks(e),parent={};
  RG().forEach(function(g){parent[g.id]=g.id});function root(x){while(parent[x]!==x)x=parent[x];return x}
  lk.forEach(function(l){parent[root(l[0])]=root(l[1])});var comps={},order=[];
  RG().forEach(function(g){var has=b[g.id]&&b[g.id].skill,linked=lk.some(function(l){return l[0]===g.id||l[1]===g.id});if(!has&&!linked)return;
    var r=root(g.id);if(!comps[r]){comps[r]=[];order.push(r)}comps[r].push(g)});
  return order.map(function(r){var gs=comps[r],t=gs.map(function(g){var x=b[g.id]||{};return g.name+' '+(x.skill||'?')+(x.count?' ('+x.count+')':'')}).join(' ⟷ ');return gs.length>1?'Pyramid: '+t:t}).join(' · ')}
function derivedTags(e){var b=e.build||{},stunt=false,toss=false,out=[];
  RG().forEach(function(g){var x=b[g.id];if(x&&x.skill){if(/toss|basket/i.test(x.skill))toss=true;else stunt=true}});
  if(stunt)out.push('stunt');if(toss)out.push('toss');if(liveLinks(e).length)out.push('pyr');return out}
function skillsNoted(){var seen={},out=[];flat().forEach(function(r){var b=r.e.build||{};RG().forEach(function(g){var x=b[g.id];if(x&&x.skill&&!/toss|basket/i.test(x.skill)){var k=x.skill.trim().toLowerCase();if(!seen[k]){seen[k]=1;out.push(x.skill.trim())}}})});return out}
function coverage(){var m={},keys={};sheetItems().forEach(function(x){keys[x.k]=1});
  flat().forEach(function(r,n){var ks={};(r.e.tags||[]).forEach(function(k){ks[k]=1});derivedTags(r.e).forEach(function(k){if(keys[k])ks[k]=1});
    Object.keys(ks).forEach(function(k){(m[k]=m[k]||[]).push({id:r.e.id,n:n+1})})});return m}
/* athlete spotlight: one athlete's spot in every 8-count (kept on this device only) */
function spotAth(){return L.spot?R.athletes.find(function(a){return a.id===L.spot})||null:null}
function spotText(e,a){var i=R.athletes.indexOf(a),p=posOf(e,a,i),x=p[0],y=p[1],k=x/6,where;
  if(Math.abs(k-Math.round(k))<0.01&&x>0&&x<54)where='line '+Math.round(k)+'|'+(Math.round(k)+1);else where='spot '+Math.min(9,Math.floor(x/6)+1);
  var t=where+' · '+Math.max(0,Math.round(42-y))+' ft from front',g=groupOf(a),bx=g&&(e.build||{})[g.id];
  if(bx&&bx.skill)t+=' · '+g.name+' '+bx.skill+(bx.count?' on '+bx.count:'');return t}
function updateSpotUI(){var sel=document.getElementById('spotSel'),sp=spotAth();
  if(sel){sel.innerHTML='<option value="">Everyone</option>'+R.athletes.map(function(a){return '<option value="'+a.id+'"'+(sp===a?' selected':'')+'>'+esc(a.name)+'</option>'}).join('')}
  var bx=document.getElementById('spotBox');if(bx)bx.innerHTML=sp?'<span class="rangechip">★ '+esc(sp.name)+'<button class="ib" data-act="spotOff" aria-label="Turn off the spotlight">✕</button></span>':''}
/* routine files: export and import */
var FILE_FORMAT='cheer-playbook';
function okId(x){return typeof x==='string'&&/^[A-Za-z0-9_-]{1,40}$/.test(x)}
function okAsset(m){return m&&typeof m==='object'&&typeof m.id==='string'&&/^[0-9a-f]{32}$/.test(m.id)?{id:m.id,name:String(m.name||'Media').slice(0,80),dur:Math.max(0,+m.dur||0)}:null}
function num(x,lo,hi,d){x=+x;return isFinite(x)?Math.max(lo,Math.min(hi,x)):d}
function cleanEight(e){if(!e||!okId(e.id))return null;
  var out={id:e.id,counts:[0,1,2,3,4,5,6,7].map(function(i){return String((e.counts||[])[i]||'').slice(0,80)}),note:String(e.note||'').slice(0,2000),pos:{},tags:[],build:{},links:[]};
  if(e.pos&&typeof e.pos==='object')Object.keys(e.pos).forEach(function(k){var p=e.pos[k];if(okId(k)&&Array.isArray(p))out.pos[k]=[num(p[0],0,54,27),num(p[1],0,42,21)]});
  if(Array.isArray(e.tags))out.tags=e.tags.filter(function(t){return typeof t==='string'&&/^[A-Za-z0-9_-]{1,44}$/.test(t)});
  if(e.build&&typeof e.build==='object')Object.keys(e.build).forEach(function(k){var b=e.build[k];if(okId(k)&&b&&typeof b==='object')out.build[k]={skill:String(b.skill||'').slice(0,40),count:Math.round(num(b.count,0,8,0))}});
  var mw=cleanWin(e.move);if(mw)out.move=mw;if(e.moveBy&&typeof e.moveBy==='object'){out.moveBy={};Object.keys(e.moveBy).forEach(function(k){var w=cleanWin(e.moveBy[k]);if(okId(k)&&w)out.moveBy[k]=w})}
  out.bend={};if(e.bend&&typeof e.bend==='object')Object.keys(e.bend).forEach(function(k){var b=e.bend[k];if(okId(k)&&Array.isArray(b))out.bend[k]=[num(b[0],-40,40,0),num(b[1],-40,40,0)]});
  if(Array.isArray(e.links))out.links=e.links.filter(function(l){return Array.isArray(l)&&okId(l[0])&&okId(l[1])&&l[0]!==l[1]}).map(function(l){return [l[0],l[1]]});
  return out}
function cleanRoutine(r,inner){if(!r||typeof r!=='object'||!Array.isArray(r.sections)||!r.sections.length)return null;
  var o={id:okId(r.id)?r.id:uid(),name:String(r.name||'Imported routine').slice(0,80),bpm:Math.round(num(r.bpm,60,220,150)*10)/10,musicStart:num(r.musicStart,0,600,0),videoOffset:num(r.videoOffset,-600,600,0),
    music:typeof r.music==='string'&&/^https?:\/\//i.test(r.music)?r.music.slice(0,500):'',audio:okAsset(r.audio),video:okAsset(r.video),athletes:[],groups:[],sections:[],versions:[],sheet:{tpl:'allstar',custom:[]}};
  (Array.isArray(r.athletes)?r.athletes:[]).forEach(function(a){if(a&&okId(a.id))o.athletes.push({id:a.id,name:String(a.name||'Athlete').slice(0,60),role:ROLES.indexOf(a.role)>=0?a.role:'Base',group:okId(a.group)?a.group:null})});
  (Array.isArray(r.groups)?r.groups:[]).forEach(function(g,i){if(g&&okId(g.id))o.groups.push({id:g.id,name:String(g.name||'Group').slice(0,40),color:/^#[0-9a-f]{6}$/i.test(g.color)?g.color:GROUP_COLORS[i%GROUP_COLORS.length],noBox:g.noBox===true||undefined})});
  o.athletes.forEach(function(a){if(a.group&&!o.groups.some(function(g){return g.id===a.group}))a.group=null});
  for(var i=0;i<r.sections.length;i++){var sc=r.sections[i];if(!sc||!okId(sc.id))return null;
    var vs=Array.isArray(sc.variants)?sc.variants:[{id:uid(),label:'A',eights:sc.eights}],nv=[];
    for(var j=0;j<vs.length;j++){var v=vs[j];if(!v||(v.id!=null&&!okId(v.id))||!Array.isArray(v.eights))return null;var es=v.eights.map(cleanEight);if(!es.length||es.some(function(x){return !x}))return null;
      nv.push({id:v.id||uid(),label:String(v.label||LETTERS[j]||'A').slice(0,3),eights:es,video:okAsset(v.video),videoOffset:num(v.videoOffset,0,600,0)})}
    o.sections.push({id:sc.id,name:String(sc.name||'Section').slice(0,60),variants:nv,active:okId(sc.active)?sc.active:nv[0].id})}
  if(r.sheet&&typeof r.sheet==='object'){if(SHEETS[r.sheet.tpl])o.sheet.tpl=r.sheet.tpl;
    if(Array.isArray(r.sheet.custom))o.sheet.custom=r.sheet.custom.filter(function(c){return c&&typeof c.k==='string'&&/^c_[A-Za-z0-9_-]{1,40}$/.test(c.k)}).map(function(c){return {k:c.k,n:String(c.n||'Item').slice(0,60),need:Math.round(num(c.need,1,20,1))}})}
  if(!inner&&Array.isArray(r.versions))r.versions.forEach(function(v){if(!v||!okId(v.id))return;var d=cleanRoutine(v.data,true);if(!d)return;
    o.versions.push({id:v.id,name:String(v.name||'Version').slice(0,80),at:num(v.at,0,4102444800000,Date.now()),data:{sections:d.sections,athletes:d.athletes,groups:d.groups,bpm:d.bpm,musicStart:d.musicStart,videoOffset:d.videoOffset,audio:d.audio,video:d.video,music:d.music}})});
  return o}
function exportRoutines(all){
  if(!downloadsApi){flash('Saving files isn’t available in this view. Open the playbook in claude.ai to export.');return}
  var list=(all?D.routines:[R]).map(function(r){var c=clone(r);delete c.sample;return c});
  var file={format:FILE_FORMAT,version:1,app:'Cheer Routine Playbook',exportedAt:new Date().toISOString(),routines:list,templates:clone(D.templates)};
  var base=all?'Cheer playbook':(R.name||'Routine'),name=String(base).replace(/[\\\/:*?"<>|]+/g,'').trim()+' '+new Date().toISOString().slice(0,10)+'.json';
  downloadsApi.save({filename:name,data:JSON.stringify(file,null,1)}).then(function(res){flash(res&&res.status==='delivered'?'Routine file sent.':'Routine file saved. Keep it somewhere safe as a backup.')})
   .catch(function(e){var c=e&&e.code;flash(c==='declined'?'Routine file not saved.':c==='rate_limited'?'A save prompt is already open. Finish it, then try again.':'Saving the routine file didn’t work in this view.')})}
function importRoutines(){
  pickFile('.json,application/json',function(f){
    if(f.size>8*1024*1024){flash('That file is too big to be a routine file.');return}
    var fr=new FileReader();fr.onerror=function(){flash('That file couldn’t be read. Try again.')};
    fr.onload=function(){var x;try{x=JSON.parse(fr.result)}catch(e){flash('That file isn’t a routine file. Choose a .json file exported from this playbook.');return}
      var list=x&&Array.isArray(x.routines)?x.routines:(x&&Array.isArray(x.sections)?[x]:null),tAdded=0;
      if(x&&Array.isArray(x.templates))x.templates.forEach(function(t){var c=cleanTemplate(t);if(!c)return;if(D.templates.some(function(o){return o.id===c.id}))return;D.templates.push(c);tAdded++});
      if((!list||!list.length)&&tAdded){markDirty();render();flash('Imported '+tAdded+' 8-count template'+(tAdded>1?'s':'')+'. Tap Save to keep them.');return}
      if(!list||!list.length){flash('That file isn’t a routine file. Choose a .json file exported from this playbook.');return}
      var added=[],bad=0;
      list.forEach(function(r){var c=cleanRoutine(r,false);if(!c){bad++;return}fixRoutine(c);
        if(D.routines.some(function(o){return o.id===c.id}))c.id=uid();
        if(D.routines.some(function(o){return o.name===c.name}))c.name=c.name+' (imported)';
        D.routines.push(c);added.push(c)});
      if(!added.length){flash('Nothing in that file could be imported. It may be damaged or from a different app.');return}
      ensureTeams();markDirty();switchTo(added[0].id);
      flash('Imported '+added.length+' routine'+(added.length>1?'s':'')+(tAdded?' and '+tAdded+' template'+(tAdded>1?'s':''):'')+(bad?' ('+bad+' skipped)':'')+'. Tap Save to keep '+(added.length>1||tAdded?'them':'it')+'.')};
    fr.readAsText(f)})}
/* 8-count templates */
function makeTemplate(e,name){return {id:uid(),name:name,at:Date.now(),counts:e.counts.slice(),note:e.note||'',tags:(e.tags||[]).slice(),
  athletes:R.athletes.map(function(a,i){return {id:a.id,name:a.name,role:a.role,group:a.group||null,pos:posOf(e,a,i).slice()}}),
  groups:R.groups.map(function(g){return {id:g.id,name:g.name}}),build:clone(e.build||{}),links:clone(liveLinks(e))}}
function mapAthletes(ta){var map={},used={},left=R.athletes.slice();
  function pass(test){left=left.filter(function(a){var t=ta.find(function(x){return !used[x.id]&&test(a,x)});if(t){map[a.id]=t;used[t.id]=1;return false}return true})}
  pass(function(a,x){return a.id===x.id});pass(function(a,x){return a.name.trim().toLowerCase()===String(x.name).trim().toLowerCase()});pass(function(a,x){return a.role===x.role});
  return map}
function mapGroups(tg){var map={},used={};
  tg.forEach(function(t){var g=R.groups.find(function(x){return !used[x.id]&&x.id===t.id})||R.groups.find(function(x){return !used[x.id]&&x.name.trim().toLowerCase()===String(t.name).trim().toLowerCase()});if(g){map[t.id]=g.id;used[g.id]=1}});
  tg.forEach(function(t){if(map[t.id])return;var g=R.groups.find(function(x){return !used[x.id]});if(g){map[t.id]=g.id;used[g.id]=1}});return map}
function applyTemplate(t,e,o){var matched=0;
  if(o.c){e.counts=t.counts.slice();e.note=t.note;e.tags=t.tags.slice()}
  if(o.f){var m=mapAthletes(t.athletes);R.athletes.forEach(function(a){var x=m[a.id];if(x){e.pos[a.id]=x.pos.slice();matched++}})}
  if(o.b){var gm=mapGroups(t.groups);e.build={};Object.keys(t.build||{}).forEach(function(k){if(gm[k])e.build[gm[k]]=clone(t.build[k])});
    e.links=(t.links||[]).map(function(l){return [gm[l[0]],gm[l[1]]]}).filter(function(l){return l[0]&&l[1]&&l[0]!==l[1]})}
  return matched}
function tplOpts(){var g=function(id){var el=document.getElementById(id);return el?el.checked:true};return {c:g('tplC'),f:g('tplF'),b:g('tplB')}}
function cleanTemplate(t){if(!t||!okId(t.id))return null;var e=cleanEight({id:t.id,counts:t.counts,note:t.note,tags:t.tags,build:t.build,links:t.links,pos:{}});if(!e)return null;
  return {id:t.id,name:String(t.name||'Template').slice(0,60),at:num(t.at,0,4102444800000,Date.now()),counts:e.counts,note:e.note,tags:e.tags,build:e.build,links:e.links,
    athletes:(Array.isArray(t.athletes)?t.athletes:[]).filter(function(a){return a&&okId(a.id)&&Array.isArray(a.pos)}).map(function(a){return {id:a.id,name:String(a.name||'').slice(0,60),role:ROLES.indexOf(a.role)>=0?a.role:'Base',group:okId(a.group)?a.group:null,pos:[num(a.pos[0],0,54,27),num(a.pos[1],0,42,21)]}}),
    groups:(Array.isArray(t.groups)?t.groups:[]).filter(function(g){return g&&okId(g.id)}).map(function(g){return {id:g.id,name:String(g.name||'Group').slice(0,40)}})}}

/* re-render without losing the caret in the box being typed in */
var softT=0;
function softRender(delay){clearTimeout(softT);softT=setTimeout(function(){var fe=document.activeElement,id=fe&&fe.id,a=null,b=null;try{a=fe.selectionStart;b=fe.selectionEnd}catch(e){}
  render();if(id){var el=document.getElementById(id);if(el){el.focus();try{if(a!=null)el.setSelectionRange(a,b)}catch(e){}}}},delay||0)}
function sheetWarnings(cov){var w=[],secs=routineSecs(),mx=maxSecs();
  if(secs>mx+0.5)w.push('The routine runs about '+fmt(secs)+', over the '+fmt(mx)+' limit for this scoresheet.');
  if(R.sheet.tpl==='gameday'){var run=0,best=0,prev=-2;(cov.fightskill||[]).forEach(function(h){run=h.n===prev+1?run+1:1;prev=h.n;best=Math.max(best,run)});
    if(best>3)w.push('Fight song skills run '+best+' 8-counts in a row. Game Day allows up to 3 consecutive 8-counts.')}
  if(GROUPS_ON&&(cov.stunt||cov.pyr||cov.toss)&&!R.groups.length&&R.athletes.length)w.push('Stunts are planned but no stunt groups are set up yet. Groups make building sections easier to place on the mat.');
  return w}

/* ---- rendering ---- */
var DEVTAG='<span class="devtag">Beta</span>';
var CB_LOGO='<img class="cblogo" src="icons/logo.svg" alt="Cheerbook">';
/* ---- app pages around the editor: routines home, teams & roster, athlete profile, athlete view, library, account ----
   Teams own the roster. A routine linked to a team (r.teamId) keeps a working copy of the team's athletes and groups;
   edits in the editor flow back to the team and on to its other routines, and edits on the Teams page flow out to every routine. */
var NAV=[['home','Routines'],['teams','Teams'],['part','Athlete view'],['library','Library'],['account','Account']];
var view=({home:1,teams:1,team:1,ath:1,part:1,library:1,account:1,editor:1})[L.view]?L.view:'home';
var homeQ='',homeTeam='',homeArch=false,homeMenu=null,newOpen=false,delOpen=false,libUsage=null,libAssets=null;
var SKILLS=[
  ['Standing tumbling',['Back walkover','Back handspring','Back handspring series','Standing back tuck','Back handspring back tuck','Standing full','Back handspring full','Standing double full']],
  ['Running tumbling',['Round off','Round off back handspring','Round off back handspring tuck','Round off back handspring layout','Round off back handspring full','Round off back handspring double full','Punch front','Whip']]];
function countSkills(m){m=m||{};var n=0;SKILLS.forEach(function(c){c[1].forEach(function(k){if(m[k])n++})});return n}
var LEVELS=['','Level 1','Level 2','Level 3','Level 4','Level 5','Level 6','Level 7','Novice','Prep','School','Other'];
function liveRoutines(){return D.routines.filter(function(r){return !r.deletedAt})}
function teamById(id){return id?D.teams.find(function(t){return t.id===id})||null:null}
function teamOf(r){return r?teamById(r.teamId):null}
function routinesOf(t){return liveRoutines().filter(function(r){return r.teamId===t.id})}
function withR(r,fn){var keep=R;R=r;try{return fn()}finally{R=keep}}
function rLen(r){var n=0;r.sections.forEach(function(s){n+=activeVar(s).eights.length});return {n:n,secs:n*8*60/(r.bpm||150)}}
function rScore(r){return withR(r,function(){var cov=coverage(),d=0,t=0;sheetItems().forEach(function(x){t++;if((cov[x.k]||[]).length>=(x.need||1))d++});return {d:d,t:t}})}
function rMax(r){return (SHEETS[r.sheet&&r.sheet.tpl]||SHEETS.allstar).max}
function ago(t){if(!t)return '';var s=(Date.now()-t)/1000;if(s<60)return 'just now';if(s<3600)return Math.round(s/60)+' min ago';if(s<86400)return Math.round(s/3600)+' h ago';
  return new Date(t).toLocaleDateString([],{month:'short',day:'numeric'})}
function moveMat(r,e,aid,from,bend){var lines='';for(var j=1;j<9;j++)lines+='<line class="pl" x1="'+j*6+'" y1="0" x2="'+j*6+'" y2="42"/>';
  var me=null,dots=r.athletes.map(function(a,i){var p=e.pos[a.id]||defaultPos(i);if(a.id===aid){me=[p,a];return ''}return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="1.5" class="r-'+String(a.role).toLowerCase()+'" opacity=".26"/>'}).join('');
  var mv='';if(me&&from){var p=me[0],cx=(from[0]+p[0])/2+(bend?bend[0]:0),cy=(from[1]+p[1])/2+(bend?bend[1]:0),dx=p[0]-cx,dy=p[1]-cy,L0=Math.sqrt(dx*dx+dy*dy);
    if(L0<.01){dx=p[0]-from[0];dy=p[1]-from[1];L0=Math.sqrt(dx*dx+dy*dy)||1}var ux=dx/L0,uy=dy/L0,tx=p[0]-ux*2.9,ty=p[1]-uy*2.9,bx=tx-ux*2.2,by=ty-uy*2.2;
    mv='<circle cx="'+from[0]+'" cy="'+from[1]+'" r="1.9" class="pghost"/><path d="'+pathD(from,p,bend)+'" class="ppath"/>'
      +'<polygon class="parrow" points="'+tx.toFixed(2)+','+ty.toFixed(2)+' '+(bx-uy*1.3).toFixed(2)+','+(by+ux*1.3).toFixed(2)+' '+(bx+uy*1.3).toFixed(2)+','+(by-ux*1.3).toFixed(2)+'"/>'}
  var mine=me?'<circle cx="'+me[0][0]+'" cy="'+me[0][1]+'" r="2.6" class="r-'+String(me[1].role).toLowerCase()+'" stroke="#ffe066" stroke-width=".7"/>':'';
  return '<svg class="mini pmat" viewBox="-1 -1 56 44" aria-hidden="true" focusable="false"><rect x="-1" y="-1" width="56" height="44" fill="var(--mat)"/>'+lines+dots+mv+mine+'</svg>'}
function miniMat(r,e,hl){e=e||(r.sections[0]&&activeVar(r.sections[0]).eights[0]);if(!e)return '';
  var lines='';for(var j=1;j<9;j++)lines+='<line class="pl" x1="'+j*6+'" y1="0" x2="'+j*6+'" y2="42"/>';
  var dots=r.athletes.map(function(a,i){var p=e.pos[a.id]||defaultPos(i),lit=hl===a.id;
    return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+(lit?2.6:1.7)+'" class="r-'+String(a.role).toLowerCase()+'"'+(hl&&!lit?' opacity=".28"':'')+(lit?' stroke="#ffe066" stroke-width=".7"':'')+'/>'}).join('');
  return '<svg class="mini" viewBox="0 0 54 42" aria-hidden="true" focusable="false"><rect width="54" height="42" fill="var(--mat)"/>'+lines+dots+'</svg>'}
function fixTeam(t){if(!Array.isArray(t.athletes))t.athletes=[];if(!Array.isArray(t.groups))t.groups=[];if(!t.skills||typeof t.skills!=='object')t.skills={};if(!t.notes||typeof t.notes!=='object')t.notes={};
  if(typeof t.level!=='string')t.level='';if(typeof t.season!=='string')t.season='';if(!t.name)t.name='Team';return t}
/* every routine with athletes belongs to a team; ids are derived from the routine so every device makes the same team */
function ensureTeams(){var ch=false;if(!Array.isArray(D.teams)){D.teams=[];ch=true}if(!D.profile||typeof D.profile!=='object'){D.profile={};ch=true}
  D.teams.forEach(fixTeam);
  D.routines.forEach(function(r){if(r.teamId||!r.athletes||!r.athletes.length)return;
    var ids=r.athletes.map(function(a){return a.id});
    var t=D.teams.find(function(x){var tid=x.athletes.map(function(a){return a.id}),o=ids.filter(function(i){return tid.indexOf(i)>=0}).length;return o>0&&o>=Math.min(ids.length,tid.length)*0.5});
    if(!t){t=fixTeam({id:'team-'+r.id,name:(r.name||'Routine').replace(/\s*\(sample\)\s*$/i,'')+' team',athletes:clone(r.athletes),groups:clone(r.groups||[])});D.teams.push(t)}
    r.teamId=t.id;ch=true});
  var cut=Date.now()-30*864e5,before=D.routines.length;
  D.routines=D.routines.filter(function(r){return !(r.deletedAt&&r.deletedAt<cut)});if(D.routines.length!==before)ch=true;
  if(!D.routines.length){var nb=fixRoutine(blankRoutine([]));D.routines.push(nb);ch=true}
  return ch}
function applyTeam(t,skip){D.routines.forEach(function(r){if(r.teamId!==t.id||r===skip)return;r.athletes=clone(t.athletes);r.groups=clone(t.groups)})}
function pushTeamFromRoutine(r){var t=teamOf(r);if(!t)return;t.athletes=clone(r.athletes);t.groups=clone(r.groups||[]);applyTeam(t,r)}
function goView(v){if(playing)pause();if(v!=='editor'){selMode=false;sel=[]}view=v;L.view=v;saveLayout();gearOpen=false;moreOpen=false;viewsOpen=false;pdfOpen=false;render();try{window.scrollTo(0,0)}catch(e){}}
function openRoutine(id){var r=D.routines.find(function(x){return x.id===id});if(!r)return;if(r.deletedAt)return;view='editor';L.view='editor';saveLayout();switchTo(id);try{window.scrollTo(0,0)}catch(e){}}
function pageDirty(){markDirty()}
function teamOpts(sel,none){return (none?'<option value="">'+none+'</option>':'')+D.teams.map(function(t){return '<option value="'+t.id+'"'+(t.id===sel?' selected':'')+'>'+esc(t.name)+'</option>'}).join('')}
function brandLogo(){var p=D.profile||{};return (p.logo?'<img class="plogo" src="'+esc(BLOB(p.logo.id))+'" alt="">':'')+(p.program?'<span class="pprog">'+esc(p.program)+'</span>':'')}
function pageHeader(){var cv=view==='team'||view==='ath'?'teams':view;
  return '<header class="top"><div class="brandrow">'+CB_LOGO+'<b class="cbword">cheer<span>book</span></b>%%DEVTAG%%'+brandLogo()
   +'<span class="status" id="status"></span><button class="btn small" id="undoBtn" data-act="undo" title="Undo" aria-label="Undo">↶<span class="undoTxt"> Undo</span></button><button class="btn small" id="redoBtn" data-act="redo" title="Redo" aria-label="Redo">↷<span class="undoTxt"> Redo</span></button>'
   +'<button class="btn primary" id="saveBtn" data-act="save" hidden>Save</button></div>'
   +'<nav class="pnav" aria-label="Playbook">'+NAV.map(function(n){return '<button class="ptab'+(cv===n[0]?' on':'')+'" data-act="nav" data-id="'+n[0]+'"'+(cv===n[0]?' aria-current="page"':'')+'>'+n[1]+'</button>'}).join('')
   +'<button class="ptab" data-act="openR" data-id="'+esc(R.id)+'" title="Back to the routine you had open">Editor ›</button></nav></header>'}

/* ---------- Routines home ---------- */
function routineCard(r){var t=teamOf(r),len=rLen(r),sc=rScore(r),mx=rMax(r),m=homeMenu===r.id;
  return '<div class="rcard'+(r===R?' cur':'')+'"><button class="ropen" data-act="openR" data-id="'+r.id+'" aria-label="Open '+esc(r.name||'Untitled routine')+'">'+miniMat(r)
    +'<span class="rbody"><b>'+esc(r.name||'Untitled routine')+'</b><span class="sub">'+esc(t?t.name:'No team')+(t&&t.level?' · '+esc(t.level):'')+'</span>'
    +'<span class="sub">'+len.n+' eight-counts · '+fmt(len.secs)+' of '+fmt(mx)+(len.secs>mx+0.5?' · over':'')+'</span>'
    +'<span class="rscore"><span class="bar"><i style="width:'+(sc.t?Math.round(sc.d/sc.t*100):0)+'%"></i></span><span class="sub">'+sc.d+'/'+sc.t+' scoresheet</span></span>'
    +'<span class="sub">'+(r.updated?'Edited '+ago(r.updated):'')+'</span></span></button>'
    +'<button class="ib rmenu" data-act="rMenu" data-id="'+r.id+'" aria-expanded="'+m+'" aria-label="More for '+esc(r.name||'routine')+'">⋯</button>'
    +(m&&!PHONE?rMenuHtml(r):'')+'</div>'}
function rMenuHtml(r){return '<div class="rpanel"><label class="tog">Name <input class="field" id="rn-'+r.id+'" data-f="rnm" data-id="'+r.id+'" value="'+esc(r.name||'')+'" placeholder="Routine name" autocomplete="off"></label><label class="tog">Season <input class="field" id="rs-'+r.id+'" data-f="rseason" data-id="'+r.id+'" value="'+esc(r.season||'')+'" placeholder="e.g. 2026-27"></label>'
      +'<label class="tog">Team <select class="field" data-f="rteam" data-id="'+r.id+'">'+teamOpts(r.teamId,'No team')+'</select></label>'
      +'<div class="ctl"><button class="btn small" data-act="rDup" data-id="'+r.id+'">Duplicate</button><button class="btn small" data-act="rArch" data-id="'+r.id+'">'+(r.archived?'Unarchive':'Archive')+'</button>'
      +'<button class="btn small quiet" data-act="rDel" data-id="'+r.id+'">Delete</button></div></div>'}
function homePage(){
  var q=homeQ.trim().toLowerCase(),all=liveRoutines(),arch=all.filter(function(r){return r.archived}).length;
  var list=all.filter(function(r){return (homeArch?!!r.archived:!r.archived)&&(!homeTeam||r.teamId===homeTeam)&&(!q||((r.name||'')+' '+(r.season||'')+' '+((teamOf(r)||{}).name||'')).toLowerCase().indexOf(q)>=0)});
  list.sort(function(a,b){return (b.updated||0)-(a.updated||0)});
  var seasons=[];list.forEach(function(r){var s=r.season||'';if(seasons.indexOf(s)<0)seasons.push(s)});
  var grid=seasons.map(function(s){var rs=list.filter(function(r){return (r.season||'')===s});
    return (seasons.length>1||s?'<h3 class="ph3">'+esc(s||'No season')+'</h3>':'')+'<div class="cards">'+rs.map(routineCard).join('')+'</div>'}).join('');
  var gone=D.routines.filter(function(r){return r.deletedAt});
  var tp=D.templates;
  var newPanel=newOpen?'<div class="pdfpanel" id="newPanel"><span class="fl">New routine</span>'
    +'<div class="mrow"><input class="field" id="nrName" placeholder="Routine name" aria-label="Routine name"></div>'
    +'<div class="mrow"><label class="tog">Team <select class="field" id="nrTeam">'+teamOpts(homeTeam||(teamOf(R)||{}).id,'No team (empty roster)')+'</select></label>'
    +'<label class="tog">Start from <select class="field" id="nrFrom"><option value="blank">A blank routine</option>'
    +all.map(function(r){return '<option value="copy:'+r.id+'">A copy of '+esc(r.name||'Untitled routine')+'</option>'}).join('')
    +tp.map(function(t){return '<option value="tpl:'+t.id+'">The template '+esc(t.name)+'</option>'}).join('')+'</select></label></div>'
    +'<div class="ctl"><button class="btn small primary" data-act="nrCreate">Create and open</button><button class="btn small" data-act="imp">Import a file instead</button><button class="btn small quiet" data-act="newOpen">Cancel</button></div></div>':'';
  if(PHONE&&newPanel){pageSheet+=sheetHtml(newPanel,'menu','New routine');newPanel=''}
  if(PHONE&&homeMenu){var hm=D.routines.find(function(r){return r.id===homeMenu});if(hm)pageSheet+=sheetHtml('<span class="fl">'+esc(hm.name||'Routine')+'</span>'+rMenuHtml(hm),'menu','Routine options')}
  return '<section class="page"><div class="phead"><h2 class="ptitle">Routines</h2><button class="btn primary" data-act="newOpen" aria-expanded="'+newOpen+'">+ New routine</button></div>'+newPanel
   +'<div class="mrow pfilters"><input class="field" id="homeQ" data-f="homeQ" type="search" value="'+esc(homeQ)+'" placeholder="Search routines" aria-label="Search routines">'
   +'<select class="field" data-f="hteam" aria-label="Filter by team"><option value="">All teams</option>'+teamOpts(homeTeam)+'</select>'
   +(arch||homeArch?'<label class="tog"><input type="checkbox" data-f="harch"'+(homeArch?' checked':'')+'> Archived ('+arch+')</label>':'')+'</div>'
   +(list.length?grid:'<p class="empty">'+(q||homeTeam?'No routines match.':homeArch?'Nothing archived.':'No routines yet. Tap + New routine to start one.')+'</p>')
   +(gone.length?'<div class="mgroup"><button class="btn small quiet" data-act="delOpen" aria-expanded="'+delOpen+'">'+(delOpen?'▾':'▸')+' Recently deleted ('+gone.length+')</button>'
     +(delOpen?'<ul class="vlist">'+gone.map(function(r){return '<li class="vitem"><b>'+esc(r.name||'Untitled routine')+'</b><span class="sub">Deleted '+ago(r.deletedAt)+' · removed for good after 30 days</span>'
       +'<span class="ctl" style="margin-left:auto"><button class="btn small" data-act="rRestore" data-id="'+r.id+'">Restore</button><button class="btn small quiet" data-act="rPurge" data-id="'+r.id+'">Delete now</button></span></li>'}).join('')+'</ul>':'')+'</div>':'')
   +H('Tap a routine to open it. ⋯ on a card sets its season and team, duplicates, archives or deletes it.')+'</section>'}

/* ---------- Teams ---------- */
function teamsPage(){
  return '<section class="page"><div class="phead"><h2 class="ptitle">Teams</h2><button class="btn primary" data-act="teamNew">+ New team</button></div>'
   +(D.teams.length?'<div class="cards">'+D.teams.map(function(t){var rs=routinesOf(t),fl=t.athletes.filter(function(a){return a.role==='Flyer'}).length;
      return '<div class="rcard"><button class="ropen" data-act="openTeam" data-id="'+t.id+'"><span class="tswatch">'+t.athletes.slice(0,12).map(function(a){return '<i style="background:var(--'+String(a.role).toLowerCase()+')"></i>'}).join('')+'</span>'
        +'<span class="rbody"><b>'+esc(t.name)+'</b><span class="sub">'+esc([t.level,t.season].filter(Boolean).join(' · ')||'No level set')+'</span>'
        +'<span class="sub">'+t.athletes.length+' athletes · '+fl+' flyers'+(GROUPS_ON?' · '+t.groups.length+' stunt groups':'')+'</span><span class="sub">'+rs.length+' routine'+(rs.length===1?'':'s')+'</span></span></button></div>'}).join('')+'</div>'
     :'<p class="empty">No teams yet. A team holds the roster that its routines share.</p>')
   +H('Every routine for a team uses the same roster. Change a name or role here and it changes in all of them.')+'</section>'}
function teamPage(){var t=teamById(L.pTeam);if(!t){view='teams';return teamsPage()}
  var rs=routinesOf(t),roleOpts=function(r){return ROLES.map(function(x){return '<option'+(x===r?' selected':'')+'>'+x+'</option>'}).join('')};
  var gOf=function(a){return GROUPS_ON?t.groups.find(function(g){return g.id===a.group}):null};
  return '<section class="page"><button class="btn small quiet" data-act="nav" data-id="teams">‹ Teams</button>'
   +'<input class="rname" id="tname" data-f="tname" value="'+esc(t.name)+'" aria-label="Team name" placeholder="Team name">'
   +'<div class="mrow"><label class="tog">Level <select class="field" data-f="tlevel">'+LEVELS.map(function(l){return '<option value="'+l+'"'+(t.level===l?' selected':'')+'>'+(l||'Not set')+'</option>'}).join('')+'</select></label>'
   +'<label class="tog">Season <input class="field" id="tseason" data-f="tseason" value="'+esc(t.season)+'" placeholder="e.g. 2026-27"></label></div>'
   +athleteLinkCard(t)
   +'<div class="card pcard"><div class="phead"><h2>Roster</h2><span class="sub">'+t.athletes.length+' athletes</span></div>'
   +(t.athletes.length?t.athletes.map(function(a){var g=gOf(a),sk=countSkills(t.skills[a.id]);
      return '<div class="ath tath"><span class="sw" style="background:var(--'+String(a.role).toLowerCase()+')">'+esc(initials(a.name))+'</span>'
       +'<input class="field aname" id="ta-'+a.id+'" data-f="tath" data-id="'+a.id+'" value="'+esc(a.name)+'" aria-label="Athlete name"'+(g?' style="color:'+g.color+';font-weight:700"':'')+'>'
       +'<select class="field" data-f="trole" data-id="'+a.id+'" aria-label="Role">'+roleOpts(a.role)+'</select>'
       +(GROUPS_ON?'<select class="field" data-f="tgrp" data-id="'+a.id+'" aria-label="Stunt group"><option value="">No group</option>'+t.groups.map(function(x){return '<option value="'+x.id+'"'+(a.group===x.id?' selected':'')+'>'+esc(x.name)+'</option>'}).join('')+'<option value="__new">+ New group</option></select>':'')
       +'<button class="btn small" data-act="openAth" data-id="'+a.id+'" title="Skills and notes">Profile'+(sk?' · '+sk:'')+' ›</button>'
       +'<button class="ib" data-act="tdelAth" data-id="'+a.id+'" aria-label="Remove '+esc(a.name)+'" title="Remove">✕</button></div>'}).join('')
     :'<p class="empty">No athletes yet.</p>')
   +'<div class="ctl"><button class="btn small" data-act="tAddAth">+ Add athlete</button></div></div>'
   +(!GROUPS_ON?'':''
   +'<div class="card pcard"><div class="phead"><h2>Stunt groups</h2></div>'
   +(t.groups.length?t.groups.map(function(g){var ms=t.athletes.filter(function(a){return a.group===g.id});
      return '<div class="grow"><span class="gsw" style="background:'+g.color+'"></span><input class="field" id="tg-'+g.id+'" data-f="tgname" data-id="'+g.id+'" value="'+esc(g.name)+'" aria-label="Group name"><span class="sub">'+ms.map(function(a){return esc(a.name)}).join(', ')+'</span>'
       +'<span class="ctl"><button class="btn small quiet" data-act="tdelGrp" data-id="'+g.id+'">Ungroup</button></span></div>'}).join('')
     :'<p class="note">No stunt groups. Pick “+ New group” next to an athlete to start one.</p>')+'</div>')
   +'<div class="card pcard"><div class="phead"><h2>Routines</h2></div>'
   +(rs.length?'<div class="ctl">'+rs.map(function(r){return '<button class="btn small" data-act="openR" data-id="'+r.id+'">'+esc(r.name||'Untitled routine')+' ›</button>'}).join('')+'</div>':'<p class="note">No routines use this team yet.</p>')
   +'<div class="ctl"><button class="btn small" data-act="teamRoutine">+ New routine for this team</button><button class="btn small" data-act="partTeam">Athlete view ›</button>'
   +'<button class="btn small quiet" data-act="teamDel">Delete team</button></div></div>'
   +H('Positions on the mat stay with each routine. Removing an athlete here takes them out of every routine for this team.')+'</section>'}
function athPage(){var t=teamById(L.pTeam),a=t&&t.athletes.find(function(x){return x.id===L.pAth});if(!a){view='team';return teamPage()}
  var mine=t.skills[a.id]||{},g=GROUPS_ON?t.groups.find(function(x){return x.id===a.group}):null,got=countSkills(mine),tot=0;
  var cats=SKILLS.map(function(c){var have=c[1].filter(function(k){return mine[k]}).length;tot+=c[1].length;
    return '<div class="card pcard"><div class="phead"><h2>'+esc(c[0])+'</h2><span class="sub">'+have+' of '+c[1].length+'</span></div><div class="skills">'
      +c[1].map(function(k){var d=mine[k];return '<label class="skill'+(d?' on':'')+'"><input type="checkbox" data-f="tskill" data-k="'+esc(k)+'"'+(d?' checked':'')+'> <span>'+esc(k)+'</span>'+(d?'<span class="sub">'+esc(d)+'</span>':'')+'</label>'}).join('')+'</div></div>'}).join('');
  return '<section class="page"><button class="btn small quiet" data-act="openTeam" data-id="'+t.id+'">‹ '+esc(t.name)+'</button>'
   +'<div class="phead"><span class="sw big" style="background:var(--'+String(a.role).toLowerCase()+')">'+esc(initials(a.name))+'</span><div style="display:grid;min-width:0"><h2 class="ptitle">'+esc(a.name)+'</h2>'
   +'<span class="sub">'+esc(a.role)+(g?' · <b style="color:'+g.color+'">'+esc(g.name)+'</b>':'')+' · '+got+' of '+tot+' skills landed</span></div></div>'
   +'<label class="fl" for="tnote">Notes</label><textarea class="field" id="tnote" data-f="tnote" placeholder="Strengths, things to work on, injuries to watch">'+esc(t.notes[a.id]||'')+'</textarea>'
   +'<div class="ctl"><button class="btn small" data-act="partAth">See their part in every routine ›</button></div>'
   +cats+H('Tick a skill when they land it; the date is saved with it. Untick to clear it.')+'</section>'}

/* ---------- Athlete view: one athlete's part across every routine of their team ---------- */
function partPage(){
  var t=teamById(L.pTeam)||D.teams[0]||null;if(t&&L.pTeam!==t.id)L.pTeam=t.id;
  var a=t?(t.athletes.find(function(x){return x.id===L.pAth})||t.athletes[0]):null;
  var head='<section class="page"><div class="phead"><h2 class="ptitle">Athlete view</h2></div>'
   +'<div class="mrow"><label class="tog">Team <select class="field" data-f="pteam">'+teamOpts(t&&t.id)+'</select></label>'
   +(t?'<label class="tog">Athlete <select class="field" data-f="path">'+t.athletes.map(function(x){return '<option value="'+x.id+'"'+(a===x?' selected':'')+'>'+esc(x.name)+'</option>'}).join('')+'</select></label>':'')+'</div>';
  if(!t||!a)return head+'<p class="empty">Add a team with athletes first.</p></section>';
  var rs=routinesOf(t);
  /* one block per place the athlete stands: a mat showing the move into it (dashed path from where they were), then every 8-count spent there */
  var body=rs.map(function(r,ri){return withR(r,function(){var f=flat(),i=R.athletes.findIndex(function(z){return z.id===a.id});if(i<0)return '';var ath=R.athletes[i];
      var blocks=[];f.forEach(function(x,n){var p=posOf(x.e,ath,i),bl=blocks[blocks.length-1];
        if(bl&&Math.abs(p[0]-bl.p[0])<.01&&Math.abs(p[1]-bl.p[1])<.01)bl.rows.push({x:x,n:n});else blocks.push({p:p,from:bl?bl.p:null,bend:(x.e.bend||{})[a.id]||null,rows:[{x:x,n:n}]})});
      var html=blocks.map(function(bl,bi){var r0=bl.rows[0],r1=bl.rows[bl.rows.length-1],where=spotText(r0.x.e,ath).split(' · ').slice(0,2).join(' · ');
        var range=bl.rows.length>1?'8-counts '+(r0.n+1)+'–'+(r1.n+1):'8-count '+(r0.n+1);
        var mv=bl.from?'Moves here on '+winLabel(moveWin(r0.x.e,a.id))+' of 8-count '+(r0.n+1):'Starting spot';
        return '<li class="pblock">'+moveMat(r,r0.x.e,a.id,bl.from,bl.bend)
          +'<div class="pbody"><div class="phd"><b>'+esc(where)+'</b><span class="sub">'+range+' · '+fmt(eightStart(r0.n))+'</span><span class="pmove'+(bl.from?' go':'')+'">'+esc(mv)+'</span></div>'
          +'<ol class="pcounts">'+bl.rows.map(function(o){var e=o.x.e,g=groupOf(ath),bx=g&&(e.build||{})[g.id];
            return '<li><span class="pn">'+(o.n+1)+'</span><span class="etxt"><span class="lbl">'+esc(secLabel(o.x.s))+' · '+fmt(eightStart(o.n))+'</span><span class="sum">'+esc(summary(e))+'</span>'
              +(bx&&bx.skill?'<span class="spotline">'+esc(g.name+' '+bx.skill+(bx.count?' on '+bx.count:''))+'</span>':'')+(e.note?'<span class="bline">'+esc(e.note)+'</span>':'')+'</span></li>'}).join('')+'</ol></div></li>'}).join('');
    return '<details class="card pcard"'+(ri===0?' open':'')+'><summary><b>'+esc(r.name||'Untitled routine')+'</b> <span class="sub">'+f.length+' eight-counts · '+blocks.length+' spot'+(blocks.length===1?'':'s')+'</span></summary>'
      +'<div class="ctl"><button class="btn small" data-act="partOpen" data-id="'+r.id+'">Open with spotlight</button><button class="btn small" data-act="partPdf" data-id="'+r.id+'">PDF for '+esc(a.name)+'</button></div>'
      +'<ol class="plist">'+html+'</ol></details>'})}).join('');
  return head+(rs.length?body:'<p class="empty">'+esc(t.name)+' has no routines yet.</p>')
   +H('This is what an athlete needs: their spot in every 8-count, the counts, and their group’s skill. Send them the PDF, or open the routine with their spotlight on.')+'</section>'}

/* ---------- Library ---------- */
function libraryPage(){
  var media=[];liveRoutines().forEach(function(r){if(r.audio)media.push(['Song',r.audio,r]);if(VIDEO_ON&&r.video)media.push(['Video',r.video,r]);
    r.sections.forEach(function(s){s.variants.forEach(function(v,i){if(VIDEO_ON&&i&&v.video)media.push(['Clip · '+(s.name||'Section')+' '+v.label,v.video,r])})})});
  var u=libUsage,mb=function(b){return (b/1048576).toFixed(1)+' MB'};
  return '<section class="page"><div class="phead"><h2 class="ptitle">Library</h2></div>'
   +'<div class="card pcard"><div class="phead"><h2>8-count templates</h2><span class="sub">'+D.templates.length+'</span></div>'
   +(D.templates.length?'<ul class="vlist">'+D.templates.map(function(t){return '<li class="vitem"><input class="field" id="tp-'+t.id+'" data-f="tplname" data-id="'+t.id+'" value="'+esc(t.name)+'" aria-label="Template name" style="flex:1 1 180px">'
       +'<span class="sub" style="flex:1 1 200px">'+esc(summary(t))+' · '+(t.athletes||[]).length+' athletes</span><button class="btn small quiet" data-act="tplDel" data-id="'+t.id+'">Delete</button></li>'}).join('')+'</ul>'
     :'<p class="note">No templates yet. Open an 8-count in a routine and use Templates › Save as template.</p>')+'</div>'
   +'<div class="card pcard"><div class="phead"><h2>'+(VIDEO_ON?'Songs &amp; videos':'Songs')+'</h2>'+(u?'<span class="sub">'+u.files+' files · '+mb(u.bytes)+' of '+mb(u.maxBytes)+'</span>':'')+'</div>'
   +(u?'<span class="bar" style="width:100%"><i style="width:'+Math.min(100,Math.round(u.bytes/Math.max(1,u.maxBytes)*100))+'%"></i></span>':'')
   +(media.length?'<ul class="vlist">'+media.map(function(m){return '<li class="vitem"><b>'+esc(m[1].name||'Media')+'</b><span class="sub">'+esc(m[0])+' · '+fmt(m[1].dur)+' · '+esc(m[2].name||'Routine')+'</span>'
       +'<span class="ctl" style="margin-left:auto"><button class="btn small" data-act="openR" data-id="'+m[2].id+'">Open routine</button></span></li>'}).join('')+'</ul>'
     :'<p class="note">'+(VIDEO_ON?'No songs or videos yet. Add them in a routine’s Setup › Music &amp; video.':'No songs yet. Add one in a routine’s Setup › Music.')+'</p>')+'</div>'
   +'<div class="card pcard"><div class="phead"><h2>Saved views</h2><span class="sub">'+D.views.length+'</span></div>'
   +(D.views.length?'<ul class="vlist">'+D.views.map(function(v){return '<li class="vitem"><input class="field" id="vn-'+v.id+'" data-f="vwname" data-id="'+v.id+'" value="'+esc(v.name)+'" aria-label="View name" style="flex:1 1 180px">'
       +(D.startView===v.id?'<span class="sub">★ starting view</span>':'')+'<button class="btn small quiet" data-act="vwDel" data-id="'+v.id+'">Delete</button></li>'}).join('')+'</ul>'
     :'<p class="note">No saved views. In a routine, arrange the tiles and use ⚙ › Saved views.</p>')+'</div>'
   +H('Templates and views are shared by every routine in this playbook.')+'</section>'}

/* ---------- Account ---------- */
function accountPage(){var p=D.profile||{},st=document.getElementById('status');
  return '<section class="page"><div class="phead"><h2 class="ptitle">Account</h2></div>'
   +'<div class="card pcard"><div class="phead"><h2>Coach &amp; program</h2></div>'
   +'<div class="mrow"><label class="tog">Your name <input class="field" id="pname" data-f="pname" value="'+esc(p.name||'')+'" placeholder="Coach name"></label>'
   +'<label class="tog">Program <input class="field" id="pprog" data-f="pprog" value="'+esc(p.program||'')+'" placeholder="Gym or school"></label></div>'
   +'<div class="mrow">'+(p.logo?'<img class="plogo big" src="'+esc(BLOB(p.logo.id))+'" alt="Program logo"><button class="btn small" data-act="upLogo"'+(assetsApi?'':' disabled')+'>Replace logo</button><button class="btn small quiet" data-act="delLogo">Remove</button>'
     :'<button class="btn small" data-act="upLogo"'+(assetsApi?'':' disabled')+'>Upload logo</button><span class="note">Shows at the top of every page.</span>')+'</div></div>'
   +'<div class="card pcard"><div class="phead"><h2>New routine defaults</h2></div>'
   +'<div class="mrow"><label class="tog">Scoresheet <select class="field" data-f="pdsheet">'+Object.keys(SHEETS).map(function(k){return '<option value="'+k+'"'+((p.sheet||'allstar')===k?' selected':'')+'>'+esc(SHEETS[k].name)+'</option>'}).join('')+'</select></label>'
   +'<label class="tog">BPM <input class="field num" id="pdbpm" data-f="pdbpm" type="number" min="60" max="220" inputmode="numeric" value="'+(p.bpm||150)+'"></label></div></div>'
   +'<div class="card pcard"><div class="phead"><h2>Appearance</h2></div><div class="ctl">'
   +['system','light','dark'].map(function(k){return '<button class="chip'+((L.theme||'system')===k?' on':'')+'" data-act="setTheme" data-id="'+k+'" aria-pressed="'+((L.theme||'system')===k)+'">'+{system:'Match device',light:'Light',dark:'Dark'}[k]+'</button>'}).join('')
   +'<label class="tog"><input type="checkbox" data-f="phelp"'+(L.help?' checked':'')+'> Show help text</label></div></div>'
   +'<div class="card pcard"><div class="phead"><h2>Your data</h2><span class="sub" id="acctSync"></span></div>'
   +'<p class="note">Everything saves automatically and stays in step on every device that opens this playbook.</p>'
   +'<div class="ctl"><button class="btn small" data-act="expAll">⇩ Export everything</button><button class="btn small" data-act="imp">⇧ Import a file</button></div></div>'
   +accountCloudHtml()
   +'</section>'}

/* ---- swipe between the page tabs on touch screens: the page follows the finger, then slides out and the next one slides in ---- */
var swipe=null,swipeIn=0;
function navIndex(){var v=view==='team'||view==='ath'?'teams':view;for(var i=0;i<NAV.length;i++)if(NAV[i][0]===v)return i;return -1}
function swipeTarget(el){if(!el||!el.closest)return true;
  if(el.closest('input,textarea,select,button.ib,[contenteditable],.pnav,.rpanel'))return true;
  for(var n=el;n&&n!==app;n=n.parentElement){if(n.scrollWidth>n.clientWidth+4){var ox=getComputedStyle(n).overflowX;if(ox==='auto'||ox==='scroll')return true}}return false}
app.addEventListener('touchstart',function(e){
  if(e.touches.length!==1)return;var tabMode=view==='editor';if(tabMode&&!(PHONE&&e.target.closest&&e.target.closest('#mpanel')))return;if(!tabMode&&navIndex()<0)return;if(e.target.closest&&e.target.closest('.bsw'))return;var t=e.touches[0];
  if(t.clientX<24||t.clientX>window.innerWidth-24||swipeTarget(e.target))return;
  var pg=tabMode?document.getElementById('mpanel'):app.querySelector('.page');if(!pg)return;
  swipe={x:t.clientX,y:t.clientY,t:performance.now(),dx:0,on:false,dead:false,pg:pg,tab:tabMode,i:tabMode?mtabIndex():navIndex(),len:tabMode?MTABS.length:NAV.length}},{passive:true});
app.addEventListener('touchmove',function(e){if(!swipe||swipe.dead)return;var t=e.touches[0],dx=t.clientX-swipe.x,dy=t.clientY-swipe.y;
  if(!swipe.on){if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){swipe.dead=true;return}if(Math.abs(dx)<12)return;swipe.on=true;swipe.pg.style.transition='none';swipe.pg.style.willChange='transform'}
  if(e.cancelable)e.preventDefault();
  var edge=(dx>0&&swipe.i===0)||(dx<0&&swipe.i===swipe.len-1);swipe.dx=edge?dx*0.25:dx;
  swipe.pg.style.transform='translateX('+swipe.dx+'px)';swipe.pg.style.opacity=String(1-Math.min(.35,Math.abs(swipe.dx)/window.innerWidth*.5))},{passive:false});
function endSwipe(){var s=swipe;swipe=null;if(!s||!s.on)return;var w=window.innerWidth,v=Math.abs(s.dx)/Math.max(1,performance.now()-s.t),dir=s.dx<0?1:-1,ni=s.i+dir;
  var go=ni>=0&&ni<s.len&&(Math.abs(s.dx)>w*0.22||(v>0.45&&Math.abs(s.dx)>40));
  if(!go||reduceMotion){s.pg.style.transition=reduceMotion?'none':'transform 220ms cubic-bezier(.2,.8,.2,1),opacity 220ms';s.pg.style.transform='';s.pg.style.opacity='';
    if(go)goSwipe(s,ni,0);return}
  s.pg.style.transition='transform 180ms cubic-bezier(.4,0,1,1),opacity 180ms';s.pg.style.transform='translateX('+(-dir*w)+'px)';s.pg.style.opacity='0';
  setTimeout(function(){goSwipe(s,ni,dir)},170)}
function goSwipe(s,ni,dir){if(s.tab){mtabIn=dir||0;L.mtab=MTABS[ni][0];saveLayout();render()}else{swipeIn=dir||0;goView(NAV[ni][0])}}
app.addEventListener('touchend',endSwipe);app.addEventListener('touchcancel',endSwipe);
/* after a page renders from a swipe, slide it in from the side it came from and keep its tab in view */
function afterPageRender(){var pg=app.querySelector('.page'),tab=app.querySelector('.ptab.on');
  if(tab&&tab.scrollIntoView){try{tab.scrollIntoView({block:'nearest',inline:'center',behavior:reduceMotion?'auto':'smooth'})}catch(e){}}
  if(!pg||!swipeIn)return;var dir=swipeIn;swipeIn=0;
  pg.style.transition='none';pg.style.transform='translateX('+(dir*window.innerWidth*0.35)+'px)';pg.style.opacity='0';pg.offsetWidth;
  pg.style.transition='transform 260ms cubic-bezier(.2,.8,.2,1),opacity 220ms';pg.style.transform='';pg.style.opacity='';
  setTimeout(function(){pg.style.transition='';pg.style.willChange=''},280)}
function renderPage(){pageSheet='';
  if(app.contains(transportEl))document.body.appendChild(transportEl);
  var html=view==='teams'?teamsPage():view==='team'?teamPage():view==='ath'?athPage():view==='part'?partPage():view==='library'?libraryPage():view==='account'?accountPage():homePage();
  if(PHONE){var ch=phonePageChrome();app.innerHTML='<div class="wrap">'+ch.top.replace('%%DEVTAG%%',DEVTAG)+html+'</div>'+ch.nav+pageSheet;endSheets()}
  else app.innerHTML='<div class="wrap">'+pageHeader().replace('%%DEVTAG%%',DEVTAG)+html+'</div>';
  document.body.classList.toggle('help-on',!!L.help);applyTheme();updateStatus();updateUndo();
  var as=document.getElementById('acctSync');if(as){var s2=document.getElementById('status');as.textContent=s2?s2.textContent:''}
  afterPageRender();
  if(view==='library'&&assetsApi&&!libUsage&&!libAssets){libAssets=true;assetsApi.list().then(function(x){libUsage=x&&x.usage||null;if(view==='library')render()}).catch(function(){})}}
function pageAct(act,id,b){
  switch(act){
  case 'nav':goView(id);return true;
  case 'mtab':{var oi=mtabIndex();L.mtab=id;saveLayout();var ni2=mtabIndex();mtabIn=ni2>oi?1:ni2<oi?-1:0;render();return true}
  case 'closeSheet':closeSheet(id);return true;
  case 'fCopy':case 'fPaste':case 'fMirror':case 'fLine':case 'fSpace':formationAct(act);return true;
  case 'mvClear':{var e5=find(cur).e;delete e5.moveBy;markDirty();refreshTraffic();render();flash('Everyone in this 8-count travels on '+winLabel(e5.move||[1,MOVE])+'.');return true}
  case 'selMove':{if(!sel.length)return true;var e6=find(cur).e,wa=+(document.getElementById('selMvA')||{}).value||1,wb=+(document.getElementById('selMvB')||{}).value||MOVE;if(wb<wa)wb=wa;
    var base=e6.move||[1,MOVE];e6.moveBy=e6.moveBy||{};sel.forEach(function(id){if(wa===base[0]&&wb===base[1])delete e6.moveBy[id];else e6.moveBy[id]=[wa,wb]});if(!Object.keys(e6.moveBy).length)delete e6.moveBy;
    markDirty();refreshTraffic();render();flash(sel.length+' athlete'+(sel.length===1?'':'s')+' now travel on '+winLabel([wa,wb])+' in this 8-count.');return true}
  case 'vexMenu':if(vexOpen&&!vex)vexOut=null;vexOpen=!vexOpen;moreOpen=false;gearOpen=false;render();return true;
  case 'vexStart':startVideo();return true;
  case 'vexCancel':vexCancel();return true;
  case 'vexShare':vexShare();return true;
  case 'vexSave':vexSave();return true;
  case 'vexAgain':vexOut=null;render();return true;
  case 'findBeat':if(R.audio)findBeat(R);else flash('Upload a song first.');return true;
  case 'prodX':moreOpen=false;render();exportProducer('xlsx');return true;
  case 'prodCsv':moreOpen=false;render();exportProducer('csv');return true;
  case 'renameR':gearOpen=true;moreOpen=false;viewsOpen=false;pdfOpen=false;render();setTimeout(function(){var n=document.getElementById('rname');if(n){n.focus();n.select()}},300);return true;
  case 'openR':openRoutine(id||R.id);return true;
  case 'rMenu':homeMenu=homeMenu===id?null:id;render();var rb=document.querySelector('[data-act="rMenu"][data-id="'+id+'"]');if(rb)rb.focus();return true;
  case 'newOpen':newOpen=!newOpen;render();if(newOpen){var nn=document.getElementById('nrName');if(nn)nn.focus()}return true;
  case 'delOpen':delOpen=!delOpen;render();return true;
  case 'nrCreate':{var nm=((document.getElementById('nrName')||{}).value||'').trim(),tid=(document.getElementById('nrTeam')||{}).value||'',from=(document.getElementById('nrFrom')||{}).value||'blank',t=teamById(tid),p=D.profile||{},nr;
    if(from.indexOf('copy:')===0){var src=D.routines.find(function(r){return r.id===from.slice(5)});if(!src)return true;nr=dupRoutine(src)}
    else{nr=blankRoutine(t?t.athletes:[]);nr.groups=t?clone(t.groups):[];nr.bpm=p.bpm||150;nr.sheet={tpl:SHEETS[p.sheet]?p.sheet:'allstar',custom:[]}}
    if(t&&nr.teamId!==t.id){nr.teamId=t.id;nr.athletes=clone(t.athletes);nr.groups=clone(t.groups)}else if(!t&&from==='blank')nr.teamId=null;
    if(from.indexOf('tpl:')===0){var tp=D.templates.find(function(x){return x.id===from.slice(4)});if(tp){var e0=activeVar(nr.sections[0]).eights[0];withR(nr,function(){applyTemplate(tp,e0,{c:true,f:true,b:true})})}}
    nr.name=nm||(from.indexOf('copy:')===0?nr.name:'Routine '+(liveRoutines().length+1));nr.season=(t&&t.season)||'';nr.updated=Date.now();
    D.routines.push(nr);newOpen=false;openRoutine(nr.id);markDirty();flash('Made “'+nr.name+'”.');return true}
  case 'rDup':{var s0=D.routines.find(function(r){return r.id===id});if(!s0)return true;var d0=dupRoutine(s0);d0.updated=Date.now();D.routines.splice(D.routines.indexOf(s0)+1,0,d0);homeMenu=null;pageDirty();render();flash('Made “'+d0.name+'”.');return true}
  case 'rArch':{var s1=D.routines.find(function(r){return r.id===id});if(!s1)return true;s1.archived=!s1.archived;homeMenu=null;pageDirty();render();flash(s1.archived?'Archived. Turn on Archived to see it again.':'Back with your routines.');return true}
  case 'rDel':{if(!confirmTap(b,'rd'+id))return true;var s2=D.routines.find(function(r){return r.id===id});if(!s2)return true;s2.deletedAt=Date.now();homeMenu=null;
    if(s2===R){var nx=liveRoutines()[0];if(nx){R=nx;D.cur=nx.id;cur=ev(R.sections[0])[0].id}}pageDirty();render();flash('Moved to Recently deleted. You can restore it for 30 days.');return true}
  case 'rRestore':{var s3=D.routines.find(function(r){return r.id===id});if(s3){delete s3.deletedAt;pageDirty();render();flash('Restored “'+(s3.name||'routine')+'”.')}return true}
  case 'rPurge':{if(!confirmTap(b,'rp'+id))return true;var i3=D.routines.findIndex(function(r){return r.id===id});if(i3<0)return true;
    if(D.routines.length===1){D.routines.push(fixRoutine(blankRoutine([])))}D.routines.splice(i3,1);if(!D.routines.some(function(r){return r===R})){R=liveRoutines()[0]||D.routines[0];D.cur=R.id;cur=ev(R.sections[0])[0].id}pageDirty();render();return true}
  case 'teamNew':{var nt=fixTeam({id:uid(),name:'Team '+(D.teams.length+1)});D.teams.push(nt);L.pTeam=nt.id;view='team';L.view='team';saveLayout();pageDirty();render();var tn=document.getElementById('tname');if(tn){tn.focus();tn.select()}return true}
  case 'openTeam':L.pTeam=id;goView('team');return true;
  case 'tAddAth':{var t1=teamById(L.pTeam);if(!t1)return true;var na={id:uid(),name:'New athlete',role:'Base',group:null};t1.athletes.push(na);applyTeam(t1);pageDirty();render();var ai=document.getElementById('ta-'+na.id);if(ai){ai.focus();ai.select()}return true}
  case 'tdelAth':{if(!confirmTap(b,'ta'+id))return true;var t2=teamById(L.pTeam);if(!t2)return true;t2.athletes=t2.athletes.filter(function(a){return a.id!==id});delete t2.skills[id];delete t2.notes[id];
    t2.groups=t2.groups.filter(function(g){return t2.athletes.some(function(a){return a.group===g.id})});applyTeam(t2);
    D.routines.forEach(function(r){if(r.teamId!==t2.id)return;r.sections.forEach(function(s){s.variants.forEach(function(v){v.eights.forEach(function(e){delete e.pos[id];if(e.bend)delete e.bend[id]})})})});pageDirty();render();return true}
  case 'tdelGrp':{var t3=teamById(L.pTeam);if(!t3)return true;t3.athletes.forEach(function(a){if(a.group===id)a.group=null});t3.groups=t3.groups.filter(function(g){return g.id!==id});applyTeam(t3);pageDirty();render();return true}
  case 'openAth':L.pAth=id;goView('ath');return true;
  case 'teamDel':{var t4=teamById(L.pTeam);if(!t4||!confirmTap(b,'td'+t4.id))return true;D.routines.forEach(function(r){if(r.teamId===t4.id)r.teamId=null});D.teams=D.teams.filter(function(x){return x!==t4});pageDirty();goView('teams');flash('Team deleted. Its routines keep their athletes.');return true}
  case 'teamRoutine':homeTeam=L.pTeam||'';newOpen=true;goView('home');var n2=document.getElementById('nrName');if(n2)n2.focus();return true;
  case 'partTeam':L.pAth=null;goView('part');return true;
  case 'partAth':goView('part');return true;
  case 'partOpen':L.spot=L.pAth||null;{var tt=teamById(L.pTeam),aa=tt&&(tt.athletes.find(function(x){return x.id===L.pAth})||tt.athletes[0]);L.spot=aa?aa.id:null}openRoutine(id);if(L.spot)flash('Spotlight on '+((spotAth()||{}).name||'')+'.');return true;
  case 'partPdf':{var t5=teamById(L.pTeam),a5=t5&&(t5.athletes.find(function(x){return x.id===L.pAth})||t5.athletes[0]);L.spot=a5?a5.id:null;openRoutine(id);pdfOpen=true;render();var pp=document.getElementById('pdfPanel');if(pp&&pp.scrollIntoView)pp.scrollIntoView({block:'center'});return true}
  case 'setTheme':L.theme=id;saveLayout();render();return true;
  case 'upLogo':if(!assetsApi){flash('Uploading needs edit access to this playbook.');return true}
    pickFile('image/png,image/jpeg,image/webp,image/gif',function(f){if(f.size>5*1024*1024){flash('Pick an image under 5 MB.');return}flash('Uploading logo…');
      assetsApi.upload(f,{type:f.type}).then(function(res){D.profile.logo={id:res.id};pageDirty();render();flash('Logo added.')}).catch(function(e){flash(uploadErr(e))})});return true;
  case 'delLogo':delete D.profile.logo;pageDirty();render();return true;
  }
  return false}
function dupRoutine(src){var dr=clone(src);dr.id=uid();dr.sample=false;dr.name=(src.name||'Routine')+' (copy)';dr.versions=[];delete dr.deletedAt;delete dr.archived;
  dr.sections.forEach(function(s){var map={};s.id=uid();s.variants.forEach(function(v){var o=v.id;v.id=uid();map[o]=v.id;v.eights.forEach(function(e){e.id=uid()})});s.active=map[s.active]||s.variants[0].id});return dr}
function pageInput(t,f){
  if(f==='homeQ'){homeQ=t.value;softRender(150);return true}
  var tm=teamById(L.pTeam);
  if(f==='tname'&&tm){tm.name=t.value;pageDirty();return true}
  if(f==='tseason'&&tm){tm.season=t.value;pageDirty();return true}
  if(f==='tath'&&tm){var a=tm.athletes.find(function(x){return x.id===t.dataset.id});if(a){a.name=t.value;applyTeam(tm);pageDirty()}return true}
  if(f==='tgname'&&tm){var g=tm.groups.find(function(x){return x.id===t.dataset.id});if(g){g.name=t.value;applyTeam(tm);pageDirty()}return true}
  if(f==='tnote'&&tm){var v=t.value;if(v)tm.notes[L.pAth]=v;else delete tm.notes[L.pAth];pageDirty();return true}
  if(f==='rnm'){var rn=D.routines.find(function(x){return x.id===t.dataset.id});if(rn){rn.name=t.value;pageDirty()}return true}
  if(f==='rseason'){var r=D.routines.find(function(x){return x.id===t.dataset.id});if(r){r.season=t.value;pageDirty()}return true}
  if(f==='tplname'){var tp=D.templates.find(function(x){return x.id===t.dataset.id});if(tp){tp.name=t.value;pageDirty()}return true}
  if(f==='vwname'){var vw=D.views.find(function(x){return x.id===t.dataset.id});if(vw){vw.name=t.value;pageDirty()}return true}
  if(f==='pname'){D.profile.name=t.value;pageDirty();return true}
  if(f==='pprog'){D.profile.program=t.value;pageDirty();return true}
  if(f==='pdbpm'){var n=parseInt(t.value,10);if(n>=60&&n<=220){D.profile.bpm=n;pageDirty()}return true}
  return false}
function pageChange(t,f){
  var tm=teamById(L.pTeam);
  if(f==='hteam'){homeTeam=t.value;render();return true}
  if(f==='mvA'||f==='mvB'){var e7=find(cur).e,w7=(e7.move||[1,MOVE]).slice();if(f==='mvA')w7[0]=+t.value;else w7[1]=+t.value;if(w7[1]<w7[0]){if(f==='mvA')w7[1]=w7[0];else w7[0]=w7[1]}
    if(w7[0]===1&&w7[1]===MOVE)delete e7.move;else e7.move=w7;markDirty();refreshTraffic();softRender();return true}
  if(f==='harch'){homeArch=t.checked;render();return true}
  if(f==='rteam'){var r=D.routines.find(function(x){return x.id===t.dataset.id}),nt=teamById(t.value);if(!r)return true;r.teamId=nt?nt.id:null;
    if(nt){r.athletes=clone(nt.athletes);r.groups=clone(nt.groups);flash('Now uses '+nt.name+'’s roster. Athletes not on that team were taken out of this routine.')}pageDirty();render();return true}
  if(f==='tlevel'&&tm){tm.level=t.value;pageDirty();return true}
  if(f==='trole'&&tm){var a=tm.athletes.find(function(x){return x.id===t.dataset.id});if(a){a.role=t.value;applyTeam(tm);pageDirty();render()}return true}
  if(f==='tgrp'&&tm){var a2=tm.athletes.find(function(x){return x.id===t.dataset.id});if(!a2)return true;
    if(t.value==='__new'){var used=tm.groups.map(function(g){return g.color}),col=GROUP_COLORS.find(function(c){return used.indexOf(c)<0})||GROUP_COLORS[tm.groups.length%GROUP_COLORS.length];
      var g={id:uid(),name:'Group '+(tm.groups.length+1),color:col};tm.groups.push(g);a2.group=g.id}else a2.group=t.value||null;
    tm.groups=tm.groups.filter(function(g){return tm.athletes.some(function(x){return x.group===g.id})});applyTeam(tm);pageDirty();render();return true}
  if(f==='tskill'&&tm){var sk=tm.skills[L.pAth]||(tm.skills[L.pAth]={});if(t.checked)sk[t.dataset.k]=new Date().toISOString().slice(0,10);else delete sk[t.dataset.k];if(!Object.keys(sk).length)delete tm.skills[L.pAth];pageDirty();render();return true}
  if(f==='pteam'){L.pTeam=t.value;L.pAth=null;saveLayout();render();return true}
  if(f==='path'){L.pAth=t.value;saveLayout();render();return true}
  if(f==='pdsheet'){D.profile.sheet=t.value;pageDirty();return true}
  if(f==='phelp'){L.help=t.checked;saveLayout();render();return true}
  return false}

/* ---- phone layout: slim top bar + bottom tab bar on pages; a one-screen editor (mat fixed on top, play controls,
   tabbed panel below); the 8-count editor and every menu slide up as bottom sheets ---- */
var MTABS=[['counts','Counts'],['mat','Mat'],['video','Video'],['score','Score'],['setup','Setup']].filter(function(t){return VIDEO_ON||t[0]!=='video'});
var bsFull=false,lastSheets={},pageSheet='',matCtl=null;
var ICON={
  home:'<path d="M4 6h16M4 12h16M4 18h10"/>',
  teams:'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.2c2.4-.3 4.4 1.2 5 4.3"/>',
  part:'<circle cx="12" cy="7.5" r="3.3"/><path d="M5.5 20c.7-3.8 3.3-6 6.5-6s5.8 2.2 6.5 6"/><path d="M18.5 3.5l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z"/>',
  library:'<path d="M5 4.5h4v15H5zM10.5 4.5h4v15h-4z"/><path d="M16 5.2l3.6-.9 3 14.5-3.6.9z" transform="translate(-2.6 0)"/>',
  account:'<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>'};
function svgIcon(k){return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+ICON[k]+'</svg>'}
function sheetHtml(inner,kind,title){var anim=!lastSheets[kind];lastSheets[kind]=2;
  return '<div class="bsw k-'+kind+(kind==='ed'&&bsFull?' full':'')+'" data-sheet="'+kind+'">'+(kind==='ed'?'':'<div class="bsback" data-act="closeSheet" data-id="'+kind+'" aria-hidden="true"></div>')
    +'<div class="bsheet'+(anim&&!reduceMotion?' anim':'')+'" role="dialog" aria-label="'+esc(title||'Options')+'"><div class="bsgrab" data-grab="'+kind+'"><i></i></div><div class="bsbody">'+inner+'</div></div></div>'}
function endSheets(){Object.keys(lastSheets).forEach(function(k){if(lastSheets[k]===2)lastSheets[k]=1;else delete lastSheets[k]})}
function closeSheet(kind){if(kind==='ed'){sheetOpen=false;bsFull=false}else{gearOpen=false;moreOpen=false;viewsOpen=false;pdfOpen=false;newOpen=false;homeMenu=null}render()}
function phoneTop(back,title,extra){
  return '<header class="mtop">'+(back?'<button class="mib" data-act="'+back[0]+'" data-id="'+esc(back[1])+'" aria-label="Back">‹</button>':'<span class="mbrand">'+((D.profile||{}).logo?brandLogo():CB_LOGO)+'</span>')
   +(back&&back[1]==='home'&&view==='editor'?'<button class="mtitle mtbtn" data-act="renameR" aria-label="Rename '+esc(title)+'">'+esc(title)+'</button>':'<b class="mtitle">'+esc(title)+'</b>')+'%%DEVTAG%%<span class="status mdot" id="status"></span>'
   +'<button class="mib" id="undoBtn" data-act="undo" aria-label="Undo" title="Undo">↶</button><button id="redoBtn" data-act="redo" hidden></button><button id="saveBtn" data-act="save" hidden></button>'+(extra||'')+'</header>'}
function phonePageChrome(){var cv=view==='team'||view==='ath'?'teams':view,t=teamById(L.pTeam);
  var back=view==='team'?['nav','teams']:view==='ath'?['openTeam',L.pTeam]:null;
  var title=view==='team'?(t?t.name:'Team'):view==='ath'?'Athlete':(NAV.filter(function(n){return n[0]===cv})[0]||['','Routines'])[1];
  var nav='<nav class="mnav" aria-label="Playbook">'+NAV.map(function(n){var on=cv===n[0];return '<button class="mnb'+(on?' on':'')+'" data-act="nav" data-id="'+n[0]+'"'+(on?' aria-current="page"':'')+'>'+svgIcon(n[0])+'<span>'+(n[0]==='part'?'Athletes':n[1])+'</span></button>'}).join('')+'</nav>';
  return {top:phoneTop(back,title),nav:nav}}
function phoneMenu(){var mb=function(act,label,q){return '<button class="mrowbtn'+(q?' quiet':'')+'" data-act="'+act+'">'+label+'</button>'};
  return '<div class="mmenu"><label class="fl" for="rname">Routine name</label><input class="field mrename" id="rname" data-f="name" value="'+esc(R.name)+'" placeholder="Routine name" autocomplete="off">'
   +mb('newR','+ New routine')+mb('dupR','Duplicate routine')+mb('sendTeam','📲 Send to team')+mb('runOpen','⤢ Full-screen run-through')+mb('moreMenu','⇅ Import / Export')+mb('pdfMenu','⎙ Print / PDF')
   +mb('helpToggle',L.help?'? Hide help text':'? Show help text')
   +mb('delR','Delete routine',1)+mb('fresh','Clear this routine',1)+'</div>'}
function renderPhoneEditor(o){
  var tab=({counts:1,mat:1,video:VIDEO_ON?1:0,score:1,setup:1})[L.mtab]?L.mtab:'counts';
  var seg='<span class="seg" role="group" aria-label="Mat view"><button data-act="matView" data-id="top" aria-pressed="'+(L.matView!=='front')+'">Top</button><button data-act="matView" data-id="front" aria-pressed="'+(L.matView==='front')+'">Front</button></span>';
  var body=tab==='counts'?'<div class="msum">'+o.n+' eight-counts · '+fmt(routineSecs())+' of '+fmt(maxSecs())+(o.trf.total?' · <span class="tw">⚠ '+o.trf.total+' traffic</span>':'')+'</div>'+o.sheet
       :tab==='mat'?'<div class="ctl">'+seg+'</div><div data-slot="matctl"></div>'
       :tab==='video'?'<div data-slot="video"></div>'
       :tab==='score'?'<div class="msum">'+o.done+' of '+o.tot+' planned</div>'+o.score:o.setup;
  var menu=gearOpen?phoneMenu():o.panels;
  if(transportEl.parentNode===app||app.contains(transportEl))document.body.appendChild(transportEl);
  app.innerHTML='<div class="mapp">'
   +phoneTop(['nav','home'],R.name||'Untitled routine','<button class="mib" data-act="gearMenu" aria-label="More options" aria-expanded="'+gearOpen+'">⋯</button>').replace('%%DEVTAG%%','')
   +'<div class="mstage" id="mstage"><div data-slot="mat"></div></div><div data-slot="transport"></div>'
   +'<nav class="mtabs" role="tablist" aria-label="Routine">'+MTABS.map(function(t){var on=tab===t[0];return '<button class="mtab'+(on?' on':'')+'" role="tab" aria-selected="'+on+'" data-act="mtab" data-id="'+t[0]+'">'+t[1]+(t[0]==='counts'&&o.trf.total?' <span class="tw">⚠</span>':'')+'</button>'}).join('')+'</nav>'
   +'<div class="mpanel" id="mpanel" role="tabpanel">'+body+'</div><div data-slot="stash" hidden></div>'
   +(sheetOpen?sheetHtml(o.editor,'ed','8-count'):'')+(menu?sheetHtml(menu,'menu','Options'):'')+'</div>';
  endSheets();
  if(!matCtl){matCtl=document.createElement('div');matCtl.className='matctl';Array.prototype.slice.call(matWrap.children).forEach(function(c){if(c.id!=='frontBox'&&c.id!=='matBox')matCtl.appendChild(c)})}
  var stash=app.querySelector('[data-slot="stash"]');
  app.querySelector('[data-slot="mat"]').replaceWith(matWrap);
  app.querySelector('[data-slot="transport"]').replaceWith(transportEl);
  var vs=app.querySelector('[data-slot="video"]');if(vs)vs.replaceWith(vidWrap);else stash.appendChild(vidWrap);
  var ms=app.querySelector('[data-slot="matctl"]');if(ms)ms.replaceWith(matCtl);else stash.appendChild(matCtl);
  var ed=app.querySelector('.bsw.k-ed');if(ed)sizeEdSheet(ed);
  var mp=document.getElementById('mpanel');if(mp&&mtabIn){var d=mtabIn;mtabIn=0;slideIn(mp,d)}
}
function sizeEdSheet(w){var sh=w.querySelector('.bsheet'),tabs=app.querySelector('.mtabs'),top=app.querySelector('.mtop');if(!sh||!tabs)return;
  var y=w.classList.contains('full')?(top?top.getBoundingClientRect().bottom:0):tabs.getBoundingClientRect().top;
  sh.style.height=Math.max(220,window.innerHeight-y)+'px'}
window.addEventListener('resize',function(){var w=app.querySelector('.bsw.k-ed');if(w)sizeEdSheet(w)});
function slideIn(el,dir){if(reduceMotion)return;el.style.transition='none';el.style.transform='translateX('+(dir*window.innerWidth*0.3)+'px)';el.style.opacity='0';el.offsetWidth;
  el.style.transition='transform 240ms cubic-bezier(.2,.8,.2,1),opacity 200ms';el.style.transform='';el.style.opacity='';setTimeout(function(){el.style.transition=''},260)}
var mtabIn=0;
function mtabIndex(){var t=({counts:1,mat:1,video:VIDEO_ON?1:0,score:1,setup:1})[L.mtab]?L.mtab:'counts';for(var i=0;i<MTABS.length;i++)if(MTABS[i][0]===t)return i;return 0}
/* drag a sheet by its grab bar: down closes it, up opens the 8-count sheet full height */
var grab=null;
app.addEventListener('pointerdown',function(e){var g=e.target.closest&&e.target.closest('[data-grab]');if(!g)return;var w=g.closest('.bsw'),sh=w.querySelector('.bsheet');
  grab={kind:g.dataset.grab,w:w,sh:sh,y:e.clientY,dy:0,t:performance.now()};sh.style.transition='none';try{g.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault()},true);
window.addEventListener('pointermove',function(e){if(!grab)return;grab.dy=e.clientY-grab.y;grab.sh.style.transform='translateY('+Math.max(-40,grab.dy)+'px)'});
function endGrab(){var g=grab;grab=null;if(!g)return;var v=g.dy/Math.max(1,performance.now()-g.t);g.sh.style.transition='transform 200ms cubic-bezier(.2,.8,.2,1)';
  if(g.dy>90||(v>0.6&&g.dy>30)){g.sh.style.transform='translateY(100%)';setTimeout(function(){closeSheet(g.kind)},190);return}
  if(g.kind==='ed'&&(g.dy<-50||(v<-0.5&&g.dy<-20))){bsFull=true;g.w.classList.add('full');sizeEdSheet(g.w)}
  else if(g.kind==='ed'&&g.dy>40&&bsFull){bsFull=false;g.w.classList.remove('full');sizeEdSheet(g.w)}
  g.sh.style.transform=''}
window.addEventListener('pointerup',endGrab);window.addEventListener('pointercancel',endGrab);
/* typing in the 8-count sheet: open it full height so the keyboard doesn't cover the boxes */
app.addEventListener('focusin',function(e){if(!PHONE||!e.target.closest)return;var w=e.target.closest('.bsw.k-ed');if(w&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)&&!bsFull){bsFull=true;w.classList.add('full');sizeEdSheet(w)}});
/* swipe the mat left or right to step through 8-counts */
var mswipe=null;
function matSwipeStart(e){mswipe={x:e.clientX,y:e.clientY,dx:0,dy:0,t:performance.now(),el:document.getElementById('mat')};if(mswipe.el)mswipe.el.style.transition='none'}
function matSwipeMove(e){if(!mswipe)return;mswipe.dx=e.clientX-mswipe.x;mswipe.dy=e.clientY-mswipe.y;if(mswipe.el&&Math.abs(mswipe.dx)>Math.abs(mswipe.dy))mswipe.el.style.transform='translateX('+(mswipe.dx*0.55)+'px)'}
function matSwipeEnd(){var s=mswipe;mswipe=null;if(!s)return;var it=find(cur),dir=s.dx<0?1:-1,n=it.n+dir,go=Math.abs(s.dx)>50&&Math.abs(s.dx)>Math.abs(s.dy)*1.3&&n>=0&&n<it.list.length;
  if(s.el){s.el.style.transition=reduceMotion?'none':'transform 180ms cubic-bezier(.2,.8,.2,1)';s.el.style.transform=''}
  if(!go&&Math.abs(s.dx)<8&&Math.abs(s.dy)<8&&betaTapCheck('empty'))return;
  if(!go){if(Math.abs(s.dx)>50&&(n<0||n>=it.list.length))flash(n<0?'This is the first 8-count.':'This is the last 8-count.');return}
  selectEight(it.list[n].e.id);var m=document.getElementById('mat');if(m&&!reduceMotion){m.style.transition='none';m.style.transform='translateX('+(dir*36)+'px)';m.style.opacity='.4';m.offsetWidth;
    m.style.transition='transform 220ms cubic-bezier(.2,.8,.2,1),opacity 200ms';m.style.transform='';m.style.opacity=''}}

var gearOpen=false,mediaMsg=null,pdfOpen=false,sheetOpen=true,viewsOpen=false,tplOpen=false,moreOpen=false,arranging=false,bldOpen=false,secMenu=null,tagsOpen=false,customOpen=false,scoreOpen={};
if(PHONE)sheetOpen=false;
function tileShell(id,title,extra,body,titleId){
  var col=!!L.collapsed[id],size=L.size[id]||'half',lab={third:'⅓',half:'½',full:'Full'}[size];
  return '<section class="tile card '+size+(col?' collapsed':'')+'" data-tile="'+id+'"'+(L.hidden&&L.hidden[id]?' hidden':'')+'><div class="thead">'
   +'<button class="grip" data-grip="'+id+'" aria-label="Drag to move the '+esc(TILES[id])+' tile" title="Drag to move">⠿</button>'
   +'<h2'+(titleId?' id="'+titleId+'"':'')+'>'+esc(title)+'</h2><span class="tx">'+(extra||'')+'</span><div class="tctl">'
   +'<button class="ib tmove arr" data-act="tmove" data-id="'+id+'" data-d="-1" aria-label="Move earlier">←</button><button class="ib tmove arr" data-act="tmove" data-id="'+id+'" data-d="1" aria-label="Move later">→</button>'
   +'<button class="ib sizebtn arr" data-act="tsize" data-id="'+id+'" aria-label="Change tile width" title="Tile width">'+lab+'</button>'
   +'<button class="ib" data-act="tcol" data-id="'+id+'" aria-label="'+(col?'Expand':'Minimize')+' the '+esc(TILES[id])+' tile" title="'+(col?'Expand':'Minimize')+'">'+(col?'+':'–')+'</button></div></div>'
   +(id==='video'||id==='mat'?'<div class="slot" data-slot="'+id+'"></div>':'<div class="tbody">'+body+'</div>')+'</section>';
}
var hostTheme=document.documentElement.getAttribute('data-theme');
function applyTheme(){var r=document.documentElement,t=L.theme||'system';
  if(t==='light'||t==='dark')r.setAttribute('data-theme',t);else if(hostTheme)r.setAttribute('data-theme',hostTheme);else r.removeAttribute('data-theme')}
function themeIcon(){var t=L.theme||'system';return t==='light'?'☀':t==='dark'?'☾':'◐'}
function themeName(){var t=L.theme||'system';return t==='light'?'Light':t==='dark'?'Dark':'Match device'}
function H(t){return '<p class="note help">'+t+'</p>'}
function render(){
  liveCountKey='';matFast=null;
  if(ATHLETE){renderAthlete();return}
  if(app.contains(transportEl))document.body.appendChild(transportEl);
  transportEl.hidden=view!=='editor';if(view!=='editor'){renderPage();return}
  var it=find(cur), dis=assetsApi?'':' disabled';
  var roleOpts=function(r){return ROLES.map(function(x){return '<option'+(x===r?' selected':'')+'>'+x+'</option>'}).join('')};
  var tl=timeline(),n0=0,spA=spotAth(),trf=L.traffic!==false?allTraffic():{total:0};
  document.body.classList.toggle('help-on',!!L.help);applyTheme();

  /* ---------- count sheet ---------- */
  var sheet=R.sections.map(function(s,si){
    var v=activeVar(s),g=tl[si],first=n0;n0+=v.eights.length;
    return '<div class="sec" data-sec="'+s.id+'"><div class="sechead">'
      +'<span class="rgrip" data-rgrip="sec" data-id="'+s.id+'" tabindex="0" role="button" aria-label="Drag to reorder the '+esc(s.name||'section')+' section. Arrow keys move it." title="Drag to reorder">⠿</span>'
      +'<input class="secname" id="sec-'+s.id+'" data-f="sec" data-id="'+s.id+'" list="secnames" value="'+esc(s.name)+'" placeholder="Section name" aria-label="Section name">'
      +'<button class="ib" data-act="playSec" data-id="'+s.id+'" aria-label="Play the '+esc(s.name||'section')+' section" title="Play this section">▶</button>'
      +'<button class="ib" data-act="secMenu" data-id="'+s.id+'" aria-expanded="'+(secMenu===s.id)+'" aria-label="More for the '+esc(s.name||'section')+' section" title="More">⋯</button></div>'
      +(secMenu===s.id?'<div class="ctl secmenu"><button class="btn small" data-act="addTo" data-id="'+s.id+'">+ Add 8-count</button><button class="btn small" data-act="addVar" data-id="'+s.id+'">+ Try an alternate</button>'
        +(v!==s.variants[0]?'<button class="btn small quiet" data-act="delVar" data-id="'+s.id+'">Remove version '+esc(v.label)+'</button>':'')
        +(R.sections.length>1?'<button class="btn small quiet" data-act="delSec" data-id="'+s.id+'">Remove section</button>':'')+'</div>':'')
      +(s.variants.length>1?'<div class="alts"><span class="fl">Version</span>'+s.variants.map(function(x,i){return '<button class="chip'+(x===v?' on':'')+'" data-act="pickVar" data-id="'+s.id+'" data-v="'+x.id+'" aria-pressed="'+(x===v)+'" title="'+(i?'Alternate':'Original')+'">'+esc(x.label)+'</button>'}).join('')+'</div>':'')
      +'<ol class="eights">'+v.eights.map(function(e,ei){var n=first+ei,bt=buildText(e);
        return '<li data-eight="'+e.id+'"><span class="rgrip" data-rgrip="eight" data-id="'+e.id+'" tabindex="0" role="button" aria-label="Drag to reorder 8-count '+(n+1)+'. Arrow keys move it." title="Drag to reorder">⠿</span><button class="erow'+(e.id===cur?' on':'')+'" data-act="sel" data-id="'+e.id+'"><span class="badge">'+(n+1)+'</span>'
          +'<span class="etxt"><span class="lbl">'+fmt(g.start+ei*8*spb())+(e.move?' · travel '+winLabel(e.move):'')+(e.moveBy&&Object.keys(e.moveBy).length?' · mixed timing':'')+(trf[e.id]&&trf[e.id].length?' · <span class="tw" title="Traffic issues">⚠ '+trf[e.id].length+'</span>':'')+'</span><span class="sum" id="sum-'+e.id+'">'+esc(summary(e))+'</span>'+(spA?'<span class="spotline">★ '+esc(spA.name)+': '+esc(spotText(e,spA))+'</span>':'')+(bt?'<span class="bline">'+esc(bt)+'</span>':'')+'</span></button>'+(e.id===cur?'%%EDITOR%%':'')+'</li>'}).join('')
      +'</ol></div>'}).join('');

  /* ---------- the open 8-count ---------- */
  var items=sheetItems(),dv=derivedTags(it.e);
  var tagChip=function(x){var on=(it.e.tags||[]).indexOf(x.k)>=0,au=!on&&dv.indexOf(x.k)>=0;return '<button class="tag'+(on?' on':au?' auto':'')+'" data-act="tag" data-k="'+x.k+'" aria-pressed="'+on+'"'+(au?' title="Counted from the building notes below"':'')+'>'+(au?'✓ ':'')+esc(x.n)+'</button>'};
  var picked=items.filter(function(x){return (it.e.tags||[]).indexOf(x.k)>=0||dv.indexOf(x.k)>=0});
  var tagRow='<div class="tags"><span class="fl">Scores for</span>'+(tagsOpen?items:picked).map(tagChip).join('')
    +'<button class="btn small quiet" data-act="tagsMore" aria-expanded="'+tagsOpen+'">'+(tagsOpen?'Done':(picked.length?'Edit':'+ Add'))+'</button></div>';
  var bt0=buildText(it.e);
  var hasB=Object.keys(it.e.build||{}).length||liveLinks(it.e).length;
  var buildHtml=!GROUPS_ON?'':R.groups.length&&!hasB&&!bldOpen?'<div class="mgroup"><button class="btn small quiet" data-act="bldOpen" aria-expanded="false">▸ Building notes (who does what)</button></div>':R.groups.length?'<div class="bnote"><span class="fl">Building · who does what</span>'+R.groups.map(function(g){var x=(it.e.build||{})[g.id]||{},others=R.groups.filter(function(o){return o!==g});
      return '<div class="brow"><span class="gsw" style="background:'+g.color+'"></span><b class="bname">'+esc(g.name)+'</b>'
       +'<input class="field" id="bs-'+g.id+'" data-f="bskill" data-id="'+g.id+'" list="skillList" value="'+esc(x.skill||'')+'" placeholder="Skill, e.g. Lib" aria-label="'+esc(g.name)+' skill">'
       +'<label class="tog">hits on <select class="field num" id="bc-'+g.id+'" data-f="bcount" data-id="'+g.id+'" aria-label="'+esc(g.name)+' hits on count"><option value="0">–</option>'+[1,2,3,4,5,6,7,8].map(function(c){return '<option value="'+c+'"'+(x.count===c?' selected':'')+'>'+c+'</option>'}).join('')+'</select></label>'
       +(others.length?'<span class="blinks"><span class="note">Connects to</span>'+others.map(function(o){var on=isLinked(it.e,g.id,o.id);return '<button class="chip'+(on?' on':'')+'" data-act="bLink" data-id="'+g.id+'" data-v="'+o.id+'" aria-pressed="'+on+'">⟷ '+esc(o.name)+'</button>'}).join('')+'</span>':'')+'</div>'}).join('')
     +'<p class="btext" id="bText">'+esc(bt0||'No building noted yet.')+'</p>'
     +H('Add a skill for each group and the count it hits on. Connect groups to make a pyramid; connected flyers are joined on the mat.')
     +'<datalist id="skillList">'+STUNT_SKILLS.map(function(k){return '<option value="'+k+'">'}).join('')+'</datalist></div>'
    :'<p class="note">No stunt groups yet. Add them in Setup › Team to note who does which stunt.</p>';
  var tw=it.e.move||[1,MOVE],tov=Object.keys(it.e.moveBy||{}).length;
  var travelRow='<div class="mrow travel"><span class="fl">Travel into this 8-count</span><label class="tog">counts <select class="field num" data-f="mvA" aria-label="Travel starts on count">'+cntOpts(tw[0])+'</select></label><label class="tog">to <select class="field num" data-f="mvB" aria-label="Travel ends on count">'+cntOpts(tw[1])+'</select></label>'
    +(tov?'<span class="note">'+tov+' athlete'+(tov===1?' has':'s have')+' their own timing</span><button class="btn small quiet" data-act="mvClear">Use this timing for everyone</button>':'')+'</div>';
  var eightBody=tagRow+'<div class="counts">'+[0,1,2,3,4,5,6,7].map(function(i){return '<div class="cell"><label for="c'+i+'">'+(i+1)+'</label><input class="field" id="c'+i+'" data-f="count" data-i="'+i+'" value="'+esc(it.e.counts[i])+'" placeholder="–"></div>'}).join('')+'</div>'+travelRow
   +buildHtml+'<label class="fl" for="note">Notes</label><textarea class="field" id="note" data-f="note" placeholder="Music cues, who goes where, things to clean">'+esc(it.e.note)+'</textarea>'
   +'<div class="ctl"><button class="btn small primary" data-act="playEight">▶ Play this 8-count</button><button class="btn small" data-act="playFrom">▶ From here</button>'
   +'<button class="btn small" data-act="addAfter">+ Add after</button>'
   +(it.list.length>1?'<button class="btn small" data-act="delEight" title="Delete this 8-count">🗑 Delete 8-count</button>':'')+'</div>'
   +'<div class="mgroup"><button class="btn small quiet" data-act="tplToggle" aria-expanded="'+tplOpen+'">'+(tplOpen?'▾':'▸')+' Templates ('+D.templates.length+')</button>'
   +(tplOpen?'<div class="mrow"><input class="field" id="tplName" placeholder="'+esc(secLabel(it.s)+' 8-count '+(it.ei+1))+'" aria-label="Template name"><button class="btn small primary" data-act="tplSave">Save as template</button></div>'
     +(D.templates.length?'<div class="mrow"><span class="note">Bring in its</span><label class="tog"><input type="checkbox" id="tplC" checked> counts &amp; notes</label><label class="tog"><input type="checkbox" id="tplF" checked> formation</label><label class="tog"><input type="checkbox" id="tplB" checked> building notes</label></div>'
       +'<ul class="vlist">'+D.templates.map(function(t){return '<li class="vitem"><div style="display:grid;min-width:0;flex:1 1 200px"><b>'+esc(t.name)+'</b><span class="sub">'+esc(summary(t))+'</span></div>'
         +'<span class="ctl"><button class="btn small" data-act="tplAfter" data-id="'+t.id+'">Insert after</button><button class="btn small" data-act="tplReplace" data-id="'+t.id+'">Replace this one</button><button class="btn small quiet" data-act="tplDel" data-id="'+t.id+'">Delete</button></span></li>'}).join('')+'</ul>':'')
     +H('Templates are shared by every routine in this playbook. Athletes are matched by name first, then by role. Anyone without a match stays where they are.'):'')
   +'</div>';
  var editor='<div class="ed" id="eightEditor" role="region" aria-labelledby="eightTitle"><div class="edhead"><h3 id="eightTitle"></h3><button class="ib" data-act="closeEd" aria-label="Close this 8-count" title="Close">✕</button></div>'+eightBody+'</div>';

  /* ---------- setup: music & video ---------- */
  var altRows=[];R.sections.forEach(function(s){s.variants.forEach(function(v,i){if(!i)return;
    altRows.push('<li class="vitem"><b>'+esc((s.name||'Section')+' '+v.label)+'</b>'
      +(v.video?'<span class="sub">'+esc(v.video.name)+' · '+fmt(v.video.dur)+'</span><button class="btn small" data-act="upClip" data-id="'+s.id+'" data-v="'+v.id+'"'+dis+'>Replace</button><button class="btn small quiet" data-act="delClip" data-id="'+s.id+'" data-v="'+v.id+'">Remove clip</button>'
        +'<label class="tog">Count 1 at <input class="field num" id="coff-'+v.id+'" data-f="coff" data-id="'+s.id+'" data-v="'+v.id+'" type="number" step="0.05" min="0" inputmode="decimal" value="'+r2(v.videoOffset)+'"> s into clip</label>'
        :'<button class="btn small" data-act="upClip" data-id="'+s.id+'" data-v="'+v.id+'"'+dis+'>Upload clip</button>')+'</li>')})});
  var mediaBody='<div class="mgroup"><span class="fl">Song</span>'
   +(R.audio?'<div class="mrow"><span class="mfile">♪ '+esc(R.audio.name)+'</span><span class="sub">'+fmt(R.audio.dur)+'</span><button class="btn small" data-act="upSong"'+dis+'>Replace</button><button class="btn small quiet" data-act="delSong">Remove</button></div>'
     :'<div class="mrow"><button class="btn small primary" data-act="upSong"'+dis+'>Upload song</button><span class="note">Anything past '+fmt(maxSecs())+' is trimmed.</span></div>')
   +'<div class="mrow"><input class="field" id="music" data-f="music" type="url" inputmode="url" value="'+esc(R.music)+'" placeholder="YouTube link for reference (doesn’t sync)"><a class="btn small" id="songLink" target="_blank" rel="noopener noreferrer" hidden>Open link</a></div></div>'
   +'<div class="mgroup"><span class="fl">Timing</span>'
   +'<div class="mrow"><label>BPM <input class="field num" id="bpm" data-f="bpm" type="number" min="60" max="220" step="0.1" inputmode="numeric" value="'+R.bpm+'"></label><button class="btn small" data-act="tap" id="tapBtn">Tap tempo</button><button class="btn small" data-act="findBeat"'+(R.audio?'':' disabled')+' title="Find the tempo and count 1 from the song">Find the beat</button></div>'
   +'<div class="mrow"><label>Count 1 at <input class="field num" id="mstart" data-f="mstart" type="number" min="0" step="0.05" inputmode="decimal" value="'+r2(R.musicStart)+'"> s</label>'
   +'<button class="btn small" data-act="nudge" data-k="musicStart" data-d="-0.05" aria-label="Earlier">−</button><button class="btn small" data-act="nudge" data-k="musicStart" data-d="0.05" aria-label="Later">+</button>'
   +'<button class="btn small" data-act="markOne">Mark count 1 here</button></div>'
   +H('Uploading a song finds the beat for you. To redo it, tap Find the beat. If it’s off, tap the tempo button along with the beat, then play and tap “Mark count 1 here” on the first count.')+'</div>'
   +(!VIDEO_ON?'':'<div class="mgroup"><span class="fl">Video</span>'
   +(R.video?'<div class="mrow"><span class="mfile">▶ '+esc(R.video.name)+'</span><span class="sub">'+fmt(R.video.dur)+'</span><button class="btn small" data-act="upVideo"'+dis+'>Replace</button><button class="btn small quiet" data-act="delVideo">Remove</button></div>'
       +(R.audio?'<div class="mrow"><label>Video offset <input class="field num" id="voff" data-f="voff" type="number" step="0.05" inputmode="decimal" value="'+r2(R.videoOffset)+'"> s</label>'
         +'<button class="btn small" data-act="nudge" data-k="videoOffset" data-d="-0.1" aria-label="Earlier">−</button><button class="btn small" data-act="nudge" data-k="videoOffset" data-d="0.1" aria-label="Later">+</button></div>'
         +H('0 means the video starts with the song. If the video runs ahead of the music, lower it. If it lags, raise it.'):'')
     :'<div class="mrow"><button class="btn small primary" data-act="upVideo"'+dis+'>Upload video</button><span class="note">Big files are shrunk to fit.</span></div>')
   +'</div>')
   +(VIDEO_ON&&altRows.length?'<div class="mgroup"><span class="fl">Alternate clips</span><ul class="vlist">'+altRows.join('')+'</ul>'+H('When an alternate is the chosen version of its section, its clip plays in place of the original video for that stretch. The original video is never changed.')+'</div>':'')
   +(assetsApi?'':'<p class="note">Uploading needs edit access to this playbook.</p>');

  /* ---------- setup: versions & backup ---------- */
  var verBody='<div class="mrow"><input class="field" id="vname" placeholder="Name this version, e.g. Original plan" aria-label="Version name"><button class="btn small primary" data-act="saveVer">Save version</button></div>'
   +(R.versions.length?'<ul class="vlist">'+R.versions.slice().reverse().map(function(v){var n=0;v.data.sections.forEach(function(s){fixSection(s);n+=ev(s).length});
     return '<li class="vitem"><b>'+esc(v.name)+'</b><span class="sub">'+new Date(v.at).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+' · '+n+' eight-counts</span>'
      +'<span class="ctl" style="margin-left:auto"><button class="btn small" data-act="restoreVer" data-id="'+v.id+'">Restore</button><button class="btn small" data-act="copyVer" data-id="'+v.id+'">Open as copy</button><button class="btn small quiet" data-act="delVer" data-id="'+v.id+'">Delete</button></span></li>'}).join('')+'</ul>'
     :H('Save a version before big changes, such as “Original plan”. You can restore it any time, or open it as a separate routine to compare.'))
   +'<div class="mgroup"><span class="fl">Routine file</span><div class="ctl"><button class="btn small" data-act="expOne">Export this routine</button><button class="btn small" data-act="expAll">Export all routines</button><button class="btn small" data-act="imp">Import a file</button></div>'
   +H('Exports counts, formations, stunt groups, building notes, versions and scoresheet settings as a .json file. “Export all” also includes your 8-count templates. Importing adds routines next to the ones here and never replaces them. Song files stay stored in this playbook; the file keeps links to them.')+'</div>';

  /* ---------- setup: team ---------- */
  var team=(R.athletes.length?R.athletes.map(function(a){
    return '<div class="ath"><button class="sw'+(L.spot===a.id?' lit':'')+'" id="sw-'+a.id+'" data-act="spot" data-id="'+a.id+'" aria-pressed="'+(L.spot===a.id)+'" aria-label="Spotlight '+esc(a.name)+'" title="Spotlight '+esc(a.name)+'" style="background:var(--'+a.role.toLowerCase()+')">'+esc(initials(a.name))+'</button>'
      +'<input class="field aname" id="ath-'+a.id+'" data-f="ath" data-id="'+a.id+'" value="'+esc(a.name)+'" aria-label="Athlete name"'+(groupOf(a)?' style="color:'+groupOf(a).color+';font-weight:700"':'')+'>'
      +'<select class="field" id="role-'+a.id+'" data-f="role" data-id="'+a.id+'" aria-label="Role">'+roleOpts(a.role)+'</select>'
      +(GROUPS_ON?'<select class="field" id="agrp-'+a.id+'" data-f="agrp" data-id="'+a.id+'" aria-label="Stunt group"><option value="">No group</option>'+R.groups.map(function(g){return '<option value="'+g.id+'"'+(a.group===g.id?' selected':'')+'>'+esc(g.name)+'</option>'}).join('')+'<option value="__new">+ New group</option></select>':'')
      +'<button class="ib" data-act="delAth" data-id="'+a.id+'" aria-label="Remove '+esc(a.name)+'" title="Remove">✕</button></div>'}).join('')
    :'<p class="empty">No athletes yet. Add your team and they appear on the mat.</p>')
   +'<div class="ctl"><button class="btn small" data-act="addAth">+ Add athlete</button></div>'
   +H('Tap an athlete’s initials to spotlight them: their dot stands out on the mat, their path shows across every 8-count, and the count sheet lists their spot.')
   +(!GROUPS_ON?'':''
   +'<div class="mgroup"><span class="fl">Stunt groups</span>'
   +(R.groups.length?R.groups.map(function(g){return '<div class="grow"><span class="gsw" style="background:'+g.color+'"></span><input class="field" id="grp-'+g.id+'" data-f="grp" data-id="'+g.id+'" value="'+esc(g.name)+'" aria-label="Group name">'
      +'<span class="sub">'+membersOf(g.id).map(function(a){return esc(a.name)}).join(', ')+'</span><span class="ctl"><button class="btn small" data-act="formLift" data-id="'+g.id+'" title="Flyer in the middle, bases either side, back spot behind">Set lift</button><button class="btn small quiet" data-act="delGrp" data-id="'+g.id+'">Ungroup</button></span></div>'}).join('')
     :'<p class="note">No stunt groups yet. Pick a group next to each athlete, or drag a box around athletes on the mat.</p>'))
   +H('Grouped athletes line up for a lift and move together when you drag the group’s name tag on the mat. Drag a single athlete to move just them.')
   +'</div>';
  if(teamOf(R))team='<p class="note">This roster belongs to <b>'+esc(teamOf(R).name)+'</b>, so changes here update its other routines too. <button class="btn small quiet" data-act="openTeam" data-id="'+R.teamId+'">Manage team ›</button></p>'+team;
  var stab=L.setupTab&&{team:1,media:1,versions:1}[L.setupTab]?L.setupTab:'team';
  var setupBody='<div id="mstatus"></div><div class="tabs" role="tablist" aria-label="Setup">'
    +[['team','Team'],['media',VIDEO_ON?'Music & video':'Music'],['versions','Versions & backup']].map(function(t){return '<button class="tab'+(stab===t[0]?' on':'')+'" role="tab" aria-selected="'+(stab===t[0])+'" data-act="setupTab" data-id="'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div>'
    +'<div class="tabpanel" role="tabpanel">'+(stab==='team'?team:stab==='media'?mediaBody:verBody)+'</div>';

  /* ---------- scoresheet ---------- */
  var cov=coverage(),sh=SHEETS[R.sheet.tpl],warns=sheetWarnings(cov),done=0,tot=0,sk=skillsNoted();
  var catsHtml=sheetCats().map(function(c){return '<div class="scat"><span class="fl">'+esc(c.cat)+'</span>'+c.items.map(function(x){
      var hits=cov[x.k]||[],need=x.need||1,st=hits.length>=need?'ok':(hits.length?'part':'miss'),op=!!scoreOpen[x.k];tot++;if(st==='ok')done++;
      return '<div class="srow '+st+'"><button class="sline" data-act="scoreItem" data-k="'+x.k+'" aria-expanded="'+op+'"><span class="sico" aria-hidden="true">'+(st==='ok'?'✓':st==='part'?'◐':'○')+'</span><b>'+esc(x.n)+'</b>'
        +'<span class="sub">'+hits.length+'/'+need+(x.pts?' · '+x.pts+' pts':'')+'</span><span class="chev" aria-hidden="true">'+(op?'▾':'▸')+'</span></button>'
        +(op?'<div class="sdet">'+(x.tip?'<p class="note">'+esc(x.tip)+'</p>':'')+(x.k==='stunt'&&sk.length?'<p class="note"><b>'+sk.length+' different skills noted:</b> '+esc(sk.join(', '))+'</p>':'')
          +(hits.length?'<div class="where"><span class="note">8-counts</span>'+hits.map(function(h){return '<button class="chip" data-act="sel" data-id="'+h.id+'" aria-label="Go to 8-count '+h.n+'">'+h.n+'</button>'}).join('')+'</div>':'<p class="note">Not planned yet. Tag an 8-count with “Scores for”.</p>')
          +(x.custom?'<button class="btn small quiet" data-act="delCustom" data-k="'+x.k+'">Remove this item</button>':'')+'</div>':'')
        +'</div>'}).join('')+'</div>'}).join('');
  var scoreBody='<div class="mrow"><select class="field" id="sheetTpl" data-f="sheetTpl" aria-label="Scoresheet">'
     +Object.keys(SHEETS).map(function(k){return '<option value="'+k+'"'+(k===R.sheet.tpl?' selected':'')+'>'+esc(SHEETS[k].name)+'</option>'}).join('')+'</select></div>'
   +'<div class="ssum"><span class="bar" style="width:100%"><i style="width:'+(tot?Math.round(done/tot*100):0)+'%"></i></span>'+H(esc(sh.note)+' Tap an element for details.')+'</div>'
   +warns.map(function(w){return '<p class="warn">'+esc(w)+'</p>'}).join('')
   +catsHtml
   +'<div class="mgroup"><button class="btn small quiet" data-act="customOpen" aria-expanded="'+customOpen+'">'+(customOpen?'▾':'▸')+' Add your own item</button>'
   +(customOpen?'<div class="mrow"><input class="field" id="cname" placeholder="e.g. Coed stunt, Signs section" aria-label="Item name"><label>Need <input class="field num" id="cneed" type="number" min="1" max="20" value="1" inputmode="numeric"></label><button class="btn small" data-act="addCustom">Add</button></div>':'')+'</div>'
   +(sh.src.length?'<div class="srcs"><span>Based on:</span>'+sh.src.map(function(x){return '<a href="'+esc(x[1])+'" target="_blank" rel="noopener noreferrer">'+esc(x[0])+'</a>'}).join('')+'</div>':'')
   +H('A planning guide, not an official score. Judges score difficulty and execution on the day.');

  var bodies={
    video:['Video','',''],
    mat:['Formation','<span class="seg" role="group" aria-label="Mat view"><button data-act="matView" data-id="top" aria-pressed="'+(L.matView!=='front')+'">Top</button><button data-act="matView" data-id="front" aria-pressed="'+(L.matView==='front')+'">Front</button></span> <span id="matSub"></span> '+(VIDEO_ON?'<button class="btn small quiet" data-act="matOnly">'+(L.collapsed.video?'Show video':'Mat only')+'</button>':'')+'<button class="btn small quiet" data-act="bigMat" title="Big mat (B)">'+(L.size.mat==='full'?'Normal size':'⤢ Big mat')+'</button>',''],
    sheet:['Count sheet',it.list.length+' eight-counts'+(trf.total?' · <span class="tw">⚠ '+trf.total+' traffic</span>':''),sheet.replace('%%EDITOR%%',sheetOpen?editor:'')+'<datalist id="secnames">'+SECTION_NAMES.map(function(n){return '<option value="'+n+'">'}).join('')+'</datalist><div class="ctl"><button class="btn small quiet" data-act="addSec">+ Add section</button></div>'+H('Tap an 8-count to open it. Drag ⠿ to reorder 8-counts and sections. ⋯ on a section adds 8-counts and alternates.')],
    score:['Scoresheet',done+' of '+tot+' planned',scoreBody],
    setup:['Setup',R.athletes.length+' athletes · '+(R.audio?'song added':'no song')+' · '+R.versions.length+' version'+(R.versions.length===1?'':'s'),setupBody]};

  /* ---------- header ---------- */
  var mb=function(act,label,q){return '<button class="btn small'+(q?' quiet':'')+'" data-act="'+act+'">'+label+'</button>'};
  var panels=(vexOpen?vexPanel():'')+(kbdOpen?kbdHtml():'')
   +(moreOpen?'<div class="pdfpanel" id="morePanel"><span class="fl">Import &amp; export</span><div class="moregrid">'
     +mb('expOne','⇩ Export this routine')+mb('expAll','⇩ Export all routines')+mb('imp','⇧ Import a file')+mb('pdfMenu','⎙ Print / PDF')+mb('sendTeam','📲 Send to team')+mb('vexMenu','🎬 Video for athletes')+mb('prodX','⇩ Producer count sheet (Excel)')+mb('prodCsv','⇩ Producer count sheet (CSV)')
     +'</div>'+H('Exports are .json files you can keep as a backup or send to another coach. Importing adds routines next to yours and never replaces them. Song files stay in this playbook.')
     +'<div class="ctl">'+mb('moreMenu','Close',1)+'</div></div>':'')
   +(gearOpen?'<div class="pdfpanel" id="gearPanel"><div class="ctl" style="justify-content:space-between"><span class="fl">Tiles in this view</span>'+mb('gearMenu','Close',1)+'</div>'
     +'<div class="tilechecks">'+L.order.map(function(id){return '<label class="tog"><input type="checkbox" data-f="tileVis" data-id="'+id+'"'+(L.hidden[id]?'':' checked')+'> '+esc(TILES[id])+'</label>'}).join('')+'</div>'
     +'<div class="ctl"><button class="btn small'+(arranging?' primary':'')+'" data-act="arrange">'+(arranging?'✓ Done moving':'⠿ Move &amp; resize tiles')+'</button>'+mb('vwMenu','⊞ Saved views')+mb('resetLayout','Reset layout',1)+'</div>'
     +H('Hidden tiles keep working in the background, so the music and mat still play. Save the layout as a view to switch between setups.')
     +'<span class="fl" style="margin-top:12px">Settings</span><div class="moregrid">'+mb('helpToggle',L.help?'? Hide help text':'? Show help text')+mb('kbdHelp','⌨ Keyboard shortcuts')+mb('dupR','Duplicate routine')+mb('delR','Delete routine',1)+mb('fresh','Clear this routine',1)+'</div></div>':'')
   +(viewsOpen?'<div class="pdfpanel" id="viewPanel"><span class="fl">Saved views</span>'
     +(D.views.length?'<ul class="vlist">'+D.views.map(function(v){var st=D.startView===v.id,now=currentView()===v;
        return '<li class="vitem"><b>'+esc(v.name)+'</b>'+(st?'<span class="sub">★ starting view</span>':'')+(now?'<span class="sub">· showing now</span>':'')
         +'<span class="ctl" style="margin-left:auto">'+(now?'':'<button class="btn small" data-act="vwApply" data-id="'+v.id+'">Show</button>')
         +'<button class="btn small" data-act="vwStart" data-id="'+v.id+'">'+(st?'Stop opening in this':'Open in this view')+'</button>'
         +(now?'':'<button class="btn small" data-act="vwUpdate" data-id="'+v.id+'">Update to current layout</button>')
         +'<button class="btn small quiet" data-act="vwDel" data-id="'+v.id+'">Delete</button></span></li>'}).join('')+'</ul>'
       :'<p class="note">Arrange the tiles the way you like, then save it as a view.</p>')
     +'<div class="mrow"><input class="field" id="vwName" placeholder="Name this layout, e.g. Designing" aria-label="View name"><label class="tog"><input type="checkbox" id="vwStartNew"'+(D.views.length?'':' checked')+'> Open the playbook in this view</label><button class="btn small primary" data-act="vwSave">Save current layout</button></div>'
     +H('Views are saved in the playbook, so they work on every device and for everyone who opens it after you tap Save. The playbook always opens in the starting view.')
     +'<div class="ctl"><button class="btn small quiet" data-act="vwMenu">Close</button></div></div>':'')
   +(pdfOpen?'<div class="pdfpanel" id="pdfPanel"><span class="fl">Print or save as PDF</span>'
     +'<label class="tog"><input type="checkbox" id="pfForm" checked> Formation diagram for each 8-count</label>'
     +'<label class="tog"><input type="checkbox" id="pfNotes" checked> Notes</label>'
     +'<label class="tog"><input type="checkbox" id="pfScore" checked> Scoresheet checklist</label>'
     +'<label class="tog"><input type="checkbox" id="pfTeam" checked> Team</label>'
     +(spotAth()?'<label class="tog"><input type="checkbox" id="pfSpot" checked> Spotlight notes for '+esc(spotAth().name)+'</label>':'')
     +'<div class="ctl"><button class="btn small primary" data-act="pdfMake" id="pdfMakeBtn">Download PDF</button><button class="btn small quiet" data-act="pdfMenu">Close</button></div>'
     +H('Open the saved PDF to print it. Uses the routine on screen, with the versions of each section that are chosen.')+'</div>':'');
  if(PHONE){renderPhoneEditor({n:it.list.length,trf:trf,done:done,tot:tot,sheet:bodies.sheet[2].replace(editor,''),editor:editor,score:scoreBody,setup:setupBody,panels:panels});
    if(L.spot&&!spotAth())L.spot=null;updateSpotUI();updateTitles();updateMeta();updateSong();renderMsg();updatePlayBtn();updateRangeUI();updateUndo();renderSelBar();
    applyMatView();var tt0=matWrap.querySelector('#trafTog')||(matCtl&&matCtl.querySelector('#trafTog'));if(tt0)tt0.checked=L.traffic!==false;if(!playing)renderMat();lastMsg=null;syncVideos(false);updateLive(false);updateStatus();return}
  app.innerHTML='<div class="wrap">'
   +'<header class="top"><div class="brandrow">'+CB_LOGO+'<b class="cbword">cheer<span>book</span></b><span class="devtag">Beta</span>'
   +'<span class="status" id="status"></span><button class="btn small" id="undoBtn" data-act="undo" title="Undo" aria-label="Undo">↶<span class="undoTxt"> Undo</span></button><button class="btn small" id="redoBtn" data-act="redo" title="Redo" aria-label="Redo">↷<span class="undoTxt"> Redo</span></button>'
   +(D.views.length?'<select class="field rpick" id="viewSel" data-f="viewSel" aria-label="Tile view" style="flex:0 1 170px"><option value="">'+(currentView()?'':'Unsaved layout')+'</option>'+D.views.map(function(v){return '<option value="'+v.id+'"'+(currentView()===v?' selected':'')+'>'+esc(v.name)+(D.startView===v.id?' ★':'')+'</option>'}).join('')+'</select>':'')
   +'<button class="btn small gearbtn" data-act="gearMenu" aria-expanded="'+gearOpen+'" aria-label="Tiles and layout" title="Tiles and layout">⚙</button><button class="btn small" data-act="moreMenu" aria-expanded="'+moreOpen+'" aria-label="Import and export" title="Import, export and print">⇅<span class="undoTxt"> Import / Export</span></button><button class="btn primary" id="saveBtn" data-act="save" hidden>Save</button></div>'
   +panels
   +'<div class="rbar"><button class="btn small" data-act="nav" data-id="home">‹ Routines</button><select class="field rpick" id="rpick" data-f="rpick" aria-label="Routine">'
   +D.routines.filter(function(r){return !r.deletedAt&&(!r.archived||r===R)}).map(function(r){return '<option value="'+r.id+'"'+(r===R?' selected':'')+'>'+esc(r.name||'Untitled routine')+'</option>'}).join('')+'</select>'
   +'<button class="btn small" data-act="newR">+ New routine</button></div>'
   +'<input class="rname" id="rname" data-f="name" value="'+esc(R.name)+'" aria-label="Routine name" placeholder="Routine name">'
   +'<div class="meta"><span><b id="mCount"></b> eight-counts</span><span>≈ <b id="mTime"></b> of <span id="mMax"></span></span><span class="bar" id="mBar"><i></i></span></div></header>'
   +'<div class="banner" id="banner"'+(R.sample?'':' hidden')+'><p>This is a sample routine so you can see how it works. Edit anything to make it yours, or clear it and start from scratch.</p>'
   +'<button class="btn small" data-act="fresh">Start blank</button></div>'
   +(arranging?'<div class="arrbar" role="status"><span><b>Arranging tiles.</b> Drag ⠿ to move a tile, or use ← → and the width button.</span><button class="btn small" data-act="vwMenu">Save as a view</button><button class="btn small primary" data-act="arrange">Done</button></div>':'')
   +'<div class="tiles'+(arranging?' arranging':'')+'" id="tiles">'+L.order.map(function(id){var b=bodies[id];return b?tileShell(id,b[0],b[1],b[2],b[3]):''}).join('')+'</div></div>';
  var vslot=app.querySelector('[data-slot="video"]');if(vslot)vslot.replaceWith(vidWrap);
  app.querySelector('[data-slot="mat"]').replaceWith(matWrap);
  if(L.spot&&!spotAth())L.spot=null;updateSpotUI();updateTitles();updateMeta();updateSong();renderMsg();updatePlayBtn();updateRangeUI();updateUndo();renderSelBar();
  applyMatView();var tt=matWrap.querySelector('#trafTog');if(tt)tt.checked=L.traffic!==false;
  if(!playing)renderMat();
  lastMsg=null;syncVideos(false);updateLive(false);updateStatus();
  watchTiles();layoutTiles();
}
/* each tile spans as many 4px rows as it is tall, so tiles pack into the gaps (order may shift slightly) */
var tileRO=null,layoutQueued=0;
function layoutTiles(){var box=document.getElementById('tiles');if(!box)return;
  var tiles=Array.prototype.slice.call(box.querySelectorAll('.tile:not([hidden])')),W=box.clientWidth,narrow=!!(window.matchMedia&&window.matchMedia('(max-width:860px)').matches),gap=PHONE?12:16;
  if(!W)return;var unit=(W-11*gap)/12,span=function(t){if(narrow)return 12;return t.classList.contains('full')?12:t.classList.contains('third')?4:6};
  tiles.forEach(function(t){var w=span(t);t.style.width=(w*unit+(w-1)*gap)+'px'});
  var hts=tiles.map(function(t){return t.offsetHeight});
  function pack(order,defer){var col=[0,0,0,0,0,0,0,0,0,0,0,0],queue=order.slice(),pos=[],hole=0,seq=[];
    function bestStart(w){var best=null;for(var s0=0;s0+w<=12;s0++){var y=Math.max.apply(0,col.slice(s0,s0+w));if(!best||y<best.y-1)best={s:s0,y:y}}return best}
    while(queue.length){var pick=0,spread=Math.max.apply(0,col)-Math.min.apply(0,col);
      if(defer&&span(tiles[queue[0]])===12&&spread>40){for(var q=1;q<queue.length;q++){if(span(tiles[queue[q]])<12){pick=q;break}}}
      var i=queue.splice(pick,1)[0],w=span(tiles[i]),b=bestStart(w);
      for(var k=b.s;k<b.s+w;k++){hole+=b.y-col[k];col[k]=b.y+hts[i]+gap}b.w=w;pos[i]=b;seq.push(i)}
    return {pos:pos,hole:hole,col:col,seq:seq}}
  /* keep the coach's order when it packs cleanly; otherwise lift full-width tiles to the top so no gaps open up */
  var idx=tiles.map(function(t,i){return i}),res=pack(idx,true);
  if(res.hole>40*12){var full=idx.filter(function(i){return span(tiles[i])===12}),rest=idx.filter(function(i){return span(tiles[i])<12});
    var alt=pack(full.concat(rest),false);if(alt.hole<res.hole)res=alt}
  /* widen any tile that has empty columns beside it, then stack again with the new widths */
  var P=res.pos;
  function freeCol(c,i){var a=P[i],y0=a.y,y1=a.y+hts[i]+gap;
    return !P.some(function(o,j){return j!==i&&c>=o.s&&c<o.s+o.w&&o.y<y1&&o.y+hts[j]+gap>y0})}
  if(!narrow)res.seq.forEach(function(i){var a=P[i];
    while(a.s+a.w<12&&freeCol(a.s+a.w,i))a.w++;
    while(a.s>0&&freeCol(a.s-1,i)){a.s--;a.w++}});
  tiles.forEach(function(t,i){var w=P[i].w;t.style.width=(w*unit+(w-1)*gap)+'px'});
  hts=tiles.map(function(t){return t.offsetHeight});
  var col=[0,0,0,0,0,0,0,0,0,0,0,0];
  res.seq.forEach(function(i){var a=P[i],y=Math.max.apply(0,col.slice(a.s,a.s+a.w));a.y=y;for(var k=a.s;k<a.s+a.w;k++)col[k]=y+hts[i]+gap});
  tiles.forEach(function(t,i){var b=P[i];t.style.left=(b.s*(unit+gap))+'px';t.style.top=b.y+'px'});
  box.style.height=Math.max(0,Math.max.apply(0,col)-gap)+'px';
  var m=document.getElementById('mat');if(m){var mw=m.getBoundingClientRect().width,was=m.getAttribute('class')||'',cls=mw&&mw<330?'tiny':(mw&&mw<480?'small':'');
    if(was!==cls){if(cls)m.setAttribute('class',cls);else m.removeAttribute('class');if(!playing)renderMat()}}}
function queueLayout(){if(layoutQueued)return;layoutQueued=requestAnimationFrame(function(){layoutQueued=0;layoutTiles()})}
function watchTiles(){if(typeof ResizeObserver==='undefined')return;if(!tileRO)tileRO=new ResizeObserver(queueLayout);tileRO.disconnect();
  document.querySelectorAll('#tiles .tile').forEach(function(t){Array.prototype.forEach.call(t.children,function(c){tileRO.observe(c)})})}
window.addEventListener('resize',queueLayout);
function updateTitles(){var it=find(cur);var t=document.getElementById('eightTitle');if(t)t.textContent=secLabel(it.s)+' · 8-count '+(it.ei+1);
  var m=document.getElementById('matSub');if(m)m.textContent=it.list.length+' eight-counts'}
function updateMeta(){var n=flat().length, secs=routineSecs();
  var c=document.getElementById('mCount');if(!c)return;c.textContent=n;document.getElementById('mTime').textContent=fmt(secs);
  var mx=maxSecs(),mm=document.getElementById('mMax');if(mm)mm.textContent=fmt(mx);var b=document.getElementById('mBar');b.classList.toggle('over',secs>mx);b.firstChild.style.width=Math.min(100,secs/mx*100)+'%'}
function maxSecs(){return (SHEETS[R.sheet.tpl]||SHEETS.allstar).max}
function updateSong(){var a=document.getElementById('songLink');if(!a)return;var u=R.music||'',ok=/^https?:\/\/\S+\.\S+/i.test(u);
  a.hidden=!ok;if(ok){a.href=u;a.textContent=/youtu\.?be/i.test(u)?'Open on YouTube':'Open link'}}
/* during playback only the dots move, so once a full draw has been done for this 8-count, later frames just move the dots */
var matFast=null;
function renderMat(override){
  var g=document.getElementById('dots'),gh=document.getElementById('ghosts');if(!g)return;
  if(override&&matFast&&matFast.cur===cur&&matFast.g===g&&matFast.n===R.athletes.length&&!GROUPS_ON){
    for(var fi=0;fi<matFast.els.length;fi++){var fe=matFast.els[fi],fp=override[fe.id];if(fp)fe.node.setAttribute('transform','translate('+fp[0].toFixed(2)+' '+fp[1].toFixed(2)+')')}
    renderFront(override);return}
  var it=find(cur), prev=it.n>0?it.list[it.n-1].e:null, html='', ghosts='', sp=spotAth();
  var mcl=document.getElementById('mat'),crowd=R.athletes.length>20&&!!mcl&&/small|tiny/.test(mcl.getAttribute('class')||'');
  R.athletes.forEach(function(a,i){
    var p=override?override[a.id]:posOf(it.e,a,i);
    if(showGhost&&prev&&!override&&(!sp||sp===a)){var q=prev.pos[a.id];if(q&&(q[0]!==p[0]||q[1]!==p[1]))ghosts+='<path class="trail" d="'+pathD(q,p,(it.e.bend||{})[a.id])+'"/><circle class="ghost" cx="'+q[0]+'" cy="'+q[1]+'" r="1.7"/>'}
    var gp=groupOf(a),ly=3.3,hideName=false,isLit=sp===a,isDim=sp&&!isLit;
    if(gp){var mates=membersOf(gp.id).filter(function(m){return m!==a}),cy=p[1],cx=p[0];
      mates.forEach(function(m){var j=R.athletes.indexOf(m),q=override?override[m.id]:posOf(it.e,m,j);if(q&&Math.abs(q[0]-cx)<2&&q[1]>cy&&q[1]-cy<4.4)hideName=true});
      if(hideName){var above=mates.some(function(m){var j=R.athletes.indexOf(m),q=override?override[m.id]:posOf(it.e,m,j);return q&&Math.abs(q[0]-cx)<2&&q[1]<cy&&cy-q[1]<4.4});if(!above){ly=-2.4;hideName=false}}}
    if(crowd&&!isLit)hideName=true;
    html+='<g class="dot'+(isDim?' dim':'')+(isLit?' lit':'')+'" data-id="'+a.id+'" transform="translate('+p[0].toFixed(2)+' '+p[1].toFixed(2)+')" tabindex="0" role="button" aria-label="'+esc(a.name)+', '+a.role+(gp?', '+esc(gp.name):'')+(selMode?'. Tap to select.':'. Arrow keys move.')+'"'+(selMode?' aria-pressed="'+(sel.indexOf(a.id)>=0)+'"':'')+'>'
      +'<circle r="3" fill="transparent" stroke="none"/>'+(selMode&&sel.indexOf(a.id)>=0?'<circle r="2.6" class="selring"/>':'')+'<circle r="1.8" class="r-'+a.role.toLowerCase()+'"/><text class="ini" dy=".42">'+esc(initials(a.name))+'</text>'+(hideName?'':'<text class="nm" y="'+ly+'"'+(gp?' style="fill:'+gp.color+';font-weight:700"':'')+'>'+esc(a.name)+'</text>')+'</g>'});
  gh.innerHTML=ghosts;g.innerHTML=html;
  var spl=document.getElementById('spotPath');if(spl){var ph='';
    if(sp){var si=R.athletes.indexOf(sp),pts=it.list.map(function(r){return posOf(r.e,sp,si)});
      ph='<polyline class="splink" points="'+pts.map(function(q){return q[0].toFixed(2)+','+q[1].toFixed(2)}).join(' ')+'"/>';
      pts.forEach(function(q,k){var same=k>0&&Math.abs(q[0]-pts[k-1][0])<.01&&Math.abs(q[1]-pts[k-1][1])<.01;
        if(k===it.n)ph+='<circle class="spdot now" cx="'+q[0]+'" cy="'+q[1]+'" r="2.4"/>';
        if(!same){ph+='<circle class="spdot" cx="'+q[0]+'" cy="'+q[1]+'" r=".45"/><text class="spn" x="'+(q[0]+1.1)+'" y="'+(q[1]-.7)+'">'+(k+1)+'</text>'}})}
    spl.innerHTML=ph}
  var gb=document.getElementById('gboxes');if(gb)gb.innerHTML=groupBoxes(function(a,i){return override?override[a.id]:posOf(it.e,a,i)});
  /* bend handles sit on the middle of each travel path */
  var bh=document.getElementById('bends');if(bh){var hh='';
    if(showGhost&&prev&&!override&&!selMode)bendTargets(it.e,prev).forEach(function(t){var a=t.lead,i=R.athletes.indexOf(a),p0=posOf(prev,a,i),p1=posOf(it.e,a,i),mid=pathAt(p0,p1,(it.e.bend||{})[a.id],.5),bent=!!(it.e.bend||{})[a.id];
      hh+='<g class="bendh'+(bent?' bent':'')+'" '+(t.gid?'data-gid="'+t.gid+'"':'data-aid="'+a.id+'"')+' transform="translate('+mid[0].toFixed(2)+' '+mid[1].toFixed(2)+')" tabindex="0" role="button" aria-label="Bend the travel path for '+esc(t.gid?groupName(t.gid):a.name)+'. Drag or use arrow keys. Delete straightens it.">'
        +'<circle r="2.2" fill="transparent"/><circle class="bknob" r=".8"/></g>'});
    bh.innerHTML=hh}
  /* traffic markers for this 8-count */
  var tf=document.getElementById('traffic'),tb=document.getElementById('trafficBox');
  if(tf){var th='',list=(!override&&L.traffic!==false)?(allTraffic()[it.e.id]||[]):[];
    list.forEach(function(w){th+='<circle class="tmark'+(w.type==='sprint'?' sprint':'')+'" cx="'+w.at[0].toFixed(2)+'" cy="'+w.at[1].toFixed(2)+'" r="'+(w.type==='sprint'?2.6:2.2)+'"/>';
      if(w.type==='cross'&&prev)w.ids.forEach(function(id){var a=R.athletes.find(function(x){return x.id===id}),i=R.athletes.indexOf(a);th+='<path class="tpath" d="'+pathD(posOf(prev,a,i),posOf(it.e,a,i),(it.e.bend||{})[id])+'"/>'})});
    tf.innerHTML=th;
    if(tb)tb.innerHTML=list.length?'<div class="traf" role="status"><b>⚠ '+list.length+' traffic '+(list.length>1?'issues':'issue')+' in this 8-count</b><ul>'+list.map(function(w){return '<li>'+esc(w.text)+'</li>'}).join('')+'</ul><p class="note help">Bend a path by dragging its round handle, or move someone to a different spot.</p></div>':''}
  renderFront(override||null);
  matFast=override?{cur:cur,g:g,n:R.athletes.length,els:Array.prototype.map.call(g.children,function(n){return {id:n.getAttribute('data-id'),node:n}})}:null;
}
function refreshTraffic(){var t=L.traffic!==false?allTraffic():{total:0};
  document.querySelectorAll('.erow').forEach(function(r){var lbl=r.querySelector('.lbl');if(!lbl)return;var old=lbl.querySelector('.tw'),n=(t[r.dataset.id]||[]).length;
    if(old){var sepr=old.previousSibling;if(sepr&&sepr.nodeType===3)sepr.textContent=sepr.textContent.replace(/ · $/,'');old.remove()}
    if(n){lbl.appendChild(document.createTextNode(' · '));var sp2=document.createElement('span');sp2.className='tw';sp2.title='Traffic issues';sp2.textContent='⚠ '+n;lbl.appendChild(sp2)}});
  var hx=document.querySelector('[data-tile="sheet"] .tx');if(hx)hx.innerHTML=flat().length+' eight-counts'+(t.total?' · <span class="tw">⚠ '+t.total+' traffic</span>':'')}
function groupName(gid){var g=R.groups.find(function(x){return x.id===gid});return g?g.name:'group'}
/* ---- judges' front view: perspective from the front of the mat, lift heights from building notes ---- */
var liveBeat=null;
function skillLevel(t){t=String(t||'').toLowerCase();if(!t)return 0;if(/toss|basket/.test(t))return 3;if(/load|cradle|twist down|dismount|pop down/.test(t))return 0;
  if(/prep|half|shoulder|thigh|chair|elevator|sit/.test(t))return 1;return 2}
function groupLevel(e,gid,beat){var x=(e.build||{})[gid];if(!x||!x.skill)return {lv:0,skill:''};var lv=skillLevel(x.skill),hit=x.count||1;
  if(beat!=null&&Math.floor(beat)+1<hit){var f=flat(),k=f.findIndex(function(r){return r.e===e}),pe=k>0?f[k-1].e:null,px=pe&&(pe.build||{})[gid];return {lv:px&&px.skill?skillLevel(px.skill):0,skill:px&&px.skill||''}}
  return {lv:lv,skill:x.skill}}
function renderFront(override){var sv=document.getElementById('front');if(!sv||L.matView!=='front')return;
  var it=find(cur),e=it.e,sp=spotAth(),beat=override?liveBeat:null;
  var fw=sv.getBoundingClientRect().width||600,boost=fw<340?1.45:fw<480?1.25:1;
  var proj=function(x,y){var d=y/42;return {x:32+(x-27)*(46+14*d)/54,y:18+d*18,s:(.72+.28*d)*boost}};
  var h='<rect x="0" y="0" width="64" height="40" class="fsky"/>';
  var bl=proj(0,0),br=proj(54,0),fl=proj(0,42),fr=proj(54,42);
  h+='<polygon class="ffloor" points="'+[bl,br,fr,fl].map(function(q){return q.x.toFixed(2)+','+q.y.toFixed(2)}).join(' ')+'"/>';
  for(var j=1;j<9;j++){var a0=proj(j*6,0),a1=proj(j*6,42);h+='<line class="fpl" x1="'+a0.x.toFixed(2)+'" y1="'+a0.y.toFixed(2)+'" x2="'+a1.x.toFixed(2)+'" y2="'+a1.y.toFixed(2)+'"/>'}
  for(var k=0;k<9;k++){var nq=proj(3+k*6,42);h+='<text class="fnum" x="'+nq.x.toFixed(2)+'" y="'+(nq.y+2.4).toFixed(2)+'">'+(k+1)+'</text>'}
  h+='<text class="fcap" x="'+(br.x-.5).toFixed(2)+'" y="'+(br.y-1).toFixed(2)+'" style="text-anchor:end">BACK OF MAT</text><text class="fcap" x="1.5" y="2.6" style="text-anchor:start">FRONT VIEW · AS THE JUDGES SEE IT</text>';
  var lifted={},skills={};
  RG().forEach(function(g){var gl=groupLevel(e,g.id,beat),fly=flyerOf(g.id);if(fly&&fly.role==='Flyer'&&gl.lv>0){lifted[fly.id]=gl.lv;skills[fly.id]=gl.skill}});
  var people=R.athletes.map(function(a,i){var p=override?override[a.id]:posOf(e,a,i);return {a:a,p:p,q:proj(p[0],p[1])}});
  people.sort(function(m,n){return (m.p[1]+(lifted[m.a.id]?.5:0))-(n.p[1]+(lifted[n.a.id]?.5:0))});
  var top={};
  people.forEach(function(m){var a=m.a,q=m.q,s=q.s,lv=lifted[a.id]||0,bh=6.6*s,hr=1.3*s,w=2.4*s,lift=[0,4.6,8.6,11.8][lv]*s,feet=q.y-lift,dim=sp&&sp!==a;
    if(lv){var g=groupOf(a);membersOf(g.id).forEach(function(b){if(b===a)return;var bp=people.find(function(z){return z.a===b});if(!bp)return;var bs=bp.q.s;
      h+='<line class="farm'+(lv===3?' toss':'')+'" x1="'+bp.q.x.toFixed(2)+'" y1="'+(bp.q.y-6.1*bs).toFixed(2)+'" x2="'+q.x.toFixed(2)+'" y2="'+(lv===3?feet+3*s:feet).toFixed(2)+'"/>'})}
    h+='<g class="fp'+(dim?' dim':'')+'"><ellipse class="fshadow" cx="'+q.x.toFixed(2)+'" cy="'+q.y.toFixed(2)+'" rx="'+(w*.7).toFixed(2)+'" ry="'+(.35*s).toFixed(2)+'"/>'
      +'<rect class="r-'+a.role.toLowerCase()+'" x="'+(q.x-w/2).toFixed(2)+'" y="'+(feet-bh).toFixed(2)+'" width="'+w.toFixed(2)+'" height="'+bh.toFixed(2)+'" rx="'+(w/2).toFixed(2)+'"/>'
      +'<circle class="fhead" cx="'+q.x.toFixed(2)+'" cy="'+(feet-bh-hr*.9).toFixed(2)+'" r="'+hr.toFixed(2)+'"/>'
      +'<text class="fini" x="'+q.x.toFixed(2)+'" y="'+(feet-bh*.45).toFixed(2)+'" style="font-size:'+(1.25*s).toFixed(2)+'px">'+esc(initials(a.name))+'</text>'
      +(lv?'<text class="fskill" x="'+q.x.toFixed(2)+'" y="'+Math.max(1.6*boost,feet-bh-hr*2.3).toFixed(2)+'" style="font-size:'+(1.5*boost).toFixed(2)+'px">'+esc(skills[a.id])+'</text>':'')+'</g>';
    top[a.id]={x:q.x,y:feet-bh*.8}});
  liveLinks(e).forEach(function(l){var fa=flyerOf(l[0]),fb=flyerOf(l[1]);if(!fa||!fb||!lifted[fa.id]||!lifted[fb.id])return;var ta=top[fa.id],tb=top[fb.id];
    h+='<line class="flink" x1="'+ta.x.toFixed(2)+'" y1="'+ta.y.toFixed(2)+'" x2="'+tb.x.toFixed(2)+'" y2="'+tb.y.toFixed(2)+'"/>'});
  sv.innerHTML=h}
function applyMatView(){var front=L.matView==='front',fb=document.getElementById('frontBox'),mb=document.getElementById('matBox');if(fb)fb.hidden=!front;if(mb)mb.hidden=front;
  document.querySelectorAll('[data-act="matView"]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.id===(front?'front':'top')))});if(front)renderFront(null)}
function labelScale(){var m=document.getElementById('mat');return m&&m.classList.contains('tiny')?1.55:m&&m.classList.contains('small')?1.3:1}
var ghTap=null;
function toggleBox(gid){var g=R.groups.find(function(x){return x.id===gid});if(!g)return;drag=null;if(g.noBox)delete g.noBox;else g.noBox=true;markDirty();renderMat();
  var ng=document.querySelector('#mat .ghandle[data-gid="'+gid+'"]');if(ng)ng.focus();flash(g.noBox?'Outline hidden for '+g.name+'. Double-tap the name to bring it back.':'Outline showing for '+g.name+'.')}
/* Stunt groups are switched off: coaches select athletes (tap several, or draw a box) and move them together instead.
   Saved group data is kept untouched, so turning GROUPS_ON back on restores it. */
var GROUPS_ON=false;
function RG(){return GROUPS_ON?R.groups:[]}
function groupOf(a){return GROUPS_ON&&a.group?R.groups.find(function(g){return g.id===a.group}):null}
function membersOf(gid){return GROUPS_ON?R.athletes.filter(function(a){return a.group===gid}):[]}
function groupBoxes(posFn){var out='',ce=find(cur).e,cb=ce.build||{};
  liveLinks(ce).forEach(function(l){var fa=flyerOf(l[0]),fb=flyerOf(l[1]);if(!fa||!fb)return;var pa=posFn(fa,R.athletes.indexOf(fa)),pb=posFn(fb,R.athletes.indexOf(fb));if(!pa||!pb)return;
    out+='<line class="plink" x1="'+pa[0].toFixed(2)+'" y1="'+pa[1].toFixed(2)+'" x2="'+pb[0].toFixed(2)+'" y2="'+pb[1].toFixed(2)+'"/>'});
  RG().forEach(function(g){var xs=[],ys=[];R.athletes.forEach(function(a,i){if(a.group!==g.id)return;var p=posFn(a,i);if(p){xs.push(p[0]);ys.push(p[1])}});if(!xs.length)return;
    var x0=Math.min.apply(0,xs)-2.4,x1=Math.max.apply(0,xs)+2.4,y0=Math.min.apply(0,ys)-3.9,y1=Math.max.apply(0,ys)+4.2;
    out+='<rect class="gbox'+(g.noBox?' off':'')+'" data-gid="'+g.id+'" x="'+x0.toFixed(2)+'" y="'+y0.toFixed(2)+'" width="'+(x1-x0).toFixed(2)+'" height="'+(y1-y0).toFixed(2)+'" rx="1.4" style="stroke:'+g.color+'"/>'
      +'<g class="ghandle'+(g.noBox?' nobox':'')+'" data-gid="'+g.id+'" tabindex="0" role="button" aria-label="'+esc(g.name)+'. Drag or use arrow keys to move the whole group. Double-tap to '+(g.noBox?'show':'hide')+' the outline." transform="translate('+x0.toFixed(2)+' '+(y0-2.5).toFixed(2)+')">'
      +(function(){var sk=cb[g.id]&&cb[g.id].skill?' · '+cb[g.id].skill:'',lab=g.name+sk;
        return '<rect width="'+(Math.max(4.6,(lab.length+2)*.72*labelScale()+1.2)).toFixed(2)+'" height="'+(2.2*labelScale()).toFixed(2)+'" rx="'+(1.1*labelScale()).toFixed(2)+'" style="fill:'+g.color+'"/><text x=".8" y="'+(1.55*labelScale()).toFixed(2)+'">⠿ '+esc(lab)+'</text></g>'})()});
  return out}
/* select athletes on the mat (tap several, or draw a box) to move them together */
var selMode=false,sel=[],box=null;
function drawBox(){var r=document.getElementById('marquee');if(!r)return;if(!box){r.setAttribute('visibility','hidden');return}
  r.setAttribute('x',Math.min(box.x0,box.x1));r.setAttribute('y',Math.min(box.y0,box.y1));r.setAttribute('width',Math.abs(box.x1-box.x0));r.setAttribute('height',Math.abs(box.y1-box.y0));r.setAttribute('visibility','visible')}
function endBox(){var b0=box;box=null;drawBox();
  var x0=Math.min(b0.x0,b0.x1),x1=Math.max(b0.x0,b0.x1),y0=Math.min(b0.y0,b0.y1),y1=Math.max(b0.y0,b0.y1);
  if(x1-x0<1&&y1-y0<1){if(betaTapCheck('empty'))return;if(selMode&&sel.length){sel=[];renderMat();renderSelBar()}return}
  var it=find(cur),hit=R.athletes.filter(function(a,i){var p=posOf(it.e,a,i);return p[0]>=x0-1&&p[0]<=x1+1&&p[1]>=y0-1&&p[1]<=y1+1}).map(function(a){return a.id});
  if(!hit.length){flash('No athletes inside that box.');return}
  if(!selMode){selMode=true;sel=[]}
  hit.forEach(function(id){if(sel.indexOf(id)<0)sel.push(id)});renderMat();renderSelBar();
  flash(sel.length+' selected. Drag any of them to move them together.')}
function renderSelBar(){var b=document.getElementById('selBar'),btn=document.getElementById('selBtn');if(!b)return;
  if(btn)btn.textContent=selMode?'Done selecting':'Select athletes';
  if(!selMode){b.hidden=true;b.innerHTML='';return}
  b.hidden=false;
  b.innerHTML='<span><b>'+sel.length+'</b> selected. '+(sel.length>1?'Drag any of them to move them all together. ':'')+'Tap an athlete to add or remove them, or draw a box around more.</span>'
   +(!GROUPS_ON?'':'<button class="btn small primary" data-act="selMake"'+(sel.length<2?' disabled':'')+'>Make stunt group</button>'
   +(R.groups.length?'<select class="field" id="selAdd" data-f="selAdd"'+(sel.length?'':' disabled')+'><option value="">Add to a group…</option>'+R.groups.map(function(g){return '<option value="'+g.id+'">'+esc(g.name)+'</option>'}).join('')+'</select>':'')
   +'<button class="btn small" data-act="selUngroup"'+(sel.length?'':' disabled')+'>Take out of group</button>')
   +'<button class="btn small quiet" data-act="selClear"'+(sel.length?'':' disabled')+'>Clear</button>'
   +(function(){var w=find(cur).e.move||[1,MOVE];return '<span class="selmv">Travel on counts <select class="field num" id="selMvA" aria-label="Selected athletes start travelling on count">'+cntOpts(w[0])+'</select> to <select class="field num" id="selMvB" aria-label="Selected athletes arrive on count">'+cntOpts(w[1])+'</select><button class="btn small" data-act="selMove"'+(sel.length?'':' disabled')+'>Set for selected</button></span>'})()}
function nextGroupColor(){var used=R.groups.map(function(g){return g.color});return GROUP_COLORS.find(function(c){return used.indexOf(c)<0})||GROUP_COLORS[R.groups.length%GROUP_COLORS.length]}
function newGroup(ids){var g={id:uid(),name:'Group '+(R.groups.length+1),color:nextGroupColor()};R.groups.push(g);
  R.athletes.forEach(function(a){if(ids.indexOf(a.id)>=0)a.group=g.id});return g}
/* put a stunt group into a lift: flyer in the middle, bases either side, back spot behind, anyone else in front */
/* Lift shape (feet from the flyer): flyer 0,0 · bases left -3.2,0 and right +3.2,0 · back spot 0,-3.4 (behind) · fifth athlete front spot 0,+3.4.
   Four athletes make a T, five make a cross. Groups with more than one flyer use the older side-by-side layout. */
var LIFT_SLOTS={center:[0,0],left:[-3.2,0],right:[3.2,0],back:[0,-3.4],front:[0,3.4]};
function liftOffsets(ms){var by=function(r){return ms.filter(function(a){return a.role===r})};
  if(by('Flyer').length<=1&&ms.length<=5){var out1={},left=ms.slice(),take=function(role){var i=left.findIndex(function(a){return a.role===role});return i<0?null:left.splice(i,1)[0]};
    var c=take('Flyer')||take('Base')||take('Backspot')||left.shift();out1[c.id]=LIFT_SLOTS.center;
    var free=['left','right','back','front'];
    [['Base','left'],['Base','right'],['Backspot','back']].forEach(function(pr){var a=take(pr[0]);if(a){out1[a.id]=LIFT_SLOTS[pr[1]];free.splice(free.indexOf(pr[1]),1)}});
    left.forEach(function(a){var sl=free.shift();if(sl)out1[a.id]=LIFT_SLOTS[sl]});
    return out1}
  return liftOffsetsMulti(ms)}
function liftOffsetsMulti(ms){var by=function(r){return ms.filter(function(a){return a.role===r})};
  var fl=by('Flyer'),ba=by('Base'),bs=by('Backspot'),ot=ms.filter(function(a){return ['Flyer','Base','Backspot'].indexOf(a.role)<0}),out={};
  if(!fl.length){var c=ba.shift()||bs.shift()||ot.shift();if(!c)return out;fl=[c]}
  var n=fl.length;fl.forEach(function(a,i){out[a.id]=[(i-(n-1)/2)*7.2,0]});
  var X=function(i){return out[fl[i%n].id][0]};
  ba.forEach(function(a,j){var f=Math.floor(j/2),row=Math.floor(f/n);out[a.id]=[X(f)+(j%2?3.2:-3.2),row*3.4]});
  bs.forEach(function(a,k){out[a.id]=[X(k),-3.4*(1+Math.floor(k/n))]});
  ot.forEach(function(a,k){out[a.id]=[X(k),3.4*(1+Math.floor(k/n))]});
  return out}
function formLift(gid,e){var ms=membersOf(gid);if(ms.length<2)return;e=e||find(cur).e;
  var xs=0,ys=0;ms.forEach(function(a){var p=posOf(e,a,R.athletes.indexOf(a));xs+=p[0];ys+=p[1]});
  var c=snapPos(xs/ms.length,ys/ms.length),off=liftOffsets(ms);
  var minX=0,maxX=0,minY=0,maxY=0;Object.keys(off).forEach(function(k){minX=Math.min(minX,off[k][0]);maxX=Math.max(maxX,off[k][0]);minY=Math.min(minY,off[k][1]);maxY=Math.max(maxY,off[k][1])});
  c[0]=Math.max(-minX+1,Math.min(53-maxX,c[0]));c[1]=Math.max(-minY+1,Math.min(41-maxY,c[1]));
  ms.forEach(function(a){var o=off[a.id]||[0,0];e.pos[a.id]=[r2(c[0]+o[0]),r2(c[1]+o[1])]})}
function pruneGroups(){R.groups=R.groups.filter(function(g){return membersOf(g.id).length>0})}
function updateStatus(){
  var st=document.getElementById('status'),btn=document.getElementById('saveBtn');if(!st)return;
  if(sync.on){btn.hidden=true;var busy=sync.busy||sync.pending;st.classList.toggle('dirty',busy||!!sync.err);
    st.textContent=readOnly?'View only · edits stay on this device':!syncReady()?'Connecting…':sync.err==='big'?(sync.bigWhat+' is too big to sync'):sync.err==='full'?'Storage is full · edits stay on this device'
      :sync.err==='lost'?'Sync paused · reload to reconnect':sync.err==='retry'?'Can’t reach the playbook · retrying':busy?'Saving…':sync.offline?'Offline · saved on this device':'All changes saved';return}
  var canSave=artApi&&!readOnly;
  st.classList.toggle('dirty',dirty);
  st.textContent=saving?'Saving…':(!canSave?(readOnly?'View only · edits stay on this device':'Edits saved on this device'):(dirty?'Unsaved changes':'All changes saved'));
  btn.hidden=!canSave;btn.disabled=!dirty||saving;
}
var toastT;
function flash(msg){if(sync.on)msg=String(msg).replace(/\s*Tap Save to keep[^.]*\./g,'');var t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';t.setAttribute('role','status');document.body.appendChild(t)}
  t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(function(){t.hidden=true},4500)}
function setMsg(text,err,startLabel){mediaMsg=text?{text:text,err:!!err,start:startLabel||''}:null;renderMsg()}
function renderMsg(){var m=document.getElementById('mstatus');if(!m)return;
  if(!mediaMsg){m.className='';m.innerHTML='';return}
  m.className='mstatus'+(mediaMsg.err?' err':'');
  m.innerHTML='<span>'+esc(mediaMsg.text)+'</span>'+(mediaMsg.start?'<button class="btn small primary" data-act="startJob">'+esc(mediaMsg.start)+'</button><button class="btn small quiet" data-act="cancelJob">Cancel</button>':'')}

/* ---- confirm-by-second-tap ---- */
var armed=null,armT;
function confirmTap(btn,key){if(armed===key){armed=null;clearTimeout(armT);return true}
  if(armed){var old=document.querySelector('.btn.armed');if(old){old.textContent=old.dataset.orig;old.classList.remove('armed')}}
  armed=key;btn.dataset.orig=btn.textContent;btn.textContent='Tap again to confirm';btn.classList.add('armed');
  clearTimeout(armT);armT=setTimeout(function(){armed=null;if(btn.isConnected){btn.textContent=btn.dataset.orig;btn.classList.remove('armed')}},3000);return false}

/* ---- uploads: songs, the original video and alternate clips ---- */
var job=null;
function pickFile(accept,cb){var i=document.createElement('input');i.type='file';i.accept=accept;i.className='offscreen';document.body.appendChild(i);
  i.addEventListener('change',function(){var f=i.files&&i.files[0];i.remove();if(f)cb(f)});i.click()}
function probe(file,isVideo){return new Promise(function(res,rej){
  var el=document.createElement(isVideo?'video':'audio');el.preload='auto';el.playsInline=true;el.setAttribute('playsinline','');el.className='offscreen';
  var url=URL.createObjectURL(file),done=false;
  var to=setTimeout(function(){if(!done){done=true;cleanupEl(el);rej(new Error('timeout'))}},20000);
  el.addEventListener('loadedmetadata',function(){if(done)return;
    var finish=function(){if(done)return;done=true;clearTimeout(to);res({el:el,dur:el.duration})};
    if(isFinite(el.duration))finish();
    else{el.currentTime=1e7;el.addEventListener('durationchange',function(){if(isFinite(el.duration)){el.currentTime=0;finish()}})}});
  el.addEventListener('error',function(){if(done)return;done=true;clearTimeout(to);cleanupEl(el);rej(new Error('decode'))});
  el.src=url;document.body.appendChild(el);
})}
function cleanupEl(el){try{el.pause()}catch(e){}try{URL.revokeObjectURL(el.src)}catch(e){}el.remove()}
function pickMime(isVideo){
  if(typeof MediaRecorder==='undefined')return '';
  var list=isVideo?['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp8,opus','video/webm']
                  :['audio/mp4;codecs=mp4a.40.2','audio/mp4','audio/webm;codecs=opus','audio/webm'];
  for(var i=0;i<list.length;i++){try{if(MediaRecorder.isTypeSupported(list[i]))return list[i]}catch(e){}}return '';
}
function baseName(n){return String(n||'').replace(/\.[^.]+$/,'')||'Untitled'}
function uploadErr(e){var c=e&&e.code;
  if(c==='too_large')return 'That file is still over 20 MB. Try a shorter clip.';
  if(c==='unsupported_type')return 'That file type can’t be stored. Try an MP4 or M4A.';
  if(c==='quota_or_state')return 'This playbook’s file storage is full. Try a smaller file.';
  if(c==='rate_limited')return 'Too many uploads at once. Wait a minute and try again.';
  if(c==='not_granted'||c==='capability_disabled')return 'Uploading needs edit access to this playbook.';
  if(c==='upstream_auth')return 'Your sign-in expired. Reload the page and try again.';
  return 'The upload didn’t go through. Check your connection and try again.'}
function findVariant(routine,sid,vid){var s=routine.sections.find(function(x){return x.id===sid});return s?s.variants.find(function(v){return v.id===vid}):null}
function chooseMedia(target){
  if(L.setupTab!=='media'||L.collapsed.setup){L.setupTab='media';L.collapsed.setup=false;saveLayout();render()}
  if(!assetsApi){flash('Uploading needs edit access to this playbook.');return}
  if(playing)pause();
  var isVideo=target.kind!=='audio';
  pickFile(isVideo?'video/*,.mp4,.mov,.webm,.m4v':'audio/*,.mp3,.m4a,.wav,.aac,.ogg',function(file){
    setMsg('Opening '+file.name+'…');
    probe(file,isVideo).then(function(p){
      var dur=p.dur,isMp4=/mp4|m4a/i.test(file.type)||/\.(m4a|mp4|m4v)$/i.test(file.name),isWebm=/webm/i.test(file.type)||/\.webm$/i.test(file.name);
      var LIM=maxSecs();if((isMp4||isWebm)&&dur<=LIM+0.5&&file.size<=MAX_BYTES){cleanupEl(p.el);sendUpload(target,file,isMp4?'video/mp4':'video/webm',file.name,dur,false);return}
      if(!pickMime(isVideo)){cleanupEl(p.el);setMsg('This browser can’t convert '+(isVideo?'videos':'songs')+'. Try Chrome or Safari, or upload an '+(isVideo?'MP4 under 20 MB':'M4A file')+'.',true);return}
      var len=Math.min(dur,LIM),trim=dur>LIM+0.5;
      job={target:target,file:file,el:p.el,dur:dur,isVideo:isVideo,lim:LIM};
      setMsg((isVideo?'This video':'This song')+' needs converting before upload'+(trim?', and it will be trimmed to '+fmt(LIM):'')+'. It takes about '+fmt(len)+'. Keep this page open while it runs.',false,'Start converting');
    }).catch(function(){setMsg('That file couldn’t be opened here. Try '+(isVideo?'an MP4 or MOV video':'an MP3 or M4A song')+'.',true)});
  });
}
function startJob(){
  var j=job;job=null;if(!j)return;
  var el=j.el,isVideo=j.isVideo,limit=Math.min(j.dur,j.lim),trim=j.dur>j.lim+0.5,mime=pickMime(isVideo);
  var AC=window.AudioContext||window.webkitAudioContext,ac,gain,timer=0,prog=0,rec,chunks=[],stopped=false;
  try{
    ac=new AC();var src=ac.createMediaElementSource(el),dest=ac.createMediaStreamDestination();gain=ac.createGain();src.connect(gain);gain.connect(dest);
    var stream;
    if(isVideo){
      var vw=el.videoWidth||1280,vh=el.videoHeight||720,s=Math.min(1,854/Math.max(vw,vh)),cv=document.createElement('canvas');
      cv.width=Math.max(2,Math.round(vw*s/2)*2);cv.height=Math.max(2,Math.round(vh*s/2)*2);var g=cv.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,cv.width,cv.height);
      var draw=function(){try{g.drawImage(el,0,0,cv.width,cv.height)}catch(e){}};draw();timer=setInterval(draw,1000/30);
      stream=cv.captureStream(30);dest.stream.getAudioTracks().forEach(function(t){stream.addTrack(t)});
    } else stream=dest.stream;
    var opts={mimeType:mime,audioBitsPerSecond:isVideo?96000:128000};if(isVideo)opts.videoBitsPerSecond=Math.min(900000,Math.floor((MAX_BYTES*8*0.85)/limit-96000));
    rec=new MediaRecorder(stream,opts);
  }catch(e){clearInterval(timer);try{ac&&ac.close()}catch(x){}cleanupEl(el);setMsg('Converting didn’t start in this browser. Try Chrome or Safari.',true);return}
  rec.ondataavailable=function(e){if(e.data&&e.data.size)chunks.push(e.data)};
  function stop(){if(stopped)return;stopped=true;clearInterval(prog);try{if(rec.state!=='inactive')rec.stop()}catch(e){}}
  rec.onstop=function(){clearInterval(timer);try{ac.close()}catch(e){}cleanupEl(el);
    var type=/mp4/.test(mime)?'video/mp4':'video/webm',blob=new Blob(chunks,{type:type});
    if(!blob.size){setMsg('Converting failed. Try again, or use a different file.',true);return}
    sendUpload(j.target,blob,type,j.file.name,limit,trim)};
  el.currentTime=0;rec.start(1000);
  var pp=el.play();
  if(pp&&pp.catch)pp.catch(function(){stopped=true;clearInterval(prog);try{rec.ondataavailable=null;rec.onstop=null;rec.stop()}catch(e){}clearInterval(timer);try{ac.close()}catch(e){}cleanupEl(el);setMsg('The browser blocked playback for converting. Tap Upload again and then Start.',true)});
  prog=setInterval(function(){var t=el.currentTime||0;
    if(trim&&t>limit-1.5)gain.gain.value=Math.max(0,(limit-t)/1.5);
    if(!stopped)setMsg('Converting '+(isVideo?'video':'song')+'… '+fmt(t)+' of '+fmt(limit)+'. Keep this page open.');
    if(t>=limit||el.ended)stop()},250);
  el.addEventListener('ended',stop);
}
function sendUpload(target,blob,type,name,dur,trimmed){
  if(blob.size>MAX_BYTES){setMsg('That file is '+(blob.size/1048576).toFixed(1)+' MB after converting, over the 20 MB limit. Try a shorter clip.',true);return}
  var what=target.kind==='audio'?'song':(target.kind==='clip'?'clip':'video');
  setMsg('Uploading '+what+' ('+(blob.size/1048576).toFixed(1)+' MB)…');
  assetsApi.upload(blob,{type:type}).then(function(res){
    var routine=D.routines.find(function(r){return r.id===target.rid});if(!routine){setMsg(null);return}
    var info={id:res.id,name:baseName(name),dur:r2(dur)};
    if(target.kind==='audio')routine.audio=info;
    else if(target.kind==='video')routine.video=info;
    else{var v=findVariant(routine,target.sid,target.vid);if(!v){setMsg('That alternate was removed before the clip finished uploading.',true);return}v.video=info}
    markDirty();
    if(routine===R){if(target.kind==='audio')loadAudio();buildVideos();render()}
    setMsg(what.charAt(0).toUpperCase()+what.slice(1)+' added'+(trimmed?' and trimmed to '+fmt(dur):'')+'. Saving…');
    save();if(target.kind==='audio')findBeat(routine,blob,true);
  }).catch(function(e){setMsg(uploadErr(e),true)});
}

/* ---- tap tempo ---- */
var taps=[];
function tapTempo(btn){var now=performance.now();if(taps.length&&now-taps[taps.length-1]>2000)taps=[];taps.push(now);if(taps.length>9)taps.shift();
  if(taps.length<4){btn.textContent='Keep tapping ('+taps.length+')';return}
  var avg=(taps[taps.length-1]-taps[0])/(taps.length-1),bpm=Math.round(60000/avg);
  if(bpm>=60&&bpm<=220){R.bpm=bpm;var i=document.getElementById('bpm');if(i)i.value=bpm;updateMeta();markDirty();updateLive(!playing)}
  btn.textContent='Tap tempo · '+bpm}

/* ---- versions ---- */
function snapshot(){return clone({sections:R.sections,athletes:R.athletes,bpm:R.bpm,musicStart:R.musicStart,videoOffset:R.videoOffset,audio:R.audio,video:R.video,music:R.music})}
function saveVersion(name){R.versions.push({id:uid(),name:name,at:Date.now(),data:snapshot()});if(R.versions.length>30)R.versions.shift()}
function applyData(r,data){var d=clone(data);['sections','athletes','bpm','musicStart','videoOffset','audio','video','music'].forEach(function(k){if(d[k]!==undefined)r[k]=d[k]});fixRoutine(r)}

/* ---- actions ---- */
function selectEight(id){cur=id;var it=find(cur);if(playing){seek(eightStart(it.n));refreshCurrent()}else{seek(eightStart(it.n));render()}}
function switchTo(id){if(playing)pause();range=null;selMode=false;sel=[];R=D.routines.find(function(r){return r.id===id})||D.routines[0];D.cur=R.id;cur=ev(R.sections[0])[0].id;T=0;loadAudio();buildVideos();render()}
var NOPAUSE={matView:1,theme:1,bldOpen:1,moreMenu:1,helpToggle:1,arrange:1,openBackup:1,setupTab:1,secMenu:1,tagsMore:1,scoreItem:1,customOpen:1,vwMenu:1,vwSave:1,vwApply:1,vwStart:1,vwUpdate:1,vwDel:1,tplToggle:1,tplSave:1,tplDel:1,expOne:1,expAll:1,imp:1,spot:1,spotOff:1,closeEd:1,formAll:0,pdfMenu:1,pdfMake:1,selMode:1,selClear:1,sel:1,prev:1,next:1,play:1,save:1,tap:1,markOne:1,nudge:1,clearRange:1,tmove:1,tsize:1,tcol:1,matOnly:1,resetLayout:1,startJob:1,cancelJob:1,playEight:1,playFrom:1,playSec:1};
app.addEventListener('click',onAct);transportEl.addEventListener('click',onAct);
function onAct(ev0){if(ev0.__cp)return;ev0.__cp=1;
  var b=ev0.target.closest('[data-act]');if(!b)return;var act=b.dataset.act,id=b.dataset.id,it=find(cur);
  if(ATHLETE){athAct(act,b,id);return}
  if((act==='runOpen'||act==='kbdHelp'||act==='zoomReset'||act==='tlQR'||act==='tlCopy'||act==='tlShare')&&betaPageAct(act,b,id))return;
  if(playing&&!NOPAUSE[act])pause();
  if(betaPageAct(act,b,id))return;
  if(pageAct(act,id,b))return;
  switch(act){
  case 'sel':if(id===cur&&sheetOpen&&b.classList.contains('erow')&&!playing){sheetOpen=false;render();return}sheetOpen=true;selectEight(id);return;
  case 'closeEd':sheetOpen=false;render();return;
  case 'prev':case 'next':{var n=playing?Math.max(0,Math.min(it.list.length-1,Math.floor(beatAt(T)/8))):it.n;n+=act==='next'?1:-1;n=Math.max(0,Math.min(it.list.length-1,n));selectEight(it.list[n].e.id);return}
  case 'play':play();return;
  case 'playEight':{var a=eightStart(it.n);playRange(a,a+8*spb(),secLabel(it.s)+' · 8-count '+(it.n+1));return}
  case 'playFrom':playRange(eightStart(it.n),null,'From 8-count '+(it.n+1));return;
  case 'playSec':{var g=timeline().find(function(x){return x.s.id===id});if(g){cur=g.v.eights[0].id;playRange(g.start,g.end,secLabel(g.s))}return}
  case 'clearRange':clearRange();return;
  case 'save':save();return;
  case 'undo':undo();return;
  case 'redo':redo();return;
  case 'upSong':chooseMedia({kind:'audio',rid:R.id});return;
  case 'upVideo':chooseMedia({kind:'video',rid:R.id});return;
  case 'upClip':chooseMedia({kind:'clip',rid:R.id,sid:id,vid:b.dataset.v});return;
  case 'startJob':startJob();return;
  case 'cancelJob':if(job){cleanupEl(job.el);job=null}setMsg(null);return;
  case 'delSong':case 'delVideo':if(!confirmTap(b,act))return;R[act==='delSong'?'audio':'video']=null;markDirty();loadAudio();buildVideos();render();return;
  case 'delClip':{if(!confirmTap(b,'clip'+b.dataset.v))return;var vv=findVariant(R,id,b.dataset.v);if(vv)vv.video=null;markDirty();buildVideos();render();return}
  case 'tap':tapTempo(b);return;
  case 'markOne':{R.musicStart=r2(T);var ms=document.getElementById('mstart');if(ms)ms.value=R.musicStart;markDirty();updateLive(!playing);flash('Count 1 set at '+fmtT(T)+'.');return}
  case 'nudge':{var k=b.dataset.k;R[k]=r2((R[k]||0)+parseFloat(b.dataset.d));if(k==='musicStart')R[k]=Math.max(0,R[k]);
    var inp=document.getElementById(k==='musicStart'?'mstart':'voff');if(inp)inp.value=R[k];syncVideos(true);markDirty();updateLive(!playing);return}
  case 'tmove':{var i=L.order.indexOf(id),j=i+parseInt(b.dataset.d,10);if(j<0||j>=L.order.length)return;L.order.splice(i,1);L.order.splice(j,0,id);saveLayout();flip(render);
    var nb=app.querySelector('[data-act="tmove"][data-id="'+id+'"][data-d="'+b.dataset.d+'"]');if(nb)nb.focus();return}
  case 'tsize':{var cyc={third:'half',half:'full',full:'third'};L.size[id]=cyc[L.size[id]||'half'];saveLayout();flip(render);return}
  case 'tcol':L.collapsed[id]=!L.collapsed[id];saveLayout();flip(render);return;
  case 'matOnly':if(L.collapsed.video){L.collapsed.video=false;L.size.mat=L.size.matBefore||'half'}else{L.collapsed.video=true;L.size.matBefore=L.size.mat;L.size.mat='full'}saveLayout();flip(render);return;
  case 'theme':{var order=['system','light','dark'];L.theme=order[(order.indexOf(L.theme||'system')+1)%3];saveLayout();render();var tb2=document.querySelector('[data-act="theme"]');if(tb2)tb2.focus();flash('Theme: '+themeName()+'.');return}
  case 'matView':L.matView=id==='front'?'front':'top';saveLayout();applyMatView();if(L.matView==='front')flash('Front view: the 8-count as the judges see it.');return;
  case 'moreMenu':moreOpen=!moreOpen;gearOpen=false;viewsOpen=false;pdfOpen=false;render();return;
  case 'gearMenu':gearOpen=!gearOpen;moreOpen=false;viewsOpen=false;pdfOpen=false;render();return;
  case 'helpToggle':L.help=!L.help;saveLayout();render();flash(L.help?'Help text is showing.':'Help text is hidden. Turn it back on from ⚙.');return;
  case 'arrange':arranging=!arranging;moreOpen=false;gearOpen=false;render();if(arranging)flash('Drag ⠿ to move tiles. Tap Done when finished.');return;
  case 'openBackup':moreOpen=false;L.setupTab='versions';L.collapsed.setup=false;saveLayout();render();var stl=document.querySelector('[data-tile="setup"]');if(stl&&stl.scrollIntoView)stl.scrollIntoView({block:'start',behavior:reduceMotion?'auto':'smooth'});return;
  case 'setupTab':L.setupTab=id;saveLayout();render();var tb=document.querySelector('.tab[data-id="'+id+'"]');if(tb)tb.focus();return;
  case 'secMenu':secMenu=secMenu===id?null:id;render();var sm=document.querySelector('[data-act="secMenu"][data-id="'+id+'"]');if(sm)sm.focus();return;
  case 'bldOpen':bldOpen=true;render();var fb=document.querySelector('[data-f="bskill"]');if(fb)fb.focus();return;
  case 'tagsMore':tagsOpen=!tagsOpen;render();return;
  case 'scoreItem':scoreOpen[b.dataset.k]=!scoreOpen[b.dataset.k];render();var si2=document.querySelector('[data-act="scoreItem"][data-k="'+b.dataset.k+'"]');if(si2)si2.focus();return;
  case 'customOpen':customOpen=!customOpen;render();if(customOpen){var cn2=document.getElementById('cname');if(cn2)cn2.focus()}return;
  case 'vwMenu':moreOpen=false;gearOpen=false;viewsOpen=!viewsOpen;render();if(viewsOpen){var vn=document.getElementById('vwName');if(vn)vn.focus()}return;
  case 'vwSave':{var nmv=(document.getElementById('vwName')||{}).value,st0=(document.getElementById('vwStartNew')||{}).checked;nmv=(nmv||'').trim()||('View '+(D.views.length+1));
    var nv0={id:uid(),name:nmv.slice(0,40),layout:viewLayout()};D.views.push(nv0);if(st0)D.startView=nv0.id;markDirty();render();
    flash('Saved the “'+nv0.name+'” view'+(st0?' as the starting view':'')+'. Tap Save to keep it in the playbook.');return}
  case 'vwApply':{var va=D.views.find(function(v){return v.id===id});if(!va)return;applyLayout(va.layout);saveLayout();flip(render);flash('Showing the “'+va.name+'” view.');return}
  case 'vwStart':{D.startView=D.startView===id?null:id;markDirty();render();flash(D.startView?'The playbook will open in this view. Tap Save to keep it.':'The playbook will open in your last layout on each device. Tap Save to keep this.');return}
  case 'vwUpdate':{var vu=D.views.find(function(v){return v.id===id});if(!vu)return;vu.layout=viewLayout();markDirty();render();flash('Updated “'+vu.name+'” to the current layout.');return}
  case 'vwDel':{if(!confirmTap(b,'vw'+id))return;D.views=D.views.filter(function(v){return v.id!==id});if(D.startView===id)D.startView=null;markDirty();render();return}
  case 'tplToggle':tplOpen=!tplOpen;render();return;
  case 'tplSave':{var tn=document.getElementById('tplName'),tnm=((tn&&tn.value)||'').trim()||(tn&&tn.placeholder)||'Template';
    D.templates.push(makeTemplate(it.e,tnm.slice(0,60)));markDirty();render();flash('Saved the template “'+tnm.slice(0,60)+'”. Tap Save to keep it.');return}
  case 'tplAfter':case 'tplReplace':{var tp=D.templates.find(function(t){return t.id===id});if(!tp)return;var o0=tplOpts(),target=it.e;
    if(act==='tplAfter'){target=eight(it.e.pos);ev(it.s).splice(it.ei+1,0,target);cur=target.id}
    var mt=applyTemplate(tp,target,o0);markDirty();render();
    flash((act==='tplAfter'?'Inserted':'Replaced with')+' “'+tp.name+'”'+(o0.f?' · '+mt+' of '+R.athletes.length+' athletes placed':'')+'.');return}
  case 'tplDel':{if(!confirmTap(b,'tp'+id))return;D.templates=D.templates.filter(function(t){return t.id!==id});markDirty();render();return}
  case 'resetLayout':var fr=L.free,so=L.solo,hp=L.help,stb=L.setupTab,thm=L.theme,trv=L.traffic,mv=L.matView;var vw0=L.view,pt0=L.pTeam,pa0=L.pAth;L=clone(DEF_LAYOUT);L.view=vw0;L.pTeam=pt0;L.pAth=pa0;L.free=fr;L.solo=so;L.help=hp;L.setupTab=stb;L.theme=thm;L.traffic=trv;L.matView=mv;saveLayout();flip(render);flash('Tiles are back in their original spots.');return;
  case 'addAfter':{var e=eight(it.e.pos);ev(it.s).splice(it.ei+1,0,e);cur=e.id;markDirty();render();document.getElementById('c0').focus();return}
  case 'addTo':secMenu=null;{var s=R.sections.find(function(x){return x.id===id}),list=ev(s),e2=eight((list[list.length-1]||it.e).pos);list.push(e2);cur=e2.id;markDirty();render();return}
  case 'delEight':{var lst=ev(it.s),last=lst.length<2;
    if(last&&(R.sections.length<2||it.s.variants.length>1)){flash(it.s.variants.length>1?'This is the only 8-count in version '+activeVar(it.s).label+'. Remove that version from the section’s ⋯ menu instead.':'A routine needs at least one 8-count.');return}
    if(!confirmTap(b,'e'+cur))return;var k2=it.n;if(last)R.sections.splice(R.sections.indexOf(it.s),1);else lst.splice(it.ei,1);
    var f=flat();cur=f[Math.min(k2,f.length-1)].e.id;markDirty();if(last)buildVideos();render();
    flash(last?'Deleted the 8-count and the empty '+(it.s.name||'section')+' section with it. Undo brings them back.':'8-count deleted. Undo brings it back.');return}
  case 'addSec':{var used=R.sections.map(function(x){return x.name}),nm=SECTION_NAMES.find(function(x){return used.indexOf(x)<0})||'New section';
    var e3=eight(flat().slice(-1)[0].e.pos),ns=fixSection({id:uid(),name:nm,eights:[e3]});R.sections.push(ns);cur=e3.id;markDirty();render();
    var inp2=document.getElementById('sec-'+ns.id);if(inp2){inp2.focus();inp2.select()}return}
  case 'delSec':{if(!confirmTap(b,'s'+id))return;var si=R.sections.findIndex(function(x){return x.id===id});R.sections.splice(si,1);if(!flat().some(function(r){return r.e.id===cur}))cur=flat()[0].e.id;markDirty();buildVideos();render();return}
  case 'pickVar':{var s2=R.sections.find(function(x){return x.id===id});if(s2.active===b.dataset.v)return;s2.active=b.dataset.v;cur=ev(s2)[0].id;markDirty();render();seek(eightStart(find(cur).n));return}
  case 'addVar':secMenu=null;{var s3=R.sections.find(function(x){return x.id===id}),src=activeVar(s3),used2=s3.variants.map(function(v){return v.label}),lab=LETTERS.split('').find(function(c){return used2.indexOf(c)<0})||String(s3.variants.length+1);
    var nv={id:uid(),label:lab,eights:copyEights(src.eights),video:null,videoOffset:0};s3.variants.push(nv);s3.active=nv.id;cur=nv.eights[0].id;markDirty();buildVideos();render();
    flash((s3.name||'Section')+' '+lab+' is a copy of '+src.label+'. Change it freely, '+s3.variants[0].label+' stays as it was.');return}
  case 'delVar':{if(!confirmTap(b,'v'+id))return;var s4=R.sections.find(function(x){return x.id===id}),av=activeVar(s4);if(av===s4.variants[0])return;
    s4.variants=s4.variants.filter(function(v){return v!==av});s4.active=s4.variants[0].id;cur=ev(s4)[0].id;markDirty();buildVideos();render();return}
  case 'saveVer':{var vn=document.getElementById('vname'),name=(vn&&vn.value.trim())||('Version '+(R.versions.length+1));saveVersion(name);markDirty();render();flash('Saved version “'+name+'”.');return}
  case 'restoreVer':{if(!confirmTap(b,'rv'+id))return;var ver=R.versions.find(function(v){return v.id===id});if(!ver)return;
    saveVersion('Before restoring “'+ver.name+'”');applyData(R,ver.data);cur=flat()[0].e.id;markDirty();loadAudio();buildVideos();render();flash('Restored “'+ver.name+'”. What you had is saved as a version too.');return}
  case 'copyVer':{var ver2=R.versions.find(function(v){return v.id===id});if(!ver2)return;var nr=blankRoutine();applyData(nr,ver2.data);nr.name=(R.name||'Routine')+' · '+ver2.name;
    D.routines.splice(D.routines.indexOf(R)+1,0,nr);markDirty();switchTo(nr.id);flash('Opened “'+ver2.name+'” as its own routine.');return}
  case 'delVer':{if(!confirmTap(b,'dv'+id))return;R.versions=R.versions.filter(function(v){return v.id!==id});markDirty();render();return}
  case 'addAth':{var a2={id:uid(),name:'New athlete',role:'Base'};R.athletes.push(a2);markDirty();render();var ai=document.getElementById('ath-'+a2.id);if(ai){ai.focus();ai.select()}return}
  case 'delAth':{if(!confirmTap(b,'a'+id))return;R.athletes=R.athletes.filter(function(x){return x.id!==id});R.sections.forEach(function(s){s.variants.forEach(function(v){v.eights.forEach(function(e){delete e.pos[id]})})});markDirty();render();return}
  case 'fresh':{if(!confirmTap(b,'fresh'))return;gearOpen=false;var nb2=blankRoutine(R.sample?[]:R.athletes);if(!R.sample)nb2.groups=clone(R.groups);nb2.name=R.sample?'Untitled routine':R.name;nb2.teamId=R.sample?null:R.teamId||null;nb2.season=R.season||'';nb2.versions=R.versions;if(!R.sample)nb2.versions.push({id:uid(),name:'Before clearing',at:Date.now(),data:snapshot()});
    D.routines[D.routines.indexOf(R)]=nb2;markDirty();switchTo(nb2.id);return}
  case 'newR':{gearOpen=false;var nr2=blankRoutine(R.sample?[]:R.athletes);if(!R.sample)nr2.groups=clone(R.groups);nr2.name='Routine '+(liveRoutines().length+1);nr2.teamId=R.sample?null:R.teamId||null;nr2.season=R.season||'';nr2.updated=Date.now();D.routines.push(nr2);markDirty();switchTo(nr2.id);var ni=document.getElementById('rname');if(ni){ni.focus();ni.select()}return}
  case 'dupR':moreOpen=false;gearOpen=false;{var dr=clone(R);dr.id=uid();dr.sample=false;dr.name=R.name+' (copy)';dr.versions=[];dr.sections.forEach(function(s){s.id=uid();s.variants.forEach(function(v){v.id=uid();v.eights.forEach(function(e){e.id=uid()})});s.active=s.variants[0].id});
    D.routines.splice(D.routines.indexOf(R)+1,0,dr);markDirty();switchTo(dr.id);return}
  case 'tag':{var tg=it.e.tags||(it.e.tags=[]),ti=tg.indexOf(b.dataset.k);if(ti>=0)tg.splice(ti,1);else tg.push(b.dataset.k);markDirty();render();return}
  case 'addCustom':{var cn=document.getElementById('cname'),nm2=cn&&cn.value.trim();if(!nm2){if(cn)cn.focus();return}var nd=Math.max(1,parseInt((document.getElementById('cneed')||{}).value,10)||1);
    R.sheet.custom.push({k:'c_'+uid(),n:nm2,need:nd});markDirty();render();flash('Added “'+nm2+'”. Tag it on any 8-count.');return}
  case 'delCustom':{if(!confirmTap(b,'dc'+b.dataset.k))return;var ck=b.dataset.k;R.sheet.custom=R.sheet.custom.filter(function(c){return c.k!==ck});
    R.sections.forEach(function(s){s.variants.forEach(function(v){v.eights.forEach(function(e){e.tags=(e.tags||[]).filter(function(t){return t!==ck})})})});markDirty();render();return}
  case 'addGrp':{newGroup([]);markDirty();render();return}
  case 'delGrp':{var gid=id;R.athletes.forEach(function(a){if(a.group===gid)a.group=null});R.groups=R.groups.filter(function(g){return g.id!==gid});markDirty();render();return}
  case 'selMode':selMode=!selMode;sel=[];renderMat();renderSelBar();if(selMode)flash('Drag a box around athletes on the mat, or tap them one by one.');return;
  case 'selMake':{if(sel.length<2)return;var g2=newGroup(sel);sel=[];pruneGroups();formLift(g2.id);markDirty();render();renderSelBar();flash('Made '+g2.name+' and set it up for a lift in this 8-count.');return}
  case 'selUngroup':{R.athletes.forEach(function(a){if(sel.indexOf(a.id)>=0)a.group=null});sel=[];pruneGroups();markDirty();render();renderSelBar();return}
  case 'formLift':{formLift(id);markDirty();render();flash('Lift formation set for this 8-count.');return}
  case 'formAll':{if(!R.groups.length){flash('Make a stunt group first.');return}var e0=find(cur).e;R.groups.forEach(function(g){formLift(g.id,e0)});markDirty();renderMat();flash('Every stunt group is set up for a lift in this 8-count.');return}
  case 'selClear':sel=[];renderMat();renderSelBar();return;
  case 'pdfMenu':moreOpen=false;gearOpen=false;pdfOpen=!pdfOpen;render();return;
  case 'pdfMake':exportPDF();return;
  case 'expOne':moreOpen=false;render();exportRoutines(false);return;
  case 'expAll':moreOpen=false;render();exportRoutines(true);return;
  case 'imp':importRoutines();return;
  case 'spot':L.spot=L.spot===id?null:id;saveLayout();render();if(L.spot)flash('Spotlight on '+(spotAth()||{}).name+'.');return;
  case 'spotOff':L.spot=null;saveLayout();render();return;
  case 'bLink':{var le=it.e,ga=id,gb2=b.dataset.v;le.links=(le.links||[]).filter(function(l){return !((l[0]===ga&&l[1]===gb2)||(l[0]===gb2&&l[1]===ga))});
    if(b.getAttribute('aria-pressed')!=='true')le.links.push([ga,gb2]);markDirty();render();var nb3=document.querySelector('[data-act="bLink"][data-id="'+ga+'"][data-v="'+gb2+'"]');if(nb3)nb3.focus();return}
  case 'delR':{if(!confirmTap(b,'r'+R.id))return;R.deletedAt=Date.now();markDirty();var nx0=liveRoutines()[0];if(nx0){R=nx0;D.cur=nx0.id;cur=ev(R.sections[0])[0].id}goView('home');flash('Moved to Recently deleted. You can restore it for 30 days.');return}
  }
}
function onInput(e1){if(e1.__cp)return;e1.__cp=1;
  var t=e1.target,f=t.dataset.f;if(f&&pageInput(t,f))return;if(!f||f==='ghost'||f==='role'||f==='rpick'||f==='loop'||f==='free'||f==='solo'||f==='sheetTpl'||f==='agrp'||f==='selAdd'||f==='spot'||f==='bcount'||f==='viewSel'||f==='traf')return;var it=find(cur);
  if(f==='scrub'){scrubbing=true;seek(parseFloat(t.value)||0);scrubbing=false;return}
  if(f==='name'){R.name=t.value;var mt=document.querySelector('.mapp .mtitle');if(mt)mt.textContent=R.name||'Untitled routine';var o=document.querySelector('#rpick option[value="'+R.id+'"]');if(o)o.textContent=R.name||'Untitled routine'}
  else if(f==='music'){R.music=t.value.trim();updateSong()}
  else if(f==='bpm'){var v=Math.round(parseFloat(t.value)*10)/10;if(!(v>=60&&v<=220))return;R.bpm=v;updateMeta();updateLive(!playing)}
  else if(f==='mstart'){var m=parseFloat(t.value);if(!(m>=0))return;R.musicStart=r2(m);updateLive(!playing)}
  else if(f==='voff'){var vo=parseFloat(t.value);if(isNaN(vo))return;R.videoOffset=r2(vo);syncVideos(true)}
  else if(f==='coff'){var co=parseFloat(t.value);if(!(co>=0))return;var vv=findVariant(R,t.dataset.id,t.dataset.v);if(vv)vv.videoOffset=r2(co);syncVideos(true)}
  else if(f==='bskill'){var eb=it.e.build||(it.e.build={}),xb=eb[t.dataset.id]||(eb[t.dataset.id]={skill:'',count:0});xb.skill=t.value.slice(0,40);if(!xb.skill&&!xb.count)delete eb[t.dataset.id];
    var btx=document.getElementById('bText');if(btx)btx.textContent=buildText(it.e)||'No building noted yet. Add a skill for a group, and connect groups to make a pyramid.';
    if(!playing)renderMat();markDirty();softRender(900);return}
  else if(f==='grp'){var gg=R.groups.find(function(x){return x.id===t.dataset.id});if(gg)gg.name=t.value;if(!playing)renderMat()}
  else if(f==='count'){it.e.counts[+t.dataset.i]=t.value;var s=document.getElementById('sum-'+it.e.id);if(s)s.textContent=summary(it.e)}
  else if(f==='note')it.e.note=t.value;
  else if(f==='sec'){var sec=R.sections.find(function(x){return x.id===t.dataset.id});sec.name=t.value;updateTitles()}
  else if(f==='ath'){var a=R.athletes.find(function(x){return x.id===t.dataset.id});a.name=t.value;var sw=document.getElementById('sw-'+a.id);if(sw)sw.textContent=initials(a.name);if(!playing)renderMat()}
  else return;
  markDirty();
}
app.addEventListener('input',onInput);transportEl.addEventListener('input',onInput);
function onChange(e2){if(e2.__cp)return;e2.__cp=1;var t=e2.target,f=t.dataset.f;if(f&&pageChange(t,f))return;
  if(f==='rpick'){switchTo(t.value);return}
  if(f==='loop'){loop=t.checked;return}
  if(f==='solo'){L.solo=t.checked;saveLayout();return}
  if(f==='viewSel'){var vs=D.views.find(function(v){return v.id===t.value});if(vs){applyLayout(vs.layout);saveLayout();flip(render)}return}
  if(f==='tileVis'){var tid=t.dataset.id;if(!t.checked&&Object.keys(TILES).filter(function(k){return !L.hidden[k]&&k!==tid}).length===0){t.checked=true;flash('Keep at least one tile showing.');return}
    if(t.checked)delete L.hidden[tid];else L.hidden[tid]=true;saveLayout();flip(render);return}
  if(f==='traf'){L.traffic=t.checked;saveLayout();render();return}
  if(f==='spot'){L.spot=t.value||null;saveLayout();render();return}
  if(f==='bcount'){var ec=find(cur).e,bb=ec.build||(ec.build={}),xc=bb[t.dataset.id]||(bb[t.dataset.id]={skill:'',count:0});xc.count=parseInt(t.value,10)||0;if(!xc.skill&&!xc.count)delete bb[t.dataset.id];markDirty();softRender();return}
  if(f==='sheetTpl'){R.sheet.tpl=t.value;markDirty();render();return}
  if(f==='agrp'){var aa=R.athletes.find(function(x){return x.id===t.dataset.id});if(t.value==='__new'){var ng=newGroup([aa.id]);flash('Made '+ng.name+'. Add more athletes to it from their group menus.')}else{aa.group=t.value||null;if(aa.group)formLift(aa.group)}pruneGroups();markDirty();render();return}
  if(f==='selAdd'){if(!t.value)return;var tgid=t.value;R.athletes.forEach(function(a){if(sel.indexOf(a.id)>=0)a.group=tgid});sel=[];pruneGroups();formLift(tgid);markDirty();render();renderSelBar();return}
  if(f==='free'){L.free=t.checked;saveLayout();flash(L.free?'Free move on. Athletes go exactly where you drop them.':'Snapping on. Athletes land on a line or a panel center.');return}
  if(f==='ghost'){showGhost=t.checked;if(!playing)renderMat();return}
  if(f==='role'){var a=R.athletes.find(function(x){return x.id===t.dataset.id});a.role=t.value;var sw=document.getElementById('sw-'+a.id);if(sw)sw.style.background='var(--'+a.role.toLowerCase()+')';if(!playing)renderMat();markDirty()}
}
app.addEventListener('change',onChange);transportEl.addEventListener('change',onChange);

/* ---- dragging: athletes on the mat, and tiles on the board ---- */
var drag=null,tdrag=null,bdrag=null,bendTap=null;
function toMatRaw(e){var svg=document.getElementById('mat');var pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;var r=pt.matrixTransform(svg.getScreenCTM().inverse());return [r.x,r.y]}
function toMat(e){var svg=document.getElementById('mat');var pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;var r=pt.matrixTransform(svg.getScreenCTM().inverse());
  return snapPos(r.x,r.y)}
function snapPos(x,y){x=Math.max(0,Math.min(54,x));y=Math.max(0,Math.min(42,y));
  return L.free?[Math.round(x*2)/2,Math.round(y*2)/2]:[Math.round(x/3)*3,Math.round(y)]}
function showGuide(x){var g=document.getElementById('guide');if(!g)return;if(x==null||L.free){g.setAttribute('visibility','hidden');return}
  g.setAttribute('x1',x);g.setAttribute('x2',x);g.setAttribute('visibility','visible')}
app.addEventListener('pointerdown',function(e){
  if(ATHLETE){if(e.target.closest('#mat')&&!playing){e.preventDefault();matSwipeStart(e);try{document.getElementById('mat').setPointerCapture(e.pointerId)}catch(x){}}return}
  var g=e.target.closest('[data-grip]');
  if(g){e.preventDefault();var tile=g.closest('.tile'),r0=tile.getBoundingClientRect();tdrag={tile:tile,moved:false,gx:e.clientX-r0.left,gy:e.clientY-r0.top,last:0,px:e.clientX,py:e.clientY};tile.style.transition='none';tile.classList.add('lifting');try{g.setPointerCapture(e.pointerId)}catch(x){}return}
  var rg=e.target.closest('[data-rgrip]');if(rg){startRowDrag(e,rg);return}
  var bnd=e.target.closest('#mat .bendh');
  if(bnd){if(playing)return;e.preventDefault();var ite=find(cur),pv=ite.n>0?ite.list[ite.n-1].e:null;if(!pv)return;
    var ids=bnd.dataset.gid?membersOf(bnd.dataset.gid).map(function(a){return a.id}):[bnd.dataset.aid],lead=bnd.dataset.gid?(flyerOf(bnd.dataset.gid)||R.athletes.find(function(a){return a.id===ids[0]})):R.athletes.find(function(a){return a.id===ids[0]});
    var now0=performance.now();if(bendTap&&bendTap.key===(bnd.dataset.gid||bnd.dataset.aid)&&now0-bendTap.t<350){setBend(ite.e,ids,null);bendTap=null;markDirty();refreshTraffic();renderMat();flash('Path straightened.');return}
    bendTap={key:bnd.dataset.gid||bnd.dataset.aid,t:now0};
    var li=R.athletes.indexOf(lead);bdrag={ids:ids,p0:posOf(pv,lead,li),p1:posOf(ite.e,lead,li),moved:false};try{bnd.setPointerCapture(e.pointerId)}catch(x){}return}
  var gh=e.target.closest('#mat .ghandle');
  if(gh){if(playing){flash('Pause to move athletes.');return}e.preventDefault();
    var nowG=performance.now();if(ghTap&&ghTap.gid===gh.dataset.gid&&nowG-ghTap.t<350){ghTap=null;toggleBox(gh.dataset.gid);return}
    ghTap={gid:gh.dataset.gid,t:nowG};var itg=find(cur),gms=membersOf(gh.dataset.gid),gst={},gx=0,gy=0;
    gms.forEach(function(a){var i=R.athletes.indexOf(a),q=posOf(itg.e,a,i).slice();gst[a.id]=q;gx+=q[0];gy+=q[1]});
    var r0=toMatRaw(e);drag={group:gh.dataset.gid,ids:gms.map(function(a){return a.id}),start:gst,c:[gx/gms.length,gy/gms.length],p0:r0,moved:false};try{gh.setPointerCapture(e.pointerId)}catch(x){}return}
  var d=e.target.closest('#mat .dot');
  if(!d&&e.target.closest('#mat')){if(playing)return;e.preventDefault();if(PHONE&&!selMode){matSwipeStart(e);try{document.getElementById('mat').setPointerCapture(e.pointerId)}catch(x){}return}var m0=toMatRaw(e);box={x0:m0[0],y0:m0[1],x1:m0[0],y1:m0[1],add:selMode};drawBox();try{document.getElementById('mat').setPointerCapture(e.pointerId)}catch(x){}return}
  if(!d)return;if(playing){flash('Pause to move athletes.');return}
  /* several athletes selected: dragging any selected one moves them all together; tapping one adds or removes it */
  if(!selMode&&(e.shiftKey||e.ctrlKey||e.metaKey)){e.preventDefault();selMode=true;sel=[d.dataset.id];render();flash('Selecting: click more athletes (or draw a box), then drag any of them to move them all.');return}
  if(selMode){e.preventDefault();var sid=d.dataset.id;
    if(sel.indexOf(sid)<0){sel.push(sid);renderMat();renderSelBar();return}
    var its=find(cur),sst={};sel.forEach(function(id){var i=R.athletes.findIndex(function(a){return a.id===id});if(i>=0)sst[id]=posOf(its.e,R.athletes[i],i).slice()});
    drag={id:sid,el:d,moved:false,ids:Object.keys(sst),start:sst,selTap:true};try{d.setPointerCapture(e.pointerId)}catch(x){}return}
  e.preventDefault();var it0=find(cur),a0=R.athletes.find(function(a){return a.id===d.dataset.id}),ids=[d.dataset.id],start={};
  ids.forEach(function(id){var i=R.athletes.findIndex(function(a){return a.id===id});start[id]=posOf(it0.e,R.athletes[i],i).slice()});
  drag={id:d.dataset.id,el:d,moved:false,ids:ids,start:start};try{d.setPointerCapture(e.pointerId)}catch(x){}});
window.addEventListener('pointermove',function(e){
  if(mswipe){matSwipeMove(e);return}
  if(tdrag){tdrag.px=e.clientX;tdrag.py=e.clientY;dragTile();
    if(e.clientY<70)window.scrollBy(0,-14);else if(e.clientY>window.innerHeight-150)window.scrollBy(0,14);return}
  if(rdrag){moveRowDrag(e);return}
  if(bdrag){var m2=toMatRaw(e),mid=[(bdrag.p0[0]+bdrag.p1[0])/2,(bdrag.p0[1]+bdrag.p1[1])/2],off=[Math.max(-40,Math.min(40,2*(m2[0]-mid[0]))),Math.max(-40,Math.min(40,2*(m2[1]-mid[1])))];
    setBend(find(cur).e,bdrag.ids,off);bdrag.moved=true;renderMat();return}
  if(box){var m1=toMatRaw(e);box.x1=m1[0];box.y1=m1[1];drawBox();return}
  if(drag&&drag.group){var itg=find(cur),r1=toMatRaw(e),nc=snapPos(drag.c[0]+r1[0]-drag.p0[0],drag.c[1]+r1[1]-drag.p0[1]),gdx=nc[0]-drag.c[0],gdy=nc[1]-drag.c[1];
    var minX=54,maxX=0,minY=42,maxY=0;drag.ids.forEach(function(id){var q=drag.start[id];minX=Math.min(minX,q[0]);maxX=Math.max(maxX,q[0]);minY=Math.min(minY,q[1]);maxY=Math.max(maxY,q[1])});
    gdx=Math.max(-minX,Math.min(54-maxX,gdx));gdy=Math.max(-minY,Math.min(42-maxY,gdy));
    drag.ids.forEach(function(id){var q=drag.start[id],np2=[r2(q[0]+gdx),r2(q[1]+gdy)];itg.e.pos[id]=np2;var de=document.querySelector('#dots .dot[data-id="'+id+'"]');if(de)de.setAttribute('transform','translate('+np2[0]+' '+np2[1]+')')});
    var gr=document.querySelector('#gboxes rect[data-gid="'+drag.group+'"]'),gh2=document.querySelector('#gboxes .ghandle[data-gid="'+drag.group+'"]');
    if(gr&&!drag.box)drag.box=[+gr.getAttribute('x'),+gr.getAttribute('y')];
    if(gr){gr.setAttribute('x',(drag.box[0]+gdx).toFixed(2));gr.setAttribute('y',(drag.box[1]+gdy).toFixed(2))}
    if(gh2)gh2.setAttribute('transform','translate('+(drag.box[0]+gdx).toFixed(2)+' '+(drag.box[1]+gdy-2.5).toFixed(2)+')');
    drag.moved=true;showGuide(nc[0]);return}
  if(!drag)return;var p=toMat(e),it=find(cur),s0=drag.start[drag.id],dx=p[0]-s0[0],dy=p[1]-s0[1];
  if(drag.ids.length>1){/* keep the whole selection on the mat and in the same shape */
    var mnX=54,mxX=0,mnY=42,mxY=0;drag.ids.forEach(function(id){var q=drag.start[id];mnX=Math.min(mnX,q[0]);mxX=Math.max(mxX,q[0]);mnY=Math.min(mnY,q[1]);mxY=Math.max(mxY,q[1])});
    dx=Math.max(-mnX,Math.min(54-mxX,dx));dy=Math.max(-mnY,Math.min(42-mxY,dy));p=[r2(s0[0]+dx),r2(s0[1]+dy)]}
  if(drag.selTap&&!drag.moved&&Math.hypot(dx,dy)<0.6)return;
  drag.ids.forEach(function(id){var q=id===drag.id?p:[r2(Math.max(0,Math.min(54,drag.start[id][0]+dx))),r2(Math.max(0,Math.min(42,drag.start[id][1]+dy)))];it.e.pos[id]=q;
    var el=id===drag.id?drag.el:document.querySelector('#dots .dot[data-id="'+id+'"]');if(el)el.setAttribute('transform','translate('+q[0]+' '+q[1]+')')});
  drag.moved=true;showGuide(p[0]);
  {var gb=document.getElementById('gboxes');if(gb)gb.innerHTML=groupBoxes(function(a,i){return posOf(it.e,a,i)})}});
function placeDragged(){var t=tdrag.tile;t.style.transform='';var n=t.getBoundingClientRect();
  t.style.transform='translate('+(tdrag.px-tdrag.gx-n.left)+'px,'+(tdrag.py-tdrag.gy-n.top)+'px)'}
function dragTile(){
  var t=tdrag.tile,now=performance.now(),over=null;
  if(now-tdrag.last>220){document.querySelectorAll('#tiles .tile').forEach(function(o){if(o===t||over)return;var r=o.getBoundingClientRect();
    if(tdrag.px>=r.left&&tdrag.px<=r.right&&tdrag.py>=r.top&&tdrag.py<=r.bottom)over=o})}
  if(over){var box=t.parentNode,kids=Array.prototype.slice.call(box.children),a=kids.indexOf(t),b=kids.indexOf(over);
    tdrag.last=now;tdrag.moved=true;flip(function(){box.insertBefore(t,a<b?over.nextSibling:over);layoutTiles()},t.dataset.tile)}
  placeDragged();
}
function endDrag(){
  if(mswipe){matSwipeEnd();return}
  if(tdrag){var t=tdrag.tile,moved=tdrag.moved;tdrag=null;
    if(!reduceMotion){t.style.transition='transform 240ms cubic-bezier(.2,.8,.2,1),box-shadow 240ms';}
    t.style.transform='';t.classList.remove('lifting');
    setTimeout(function(){t.style.transition=''},260);
    if(moved){L.order=Array.prototype.map.call(document.querySelectorAll('#tiles .tile'),function(x){return x.dataset.tile});saveLayout()}return}
  if(rdrag){endRowDrag();return}
  if(bdrag){var bm=bdrag.moved;bdrag=null;if(bm){markDirty();refreshTraffic();renderMat()}return}
  if(box){endBox();return}
  if(!drag)return;if(betaTapCheck('dot'))return;var m=drag.moved;drag=null;showGuide(null);if(m){markDirty();refreshTraffic()}renderMat()}
window.addEventListener('scroll',function(){if(tdrag)placeDragged()},{passive:true});
window.addEventListener('pointerup',endDrag);window.addEventListener('pointercancel',endDrag);
app.addEventListener('keydown',function(e){
  if(ATHLETE)return;
  var rg=e.target.closest&&e.target.closest('[data-rgrip]');
  if(rg&&(e.key==='ArrowUp'||e.key==='ArrowDown')){e.preventDefault();moveRowKey(rg.dataset.rgrip,rg.dataset.id,e.key==='ArrowUp'?-1:1);return}
  var bk=e.target.closest&&e.target.closest('#mat .bendh');
  if(bk&&!playing){var ite2=find(cur),pv2=ite2.n>0?ite2.list[ite2.n-1].e:null;if(!pv2)return;
    var ids2=bk.dataset.gid?membersOf(bk.dataset.gid).map(function(a){return a.id}):[bk.dataset.aid],cur2=(ite2.e.bend||{})[ids2[0]]||[0,0];
    if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();setBend(ite2.e,ids2,null)}
    else{var kx={ArrowLeft:-2,ArrowRight:2}[e.key]||0,ky={ArrowUp:-2,ArrowDown:2}[e.key]||0;if(!kx&&!ky)return;e.preventDefault();setBend(ite2.e,ids2,[cur2[0]+kx,cur2[1]+ky])}
    markDirty();refreshTraffic();renderMat();var nk=document.querySelector('#mat .bendh['+(bk.dataset.gid?'data-gid="'+bk.dataset.gid:'data-aid="'+bk.dataset.aid)+'"]');if(nk)nk.focus();return}
  var gh=e.target.closest&&e.target.closest('#mat .ghandle');
  if(gh&&!playing&&e.key==='Enter'){e.preventDefault();toggleBox(gh.dataset.gid);return}
  if(gh&&!playing){var gx={ArrowLeft:-1,ArrowRight:1}[e.key]||0,gy={ArrowUp:-1,ArrowDown:1}[e.key]||0;if(!gx&&!gy)return;e.preventDefault();
    var ite=find(cur),ms=membersOf(gh.dataset.gid),st=L.free?1:3;
    var ok=ms.every(function(a){var q=posOf(ite.e,a,R.athletes.indexOf(a));return q[0]+gx*st>=0&&q[0]+gx*st<=54&&q[1]+gy>=0&&q[1]+gy<=42});
    if(ok){ms.forEach(function(a){var q=posOf(ite.e,a,R.athletes.indexOf(a));ite.e.pos[a.id]=[q[0]+gx*st,q[1]+gy]});renderMat();markDirty()}
    var ng=document.querySelector('#mat .ghandle[data-gid="'+gh.dataset.gid+'"]');if(ng)ng.focus();return}
  var d=e.target.closest&&e.target.closest('#mat .dot');if(!d||playing)return;
  var dx={ArrowLeft:-1,ArrowRight:1}[e.key]||0,dy={ArrowUp:-1,ArrowDown:1}[e.key]||0;if(!dx&&!dy)return;e.preventDefault();
  var it=find(cur),id=d.dataset.id,i=R.athletes.findIndex(function(a){return a.id===id}),p=posOf(it.e,R.athletes[i],i);
  var np=L.free?[Math.max(0,Math.min(54,p[0]+dx)),Math.max(0,Math.min(42,p[1]+dy))]:snapPos(Math.round(p[0]/3)*3+dx*3,p[1]+dy),ddx=np[0]-p[0],ddy=np[1]-p[1],a0=R.athletes[i];
  var grp=selMode&&sel.length>1&&sel.indexOf(id)>=0?sel:[a0.id];
  if(grp.length>1){var mnX=54,mxX=0,mnY=42,mxY=0;grp.forEach(function(k){var j=R.athletes.findIndex(function(z){return z.id===k}),q=posOf(it.e,R.athletes[j],j);mnX=Math.min(mnX,q[0]);mxX=Math.max(mxX,q[0]);mnY=Math.min(mnY,q[1]);mxY=Math.max(mxY,q[1])});
    ddx=Math.max(-mnX,Math.min(54-mxX,ddx));ddy=Math.max(-mnY,Math.min(42-mxY,ddy));
    grp.forEach(function(k){var j=R.athletes.findIndex(function(z){return z.id===k}),q=posOf(it.e,R.athletes[j],j);it.e.pos[k]=[r2(q[0]+ddx),r2(q[1]+ddy)]})}
  else it.e.pos[a0.id]=np;renderMat();markDirty();refreshTraffic();
  var nd=document.querySelector('#mat .dot[data-id="'+id+'"]');if(nd)nd.focus()});

/* ---- reorder the count sheet: drag 8-counts (also into another section) and whole sections ---- */
var rdrag=null;
function flipEls(els,mutate,skip){if(reduceMotion){mutate();return}
  var before=new Map();els().forEach(function(el){before.set(el,el.getBoundingClientRect())});mutate();
  els().forEach(function(el){if(el===skip)return;var b=before.get(el);if(!b)return;el.style.transition='none';var tr=el.style.transform;el.style.transform='';var a=el.getBoundingClientRect(),dy=b.top-a.top;
    if(Math.abs(dy)<1){el.style.transform=tr;return}el.style.transform='translateY('+dy+'px)';el.offsetWidth;el.style.transition='transform 220ms cubic-bezier(.2,.8,.2,1)';el.style.transform='';
    el.addEventListener('transitionend',function h(){el.style.transition='';el.removeEventListener('transitionend',h)})})}
function startRowDrag(e,rg){if(playing)pause();e.preventDefault();
  var el=rg.dataset.rgrip==='sec'?rg.closest('.sec'):rg.closest('li'),r=el.getBoundingClientRect();
  rdrag={kind:rg.dataset.rgrip,id:rg.dataset.id,el:el,gy:e.clientY-r.top,py:e.clientY,px:e.clientX,last:0,moved:false};
  el.classList.add('rlift');el.style.transition='none';try{rg.setPointerCapture(e.pointerId)}catch(x){}}
function placeRow(){var el=rdrag.el;el.style.transform='';var n=el.getBoundingClientRect();el.style.transform='translateY('+(rdrag.py-rdrag.gy-n.top)+'px)'}
function rowEls(){return Array.prototype.slice.call(document.querySelectorAll(rdrag.kind==='sec'?'.sec':'.eights>li'))}
function moveRowDrag(e){rdrag.py=e.clientY;rdrag.px=e.clientX;var now=performance.now(),el=rdrag.el;
  if(now-rdrag.last>160){var over=null;rowEls().forEach(function(o){if(o===el||over)return;var r=o.getBoundingClientRect();if(rdrag.py>=r.top&&rdrag.py<=r.bottom)over=o});
    if(!over&&rdrag.kind==='eight'){document.querySelectorAll('.sec').forEach(function(sc){var r=sc.getBoundingClientRect(),ol=sc.querySelector('.eights');
      if(!over&&rdrag.py>=r.top&&rdrag.py<=r.bottom&&ol&&!ol.contains(el)){over=ol}})}
    if(over){rdrag.last=now;rdrag.moved=true;flipEls(rowEls,function(){
      if(over.tagName==='OL'){over.appendChild(el);return}
      var par=over.parentNode;if(par===el.parentNode){var kids=Array.prototype.slice.call(par.children),a=kids.indexOf(el),b=kids.indexOf(over);par.insertBefore(el,a<b?over.nextSibling:over)}
      else{var r=over.getBoundingClientRect();par.insertBefore(el,rdrag.py>r.top+r.height/2?over.nextSibling:over)}},el)}}
  if(rdrag.py<90)window.scrollBy(0,-12);else if(rdrag.py>window.innerHeight-150)window.scrollBy(0,12);
  placeRow()}
function endRowDrag(){var d=rdrag;rdrag=null;var el=d.el;if(!reduceMotion)el.style.transition='transform 200ms cubic-bezier(.2,.8,.2,1)';el.style.transform='';
  setTimeout(function(){el.style.transition='';el.classList.remove('rlift')},210);if(!d.moved)return;
  if(d.kind==='sec'){var order=Array.prototype.map.call(document.querySelectorAll('.sec'),function(x){return x.dataset.sec});
    R.sections.sort(function(a,b){return order.indexOf(a.id)-order.indexOf(b.id)})}
  else{var byId={};R.sections.forEach(function(s){ev(s).forEach(function(e){byId[e.id]=e})});
    var next=Array.prototype.map.call(document.querySelectorAll('.sec'),function(sc){return {id:sc.dataset.sec,ids:Array.prototype.map.call(sc.querySelectorAll('.eights>li'),function(li){return li.dataset.eight})}});
    if(next.some(function(x){return !x.ids.length})){flash('Each section needs at least one 8-count.');setTimeout(render,220);return}
    next.forEach(function(x){var s=R.sections.find(function(q){return q.id===x.id});activeVar(s).eights=x.ids.map(function(i){return byId[i]})})}
  markDirty();setTimeout(function(){render();updateLive(!playing)},220)}
function moveRowKey(kind,id,dir){
  if(kind==='sec'){var i=R.sections.findIndex(function(s){return s.id===id}),j=i+dir;if(j<0||j>=R.sections.length)return;var s=R.sections.splice(i,1)[0];R.sections.splice(j,0,s)}
  else{var it=find(id),list=ev(it.s),k=it.ei+dir;
    if(k>=0&&k<list.length){var e=list.splice(it.ei,1)[0];list.splice(k,0,e)}
    else{var si=it.si+dir;if(si<0||si>=R.sections.length)return;if(list.length<2){flash('Each section needs at least one 8-count.');return}
      var e2=list.splice(it.ei,1)[0],tl2=ev(R.sections[si]);if(dir<0)tl2.push(e2);else tl2.unshift(e2)}}
  markDirty();render();var g=document.querySelector('[data-rgrip="'+kind+'"][data-id="'+id+'"]');if(g)g.focus()}

/* ---- PDF export of count sheets and formations ---- */
function loadJsPDF(){return new Promise(function(res,rej){if(window.jspdf&&window.jspdf.jsPDF)return res(window.jspdf.jsPDF);
  var sc=document.createElement('script');sc.src='lib/jspdf.umd.min.js';
  sc.onload=function(){window.jspdf&&window.jspdf.jsPDF?res(window.jspdf.jsPDF):rej(new Error('load'))};sc.onerror=function(){rej(new Error('load'))};document.head.appendChild(sc)})}
function pdfText(t){return String(t==null?'':t).replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[^\x09\x0A\x0D\x20-\x7E -ÿ–—•]/g,'')}
function hexRGB(h){h=String(h).replace('#','');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
var ROLE_HEX={Flyer:'#e8457a',Base:'#14a38b',Backspot:'#f0a020',Tumbler:'#8b5cf6'};
function exportPDF(){
  var opt={form:!!(document.getElementById('pfForm')||{}).checked,notes:!!(document.getElementById('pfNotes')||{}).checked,score:!!(document.getElementById('pfScore')||{}).checked,team:!!(document.getElementById('pfTeam')||{}).checked,spot:!!(document.getElementById('pfSpot')||{}).checked};
  if(!downloadsApi){flash('Saving files isn’t available in this view. Open the playbook in claude.ai to download the PDF.');return}
  var btn=document.getElementById('pdfMakeBtn');if(btn){btn.disabled=true;btn.textContent='Building PDF…'}
  loadJsPDF().then(function(JsPDF){
    var doc=new JsPDF({unit:'pt',format:'letter'}),W=612,H=792,M=40,y=M,page=1;
    var ink=[21,26,45],muted=[91,98,130],acc=[217,45,99];
    function foot(){doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(muted[0],muted[1],muted[2]);doc.text(pdfText(R.name||'Routine')+' · Cheerbook',M,H-22);doc.text('Page '+page,W-M,H-22,{align:'right'})}
    function newPage(){foot();doc.addPage();page++;y=M}
    function need(h){if(y+h>H-44)newPage()}
    function txt(t,size,style,color,x,maxW){doc.setFont('helvetica',style||'normal');doc.setFontSize(size);var c=color||ink;doc.setTextColor(c[0],c[1],c[2]);
      var lines=doc.splitTextToSize(pdfText(t),maxW||W-2*M);doc.text(lines,x||M,y);return lines.length*size*1.25}
    function drawMat(e,x0,y0,w){var s=w/54,h=42*s;
      doc.setFillColor(238,241,251);doc.setDrawColor(150,160,200);doc.setLineWidth(.6);doc.rect(x0,y0,w,h,'FD');
      doc.setLineWidth(.4);for(var j=1;j<9;j++){doc.line(x0+j*6*s,y0,x0+j*6*s,y0+h)}
      doc.setLineDashPattern([1.5,1.5],0);doc.setDrawColor(190,198,225);for(var c=0;c<9;c++){doc.line(x0+(3+c*6)*s,y0,x0+(3+c*6)*s,y0+h)}doc.setLineDashPattern([],0);
      doc.setFont('helvetica','bold');doc.setFontSize(6);doc.setTextColor(muted[0],muted[1],muted[2]);for(var k=0;k<9;k++)doc.text(String(k+1),x0+(3+k*6)*s,y0+h+7,{align:'center'});
      doc.setFont('helvetica','normal');doc.setFontSize(5);doc.text('FRONT',x0+w/2,y0+h+13,{align:'center'});
      var pos=function(a,i){return posOf(e,a,i)};
      RG().forEach(function(g){var xs=[],ys=[];R.athletes.forEach(function(a,i){if(a.group===g.id){var p=pos(a,i);xs.push(p[0]);ys.push(p[1])}});if(!xs.length)return;
        var c=hexRGB(g.color);doc.setDrawColor(c[0],c[1],c[2]);doc.setLineWidth(.7);doc.setLineDashPattern([2,1.2],0);
        var gx0=Math.max(0,Math.min.apply(0,xs)-2.3),gx1=Math.min(54,Math.max.apply(0,xs)+2.3),gy0=Math.max(0,Math.min.apply(0,ys)-2.3),gy1=Math.min(42,Math.max.apply(0,ys)+2.3);
        doc.roundedRect(x0+gx0*s,y0+gy0*s,(gx1-gx0)*s,(gy1-gy0)*s,2,2,'S');doc.setLineDashPattern([],0)});
      liveLinks(e).forEach(function(l){var fa=flyerOf(l[0]),fb=flyerOf(l[1]);if(!fa||!fb)return;var pa=pos(fa,R.athletes.indexOf(fa)),pb=pos(fb,R.athletes.indexOf(fb));
        doc.setDrawColor(217,45,99);doc.setLineWidth(1);doc.setLineDashPattern([2,1.2],0);doc.line(x0+pa[0]*s,y0+pa[1]*s,x0+pb[0]*s,y0+pb[1]*s);doc.setLineDashPattern([],0)});
      R.athletes.forEach(function(a,i){var p=pos(a,i),c=hexRGB(ROLE_HEX[a.role]||'#5b6282'),cx=x0+p[0]*s,cy=y0+p[1]*s,r=Math.max(3.2,1.7*s);
        doc.setFillColor(c[0],c[1],c[2]);doc.setDrawColor(255,255,255);doc.setLineWidth(.5);doc.circle(cx,cy,r,'FD');
        doc.setFont('helvetica','bold');doc.setFontSize(Math.max(4,r*1.05));doc.setTextColor(255,255,255);doc.text(pdfText(initials(a.name)),cx,cy+r*.36,{align:'center'})});
      return h+14}
    // cover
    y+=txt(R.name||'Routine',22,'bold',ink);y+=4;
    var meta=flat().length+' eight-counts · about '+fmt(routineSecs())+' at '+R.bpm+' BPM · '+(SHEETS[R.sheet.tpl]||{}).name;
    y+=txt(meta,10,'normal',muted);
    if(R.audio)y+=txt('Song: '+R.audio.name,10,'normal',muted);else if(R.music)y+=txt('Song: '+R.music,10,'normal',muted);
    y+=txt('Exported '+new Date().toLocaleDateString(),9,'normal',muted);y+=10;
    if(opt.team&&R.athletes.length){need(30);y+=txt('Team',13,'bold',acc);y+=2;
      R.athletes.forEach(function(a){need(14);var g=groupOf(a);y+=txt(initials(a.name)+'  '+a.name+' · '+a.role+(g?' · '+g.name:''),9.5,'normal',ink)});y+=10}
    if(opt.score){var cov=coverage();need(40);y+=txt('Scoresheet checklist',13,'bold',acc);y+=2;
      sheetWarnings(cov).forEach(function(wn){need(24);y+=txt('Warning: '+wn,9,'bold',[180,83,9])});
      sheetCats().forEach(function(c){need(28);y+=txt(c.cat,10,'bold',ink);
        c.items.forEach(function(x){var hits=cov[x.k]||[],nd=x.need||1;need(14);
          y+=txt((hits.length>=nd?'[x] ':hits.length?'[~] ':'[  ] ')+x.n+' — '+hits.length+' of '+nd+(hits.length?' (8-counts '+hits.map(function(h){return h.n}).join(', ')+')':'')+(x.pts?' · '+x.pts+' pts':''),9,'normal',ink,M+8,W-2*M-8)});y+=4});
      y+=6}
    // count sheets
    var f=flat(),lastSec=null;
    f.forEach(function(r,n){
      var hasNote=opt.notes&&r.e.note,blockH=opt.form?172:(46+(hasNote?24:0));
      if(r.s!==lastSec){need(blockH+28);doc.setFillColor(acc[0],acc[1],acc[2]);doc.rect(M,y-11,W-2*M,18,'F');
        doc.setFont('helvetica','bold');doc.setFontSize(11);doc.setTextColor(255,255,255);doc.text(pdfText(secLabel(r.s).toUpperCase()),M+8,y+2);y+=20;lastSec=r.s}
      need(blockH);var top=y,x=M,cw=W-2*M;
      if(opt.form){var mw=190;drawMat(r.e,M,top,mw);x=M+mw+16;cw=W-M-x}
      doc.setFont('helvetica','bold');doc.setFontSize(12);doc.setTextColor(ink[0],ink[1],ink[2]);doc.text('8-count '+(n+1),x,top+8);
      doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(muted[0],muted[1],muted[2]);doc.text(fmt(eightStart(n)),x+cw,top+8,{align:'right'});
      var tags=(r.e.tags||[]).map(function(k){var it2=sheetItems().find(function(z){return z.k===k});return it2?it2.n:null}).filter(Boolean);
      var extra=[],bt3=buildText(r.e),sp3=opt.spot?spotAth():null;
      if(tags.length)extra.push(['Scores for: '+tags.join(', '),[20,163,139]]);
      if(bt3)extra.push(['Building: '+bt3,[91,98,130]]);
      if(sp3)extra.push([sp3.name+': '+spotText(r.e,sp3),[180,83,9]]);
      extra.forEach(function(xl,xi){doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(xl[1][0],xl[1][1],xl[1][2]);doc.text(doc.splitTextToSize(pdfText(xl[0]),cw)[0],x,top+19+xi*9)});
      var gy=top+20+extra.length*9,colW=opt.form?cw/2:cw/4,rows=opt.form?4:2;
      for(var i=0;i<8;i++){var col=opt.form?Math.floor(i/4):i%4,row=opt.form?i%4:Math.floor(i/4),cx=x+col*colW,cy=gy+row*16;
        doc.setDrawColor(218,222,236);doc.setLineWidth(.5);doc.rect(cx,cy,colW-6,14);
        doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(acc[0],acc[1],acc[2]);doc.text(String(i+1),cx+4,cy+10);
        doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(ink[0],ink[1],ink[2]);doc.text(pdfText(r.e.counts[i]||''),cx+14,cy+10,{maxWidth:colW-22})}
      var ny=gy+rows*16+10;
      if(hasNote){doc.setFont('helvetica','italic');doc.setFontSize(8.5);doc.setTextColor(muted[0],muted[1],muted[2]);var nl=doc.splitTextToSize(pdfText('Notes: '+r.e.note),cw);doc.text(nl.slice(0,3),x,ny);ny+=Math.min(3,nl.length)*11}
      y=Math.max(top+(opt.form?166:0),ny)+10;doc.setDrawColor(230,232,242);doc.line(M,y-5,W-M,y-5);
    });
    foot();
    var name=pdfText((R.name||'Routine').replace(/[\\\/:*?"<>|]+/g,'').trim()||'Routine')+' playbook.pdf';
    return downloadsApi.save({filename:name,data:doc.output('blob')});
  }).then(function(res){if(res){flash(res.status==='delivered'?'PDF sent.':'PDF saved. Open it to print.')}})
  .catch(function(e){var c=e&&e.code;
    if(c==='declined')flash('PDF not saved.');
    else if(c==='rate_limited')flash('A save prompt is already open. Finish it, then try again.');
    else if(c==='unavailable'||c==='not_granted'||c==='capability_disabled')flash('Saving files isn’t available in this view.');
    else if(e&&e.message==='load')flash('The PDF tool didn’t load. Check your connection and try again.');
    else flash('Building the PDF failed. Try again.')})
  .then(function(){var b2=document.getElementById('pdfMakeBtn');if(b2){b2.disabled=false;b2.textContent='Download PDF'}});
}

/* ---- live sync: routines live in the artifact's shared database and save a moment after each change ----
   docs: pb/meta {order, views, startView} · routines/<id> (routine without versions) · versions/<id> (+rid) · templates/<id>
   each body is {at, data}. sync.base holds the hash of each doc as last agreed with the database, so a change is
   "mine" when the local hash moved off it and "theirs" when the database hash did. */
var dbApi=null;
function canon(x){if(x===null||typeof x!=='object')return x===undefined?'null':JSON.stringify(x);if(Array.isArray(x))return '['+x.map(canon).join(',')+']';
  return '{'+Object.keys(x).sort().filter(function(k){return x[k]!==undefined&&typeof x[k]!=='function'}).map(function(k){return JSON.stringify(k)+':'+canon(x[k])}).join(',')+'}'}
function hsh(s){var h1=0xdeadbeef,h2=0x41c6ce57;for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}
  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return (h2>>>0).toString(36)+'.'+(h1>>>0).toString(36)}
function keyPath(k){var t=k.charAt(0),id=k.slice(2);return t==='m'?'pb/meta':(t==='r'?'routines/':t==='v'?'versions/':t==='k'?'teams/':'templates/')+id}
function localDocs(){var out={m:{order:D.routines.map(function(r){return r.id}),views:D.views,startView:D.startView||null,profile:D.profile||{}}};
  D.routines.forEach(function(r){var c={};Object.keys(r).forEach(function(k){if(k!=='versions')c[k]=r[k]});out['r:'+r.id]=c;
    (r.versions||[]).forEach(function(v){var o={rid:r.id};Object.keys(v).forEach(function(k){o[k]=v[k]});out['v:'+v.id]=o})});
  D.templates.forEach(function(t){out['t:'+t.id]=t});(D.teams||[]).forEach(function(t){out['k:'+t.id]=t});return out}
function syncReady(){return sync.defin.m&&sync.defin.r&&sync.defin.v&&sync.defin.t&&sync.defin.k}
function interacting(){var a=document.activeElement;return !!(drag||tdrag||bdrag||rdrag||box||playing||(a&&a!==document.body&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&a.type!=='checkbox'&&a.type!=='range'))}
function scheduleSync(ms){if(!sync.on)return;sync.pending=true;clearTimeout(sync.timer);sync.timer=setTimeout(function(){sync.timer=0;reconcile()},ms==null?1200:ms);updateStatus()}
function reconcile(){
  if(!sync.on||!syncReady())return;
  if(sync.busy){sync.again=true;return}
  var loc=localDocs(),lh={},keys={},pushes=[],applied=[],deferred=false,first=!Object.keys(sync.base).length,adopt=first&&!!sync.remote.m;
  Object.keys(loc).forEach(function(k){lh[k]=hsh(canon(loc[k]));keys[k]=1});
  Object.keys(sync.remote).forEach(function(k){keys[k]=1});Object.keys(sync.base).forEach(function(k){keys[k]=1});
  if(adopt){try{localStorage.setItem(LS+'-before-sync',JSON.stringify(D))}catch(e){}}
  Object.keys(keys).forEach(function(k){
    var b=sync.base[k]||null,l=lh[k]||null,rm=sync.remote[k],r=rm?rm.h:null;
    if(l===r){if(l)sync.base[k]=l;else delete sync.base[k];return}
    if(adopt){if(sync.localDirty&&l&&((rm&&rm.at)||0)<(D.editedAt||0))pushes.push(k);else applied.push(k);return}
    var mine=l!==b,theirs=r!==b;
    if(mine&&!theirs)pushes.push(k);
    else if(theirs&&!mine)applied.push(k);
    else if(((rm&&rm.at)||0)>(D.editedAt||0))applied.push(k);else pushes.push(k)});
  if(applied.length){if(interacting()){deferred=true}else applyRemote(applied)}
  sync.pending=false;sync.offline=sync.cached;
  saveBase();
  if(deferred){clearTimeout(sync.retry);sync.retry=setTimeout(reconcile,1500)}
  if(pushes.length&&!readOnly){pushes.sort(function(a,b){return (a==='m')-(b==='m')});pushDocs(pushes,loc,lh)}else updateStatus()}
function pushDocs(keys,loc,lh){sync.busy=true;sync.err=null;updateStatus();var i=0;
  function done(){sync.busy=false;saveBase();
    if(mediaMsg&&/Saving…$/.test(mediaMsg.text))setMsg(null);updateStatus();if(sync.again){sync.again=false;scheduleSync(200)}}
  function next(){
    if(i>=keys.length){done();return}
    var k=keys[i++],ref=dbApi.doc(keyPath(k)),p;
    if(loc[k]){var body={at:Date.now(),data:JSON.parse(JSON.stringify(loc[k]))};
      if(JSON.stringify(body).length>240000){sync.err='big';sync.bigWhat=k.charAt(0)==='r'?(loc[k].name||'A routine'):'A saved version';next();return}
      p=ref.set(body)}
    else p=ref.delete();
    p.then(function(){if(lh[k])sync.base[k]=lh[k];else delete sync.base[k];next()},function(e){var c=e&&e.code;sync.busy=false;
      if(c==='invalid_argument'){readOnly=true;flash('You can view this playbook but not change it. Your edits stay on this device.')}
      else if(c==='quota_exceeded')sync.err='full';
      else{sync.err='retry';scheduleSync(c==='resource_exhausted'?15000:5000)}
      updateStatus()})}
  next()}
function applyRemote(keys){
  var curId=D.cur,sig=function(r){return r?JSON.stringify([r.audio,r.video,r.sections.map(function(s){return s.variants.map(function(v){return v.video})})]):''},before=sig(R);
  var gone=[];
  keys.sort(function(a,b){return 'rkvtm'.indexOf(a.charAt(0))-'rkvtm'.indexOf(b.charAt(0))});
  keys.forEach(function(k){var rm=sync.remote[k],body=rm?clone(rm.data):null,t=k.charAt(0),id=k.slice(2),ok=true;
    if(t==='r'){var i=D.routines.findIndex(function(r){return r.id===id});
      if(body){body.id=id;body.versions=i>=0?D.routines[i].versions:[];fixRoutine(body);if(i>=0)D.routines[i]=body;else D.routines.push(body)}
      else if(i>=0)gone.push(k)}
    else if(t==='v'){D.routines.forEach(function(r){r.versions=(r.versions||[]).filter(function(v){return v.id!==id})});
      if(body){var rr=D.routines.find(function(r){return r.id===body.rid});if(rr){delete body.rid;rr.versions.push(body);rr.versions.sort(function(a,b){return (a.at||0)-(b.at||0)})}else ok=false}}
    else if(t==='t'){var j=D.templates.findIndex(function(x){return x.id===id});
      if(body){if(j>=0)D.templates[j]=body;else D.templates.push(body);D.templates.sort(function(a,b){return (a.at||0)-(b.at||0)})}else if(j>=0)D.templates.splice(j,1)}
    else if(t==='k'){var q=D.teams.findIndex(function(x){return x.id===id});if(body){body.id=id;fixTeam(body);if(q>=0)D.teams[q]=body;else D.teams.push(body)}else if(q>=0)D.teams.splice(q,1)}
    else if(t==='m'&&body){D.profile=body.profile&&typeof body.profile==='object'?body.profile:{};D.views=Array.isArray(body.views)?body.views:[];D.views.forEach(function(v){v.layout=migrateLayoutObj(v.layout)});D.startView=body.startView||null;
      var ord=Array.isArray(body.order)?body.order:[];D.routines.sort(function(a,b){var x=ord.indexOf(a.id),y=ord.indexOf(b.id);return (x<0?1e9:x)-(y<0?1e9:y)})}
    if(ok){if(rm)sync.base[k]=rm.h;else delete sync.base[k]}});
  /* routines removed elsewhere go last, after any new ones arrived, and the playbook always keeps one */
  gone.forEach(function(k){var id=k.slice(2),i=D.routines.findIndex(function(r){return r.id===id});if(i>=0&&D.routines.length>1){D.routines.splice(i,1);delete sync.base[k]}});
  var fixed=ensureTeams();
  R=D.routines.find(function(r){return r.id===curId&&!r.deletedAt})||liveRoutines()[0]||D.routines[0];D.cur=R.id;find(cur);if(fixed)setTimeout(function(){scheduleSync(300)},0);
  lastSnap=JSON.stringify(D);saveLocal(lastSnap);
  if(R.sample===false){var bn=document.getElementById('banner');if(bn)bn.hidden=true}
  if(sig(R)!==before){loadAudio();buildVideos()}
  render()}
function watchDocs(t){
  var ref=t==='m'?dbApi.doc('pb/meta'):dbApi.collection(t==='r'?'routines':t==='v'?'versions':t==='k'?'teams':'templates');
  sync.unsub.push(ref.onSnapshot(function(snap){
    if(snap.metadata&&snap.metadata.hasPendingWrites)return;
    if(t==='m'){var d=snap.exists?snap.data():null;if(d&&d.data&&typeof d.data==='object')sync.remote.m={h:hsh(canon(d.data)),at:d.at||0,data:d.data};else delete sync.remote.m}
    else{var prevRm={};Object.keys(sync.remote).forEach(function(k){if(k.charAt(0)===t){prevRm[k]=sync.remote[k];delete sync.remote[k]}});
      /* documents whose revision hasn't moved keep their parsed copy and hash, so one edit doesn't re-hash the whole collection */
      snap.docs.forEach(function(d){var k=t+':'+d.id,old=prevRm[k];if(old&&d.rev!=null&&old.rev===d.rev){sync.remote[k]=old;return}
        var b=d.data();if(b&&b.data&&typeof b.data==='object')sync.remote[k]={h:hsh(canon(b.data)),at:b.at||0,data:b.data,rev:d.rev}})}
    sync.cached=!!(snap.metadata&&snap.metadata.fromCache);
    if(!sync.cached)sync.defin[t]=true;
    if(syncReady())scheduleSync(sync.first?0:300);sync.first=false;
  },function(){sync.err='lost';updateStatus()}))}
function startSync(db){dbApi=db;sync.on=true;sync.first=true;updateStatus();['m','r','v','t','k'].forEach(watchDocs)}
function flushSync(){if(sync.on&&sync.timer){clearTimeout(sync.timer);sync.timer=0;reconcile()}}
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden'){flushLocal();flushSync()}});
window.addEventListener('pagehide',function(){flushLocal();flushSync()});
document.addEventListener('focusout',function(){if(sync.on&&sync.pending)scheduleSync(400)});

/* ---- automatic beat detection: tempo and where count 1 lands, found from the song itself (tap tempo stays as the fallback) ----
   onset strength = rise in loudness every 10 ms (whole song plus the kick-drum band); tempo = the repeat the onsets line up with best,
   leaning toward cheer tempos around 150; then a fine search over tempo and offset picks the beat grid that hits the most onsets. */
function decodeSong(ab){return new Promise(function(res,rej){var OC=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!OC){rej(new Error('nodecode'));return}
  var ctx=new OC(1,1,44100),done=false,ok=function(b){if(!done){done=true;res(b)}},bad=function(e){if(!done){done=true;rej(e||new Error('decode'))}};
  try{var p=ctx.decodeAudioData(ab,ok,bad);if(p&&p.then)p.then(ok,bad)}catch(e){bad(e)}})}
function detectBeat(buf){
  var sr=buf.sampleRate,n=Math.min(buf.length,Math.floor(sr*150)),nc=buf.numberOfChannels,x=new Float32Array(n),c,i;
  for(c=0;c<nc;c++){var d=buf.getChannelData(c);for(i=0;i<n;i++)x[i]+=d[i]/nc}
  var hop=Math.round(sr*0.01),win=hop*2,F=Math.floor((n-win)/hop);if(F<300)return null;
  var a=1-Math.exp(-2*Math.PI*150/sr),y=0,low=new Float32Array(n);for(i=0;i<n;i++){y+=a*(x[i]-y);low[i]=y}
  var ef=new Float32Array(F),el=new Float32Array(F),f,k;
  for(f=0;f<F;f++){var s1=0,s2=0,o=f*hop;for(k=0;k<win;k+=2){var v=x[o+k],w=low[o+k];s1+=v*v;s2+=w*w}ef[f]=s1;el[f]=s2}
  var on=new Float32Array(F),mf=0,ml=0,of=new Float32Array(F),ol=new Float32Array(F);
  for(f=1;f<F;f++){of[f]=Math.max(0,Math.log(1e-9+ef[f])-Math.log(1e-9+ef[f-1]));ol[f]=Math.max(0,Math.log(1e-9+el[f])-Math.log(1e-9+el[f-1]));if(of[f]>mf)mf=of[f];if(ol[f]>ml)ml=ol[f]}
  for(f=0;f<F;f++)on[f]=(mf?of[f]/mf:0)+1.3*(ml?ol[f]/ml:0);
  /* music start: first moment the song gets loud (ignores a quiet lead-in) */
  var emax=0;for(f=0;f<F;f++)if(ef[f]>emax)emax=ef[f];var start=0;for(f=0;f<F;f++){if(ef[f]>emax*0.02){start=f*0.01;break}}
  var s0=Math.floor(start/0.01),mean=0,m=0;for(f=s0;f<F;f++){mean+=on[f];m++}mean/=Math.max(1,m);
  var best=null;
  for(var bpm=60;bpm<=220;bpm+=0.5){var lag=60/bpm/0.01,L=Math.floor(lag),fr=lag-L,acc=0,cnt=0;
    for(f=s0;f+L+1<F;f++){var u=on[f]-mean,q=(on[f+L]*(1-fr)+on[f+L+1]*fr)-mean;acc+=u*q;cnt++}
    var sc=(acc/Math.max(1,cnt))*Math.exp(-0.5*Math.pow(Math.log2(bpm/150)/0.6,2));if(!best||sc>best.sc)best={bpm:bpm,sc:sc}}
  if(!best)return null;var B=best.bpm;
  if(B<100&&B*2<=200)B*=2;else if(B>200)B/=2;
  var grid=function(bp,ph){var p=60/bp,t=start+ph,s=0,c2=0,end=Math.min(F*0.01-0.05,start+90);for(;t<end;t+=p){var fi=Math.round(t/0.01);s+=Math.max(on[fi]||0,on[fi-1]||0,on[fi+1]||0);c2++}return c2?s/c2:0};
  var top={sc:-1};
  for(var b2=B-3;b2<=B+3.001;b2+=0.05){var p2=60/b2;for(var ph=0;ph<p2;ph+=0.01){var g=grid(b2,ph);if(g>top.sc)top={sc:g,bpm:b2,ph:ph}}}
  var p3=60/top.bpm,first=start+top.ph;while(first-p3>=start-0.06)first-=p3;
  return {bpm:Math.round(top.bpm*10)/10,first:Math.max(0,Math.round(first*100)/100),start:Math.round(start*100)/100}}
var beatBusy=false;
function findBeat(routine,src,quiet){if(beatBusy)return;beatBusy=true;
  if(!quiet)setMsg('Finding the beat…');
  var get=src?Promise.resolve(src):fetch(BLOB(routine.audio.id)).then(function(r){if(!r.ok)throw new Error('fetch');return r.arrayBuffer()});
  get.then(function(x){return x&&x.arrayBuffer?x.arrayBuffer():x}).then(decodeSong).then(function(buf){var r=detectBeat(buf);if(!r)throw new Error('short');
    routine.bpm=r.bpm;routine.musicStart=r.first;
    if(routine===R){var bi=document.getElementById('bpm');if(bi)bi.value=r.bpm;var ms=document.getElementById('mstart');if(ms)ms.value=r.first;updateMeta();updateLive(!playing)}
    markDirty();if(routine===R&&!playing)softRender();
    setMsg('Beat found: '+r.bpm+' BPM, count 1 at '+r.first.toFixed(2)+' s. Press Play to check. If it feels off, use Tap tempo or nudge count 1.')})
  .catch(function(){setMsg('Couldn’t find the beat in this song. Use Tap tempo instead: tap along with the beat, then mark count 1 while it plays.',true)})
  .then(function(){beatBusy=false})}

/* ---- count sheet for the music producer: the grid producers ask for (8-count #, section, counts 1–8, notes), as Excel or CSV ---- */
function producerRows(){
  var p=D.profile||{},t=teamOf(R),f=flat(),rows=[];
  rows.push(['8-Count Sheet','','','','','','','','','','']);
  rows.push(['Program',p.program||'','','Team',t?t.name:'','','Level',t&&t.level||'','','','']);
  rows.push(['Coach',p.name||'','','Routine',R.name||'','','Mix length',fmt(Math.max(routineSecs(),0)),'BPM',String(R.bpm||''),'']);
  rows.push(['Count 1 at',(R.musicStart||0).toFixed(2)+' s','','Song',R.audio?R.audio.name:(R.music||''),'','8-counts',String(f.length),'','','']);
  rows.push(['','','','','','','','','','','']);
  rows.push(['8-Count','Section','1','2','3','4','5','6','7','8','Notes · sound effects · voiceover']);
  var last=null;f.forEach(function(r,n){var sec=r.s!==last?secLabel(r.s):'';last=r.s;
    rows.push([String(n+1),sec].concat(r.e.counts.map(function(c){return c||''})).concat([String(r.e.note||'').replace(/\s+/g,' ').trim()]))});
  return rows}
function csvOf(rows){return rows.map(function(r){return r.map(function(c){c=String(c==null?'':c);if(/^[=+\-@]/.test(c))c="'"+c;return /[",\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c}).join(',')}).join('\r\n')}
function loadXLSX(){return new Promise(function(res,rej){if(window.XLSX)return res(window.XLSX);var sc=document.createElement('script');sc.src='lib/xlsx.full.min.js';
  sc.onload=function(){window.XLSX?res(window.XLSX):rej(new Error('load'))};sc.onerror=function(){rej(new Error('load'))};document.head.appendChild(sc)})}
function exportProducer(kind){
  if(!downloadsApi){flash('Saving files isn’t available in this view. Open the playbook in claude.ai to export.');return}
  var rows=producerRows(),base=String(R.name||'Routine').replace(/[\\\/:*?"<>|]+/g,'').trim()||'Routine';
  var send=function(data,ext){return downloadsApi.save({filename:base+' count sheet.'+ext,data:data}).then(function(res){flash(res&&res.status==='delivered'?'Count sheet sent.':'Count sheet saved. Send it to your music producer.')})};
  var fail=function(e){var c=e&&e.code;flash(c==='declined'?'Count sheet not saved.':e&&e.message==='load'?'The Excel tool didn’t load. Try the CSV instead.':'Saving the count sheet didn’t work in this view.')};
  if(kind==='csv'){send('﻿'+csvOf(rows),'csv').catch(fail);return}
  loadXLSX().then(function(X){var ws=X.utils.aoa_to_sheet(rows);ws['!cols']=[{wch:8},{wch:20}].concat([1,2,3,4,5,6,7,8].map(function(){return {wch:14}})).concat([{wch:44}]);
    ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:10}}];var wb=X.utils.book_new();X.utils.book_append_sheet(wb,ws,'Count sheet');
    var out=X.write(wb,{bookType:'xlsx',type:'array'});return send(new Blob([out],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),'xlsx')}).catch(fail)}

/* ---- travel timing inside an 8-count: e.move = [first count, last count] for everyone (default 1–4),
   e.moveBy[athleteId] = their own window. Travel starts at the beginning of the first count and lands at the end of the last. ---- */
function moveWin(e,aid){var w=(e.moveBy&&e.moveBy[aid])||e.move;return Array.isArray(w)?w:[1,MOVE]}
function moveT(e,aid,u){var w=moveWin(e,aid),s=w[0]-1,en=w[1];return ease(Math.min(1,Math.max(0,(u-s)/Math.max(.25,en-s))))}
function cleanWin(w){if(!Array.isArray(w))return null;var a=Math.round(num(w[0],1,8,1)),b=Math.round(num(w[1],1,8,MOVE));if(b<a)b=a;return [a,b]}
function winLabel(w){return w[0]===w[1]?'count '+w[0]:'counts '+w[0]+'–'+w[1]}
function cntOpts(v){return [1,2,3,4,5,6,7,8].map(function(c){return '<option value="'+c+'"'+(c===v?' selected':'')+'>'+c+'</option>'}).join('')}

/* ---- formation tools: copy and paste a formation between 8-counts, mirror it, line athletes up, space them evenly ---- */
var fClip=null;
function fTargets(){return selMode&&sel.length?R.athletes.filter(function(a){return sel.indexOf(a.id)>=0}):R.athletes.slice()}
function fSnap(v,axis){return L.free?Math.round(v*2)/2:(axis==='x'?Math.round(v/1.5)*1.5:Math.round(v))}
function fDone(msg){markDirty();refreshTraffic();renderMat();flash(msg)}
function formationAct(act){var it=find(cur),e=it.e,ts=fTargets(),only=selMode&&sel.length;
  if(playing)pause();
  if(act==='fCopy'){fClip={pos:{},n:it.n+1};R.athletes.forEach(function(a,i){fClip.pos[a.id]=posOf(e,a,i).slice()});flash('Copied 8-count '+(it.n+1)+'’s formation. Open another 8-count and tap Paste.');return}
  if(act==='fPaste'){if(!fClip){flash('Tap Copy on an 8-count first.');return}var c=0;ts.forEach(function(a){var p=fClip.pos[a.id];if(p){e.pos[a.id]=p.slice();c++}});
    fDone('Pasted 8-count '+fClip.n+'’s formation'+(only?' for '+c+' selected athlete'+(c===1?'':'s'):'')+'.');return}
  if(act==='fMirror'){ts.forEach(function(a){var i=R.athletes.indexOf(a),p=posOf(e,a,i);e.pos[a.id]=[r2(54-p[0]),p[1]];if(e.bend&&e.bend[a.id])e.bend[a.id]=[-e.bend[a.id][0],e.bend[a.id][1]]});
    fDone('Mirrored '+(only?'the selected athletes':'the formation')+' left to right.');return}
  if(!only||sel.length<(act==='fSpace'?3:2)){flash('Select '+(act==='fSpace'?'3':'2')+' or more athletes first: tap Select athletes, then drag a box or tap them.');return}
  var pts=ts.map(function(a){return {a:a,p:posOf(e,a,R.athletes.indexOf(a)).slice()}}),xs=pts.map(function(o){return o.p[0]}),ys=pts.map(function(o){return o.p[1]});
  var sx=Math.max.apply(0,xs)-Math.min.apply(0,xs),sy=Math.max.apply(0,ys)-Math.min.apply(0,ys),horiz=sx>=sy;
  if(act==='fLine'){var avg=(horiz?ys:xs).reduce(function(s,v){return s+v},0)/pts.length,v2=fSnap(avg,horiz?'y':'x');
    pts.forEach(function(o){e.pos[o.a.id]=horiz?[o.p[0],v2]:[v2,o.p[1]]});fDone('Lined up '+pts.length+' athletes in a '+(horiz?'row':'column')+'.');return}
  if(act==='fSpace'){var k=horiz?0:1;pts.sort(function(m,n){return m.p[k]-n.p[k]});var lo=pts[0].p[k],hi=pts[pts.length-1].p[k],step=(hi-lo)/(pts.length-1);
    if(step<1){flash('Spread the selected athletes out a little first, so there’s room to space them.');return}
    pts.forEach(function(o,j){var q=o.p.slice();q[k]=r2(lo+step*j);e.pos[o.a.id]=q});fDone('Spaced '+pts.length+' athletes evenly, '+step.toFixed(1)+' ft apart.');return}}

/* ---- video for athletes: the mat playback drawn frame by frame with the song, recorded to a video file ---- */
var vexOpen=false,vex=null,vexOut=null;
var VEX_VBR=900000,VEX_ABR=96000,VEX_FPS=30,VEX_W=1280,VEX_H=720;
function vexMime(){if(typeof MediaRecorder==='undefined')return '';var list=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4;codecs=avc1,mp4a','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
  for(var i=0;i<list.length;i++){try{if(MediaRecorder.isTypeSupported(list[i]))return list[i]}catch(e){}}return ''}
function vexName(ext){var sp=R.athletes.find(function(x){return x.id===vex.spot});
  return String((R.name||'Routine')+(vex.label?' - '+vex.label:'')+(sp?' - '+sp.name.trim():'')).replace(/[\\\/:*?"<>|]+/g,'').trim()+'.'+ext}
function canShareFile(f){try{return !!(navigator.share&&navigator.canShare&&navigator.canShare({files:[f]}))}catch(e){return false}}
function vexPanel(){var r=vex,o=vexOut,secs=R.sections.map(function(s){return '<option value="'+s.id+'">'+esc(secLabel(s))+'</option>'}).join('');
  var body;
  if(r)body='<p class="note" id="vxStatus">'+esc(r.status||'Starting…')+'</p><span class="bar" style="width:100%"><i id="vxBar" style="width:'+Math.round(r.pct||0)+'%"></i></span><div class="ctl"><button class="btn small" data-act="vexCancel">Cancel</button></div>';
  else if(o)body='<p class="note"><b>Your video is ready</b>: '+esc(o.file.name)+' · '+(o.file.size/1048576).toFixed(1)+' MB'+(o.nosong?'. The song couldn’t load, so this one has no music.':'')+'</p>'
    +'<div class="ctl">'+(canShareFile(o.file)?'<button class="btn small primary" data-act="vexShare">Share…</button>':'')
    +'<button class="btn small'+(canShareFile(o.file)?'':' primary')+'" data-act="vexSave"'+(downloadsApi?'':' disabled')+'>Save</button><button class="btn small quiet" data-act="vexAgain">Make another</button><button class="btn small quiet" data-act="vexMenu">Close</button></div>'
    +(canShareFile(o.file)?H('Share opens your phone’s share menu: pick Messages, then your team’s group chat.'):'');
  else body='<div class="mrow"><label class="tog">Part <select class="field" id="vxRange"><option value="">Whole routine</option>'+secs+'</select></label>'
      +'<label class="tog">Highlight <select class="field" id="vxSpot"><option value="">Everyone</option>'+R.athletes.map(function(a){return '<option value="'+a.id+'"'+(L.spot===a.id?' selected':'')+'>'+esc(a.name)+'</option>'}).join('')+'</select></label></div>'
      +'<p class="note">The mat plays on the left with the counts on the right, set to the song. Pick an athlete to highlight their spot and where they move next.</p>'
      +'<div class="ctl"><button class="btn small primary" data-act="vexStart">Make video</button><button class="btn small quiet" data-act="vexMenu">Close</button></div>';
  return '<div class="pdfpanel" id="vexPanel"><span class="fl">Video for athletes</span>'+body+'</div>'}
function vexSet(msg,pct){if(!vex)return;vex.status=msg;if(pct!=null)vex.pct=pct;var s=document.getElementById('vxStatus');if(s)s.textContent=msg;var b=document.getElementById('vxBar');if(b&&pct!=null)b.style.width=Math.round(pct)+'%'}
function vexDone(blob,ext,nosong,how){var name=vexName(ext);vexOut={file:new File([blob],name,{type:blob.type}),nosong:nosong};vex=null;vexOpen=true;render();
  flash('Video ready ('+(blob.size/1048576).toFixed(1)+' MB'+(how?', '+how:'')+'). '+(canShareFile(vexOut.file)?'Tap Share to text it to the team.':'Tap Save, then text it to the team.'))}
function vexShare(){var o=vexOut;if(!o)return;navigator.share({files:[o.file],title:o.file.name.replace(/\.\w+$/,'')}).then(function(){flash('Video shared.')})
  .catch(function(e){if(e&&e.name==='AbortError')return;flash('Sharing isn’t allowed in this view. Tap Save instead, then send it from your phone.')})}
function vexSave(){var o=vexOut;if(!o)return;if(!downloadsApi){flash('Saving files isn’t available in this view. Open the playbook in claude.ai.');return}
  downloadsApi.save({filename:o.file.name,data:o.file}).then(function(res){flash(res&&res.status==='delivered'?'Video sent.':'Video saved. Text or AirDrop it to the team.')})
    .catch(function(e){var c=e&&e.code;flash(c==='declined'?'Video not saved.':'Saving the video didn’t work in this view.')})}
function vexCancel(){if(!vex)return;vex.cancel=true;if(vex.fast)return;if(!vex.iv){var v0=vex;vex=null;try{v0.au&&v0.au.pause()}catch(e){}try{v0.ac&&v0.ac.close()}catch(e){}render();flash('Video cancelled.')}}
function loadScript(src,test){return new Promise(function(res,rej){if(test())return res();var sc=document.createElement('script');sc.src=src;sc.onload=function(){test()?res():rej(new Error('load'))};sc.onerror=function(){rej(new Error('load'))};document.head.appendChild(sc)})}
var MUXER_SRC='lib/mp4-muxer.js';
function isAppleWebKit(){var u=navigator.userAgent||'';return /iPhone|iPad|iPod/.test(u)||(/Macintosh/.test(u)&&/Safari/.test(u)&&!/Chrome|Chromium|Edg/.test(u))}
/* pick the fast path's codecs: H.264 video plus AAC audio (Opus only off Apple devices, where Opus in MP4 may not play) */
function fastCodecs(chans,rate,needAudio){
  if(typeof VideoEncoder==='undefined'||typeof VideoFrame==='undefined')return Promise.resolve(null);
  var vlist=['avc1.4d0028','avc1.640028','avc1.42001f','avc1.42e01f'],out={};
  var tryV=function(i){if(i>=vlist.length)return Promise.resolve(null);var c={codec:vlist[i],width:VEX_W,height:VEX_H,bitrate:VEX_VBR,framerate:VEX_FPS,bitrateMode:'variable',avc:{format:'avc'}};
    return VideoEncoder.isConfigSupported(c).then(function(r){return r.supported?c:tryV(i+1)},function(){return tryV(i+1)})};
  return tryV(0).then(function(vc){if(!vc)return null;out.v=vc;if(!needAudio)return out;if(typeof AudioEncoder==='undefined'||typeof AudioData==='undefined')return null;
    var alist=[['mp4a.40.2','aac']].concat(isAppleWebKit()?[]:[['opus','opus']]);
    var tryA=function(i){if(i>=alist.length)return Promise.resolve(null);var c={codec:alist[i][0],sampleRate:rate,numberOfChannels:chans,bitrate:VEX_ABR};
      return AudioEncoder.isConfigSupported(c).then(function(r){return r.supported?{cfg:c,mux:alist[i][1]}:tryA(i+1)},function(){return tryA(i+1)})};
    return tryA(0).then(function(ac){if(!ac)return null;out.a=ac;return out})})}
function startVideo(){
  if(vex)return;
  var secId=(document.getElementById('vxRange')||{}).value||'',spotId=(document.getElementById('vxSpot')||{}).value||'';
  var tl=timeline(),g0=secId?tl.find(function(x){return x.s.id===secId}):null,a=g0?g0.start:0,b=g0?g0.end:Math.min(total(),(R.musicStart||0)+routineSecs()+1.5);
  if(playing)pause();vexOut=null;
  vex={a:a,b:b,spot:spotId,label:g0?secLabel(g0.s):'',cancel:false,fast:true,status:'Getting the song ready…',pct:0};render();
  var song=R.audio?fetch(BLOB(R.audio.id)).then(function(r){if(!r.ok)throw new Error('fetch');return r.arrayBuffer()}).then(function(ab){return decodeSongAt(ab,48000)}).catch(function(){return 'nosong'}):Promise.resolve(null);
  song.then(function(buf){if(!vex||vex.cancel){vex=null;render();flash('Video cancelled.');return}
    var nosong=buf==='nosong';if(nosong)buf=null;
    var chans=buf?Math.min(2,buf.numberOfChannels):2;
    return Promise.all([fastCodecs(chans,48000,!!buf),loadScript(MUXER_SRC,function(){return !!window.Mp4Muxer}).then(function(){return true},function(){return false})]).then(function(r){
      if(!vex||vex.cancel){vex=null;render();flash('Video cancelled.');return}
      if(r[0]&&r[1])return fastVideo(r[0],buf,chans,nosong);
      vex.fast=false;return realtimeVideo()})})
  .catch(function(e){if(vex&&vex.fast){vex.fast=false;realtimeVideo()}})}
function decodeSongAt(ab,rate){return new Promise(function(res,rej){var OC=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!OC){rej(new Error('nodecode'));return}
  var ctx=new OC(2,1,rate),done=false,ok=function(b){if(!done){done=true;res(b)}},bad=function(e){if(!done){done=true;rej(e||new Error('decode'))}};
  try{var p=ctx.decodeAudioData(ab,ok,bad);if(p&&p.then)p.then(ok,bad)}catch(e){bad(e)}})}
/* fast path: draw every frame as quickly as the device allows and encode it straight to MP4, no real-time playback */
function fastVideo(cod,buf,chans,nosong){
  var v=vex,a=v.a,b=v.b,W=VEX_W,H=VEX_H,cv=document.createElement('canvas');cv.width=W;cv.height=H;var g=cv.getContext('2d');
  var M=window.Mp4Muxer,err=null,fail=function(e){if(!err)err=e||new Error('encode')};
  var mux=new M.Muxer({target:new M.ArrayBufferTarget(),video:{codec:'avc',width:W,height:H,frameRate:VEX_FPS},
    audio:buf?{codec:cod.a.mux,numberOfChannels:chans,sampleRate:48000}:undefined,fastStart:'in-memory',firstTimestampBehavior:'offset'});
  var ve=new VideoEncoder({output:function(c,m){try{mux.addVideoChunk(c,m)}catch(e){fail(e)}},error:fail});ve.configure(cod.v);
  var ae=null;
  if(buf){ae=new AudioEncoder({output:function(c,m){try{mux.addAudioChunk(c,m)}catch(e){fail(e)}},error:fail});ae.configure(cod.a.cfg);
    var sr=buf.sampleRate,s0=Math.max(0,Math.floor(a*sr)),s1=Math.min(buf.length,Math.ceil(b*sr)),CH=[];for(var c=0;c<chans;c++)CH.push(buf.getChannelData(Math.min(c,buf.numberOfChannels-1)));
    for(var s=s0;s<s1;s+=4096){var n=Math.min(4096,s1-s),d=new Float32Array(n*chans);for(var c2=0;c2<chans;c2++)d.set(CH[c2].subarray(s,s+n),c2*n);
      var ad=new AudioData({format:'f32-planar',sampleRate:sr,numberOfFrames:n,numberOfChannels:chans,timestamp:Math.round((s-s0)/sr*1e6),data:d});ae.encode(ad);ad.close()}}
  var N=Math.max(1,Math.round((b-a)*VEX_FPS)),i=0,t0=performance.now();
  var step=function(){
    if(!vex||vex.cancel||err){try{ve.close()}catch(e){}try{ae&&ae.close()}catch(e){}
      if(err&&vex&&!vex.cancel){vex.fast=false;vexSet('Switching to the slower recorder…');realtimeVideo();return}
      vex=null;render();flash('Video cancelled.');return}
    var until=performance.now()+40;
    while(i<N&&performance.now()<until&&ve.encodeQueueSize<6){var t=a+i/VEX_FPS;drawVideoFrame(g,W,H,t,v.spot);
      var fr=new VideoFrame(cv,{timestamp:Math.round(i*1e6/VEX_FPS),duration:Math.round(1e6/VEX_FPS)});ve.encode(fr,{keyFrame:i%(VEX_FPS*2)===0});fr.close();i++}
    vexSet('Making the video… '+Math.round(i/N*100)+'%',i/N*95);
    if(i<N){setTimeout(step,ve.encodeQueueSize>=6?8:0);return}
    vexSet('Finishing…',97);
    Promise.all([ve.flush(),ae?ae.flush():null]).then(function(){if(!vex||vex.cancel)throw new Error('cancel');mux.finalize();
      var blob=new Blob([mux.target.buffer],{type:'video/mp4'});try{ve.close()}catch(e){}try{ae&&ae.close()}catch(e){}
      vexDone(blob,'mp4',nosong,'made in '+Math.max(1,Math.round((performance.now()-t0)/1000))+' s')})
    .catch(function(e){if(vex&&vex.cancel){vex=null;render();flash('Video cancelled.');return}fail(e);if(vex){vex.fast=false;vexSet('Switching to the slower recorder…');realtimeVideo()}})};
  vexSet('Making the video… 0%',0);step()}
/* fallback: play the mat in real time and record it with the song (older browsers) */
function realtimeVideo(){
  var mime=vexMime(),cv=document.createElement('canvas');if(!mime||!cv.captureStream){vex=null;render();flash('This browser can’t make videos. Try Chrome or Safari.');return}
  var v0=vex,a=v0.a,b=v0.b,W=VEX_W,H=VEX_H;cv.width=W;cv.height=H;var g=cv.getContext('2d'),stream=cv.captureStream(30),au=null,ac=null;
  if(R.audio){try{au=new Audio();au.crossOrigin='anonymous';au.src=BLOB(R.audio.id);au.preload='auto';var AC=window.AudioContext||window.webkitAudioContext;ac=new AC();var src=ac.createMediaElementSource(au),dest=ac.createMediaStreamDestination();
    src.connect(dest);dest.stream.getAudioTracks().forEach(function(t){stream.addTrack(t)})}catch(e){au=null}}
  var rec;try{rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:VEX_VBR,audioBitsPerSecond:VEX_ABR})}catch(e){vex=null;render();flash('Recording didn’t start in this browser. Try Chrome or Safari.');return}
  var chunks=[];rec.ondataavailable=function(ev){if(ev.data&&ev.data.size)chunks.push(ev.data)};
  Object.assign(vex,{rec:rec,au:au,ac:ac,fast:false,t0:0,status:'Getting the song ready…',pct:0});render();
  var clock=function(){return vex.au?vex.au.currentTime:a+(performance.now()-vex.t0)/1000};
  var finish=function(){if(!vex)return;var v=vex;try{if(v.rec.state!=='inactive')v.rec.stop()}catch(e){}try{v.au&&v.au.pause()}catch(e){}clearInterval(v.iv)};
  rec.onstop=function(){var v=vex;try{v.ac&&v.ac.close()}catch(e){}stream.getTracks().forEach(function(t){t.stop()});
    if(v.cancel){vex=null;flash('Video cancelled.');render();return}
    var type=/mp4/.test(mime)?'video/mp4':'video/webm',blob=new Blob(chunks,{type:type});vexDone(blob,type==='video/mp4'?'mp4':'webm',!!v.nosong,'')};
  var begin=function(){if(!vex)return;rec.start(1000);vex.t0=performance.now();
    vex.iv=setInterval(function(){if(!vex)return;var t=clock();drawVideoFrame(g,W,H,t,vex.spot);var pct=(t-a)/Math.max(.1,b-a)*100;
      vexSet('Recording… '+fmt(t-a)+' of '+fmt(b-a)+(vex.nosong?' (no song)':'')+'. Keep this screen open.',pct);if(t>=b-0.02||vex.cancel||(vex.au&&vex.au.ended))finish()},1000/30)};
  var noSong=function(){if(!vex||vex.iv)return;try{au.pause()}catch(e){}vex.au=null;vex.nosong=true;begin()};
  drawVideoFrame(g,W,H,a,v0.spot);
  if(au){au.addEventListener('loadedmetadata',function(){try{au.currentTime=a}catch(e){}},{once:true});
    var go=function(){if(!vex||vex.iv)return;var p=au.play();(p&&p.then?p:Promise.resolve()).then(function(){if(ac&&ac.resume)ac.resume();begin()}).catch(noSong)};
    au.addEventListener('error',noSong,{once:true});setTimeout(function(){if(vex&&!vex.iv&&!vex.cancel)noSong()},10000);
    if(au.readyState>=2){try{au.currentTime=a}catch(e){}go()}else au.addEventListener('canplay',function(){go()},{once:true})}
  else begin()}
function drawVideoFrame(g,W,H,t,spotId){
  var f=flat();if(!f.length)return;var b=beatAt(t),k=Math.max(0,Math.min(f.length-1,Math.floor(b/8))),count=b>=0?Math.min(8,Math.floor(b-8*Math.floor(b/8))+1):0,cur8=f[k],pos=posAtBeat(Math.max(0,b),f);
  var css=getComputedStyle(document.documentElement),col=function(v,d){return (css.getPropertyValue(v)||'').trim()||d};
  var fb=col('--f-body','sans-serif'),fd=col('--f-display','sans-serif');
  g.fillStyle='#0b0d16';g.fillRect(0,0,W,H);
  var mh=560,s=mh/42,mw=54*s,mx=36,my=66;
  g.fillStyle='#1e3a8f';g.fillRect(mx,my,mw,mh);
  g.strokeStyle='rgba(255,255,255,.22)';g.lineWidth=2;for(var j=1;j<9;j++){g.beginPath();g.moveTo(mx+j*6*s,my);g.lineTo(mx+j*6*s,my+mh);g.stroke()}
  g.setLineDash([6,6]);g.strokeStyle='rgba(255,255,255,.12)';for(var c=0;c<9;c++){g.beginPath();g.moveTo(mx+(3+c*6)*s,my);g.lineTo(mx+(3+c*6)*s,my+mh);g.stroke()}g.setLineDash([]);
  g.fillStyle='rgba(233,238,255,.75)';g.font='800 22px '+fd;g.textAlign='center';for(var n=0;n<9;n++)g.fillText(String(n+1),mx+(3+n*6)*s,my+mh+28);
  g.font='600 14px '+fb;g.fillStyle='rgba(233,238,255,.55)';g.fillText('BACK OF MAT',mx+mw/2,my-10);g.fillText('FRONT · JUDGES',mx+mw/2,my+mh+52);
  var roleCol={Flyer:col('--flyer','#e8457a'),Base:col('--base','#14a38b'),Backspot:col('--backspot','#f0a020'),Tumbler:col('--tumbler','#8b5cf6')},sp=spotId?R.athletes.find(function(a){return a.id===spotId}):null;
  if(sp&&k+1<f.length){var si=R.athletes.indexOf(sp),now=pos[sp.id],nx=posOf(f[k+1].e,sp,si);if(Math.hypot(nx[0]-now[0],nx[1]-now[1])>.5){
    g.setLineDash([10,8]);g.strokeStyle='rgba(255,224,102,.85)';g.lineWidth=3;g.beginPath();g.moveTo(mx+now[0]*s,my+now[1]*s);g.lineTo(mx+nx[0]*s,my+nx[1]*s);g.stroke();g.setLineDash([]);
    g.strokeStyle='rgba(255,224,102,.85)';g.lineWidth=2;g.beginPath();g.arc(mx+nx[0]*s,my+nx[1]*s,1.7*s,0,Math.PI*2);g.stroke()}}
  var many=R.athletes.length>20,r0=Math.min(1.7*s,26);
  R.athletes.forEach(function(a){var p=pos[a.id];if(!p)return;var x=mx+p[0]*s,y=my+p[1]*s,lit=sp===a;g.globalAlpha=sp&&!lit?.3:1;
    g.fillStyle=roleCol[a.role]||'#5b6282';g.beginPath();g.arc(x,y,lit?r0*1.25:r0,0,Math.PI*2);g.fill();g.lineWidth=lit?5:2;g.strokeStyle=lit?'#ffe066':'#ffffff';g.stroke();
    g.fillStyle='#ffffff';g.font='700 '+Math.round(r0*.75)+'px '+fb;g.textAlign='center';g.textBaseline='middle';g.fillText(initials(a.name),x,y+1);
    if(!many||lit){g.font=(lit?'700 ':'500 ')+(lit?18:13)+'px '+fb;g.fillStyle=lit?'#ffe066':'rgba(233,238,255,.9)';g.fillText(a.name.trim(),x,y+r0+14)}g.textBaseline='alphabetic'});
  g.globalAlpha=1;
  var px=mx+mw+40,pw=W-px-36;g.textAlign='left';
  g.fillStyle='#ffffff';g.font='800 30px '+fd;fitText(g,(R.name||'Routine').toUpperCase(),px,my+28,pw);
  g.fillStyle='#c9cfe8';g.font='600 20px '+fb;fitText(g,secLabel(cur8.s)+' · 8-count '+(k+1),px,my+64,pw);
  g.fillStyle='#ff5d8f';g.font='800 150px '+fd;g.fillText(b<0?'–':String(count),px,my+220);
  for(var q=0;q<8;q++){g.fillStyle=b>=0&&q===count-1?'#ff5d8f':(b>=0&&q<count-1?'#5b6282':'#2a3051');g.fillRect(px+q*(pw/8),my+250,pw/8-6,10)}
  g.font='600 19px '+fb;cur8.e.counts.forEach(function(txt,q){var on=b>=0&&q===count-1,y=my+300+q*34;g.fillStyle=on?'#ffffff':'#9aa1c4';g.font=(on?'700 ':'500 ')+'19px '+fb;g.fillText(String(q+1),px,y);fitText(g,txt||'–',px+30,y,pw-30)});
  if(sp){var si2=R.athletes.indexOf(sp);g.fillStyle='#ffe066';g.font='700 19px '+fb;fitText(g,'★ '+sp.name.trim()+': '+spotText(cur8.e,sp),px,my+586,pw)}
  else if(cur8.e.note){g.fillStyle='#9aa1c4';g.font='500 16px '+fb;fitText(g,cur8.e.note,px,my+586,pw)}
  var dur=Math.max(1,(R.musicStart||0)+routineSecs());g.fillStyle='#2a3051';g.fillRect(36,H-14,W-72,6);g.fillStyle='#ff5d8f';g.fillRect(36,H-14,(W-72)*Math.min(1,Math.max(0,t/dur)),6);
  var p0=D.profile||{};g.fillStyle='#9aa1c4';g.font='600 16px '+fb;g.fillText((p0.program?p0.program+' · ':'')+fmt(t)+' / '+fmt(dur),36,40)}
function fitText(g,txt,x,y,w){txt=String(txt);if(g.measureText(txt).width<=w){g.fillText(txt,x,y);return}while(txt.length>1&&g.measureText(txt+'…').width>w)txt=txt.slice(0,-1);g.fillText(txt+'…',x,y)}

/* ---- saving into the page itself ---- */
function buildDoc(){
  var reset='';try{var hs=document.head&&document.head.querySelector('style');reset=hs?hs.textContent:''}catch(e){}
  if(!reset)reset=DEFAULT_RESET;
  var SC='<'+'/script>',ST='<'+'/style>';
  var css=document.getElementById('app-css').textContent,js=document.getElementById('app-js').textContent;
  var data=JSON.stringify(D).replace(/</g,'\\u003c');
  return '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>'+reset+ST+'</head><body>'
    +'<title>'+PAGE_TITLE+'</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n<link rel="stylesheet" href="'+FONT_HREF.replace(/&/g,'&amp;')+'">\n'
    +'<style id="app-css">'+css+ST+'\n<div id="app"></div>\n<script type="application/json" id="state">'+data+SC+'\n<script id="app-js">'+js+SC+'\n</body></html>';
}
function save(){
  if(sync.on){flushSync();return}
  if(!artApi||saving||!dirty)return;commitBurst();saving=true;updateStatus();
  var prev=D.savedAt;D.savedAt=Date.now();
  artApi.publish(buildDoc()).then(function(){dirty=false;flash('Saved.');if(mediaMsg&&/Saving…$/.test(mediaMsg.text))setMsg(null)})
  .catch(function(err){D.savedAt=prev;var c=err&&err.code;
    if(c==='not_granted'||c==='not_writer'){readOnly=true;flash('You can view this playbook but not save to it. Your edits stay on this device.')}
    else if(c==='conflict')flash('A newer version was saved somewhere else, so the page is loading it.');
    else flash('Couldn’t save. Check your connection and tap Save again.')})
  .then(function(){saving=false;updateStatus()});
}
if(window.claude&&typeof window.claude.use==='function'){
  window.claude.use('artifact').then(function(a){artApi=a;updateStatus()}).catch(function(){});
  window.claude.use('db').then(function(db){if(db)startSync(db)}).catch(function(){});
  window.claude.use('user').then(function(u){if(u&&u.can)u.can('data.write').then(function(w){if(w===false){readOnly=true;updateStatus()}})}).catch(function(){});
  window.claude.use('downloads').then(function(a){downloadsApi=a}).catch(function(){});
  window.claude.use('assets').then(function(a){if(!a)return;assetsApi=a;if(!playing&&!job){var fe=document.activeElement&&document.activeElement.id;render();if(fe){var el=document.getElementById(fe);if(el)el.focus()}}}).catch(function(){});
}
window.addEventListener('keydown',function(e){
  var typing=e.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
  if((e.metaKey||e.ctrlKey)&&e.key==='s'){e.preventDefault();save();return}
  if(!typing&&(e.metaKey||e.ctrlKey)&&(e.key==='z'||e.key==='Z')){e.preventDefault();if(e.shiftKey)redo();else undo();return}
  if(!typing&&(e.metaKey||e.ctrlKey)&&e.key==='y'){e.preventDefault();redo();return}
  if(e.key===' '&&e.target===document.body&&view==='editor'&&!RUN){e.preventDefault();play()}});

/* =====================================================================================================
   BETA: features that only exist in the standalone app
   - athlete live view (team link, no account), coach accounts, athlete links and Send to team
   - per-device changes: tablet layout, run-through mode, tap-to-place, long-press / right-click athlete menu,
     pinch zoom on the mat, keyboard shortcuts, big mat
   ===================================================================================================== */
function lsGetB(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
function lsSetB(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
var ACC=ENV.account||null;

/* ---------- Account page: who's signed in, coaches and invites ---------- */
var acctInfo=null,acctBusy=false;
function loadAcct(){if(!ACC||acctBusy)return;acctBusy=true;ACC.members().then(function(x){acctInfo=x}).catch(function(){acctInfo={members:[],invites:[],err:true}}).then(function(){acctBusy=false;if(view==='account')render()})}
function accountCloudHtml(){
  if(!ACC)return '<div class="card pcard"><div class="phead"><h2>This device only</h2></div><p class="note">This copy isn’t signed in, so routines save on this device and nothing is shared. The online beta has coach sign-in, shared playbooks and athlete links.</p></div>';
  if(!acctInfo)loadAcct();
  var owner=ACC.role==='owner',info=acctInfo||{members:[],invites:[]};
  return '<div class="card pcard"><div class="phead"><h2>Signed in</h2><span class="sub">'+esc(ACC.email)+' · '+esc(ACC.role==='owner'?'Owner':'Coach')+'</span></div>'
   +'<div class="ctl"><button class="btn small" data-act="signOut">Sign out</button></div></div>'
   +'<div class="card pcard"><div class="phead"><h2>Coaches</h2><span class="sub">'+esc(ACC.programName||'')+'</span></div>'
   +(acctInfo?'<ul class="vlist">'+info.members.map(function(m){return '<li class="vitem"><b>'+esc(m.email||'Coach')+'</b><span class="sub">'+(m.role==='owner'?'Owner':'Coach')+'</span>'
       +(owner&&m.role!=='owner'?'<button class="btn small quiet" data-act="memRemove" data-id="'+esc(m.user_id)+'" style="margin-left:auto">Remove</button>':'')+'</li>'}).join('')
     +info.invites.map(function(i){return '<li class="vitem"><b>'+esc(i.email)+'</b><span class="sub">Invited · joins the first time they sign in</span>'+(owner?'<button class="btn small quiet" data-act="invCancel" data-id="'+esc(i.email)+'" style="margin-left:auto">Cancel</button>':'')+'</li>'}).join('')+'</ul>'
     :'<p class="note">Loading…</p>')
   +(owner?'<div class="mrow"><input class="field" id="invEmail" type="email" inputmode="email" autocomplete="off" placeholder="Coach’s email" style="flex:1 1 220px"><button class="btn small primary" data-act="invite">Invite coach</button></div>'
     +H('Invited coaches create an account (or sign in) with that email and land straight in this playbook. Coaches can edit every routine; only owners can invite or remove coaches.')
     :'<p class="note">Only the program owner can invite or remove coaches.</p>')+'</div>'}

/* ---------- Team page: athlete link ---------- */
var linkCache={},linkBusy={},qrOpen=false;
function loadLinks(tid){if(!ACC||linkBusy[tid])return;linkBusy[tid]=true;ACC.links(tid).then(function(l){linkCache[tid]=l[0]?l[0].token:''}).catch(function(){linkCache[tid]=''}).then(function(){linkBusy[tid]=false;if(view==='team')render()})}
function teamMsg(t,url){return 'Here’s the live link to our routines for '+(t.name||'the team')+': '+url+' Pick your name to see your spot and counts with the music. It updates whenever coach makes a change.'}
function qrSvg(text){if(typeof window.qrcode!=='function')return '';try{var q=window.qrcode(0,'M');q.addData(text);q.make();return q.createSvgTag({cellSize:5,margin:2,scalable:true})}catch(e){return ''}}
function athleteLinkCard(t){
  if(!ACC)return '<div class="card pcard" id="athLink"><div class="phead"><h2>Athlete link</h2></div><p class="note">Athlete links need the online version: sign in, and every athlete gets a live view of their part from one team link.</p></div>';
  if(!(t.id in linkCache))loadLinks(t.id);
  var tok=linkCache[t.id],url=tok?ACC.linkUrl(tok):'',msg=url?teamMsg(t,url):'';
  var body=tok===undefined?'<p class="note">Loading…</p>'
    :!tok?'<p class="note">One link for the whole team. Athletes open it, pick their name, and see their spot and counts with the music. No sign-up, view only, and it updates live when you change the routine.</p><div class="ctl"><button class="btn small primary" data-act="tlNew">Create athlete link</button></div>'
    :'<div class="linkrow"><input class="field" id="tlUrl" readonly value="'+esc(url)+'" aria-label="Athlete link"><button class="btn small" data-act="tlCopy">Copy</button></div>'
     +'<div class="ctl sendrow">'+(navigator.share?'<button class="btn small primary" data-act="tlShare">Send to team…</button>':'')
     +'<a class="btn small'+(navigator.share?'':' primary')+'" href="sms:?&body='+encodeURIComponent(msg)+'">Text it</a>'
     +'<a class="btn small" href="mailto:?subject='+encodeURIComponent((t.name||'Team')+' routines: live link')+'&body='+encodeURIComponent(msg)+'">Email it</a>'
     +'<button class="btn small" data-act="tlQR" aria-expanded="'+qrOpen+'">'+(qrOpen?'Hide QR code':'Show QR code')+'</button>'
     +'<a class="btn small quiet" href="'+esc(url)+'" target="_blank" rel="noopener">Preview</a></div>'
     +(qrOpen?'<div class="qrbox">'+qrSvg(url)+'<span class="note">Put this on the gym wall or a slide: athletes scan it with their camera.</span></div>':'')
     +'<div class="ctl"><button class="btn small quiet" data-act="tlNew">Make a new link</button><button class="btn small quiet" data-act="tlOff">Turn off link</button></div>'
     +H('Anyone with the link can see this team’s routines (names, spots, counts and the song), never your notes, skills or other teams. Make a new link to shut the old one off, for example at the end of the season.');
  return '<div class="card pcard" id="athLink"><div class="phead"><h2>Athlete link</h2>'+(tok?'<span class="sub">Live</span>':'')+'</div>'+body+'</div>'}

function betaPageAct(act,b,id){
  switch(act){
  case 'signOut':if(ACC)ACC.signOut();return true;
  case 'invite':{var em=(document.getElementById('invEmail')||{}).value||'';ACC.invite(em,'coach').then(function(){flash('Invite saved. Send them this site’s address: they create an account with '+em.trim()+' and land in this playbook.');acctInfo=null;loadAcct()}).catch(function(e){flash(e&&e.code==='bad_email'?'That email doesn’t look right.':'Only the program owner can invite coaches.')});return true}
  case 'invCancel':ACC.cancelInvite(id).then(function(){acctInfo=null;loadAcct()}).catch(function(){flash('Couldn’t cancel that invite.')});return true;
  case 'memRemove':if(!confirmTap(b,'mem'+id))return true;ACC.removeMember(id).then(function(){flash('Coach removed.');acctInfo=null;loadAcct()}).catch(function(){flash('Couldn’t remove that coach.')});return true;
  case 'tlNew':{var t=teamById(L.pTeam);if(!t)return true;if(linkCache[t.id]&&!confirmTap(b,'tlNew'))return true;
    ACC.newLink(t.id).then(function(k){linkCache[t.id]=k;render();flash('Athlete link ready. Send it to the team.')}).catch(function(){flash('Couldn’t make the link. Check your connection.')});return true}
  case 'tlOff':{var t2=teamById(L.pTeam);if(!t2||!confirmTap(b,'tlOff'))return true;ACC.disableLinks(t2.id).then(function(){linkCache[t2.id]='';qrOpen=false;render();flash('Link turned off. Athletes who open it now see “This link is turned off”.')}).catch(function(){flash('Couldn’t turn the link off.')});return true}
  case 'tlCopy':{var u=document.getElementById('tlUrl');if(!u)return true;var done=function(){flash('Link copied.')};
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u.value).then(done,function(){u.select();try{document.execCommand('copy');done()}catch(e){}});else{u.select();try{document.execCommand('copy');done()}catch(e){}}return true}
  case 'tlShare':{var t3=teamById(L.pTeam),tk=t3&&linkCache[t3.id];if(!tk)return true;var url=ACC.linkUrl(tk);
    navigator.share({title:(t3.name||'Team')+' routines',text:teamMsg(t3,'').replace(/: +Pick/,'. Pick'),url:url}).catch(function(e){if(e&&e.name!=='AbortError')flash('Sharing isn’t available here. Use Copy, Text it or Email it.')});return true}
  case 'tlQR':qrOpen=!qrOpen;render();return true;
  case 'sendTeam':{moreOpen=false;gearOpen=false;var tid=R.teamId||(teamOf(R)||{}).id;if(!tid){flash('Link this routine to a team first (Setup › Team).');render();return true}
    L.pTeam=tid;goView('team');setTimeout(function(){var c=document.getElementById('athLink');if(c)c.scrollIntoView({behavior:'smooth',block:'start'})},60);return true}
  case 'runOpen':runOpen(false);return true;
  case 'bigMat':if(L.size.mat==='full'){L.size.mat=L.size.matBefore&&L.size.matBefore!=='full'?L.size.matBefore:'half'}else{L.size.matBefore=L.size.mat;L.size.mat='full'}saveLayout();flip(render);return true;
  case 'kbdHelp':kbdOpen=!kbdOpen;gearOpen=false;render();return true;
  case 'zoomReset':zoomTo(1);return true;
  }
  return false}

/* ---------- athlete live view ---------- */
var ATH={pick:null,pending:null,saved:false};
function athFeedData(f){
  var ord=Array.isArray(f.order)?f.order:[];
  var rs=(f.routines||[]).map(function(r){var o=clone(r);o.versions=[];o.name=o.name||'Routine';if(!o.athletes)o.athletes=[];if(!o.sections||!o.sections.length)o.sections=[];return o})
    .filter(function(r){return r.sections&&r.sections.length}).map(fixRoutine);
  rs.sort(function(a,b){var x=ord.indexOf(a.id),y=ord.indexOf(b.id);return (x<0?1e9:x)-(y<0?1e9:y)});
  return {v:3,savedAt:0,editedAt:0,cur:rs[0]?rs[0].id:null,routines:rs,views:[],templates:[],teams:[],profile:{program:f.programName||'',logo:f.logo?{id:f.logo}:null}}}
function athAll(){var seen={},out=[];D.routines.forEach(function(r){r.athletes.forEach(function(a){if(!seen[a.id]){seen[a.id]=1;out.push(a)}})});return out.sort(function(a,b){return String(a.name).localeCompare(String(b.name))})}
function athPickKey(){return 'cpbeta-athpick-'+ENV.athlete.token}
/* what the athlete actually sees; a new stamp with the same content (an edit elsewhere in the program) changes nothing on screen */
function athSig(f){return JSON.stringify([f.routines,f.order,f.team,f.programName,f.logo])}
var athLastSig=ATHLETE?athSig(ENV.athlete.feed||{}):'';
function athApply(f){var sg=athSig(f);if(sg===athLastSig)return;athLastSig=sg;
  var keepR=R&&R.id,keepT=T,keepAudio=R&&R.audio&&R.audio.id;D=athFeedData(f);
  if(!D.routines.length){R=null;render();return}
  R=D.routines.find(function(r){return r.id===keepR})||D.routines[0];D.cur=R.id;var f0=flat();if(!f0.some(function(x){return x.e.id===cur}))cur=f0[0].e.id;
  if((R.audio&&R.audio.id)!==keepAudio||R.id!==keepR)loadAudio();T=Math.min(keepT,total());render();flash('Updated: your coach just changed the routine.')}
function athUpdate(f){if(playing||RUN){ATH.pending=f;return}athApply(f)}
function athSwitchRoutine(id){var r=D.routines.find(function(x){return x.id===id});if(!r)return;if(playing)pause();R=r;D.cur=r.id;cur=flat()[0].e.id;T=0;loadAudio();render()}
function athPart(r,aid){return withR(r,function(){var f=flat(),i=R.athletes.findIndex(function(z){return z.id===aid});if(i<0)return '<p class="note">You’re not in this routine.</p>';var ath=R.athletes[i];
  var blocks=[];f.forEach(function(x,n){var p=posOf(x.e,ath,i),bl=blocks[blocks.length-1];
    if(bl&&Math.abs(p[0]-bl.p[0])<.01&&Math.abs(p[1]-bl.p[1])<.01)bl.rows.push({x:x,n:n});else blocks.push({p:p,from:bl?bl.p:null,bend:(x.e.bend||{})[aid]||null,rows:[{x:x,n:n}]})});
  return '<ol class="plist">'+blocks.map(function(bl){var r0=bl.rows[0],r1=bl.rows[bl.rows.length-1],where=spotText(r0.x.e,ath).split(' · ').slice(0,2).join(' · ');
    var range=bl.rows.length>1?'8-counts '+(r0.n+1)+'–'+(r1.n+1):'8-count '+(r0.n+1);
    var mv=bl.from?'Move here on '+winLabel(moveWin(r0.x.e,aid))+' of 8-count '+(r0.n+1):'Starting spot';
    return '<li class="pblock" data-n="'+r0.n+'">'+moveMat(r,r0.x.e,aid,bl.from,bl.bend)
      +'<div class="pbody"><div class="phd"><b>'+esc(where)+'</b><span class="sub">'+range+' · '+fmt(eightStart(r0.n))+'</span><span class="pmove'+(bl.from?' go':'')+'">'+esc(mv)+'</span></div>'
      +'<ol class="pcounts">'+bl.rows.map(function(o){var e=o.x.e,g=groupOf(ath),bx=g&&(e.build||{})[g.id];
        return '<li><button class="pn pgo" data-act="athGo" data-id="'+o.n+'" aria-label="Play from 8-count '+(o.n+1)+'">'+(o.n+1)+'</button><span class="etxt"><span class="lbl">'+esc(secLabel(o.x.s))+' · '+fmt(eightStart(o.n))+'</span><span class="sum">'+esc(summary(e))+'</span>'
          +(bx&&bx.skill?'<span class="spotline">'+esc(g.name+' '+bx.skill+(bx.count?' on '+bx.count:''))+'</span>':'')+(e.note?'<span class="bline">'+esc(e.note)+'</span>':'')+'</span></li>'}).join('')+'</ol></div></li>'}).join('')+'</ol>'})}
function renderAthlete(){
  if(app.contains(transportEl))document.body.appendChild(transportEl);
  applyTheme();var A=ENV.athlete,f=A.feed||{},p=D.profile||{};
  var head='<header class="mtop"><span class="mbrand">'+(p.logo?'<img class="plogo" src="'+esc(BLOB(p.logo.id))+'" alt="">':CB_LOGO)+'</span><b class="mtitle">'+esc((f.team&&f.team.name)||'Team')+'</b>'
    +'<span class="livepill'+(A.offline?' off':'')+'">'+(A.offline?'Offline copy':'● Live')+'</span>'+(ATH.pick?'<button class="mib" data-act="athMenu" aria-label="Options">⋯</button>':'')+'</header>';
  if(!D.routines.length){transportEl.hidden=true;app.innerHTML='<div class="mapp">'+head+'<div class="mpanel"><p class="empty">No routines for '+esc((f.team&&f.team.name)||'this team')+' yet. Check back after your coach adds one.</p></div></div>';return}
  var all=athAll(),me=ATH.pick&&all.find(function(a){return a.id===ATH.pick});
  if(!me){transportEl.hidden=true;
    app.innerHTML='<div class="mapp">'+head+'<div class="mpanel athpick"><h2 class="ptitle">Who are you?</h2><p class="note">'+esc(p.program||'')+'</p><div class="pickgrid">'
      +all.map(function(a){return '<button class="pickath" data-act="athPick" data-id="'+a.id+'"><span class="sw" style="background:var(--'+String(a.role).toLowerCase()+')">'+esc(initials(a.name))+'</span><b>'+esc(a.name)+'</b><span class="sub">'+esc(a.role)+'</span></button>'}).join('')+'</div></div></div>';return}
  transportEl.hidden=false;
  if(!R.athletes.some(function(a){return a.id===me.id})){var rr=D.routines.find(function(r){return r.athletes.some(function(a){return a.id===me.id})});if(rr&&rr!==R){R=rr;D.cur=rr.id;cur=flat()[0].e.id;T=0;loadAudio()}}
  L.spot=me.id;
  var chips=D.routines.length>1?'<div class="ctl rchips">'+D.routines.map(function(r){return '<button class="chip'+(r===R?' on':'')+'" data-act="athRoutine" data-id="'+r.id+'">'+esc(r.name)+'</button>'}).join('')+'</div>':'';
  var menu=athMenuOpen?sheetHtml('<div class="mmenu"><b>'+esc(me.name)+'</b><button class="mrowbtn" data-act="athSwitch">Not you? Pick your name again</button>'
      +'<button class="mrowbtn" data-act="athOffline">'+(ATH.saved?'✓ Saved for offline':'Save for offline (gyms with bad signal)')+'</button><button class="mrowbtn" data-act="runOpen">Full-screen run-through</button></div>','menu','Options'):'';
  app.innerHTML='<div class="mapp athapp">'+head+'<div class="athsub"><b>'+esc(R.name)+'</b><span class="sub">You: '+esc(me.name)+' · '+esc(me.role)+'</span></div>'+chips
   +'<div class="mstage" id="mstage"><div data-slot="mat"></div></div><div data-slot="transport"></div>'
   +'<div class="mpanel" id="mpanel"><div class="ctl"><button class="btn small primary" data-act="runOpen">⤢ Full-screen run-through</button><button class="btn small" data-act="athOffline">'+(ATH.saved?'✓ Saved for offline':'Save for offline')+'</button></div>'
   +'<h3 class="fl">Your part</h3>'+athPart(R,me.id)+H('Tap an 8-count number to play from there. Swipe the mat to step through 8-counts.')+'</div><div data-slot="stash" hidden></div>'+menu+'</div>';
  endSheets();
  if(!matCtl){matCtl=document.createElement('div');matCtl.className='matctl';Array.prototype.slice.call(matWrap.children).forEach(function(c){if(c.id!=='frontBox'&&c.id!=='matBox')matCtl.appendChild(c)})}
  app.querySelector('[data-slot="mat"]').replaceWith(matWrap);app.querySelector('[data-slot="transport"]').replaceWith(transportEl);app.querySelector('[data-slot="stash"]').appendChild(matCtl);
  renderMat();updateLive(true)}
var athMenuOpen=false;
function athAct(act,b,id){
  switch(act){
  case 'athPick':ATH.pick=id;lsSetB(athPickKey(),id);render();return true;
  case 'athSwitch':ATH.pick=null;athMenuOpen=false;lsSetB(athPickKey(),null);if(playing)pause();render();return true;
  case 'athMenu':athMenuOpen=!athMenuOpen;render();return true;
  case 'closeSheet':athMenuOpen=false;render();return true;
  case 'athRoutine':athSwitchRoutine(id);return true;
  case 'athGo':{var n=+id,f=flat();if(f[n]){cur=f[n].e.id;seek(eightStart(n));if(!playing)play();window.scrollTo(0,0);var ms=document.getElementById('mstage');if(ms)ms.scrollIntoView({block:'start'})}return true}
  case 'athOffline':{athMenuOpen=false;var urls=D.routines.filter(function(r){return r.audio}).map(function(r){return BLOB(r.audio.id)});
    if(!('caches' in window)){flash('This browser can’t save for offline. Keep this page open instead.');render();return true}
    caches.open('cp-media').then(function(c){return Promise.all(urls.map(function(u){return c.match(u).then(function(m){return m||fetch(u,{mode:'cors'}).then(function(r){if(r.ok)return c.put(u,r)})})}))})
      .then(function(){ATH.saved=true;render();flash('Saved. This routine and its music now open even without signal. Add this page to your home screen to find it fast.')})
      .catch(function(){flash('Couldn’t save the music for offline. Try again on Wi-Fi.')});return true}
  case 'runOpen':athMenuOpen=false;runOpen(false);return true;
  }
  return false}
if(ATHLETE){ATH.pick=lsGetB('cpbeta-athpick-'+ENV.athlete.token,null);ENV.athlete.onUpdate=athUpdate;
  setInterval(function(){if(ATH.pending&&!playing&&!RUN){var f=ATH.pending;ATH.pending=null;athApply(f)}},1000);
  if('caches' in window)caches.open('cp-media').then(function(c){return c.keys()}).then(function(k){var have=k.map(function(q){return q.url});ATH.saved=D.routines.some(function(r){return r.audio})&&D.routines.filter(function(r){return r.audio}).every(function(r){return have.indexOf(BLOB(r.audio.id))>=0});if(ATH.saved)render()}).catch(function(){})}

/* ---------- run-through mode: the mat and counts full screen, for practice, a projector, or athletes at home ---------- */
var RUN=null;
function runOpen(auto){if(RUN)return;if(!flat().length)return;
  var ov=document.createElement('div');ov.className='runov';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Run-through');
  ov.innerHTML='<canvas width="1280" height="720" aria-label="Mat and counts"></canvas>'
    +'<div class="runbar"><button class="rbtn" data-r="close" aria-label="Close run-through">✕</button><button class="rbtn" data-r="prev" aria-label="Previous 8-count">⏮</button><button class="rbtn play" data-r="play" aria-label="Play or pause">▶</button><button class="rbtn" data-r="next" aria-label="Next 8-count">⏭</button>'
    +'<select class="rsel" aria-label="Highlight an athlete"><option value="">Highlight: no one</option>'+R.athletes.map(function(a){return '<option value="'+a.id+'"'+(L.spot===a.id?' selected':'')+'>'+esc(a.name)+'</option>'}).join('')+'</select></div>'
    +'<p class="runhint">Turn your phone sideways for the biggest view</p>';
  document.body.appendChild(ov);document.body.classList.add('running');
  var cv=ov.querySelector('canvas'),g=cv.getContext('2d'),sel0=ov.querySelector('.rsel'),pb=ov.querySelector('.play');
  RUN={ov:ov,auto:!!auto,raf:0,spot:L.spot||'',idle:0};
  /* redraw every frame while playing; while paused, only when something changed (and twice a second for live updates), so an open run-through doesn't drain the battery */
  var lastKey='',lastAt=0;
  var draw=function(now){if(!RUN)return;now=now||performance.now();var key=T+'|'+RUN.spot+'|'+cur+'|'+(R&&R.id)+'|'+playing;
    if(playing||key!==lastKey||now-lastAt>500){lastKey=key;lastAt=now;drawVideoFrame(g,1280,720,T,RUN.spot);var pt=playing?'❚❚':'▶';if(pb.textContent!==pt)pb.textContent=pt}
    RUN.raf=requestAnimationFrame(draw)};draw();
  var step=function(d){var it=find(cur),n=Math.max(0,Math.min(it.list.length-1,it.n+d));cur=it.list[n].e.id;seek(eightStart(n))};
  ov.addEventListener('click',function(e){var b=e.target.closest('[data-r]');if(!b){if(e.target===cv)play();showBar();return}var r=b.dataset.r;
    if(r==='close')runClose();else if(r==='play')play();else if(r==='prev')step(-1);else if(r==='next')step(1);showBar()});
  sel0.addEventListener('change',function(){RUN.spot=sel0.value;if(!ATHLETE){L.spot=sel0.value||null;saveLayout()}});
  var showBar=function(){ov.classList.remove('idle');clearTimeout(RUN.idle);RUN.idle=setTimeout(function(){if(RUN&&playing)ov.classList.add('idle')},2500)};
  ov.addEventListener('pointermove',showBar);showBar();
  try{if(!auto&&ov.requestFullscreen)ov.requestFullscreen().catch(function(){})}catch(e){}
  try{if(screen.orientation&&screen.orientation.lock&&!TABLET)screen.orientation.lock('landscape').catch(function(){})}catch(e){}}
function runClose(){if(!RUN)return;cancelAnimationFrame(RUN.raf);clearTimeout(RUN.idle);var ov=RUN.ov;RUN=null;
  try{if(document.fullscreenElement)document.exitFullscreen().catch(function(){})}catch(e){}
  try{if(screen.orientation&&screen.orientation.unlock)screen.orientation.unlock()}catch(e){}
  ov.remove();document.body.classList.remove('running');render()}
/* phones: turning sideways in a routine opens the run-through; turning back closes it */
function isLandscape(){try{if(screen.orientation&&screen.orientation.type)return /landscape/.test(screen.orientation.type)}catch(e){}return window.innerWidth>window.innerHeight&&!(document.activeElement&&/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName))}
function orientCheck(){if(!PHONE||TABLET)return;var land=isLandscape(),ed=view==='editor'||(ATHLETE&&ATH.pick);
  if(land&&ed&&!RUN&&!sheetOpen)runOpen(true);else if(!land&&RUN&&RUN.auto)runClose()}
if(screen.orientation&&screen.orientation.addEventListener)screen.orientation.addEventListener('change',function(){setTimeout(orientCheck,120)});
else window.addEventListener('orientationchange',function(){setTimeout(orientCheck,200)});

/* ---------- mat: tap to pick up and tap to place, long-press / right-click menu, pinch zoom ---------- */
var pickId=null,downAt=null,lp=null,ctxm=null;
function pickName(){var a=R.athletes.find(function(x){return x.id===pickId});return a?a.name.trim():''}
function decorateMat(){var m=document.getElementById('mat');if(!m)return;
  Array.prototype.forEach.call(m.querySelectorAll('.dot.picked'),function(d){d.classList.remove('picked')});
  if(pickId){var d=m.querySelector('.dot[data-id="'+pickId+'"]');if(d)d.classList.add('picked');else pickId=null}
  var zb=document.getElementById('zoomReset');if(zb)zb.hidden=!(Z.s>1.01)}
function placePicked(cx,cy){if(!pickId)return false;var svg=document.getElementById('mat');if(!svg)return false;var pt=svg.createSVGPoint();pt.x=cx;pt.y=cy;var q=pt.matrixTransform(svg.getScreenCTM().inverse());
  if(q.x<-1||q.x>55||q.y<-1||q.y>43)return false;var it=find(cur),id=pickId,np=snapPos(q.x,q.y);it.e.pos[id]=np;var nm=pickName();pickId=null;markDirty();refreshTraffic();renderMat();flash(nm+' moved.');return true}
app.addEventListener('pointerdown',function(e){downAt={x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId};if(ctxm&&!(e.target.closest&&e.target.closest('.ctxm')))closeCtx()},true);
/* long-press an athlete (touch) or right-click (mouse) for their options */
app.addEventListener('pointerdown',function(e){if(ATHLETE||playing)return;var d=e.target.closest&&e.target.closest('#mat .dot');if(!d||e.button>0)return;
  clearTimeout(lp&&lp.t);lp={id:d.dataset.id,x:e.clientX,y:e.clientY,t:setTimeout(function(){if(!lp)return;var L0=lp;lp=null;
    if(drag&&drag.id===L0.id){var it=find(cur);Object.keys(drag.start).forEach(function(k){it.e.pos[k]=drag.start[k]});drag=null;showGuide(null);renderMat()}
    if(navigator.vibrate)try{navigator.vibrate(12)}catch(x){}openCtx(L0.id,L0.x,L0.y)},520)}});
window.addEventListener('pointermove',function(e){if(lp&&Math.hypot(e.clientX-lp.x,e.clientY-lp.y)>9){clearTimeout(lp.t);lp=null}},true);
window.addEventListener('pointerup',function(){if(lp){clearTimeout(lp.t);lp=null}},true);
app.addEventListener('contextmenu',function(e){var d=e.target.closest&&e.target.closest('#mat .dot');if(!d||ATHLETE)return;e.preventDefault();if(lp){clearTimeout(lp.t);lp=null}
  if(drag){var it=find(cur);Object.keys(drag.start).forEach(function(k){it.e.pos[k]=drag.start[k]});drag=null;showGuide(null);renderMat()}if(!ctxm)openCtx(d.dataset.id,e.clientX,e.clientY)});
function openCtx(id,x,y){closeCtx();var a=R.athletes.find(function(q){return q.id===id});if(!a)return;var it=find(cur),prev=it.n>0?it.list[it.n-1].e:null,i=R.athletes.indexOf(a),bend=(it.e.bend||{})[id];
  var same=prev&&(function(){var p=posOf(prev,a,i),q=posOf(it.e,a,i);return Math.abs(p[0]-q[0])<.01&&Math.abs(p[1]-q[1])<.01})();
  var m=document.createElement('div');m.className='ctxm';m.setAttribute('role','menu');
  m.innerHTML='<b>'+esc(a.name)+'</b><span class="sub">'+esc(a.role)+' · '+esc(spotText(it.e,a).split(' · ').slice(0,2).join(' · '))+'</span>'
    +'<button role="menuitem" data-c="pick">Pick up, then tap where they go</button>'
    +'<button role="menuitem" data-c="spot">'+(L.spot===id?'Turn off spotlight':'★ Spotlight '+esc(a.name.trim()))+'</button>'
    +(prev&&!same?'<button role="menuitem" data-c="stay">Stay where they were last 8-count</button>':'')
    +(bend?'<button role="menuitem" data-c="straight">Straighten their path</button>':'')
    +'<button role="menuitem" data-c="sel">Select (to move several together)</button>';
  document.body.appendChild(m);ctxm={el:m,id:id};
  var w=m.offsetWidth,h=m.offsetHeight;m.style.left=Math.max(8,Math.min(window.innerWidth-w-8,x+4))+'px';m.style.top=Math.max(8,Math.min(window.innerHeight-h-8,y+4))+'px';
  var first=m.querySelector('button');if(first)first.focus();
  m.addEventListener('click',function(e){var b=e.target.closest('[data-c]');if(!b)return;var c=b.dataset.c;closeCtx();
    if(c==='pick'){pickId=id;renderMat();flash('Tap a spot on the mat to move '+a.name.trim()+' there.')}
    else if(c==='spot'){L.spot=L.spot===id?null:id;saveLayout();render()}
    else if(c==='stay'){it.e.pos[id]=posOf(prev,a,i).slice();if(it.e.bend)delete it.e.bend[id];markDirty();refreshTraffic();renderMat();flash(a.name.trim()+' stays put this 8-count.')}
    else if(c==='straight'){setBend(it.e,[id],null);markDirty();refreshTraffic();renderMat();flash('Path straightened.')}
    else if(c==='sel'){selMode=true;sel=[id];render();flash('Tap more athletes to add them, then use the bar under the mat.')}});
  m.addEventListener('keydown',function(e){if(e.key==='Escape'){closeCtx();return}var bs=Array.prototype.slice.call(m.querySelectorAll('button')),k=bs.indexOf(document.activeElement);
    if(e.key==='ArrowDown'){e.preventDefault();bs[(k+1)%bs.length].focus()}else if(e.key==='ArrowUp'){e.preventDefault();bs[(k-1+bs.length)%bs.length].focus()}})}
function closeCtx(){if(ctxm){ctxm.el.remove();ctxm=null}}

/* pinch to zoom the mat (two fingers), drag with one finger to pan while zoomed, double-tap to reset; Ctrl + scroll wheel on a computer */
var Z={s:1,cx:27,cy:21.5},pinch=null,pan=null,touches={},lastTap=0,BASE=[-2,-4,58,51];
function zoomTo(s,cx,cy){Z.s=Math.max(1,Math.min(4,s));if(Z.s<=1.01){Z.s=1;Z.cx=BASE[0]+BASE[2]/2;Z.cy=BASE[1]+BASE[3]/2}else{if(cx!=null){Z.cx=cx;Z.cy=cy}
  var hw=BASE[2]/2/Z.s,hh=BASE[3]/2/Z.s;Z.cx=Math.max(BASE[0]+hw,Math.min(BASE[0]+BASE[2]-hw,Z.cx));Z.cy=Math.max(BASE[1]+hh,Math.min(BASE[1]+BASE[3]-hh,Z.cy))}
  var m=document.getElementById('mat');if(m){var w=BASE[2]/Z.s,h=BASE[3]/Z.s;m.setAttribute('viewBox',(Z.cx-w/2).toFixed(3)+' '+(Z.cy-h/2).toFixed(3)+' '+w.toFixed(3)+' '+h.toFixed(3))}decorateMat()}
function unitsPerPx(){var m=document.getElementById('mat');if(!m)return 0.1;var r=m.getBoundingClientRect();return Math.max((BASE[2]/Z.s)/Math.max(1,r.width),(BASE[3]/Z.s)/Math.max(1,r.height))}
function cancelGestures(){if(drag){var it=find(cur);if(drag.start)Object.keys(drag.start).forEach(function(k){it.e.pos[k]=drag.start[k]});drag=null;showGuide(null)}
  if(mswipe){if(mswipe.el){mswipe.el.style.transform=''}mswipe=null}if(box){box=null;drawBox()}if(bdrag)bdrag=null;if(lp){clearTimeout(lp.t);lp=null}renderMat()}
window.addEventListener('pointerdown',function(e){var onMat=e.target.closest&&e.target.closest('#mat');if(!onMat||e.pointerType!=='touch')return;
  touches[e.pointerId]={x:e.clientX,y:e.clientY};var ids=Object.keys(touches);
  if(ids.length===2){e.preventDefault();e.stopImmediatePropagation();cancelGestures();var a=touches[ids[0]],b=touches[ids[1]];
    pinch={d0:Math.hypot(a.x-b.x,a.y-b.y)||1,s0:Z.s,mx:(a.x+b.x)/2,my:(a.y+b.y)/2,cx:Z.cx,cy:Z.cy,upp:unitsPerPx()*Z.s};pan=null;return}
  if(ids.length>2){e.stopImmediatePropagation();return}
  var onThing=e.target.closest('.dot,.bendh,.ghandle');var now=performance.now();
  if(!onThing&&now-lastTap<300&&Z.s>1){e.stopImmediatePropagation();e.preventDefault();lastTap=0;zoomTo(1);return}lastTap=now;
  if(!onThing&&Z.s>1&&!selMode&&!pickId){e.stopImmediatePropagation();e.preventDefault();pan={x:e.clientX,y:e.clientY,cx:Z.cx,cy:Z.cy,upp:unitsPerPx(),moved:false}}},true);
window.addEventListener('pointermove',function(e){if(touches[e.pointerId]){touches[e.pointerId].x=e.clientX;touches[e.pointerId].y=e.clientY}
  if(pinch){var ids=Object.keys(touches);if(ids.length<2)return;e.stopImmediatePropagation();var a=touches[ids[0]],b=touches[ids[1]],d=Math.hypot(a.x-b.x,a.y-b.y),s=Math.max(1,Math.min(4,pinch.s0*d/pinch.d0));
    var mx=(a.x+b.x)/2,my=(a.y+b.y)/2,upp=pinch.upp/s;zoomTo(s,pinch.cx-(mx-pinch.mx)*upp,pinch.cy-(my-pinch.my)*upp);return}
  if(pan){e.stopImmediatePropagation();if(Math.hypot(e.clientX-pan.x,e.clientY-pan.y)>4)pan.moved=true;zoomTo(Z.s,pan.cx-(e.clientX-pan.x)*pan.upp,pan.cy-(e.clientY-pan.y)*pan.upp)}},true);
function endTouch(e){if(touches[e.pointerId])delete touches[e.pointerId];
  if(pinch&&Object.keys(touches).length<2){pinch=null;e.stopImmediatePropagation();return}
  if(pan&&e.pointerType==='touch'){var p0=pan;pan=null;e.stopImmediatePropagation();if(!p0.moved&&pickId)placePicked(e.clientX,e.clientY)}}
window.addEventListener('pointerup',endTouch,true);window.addEventListener('pointercancel',endTouch,true);
app.addEventListener('wheel',function(e){if(!(e.ctrlKey||e.metaKey))return;var m=e.target.closest&&e.target.closest('#mat');if(!m)return;e.preventDefault();
  var svg=document.getElementById('mat'),pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;var q=pt.matrixTransform(svg.getScreenCTM().inverse()),s=Z.s*(e.deltaY<0?1.15:1/1.15);
  var ns=Math.max(1,Math.min(4,s)),k=Z.s/ns;zoomTo(ns,q.x+(Z.cx-q.x)*k,q.y+(Z.cy-q.y)*k)},{passive:false});

/* ---------- keyboard shortcuts (computers) ---------- */
var kbdOpen=false,fClipKey=null;
var KBD=[['Space','Play / pause'],['← →','Previous / next 8-count'],['Ctrl/⌘ C','Copy this 8-count’s formation'],['Ctrl/⌘ V','Paste it here (selected athletes only, if any are selected)'],['M','Mirror left / right'],
  ['F','Full-screen run-through'],['B','Big mat on / off'],['S','Select athletes on / off'],['Shift-click','Select several athletes, then drag any of them to move all'],['Arrow keys on a selected athlete','Nudge the whole selection'],['Esc','Cancel pick-up, close menus'],['Ctrl/⌘ Z','Undo (add Shift to redo)'],['Arrow keys on an athlete','Nudge them'],['?','Show these shortcuts']];
function kbdHtml(){return '<div class="pdfpanel" id="kbdPanel"><span class="fl">Keyboard shortcuts</span><dl class="kbd">'+KBD.map(function(k){return '<dt><kbd>'+esc(k[0])+'</kbd></dt><dd>'+esc(k[1])+'</dd>'}).join('')+'</dl><div class="ctl"><button class="btn small quiet" data-act="kbdHelp">Close</button></div></div>'}
window.addEventListener('keydown',function(e){
  if(e.key==='Escape'){if(ctxm){closeCtx();return}if(RUN){runClose();return}if(pickId){pickId=null;renderMat();return}if(kbdOpen){kbdOpen=false;render();return}}
  if(RUN){if(e.key===' '){e.preventDefault();play()}else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();var it0=find(cur),n0=Math.max(0,Math.min(it0.list.length-1,it0.n+(e.key==='ArrowRight'?1:-1)));cur=it0.list[n0].e.id;seek(eightStart(n0))}return}
  if(view!=='editor'||ATHLETE)return;
  var t=e.target,typing=t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable);if(typing)return;
  var onThing=t&&t.closest&&t.closest('#mat .dot,#mat .bendh,#mat .ghandle,[data-rgrip]');var mod=e.metaKey||e.ctrlKey;
  if(mod&&(e.key==='c'||e.key==='C')&&!e.shiftKey){if(String(window.getSelection&&window.getSelection())!=='')return;e.preventDefault();formationAct('fCopy');return}
  if(mod&&(e.key==='v'||e.key==='V')&&!e.shiftKey){e.preventDefault();formationAct('fPaste');return}
  if(mod||e.altKey)return;
  if(e.key===' '&&t&&/^(BUTTON|A|SUMMARY)$/.test(t.tagName))return;
  if(e.key===' '&&t!==document.body){e.preventDefault();play();return}
  if((e.key==='ArrowLeft'||e.key==='ArrowRight')&&!onThing){e.preventDefault();var it=find(cur),n=it.n+(e.key==='ArrowRight'?1:-1);if(n>=0&&n<it.list.length)selectEight(it.list[n].e.id);return}
  if(e.key==='m'||e.key==='M'){formationAct('fMirror');return}
  if(e.key==='f'||e.key==='F'){runOpen(false);return}
  if(e.key==='b'||e.key==='B'){betaPageAct('bigMat');return}
  if(e.key==='s'||e.key==='S'){var sb=document.getElementById('selBtn');if(sb)sb.click();return}
  if(e.key==='?'){kbdOpen=!kbdOpen;render();return}});

/* tap an athlete without dragging = pick them up; tap an empty spot = put them there */
var _endDrag0=null;
function betaTapCheck(kind,e){/* called from the mat's own handlers */
  if(kind==='dot'&&drag&&drag.selTap&&!drag.moved){var tid=drag.id;drag=null;showGuide(null);sel=sel.filter(function(x){return x!==tid});renderMat();renderSelBar();return true}
  if(kind==='dot'){if(!drag||drag.moved||drag.group||selMode)return false;var id=drag.id;drag=null;showGuide(null);
    if(pickId===id){pickId=null;renderMat();return true}pickId=id;renderMat();flash('Tap a spot on the mat to move '+pickName()+' there. Tap '+pickName()+' again to cancel.');return true}
  if(kind==='empty'){if(!pickId||!downAt)return false;return placePicked(downAt.x,downAt.y)}
  return false}

/* renderMat also marks the picked-up athlete and the zoom button */
var renderMat0=renderMat;renderMat=function(){var r=renderMat0.apply(this,arguments);decorateMat();return r};

if(window.CP_CONFIG&&window.CP_CONFIG.debug)window.__cp={D:function(){return D},R:function(){return R},sync:function(){return sync}};
if(ATHLETE){view='editor';if(D.routines.length){R=D.routines[0];D.cur=R.id;cur=ev(R.sections[0])[0].id;loadAudio()}render()}
else{R=D.routines.find(function(r){return r.id===D.cur&&!r.deletedAt})||liveRoutines()[0]||D.routines[0];D.cur=R.id;cur=ev(R.sections[0])[0].id;
var ft=matWrap.querySelector('#freeTog');if(ft)ft.checked=!!L.free;
loadAudio();buildVideos();render();}
})();
