(function(){
  function lang(){ return document.documentElement.lang === 'en' ? 'en' : 'ar'; }
  var T = {
    sending: {ar:'\u062c\u0627\u0631\u064d \u0627\u0644\u0625\u0631\u0633\u0627\u0644…', en:'Sending…'},
    ok: {ar:'\u062a\u0645 \u0627\u0633\u062a\u0644\u0627\u0645 \u0631\u0633\u0627\u0644\u062a\u0643 \u0628\u0646\u062c\u0627\u062d. \u0633\u0646\u0631\u062f \u0639\u0644\u064a\u0643 \u0642\u0631\u064a\u0628\u064b\u0627.', en:'Your message was received. We will reply soon.'},
    rate: {ar:'\u0623\u0631\u0633\u0644\u062a \u0639\u062f\u0629 \u0631\u0633\u0627\u0626\u0644 \u0645\u0624\u062e\u0631\u064b\u0627 — \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u064b\u0627 \u0628\u0639\u062f \u0633\u0627\u0639\u0629.', en:'You have sent several messages recently — please try again in an hour.'},
    fail: {ar:'\u062a\u0639\u0630\u0651\u0631 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629. \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u064b\u0627 \u0623\u0648 \u0631\u0627\u0633\u0644\u0646\u0627 \u0628\u0627\u0644\u0628\u0631\u064a\u062f \u0623\u062f\u0646\u0627\u0647.', en:'Could not send your message. Try again or email us below.'}
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
