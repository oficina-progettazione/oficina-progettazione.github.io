(function(){
  var top=document.querySelector('.top'),btn=document.querySelector('.menu-btn'),nav=document.querySelector('.nav');
  if(btn){btn.addEventListener('click',function(){var o=nav.classList.toggle('open');btn.setAttribute('aria-expanded',o)});
    nav.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open');btn.setAttribute('aria-expanded',false)})});}

  // logo che si disegna: parte quando la copertina è davvero visibile
  var d=document.querySelector('.draw');
  if(d){
    var go=function(){d.classList.add('go')};
    var st=function(){requestAnimationFrame(function(){requestAnimationFrame(function(){setTimeout(go,150)})})};
    if(d.complete)st();else{d.addEventListener('load',st);d.addEventListener('error',go)}
    setTimeout(go,5000);
  }

  // testata e puntini: chiari sulle sezioni scure
  var screens=[].slice.call(document.querySelectorAll('.screen')),dots=document.querySelector('.dots');
  var dotLinks=dots?[].slice.call(dots.querySelectorAll('a')):[];
  function update(){
    var y=innerHeight*0.5,cur=null;
    screens.forEach(function(s){var r=s.getBoundingClientRect();if(r.top<=y&&r.bottom>y)cur=s});
    var dark=cur&&cur.classList.contains('dark');
    if(top){top.classList.toggle('light',!!dark);top.classList.toggle('solid',!screens.length&&scrollY>10)}
    if(dots){dots.classList.toggle('light',!!dark);dotLinks.forEach(function(a){a.classList.toggle('on',!!cur&&a.getAttribute('href')==='#'+cur.id)})}
  }
  addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();

  // home su computer: una rotellata = una sezione (come le pagine a schede)
  function scroller(){
    var c=[document.scrollingElement,document.documentElement,document.body];
    for(var i=0;i<c.length;i++){var e=c[i];if(e&&e.scrollHeight>e.clientHeight+20&&(e===document.scrollingElement||/auto|scroll/.test(getComputedStyle(e).overflowY)))return e}
    return null;
  }
  function sTop(){var s=scroller();return s?s.scrollTop:scrollY}
  function sTo(y){var s=scroller();(s||window).scrollTo({top:y,behavior:'smooth'})}
  if(screens.length&&dots){
    var lock=false,desk=function(){return innerWidth>860&&innerHeight>=600};
    var stops=function(){var s=scroller(),h=s?s.scrollHeight-s.clientHeight:document.documentElement.scrollHeight-innerHeight;return screens.map(function(x){return x.offsetTop}).concat([h])};
    var goTo=function(dir){
      var st=stops(),y=sTop(),i,t=null;
      if(dir>0){for(i=0;i<st.length;i++)if(st[i]>y+5){t=st[i];break}}
      else{for(i=st.length-1;i>=0;i--)if(st[i]<y-5){t=st[i];break}}
      if(t===null)return false;
      lock=true;sTo(t);setTimeout(function(){lock=false},900);return true;
    };
    addEventListener('wheel',function(e){
      if(!desk()||!scroller()||document.querySelector('.lb.open'))return;
      if(e.target.closest&&e.target.closest('textarea'))return;
      e.preventDefault();if(lock||Math.abs(e.deltaY)<4)return;goTo(e.deltaY>0?1:-1);
    },{passive:false});
    addEventListener('keydown',function(e){
      if(!desk()||!scroller()||/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||''))return;
      if(['PageDown','ArrowDown',' '].indexOf(e.key)>-1){e.preventDefault();if(!lock)goTo(1)}
      if(['PageUp','ArrowUp'].indexOf(e.key)>-1){e.preventDefault();if(!lock)goTo(-1)}
    });
    dotLinks.forEach(function(a){a.addEventListener('click',function(e){var t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();sTo(t.offsetTop)}})});
  }
  (document.body).addEventListener('scroll',update,{passive:true});

  // presentazioni: frecce, scorrimento automatico, tocco
  [].forEach.call(document.querySelectorAll('.slider'),function(sl){
    var s=[].slice.call(sl.querySelectorAll('.slide')),k=0,t;
    if(s.length<2)return;
    function show(i){s[k].classList.remove('on');k=(i+s.length)%s.length;s[k].classList.add('on')}
    function reset(){clearInterval(t);if(!matchMedia('(prefers-reduced-motion: reduce)').matches)t=setInterval(function(){if(!document.hidden)show(k+1)},6000)}
    sl.querySelector('.prev').addEventListener('click',function(){show(k-1);reset()});
    sl.querySelector('.next').addEventListener('click',function(){show(k+1);reset()});
    reset();
    var sx=null;sl.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
    sl.addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40){show(k+(dx<0?1:-1));reset()}sx=null});
  });

  // fogli che si aprono a ventaglio quando entrano nello schermo
  var desks=[].slice.call(document.querySelectorAll('.desk'));
  if(desks.length){
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.35});
      desks.forEach(function(d){io.observe(d)});
    } else desks.forEach(function(d){d.classList.add('in')});
  }

  // foto a schermo intero
  var items=[].slice.call(document.querySelectorAll('button[data-zoom]'));
  if(items.length){
    var lb=document.createElement('div');lb.className='lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');
    lb.innerHTML='<button class="x" aria-label="Chiudi">&times;</button><button class="pv" aria-label="Precedente">&lsaquo;</button><img alt=""><button class="nx" aria-label="Successiva">&rsaquo;</button>';
    document.body.appendChild(lb);
    var im=lb.querySelector('img'),cur=0;
    function show(i){cur=(i+items.length)%items.length;var p=items[cur].querySelector('img');im.src=p.currentSrc||p.src;im.alt=p.alt}
    function close(){lb.classList.remove('open');document.body.style.overflow='';items[cur].focus()}
    items.forEach(function(b,i){b.addEventListener('click',function(){show(i);lb.classList.add('open');document.body.style.overflow='hidden';lb.querySelector('.x').focus()})});
    lb.querySelector('.x').onclick=close;lb.querySelector('.pv').onclick=function(){show(cur-1)};lb.querySelector('.nx').onclick=function(){show(cur+1)};
    lb.addEventListener('click',function(e){if(e.target===lb)close()});
    addEventListener('keydown',function(e){if(!lb.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(cur-1);if(e.key==='ArrowRight')show(cur+1)});
    var sx=null;lb.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
    lb.addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40)show(cur+(dx<0?1:-1));sx=null});
  }
})();
