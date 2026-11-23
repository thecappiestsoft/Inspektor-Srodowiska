/*
 * persistence.js
 * Licznik czasu śledztwa i zapis stanu do localStorage.
 */

/* ============ CZAS I ZAPIS ============ */
let lastTick=Date.now();
function tickTimer(){
  const now=Date.now();const dt=now-lastTick;lastTick=now;
  if(!S||S.phase!=='play'||S.timeLeft==null)return;
  if(!S.paused&&S.stage!=='curtain'&&!S.finalRound)S.timeLeft=Math.max(0,S.timeLeft-dt);
  const el=$('#timer');if(el)el.textContent=fmtTime(S.timeLeft);
  const pill=$('#timerpill');if(pill)pill.classList.toggle('alert',S.timeLeft<5*60000);
  if(S.timeLeft<=0&&!S.finalRound){S.finalRound=true;S.endAt=S.cur;addLog(()=>T('Czas śledztwa minął! Rozpoczyna się ostatnia runda: każdy ma jeszcze jedną turę.','Investigation time is up! The final round begins: everyone gets one more turn.'));render()}
}
setInterval(()=>{tickTimer();if(S&&S.phase==='play'&&Date.now()%10000<1000)save()},1000);
function save(){try{if(S)localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
