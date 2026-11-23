/*
 * simulation.js
 * Symulacja: stężenia w punkcie (levelsAt), obserwacje testów chemicznych (observe), zasięg ruchu (reachable).
 */

/* ============ LOGIKA ============ */
const curP=()=>S.players[S.cur];
const curEvent=()=>S&&S.evI>=0?S.evList[LANG][S.evI]:null;
const modOn=id=>{const e=curEvent();return !!e&&e.id===id&&S.eventRound===S.round};
function addLog(fn){S.log.unshift({r:S.round,t:both(fn)})}
function levelsAt(node){
  const Lv={};const up=(k,v)=>{Lv[k]=Math.max(Lv[k]||0,v)};
  const sol=S.sol,lo=S.cfg.mode==='LO';
  if(NODES[node].t==='lake'){
    up(sol.s,2);
    if(lo)for(const p of PLANT_IDS){const lg=PLANT[p].legal;if(lg)up(lg.s,1)}
    return Lv;
  }
  const rid=NODES[node].route;const ord=ROUTES[rid].order;const idx=ord.indexOf(node);
  for(let i=0;i<idx;i++){const p=ord[i];if(!PLANT[p])continue;
    if(p===sol.p&&rid===sol.r)up(sol.s,3);
    const lg=PLANT[p].legal;if(lo&&lg&&lg.r===rid)up(lg.s,1);
  }
  if(modOn('rain')&&ROUTES[rid].open)for(const k in Lv)Lv[k]=Math.max(0,Lv[k]-1);
  return Lv;
}
function observe(rid,Lv,node){
  const g=k=>Lv[k]||0;const lo=S.cfg.mode==='LO';
  const o={lines:[],tube:{liq:'clear',ppt:null,film:false},follow:null};
  const lvl=(v,a,b,c)=>v>=3?a:v===2?b:c;
  const isLake=NODES[node].t==='lake';
  switch(rid){
    case 'OBS':{
      if(g('OIL'))o.lines.push(lvl(g('OIL'),
        T('Na powierzchni opalizujący, tęczowy film; wyraźny zapach paliwa. Po wstrząśnięciu próbki krople znów zbierają się na powierzchni.','An iridescent rainbow film on the surface; a distinct smell of fuel. After shaking the sample, droplets gather on the surface again.'),
        T('Na powierzchni widoczne tęczowe plamy, słaby zapach paliwa.','Rainbow patches visible on the surface, a faint smell of fuel.'),
        T('Przy brzegu pojedyncze tęczowe smugi.','A few rainbow streaks near the bank.')));
      if(g('CU')>=3)o.lines.push(T('Woda ma ledwie zauważalny, niebieskawy odcień.','The water has a barely noticeable bluish tint.'));
      if(g('NH4')>=2)o.lines.push(g('NH4')>=3?T('Wyczuwalny ostry, duszący zapach.','A sharp, pungent smell.'):T('Słaby, nieprzyjemny zapach jak z obory.','A faint, unpleasant farmyard smell.'));
      if(g('PO4')>=2)o.lines.push(T('Woda mętna, zielonkawa; przy brzegu nitkowate glony.','The water is cloudy and greenish; filamentous algae near the bank.'));
      if(g('SO4')>=3)o.lines.push(T('Z mułu przy dnie czuć zapach zgniłych jaj.','The bottom mud smells of rotten eggs.'));
      if(isLake)o.lines.push(T('Przy brzegu unoszą się śnięte ryby.','Dead fish are floating near the shore.'));
      else if(Math.max(0,...Object.values(Lv))>=3)o.lines.push(T('W wodzie nie widać żywych organizmów, przy brzegu leży kilka śniętych ryb.','No living organisms in the water; a few dead fish lie on the bank.'));
      if(!o.lines.length)o.lines.push(T('Woda klarowna, bez zapachu i bez filmu na powierzchni. W wodzie widać drobne ryby i larwy owadów.','Clear water, no smell and no film on the surface. Small fish and insect larvae are visible.'));
      o.tube.film=g('OIL')>0;o.tube.liq=g('PO4')>=2?'#cfe0a8':g('CU')>=3?'#d4e8f4':'clear';
      break}
    case 'PH':{
      let v=7.3-0.6*g('CU')+0.5*g('NH4')-0.15*g('SO4')+0.1*g('PO4');v=Math.round(v*2)/2;
      const sc=[[5,['pomarańczowoczerwony','orange-red'],'#E8743B'],[6,['żółtopomarańczowy','yellow-orange'],'#E9B23A'],[7,['żółtozielony','yellow-green'],'#B5C94B'],[8,['zielony','green'],'#4DAA6A'],[9,['zielononiebieski','blue-green'],'#2F8C8C'],[99,['niebieski','blue'],'#2D5DA8']];
      const c=sc.find(x=>v<x[0]+0.5)||sc[sc.length-1];
      o.lines.push(T(`Papierek barwi się na kolor ${c[1][0]}. Według skali barw: pH ≈ ${String(v).replace('.',',')}.`,`The paper turns ${c[1][1]}. According to the colour chart: pH ≈ ${v}.`));
      o.tube.paper=c[2];break}
    case 'NAOH':{
      if(g('CU'))o.lines.push(lvl(g('CU'),
        T('Wytrąca się obfity, niebieski, galaretowaty osad.','A copious blue, gelatinous precipitate forms.'),
        T('Pojawia się wyraźny, jasnoniebieski, kłaczkowaty osad.','A distinct pale-blue, flocculent precipitate appears.'),
        T('Ledwie widoczne niebieskawe zmętnienie.','A barely visible bluish turbidity.')));
      if(g('NH4'))o.lines.push(lvl(g('NH4'),
        T('Po ogrzaniu wyczuwalny ostry, duszący zapach. Zwilżony papierek uniwersalny nad wylotem probówki barwi się na niebiesko.','On heating, a sharp, pungent smell. Moist universal indicator paper held over the mouth of the test tube turns blue.'),
        T('Po ogrzaniu słaby zapach; papierek nad probówką wyraźnie niebieszczeje.','On heating, a faint smell; the paper over the tube clearly turns blue.'),
        T('Po ogrzaniu papierek nad probówką ledwie zmienia barwę na zielononiebieską.','On heating, the paper over the tube barely turns blue-green.')));
      if(!o.lines.length)o.lines.push(T('Brak osadu. Po ogrzaniu brak zapachu, papierek nad probówką bez zmian.','No precipitate. On heating, no smell; the paper over the tube does not change.'));
      if(g('CU'))o.tube.ppt={c:'#3B7FD0',a:g('CU')};
      break}
    case 'NH3':{
      if(g('CU'))o.lines.push(lvl(g('CU'),
        T('Najpierw pojawia się niebieski osad, który w nadmiarze odczynnika znika. Roztwór staje się intensywnie szafirowy.','First a blue precipitate forms, which dissolves in excess reagent. The solution turns a deep royal blue.'),
        T('Roztwór barwi się wyraźnie na niebiesko.','The solution turns distinctly blue.'),
        T('Ledwie zauważalny niebieskawy odcień roztworu.','A barely noticeable bluish tint in the solution.')));
      else o.lines.push(T('Brak zmian – roztwór pozostaje bezbarwny i klarowny.','No change – the solution stays colourless and clear.'));
      if(g('CU'))o.tube.liq=g('CU')>=3?'#2A4FC8':g('CU')===2?'#6C93DD':'#C9D8F2';
      break}
    case 'BACL':{
      const so=g('SO4'),po=lo?g('PO4'):0,m=Math.max(so,po);
      if(!m){o.lines.push(T('Brak osadu – roztwór pozostaje klarowny.','No precipitate – the solution stays clear.'));break}
      o.lines.push(lvl(m,
        T('Natychmiast wytrąca się obfity, biały, drobnokrystaliczny osad.','A copious white, fine crystalline precipitate forms at once.'),
        T('Wytrąca się wyraźny, biały, drobny osad.','A distinct white, fine precipitate forms.'),
        T('Pojawia się słabe, białe zmętnienie (opalescencja).','A faint white turbidity (opalescence) appears.')));
      o.tube.ppt={c:'#F4F4F2',a:m};
      if(lo)o.follow={label:T('Dodaj HCl do osadu','Add HCl to the precipitate'),done:T('Po dodaniu HCl do osadu','After adding HCl to the precipitate'),
        line:so&&po?T('Osad roztwarza się tylko częściowo – pozostaje biały, drobnokrystaliczny osad.','The precipitate dissolves only partly – a white, fine crystalline precipitate remains.'):so?T('Osad nie roztwarza się w HCl.','The precipitate does not dissolve in HCl.'):T('Osad całkowicie roztwarza się w HCl, roztwór staje się klarowny.','The precipitate dissolves completely in HCl; the solution becomes clear.'),
        ppt:so?{c:'#F4F4F2',a:so}:null};
      break}
    case 'AGNO':{
      const cl=g('CL'),po=lo?g('PO4'):0,m=Math.max(cl,po);
      if(!m){o.lines.push(T('Brak osadu – roztwór pozostaje klarowny.','No precipitate – the solution stays clear.'));break}
      const col=cl&&po?T('żółtawobiały','yellowish-white'):po?T('żółty','yellow'):T('biały, serowaty','white, curdy');
      const dark=cl?T(' Pod wpływem światła osad szarzeje i ciemnieje.',' In light the precipitate turns grey and darkens.'):'';
      const faint=po&&!cl?T('żółtawe','yellowish'):T('białe','white');
      o.lines.push(lvl(m,T(`Wytrąca się obfity, ${col} osad.`,`A copious ${col} precipitate forms.`),T(`Wytrąca się wyraźny, ${col} osad.`,`A distinct ${col} precipitate forms.`),T(`Pojawia się słabe, ${faint} zmętnienie.`,`A faint ${faint} turbidity appears.`))+dark);
      o.tube.ppt={c:po&&!cl?'#EBCB3C':cl&&po?'#EFE3A6':'#F1F0EA',a:m};
      if(lo)o.follow={label:T('Dodaj HNO₃ do osadu','Add HNO₃ to the precipitate'),done:T('Po dodaniu HNO₃ do osadu','After adding HNO₃ to the precipitate'),
        line:cl&&po?T('Żółta część osadu znika, pozostaje biały, serowaty osad.','The yellow part disappears; a white, curdy precipitate remains.'):cl?T('Osad nie roztwarza się w HNO₃.','The precipitate does not dissolve in HNO₃.'):T('Osad całkowicie roztwarza się w HNO₃.','The precipitate dissolves completely in HNO₃.'),
        ppt:cl?{c:'#F1F0EA',a:cl}:null};
      break}
    case 'MOLI':{
      if(g('PO4')){o.lines.push(lvl(g('PO4'),
        T('Po ogrzaniu wytrąca się obfity, żółty, krystaliczny osad.','On heating, a copious yellow crystalline precipitate forms.'),
        T('Po ogrzaniu wytrąca się wyraźny, żółty osad.','On heating, a distinct yellow precipitate forms.'),
        T('Roztwór lekko żółknie, bez wyraźnego osadu.','The solution turns slightly yellow, with no distinct precipitate.')));o.tube.ppt={c:'#E8C21F',a:g('PO4')}}
      else o.lines.push(T('Po ogrzaniu brak osadu, roztwór pozostaje bezbarwny.','On heating, no precipitate; the solution stays colourless.'));
      break}
    case 'NESS':{
      if(g('NH4')){o.lines.push(lvl(g('NH4'),
        T('Roztwór barwi się na pomarańczowobrunatno, wytrąca się brunatny osad.','The solution turns orange-brown and a brown precipitate forms.'),
        T('Wyraźne żółtopomarańczowe zabarwienie roztworu.','A distinct yellow-orange colour develops.'),
        T('Słabe, żółtawe zabarwienie roztworu.','A faint yellowish colour.')));o.tube.liq=g('NH4')>=3?'#C46A1E':g('NH4')===2?'#E5A33A':'#F1DB8E';if(g('NH4')>=3)o.tube.ppt={c:'#7A3E12',a:2}}
      else{o.lines.push(T('Brak zmiany barwy – roztwór pozostaje bladożółty, jak sam odczynnik.','No colour change – the solution stays pale yellow, like the reagent itself.'));o.tube.liq='#F6F0C8'}
      break}
  }
  return o;
}
function reachable(from,steps){
  const dist={[from]:0};const q=[[from,0]];
  while(q.length){q.sort((a,b)=>a[1]-b[1]);const [n,d]=q.shift();if(d>dist[n])continue;
    for(const [m,c] of ADJ[n]){const nd=d+c;if(nd<=steps&&(dist[m]===undefined||nd<dist[m])){dist[m]=nd;q.push([m,nd])}}}
  delete dist[from];return dist;
}
