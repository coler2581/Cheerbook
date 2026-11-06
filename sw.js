/* Cheerbook Beta service worker: makes the app installable and lets it open with no signal.
   App files: network first (so updates arrive right away), falling back to the saved copy offline.
   Songs and logos: saved copy first (they never change once uploaded). Supabase data and sign-in always go to the network. */
var VERSION='cp-beta-0.9.2';
var SHELL=['./','index.html','app.css','beta.css','app.js','platform.js','config.js','lib/supabase.js','lib/qrcode.js','lib/mp4-muxer.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/logo.svg'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(VERSION).then(function(c){return c.addAll(SHELL)}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==VERSION&&k!=='cp-media'&&k!=='cp-fonts'}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){var req=e.request;if(req.method!=='GET')return;var url=new URL(req.url);
  if(/\/storage\/v1\/object\/public\/media\//.test(url.pathname)){
    if(req.headers.has('range')){ /* audio players ask for byte ranges: answer from the saved copy when there is one, otherwise stream normally */
      e.respondWith(caches.open('cp-media').then(function(c){return c.match(req.url)}).then(function(hit){if(!hit)return fetch(req);
        return hit.arrayBuffer().then(function(buf){var m=/bytes=(\d*)-(\d*)/.exec(req.headers.get('range'))||[],a=m[1]?+m[1]:0,b=m[2]?+m[2]:buf.byteLength-1;b=Math.min(b,buf.byteLength-1);
          return new Response(buf.slice(a,b+1),{status:206,headers:{'Content-Type':hit.headers.get('Content-Type')||'audio/mp4','Content-Range':'bytes '+a+'-'+b+'/'+buf.byteLength,'Content-Length':String(b-a+1),'Accept-Ranges':'bytes'}})})}));return}
    e.respondWith(caches.open('cp-media').then(function(c){return c.match(req.url).then(function(hit){return hit||fetch(req).then(function(r){if(r.ok&&r.status===200)c.put(req.url,r.clone());return r})})}));return}
  if(url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.open('cp-fonts').then(function(c){return c.match(req).then(function(hit){return hit||fetch(req).then(function(r){if(r.ok)c.put(req,r.clone());return r})})}));return}
  if(url.origin!==self.location.origin)return;
  e.respondWith(fetch(req).then(function(r){if(r.ok&&r.type==='basic'){var cp=r.clone();caches.open(VERSION).then(function(c){c.put(url.search&&!/[?&]t=/.test(url.search)?url.pathname:req,cp)})}return r})
    .catch(function(){return caches.match(req,{ignoreSearch:true}).then(function(hit){return hit||caches.match('index.html')})}))});
