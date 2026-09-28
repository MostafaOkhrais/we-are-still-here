(function(){
  try{
    var q = null;
    try{ q = new URLSearchParams(window.location.search).get('lang'); }catch(e){}
    var lang = (q === 'ar' || q === 'en') ? q : null;
    if(!lang){
      try{ lang = window.localStorage.getItem('wash-lang') || 'en'; }catch(e){ lang = 'en'; }
    }
    if(lang !== 'ar' && lang !== 'en') lang = 'en';
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }catch(e){}
})();
