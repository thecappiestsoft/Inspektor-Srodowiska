/*
 * actions.js
 * Akcje gracza: test, dodatkowe zakwaszenie osadu, dokumenty, laboratorium, konfrontacja (hipoteza).
 */

/* --- akcje --- */
function doTest(rid){
  const p=curP();const r=RMAP[rid];
  if(r.max){if(p.inv[rid]<=0)return;p.inv[rid]--}
  const Lv=levelsAt(p.pos);const pos=p.pos;
  const o=both(()=>observe(rid,Lv,pos));
  p.ev.unshift({k:'test',r:S.round,txt:both(()=>({title:`${nShort(pos)} · ${reagName(rid)}`,place:nName(pos),lines:o[LANG].lines.slice()}))});
  p.stats.tests++;
  S.last={k:'test',o,tube:o.pl.tube,txt:both(()=>({title:reagName(rid),sub:nName(pos)}))};
  addLog(()=>T(`${pname(p)} pobiera próbkę (${nShort(pos)}) i wykonuje test: ${reagName(rid)}.`,`${pname(p)} takes a sample (${nShort(pos)}) and runs a test: ${reagName(rid)}.`));
  finishAction();
}
function doFollow(){
  const l=S.last;if(!l||!l.o||!l.o.pl.follow)return;const p=curP();
  for(const lg of ['pl','en']){const f=l.o[lg].follow;const line='→ '+f.done+': '+f.line;l.o[lg].lines.push(line);p.ev[0].txt[lg].lines.push(line)}
  l.tube=Object.assign({},l.tube,{ppt:l.o.pl.follow.ppt});
  l.o.pl.follow=null;l.o.en.follow=null;render();
}
const DECKS={
  plant:{get:()=>S.decks[LANG].plant[curP().pos],key:()=>'plant-'+curP().pos,label:()=>pN(curP().pos)},
  office:{get:()=>S.decks[LANG].office,key:()=>'office',label:()=>T('Urząd gminy – archiwum','Municipal office – archive')},
  village:{get:()=>S.decks[LANG].village,key:()=>'village',label:()=>curP().pos==='PLA'?T('Plaża gminna','Public beach'):T('Wieś Olszynka','Olszynka village')},
  fish:{get:()=>S.decks[LANG].fish,key:()=>'fish',label:()=>T('Przystań wędkarska','Anglers’ jetty')},
};
function readDeck(dk){
  const D=DECKS[dk];const p=curP();const key=D.key();const i=p.read[key]||0;const n=D.get().length;
  if(i>=n){S.last={k:'doc',txt:both(()=>({title:D.label(),sub:'',lines:[T('Nic nowego. Wszystkie dokumenty w tym miejscu już przejrzano. Wybierz inne miejsce w kolejnej turze.','Nothing new. All documents here have already been reviewed. Pick another place next turn.')]}))};finishAction();return}
  p.read[key]=i+1;p.stats.docs++;
  p.ev.unshift({k:'doc',r:S.round,txt:both(()=>{const d=D.get()[i];return {title:d.t,place:D.label(),lines:[d.x]}})});
  S.last={k:'doc',txt:both(()=>{const d=D.get()[i];return {title:d.t,sub:D.label()+T(` · dokument ${i+1} z ${n}`,` · document ${i+1} of ${n}`),lines:[d.x]}})};
  addLog(()=>T(`${pname(p)} przegląda dokumenty: ${D.label()}.`,`${pname(p)} reviews documents: ${D.label()}.`));finishAction();
}
function doRefill(){
  const p=curP();REAG.forEach(r=>{if(r.max)p.inv[r.id]=r.max});
  const tip=pick(TIPS);
  p.ev.unshift({k:'doc',r:S.round,txt:both(()=>({title:T('Konsultacja z chemikiem','Chemist’s advice'),place:T('Laboratorium terenowe','Field laboratory'),lines:[tr(tip)]}))});
  S.last={k:'doc',txt:both(()=>({title:T('Odczynniki uzupełnione','Reagents restocked'),sub:T('Laboratorium terenowe','Field laboratory'),lines:[T('Zestaw odczynników uzupełniony do pełna.','Reagent kit restocked to full.'),T('Chemik dyżurny radzi: ','The duty chemist advises: ')+tr(tip)]}))};
  addLog(()=>T(`${pname(p)} uzupełnia odczynniki w laboratorium.`,`${pname(p)} restocks reagents at the laboratory.`));finishAction();
}
function doConfront(s,r){
  const me=curP();const pl=me.pos;const cards=['S:'+s,'P:'+pl,'R:'+r];const n=S.players.length;
  me.stats.conf++;
  let shown=null,by=null;
  for(let k=1;k<n;k++){const q=S.players[(S.cur+k)%n];const m=q.hand.filter(c=>cards.includes(c));if(m.length){shown=pick(m);by=q;break}}
  const hyp=()=>`${SUB[s].f} · ${pS(pl)} · ${rN(r)}`;
  if(shown){
    me.auto[shown]={by:by.idx};
    me.ev.unshift({k:'conf',r:S.round,txt:both(()=>({title:T('Konfrontacja: ','Confrontation: ')+hyp(),place:pN(pl),lines:[T(`${pname(by)} pokazuje kartę: ${cardName(shown)}.`,`${pname(by)} shows the card: ${cardName(shown)}.`)]}))});
    S.last={k:'conf',txt:both(()=>({title:T('Hipoteza obalona','Hypothesis disproved'),sub:hyp(),lines:[T(`${pname(by)} pokazuje ci kartę: ${cardName(shown)}.`,`${pname(by)} shows you the card: ${cardName(shown)}.`),T('Ta karta nie jest w kopercie. Zaznaczono ją w notatniku.','This card is not in the envelope. It has been marked in your notebook.')]}))};
    addLog(()=>T(`${pname(me)} stawia hipotezę w zakładzie ${pS(pl)}: ${hyp()}. ${pname(by)} pokazuje kartę (tylko pytającemu).`,`${pname(me)} makes a hypothesis at the ${pS(pl)}: ${hyp()}. ${pname(by)} shows a card (to the asker only).`));
  }else{
    me.ev.unshift({k:'conf',r:S.round,txt:both(()=>({title:T('Konfrontacja: ','Confrontation: ')+hyp(),place:pN(pl),lines:[T('Nikt nie pokazał karty. Żadnej z tych kart nie mają pozostali gracze (możesz ją mieć ty sam albo jest w kopercie).','Nobody showed a card. None of the other players hold these cards (you may hold one yourself, or it is in the envelope).')]}))});
    S.last={k:'conf',txt:both(()=>({title:T('Nikt nie obalił hipotezy','Nobody disproved the hypothesis'),sub:hyp(),lines:[T('Żaden gracz nie ma tych kart. Każda z nich jest w kopercie albo w twojej ręce.','No player holds these cards. Each of them is either in the envelope or in your hand.')]}))};
    addLog(()=>T(`${pname(me)} stawia hipotezę: ${hyp()}. Nikt nie może jej obalić!`,`${pname(me)} makes a hypothesis: ${hyp()}. Nobody can disprove it!`));
  }
  finishAction();
}
