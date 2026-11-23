/*
 * ui.js
 * Render głównego widoku: pasek górny, tura, wyniki, notatnik, dowody, karty, dziennik.
 */

/* ============ RENDER: UI ============ */
function dieHTML(v){const on={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]}[v]||[];return `<div class="die" id="die" aria-label="${T('Kostka','Die')}: ${v}">${[...Array(9)].map((_,i)=>`<i class="${on.includes(i)?'on':''}"></i>`).join('')}</div>`}
function tubeSVG(t){
  if(!t)return '';
  if(t.paper)return `<svg class="tube" viewBox="0 0 34 96" aria-hidden="true"><rect x="9" y="6" width="16" height="84" rx="2" fill="#F4F1E6" stroke="var(--line)"/><rect x="9" y="50" width="16" height="40" rx="2" fill="${t.paper}"/></svg>`;
  const liq=t.liq==='clear'?'#E3F0F6':t.liq;
  const ph=t.ppt?(t.ppt.a>=3?26:t.ppt.a===2?16:7):0;
  return `<svg class="tube" viewBox="0 0 34 96" aria-hidden="true">
   <path d="M7 4 h20 v72 a10 10 0 0 1 -20 0Z" fill="var(--glass)" opacity=".5"/>
   <path d="M8 34 h18 v42 a9 9 0 0 1 -18 0Z" fill="${liq}"/>
   ${t.ppt?`<path d="M8 ${84-ph} h18 v${ph-8} a9 9 0 0 1 -18 0Z" fill="${t.ppt.c}" stroke="rgba(0,0,0,.15)"/>`:''}
   ${t.film?`<rect x="8" y="32" width="18" height="4" fill="url(#oilg)"/>`:''}
   <defs><linearGradient id="oilg" x1="0" x2="1"><stop offset="0" stop-color="#d14fd1"/><stop offset=".3" stop-color="#3ab0e0"/><stop offset=".6" stop-color="#e3d33a"/><stop offset="1" stop-color="#e05a3a"/></linearGradient></defs>
   <path d="M7 4 h20 v72 a10 10 0 0 1 -20 0Z" fill="none" stroke="var(--muted)" stroke-width="1.5"/></svg>`;
}
function fmtTime(ms){if(ms==null)return '∞';ms=Math.max(0,ms);const m=Math.floor(ms/60000),s=Math.floor(ms%60000/1000);return `${m}:${String(s).padStart(2,'0')}`}
const SUN='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>';
const MOON='<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z"/></svg>';
const themeSeg=()=>{const t=effTheme();return `<div class="seg small theme" role="group" aria-label="${T('Motyw','Theme')}"><button data-theme-set="light" aria-pressed="${t==='light'}" title="${T('Tryb jasny','Light mode')}" aria-label="${T('Tryb jasny','Light mode')}">${SUN}</button><button data-theme-set="dark" aria-pressed="${t==='dark'}" title="${T('Tryb ciemny','Dark mode')}" aria-label="${T('Tryb ciemny','Dark mode')}">${MOON}</button></div>`};
const langSeg=()=>`<div class="seg small" role="group" aria-label="Język / Language"><button data-lang="pl" aria-pressed="${LANG==='pl'}" title="Polski">PL</button><button data-lang="en" aria-pressed="${LANG==='en'}" title="English">EN</button></div>`;

function render(){
  const root=$('#root');
  if(!S||!S.phase){root.innerHTML=topHTML(false);if(!UI.ov)UI.ov='setup';renderOv();bindTop();return}
  root.innerHTML=topHTML(true)+bannerHTML()+`<div class="app"><div class="mapwrap"><svg id="map" viewBox="0 0 1000 740" role="img" aria-label="${T('Mapa okolicy Jeziora Olszynowego','Map of the area around Lake Olszynowe')}">${staticMap()}<g id="dyn">${dynMap()}</g></svg>${legendHTML()}</div><div class="side">${playersHTML()}${S.phase==='play'?turnHTML():endSideHTML()}${privateHTML()}</div></div>`;
  bindTop();bindMap();bindSide();
  if(S.phase==='play'&&S.stage==='curtain'&&!UI.ov)UI.ov='curtain';
  renderOv();save();
}
function topHTML(play){
  return `<header class="top"><div class="brand"><div class="badge" aria-hidden="true">${T('IŚ','EI')}</div><div><h1>${T('Inspektor Środowiska','Environmental Inspector')}</h1><p>${T('Sprawa nr 47/2026 · śnięte ryby w Jeziorze Olszynowym','Case no. 47/2026 · dead fish in Lake Olszynowe')}</p></div></div>
  <div class="topinfo">${play&&S?`<span class="pill">${T('Runda','Round')} <b>${S.round}</b></span><span class="pill ${S.timeLeft!=null&&S.timeLeft<5*60000?'alert':''}" id="timerpill">${T('Czas','Time')} <b id="timer">${fmtTime(S.timeLeft)}</b>${S.paused?T(' · pauza',' · paused'):''}</span><span class="pill">${S.cfg.mode==='8'?T('Poziom: klasa 8','Level: grade 8'):T('Poziom: liceum','Level: high school')}</span>`:''}
  <button class="btn small" data-a="rules">${T('Zasady','Rules')}</button>${!S||S.cfg.cheat||S.phase==='end'?`<button class="btn small" data-a="cheat">${T('Ściąga odczynników','Reagent sheet')}</button>`:''}${play?`<button class="btn small" data-a="teacher">${T('Prowadzący','Teacher')}</button>`:''}<button class="btn small" data-a="newgame">${T('Nowa gra','New game')}</button>${themeSeg()}${langSeg()}</div></header>`;
}
function bannerHTML(){
  let b='';const e=curEvent();
  if(e&&S.eventRound===S.round)b+=`<div class="banner"><span class="eyebrow">${T('Wydarzenie rundy','Round event')} ${S.round}</span><b>${esc(e.t)}</b><span>${esc(e.x)}</span></div>`;
  if(S.finalRound&&S.phase==='play')b+=`<div class="banner" style="border-color:var(--bad)"><b>${T('Ostatnia runda.','Final round.')}</b><span>${T('Czas śledztwa minął. Każdy gracz ma jeszcze jedną turę – to ostatnia szansa, by zgłosić rozwiązanie.','Investigation time is up. Each player has one more turn – the last chance to submit a solution.')}</span></div>`;
  return b;
}
function legendHTML(){
  const it=(st,t)=>`<span><svg viewBox="0 0 34 10"><line x1="2" y1="5" x2="32" y2="5" ${RSTYLE[st]} /></svg>${t}</span>`;
  return `<div class="maplegend">${it('ditch',T('rów','ditch'))}${it('stream',T('potok','stream'))}${it('drain',T('drenaż','drainage'))}${it('pipe',T('kanał deszczowy','storm sewer'))}${it('main',T('kanalizacja sanitarna','sanitary sewer'))}${it('rogue',T('rura bez oznaczeń','unmarked pipe'))}<span><svg viewBox="0 0 34 10"><rect x="12" y="0" width="8" height="8" transform="rotate(45 16 4)" fill="var(--sheet)" stroke="var(--water)" stroke-width="2"/></svg>${T('punkt poboru próbek','sampling point')}</span><span>${T('Woda płynie od zakładów do jeziora · cyfra przy celu = koszt drogi','Water flows from the plants to the lake · number at a destination = movement cost')}</span></div>`;
}
function playersHTML(){
  return `<div class="players">${S.players.map((p,i)=>`<div class="pchip ${i===S.cur&&S.phase==='play'?'cur':''}"><span class="dot" style="background:${p.color}"></span><div><b>${i+1}. ${esc(pname(p))}</b><small>${esc(nShort(p.pos))} · ${T(`${p.hand.length} ${plPL(p.hand.length,'karta','karty','kart')}`,`${p.hand.length} cards`)}</small></div>${p.out?`<span class="tag bad">${T('bez oskarżeń','no accusations')}</span>`:''}${p.suspended?`<span class="tag warn">${T('zawieszony','suspended')}</span>`:''}${S.winner===i?`<span class="tag ok">${T('rozwiązał(a)','solved')}</span>`:''}</div>`).join('')}</div>`;
}
function actionsFor(node){
  const t=NODES[node].t;const A=[];
  if(t==='pt'||t==='lake')A.push({id:'test',b:T('Pobierz próbkę i zbadaj','Take a sample and test it'),s:T('wybierz odczynnik','choose a reagent')});
  if(t==='plant'){A.push({id:'docs',b:T('Przejrzyj dokumenty zakładu','Review the plant’s documents'),s:T('pozwolenia, raporty, zeznania','permits, reports, statements')});A.push({id:'conf',b:T('Postaw hipotezę','Make a hypothesis'),s:T('konfrontacja z innymi graczami','confront the other players')})}
  if(t==='lab')A.push({id:'refill',b:T('Uzupełnij odczynniki','Restock reagents'),s:modOn('blackout')?T('brak prądu w tej rundzie','power cut this round'):T('i porozmawiaj z chemikiem','and talk to the chemist'),dis:modOn('blackout')});
  if(t==='office')A.push({id:'office',b:T('Przeszukaj archiwum','Search the archive'),s:T('rejestry, mapy, skargi','registers, maps, complaints')});
  if(t==='village')A.push({id:'village',b:T('Przesłuchaj mieszkańców','Interview residents'),s:T('zeznania świadków','witness statements')});
  if(node==='PRZ')A.push({id:'fish',b:T('Porozmawiaj z wędkarzami','Talk to the anglers'),s:T('relacje znad wody','reports from the waterside')});
  if(node==='PLA')A.push({id:'village',b:T('Porozmawiaj z ratownikiem','Talk to the lifeguard'),s:T('zeznania świadków','witness statements')});
  return A;
}
function turnHTML(){
  const p=curP();const pos=p.pos;const node=NODES[pos];
  let body='';
  const canAccuse=!p.out&&['roll','act','done','move'].includes(S.stage);
  if(S.stage==='curtain'){body=`<p class="instr">${T(`Czekamy, aż ${esc(pname(p))} przejmie komputer.`,`Waiting for ${esc(pname(p))} to take the computer.`)}</p>`}
  else if(S.stage==='roll'){
    body=`<p class="instr">${T('Rzuć kostką, aby przemieścić się po mapie, albo działaj tam, gdzie stoisz.','Roll the die to move across the map, or act where you are.')}</p><div class="row"><button class="btn accent" data-a="roll">${T('Rzuć kostką','Roll the die')}</button><button class="btn" data-a="stay">${T('Zostań','Stay')}: ${esc(nShort(pos))}</button></div>`;
  }else if(S.stage==='move'){
    const list=Object.entries(S.reach).sort((a,b)=>a[1]-b[1]);const v=S.roll;
    body=`<div class="row" style="margin-top:10px">${dieHTML(S.rawRoll)}<p class="instr" style="margin:0">${T(`Masz <b>${v}</b> ${plPL(v,'punkt','punkty','punktów')} ruchu. Kliknij podświetlone miejsce na mapie lub wybierz z listy.`,`You have <b>${v}</b> movement ${v===1?'point':'points'}. Click a highlighted place on the map or pick one from the list.`)}</p></div>
    <div class="reach" style="margin:12px 0">${list.map(([id,c])=>`<button data-go="${id}">${esc(nShort(id))}<em>${c}</em></button>`).join('')}</div><button class="btn small" data-a="stay">${T('Zostań','Stay')}: ${esc(nShort(pos))}</button>`;
  }else if(S.stage==='act'){
    if(S.actUI==='test'){
      body=`<p class="instr">${T('Wybierz odczynnik. Prowadzący poda tylko obserwację – wniosek o jonach wyciągasz sam(a).','Choose a reagent. You only get the observation – working out which ions are present is up to you.')}</p><div class="choices">${REAG.map(r=>{const left=r.max?p.inv[r.id]:null;return `<button class="choice" data-test="${r.id}" ${left===0?'disabled':''}><b>${esc(reagName(r.id))}</b><span>${esc(tr(r.hint))} · ${left==null?T('bez limitu','unlimited'):T('zostało ','left: ')+left+'/'+r.max}</span></button>`}).join('')}</div><div class="row" style="margin-top:10px"><button class="btn small ghost" data-a="back">${T('Wróć','Back')}</button></div>`;
    }else if(S.actUI==='conf'){
      body=`<p class="instr">${T(`Hipoteza: <b>${esc(pS(pos))}</b> zrzuca substancję drogą… Następni gracze (zgodnie z kolejnością) sprawdzają swoje karty. Pierwszy, kto ma którąś z nich, pokazuje ci jedną – tylko tobie.`,`Hypothesis: the <b>${esc(pS(pos))}</b> discharges a substance via… The next players (in turn order) check their cards. The first one holding any of them shows you one – to you only.`)}</p>
      <div class="grid2"><label class="f">${T('Substancja','Substance')}<select id="cs">${SUB_IDS.map(s=>`<option value="${s}">${esc(sN(s))} (${SUB[s].f})</option>`).join('')}</select></label>
      <label class="f">${T('Droga do jeziora','Route to the lake')}<select id="cr">${ROUTE_IDS.map(r=>`<option value="${r}">${esc(rN(r))}</option>`).join('')}</select></label></div>
      <div class="row" style="margin-top:12px"><button class="btn accent" data-a="confgo">${T('Postaw hipotezę','Make the hypothesis')}</button><button class="btn small ghost" data-a="back">${T('Wróć','Back')}</button></div>`;
    }else{
      const A=actionsFor(pos);
      body=`<p class="instr">${T('Jesteś tutaj','You are here')}: <b>${esc(nName(pos))}</b>. ${T('Wybierz jedną akcję.','Choose one action.')}</p><div class="choices">${A.map(a=>`<button class="choice" data-act="${a.id}" ${a.dis?'disabled':''}><b>${esc(a.b)}</b><span>${esc(a.s)}</span></button>`).join('')}<button class="choice" data-act="skip"><b>${T('Pomiń akcję','Skip action')}</b><span>${T('zakończ ruch bez działania','end your move without acting')}</span></button></div>`;
      if(node.t==='plant')body+=`<p class="note" style="margin-top:10px">${esc(tr(PLANT[pos].desc))}</p>`;
    }
  }else if(S.stage==='done'){
    body=resultHTML(S.last)+`<div class="row" style="margin-top:14px"><button class="btn primary" data-a="endturn">${T('Zakończ turę','End turn')}</button><span class="note">${T('Zapisz wnioski w notatniku, zanim przekażesz komputer.','Write your conclusions in the notebook before passing the computer on.')}</span></div>`;
  }
  return `<section class="card turn" style="--pc:${p.color}"><div class="turnhead"><div><div class="eyebrow">${T('Tura · runda','Turn · round')} ${S.round}</div><h2>${esc(pname(p))}</h2><div class="where">${esc(nName(pos))}</div></div>${canAccuse?`<button class="btn" data-a="accuse">${T('Zgłoś rozwiązanie','Submit solution')}</button>`:''}</div>${body}</section>`;
}
function resultHTML(r){
  if(!r)return `<p class="instr">${T('Akcja pominięta.','Action skipped.')}</p>`;
  const t=L(r.txt);
  if(r.k==='test'){const o=L(r.o);return `<div class="result">${tubeSVG(r.tube)}<div><div class="eyebrow">${T('Obserwacja','Observation')} · ${esc(t.sub)}</div><h3>${esc(t.title)}</h3>${o.lines.map(l=>`<p class="obs">${esc(l)}</p>`).join('')}${o.follow?`<button class="btn small" style="margin-top:6px" data-a="follow">${esc(o.follow.label)}</button><span class="note"> ${T('(bez dodatkowego kosztu)','(no extra cost)')}</span>`:''}</div></div>`}
  return `<div class="result ${r.k}"><div><div class="eyebrow">${esc(t.sub||'')}</div><h3>${esc(t.title)}</h3>${t.lines.map(l=>`<p>${esc(l)}</p>`).join('')}</div></div>`;
}
function endSideHTML(){
  return `<section class="card"><div class="eyebrow">${T('Koniec śledztwa','Investigation over')}</div><h2 style="font-size:22px;margin:4px 0 8px">${S.endReason==='solved'?esc(pname(S.players[S.winner]))+T(' rozwiązuje sprawę',' solves the case'):T('Sprawa nierozwiązana','Case unsolved')}</h2><div class="row"><button class="btn accent" data-a="showend">${T('Rozwiązanie i raport inspektora','Solution and inspector’s report')}</button><button class="btn" data-a="newgame">${T('Nowa gra','New game')}</button></div></section>`;
}
function privateHTML(){
  if(S.phase==='play'&&S.stage==='curtain')return `<section class="card"><p class="locked">${T('Notatnik, karty i dowody są ukryte do rozpoczęcia tury.','Notebook, cards and evidence stay hidden until the turn starts.')}</p></section>`;
  const tabs=[['akcje',T('Notatnik','Notebook')],['dowody',T('Dowody','Evidence')],['karty',T('Moje karty','My cards')],['dziennik',T('Dziennik zespołu','Team log')]];
  if(S.phase==='end')return `<section class="card"><div class="tabs" role="tablist"><button role="tab" aria-selected="true">${T('Dziennik zespołu','Team log')}</button></div>${logHTML()}</section>`;
  const p=curP();let c='';
  if(UI.tab==='akcje')c=notebookHTML(p);
  else if(UI.tab==='dowody')c=evidenceHTML(p);
  else if(UI.tab==='karty')c=handHTML(p);
  else c=logHTML();
  return `<section class="card"><div class="tabs" role="tablist">${tabs.map(([k,l])=>`<button role="tab" data-tab="${k}" aria-selected="${UI.tab===k}">${l}${k==='dowody'?` (${p.ev.length})`:''}</button>`).join('')}</div>${c}</section>`;
}
function autoText(a){if(!a)return '';if(a.hand)return T('w twojej ręce','in your hand');return T('pokazał(a): ','shown by: ')+pname(S.players[a.by])}
function notebookHTML(p){
  const sec=(title,ids)=>`<div class="nbcol"><h3>${title}</h3>${ids.map(c=>{const m=p.marks[c]||(p.auto[c]?'x':'');const sym={x:'✕',q:'?',v:'✓'}[m]||'';return `<button class="nbitem ${m}" data-mark="${c}" title="${T('Kliknij, aby zmienić oznaczenie','Click to change the mark')}"><span class="mk">${sym}</span><span class="lbl">${esc(cardShort(c))}${c.startsWith('S:')?` <span class="note">${esc(sN(c.slice(2)).toLowerCase())}</span>`:''}${p.auto[c]?`<small>${esc(autoText(p.auto[c]))}</small>`:''}</span></button>`}).join('')}</div>`;
  const rl=id=>id==='BACL'?'BaCl₂':id==='AGNO'?'AgNO₃':tr(RMAP[id].name);
  return `<p class="note" style="margin:0 0 10px">${T('Kliknięcie zmienia znak: ✕ wykluczone · ? podejrzane · ✓ pewne. Karty z ręki i pokazane przez innych są oznaczone automatycznie.','Clicking changes the mark: ✕ ruled out · ? suspect · ✓ certain. Cards in your hand and cards shown to you are marked automatically.')}</p>
  <div class="nb">${sec(T('Substancja','Substance'),SUB_IDS.map(s=>'S:'+s))}${sec(T('Zakład','Plant'),PLANT_IDS.map(x=>'P:'+x))}${sec(T('Droga do jeziora','Route to the lake'),ROUTE_IDS.map(r=>'R:'+r))}</div>
  <label class="f" style="margin-top:12px">${T('Notatki śledcze','Case notes')}<textarea id="notes" placeholder="${T('Np. P1B: obfity niebieski osad z NaOH → Cu²⁺; P1A czysto → źródło między P1A a P1B…','E.g. 1B: copious blue precipitate with NaOH → Cu²⁺; 1A clean → source between 1A and 1B…')}">${esc(p.notes)}</textarea></label>
  <div class="row" style="margin-top:10px;font-size:13px;color:var(--muted)">${T('Odczynniki','Reagents')}: ${REAG.filter(r=>r.max).map(r=>`<span class="pill">${esc(rl(r.id))} <b>${p.inv[r.id]}</b></span>`).join('')}</div>`;
}
function evidenceHTML(p){
  const f=UI.evf;const list=p.ev.filter(e=>f==='all'||e.k===f);
  const fb=(k,l)=>`<button data-evf="${k}" aria-pressed="${f===k}">${l}</button>`;
  return `<div class="filters">${fb('all',T('Wszystko','All'))}${fb('test',T('Testy','Tests'))}${fb('doc',T('Dokumenty i zeznania','Documents and statements'))}${fb('conf',T('Konfrontacje','Confrontations'))}</div>
  <div class="evlist">${list.length?list.map(e=>{const t=L(e.txt);return `<div class="ev"><div class="meta"><span>${esc(t.title)}</span><span>R${e.r}</span></div>${e.k==='test'?'':`<div class="note">${esc(t.place)}</div>`}${t.lines.map(l=>`<p class="${e.k==='test'?'obs':''}">${esc(l)}</p>`).join('')}</div>`}).join(''):`<p class="locked">${T('Brak zebranych dowodów. Pobieraj próbki w punktach poboru, czytaj dokumenty w zakładach i urzędzie, rozmawiaj ze świadkami.','No evidence collected yet. Take samples at sampling points, read documents at the plants and the office, and talk to witnesses.')}</p>`}</div>`;
}
function handHTML(p){
  return `<p class="note" style="margin:0 0 10px">${T('Tych kart nie ma w kopercie. Gdy ktoś postawi hipotezę z jedną z nich, gra automatycznie pokaże ją pytającemu.','These cards are not in the envelope. When someone makes a hypothesis that includes one of them, the game automatically shows it to the asker.')}</p><div class="hand">${p.hand.map(c=>{const [k,id]=c.split(':');const cls=k.toLowerCase();return `<div class="gcard ${cls}"><span class="k">${k==='S'?T('Substancja','Substance'):k==='P'?T('Zakład','Plant'):T('Droga','Route')}</span>${k==='S'?`<span class="f">${SUB[id].f}</span><b>${esc(sN(id))}</b>`:k==='P'?`<b>${esc(pN(id))}</b><span class="note">${esc(pS(id))}</span>`:`<b>${esc(rN(id))}</b><span class="note">${esc(tr(ROUTES[id].kind))}</span>`}</div>`}).join('')}</div>`;
}
function logHTML(){return `<div class="log">${S.log.map(l=>`<div><span>R${l.r}</span>${esc(L(l.t))}</div>`).join('')}</div>`}
