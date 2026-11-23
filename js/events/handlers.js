/*
 * handlers.js
 * Obsługa zdarzeń: zmiana języka/motywu, podpinanie kliknięć (bind*), akcje przycisków (handleA / handleO).
 */

/* ============ ZDARZENIA ============ */
function setLang(l){
  if(l===LANG)return;
  if(UI.ov==='setup')grabNames();
  if(UI.ov==='accuse'&&$('#as')){const d=UI.ovData;d.s=$('#as').value;d.p=$('#ap').value;d.r=$('#ar').value;const j=document.querySelector('input[name=aj]:checked');d.j=j?j.value:d.j;const e=document.querySelector('input[name=aeq]:checked');d.eqi=e?+e.value:d.eqi}
  LANG=l;document.documentElement.lang=l;try{localStorage.setItem('inspektor-lang',l)}catch(e){}
  render();
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-lang]');if(b)setLang(b.dataset.lang);const t=e.target.closest('[data-theme-set]');if(t)setTheme(t.dataset.themeSet)});
function setTheme(t){
  if(UI.ov==='setup')grabNames();
  THEME=t;document.documentElement.setAttribute('data-theme',t);try{localStorage.setItem('inspektor-theme',t)}catch(e){}
  render();
}
try{window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(!THEME)render()})}catch(e){}
function bindTop(){
  document.querySelectorAll('.top [data-a]').forEach(b=>b.onclick=()=>handleA(b.dataset.a));
}
function bindMap(){
  document.querySelectorAll('#dyn .mapnode.can').forEach(g=>{g.onclick=()=>moveTo(g.dataset.node);g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();moveTo(g.dataset.node)}}});
}
function bindSide(){
  document.querySelectorAll('.side [data-a]').forEach(b=>b.onclick=()=>handleA(b.dataset.a));
  document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>moveTo(b.dataset.go));
  document.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>{const a=b.dataset.act;const g={docs:()=>readDeck('plant'),office:()=>readDeck('office'),village:()=>readDeck('village'),fish:()=>readDeck('fish'),refill:doRefill,skip:()=>{S.last=null;const p=curP();addLog(()=>T(`${pname(p)} nie wykonuje akcji.`,`${pname(p)} takes no action.`));finishAction()},test:()=>{S.actUI='test';render()},conf:()=>{S.actUI='conf';render()}};g[a]&&g[a]()});
  document.querySelectorAll('[data-test]').forEach(b=>b.onclick=()=>doTest(b.dataset.test));
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{UI.tab=b.dataset.tab;render()});
  document.querySelectorAll('[data-evf]').forEach(b=>b.onclick=()=>{UI.evf=b.dataset.evf;render()});
  document.querySelectorAll('[data-mark]').forEach(b=>b.onclick=()=>{const p=curP();const c=b.dataset.mark;const cur=p.marks[c]||(p.auto[c]?'x':'');const nx={'':'x',x:'q',q:'v',v:''}[cur];p.marks[c]=nx;if(nx===''&&p.auto[c])p.marks[c]='x';render()});
  const nt=$('#notes');if(nt)nt.oninput=()=>{curP().notes=nt.value;save()};
}
function handleA(a){
  switch(a){
    case 'rules':UI.ov='rules';renderOv();break;
    case 'cheat':UI.ov='cheat';renderOv();break;
    case 'teacher':UI.ov='teacher';renderOv();break;
    case 'newgame':if(S&&S.phase==='play'){UI.ov='confirmNew';renderOv()}else{S=null;UI.ov='setup';render()}break;
    case 'roll':rollDie();break;
    case 'stay':stayHere();break;
    case 'back':S.actUI=null;render();break;
    case 'confgo':doConfront($('#cs').value,$('#cr').value);break;
    case 'follow':doFollow();break;
    case 'endturn':endTurn();break;
    case 'accuse':UI.ovData={};UI.ov='accuse';renderOv();break;
    case 'showend':UI.ov='end';renderOv();break;
  }
}
function bindOv(){
  const ov=$('#ov');
  ov.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>handleO(b.dataset.o));
  ov.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{grabNames();UI.setupN=+b.dataset.n;renderOv()});
  ov.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{grabNames();UI.setupMode=b.dataset.mode;renderOv()});
  ov.querySelectorAll('[data-timer]').forEach(b=>b.onclick=()=>{grabNames();UI.setupTimer=+b.dataset.timer;renderOv()});
  const cb=$('#cheatcb');if(cb)cb.onchange=()=>{UI.setupCheat=cb.checked};
  if(UI.ov==='accuse'){
    const keep=()=>{const d=UI.ovData;d.s=$('#as').value;d.p=$('#ap').value;d.r=$('#ar').value;const j=ov.querySelector('input[name=aj]:checked');d.j=j?j.value:null;const e=ov.querySelector('input[name=aeq]:checked');d.eqi=e?+e.value:-1};
    $('#as').onchange=()=>{keep();UI.ovData.eqi=-1;renderOv()};
    ['#ap','#ar'].forEach(s=>$(s).onchange=keep);
    ov.querySelectorAll('input[type=radio]').forEach(r=>r.onchange=keep);
  }
  if(UI.ov==='teacher'){
    const hb=$('#holdbtn');let t=null,st=0;
    const stop=()=>{cancelAnimationFrame(t);hb.style.setProperty('--p',0)};
    const tick=()=>{const p=Math.min(1,(performance.now()-st)/2000);hb.style.setProperty('--p',p);if(p>=1){const s=S.sol;$('#tsol').innerHTML=`<div class="eventcard"><b>${esc(sN(s.s))} (${SUB[s.s].f})</b> · ${esc(pN(s.p))} · ${esc(rN(s.r))}</div>`;stop();return}t=requestAnimationFrame(tick)};
    hb.onpointerdown=e=>{e.preventDefault();st=performance.now();tick()};
    hb.onpointerup=hb.onpointerleave=hb.onpointercancel=()=>{if($('#tsol').innerHTML==='')stop()};
  }
  if(UI.ov==='end'){
    const sv=()=>{const r=S.report;r.insp=+$('#rinsp').value;r.find=$('#rfind').value;r.proof=$('#rproof').value;r.own=$('#rown').value;r.reco=[...ov.querySelectorAll('[data-reco]:checked')].map(x=>+x.dataset.reco);save()};
    ov.querySelectorAll('textarea,select,input').forEach(el=>{el.oninput=sv;el.onchange=sv});
  }
}
function grabNames(){for(let i=0;i<5;i++){const el=$('#nm'+i);if(el)UI.names[i]=el.value}}
function handleO(o){
  switch(o){
    case 'close':closeOv();if(S&&S.phase==='play'&&S.stage==='curtain'){UI.ov='curtain';renderOv()}break;
    case 'start':grabNames();newGame();break;
    case 'resume':try{S=JSON.parse(localStorage.getItem(KEY));UI.ov=null;render()}catch(e){}break;
    case 'rules':UI.ov='rules';renderOv();break;
    case 'beginTurn':UI.ov=null;startTurn();break;
    case 'doNew':try{localStorage.removeItem(KEY)}catch(e){}S=null;UI.ov='setup';render();break;
    case 'pause':S.paused=!S.paused;UI.ov='teacher';render();break;
    case 'add5':if(S.timeLeft!=null)S.timeLeft+=5*60000;else S.timeLeft=5*60000;UI.ov='teacher';render();break;
    case 'timeup':S.timeLeft=0;tickTimer();closeOv();break;
    case 'accuseGo':{
      const d=UI.ovData;d.s=$('#as').value;d.p=$('#ap').value;d.r=$('#ar').value;
      const j=document.querySelector('input[name=aj]:checked');const e=document.querySelector('input[name=aeq]:checked');
      if(!j){$('#aerr').textContent=T('Wybierz dowód chemiczny – bez uzasadnienia komisja nie przyjmie raportu.','Choose the chemical evidence – the commission will not accept a report without it.');return}
      const eqi=e?+e.value:-1;
      submitAccusation({s:d.s,p:d.p,r:d.r,j:j.value,eq:eqi>=0?d.eqOpts[eqi]:null});break}
    case 'copyrep':{
      const txt=reportText();const msg=$('#copymsg');const fb=$('#repfallback');
      const fallback=()=>{fb.hidden=false;fb.value=txt;fb.style.minHeight='260px';fb.focus();fb.select();msg.textContent=T('Zaznaczono tekst raportu – skopiuj go skrótem Ctrl+C.','The report text is selected – copy it with Ctrl+C.')};
      try{navigator.clipboard.writeText(txt).then(()=>{msg.textContent=T('Raport skopiowany do schowka.','Report copied to the clipboard.')},fallback)}catch(err){fallback()}
      break}
  }
}
