/*
 * world.js
 * Świat gry: substancje (SUB), zakłady (PLANT), drogi zrzutu (ROUTES), węzły mapy (NODES), drogi dojazdowe (ROADS) i graf ADJ.
 */

/* ============ DANE GRY ============ */
const SUB={
  SO4:{name:['Jony siarczanowe(VI)','Sulfate ions'],f:'SO₄²⁻'},
  CL:{name:['Jony chlorkowe','Chloride ions'],f:'Cl⁻'},
  NH4:{name:['Amoniak / jony amonowe','Ammonia / ammonium ions'],f:'NH₃ / NH₄⁺'},
  CU:{name:['Jony miedzi(II)','Copper(II) ions'],f:'Cu²⁺'},
  PO4:{name:['Jony fosforanowe(V)','Phosphate ions'],f:'PO₄³⁻'},
  OIL:{name:['Substancje ropopochodne','Petroleum products'],f:'CₓHᵧ'},
};
const SUB_IDS=Object.keys(SUB);
const sN=id=>tr(SUB[id].name);
const PLANT={
  GAR:{name:['Garbarnia „Skórpol”','Skórpol Tannery'],short:['Garbarnia','Tannery'],subs:['CL','SO4','NH4'],routes:['R1','R3'],legal:{s:'CL',r:'R1'},
    desc:['Wyprawa skór: solenie NaCl, garbowanie siarczanem chromu(III), odwapnianie siarczanem amonu.','Leather processing: salting hides with NaCl, tanning with chromium(III) sulfate, deliming with ammonium sulfate.']},
  GAL:{name:['Galwanizernia „Metalchrom”','Metalchrom Electroplating'],short:['Galwanizernia','Electroplating'],subs:['CU','SO4','CL'],routes:['R1','R2','R4'],legal:null,
    desc:['Miedziowanie w kąpielach z CuSO₄, trawienie detali w HCl i H₂SO₄, płukanie w wannach.','Copper plating in CuSO₄ baths, pickling parts in HCl and H₂SO₄, rinsing in tanks.']},
  OCZ:{name:['Oczyszczalnia ścieków „Olszynka”','Olszynka Wastewater Treatment Plant'],short:['Oczyszczalnia','Treatment plant'],subs:['NH4','PO4','CL'],routes:['R1','R4'],legal:{s:'PO4',r:'R4'},
    desc:['Gminna oczyszczalnia biologiczna. Przy awarii nieoczyszczone ścieki niosą amoniak, fosforany i chlorki.','Municipal biological treatment plant. In a breakdown, untreated sewage carries ammonia, phosphates and chlorides.']},
  FER:{name:['Ferma trzody chlewnej','Pig Farm'],short:['Ferma trzody','Pig farm'],subs:['NH4','PO4'],routes:['R3','R5'],legal:{s:'NH4',r:'R5'},
    desc:['Ok. 2000 tuczników. Gnojowica bogata w azot amonowy i fosforany.','About 2,000 fattening pigs. Slurry rich in ammonium nitrogen and phosphates.']},
  STP:{name:['Stacja paliw „Petrostop”','Petrostop Fuel Station'],short:['Stacja paliw','Fuel station'],subs:['OIL','CL'],routes:['R2','R6'],legal:null,
    desc:['Dystrybutory, myjnia, plac. Wody opadowe przez separator; zimą solenie placu.','Pumps, car wash, forecourt. Rainwater runs through an oil separator; the forecourt is salted in winter.']},
  NAW:{name:['Fabryka nawozów „Azofos”','Azofos Fertiliser Factory'],short:['Fabryka nawozów','Fertiliser plant'],subs:['PO4','NH4','SO4'],routes:['R5','R6'],legal:{s:'SO4',r:'R5'},
    desc:['Produkcja superfosfatu i siarczanu amonu.','Produces superphosphate and ammonium sulfate.']},
};
const PLANT_IDS=Object.keys(PLANT);
const pN=id=>tr(PLANT[id].name), pS=id=>tr(PLANT[id].short);
const ROUTES={
  R1:{name:['Rów Północny','North Ditch'],kind:['otwarty rów melioracyjny','open drainage ditch'],open:true,order:['GAR','P1a','GAL','P1b','OCZ','P1c'],
      geo:[[110,110],[160,185],[260,195],[400,195],[540,200],[650,205],[700,330],[705,410]],spurs:[[[400,80],[400,195]],[[650,95],[650,205]]],style:'ditch',label:[322,182]},
  R2:{name:['Kolektor deszczowy','Storm Sewer'],kind:['podziemna kanalizacja deszczowa','underground storm drain'],open:false,order:['GAL','P2a','STP','P2b'],
      geo:[[400,80],[455,140],[470,255],[440,320],[380,340],[440,400],[520,440],[590,497]],style:'pipe',label:[468,395]},
  R3:{name:['Potok Olszynka','Olszynka Stream'],kind:['naturalny ciek','natural stream'],open:true,order:['GAR','P3a','FER','P3b'],
      geo:[[110,110],[65,190],[60,290],[90,420],[200,475],[380,490],[582,556]],style:'stream',label:[205,500]},
  R4:{name:['Rura zrzutowa oczyszczalni','Treatment Plant Outfall'],kind:['kanalizacja sanitarna i wylot','sanitary sewer and outfall'],open:false,order:['GAL','P4a','OCZ','P4b'],
      geo:[[400,80],[530,65],[650,95],[760,180],[830,280],[850,350],[852,413]],style:'main',label:[700,40]},
  R5:{name:['Drenaż polowy','Field Drainage'],kind:['dreny i rowy rolnicze','farm drains and ditches'],open:true,order:['FER','P5a','NAW','P5b'],
      geo:[[90,420],[115,535],[210,630],[340,640],[470,630],[603,612]],style:'drain',label:[340,662]},
  R6:{name:['Nieoznaczona rura','Unmarked Pipe'],kind:['stara rura podziemna bez oznaczeń','old unmarked underground pipe'],open:false,order:['STP','P6a','NAW','P6b'],
      geo:[[380,340],[330,440],[290,545],[210,630],[300,695],[560,705],[680,662]],style:'rogue',label:[420,728]},
};
const ROUTE_IDS=Object.keys(ROUTES);
const rN=id=>tr(ROUTES[id].name);
const NODES={
  LAB:{x:590,y:300,t:'lab',name:['Laboratorium terenowe','Field laboratory'],short:['Laboratorium','Laboratory']},
  WIE:{x:250,y:285,t:'village',name:['Wieś Olszynka','Olszynka village'],short:['Wieś','Village']},
  URZ:{x:885,y:190,t:'office',name:['Urząd gminy','Municipal office'],short:['Urząd','Office']},
  PRZ:{x:948,y:432,t:'lake',name:['Przystań wędkarska (jezioro)','Anglers’ jetty (lake)'],short:['Przystań','Jetty']},
  PLA:{x:890,y:698,t:'lake',name:['Plaża gminna (jezioro)','Public beach (lake)'],short:['Plaża','Beach']},
  GAR:{x:110,y:110,t:'plant'},GAL:{x:400,y:80,t:'plant'},OCZ:{x:650,y:95,t:'plant'},
  FER:{x:90,y:420,t:'plant'},STP:{x:380,y:340,t:'plant'},NAW:{x:210,y:630,t:'plant'},
  P1a:{x:260,y:195,t:'pt'},P1b:{x:540,y:200,t:'pt'},P1c:{x:700,y:330,t:'pt'},
  P2a:{x:470,y:255,t:'pt'},P2b:{x:520,y:440,t:'pt'},
  P3a:{x:60,y:290,t:'pt'},P3b:{x:380,y:490,t:'pt'},
  P4a:{x:530,y:65,t:'pt'},P4b:{x:850,y:350,t:'pt'},
  P5a:{x:115,y:535,t:'pt'},P5b:{x:470,y:630,t:'pt'},
  P6a:{x:290,y:545,t:'pt'},P6b:{x:560,y:705,t:'pt'},
};
for(const r of ROUTE_IDS){ROUTES[r].order.forEach(n=>{if(NODES[n].t==='pt'){NODES[n].route=r;NODES[n].code=n.slice(1).toUpperCase()}})}
function nName(id){const n=NODES[id];if(n.t==='plant')return pN(id);if(n.t==='pt')return T('Punkt poboru ','Sampling point ')+n.code+' – '+rN(n.route);return tr(n.name)}
function nShort(id){const n=NODES[id];if(n.t==='plant')return pS(id);if(n.t==='pt')return T('Punkt ','Point ')+n.code;return tr(n.short)}
const ROADS=[['LAB','P2a'],['LAB','P1b'],['LAB','STP'],['LAB','P2b'],['LAB','P1c'],['LAB','OCZ'],
 ['GAR','P1a'],['GAR','P3a'],['GAR','WIE'],['P1a','WIE'],['P1a','GAL'],
 ['GAL','P4a'],['GAL','P2a'],['P4a','OCZ'],['P1b','OCZ'],['P1b','P2a'],['P1b','GAL'],
 ['OCZ','URZ'],['OCZ','P1c'],['URZ','P4b'],['URZ','PRZ'],['P4b','PRZ'],['P1c','P4b'],['P1c','P2b'],
 ['P3a','FER'],['P3a','WIE'],['WIE','STP'],['FER','P5a'],['FER','P3b'],
 ['STP','P3b'],['STP','P6a'],['STP','P2b'],['P3b','P2b'],['P3b','P6a'],['P3b','P5b'],['P2b','P5b'],
 ['P5a','NAW'],['NAW','P6a'],['NAW','P5b'],['P5b','P6b'],['P6b','PLA'],['PRZ','PLA']];
const ADJ={};for(const k in NODES)ADJ[k]=[];
for(const [a,b] of ROADS){const d=Math.hypot(NODES[a].x-NODES[b].x,NODES[a].y-NODES[b].y);const c=Math.max(1,Math.round(d/110));ADJ[a].push([b,c]);ADJ[b].push([a,c])}
