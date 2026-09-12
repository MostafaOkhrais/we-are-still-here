/* Footer newsletter forms -> subscribe-newsletter Edge Function. */
(function(){
  function lang(){ return document.documentElement.lang === 'en' ? 'en' : 'ar'; }
  var T = {
    sending: {ar:'جارٍ الاشتراك…', en:'Subscribing…'},
    ok: {ar:'تم اشتراكك في النشرة البريدية. أهلًا بك!', en:'You are subscribed to the newsletter. Welcome!'},
    bad: {ar:'يرجى إدخال بريد إلكتروني صالح.', en:'Please enter a valid email address.'},
    rate: {ar:'محاولات كثيرة مؤخرًا — حاول مجددًا بعد ساعة.', en:'Too many attempts recently — please try again in an hour.'},
    fail: {ar:'تعذّر الاشتراك. حاول مجددًا لاحقًا.', en:'Could not subscribe. Please try again later.'}
  };
  function t(k){ return T[k][lang()]; }
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  document.addEventListener('DOMContentLoaded', function(){
    if(!window.WASH_BACKEND) return;
    document.querySelectorAll('form.newsletter').forEach(function(form){
      var input = form.querySelector('input[type="email"]');
      var btn = form.querySelector('button[type="submit"]');
      var status = form.querySelector('.nl-status');
      var hp = form.querySelector('input[name="website"]');
      if(!input || !btn || !status) return;
      var btnLabel = btn.textContent;
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var email = input.value.trim();
        if(!EMAIL_RE.test(email)){
          status.hidden = false; status.textContent = t('bad');
          input.setAttribute('aria-invalid', 'true'); input.focus(); return;
        }
        input.removeAttribute('aria-invalid');
        btn.disabled = true; btn.setAttribute('aria-disabled', 'true'); btn.textContent = t('sending');
        window.WASH_BACKEND.req(window.WASH_BACKEND.newsletterFn, {
          method: 'POST',
          headers: {'Content-Type': 'application/json', 'apikey': window.WASH_BACKEND.anonKey},
          body: JSON.stringify({email: email, lang: lang(), website: hp ? hp.value : ''})
        }).then(function(r){
          return r.json().catch(function(){ return {}; }).then(function(b){ return {st: r.status, b: b}; });
        }).then(function(x){
          status.hidden = false;
          if(x.st === 200 && x.b && x.b.ok){
            status.textContent = t('ok');
            form.reset();
          }
          else if(x.b && x.b.error === 'rate_limited'){ status.textContent = t('rate'); }
          else { status.textContent = t('fail'); }
          btn.disabled = false; btn.removeAttribute('aria-disabled'); btn.textContent = btnLabel;
        }).catch(function(){
          status.hidden = false; status.textContent = t('fail');
          btn.disabled = false; btn.removeAttribute('aria-disabled'); btn.textContent = btnLabel;
        });
      });
      input.addEventListener('input', function(){
        if(input.hasAttribute('aria-invalid') && input.value.trim()){ input.removeAttribute('aria-invalid'); }
      });
    });
  });
})();
