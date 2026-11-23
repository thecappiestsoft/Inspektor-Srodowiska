/*
 * i18n.js
 * Język i motyw: LANG, THEME, T(pl,en), tr([pl,en]), both() – generowanie tekstu w obu językach z jednym ziarnem, plPL() – polska odmiana liczebników.
 */

/* ============ JĘZYK / LANGUAGE ============ */
let LANG='pl';try{const l=localStorage.getItem('inspektor-lang');if(l==='pl'||l==='en')LANG=l}catch(e){}
document.documentElement.lang=LANG;
let THEME=null;try{const t=localStorage.getItem('inspektor-theme');if(t==='light'||t==='dark')THEME=t}catch(e){}
if(THEME)document.documentElement.setAttribute('data-theme',THEME);
const sysDark=()=>{try{return window.matchMedia('(prefers-color-scheme: dark)').matches}catch(e){return false}};
const effTheme=()=>THEME||document.documentElement.getAttribute('data-theme')||(sysDark()?'dark':'light');
const T=(pl,en)=>LANG==='en'?en:pl;
const tr=a=>Array.isArray(a)?a[LANG==='en'?1:0]:a;
let RNG=Math.random;
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
/* uruchamia generator tekstu w obu językach z tym samym ziarnem losowości */
function both(fn){const seed=Math.floor(Math.random()*2147483647);const o=LANG;const out={};for(const l of ['pl','en']){LANG=l;RNG=mulberry(seed);out[l]=fn()}LANG=o;RNG=Math.random;return out}
function plPL(n,a,b,c){if(n===1)return a;const d=n%10,h=n%100;if(d>=2&&d<=4&&(h<12||h>14))return b;return c}
