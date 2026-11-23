/*
 * cards.js
 * Karty gry (CARD_IDS), ich nazwy oraz kolory graczy.
 */

const CARD_IDS=[...SUB_IDS.map(s=>'S:'+s),...PLANT_IDS.map(p=>'P:'+p),...ROUTE_IDS.map(r=>'R:'+r)];
function cardName(c){const [k,id]=c.split(':');if(k==='S')return sN(id)+' ('+SUB[id].f+')';if(k==='P')return pN(id);return rN(id)}
function cardShort(c){const [k,id]=c.split(':');if(k==='S')return SUB[id].f;if(k==='P')return pS(id);return rN(id)}
const COLORS=['#D1495B','#1F9E89','#E39A16','#8A63C8','#3D7DC4'];
