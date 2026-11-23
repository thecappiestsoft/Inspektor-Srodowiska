/*
 * turn.js
 * Przebieg tury: rzut kostką, ruch, koniec tury, losowanie wydarzeń.
 */

/* --- przebieg tury --- */
function startTurn(){
  const p=curP();
  if(p.suspended>0){p.suspended--;addLog(()=>T(`${pname(p)} jest zawieszony(-a) – tura pominięta.`,`${pname(p)} is suspended – turn skipped.`));nextTurn();return}
  S.stage='roll';S.roll=null;S.reach=null;S.actUI=null;S.last=null;UI.tab='akcje';render();
}
function rollDie(){
  let v=1+Math.floor(Math.random()*6);const raw=v;const car=modOn('car');if(car)v=Math.max(1,v-2);
  S.roll=v;S.rawRoll=raw;S.reach=reachable(curP().pos,v);S.stage='move';
  const p=curP();addLog(()=>T(`${pname(p)} rzuca kostką: ${raw}${car?' (awaria terenówki: '+v+')':''}.`,`${pname(p)} rolls the die: ${raw}${car?' (breakdown: '+v+')':''}.`));
  render();const d=$('#die');if(d){d.classList.remove('roll');void d.offsetWidth;d.classList.add('roll')}
}
function moveTo(node){
  if(S.stage!=='move'||S.reach[node]===undefined)return;
  const p=curP();p.pos=node;S.stage='act';S.reach=null;addLog(()=>`${pname(p)} → ${nShort(node)}.`);render();
}
function stayHere(){S.stage='act';S.reach=null;render()}
function finishAction(){S.stage='done';S.actUI=null;render()}
function endTurn(){nextTurn()}
function nextTurn(){
  if(S.phase!=='play')return;
  const n=S.players.length;let next=(S.cur+1)%n;
  if(S.finalRound&&next===S.endAt){S.cur=next;endGame('time');return}
  if(next===0){S.round++;drawEvent()}
  S.cur=next;S.stage='curtain';S.last=null;S.actUI=null;render();
}
function drawEvent(){
  if(S.evI+1>=S.evList.pl.length)return;
  S.evI++;S.eventRound=S.round;const ev=S.evList.pl[S.evI];
  if(ev.id==='supply')S.players.forEach(p=>REAG.forEach(r=>{if(r.max)p.inv[r.id]=Math.min(r.max,p.inv[r.id]+1)}));
  const i=S.evI;addLog(()=>T(`Wydarzenie rundy ${S.round}: `,`Round ${S.round} event: `)+S.evList[LANG][i].t+'. '+S.evList[LANG][i].x);
}
