/* Contact form -> submit-contact Edge Function. main.js validates first;
   this handler skips when main.js already prevented submit. No-JS fallback: mailto action. */
(function(){
  function lang(){ return document.documentElement.lang === 'en' ? 'en' : 'ar'; }
  var T = {
    sending: {ar:'جارٍ الإرسال…', en:'Sending…'},
    ok: {ar:'تم استلام رسالتك بنجاح. سنرد عليك قريبًا.', en:'Your message was received. We will reply soon.'},
    rate: {ar:'أرسلت عدة رسائل مؤخرًا — حاول مجددًا بعد ساعة.', en:'You have sent several messages recently — please try again in an hour.'},
    fail: {ar:'تعذّر إرسال الرسالة. حاول مجددًا أو راسلنا بالبريد أدناه.', en:'Could not send your message. Try again or email us below.'}
  };
  function t(k){ var l = lang(); return T[k][l]; }
  function val(form, name){ var f = form.querySelector('[name="' + name + '"]'); return f ? f.value : ''; }

  document.addEventListener('DOMContentLoaded', function(){
    var form = document.querySelector('form.contact');
    if(!form || !window.WASH_BACKEND) return;
    var btn = form.querySelector('button[type="submit"]');
    var status = document.getElementById('contact-status');
    var fallback = document.getElementById('contact-fallback');
    var hp = form.querySelector('input[name="website"]');
    var btnLabel = btn ? btn.textContent : '';

    form.addEventListener('submit', function(e){
      if(e.defaultPrevented) return;
      e.preventDefault();
      if(fallback) fallback.hidden = true;
      var payload = {
        name: val(form, 'name'), email: val(form, 'email'),
        subject: val(form, 'subject'), message: val(form, 'message'),
        lang: lang(), website: hp ? hp.value : ''
      };
      if(btn){ btn.disabled = true; btn.setAttribute('aria-disabled', 'true'); btn.textContent = t('sending'); }
      function done(cls, msg, showFallback){
        if(status){ status.hidden = false; status.className = 'form-status ' + cls; status.textContent = msg; }
        if(fallback) fallback.hidden = !showFallback;
        if(btn){ btn.disabled = false; btn.removeAttribute('aria-disabled'); btn.textContent = btnLabel; }
      }
      window.WASH_BACKEND.req(window.WASH_BACKEND.contactFn, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'apikey': window.WASH_BACKEND.anonKey},
        body: JSON.stringify(payload)
      }).then(function(r){
        return r.json().catch(function(){ return {}; }).then(function(b){ return {st: r.status, b: b}; });
      }).then(function(x){
        if(x.st === 200 && x.b && x.b.ok){ form.reset(); done('ok', t('ok'), false); }
        else if(x.b && x.b.error === 'rate_limited'){ done('err', t('rate'), false); }
        else { done('err', t('fail'), true); }
      }).catch(function(){ done('err', t('fail'), true); });
    });
  });
})();
