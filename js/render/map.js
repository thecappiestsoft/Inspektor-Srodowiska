/*
 * map.js
 * Render mapy SVG: warstwa statyczna (teren, cieki) i dynamiczna (węzły, zasięg, pionki).
 */

/* ============ RENDER: MAPA ============ */
function smooth(pts){
  let d=`M${pts[0][0]} ${pts[0][1]}`;
  for(let i=0;i<pts.length-1;i++){const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;
    const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];
    d+=` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`}
  return d;
}
const RSTYLE={
  ditch:'stroke="var(--water)" stroke-width="4" stroke-linecap="round"',
  stream:'stroke="var(--water)" stroke-width="6.5" stroke-linecap="round"',
  drain:'stroke="var(--water)" stroke-width="3.5" stroke-dasharray="1 7" stroke-linecap="round"',
  pipe:'stroke="var(--pipe)" stroke-width="4" stroke-dasharray="10 6"',
  main:'stroke="var(--pipe)" stroke-width="6"',
  rogue:'stroke="var(--rogue)" stroke-width="4" stroke-dasharray="3 7" stroke-linecap="round"',
};
function staticMap(){
  let s=`<defs>
   <pattern id="fieldp" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><rect width="10" height="10" fill="var(--field)"/><line x1="0" y1="0" x2="0" y2="10" stroke="var(--land)" stroke-width="3"/></pattern>
   <pattern id="lakep" width="22" height="12" patternUnits="userSpaceOnUse"><rect width="22" height="12" fill="var(--lake)"/><path d="M2 7 q4 -3 8 0 t8 0" fill="none" stroke="var(--lake-edge)" stroke-width="1" opacity=".55"/></pattern>
  </defs>
  <rect x="0" y="0" width="1000" height="740" rx="10" fill="var(--land)"/>
  <path d="M0 360 C120 330 160 380 240 360 L240 460 L0 470Z" fill="url(#fieldp)" opacity=".8"/>
  <path d="M110 560 L380 560 L400 600 L150 610Z" fill="url(#fieldp)" opacity=".8"/>
  <path d="M600 160 L760 140 L790 220 L640 250Z" fill="url(#fieldp)" opacity=".55"/>
  <g fill="none" stroke="var(--line)" stroke-width="1">
   <path d="M20 40 C200 20 300 30 480 20"/><path d="M20 60 C220 45 320 55 500 42"/><path d="M820 60 C880 90 940 80 990 110"/><path d="M800 90 C870 120 930 110 990 140"/>
  </g>
  <path d="M590 500 C595 425 700 392 800 402 C905 410 978 468 966 562 C955 645 880 684 780 676 C680 668 598 625 586 560 C584 535 587 515 590 500Z" fill="url(#lakep)" stroke="var(--lake-edge)" stroke-width="2.5"/>
  <text x="790" y="548" text-anchor="middle" font-family="var(--display)" font-weight="700" font-size="26" fill="var(--water)" opacity=".85">${T('Jezioro Olszynowe','Lake Olszynowe')}</text>
  <text x="790" y="572" text-anchor="middle" font-family="var(--mono)" font-size="12" fill="var(--water)" opacity=".8">${T('pow. 1,8 km² · gł. maks. 14 m','area 1.8 km² · max depth 14 m')}</text>`;
  s+='<g>'+ROADS.map(([a,b])=>`<line x1="${NODES[a].x}" y1="${NODES[a].y}" x2="${NODES[b].x}" y2="${NODES[b].y}" stroke="var(--line)" stroke-width="2.5" stroke-dasharray="2 5" stroke-linecap="round"/>`).join('')+'</g>';
  for(const r of ROUTE_IDS){const R=ROUTES[r];
    if(R.style==='stream')s+=`<path d="${smooth(R.geo)}" fill="none" stroke="var(--lake)" stroke-width="11" stroke-linecap="round" opacity=".9"/>`;
    s+=`<path d="${smooth(R.geo)}" fill="none" ${RSTYLE[R.style]}/>`;
    (R.spurs||[]).forEach(sp=>s+=`<path d="M${sp[0][0]} ${sp[0][1]} L${sp[1][0]} ${sp[1][1]}" fill="none" ${RSTYLE[R.style]}/>`);
    const [lx,ly]=R.label;
    s+=`<text x="${lx}" y="${ly}" text-anchor="middle" font-family="var(--mono)" font-size="12.5" font-weight="600" fill="${R.style==='rogue'?'var(--rogue)':R.style==='pipe'||R.style==='main'?'var(--pipe)':'var(--water)'}" paint-order="stroke" stroke="var(--land)" stroke-width="4">${esc(rN(r))}</text>`;
  }
  s+=`<g transform="translate(950,60)"><circle r="22" fill="var(--sheet)" stroke="var(--line)"/><path d="M0 -17 L6 4 L0 0 L-6 4Z" fill="var(--ink)"/><text y="16" text-anchor="middle" font-family="var(--mono)" font-size="10" fill="var(--muted)">N</text></g>
  <g transform="translate(30,712)"><rect width="50" height="6" fill="var(--ink)"/><rect x="50" width="50" height="6" fill="var(--sheet)" stroke="var(--ink)" stroke-width="1"/><text y="-5" font-family="var(--mono)" font-size="10" fill="var(--muted)">0</text><text x="100" y="-5" text-anchor="middle" font-family="var(--mono)" font-size="10" fill="var(--muted)">500 m</text></g>`;
  return s;
}
const FACT='M-16 10 L-16 -4 L-8 -10 L-8 -4 L0 -10 L0 -4 L8 -10 L8 -14 L12 -14 L12 10Z';
function dynMap(){
  let s='';const reach=S&&S.stage==='move'?S.reach:null;
  for(const id in NODES){const n=NODES[id];const can=reach&&reach[id]!==undefined;
    let shape='';
    if(n.t==='plant')shape=`<rect x="-30" y="-22" width="60" height="44" rx="7" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2"/><path d="${FACT}" fill="var(--ink)"/>`;
    else if(n.t==='pt')shape=`<rect x="-9" y="-9" width="18" height="18" transform="rotate(45)" fill="var(--sheet)" stroke="var(--water)" stroke-width="3"/><circle r="2.5" fill="var(--water)"/>`;
    else if(n.t==='lab')shape=`<circle r="18" fill="var(--ink)"/><path d="M-4 -10 h8 M-3 -10 v7 l-7 11 h20 l-7 -11 v-7" fill="none" stroke="var(--paper)" stroke-width="2" stroke-linejoin="round"/>`;
    else if(n.t==='office')shape=`<circle r="17" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2"/><path d="M-9 8 h18 M-7 6 v-8 M-2 6 v-8 M3 6 v-8 M8 6 v-8 M-10 -4 L0 -11 L10 -4Z" fill="none" stroke="var(--ink)" stroke-width="1.8"/>`;
    else if(n.t==='village')shape=`<circle r="17" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2"/><path d="M-10 8 v-8 l5 -5 l5 5 v8Z M1 8 v-6 l4.5 -4.5 l4.5 4.5 v6Z" fill="var(--ink)"/>`;
    else shape=`<circle r="16" fill="var(--sheet)" stroke="var(--water)" stroke-width="2.5"/><path d="M-9 2 q4.5 -4 9 0 t9 0 M-9 7 q4.5 -4 9 0 t9 0" fill="none" stroke="var(--water)" stroke-width="2"/>`;
    const ring=can?`<circle class="reachring" r="${n.t==='plant'?40:n.t==='pt'?19:27}" fill="var(--accent-soft)" fill-opacity=".55" stroke="var(--accent)" stroke-width="3" stroke-dasharray="5 4"/>`:'';
    const ly=n.t==='plant'?36:n.t==='pt'?24:32;
    const lbl=n.t==='pt'?n.code:nShort(id);
    const costTag=can?`<g transform="translate(${n.t==='plant'?30:18},${n.t==='plant'?-24:-16})"><circle r="10" fill="var(--accent)"/><text y="4" text-anchor="middle" font-family="var(--mono)" font-size="11" font-weight="600" fill="var(--on-accent)">${reach[id]}</text></g>`:'';
    s+=`<g class="mapnode${can?' can':''}" data-node="${id}" transform="translate(${n.x},${n.y})" ${can?`tabindex="0" role="button" aria-label="${T('Idź do','Go to')}: ${esc(nName(id))}"`:''}><title>${esc(nName(id))}</title>${ring}${shape}
      <text y="${ly}" text-anchor="middle" font-family="${n.t==='pt'?'var(--mono)':'var(--display)'}" font-weight="700" font-size="${n.t==='pt'?12:13.5}" fill="${n.t==='pt'?'var(--water)':'var(--ink)'}" paint-order="stroke" stroke="var(--land)" stroke-width="4">${esc(lbl)}</text>${costTag}</g>`;
  }
  if(S&&S.phase){const byPos={};S.players.forEach((p,i)=>{(byPos[p.pos]=byPos[p.pos]||[]).push(i)});
    for(const pos in byPos){const n=NODES[pos];const arr=byPos[pos];
      arr.forEach((i,k)=>{const p=S.players[i];const ang=(-90+k*(360/Math.max(arr.length,1)))*Math.PI/180;const rad=arr.length>1?16:0;
        const ox=n.x+(n.t==='plant'?-38:-22)+Math.cos(ang)*rad*0.6,oy=n.y-(n.t==='plant'?26:20)+Math.sin(ang)*rad*0.6;
        s+=`<g transform="translate(${ox.toFixed(1)},${oy.toFixed(1)})"><circle r="10" fill="${p.color}" stroke="var(--sheet)" stroke-width="2.5"/>${i===S.cur&&S.phase==='play'?`<circle r="14" fill="none" stroke="${p.color}" stroke-width="2"/>`:''}<text y="4" text-anchor="middle" font-family="var(--mono)" font-size="11" font-weight="600" fill="#fff">${i+1}</text></g>`})}}
  return s;
}
