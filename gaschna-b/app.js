// GASCHNA Variante B — interactions
(function(){
  // Burger menu
  var burger=document.querySelector('.burger');
  var links=document.querySelector('.nav-links');
  if(burger&&links){
    burger.addEventListener('click',function(){
      var open=links.classList.toggle('open');
      burger.setAttribute('aria-expanded',open?'true':'false');
    });
    links.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click',function(){links.classList.remove('open');burger.setAttribute('aria-expanded','false');});
    });
  }

  // Welcome popup
  var ov=document.getElementById('welcome');
  var close=document.getElementById('welcome-close');
  function dismiss(){
    if(!ov)return;
    ov.classList.add('closing');
    setTimeout(function(){ov.setAttribute('hidden','');},300);
    document.body.style.overflow='';
  }
  if(ov){
    document.body.style.overflow='hidden';
    if(close)close.addEventListener('click',dismiss);
    ov.addEventListener('click',function(e){if(e.target===ov)dismiss();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')dismiss();});
  }

  // Sales overlay close
  var soClose=document.querySelector('.sales-overlay .so-close');
  if(soClose){soClose.addEventListener('click',function(){var o=document.querySelector('.sales-overlay');if(o)o.remove();});}

  // Demo form
  var form=document.getElementById('demo-form');
  if(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var msg=form.querySelector('.form-msg');
      if(msg){msg.hidden=false;}
      form.reset();
    });
  }
})();
