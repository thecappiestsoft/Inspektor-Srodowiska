/*
 * resolution.js
 * Rozwiązanie sprawy: weryfikacja oskarżenia i koniec gry.
 */

/* --- rozwiązanie --- */
function submitAccusation(a){
  const me=curP();const sol=S.sol;
  const j=JUST.find(x=>x.id===a.j);
  const hyp=()=>`${SUB[a.s].f} · ${pS(a.p)} · ${rN(a.r)}`;
  if(!j||!j.s.includes(a.s)){
    addLog(()=>T(`${pname(me)} zgłasza rozwiązanie, ale komisja odrzuca raport przed weryfikacją: dowód chemiczny nie wskazuje na wybraną substancję. Tura przepada.`,`${pname(me)} submits a solution, but the commission rejects the report before checking: the chemical evidence does not point to the chosen substance. Turn lost.`));
    closeOv();S.last={k:'conf',txt:both(()=>({title:T('Raport odrzucony','Report rejected'),sub:hyp(),lines:[T('Wskazany dowód chemiczny nie potwierdza wybranej substancji. Komisja nie sprawdzała koperty.','The chemical evidence you gave does not confirm the chosen substance. The commission did not open the envelope.'),T('Tura przepada. Możesz zgłosić rozwiązanie ponownie w kolejnej turze.','Your turn is lost. You can submit a solution again next turn.')]}))};S.stage='done';S.actUI=null;render();return;
  }
  const ok=a.s===sol.s&&a.p===sol.p&&a.r===sol.r;
  if(ok){
    S.bonus=a.eq===0;S.winner=S.cur;const bonus=S.bonus;
    addLog(()=>T(`${pname(me)} rozwiązuje sprawę! ${hyp()}. Uzasadnienie: ${tr(j.t)}.${bonus?' Bonus za poprawne równanie reakcji.':''}`,`${pname(me)} solves the case! ${hyp()}. Evidence: ${tr(j.t)}.${bonus?' Bonus for the correct reaction equation.':''}`));
    closeOv();endGame('solved');return;
  }
  me.out=true;
  addLog(()=>T(`${pname(me)} zgłasza błędne rozwiązanie (${hyp()}) i traci prawo do kolejnych oskarżeń. Nadal pokazuje karty i może prowadzić badania.`,`${pname(me)} submits a wrong solution (${hyp()}) and may not accuse again. They still show cards and can keep investigating.`));
  closeOv();
  if(S.players.every(p=>p.out)){endGame('allout');return}
  S.last={k:'conf',txt:both(()=>({title:T('Rozwiązanie błędne','Wrong solution'),sub:hyp(),lines:[T('Koperta zawiera inne rozwiązanie. Nie możesz już zgłaszać oskarżeń, ale nadal pomagasz zespołowi pokazując karty.','The envelope holds a different solution. You can no longer accuse, but you still help the team by showing cards.'),T('Nie zdradzaj pozostałym, co było błędne!','Don’t tell the others what was wrong!')]}))};
  S.stage='done';S.actUI=null;render();
}
function endGame(reason){
  S.phase='end';S.endReason=reason;S.stage='end';
  if(reason==='time')addLog(()=>T('Czas śledztwa minął. Sprawa trafia do prokuratury bez rozstrzygnięcia przez zespół.','Investigation time is up. The case goes to the prosecutor without a team verdict.'));
  if(reason==='allout')addLog(()=>T('Wszyscy inspektorzy zgłosili błędne rozwiązania.','All inspectors submitted wrong solutions.'));
  UI.ov='end';render();
}
