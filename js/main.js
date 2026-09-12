

(function(){
  var KEY='wash-lang';
  function current(){ try{return localStorage.getItem(KEY)||'ar';}catch(e){return 'ar';} }
  function apply(lang){
    document.documentElement.lang = lang==='ar'?'ar':'en';
    document.documentElement.dir = lang==='ar'?'rtl':'ltr';
    document.querySelectorAll('[data-ar]').forEach(function(el){
      var v = lang==='ar'?el.getAttribute('data-ar'):el.getAttribute('data-en');
      if(v!=null) el.textContent = v;
    });
    document.querySelectorAll('[data-ar-ph]').forEach(function(el){
      el.placeholder = lang==='ar'?el.getAttribute('data-ar-ph'):el.getAttribute('data-en-ph');
    });
    document.querySelectorAll('[data-ar-alt]').forEach(function(el){
      var alt = lang==='ar'?el.getAttribute('data-ar-alt'):el.getAttribute('data-en-alt');
      if(alt!=null) el.setAttribute('alt', alt);
    });
    document.querySelectorAll('[data-ar-label]').forEach(function(el){
      var lbl = lang==='ar'?el.getAttribute('data-ar-label'):el.getAttribute('data-en-label');
      if(lbl!=null) el.setAttribute('aria-label', lbl);
    });
    document.querySelectorAll('.lang-toggle').forEach(function(b){
      b.textContent = lang==='ar'?'EN':'عربي';
      b.setAttribute('aria-label', lang==='ar'?'Switch to English':'التبديل إلى العربية');
      b.setAttribute('aria-checked', lang==='en'?'true':'false');
    });
    document.querySelectorAll('.to-top').forEach(function(t){
      t.setAttribute('aria-label', lang==='ar'?'العودة إلى الأعلى':'Back to top');
    });
    var menu=document.querySelector('.menu-btn');
    var links=document.querySelector('.nav-links');
    if(menu&&links){
      var open=links.classList.contains('open');
      menu.setAttribute('aria-label',open?(lang==='ar'?'إغلاق القائمة':'Close menu'):(lang==='ar'?'فتح القائمة':'Open menu'));
    }
    try{localStorage.setItem(KEY,lang);}catch(e){}
  }
  window.WASH_setLang=function(lang){apply(lang);};
  
  
  
  function initReveal(){
    var els=document.querySelectorAll(
      'main .sec-title, main .sec-sub, main .card, main .stat-card, '+
      'main .value-card, main .program-card, main .leader-card, '+
      'main .area-card, main .member-card, main .product, main .note');
    els.forEach(function(el){
      el.classList.add('reveal');
      var sibs=Array.prototype.filter.call(el.parentElement.children,
        function(c){return c.classList.contains('reveal');});
      var i=sibs.indexOf(el);
      el.style.setProperty('--reveal-delay',(Math.min(i,5)*0.07)+'s');
    });
    if(!('IntersectionObserver' in window)){
      els.forEach(function(el){el.classList.add('visible');});
      return;
    }
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){en.target.classList.add('visible');io.unobserve(en.target);}
      });
    },{threshold:.1,rootMargin:'0px 0px -40px 0px'});
    els.forEach(function(el){io.observe(el);});
  }
  
  
  
  
  function initCounters(){
    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var nums=document.querySelectorAll('.stat-num:not([data-ar])');
    if(!nums.length){return;}
    function animate(el){
      var m=/^([^\d]*)(\d+)([\s\S]*)$/.exec(el.textContent.trim());
      if(!m){return;}
      var pre=m[1],target=parseInt(m[2],10),suf=m[3];
      if(reduce||!(target>0)){el.textContent=pre+target+suf;return;}
      var dur=1400,t0=null;
      function frame(t){
        if(t0===null){t0=t;}
        var p=Math.min((t-t0)/dur,1);
        var e=1-Math.pow(1-p,4);
        el.textContent=pre+Math.round(target*e)+suf;
        if(p<1){requestAnimationFrame(frame);}
      }
      requestAnimationFrame(frame);
    }
    if(!('IntersectionObserver' in window)){nums.forEach(animate);return;}
    var cio=new IntersectionObserver(function(es){
      es.forEach(function(en){
        if(en.isIntersecting){animate(en.target);cio.unobserve(en.target);}
      });
    },{threshold:.4});
    nums.forEach(function(n){cio.observe(n);});
  }
  document.addEventListener('DOMContentLoaded',function(){
    apply(current());
    document.querySelectorAll('.lang-toggle').forEach(function(b){
      b.addEventListener('click',function(){ apply(current()==='ar'?'en':'ar'); });
    });
    var menu=document.querySelector('.menu-btn');
    var links=document.querySelector('.nav-links');
    if(menu&&links){
      menu.setAttribute('aria-label','فتح القائمة');
      menu.setAttribute('aria-expanded','false');
      menu.setAttribute('aria-controls','main-nav');
      links.setAttribute('id','main-nav');
      menu.addEventListener('click',function(){
        var open=links.classList.toggle('open');
        var lang=document.documentElement.lang==='ar'?'ar':'en';
        menu.setAttribute('aria-expanded',open?'true':'false');
        menu.setAttribute('aria-label',open?(lang==='ar'?'إغلاق القائمة':'Close menu'):(lang==='ar'?'فتح القائمة':'Open menu'));
      });
      document.addEventListener('keydown',function(e){
        if(e.key==='Escape'&&links.classList.contains('open')){
          links.classList.remove('open');
          var lang=document.documentElement.lang==='ar'?'ar':'en';
          menu.setAttribute('aria-expanded','false');
          menu.setAttribute('aria-label',lang==='ar'?'فتح القائمة':'Open menu');
          menu.focus();
        }
      });
    }
    
    
    
    var header=document.querySelector('.site-header');
    var progress=document.createElement('div');
    progress.className='scroll-progress';
    progress.setAttribute('aria-hidden','true');
    document.body.appendChild(progress);
    var toTop=document.createElement('button');
    toTop.className='to-top';
    toTop.setAttribute('type','button');
    var NS='http://www.w3.org/2000/svg';
    var svg=document.createElementNS(NS,'svg');
    svg.setAttribute('viewBox','0 0 24 24');
    svg.setAttribute('fill','none');
    svg.setAttribute('stroke','currentColor');
    svg.setAttribute('stroke-width','2.4');
    svg.setAttribute('stroke-linecap','round');
    svg.setAttribute('stroke-linejoin','round');
    svg.setAttribute('aria-hidden','true');
    var tline=document.createElementNS(NS,'line');
    tline.setAttribute('x1','12');tline.setAttribute('y1','19');
    tline.setAttribute('x2','12');tline.setAttribute('y2','5');
    var tpoly=document.createElementNS(NS,'polyline');
    tpoly.setAttribute('points','5 12 12 5 19 12');
    svg.appendChild(tline);svg.appendChild(tpoly);toTop.appendChild(svg);
    document.body.appendChild(toTop);
    function refreshToTopLabel(){
      toTop.setAttribute('aria-label',
        document.documentElement.lang==='ar'?'العودة إلى الأعلى':'Back to top');
    }
    refreshToTopLabel();
    toTop.addEventListener('click',function(){
      var rm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({top:0,behavior:rm?'auto':'smooth'});
    });
    var ticking=false;
    function onScroll(){
      var y=window.scrollY||0;
      if(header) header.classList.toggle('scrolled',y>8);
      var h=document.documentElement.scrollHeight-window.innerHeight;
      progress.style.transform='scaleX('+(h>0?Math.min(y/h,1):0)+')';
      toTop.classList.toggle('show',y>600);
      ticking=false;
    }
    window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(onScroll);}},{passive:true}); onScroll();
    
    initReveal();
    
    initCounters();
    
    var form=document.querySelector('form.contact');
    if(form){
      function setErr(f,on){
        var err=f.getAttribute('name')?form.querySelector('#err-'+f.getAttribute('name')):null;
        if(on){
          f.setAttribute('aria-invalid','true');
          if(err){f.setAttribute('aria-describedby',err.id);err.hidden=false;}
        }else{
          f.removeAttribute('aria-invalid');f.removeAttribute('aria-describedby');
          if(err){err.hidden=true;}
        }
      }
      function stripCRLF(s){return String(s||'').replace(/[\r\n]+/g,' ').slice(0,2000);}
      var EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      form.addEventListener('submit',function(e){
        var valid=true,first=null;
        form.querySelectorAll('[required]').forEach(function(f){
          var v=f.value.trim();
          var bad=!v||(f.getAttribute('type')==='email'&&!EMAIL_RE.test(v));
          setErr(f,bad);
          if(bad){valid=false;if(!first){first=f;}}
        });
        if(!valid){e.preventDefault();if(first){first.focus();}return;}
        var subj=form.querySelector('[name="subject"]');
        if(subj){subj.value=stripCRLF(subj.value);}
        var nm=form.querySelector('[name="name"]');
        if(nm){nm.value=stripCRLF(nm.value);}
        var em=form.querySelector('[name="email"]');
        if(em){em.value=stripCRLF(em.value).replace(/\s+/g,'');}
      });
      form.querySelectorAll('input,textarea').forEach(function(f){
        f.addEventListener('input',function(){
          if(f.hasAttribute('aria-invalid')&&f.value.trim()){setErr(f,false);}
        });
      });
    }
  });
})();