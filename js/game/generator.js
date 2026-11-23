/*
 * generator.js
 * Generowanie sprawy: losowanie rozwiązania, talie dokumentów i zeznań, wydarzenia rund, newGame().
 */

/* ============ GENEROWANIE SPRAWY ============ */
function makeSolution(){
  const combos=[];
  for(const p of PLANT_IDS)for(const s of PLANT[p].subs)for(const r of PLANT[p].routes)combos.push({s,p,r});
  return pick(combos);
}
const SOLREP=[
 ['Raport WIOŚ sprzed 14 miesięcy: zalecono uszczelnienie osadnika ścieków i usunięcie przewodu obejściowego. Brak potwierdzenia wykonania zaleceń.','Environmental inspectorate report from 14 months ago: the plant was ordered to seal its settling tank and remove a bypass pipe. There is no confirmation that this was done.'],
 ['Bilans wody: w ostatnim miesiącu zużycie wody wzrosło o 40%, a ilość ścieków przekazanych do utylizacji się nie zmieniła. Kierownictwo nie udzieliło wyjaśnień.','Water balance: water use rose by 40% last month, but the amount of wastewater sent for disposal did not change. Management gave no explanation.'],
 ['Dziennik zmian, noc z 12 na 13 października: wpis „awaria pompy osadnika – rozwiązane”. Brak protokołu naprawy i brak podpisu kierownika.','Shift log, night of 12–13 October: entry “settling tank pump failure – sorted”. No repair record and no manager’s signature.']];
const ALIBI=[
 ['Protokół kontroli: zakład wstrzymał produkcję 5 tygodni temu (remont hali). Od tego czasu nie powstają ścieki technologiczne. Zawory zaplombowane, plomby nienaruszone. Zakład nie mógł być źródłem zanieczyszczenia.','Inspection report: the plant halted production 5 weeks ago (hall renovation). No process wastewater has been produced since. Valves sealed, seals intact. The plant cannot be the source of the pollution.'],
 ['Kontrola z ubiegłego tygodnia: wszystkie wyloty zakładu zamknięte i zaplombowane, zbiorniki ścieków bez ubytków, rejestr odbioru ścieków kompletny. Zakład wykluczony jako źródło zrzutu.','Inspection last week: all of the plant’s outlets closed and sealed, wastewater tanks show no losses, disposal register complete. The plant is ruled out as the discharge source.']];
function genDecks(sol){
  const decks={plant:{},office:[],village:[],fish:[]};
  const innocents=PLANT_IDS.filter(p=>p!==sol.p);
  const full=new Set(shuffle(innocents).slice(0,2));
  const nonSolRoutes=ROUTE_IDS.filter(r=>r!==sol.r);
  let permitNo=1031;
  for(const p of PLANT_IDS){
    const P=PLANT[p],lg=P.legal,conns=P.routes.map(rN).join(', '),no=permitNo++;
    let permit;
    if(lg) permit=T(`Pozwolenie wodnoprawne nr OŚ.6341.${no}.2024. Zakład może odprowadzać ścieki po oczyszczeniu do: ${rN(lg.r)}. Dopuszczony ładunek ${SUB[lg.s].f} – w niskim stężeniu, poniżej norm. Wszystkie przyłącza zakładu w ewidencji: ${conns}.`,
      `Water permit no. OŚ.6341.${no}.2024. The plant may discharge treated wastewater into: ${rN(lg.r)}. Permitted load of ${SUB[lg.s].f} – at low concentration, below the limits. All of the plant’s registered connections: ${conns}.`);
    else if(p==='GAL') permit=T(`Pozwolenie nr OŚ.6341.${no}.2023: ścieki z płuczek mogą trafiać do kanalizacji sanitarnej wyłącznie po podczyszczeniu (strącanie metali). Zakład nie ma prawa do zrzutu ścieków do rowów ani kanalizacji deszczowej. Przyłącza w ewidencji: ${conns}.`,
      `Permit no. OŚ.6341.${no}.2023: rinse wastewater may enter the sanitary sewer only after pre-treatment (metal precipitation). The plant has no right to discharge into ditches or the storm sewer. Registered connections: ${conns}.`);
    else permit=T(`Pozwolenie nr OŚ.6341.${no}.2024: wody opadowe z placu mogą trafiać do kanalizacji deszczowej tylko przez separator substancji ropopochodnych. Przyłącza w ewidencji: ${conns}.`,
      `Permit no. OŚ.6341.${no}.2024: forecourt rainwater may enter the storm sewer only through an oil separator. Registered connections: ${conns}.`);
    let report;
    if(p===sol.p) report=tr(pick(SOLREP));
    else if(full.has(p)) report=tr(pick(ALIBI));
    else{
      const s=pick(P.subs);const rs=P.routes.filter(r=>!(lg&&lg.r===r));const r=pick(rs);
      report=T(`Protokół kontroli: linia technologiczna, w której powstają ścieki z ${SUB[s].f} (${sN(s).toLowerCase()}), nie pracuje od miesiąca. Przyłącze zakładu do: ${rN(r)} zostało zaślepione – potwierdzono kamerą inspekcyjną.`,
        `Inspection report: the production line that generates wastewater with ${SUB[s].f} (${sN(s).toLowerCase()}) has been idle for a month. The plant’s connection to the ${rN(r)} has been capped – confirmed by a CCTV pipe camera.`);
    }
    let worker;
    if(p===sol.p) worker=T('Anonimowe zeznanie pracownika: „Kiedy osadnik się przepełnia, kierownik każe w nocy otwierać zawór obejściowy. Nikt tego nie zapisuje.”','Anonymous statement from an employee: “When the settling tank overflows, the manager tells us to open the bypass valve at night. Nobody writes it down.”');
    else{
      const k=rnd(3),cr=pick(nonSolRoutes),op=pick(PLANT_IDS.filter(x=>x!==p));
      worker=[T(`Zeznanie pracownika: „Od lat moczę sieci w miejscu, gdzie ${rN(cr)} wpada do jeziora. Woda tam czysta, ryby są.”`,`Employee statement: “For years I’ve set my nets where the ${rN(cr)} flows into the lake. The water there is clean and there are fish.”`),
        T('Zeznanie pracownika: „U nas ścieki idą do zbiorników, odbiera je firma z atestem. Kontrole są co tydzień, wszystko w papierach.”','Employee statement: “Our wastewater goes into tanks and a certified company collects it. There are weekly checks and it’s all on paper.”'),
        T(`Zeznanie pracownika: „Słyszałem, że ktoś grzebał przy przyłączach koło: ${pS(op).toLowerCase()}. Ale to tylko plotka z kantyny.”`,`Employee statement: “I heard someone was messing with the connections near the ${pS(op).toLowerCase()}. But that’s just canteen gossip.”`)][k];
    }
    decks.plant[p]=[{t:T('Pozwolenie wodnoprawne','Water permit'),x:permit},{t:T('Raport z kontroli','Inspection report'),x:report},{t:T('Zeznanie pracownika','Employee statement'),x:worker}];
  }
  const r1=pick(nonSolRoutes);
  const r2=pick(nonSolRoutes.filter(r=>r!==r1));
  const pairs=[];for(const p of PLANT_IDS)for(const r of PLANT[p].routes){if(p===sol.p&&r===sol.r)continue;const lg=PLANT[p].legal;if(lg&&lg.r===r)continue;pairs.push([p,r])}
  const pr=pick(pairs);
  decks.office=shuffle([
    {t:T('Rejestr monitoringu','Monitoring register'),x:T(`Automatyczna sonda na odcinku: ${rN(r1)}. W ostatnim miesiącu wszystkie parametry w normie, brak alarmów.`,`Automatic probe on the ${rN(r1)}. All parameters within limits over the last month, no alarms.`)},
    {t:T('Mapa uzbrojenia terenu','Utility map'),x:T(`Przyłącze zakładu ${pN(pr[0])} do: ${rN(pr[1])} zlikwidowano w 2024 r. (protokół odbioru robót).`,`The connection from ${pN(pr[0])} to the ${rN(pr[1])} was removed in 2024 (works acceptance record).`)},
    {t:T('Rejestr skarg','Complaints register'),x:T(`Brak skarg mieszkańców dotyczących odcinka: ${rN(r2)} w ostatnich trzech miesiącach.`,`No residents’ complaints about the ${rN(r2)} in the last three months.`)},
    {t:T('Historia jeziora','Lake history'),x:T('Monitoring 2025: jezioro w dobrym stanie, ryby bez objawów chorobowych. Pierwsze śnięte ryby zgłoszono 9 dni temu.','2025 monitoring: the lake was in good condition, fish showed no signs of disease. The first dead fish were reported 9 days ago.')},
  ]);
  const other=pick(innocents);
  const pairSus=shuffle([pS(sol.p),pS(other)]);
  const plumbR=pick(nonSolRoutes);
  decks.village=shuffle([
    {t:T('Zeznanie mieszkańca','Resident’s statement'),x:T(`„Dwie noce temu słyszałem pracę pompy i plusk od strony: ${pairSus.join(' albo ')}. Z drogi trudno było rozpoznać.”`,`“Two nights ago I heard a pump running and splashing from the direction of the ${pairSus.join(' or the ').toLowerCase()}. Hard to tell from the road.”`)},
    {t:T('Zeznanie mieszkanki','Resident’s statement'),x:tr(SYMPT[sol.s][0])},
    {t:T('Zeznanie hydraulika','Plumber’s statement'),x:T(`„Czyściłem w zeszłym tygodniu: ${rN(plumbR)}. Szlam bez zapachu i bez zabarwienia.”`,`“Last week I cleaned the ${rN(plumbR)}. The sludge had no smell and no colour.”`)},
    {t:T('Zeznanie sołtysa','Village head’s statement'),x:T('„Odkąd ryby giną, przyjeżdża tu telewizja. Ludzie się boją kąpać, odwołaliśmy festyn nad jeziorem.”','“Since the fish started dying, TV crews keep coming. People are afraid to swim, and we cancelled the lakeside festival.”')},
  ]);
  const otherR=pick(nonSolRoutes);
  const pairR=shuffle([rN(sol.r),rN(otherR)]);
  const perchR=pick(nonSolRoutes);
  decks.fish=shuffle([
    {t:T('Relacja wędkarza','Angler’s account'),x:T(`„Najwięcej śniętych ryb jest w zatoce przy ujściu: ${pairR.join(' albo ')}.”`,`“Most of the dead fish are in the bay where the ${pairR.join(' or the ')} comes in.”`)},
    {t:T('Relacja wędkarza','Angler’s account'),x:tr(SYMPT[sol.s][1])},
    {t:T('Relacja wędkarza','Angler’s account'),x:T(`„Przy ujściu: ${rN(perchR)} biorą okonie jak zawsze, tam nic złego się nie dzieje.”`,`“Where the ${rN(perchR)} comes in, the perch are biting as usual. Nothing wrong there.”`)},
    {t:T('Relacja wędkarza','Angler’s account'),x:T('„Giną głównie leszcze i płocie. Zaczęło się po ciepłych dniach na początku miesiąca.”','“It’s mostly bream and roach dying. It started after the warm days at the beginning of the month.”')},
  ]);
  return decks;
}
function genEvents(sol,handCards){
  const closable=pick(['R2','R3','R6'].filter(r=>r!==sol.r));
  const anyCard=pick(handCards);
  const fishPair=shuffle([rN(sol.r),rN(pick(ROUTE_IDS.filter(r=>r!==sol.r)))]);
  const rumor=pick(PLANT_IDS);
  const bio=['PO4','NH4'].includes(sol.s);
  return shuffle([
    {id:'rain',t:T('Ulewa','Downpour'),x:T('Intensywne opady rozcieńczają wodę w otwartych ciekach (Rów Północny, Potok Olszynka, Drenaż polowy). W tej rundzie wyniki testów w tych ciekach są słabsze.','Heavy rain dilutes the water in open channels (North Ditch, Olszynka Stream, Field Drainage). This round, test results there are weaker.')},
    {id:'supply',t:T('Dostawa odczynników','Reagent delivery'),x:T('Kurier dowiózł zapasy: każdy inspektor dostaje po 1 porcji każdego odczynnika (do limitu zestawu).','A courier brought supplies: every inspector gets 1 portion of each reagent (up to the kit limit).')},
    {id:'fish',t:T('Masowe śnięcie ryb','Mass fish kill'),x:T(`Służby zgłaszają setki śniętych ryb w zatoce przy ujściu: ${fishPair.join(' lub ')}.`,`Emergency services report hundreds of dead fish in the bay where the ${fishPair.join(' or the ')} comes in.`)},
    {id:'closed',t:T('Kontrola Wód Polskich','Water authority inspection'),x:T(`Inspektorzy sprawdzili odcinek: ${rN(closable)}. Od 3 tygodni przepływ był zatrzymany zastawką – tą drogą nic nie trafiało do jeziora.`,`Inspectors checked the ${rN(closable)}. Flow has been blocked by a sluice gate for 3 weeks – nothing reached the lake that way.`)},
    {id:'bloom',t:T('Badanie hydrobiologiczne','Hydrobiology survey'),x:bio?T('W zatoce zakwit sinic: woda zielona i mętna, mało tlenu przy dnie. To typowy objaw eutrofizacji (nadmiaru biogenów).','A cyanobacteria bloom in the bay: green, cloudy water and little oxygen near the bottom. A typical sign of eutrophication (excess nutrients).'):T('Hydrobiolodzy: brak zakwitu glonów, ilość fitoplanktonu w normie. Biogeny raczej nie są przyczyną.','Hydrobiologists: no algal bloom, phytoplankton levels normal. Nutrients are unlikely to be the cause.')},
    {id:'rumor',t:T('Artykuł w lokalnej gazecie','Local newspaper article'),x:T(`„Głos Olszynki” pisze, że winna jest ${pN(rumor)}. Redakcja nie podaje żadnych dowodów.`,`The “Olszynka Voice” claims that ${pN(rumor)} is to blame. The paper gives no evidence.`)},
    {id:'car',t:T('Awaria terenówki','Off-roader breakdown'),x:T('W tej rundzie każdy wynik rzutu kostką jest mniejszy o 2 (minimum 1).','This round every die roll is reduced by 2 (minimum 1).')},
    {id:'blackout',t:T('Brak prądu w laboratorium','Power cut at the lab'),x:T('W tej rundzie w laboratorium nie można uzupełnić odczynników.','This round reagents cannot be restocked at the laboratory.')},
    {id:'letter',t:T('Anonimowy list','Anonymous letter'),x:T(`Do komisji trafił list: „${cardName(anyCard)} nie ma nic wspólnego ze sprawą.” Zespół sprawdził – to prawda.`,`A letter reached the commission: “${cardName(anyCard)} has nothing to do with the case.” The team checked – it’s true.`)},
    {id:'heat',t:T('Upał','Heatwave'),x:T('Woda się nagrzewa: maleje rozpuszczalność tlenu, a w równowadze NH₄⁺ ⇌ NH₃ + H⁺ rośnie udział toksycznego NH₃. Ryby są bardziej wrażliwe na każde zanieczyszczenie.','The water warms up: oxygen solubility drops, and in the equilibrium NH₄⁺ ⇌ NH₃ + H⁺ the share of toxic NH₃ rises. Fish become more sensitive to any pollution.')},
  ]);
}
function newGame(){
  const n=UI.setupN;const sol=makeSolution();
  const env=['S:'+sol.s,'P:'+sol.p,'R:'+sol.r];
  const rest=shuffle(CARD_IDS.filter(c=>!env.includes(c)));
  const players=[];
  for(let i=0;i<n;i++){
    const inv={};REAG.forEach(r=>{if(r.max)inv[r.id]=r.max});
    players.push({idx:i,name:(UI.names[i]||'').trim(),color:COLORS[i],pos:'LAB',hand:[],inv,marks:{},auto:{},ev:[],read:{},suspended:0,out:false,notes:'',stats:{tests:0,docs:0,conf:0}});
  }
  rest.forEach((c,i)=>players[i%n].hand.push(c));
  players.forEach(p=>p.hand.forEach(c=>p.auto[c]={hand:true}));
  S={v:2,phase:'play',cfg:{mode:UI.setupMode,timer:UI.setupTimer,cheat:UI.setupCheat},players,cur:0,round:1,stage:'curtain',roll:null,reach:null,actUI:null,last:null,
    sol,decks:both(()=>genDecks(sol)),evList:both(()=>genEvents(sol,rest)),evI:-1,eventRound:0,log:[],timeLeft:UI.setupTimer?UI.setupTimer*60000:null,paused:false,finalRound:false,endAt:null,winner:null,endReason:null,bonus:false,report:{}};
  addLog(()=>T('Sprawa otwarta. Inspektorzy zbierają się w laboratorium terenowym. W kopercie: substancja, zakład i droga zrzutu.','Case opened. The inspectors gather at the field laboratory. In the envelope: a substance, a plant and a discharge route.'));
  UI.tab='akcje';UI.ov=null;
  render();
}
