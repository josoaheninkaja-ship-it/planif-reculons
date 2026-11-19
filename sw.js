var CACHE='planif-v2';
var ASSETS=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','maskable-192.png','maskable-512.png'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS)}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.map(function(k){if(k!==CACHE)return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  var req=e.request, isNav=(req.mode==='navigate')||(req.destination==='document');
  if(isNav){
    // réseau d'abord pour la page -> toujours la dernière version ; cache en secours hors-ligne
    e.respondWith(
      fetch(req).then(function(resp){var copy=resp.clone();caches.open(CACHE).then(function(c){try{c.put('index.html',copy)}catch(_){}}).catch(function(){});return resp})
                 .catch(function(){return caches.match('index.html').then(function(r){return r||caches.match('./')})})
    );
    return;
  }
  // cache d'abord pour le reste (icônes, manifest)
  e.respondWith(caches.match(req).then(function(r){return r||fetch(req).then(function(resp){var copy=resp.clone();caches.open(CACHE).then(function(c){try{c.put(req,copy)}catch(_){}}).catch(function(){});return resp})}));
});
