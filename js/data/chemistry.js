/*
 * chemistry.js
 * Chemia: odczynniki (REAG), dowody do oskarżenia (JUST), równania reakcji (EQ).
 */

const REAG=[
  {id:'OBS',name:['Oględziny i zapach','Visual and smell check'],hint:['bez odczynnika','no reagent'],max:null},
  {id:'PH',name:['Papierek uniwersalny','Universal indicator paper'],hint:['pomiar pH','pH measurement'],max:5},
  {id:'NAOH',name:['NaOH + ogrzewanie','NaOH + heating'],hint:['wodorotlenek sodu','sodium hydroxide'],max:3},
  {id:'NH3',name:['Woda amoniakalna','Aqueous ammonia'],hint:['NH₃·H₂O','NH₃·H₂O'],max:2},
  {id:'BACL',name:['BaCl₂','BaCl₂'],hint:['chlorek baru','barium chloride'],max:3},
  {id:'AGNO',name:['AgNO₃','AgNO₃'],hint:['azotan(V) srebra','silver nitrate'],max:3},
  {id:'MOLI',name:['Molibdenian amonu','Ammonium molybdate'],hint:['w HNO₃, ogrzewanie','in HNO₃, heated'],max:2},
  {id:'NESS',name:['Odczynnik Nesslera','Nessler’s reagent'],hint:['K₂[HgI₄] + KOH','K₂[HgI₄] + KOH'],max:2},
];
const RMAP=Object.fromEntries(REAG.map(r=>[r.id,r]));
function reagName(id){if(S&&S.cfg.mode==='8'){if(id==='BACL')return T('BaCl₂ (próbka zakwaszona HCl)','BaCl₂ (sample acidified with HCl)');if(id==='AGNO')return T('AgNO₃ (próbka zakwaszona HNO₃)','AgNO₃ (sample acidified with HNO₃)')}return tr(RMAP[id].name)}

const JUST=[
 {id:'j1',t:['NaOH: niebieski, galaretowaty osad','NaOH: blue, gelatinous precipitate'],s:['CU']},
 {id:'j2',t:['Woda amoniakalna w nadmiarze: roztwór intensywnie szafirowy','Excess aqueous ammonia: deep royal-blue solution'],s:['CU']},
 {id:'j3',t:['BaCl₂: biały, drobnokrystaliczny osad nierozpuszczalny w HCl','BaCl₂: white, fine crystalline precipitate insoluble in HCl'],s:['SO4']},
 {id:'j4',t:['AgNO₃: biały, serowaty osad ciemniejący na świetle, nierozpuszczalny w HNO₃','AgNO₃: white, curdy precipitate that darkens in light, insoluble in HNO₃'],s:['CL']},
 {id:'j5',t:['NaOH + ogrzewanie: zapach amoniaku, zwilżony papierek uniwersalny niebieszczeje','NaOH + heating: smell of ammonia, moist universal indicator paper turns blue'],s:['NH4']},
 {id:'j6',t:['Odczynnik Nesslera: żółtopomarańczowe zabarwienie / brunatny osad','Nessler’s reagent: yellow-orange colour / brown precipitate'],s:['NH4']},
 {id:'j7',t:['Molibdenian amonu: żółty, krystaliczny osad','Ammonium molybdate: yellow crystalline precipitate'],s:['PO4']},
 {id:'j8',t:['AgNO₃: żółty osad rozpuszczalny w HNO₃','AgNO₃: yellow precipitate soluble in HNO₃'],s:['PO4']},
 {id:'j9',t:['Oględziny: tęczowy, opalizujący film na powierzchni i zapach paliwa','Visual check: iridescent rainbow film on the surface and a smell of fuel'],s:['OIL']},
 {id:'d1',t:['BaCl₂: niebieski, galaretowaty osad','BaCl₂: blue, gelatinous precipitate'],s:[]},
 {id:'d2',t:['NaOH: biały osad rozpuszczalny w nadmiarze odczynnika','NaOH: white precipitate that dissolves in excess reagent'],s:[]},
 {id:'d3',t:['Papierek uniwersalny: pH ok. 7, brak zmian','Universal indicator paper: pH about 7, no change'],s:[]},
 {id:'d4',t:['AgNO₃: niebieski roztwór','AgNO₃: blue solution'],s:[]},
];
const EQ={
 CU:{ok:'Cu²⁺ + 2OH⁻ → Cu(OH)₂↓',bad:['Cu²⁺ + OH⁻ → CuOH↓','Cu⁺ + 2OH⁻ → Cu(OH)₂↓','Cu²⁺ + 2Cl⁻ → CuCl₂↓']},
 SO4:{ok:'Ba²⁺ + SO₄²⁻ → BaSO₄↓',bad:['Ba⁺ + SO₄⁻ → BaSO₄↓','Ba²⁺ + 2SO₄²⁻ → Ba(SO₄)₂↓','2Na⁺ + SO₄²⁻ → Na₂SO₄↓']},
 CL:{ok:'Ag⁺ + Cl⁻ → AgCl↓',bad:['Ag²⁺ + 2Cl⁻ → AgCl₂↓','Ag⁺ + NO₃⁻ → AgNO₃↓','Ba²⁺ + 2Cl⁻ → BaCl₂↓']},
 NH4:{ok:'NH₄⁺ + OH⁻ → NH₃↑ + H₂O',bad:['NH₄⁺ + OH⁻ → NH₄OH↓','NH₃ + OH⁻ → NH₄⁺ + O²⁻','NH₄⁺ + Na⁺ → NaNH₄↓']},
 PO4:{ok:'3Ag⁺ + PO₄³⁻ → Ag₃PO₄↓',bad:['Ag⁺ + PO₄³⁻ → AgPO₄↓','3Ag⁺ + PO₄³⁻ → Ag₃PO₄↑','Ag⁺ + PO₄⁻ → AgPO₄↓']},
 OIL:{q:['Pytanie bonusowe (brak równania dla wykrywania fizycznego): dlaczego ropopochodne tworzą na wodzie tęczowy film?','Bonus question (no equation for a physical test): why do petroleum products form a rainbow film on water?'],
      ok:['Nie rozpuszczają się w wodzie i mają mniejszą gęstość, więc tworzą cienką warstwę, w której światło ulega interferencji.','They are insoluble in water and less dense, so they form a thin layer in which light undergoes interference.'],
      bad:[['Reagują z wodą, tworząc barwne tlenki węgla.','They react with water to form coloured carbon oxides.'],['Są cięższe od wody i opadają, a na powierzchni zostaje barwny osad.','They are denser than water and sink, leaving a coloured residue on the surface.'],['Rozpuszczają się w wodzie i barwią ją na wszystkie kolory.','They dissolve in water and dye it every colour.']]},
};
const eqText=(s,i)=>tr(i===0?EQ[s].ok:EQ[s].bad[i-1]);
