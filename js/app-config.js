/* Backend endpoints. Production traffic goes through same-origin /api/* rewrites
   so the upstream host never appears in page source or network
   panels; local development falls back to the direct host. The publishable key is
   public by design — row-level security is the real protection.
   req() adds a timeout so pages fail fast (with a friendly message) instead of
   hanging when the network is slow or under heavy load. */
window.WASH_BACKEND = (function(){
  var HOST = 'https://dnvjfaaxfydvujkqsdfu.supabase.co';
  var h = window.location.hostname || '';
  var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(h) || window.location.protocol === 'file:';
  function api(path){
    if(local) return HOST + path;
    return '/api' + path.replace(/^\/auth\/v1/, '/auth').replace(/^\/rest\/v1/, '/rest');
  }
  function fn(remote, proxied){ return local ? HOST + remote : proxied; }
  function req(url, opts, ms){
    opts = opts || {};
    if(!window.AbortController) return fetch(url, opts);
    var ctrl = new AbortController();
    opts.signal = ctrl.signal;
    var timer = setTimeout(function(){ ctrl.abort(); }, ms || 12000);
    return fetch(url, opts).then(function(r){ clearTimeout(timer); return r; },
      function(e){ clearTimeout(timer); throw e; });
  }
  return {
    anonKey: 'sb_publishable_h155BTE2YuJovva7CR1JFw_7WsdtB2L',
    api: api,
    req: req,
    contactFn: fn('/functions/v1/submit-contact', '/api/contact'),
    newsletterFn: fn('/functions/v1/subscribe-newsletter', '/api/newsletter'),
    newsFeed: fn('/rest/v1/news_posts?select=id,title_ar,title_en,body_ar,body_en,category,event_date,location,published_at,created_at&published=eq.true&order=published_at.desc.nullslast&order=created_at.desc&limit=50', '/api/news')
  };
})();
