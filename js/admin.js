(function(){
  'use strict';
  function lang(){ return document.documentElement.lang === 'en' ? 'en' : 'ar'; }
  var T = {
    loginFail: {ar:'\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062f\u062e\u0648\u0644 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d\u0629.', en:'Incorrect sign-in details.'},
    notAdmin: {ar:'\u0647\u0630\u0627 \u0627\u0644\u062d\u0633\u0627\u0628 \u063a\u064a\u0631 \u0645\u0635\u0631\u0651\u062d \u0644\u0647 \u0628\u0627\u0644\u0625\u062f\u0627\u0631\u0629.', en:'This account is not authorized for admin access.'},
    expired: {ar:'\u0627\u0646\u062a\u0647\u062a \u0627\u0644\u062c\u0644\u0633\u0629 — \u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0645\u062c\u062f\u062f\u064b\u0627.', en:'Session expired — please sign in again.'},
    loadFail: {ar:'\u062a\u0639\u0630\u0651\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a.', en:'Could not load data.'},
    saveFail: {ar:'\u062a\u0639\u0630\u0651\u0631 \u062d\u0641\u0638 \u0627\u0644\u062a\u063a\u064a\u064a\u0631.', en:'Could not save the change.'},
    welcome: {ar:'\u0645\u0631\u062d\u0628\u064b\u0627', en:'Welcome'},
    noRows: {ar:'\u0644\u0627 \u062a\u0648\u062c\u062f \u0639\u0646\u0627\u0635\u0631 \u0628\u0639\u062f.', en:'No items yet.'},
    unsub: {ar:'\u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643', en:'Unsubscribe'},
    resub: {ar:'\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643', en:'Resubscribe'},
    subjectFallback: {ar:'(\u0628\u062f\u0648\u0646 \u0645\u0648\u0636\u0648\u0639)', en:'(no subject)'},
    st: {
      new: {ar:'\u062c\u062f\u064a\u062f\u0629', en:'New'}, read: {ar:'\u0645\u0642\u0631\u0648\u0621\u0629', en:'Read'},
      replied: {ar:'\u062a\u0645 \u0627\u0644\u0631\u062f', en:'Replied'}, archived: {ar:'\u0645\u0624\u0631\u0634\u0641\u0629', en:'Archived'},
      active: {ar:'\u0646\u0634\u0637', en:'Active'}, unsubscribed: {ar:'\u0645\u0644\u063a\u064a', en:'Unsubscribed'}
    }
  };
  function t(k){ return T[k][lang()]; }
  function stLabel(s){ return (T.st[s] || {ar: s, en: s})[lang()]; }

  var B = window.WASH_BACKEND || {};
  var msgRows = [], subRows = [], postRows = [];
  var TK = 'wash-admin-token', EM = 'wash-admin-email';

  function api(path, opts){
    opts = opts || {};
    var headers = {'apikey': B.anonKey, 'Content-Type': 'application/json'};
    var tok = null;
    try { tok = sessionStorage.getItem(TK); } catch(e){}
    if(tok) headers['Authorization'] = 'Bearer ' + tok;
    return fetch(B.api(path), {
      method: opts.method || 'GET',
      headers: Object.assign(headers, opts.headers || {}),
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function(r){
      if(r.status === 401 || r.status === 403){
        var e = new Error('auth'); e.code = 'auth'; throw e;
      }
      return r.json().catch(function(){ return null; }).then(function(b){
        if(!r.ok){ var e2 = new Error('api'); e2.code = 'api'; throw e2; }
        return b;
      });
    });
  }

  function el(tag, cls, text){
    var n = document.createElement(tag);
    if(cls) n.className = cls;
    if(text != null) n.textContent = text;
    return n;
  }
  function fmtDate(iso){
    try { return new Date(iso).toLocaleString(lang() === 'ar' ? 'ar' : 'en-GB', {dateStyle: 'medium', timeStyle: 'short'}); }
    catch(e){ return iso; }
  }
  function showSt(id, cls, msg){
    var s = document.getElementById(id);
    if(!s) return;
    s.hidden = false; s.className = 'form-status ' + cls; s.textContent = msg;
  }
  function hideSt(id){ var s = document.getElementById(id); if(s) s.hidden = true; }

  function setSession(token, email){
    try {
      if(token){ sessionStorage.setItem(TK, token); sessionStorage.setItem(EM, email); }
      else { sessionStorage.removeItem(TK); sessionStorage.removeItem(EM); }
    } catch(e){}
  }

  function showApp(email){
    document.getElementById('login-view').hidden = true;
    document.getElementById('app-view').hidden = false;
    var who = document.getElementById('admin-who');
    who.textContent = t('welcome') + '\u060c ' + email;
    loadAll();
  }
  function showLogin(){
    document.getElementById('app-view').hidden = true;
    document.getElementById('login-view').hidden = false;
  }
  function logout(msg){
    var p = null;
    try { p = sessionStorage.getItem(TK); } catch(e){}
    setSession(null, null);
    showLogin();
    if(p){
      fetch(B.api('/auth/v1/logout'), {
        method: 'POST', headers: {'apikey': B.anonKey, 'Authorization': 'Bearer ' + p}
      }).catch(function(){});
    }
    if(msg) showSt('login-status', 'err', msg);
  }

  function emptyRow(tbody, cols){
    var tr = el('tr'), td = el('td', null, t('noRows'));
    td.setAttribute('colspan', String(cols));
    tr.appendChild(td); tbody.appendChild(tr);
  }

  function renderMessages(rows){
    msgRows = rows || [];
    var tbody = document.querySelector('#msg-table tbody');
    tbody.textContent = '';
    var fresh = 0;
    if(!rows || !rows.length){ emptyRow(tbody, 5); }
    rows.forEach(function(m){
      if(m.status === 'new') fresh++;
      var tr = el('tr');
      tr.appendChild(el('td', null, fmtDate(m.created_at)));
      tr.appendChild(el('td', null, m.name || ''));
      var tdE = el('td'), a = el('a', null, m.email || '');
      a.setAttribute('href', 'mailto:' + encodeURIComponent(m.email || '')); a.setAttribute('dir', 'ltr');
      tdE.appendChild(a); tr.appendChild(tdE);
      var tdM = el('td', 'msg');
      var det = el('details'), sum = el('summary', null, (m.subject || t('subjectFallback')));
      var p = el('p', null, m.message || '');
      var small = el('small', null, (m.lang === 'en' ? 'EN' : 'AR'));
      det.appendChild(sum); det.appendChild(p); det.appendChild(small); tdM.appendChild(det);
      tr.appendChild(tdM);
      var tdS = el('td'), sel = el('select', 'status-sel');
      sel.setAttribute('data-id', m.id);
      ['new', 'read', 'replied', 'archived'].forEach(function(s){
        var o = el('option', null, stLabel(s));
        o.value = s; if(m.status === s) o.selected = true;
        sel.appendChild(o);
      });
      sel.setAttribute('aria-label', stLabel(m.status));
      sel.addEventListener('change', function(){ setMsgStatus(m.id, sel.value, sel); });
      tdS.appendChild(sel); tr.appendChild(tdS);
      tbody.appendChild(tr);
    });
    document.getElementById('stat-new').textContent = String(fresh);
  }

  function setMsgStatus(id, status, sel){
    sel.disabled = true;
    api('/rest/v1/contact_messages?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH', headers: {'Prefer': 'return=minimal'}, body: {status: status}
    }).then(function(){
      sel.disabled = false; sel.setAttribute('aria-label', stLabel(status));
      loadMessages(true);
    }).catch(function(e){
      sel.disabled = false;
      if(e && e.code === 'auth'){ logout(t('expired')); return; }
      showSt('app-status', 'err', t('saveFail'));
      loadMessages(true);
    });
  }

  function renderSubs(rows){
    subRows = rows || [];
    var tbody = document.querySelector('#sub-table tbody');
    tbody.textContent = '';
    var active = 0;
    if(!rows || !rows.length){ emptyRow(tbody, 5); }
    rows.forEach(function(s){
      if(s.status === 'active') active++;
      var tr = el('tr');
      var tdE = el('td'), a = el('a', null, s.email || '');
      a.setAttribute('href', 'mailto:' + encodeURIComponent(s.email || '')); a.setAttribute('dir', 'ltr');
      tdE.appendChild(a); tr.appendChild(tdE);
      tr.appendChild(el('td', null, s.name || '—'));
      tr.appendChild(el('td', null, fmtDate(s.created_at)));
      var tdB = el('td'), badge = el('span', 'badge ' + s.status, stLabel(s.status));
      tdB.appendChild(badge); tr.appendChild(tdB);
      var tdA = el('td'), btn = el('button', 'btn ghost', s.status === 'active' ? t('unsub') : t('resub'));
      btn.setAttribute('type', 'button');
      btn.addEventListener('click', function(){ toggleSub(s, btn); });
      tdA.appendChild(btn); tr.appendChild(tdA);
      tbody.appendChild(tr);
    });
    document.getElementById('stat-subs').textContent = String(active);
  }

  function toggleSub(s, btn){
    var to = s.status === 'active' ? 'unsubscribed' : 'active';
    var patch = {status: to};
    patch.unsubscribed_at = to === 'unsubscribed' ? new Date().toISOString() : null;
    btn.disabled = true;
    api('/rest/v1/newsletter_subscribers?id=eq.' + encodeURIComponent(s.id), {
      method: 'PATCH', headers: {'Prefer': 'return=minimal'}, body: patch
    }).then(function(){ loadSubs(); })
    .catch(function(e){
      btn.disabled = false;
      if(e && e.code === 'auth'){ logout(t('expired')); return; }
      showSt('app-status', 'err', t('saveFail'));
    });
  }

  function loadMessages(quiet){
    return api('/rest/v1/contact_messages?select=id,name,email,subject,message,lang,status,created_at&order=created_at.desc&limit=100')
      .then(renderMessages)
      .catch(function(e){
        if(e && e.code === 'auth'){ logout(t('expired')); return; }
        if(!quiet) showSt('app-status', 'err', t('loadFail'));
      });
  }
  function loadSubs(){
    return api('/rest/v1/newsletter_subscribers?select=id,email,name,lang,status,created_at&order=created_at.desc&limit=200')
      .then(renderSubs)
      .catch(function(e){
        if(e && e.code === 'auth'){ logout(t('expired')); return; }
        showSt('app-status', 'err', t('loadFail'));
      });
  }
  function loadAll(){ hideSt('app-status'); loadMessages(); loadSubs(); loadPosts(); }

  var POST_CAT = {
    news: {ar: '\u062e\u0628\u0631', en: 'News'},
    update: {ar: '\u062a\u0637\u0648\u0631', en: 'Update'},
    event: {ar: '\u0641\u0639\u0627\u0644\u064a\u0629', en: 'Event'}
  };
  var PT = {
    published: {ar: '\u0645\u0646\u0634\u0648\u0631', en: 'Published'},
    draft: {ar: '\u0645\u0633\u0648\u062f\u0629', en: 'Draft'},
    edit: {ar: '\u062a\u0639\u062f\u064a\u0644', en: 'Edit'},
    del: {ar: '\u062d\u0630\u0641', en: 'Delete'},
    publish: {ar: '\u0646\u0634\u0631', en: 'Publish'},
    unpublish: {ar: '\u0625\u062e\u0641\u0627\u0621', en: 'Unpublish'},
    confirmDel: {ar: '\u062d\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0645\u0646\u0634\u0648\u0631 \u0646\u0647\u0627\u0626\u064a\u064b\u0627\u061f', en: 'Delete this post permanently?'},
    saved: {ar: '\u062a\u0645 \u0627\u0644\u062d\u0641\u0638 \u0628\u0646\u062c\u0627\u062d.', en: 'Saved successfully.'},
    deleted: {ar: '\u062a\u0645 \u0627\u0644\u062d\u0630\u0641.', en: 'Deleted.'},
    needBoth: {ar: '\u0623\u062f\u062e\u0644 \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0648\u0627\u0644\u0646\u0635 \u0628\u0627\u0644\u0644\u063a\u062a\u064a\u0646.', en: 'Enter the title and body in both languages.'}
  };
  function pt(k){ return PT[k][lang()]; }
  function pcat(c){ return (POST_CAT[c] || {ar: c, en: c})[lang()]; }
  function postTitle(p){ return (lang() === 'ar' ? p.title_ar : p.title_en) || ''; }
  function postFail(e){
    if(e && e.code === 'auth'){ logout(t('expired')); return; }
    showSt('post-status', 'err', t('saveFail'));
  }

  function loadPosts(){
    return api('/rest/v1/news_posts?select=id,title_ar,title_en,body_ar,body_en,category,event_date,location,published,published_at,created_at&order=created_at.desc&limit=100')
      .then(renderPosts)
      .catch(function(e){
        if(e && e.code === 'auth'){ logout(t('expired')); return; }
        showSt('app-status', 'err', t('loadFail'));
      });
  }

  function renderPosts(rows){
    postRows = rows || [];
    var tbody = document.querySelector('#post-table tbody');
    tbody.textContent = '';
    if(!rows || !rows.length){ emptyRow(tbody, 5); return; }
    rows.forEach(function(p){
      var tr = el('tr');
      tr.appendChild(el('td', null, postTitle(p)));
      tr.appendChild(el('td', null, pcat(p.category)));
      var tdB = el('td'),
          badge = el('span', 'badge ' + (p.published ? 'active' : 'archived'), p.published ? pt('published') : pt('draft'));
      tdB.appendChild(badge); tr.appendChild(tdB);
      tr.appendChild(el('td', null, fmtDate(p.published_at || p.created_at)));
      var tdA = el('td');
      var be = el('button', 'btn ghost', pt('edit')); be.setAttribute('type', 'button');
      be.addEventListener('click', function(){ editPost(p); });
      var bp = el('button', 'btn ghost', p.published ? pt('unpublish') : pt('publish')); bp.setAttribute('type', 'button');
      bp.addEventListener('click', function(){ togglePublish(p, bp); });
      var bd = el('button', 'btn ghost', pt('del')); bd.setAttribute('type', 'button');
      bd.addEventListener('click', function(){ delPost(p); });
      tdA.appendChild(be); tdA.appendChild(bp); tdA.appendChild(bd);
      tr.appendChild(tdA);
      tbody.appendChild(tr);
    });
  }

  function pv(id){ var n = document.getElementById(id); return n ? n.value.trim() : ''; }
  function resetPostForm(){
    document.getElementById('p-id').value = '';
    document.getElementById('post-form').reset();
    document.getElementById('post-cancel').hidden = true;
    hideSt('post-status');
  }
  function editPost(p){
    document.getElementById('p-id').value = p.id;
    document.getElementById('p-title-ar').value = p.title_ar || '';
    document.getElementById('p-title-en').value = p.title_en || '';
    document.getElementById('p-body-ar').value = p.body_ar || '';
    document.getElementById('p-body-en').value = p.body_en || '';
    document.getElementById('p-cat').value = p.category || 'news';
    document.getElementById('p-date').value = p.event_date || '';
    document.getElementById('p-loc').value = p.location || '';
    document.getElementById('p-pub').checked = !!p.published;
    document.getElementById('post-cancel').hidden = false;
    hideSt('post-status');
    document.getElementById('post-form').scrollIntoView();
  }
  function savePost(e){
    e.preventDefault();
    hideSt('post-status');
    var id = document.getElementById('p-id').value;
    var row = {
      title_ar: pv('p-title-ar'), title_en: pv('p-title-en'),
      body_ar: pv('p-body-ar'), body_en: pv('p-body-en'),
      category: document.getElementById('p-cat').value || 'news',
      event_date: pv('p-date') || null,
      location: pv('p-loc') || null,
      published: document.getElementById('p-pub').checked
    };
    var needIds = ['p-title-ar', 'p-title-en', 'p-body-ar', 'p-body-en'];
    needIds.forEach(function(id){ document.getElementById(id).removeAttribute('aria-invalid'); });
    var missing = needIds.filter(function(id){ return !document.getElementById(id).value.trim(); });
    if(missing.length){
      missing.forEach(function(id){ document.getElementById(id).setAttribute('aria-invalid', 'true'); });
      document.getElementById(missing[0]).focus();
      showSt('post-status', 'err', pt('needBoth')); return;
    }
    var req = id
      ? api('/rest/v1/news_posts?id=eq.' + encodeURIComponent(id), {method: 'PATCH', headers: {'Prefer': 'return=minimal'}, body: row})
      : api('/rest/v1/news_posts', {method: 'POST', headers: {'Prefer': 'return=minimal'}, body: row});
    req.then(function(){
      resetPostForm();
      showSt('post-status', 'ok', pt('saved'));
      loadPosts();
    }).catch(postFail);
  }
  function togglePublish(p, btn){
    btn.disabled = true;
    api('/rest/v1/news_posts?id=eq.' + encodeURIComponent(p.id), {
      method: 'PATCH', headers: {'Prefer': 'return=minimal'}, body: {published: !p.published}
    }).then(function(){ loadPosts(); }).catch(function(e){
      btn.disabled = false;
      postFail(e);
    });
  }
  function delPost(p){
    if(!window.confirm(pt('confirmDel'))) return;
    api('/rest/v1/news_posts?id=eq.' + encodeURIComponent(p.id), {method: 'DELETE'})
      .then(function(){ showSt('post-status', 'ok', pt('deleted')); loadPosts(); })
      .catch(postFail);
  }

  function csvCell(v){
    var s = v == null ? '' : String(v);
    if(/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }
  function downloadCSV(name, headers, rows){
    var lines = [headers.map(csvCell).join(',')];
    rows.forEach(function(r){ lines.push(r.map(csvCell).join(',')); });
    var blob;
    try {
      blob = new Blob(["\uFEFF" + lines.join('\r\n')], {type: 'text/csv;charset=utf-8'});
    } catch(e){ return; }
    var a = el('a');
    var url = null;
    try {
      url = URL.createObjectURL(blob);
    } catch(e){ return; }
    a.setAttribute('href', url);
    a.setAttribute('download', name);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    try { URL.revokeObjectURL(url); } catch(e){}
  }
  function stamp(){
    var d = new Date();
    function p(n){ return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }
  function exportMessages(){
    downloadCSV('wash-messages-' + stamp() + '.csv',
      ['created_at', 'name', 'email', 'subject', 'message', 'lang', 'status'],
      msgRows.map(function(m){ return [m.created_at, m.name, m.email, m.subject, m.message, m.lang, m.status]; }));
  }
  function exportSubs(){
    downloadCSV('wash-subscribers-' + stamp() + '.csv',
      ['created_at', 'email', 'name', 'lang', 'status'],
      subRows.map(function(s){ return [s.created_at, s.email, s.name, s.lang, s.status]; }));
  }
  function exportPosts(){
    downloadCSV('wash-posts-' + stamp() + '.csv',
      ['created_at', 'title_ar', 'title_en', 'category', 'published', 'event_date'],
      postRows.map(function(p){ return [p.created_at, p.title_ar, p.title_en, p.category, p.published, p.event_date]; }));
  }

  document.addEventListener('DOMContentLoaded', function(){
    if(!B.api) return;
    document.getElementById('logout-btn').addEventListener('click', function(){ logout(); });
    document.getElementById('exp-msg').addEventListener('click', exportMessages);
    document.getElementById('exp-sub').addEventListener('click', exportSubs);
    document.getElementById('exp-post').addEventListener('click', exportPosts);
    document.getElementById('post-form').addEventListener('submit', savePost);
    document.getElementById('post-cancel').addEventListener('click', resetPostForm);
    document.getElementById('login-form').addEventListener('submit', function(e){
      e.preventDefault();
      hideSt('login-status');
      var email = document.getElementById('a-email').value.trim().toLowerCase();
      var pass = document.getElementById('a-pass').value;
      if(!email || !pass){ showSt('login-status', 'err', t('loginFail')); return; }
      fetch(B.api('/auth/v1/token?grant_type=password'), {
        method: 'POST',
        headers: {'apikey': B.anonKey, 'Content-Type': 'application/json'},
        body: JSON.stringify({email: email, password: pass})
      }).then(function(r){
        return r.json().catch(function(){ return null; }).then(function(b){
          if(!r.ok || !b || !b.access_token) throw new Error('login');
          return b;
        });
      }).then(function(sess){
        setSession(sess.access_token, email);
        return api('/rest/v1/admin_allowlist?select=email&email=eq.' + encodeURIComponent(email) + '&limit=1')
          .then(function(rows){
            if(!rows || !rows.length){ setSession(null, null); showSt('login-status', 'err', t('loginFail')); return; }
            document.getElementById('a-pass').value = '';
            showApp(email);
          });
      }).catch(function(e){
        setSession(null, null);
        showSt('login-status', 'err', t('loginFail'));
      });
    });
    var tok = null, em = null;
    try { tok = sessionStorage.getItem(TK); em = sessionStorage.getItem(EM); } catch(e){}
    if(tok && em){
      api('/rest/v1/admin_allowlist?select=email&email=eq.' + encodeURIComponent(em) + '&limit=1')
        .then(function(rows){
          if(rows && rows.length) showApp(em);
          else logout();
        }).catch(function(){ logout(); });
    }
  });
})();
