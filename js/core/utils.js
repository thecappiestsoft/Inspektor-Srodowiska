/*
 * utils.js
 * Narzędzia: $, esc, losowanie (rnd/pick/shuffle), klucz zapisu, nazwy graczy.
 */

/* ============ NARZĘDZIA ============ */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const rnd=n=>Math.floor(RNG()*n);
const pick=a=>a[rnd(a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const KEY='inspektor-srodowiska-v2';
const pname=p=>p.name||T('Inspektor ','Inspector ')+(p.idx+1);
const L=o=>o?o[LANG]:'';
