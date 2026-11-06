/* Cheerbook Beta: platform layer.
   The app was first built inside Claude, where the page asks the host for a shared database, file storage, the viewer and downloads
   through window.claude.use(name). This file provides the same calls on top of Supabase (cloud mode), or on top of this device's own
   storage when no Supabase project is set up yet (local mode). It also handles signing in, programs and coaches, athlete links,
   and the athlete live view feed. app.js is loaded once this layer is ready. */
(function(){
'use strict';
var CFG=window.CP_CONFIG||{};
var CLOUD=!!(CFG.supabaseUrl&&CFG.supabaseAnonKey&&window.supabase&&window.supabase.createClient);
var ENV=window.CP_ENV={mode:CLOUD?'cloud':'local',ls:'cpbeta-local-v1',cloud:CLOUD};
var root=document.getElementById('app');
var sb=CLOUD?window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
ENV.sb=sb;

/* ---------- helpers ---------- */
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function hexId(){var a=new Uint8Array(16);crypto.getRandomValues(a);return Array.prototype.map.call(a,function(b){return ('0'+b.toString(16)).slice(-2)}).join('')}
function token(){var a=new Uint8Array(12);crypto.getRandomValues(a);return btoa(String.fromCharCode.apply(null,a)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function lsGet(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function err(code,message){var e=new Error(message||code);e.code=code;return e}
function screen(html){root.innerHTML='<div class="gate"><div class="gcard"><div class="gbrand"><img class="gmark" src="icons/logo.svg" alt=""><b class="gword">cheer<span>book</span></b><span class="devtag">Beta</span></div>'+html+'</div></div>'}
function bootApp(){if(ENV.booted)return;ENV.booted=true;root.innerHTML='';var s=document.createElement('script');s.src='app.js?v='+(CFG.version||'1');document.body.appendChild(s)}
ENV.reload=function(){location.reload()};

/* downloads: hand the file to the browser */
var downloads={save:function(o){return new Promise(function(res){var b=o.data instanceof Blob?o.data:new Blob([o.data],{type:'text/plain'}),u=URL.createObjectURL(b),a=document.createElement('a');
  a.href=u;a.download=o.filename||'download';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(u);a.remove()},4000);res({status:'saved'})})}};

/* ---------- local mode: songs and logos kept in this browser (IndexedDB) ---------- */
function idb(){return new Promise(function(res,rej){var r=indexedDB.open('cpbeta-assets',1);r.onupgradeneeded=function(){r.result.createObjectStore('a')};r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}})}
function idbAll(db){return new Promise(function(res){var out={},tx=db.transaction('a'),st=tx.objectStore('a'),c=st.openCursor();c.onsuccess=function(){var cur=c.result;if(cur){out[cur.key]=cur.value;cur.continue()}else res(out)};c.onerror=function(){res(out)}})}
function idbPut(db,k,v){return new Promise(function(res,rej){var tx=db.transaction('a','readwrite');tx.objectStore('a').put(v,k);tx.oncomplete=function(){res()};tx.onerror=function(){rej(tx.error)}})}
function idbDel(db,k){return new Promise(function(res){var tx=db.transaction('a','readwrite');tx.objectStore('a').delete(k);tx.oncomplete=function(){res()};tx.onerror=function(){res()}})}
function localMode(){
  var urls={},db=null;
  ENV.blob=function(id){return urls[id]||''};
  return idb().then(function(d){db=d;return idbAll(d)}).catch(function(){return {}}).then(function(all){
    Object.keys(all).forEach(function(k){urls[k]=URL.createObjectURL(all[k].blob)});
    var assets={upload:function(blob,o){var id=hexId(),type=(o&&o.type)||blob.type||'application/octet-stream';if(!db)return Promise.reject(err('unavailable','Storage isn’t available in this browser.'));
        return idbPut(db,id,{blob:blob,type:type,size:blob.size,at:Date.now()}).then(function(){urls[id]=URL.createObjectURL(blob);return {id:id,url:urls[id],sizeBytes:blob.size,contentType:type}})},
      list:function(){return db?idbAll(db).then(function(a){var ks=Object.keys(a),bytes=ks.reduce(function(s,k){return s+(a[k].size||0)},0);return {assets:ks.map(function(k){return {id:k,sizeBytes:a[k].size,contentType:a[k].type}}),usage:{files:ks.length,bytes:bytes,maxBytes:500*1048576}}}):Promise.resolve({assets:[],usage:null})},
      delete:function(id){if(urls[id]){URL.revokeObjectURL(urls[id]);delete urls[id]}return db?idbDel(db,id):Promise.resolve()}};
    ENV.api={assets:assets,downloads:downloads};
    ENV.account=null;
    window.claude={use:function(n){return new Promise(function(res){setTimeout(function(){res(ENV.api[n]||null)},0)})}};
    bootApp()})}

/* ---------- cloud mode: Supabase ---------- */
var PROGRAM=null,USER=null;
function publicUrl(path){return CFG.supabaseUrl.replace(/\/$/,'')+'/storage/v1/object/public/media/'+path}

/* shared database in the shape the app expects: doc(path) and collection(path), each with set/delete/onSnapshot.
   Rows live in the docs table, one per document, keyed by program, collection and id. Deletes are soft (deleted=true) so every device hears about them. */
function makeDb(pid){
  var rows={},listeners=[],loaded=false,maxRev=0,chan=null,pollT=0;
  function split(path){var i=path.lastIndexOf('/');return {coll:path.slice(0,i),id:path.slice(i+1)}}
  function key(c,i){return c+'/'+i}
  function take(r){var k=key(r.coll,r.id),old=rows[k],rv=Number(r.rev)||0;if(old&&old.rev>=rv)return false;r.rev=rv;rows[k]=r;if(rv>maxRev)maxRev=rv;return true}
  function emit(){if(!loaded)return;listeners.forEach(function(l){l()})}
  function fetchSince(){var q=sb.from('docs').select('coll,id,body,deleted,rev').eq('program_id',pid);if(maxRev)q=q.gt('rev',maxRev);
    return q.order('rev',{ascending:true}).limit(1000).then(function(r){if(r.error)throw r.error;var ch=false;(r.data||[]).forEach(function(x){if(take(x))ch=true});
      if((r.data||[]).length===1000)return fetchSince().then(function(c2){return ch||c2});return ch})}
  function start(){
    fetchSince().then(function(){loaded=true;emit()}).catch(function(e){listeners.forEach(function(l){l.err&&l.err(e)})});
    chan=sb.channel('docs-'+pid).on('postgres_changes',{event:'*',schema:'public',table:'docs',filter:'program_id=eq.'+pid},function(p){var r=p.new;if(r&&r.coll){if(take(r))emit()}})
      .subscribe(function(st){if(st==='SUBSCRIBED'&&loaded)fetchSince().then(function(ch){if(ch)emit()}).catch(function(){})});
    /* safety net: if a live update is missed (sleep, bad signal), pick up anything newer every 20 s and when the app comes back to the front */
    pollT=setInterval(function(){if(document.visibilityState==='visible')fetchSince().then(function(ch){if(ch)emit()}).catch(function(){})},20000);
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')fetchSince().then(function(ch){if(ch)emit()}).catch(function(){})})}
  var started=false;function ensure(){if(!started){started=true;start()}}
  function snapDoc(k){var r=rows[k],body=r&&!r.deleted?r.body:null;var id=k.slice(k.lastIndexOf('/')+1);
    return {id:id,exists:body!=null,data:function(){return body==null?undefined:JSON.parse(JSON.stringify(body))},metadata:{fromCache:false,hasPendingWrites:false}}}
  function write(path,body,deleted){var s=split(path),row={program_id:pid,coll:s.coll,id:s.id,body:deleted?null:body,deleted:!!deleted};
    return sb.from('docs').upsert(row,{onConflict:'program_id,coll,id'}).select('coll,id,body,deleted,rev').then(function(r){if(r.error){var c=r.error.code==='42501'?'invalid_argument':'unavailable';throw err(c,r.error.message)}
      if(r.data&&r.data[0]&&take(r.data[0]))setTimeout(emit,0)})}
  return {
    doc:function(path){var s=split(path),k=key(s.coll,s.id);return {id:s.id,path:path,
      get:function(){return sb.from('docs').select('coll,id,body,deleted,rev').eq('program_id',pid).eq('coll',s.coll).eq('id',s.id).maybeSingle().then(function(r){if(r.data)take(r.data);return snapDoc(k)})},
      set:function(b){return write(path,b,false)},
      update:function(b){var cur=rows[k]&&rows[k].body||{};return write(path,Object.assign({},cur,b),false)},
      delete:function(){return write(path,null,true)},
      onSnapshot:function(next,onErr){var l=function(){next(snapDoc(k))};l.err=onErr;listeners.push(l);ensure();if(loaded)setTimeout(l,0);return function(){listeners=listeners.filter(function(x){return x!==l})}}}},
    collection:function(coll){return {path:coll,doc:function(id){return this.parent.doc(coll+'/'+(id||hexId()))},
      onSnapshot:function(next,onErr){var l=function(){var docs=Object.keys(rows).filter(function(k){var r=rows[k];return r.coll===coll&&!r.deleted&&r.body!=null}).sort().map(snapDoc);
        next({docs:docs,size:docs.length,empty:!docs.length,metadata:{fromCache:false,hasPendingWrites:false},docChanges:function(){return []}})};
        l.err=onErr;listeners.push(l);ensure();if(loaded)setTimeout(l,0);return function(){listeners=listeners.filter(function(x){return x!==l})}}}}}
}
function cloudAssets(pid){
  return {upload:function(blob,o){var id=hexId(),type=(o&&o.type)||blob.type||'application/octet-stream';
      return sb.storage.from('media').upload(pid+'/'+id,blob,{contentType:type,upsert:false,cacheControl:'31536000'}).then(function(r){
        if(r.error){var m=String(r.error.message||''),c=/exceed|too large|size/i.test(m)?'too_large':'unavailable';throw err(c,m)}
        return {id:id,url:publicUrl(pid+'/'+id),sizeBytes:blob.size,contentType:type}})},
    list:function(){return sb.storage.from('media').list(pid,{limit:1000}).then(function(r){var a=(r.data||[]).filter(function(x){return x.id}),bytes=a.reduce(function(s,x){return s+((x.metadata&&x.metadata.size)||0)},0);
        return {assets:a.map(function(x){return {id:x.name,sizeBytes:(x.metadata&&x.metadata.size)||0,contentType:x.metadata&&x.metadata.mimetype}}),usage:{files:a.length,bytes:bytes,maxBytes:(CFG.storageMB||1024)*1048576}}})},
    delete:function(id){return sb.storage.from('media').remove([pid+'/'+id]).then(function(){})}}}

/* coaches, invites and athlete links, used by the Account and Team pages */
function accountApi(){
  return {email:USER.email,role:PROGRAM.role,programName:PROGRAM.name,programId:PROGRAM.id,
    signOut:function(){return sb.auth.signOut().then(function(){lsSet('cpbeta-program',null);location.reload()})},
    members:function(){return Promise.all([sb.from('members').select('user_id,email,role,created_at').eq('program_id',PROGRAM.id).order('created_at'),
        sb.from('invites').select('email,role,created_at').eq('program_id',PROGRAM.id).order('created_at')]).then(function(r){return {members:r[0].data||[],invites:r[1].data||[]}})},
    invite:function(email,role){email=String(email||'').trim().toLowerCase();if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return Promise.reject(err('bad_email','That email doesn’t look right.'));
      return sb.from('invites').upsert({program_id:PROGRAM.id,email:email,role:role==='owner'?'owner':'coach'},{onConflict:'program_id,email'}).then(function(r){if(r.error)throw err('denied',r.error.message)})},
    cancelInvite:function(email){return sb.from('invites').delete().eq('program_id',PROGRAM.id).eq('email',email).then(function(r){if(r.error)throw err('denied',r.error.message)})},
    removeMember:function(uid){return sb.from('members').delete().eq('program_id',PROGRAM.id).eq('user_id',uid).then(function(r){if(r.error)throw err('denied',r.error.message)})},
    renameProgram:function(name){return sb.from('programs').update({name:String(name).slice(0,80)}).eq('id',PROGRAM.id).then(function(){PROGRAM.name=name})},
    links:function(teamId){return sb.from('team_links').select('token,enabled,created_at').eq('program_id',PROGRAM.id).eq('team_id',teamId).eq('enabled',true).order('created_at',{ascending:false}).then(function(r){return r.data||[]})},
    newLink:function(teamId){var t=token();return sb.from('team_links').update({enabled:false}).eq('program_id',PROGRAM.id).eq('team_id',teamId).then(function(){
        return sb.from('team_links').insert({token:t,program_id:PROGRAM.id,team_id:teamId,enabled:true})}).then(function(r){if(r.error)throw err('denied',r.error.message);return t})},
    disableLinks:function(teamId){return sb.from('team_links').update({enabled:false}).eq('program_id',PROGRAM.id).eq('team_id',teamId).then(function(r){if(r.error)throw err('denied',r.error.message)})},
    linkUrl:function(t){return location.origin+location.pathname.replace(/[^\/]*$/,'')+'?t='+encodeURIComponent(t)}}}

/* Sign in with email + password (works with no email service set up), or an emailed link.
   Supabase's built-in email only reaches the project's own team members, 2 emails an hour, so for the beta password sign-in is the main path. */
function signInScreen(msg,mode){mode=mode||'signin';
  var link=mode==='link',create=mode==='create';
  screen('<h1>'+(link?'Email me a link':create?'Create your coach account':'Coach sign in')+'</h1>'
    +(msg?'<p class="gmsg">'+esc(msg)+'</p>':'')
    +'<form id="gform"><label class="fl" for="gemail">Email</label><input class="field" id="gemail" type="email" autocomplete="email" required placeholder="you@example.com" value="'+esc(lsGet('cpbeta-lastemail','')||'')+'">'
    +(link?'':'<label class="fl" for="gpass">Password</label><input class="field" id="gpass" type="password" autocomplete="'+(create?'new-password':'current-password')+'" required minlength="8" placeholder="'+(create?'At least 8 characters':'Password')+'">')
    +'<button class="btn primary gwide" type="submit">'+(link?'Email me a sign-in link':create?'Create account':'Sign in')+'</button></form>'
    +(CFG.google?'<div class="gor"><span>or</span></div><button class="btn gwide" id="ggoogle">Continue with Google</button>':'')
    +'<p class="gnote small">'+(create?'Already have an account? <a href="" data-m="signin">Sign in</a>':link?'<a href="" data-m="signin">Sign in with a password instead</a>':'New coach? <a href="" data-m="create">Create an account</a> · <a href="" data-m="link">Email me a link instead</a>')+'</p>'
    +'<p class="gnote small">Athletes don’t need an account. Ask your coach for your team’s link.</p>');
  Array.prototype.forEach.call(root.querySelectorAll('[data-m]'),function(a){a.onclick=function(e){e.preventDefault();signInScreen(null,a.dataset.m)}});
  document.getElementById('gform').addEventListener('submit',function(e){e.preventDefault();var em=document.getElementById('gemail').value.trim(),pw=(document.getElementById('gpass')||{}).value,b=e.target.querySelector('button');
    lsSet('cpbeta-lastemail',em);b.disabled=true;b.textContent=link?'Sending…':'One moment…';
    var fail=function(m){signInScreen(m,mode)};
    if(link){sb.auth.signInWithOtp({email:em,options:{emailRedirectTo:location.origin+location.pathname}}).then(function(r){
      if(r.error){fail(/rate|limit/i.test(r.error.message)?'Too many emails were sent in the last hour. Sign in with a password instead.':/not authorized|authorized/i.test(r.error.message)?'Sign-in emails aren’t set up for this address yet. Sign in with a password instead.':'That didn’t send: '+r.error.message);return}
      screen('<h1>Check your email</h1><p class="gnote">We sent a sign-in link to <b>'+esc(em)+'</b>. Open it on this device to continue.</p><button class="btn gwide" id="gback">Back</button>');
      document.getElementById('gback').onclick=function(){signInScreen()}});return}
    if(create){sb.auth.signUp({email:em,password:pw,options:{emailRedirectTo:location.origin+location.pathname}}).then(function(r){
      if(r.error){fail(/registered|exists/i.test(r.error.message)?'There’s already an account for that email. Sign in instead.':r.error.message);return}
      if(r.data&&r.data.session){USER=r.data.session.user;afterSignIn();return}
      screen('<h1>Confirm your email</h1><p class="gnote">We sent a confirmation link to <b>'+esc(em)+'</b>. Open it, then sign in.</p><button class="btn gwide" id="gback">Back to sign in</button>');
      document.getElementById('gback').onclick=function(){signInScreen()}});return}
    sb.auth.signInWithPassword({email:em,password:pw}).then(function(r){
      if(r.error){fail(/invalid/i.test(r.error.message)?'Wrong email or password.':/confirm/i.test(r.error.message)?'Confirm your email first: open the link we sent you.':r.error.message);return}
      if(r.data&&r.data.session&&!USER){USER=r.data.session.user;afterSignIn()}})});
  var g=document.getElementById('ggoogle');if(g)g.onclick=function(){sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}})}}
function createProgramScreen(){
  screen('<h1>Set up your program</h1><p class="gnote">Signed in as <b>'+esc(USER.email)+'</b>. Name your gym, school or program. You can invite other coaches after.</p>'
    +'<form id="pform"><label class="fl" for="pname">Program name</label><input class="field" id="pname" required maxlength="80" placeholder="e.g. Champion Force Athletics">'
    +'<button class="btn primary gwide" type="submit">Create program</button></form>'
    +'<p class="gnote small">Were you invited by another coach? Ask them to invite <b>'+esc(USER.email)+'</b>, then <a href="" id="grefresh">check again</a>.</p>'
    +'<p class="gnote small"><a href="" id="gout">Sign out</a></p>');
  document.getElementById('pform').addEventListener('submit',function(e){e.preventDefault();var n=document.getElementById('pname').value.trim();if(!n)return;e.target.querySelector('button').disabled=true;
    sb.rpc('create_program',{p_name:n}).then(function(r){if(r.error){screen('<p class="gmsg">Couldn’t create the program: '+esc(r.error.message)+'</p>');return}lsSet('cpbeta-program',r.data);afterSignIn()})});
  document.getElementById('grefresh').onclick=function(e){e.preventDefault();afterSignIn()};
  document.getElementById('gout').onclick=function(e){e.preventDefault();sb.auth.signOut().then(function(){location.reload()})}}
function pickProgramScreen(list){
  screen('<h1>Choose a program</h1>'+list.map(function(p){return '<button class="btn gwide gpick" data-id="'+esc(p.id)+'">'+esc(p.name)+' <span class="sub">'+esc(p.role)+'</span></button>'}).join(''));
  Array.prototype.forEach.call(root.querySelectorAll('.gpick'),function(b){b.onclick=function(){lsSet('cpbeta-program',b.dataset.id);openProgram(list.find(function(p){return p.id===b.dataset.id}))}})}
function afterSignIn(){
  screen('<p class="gnote">Loading your playbook…</p>');
  sb.rpc('accept_invites').then(function(){return sb.rpc('my_programs')}).then(function(r){
    if(r.error){screen('<p class="gmsg">Couldn’t load your programs: '+esc(r.error.message)+'</p><button class="btn gwide" onclick="location.reload()">Try again</button>');return}
    var list=r.data||[];if(!list.length){createProgramScreen();return}
    var want=lsGet('cpbeta-program',null),p=list.find(function(x){return x.id===want});
    if(!p&&list.length===1)p=list[0];if(p){lsSet('cpbeta-program',p.id);openProgram(p)}else pickProgramScreen(list)})}
function openProgram(p){PROGRAM=p;ENV.ls='cpbeta-'+p.id+'-v1';ENV.program=p;
  ENV.blob=function(id){return publicUrl(p.id+'/'+id)};
  var db=makeDb(p.id);db.collection=(function(c){return function(coll){var o=c(coll);o.parent=db;return o}})(db.collection);
  var user={can:function(){return Promise.resolve(true)},canEdit:function(){return Promise.resolve(true)},isOwner:function(){return Promise.resolve(p.role==='owner')},id:function(){return Promise.resolve(USER.id)},me:function(){return Promise.resolve({id:USER.id,name:USER.email})}};
  ENV.api={db:db,assets:cloudAssets(p.id),downloads:downloads,user:user};
  ENV.account=accountApi();
  window.claude={use:function(n){return new Promise(function(res){setTimeout(function(){res(ENV.api[n]||null)},0)})}};
  bootApp()}
function cloudMode(){
  sb.auth.getSession().then(function(r){var s=r.data&&r.data.session;
    if(s){USER=s.user;afterSignIn()}else signInScreen()});
  sb.auth.onAuthStateChange(function(ev,s){if(ev==='SIGNED_IN'&&s&&!USER){USER=s.user;afterSignIn()}if(ev==='SIGNED_OUT'&&USER){location.reload()}})}

/* ---------- athlete live view: ?t=<team link> opens a read-only view, no account ---------- */
function athleteMode(tok){
  var cacheKey='cpbeta-feed-'+tok,cached=lsGet(cacheKey,null);
  ENV.ls='cpbeta-ath-'+tok;
  function start(feed,offline){
    ENV.blob=function(id){return feed.program?publicUrl(feed.program+'/'+id):''};
    ENV.api={downloads:downloads};window.claude={use:function(n){return Promise.resolve(ENV.api[n]||null)}};
    ENV.athlete={token:tok,feed:feed,offline:!!offline,stamp:feed.stamp||'',onUpdate:null};
    bootApp();poll()}
  function fetchFeed(){if(!CLOUD)return Promise.reject(err('unavailable'));return sb.rpc('athlete_feed',{p_token:tok}).then(function(r){if(r.error)throw r.error;return r.data})}
  function poll(){if(!CLOUD)return;var busy=false;
    var tick=function(){if(busy||document.visibilityState!=='visible')return;busy=true;
      sb.rpc('athlete_stamp',{p_token:tok}).then(function(r){if(r.error||r.data==null)return;var a=ENV.athlete;a.offline=false;
        if(String(r.data)!==String(a.stamp))return fetchFeed().then(function(f){if(!f)return;lsSet(cacheKey,f);a.feed=f;a.stamp=f.stamp;if(a.onUpdate)a.onUpdate(f)})})
      .catch(function(){if(ENV.athlete)ENV.athlete.offline=true}).then(function(){busy=false})};
    setInterval(tick,CFG.athletePollMs||4000);document.addEventListener('visibilitychange',tick)}
  screen('<p class="gnote">Loading your routine…</p>');
  fetchFeed().then(function(f){if(!f){screen('<h1>This link is turned off</h1><p class="gnote">Ask your coach for the new team link.</p>');lsSet(cacheKey,null);return}lsSet(cacheKey,f);start(f,false)})
  .catch(function(){if(cached)start(cached,true);else screen('<h1>Can’t load the routine</h1><p class="gnote">Check your connection and open the link again.</p>')})}

/* ---------- start ---------- */
var tok=new URLSearchParams(location.search).get('t');
if(tok&&/^[A-Za-z0-9_-]{8,64}$/.test(tok))athleteMode(tok);
else if(CLOUD)cloudMode();
else localMode();

if('serviceWorker' in navigator&&location.protocol!=='file:'&&!CFG.noServiceWorker){window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})})}
})();
