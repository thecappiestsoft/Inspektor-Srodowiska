/*
 * main.js
 * Punkt startowy aplikacji.
 */

/* ============ START ============ */
function start(data){
  if(data&&data.S&&data.S.v===2){S=data.S;UI=Object.assign(UI,data.UI||{})}
  if(data&&data.LANG){LANG=data.LANG;document.documentElement.lang=LANG}
  render();
}
if(window.claude?.hot?.snapshot)window.claude.hot.snapshot(()=>({S,UI,LANG}));
window.claude?.hot?.ready?window.claude.hot.ready(start):start(window.claude?.hot?.data??{});
