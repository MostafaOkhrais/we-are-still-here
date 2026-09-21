(function(){
  function lang(){ return document.documentElement.lang === 'en' ? 'en' : 'ar'; }
  var T = {
    sending: {ar:'\u062c\u0627\u0631\u064d \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643…', en:'Subscribing…'},
    ok: {ar:'\u062a\u0645 \u0627\u0634\u062a\u0631\u0627\u0643\u0643 \u0641\u064a \u0627\u0644\u0646\u0634\u0631\u0629 \u0627\u0644\u0628\u0631\u064a\u062f\u064a\u0629. \u0623\u0647\u0644\u064b\u0627 \u0628\u0643!', en:'You are subscribed to the newsletter. Welcome!'},
    bad: {ar:'\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0628\u0631\u064a\u062f \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0635\u0627\u0644\u062d.', en:'Please enter a valid email address.'},
    rate: {ar:'\u0645\u062d\u0627\u0648\u0644\u0627\u062a \u0643\u062b\u064a\u0631\u0629 \u0645\u0624\u062e\u0631\u064b\u0627 — \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u064b\u0627 \u0628\u0639\u062f \u0633\u0627\u0639\u0629.', en:'Too many attempts recently — please try again in an hour.'},
    fail: {ar:'\u062a\u0639\u0630\u0651\u0631 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643. \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u064b\u0627 \u0644\u0627\u062d\u0642\u064b\u0627.', en:'Could not subscribe. Please try again later.'}
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
