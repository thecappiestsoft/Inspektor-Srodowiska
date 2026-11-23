/*
 * overlays.js
 * Render nakładek: setup, kurtyna, zasady, ściąga, oskarżenie, panel prowadzącego, ekran końcowy + tekst raportu.
 */

/* ============ OVERLAYS ============ */
function closeOv(){UI.ov=null;UI.ovData=null;renderOv()}
function renderOv(){
  const ov=$('#ov');const k=UI.ov;
  if(!k){ov.innerHTML='';return}
  let h='';
  if(k==='setup')h=setupHTML();
  else if(k==='curtain')h=curtainHTML();
  else if(k==='rules')h=rulesHTML();
  else if(k==='cheat')h=cheatHTML();
  else if(k==='accuse')h=accuseHTML();
  else if(k==='teacher')h=teacherHTML();
  else if(k==='end')h=endHTML();
  else if(k==='confirmNew')h=`<div class="sheet"><h2>${T('Zacząć nową grę?','Start a new game?')}</h2><p>${T('Bieżąca sprawa zostanie zakończona, a jej postęp usunięty.','The current case will end and its progress will be deleted.')}</p><div class="row" style="margin-top:14px"><button class="btn accent" data-o="doNew">${T('Tak, nowa gra','Yes, new game')}</button><button class="btn" data-o="close">${T('Anuluj','Cancel')}</button></div></div>`;
  ov.innerHTML=`<div class="overlay" role="dialog" aria-modal="true">${h}</div>`;
  bindOv();
}
function setupHTML(){
  let saved=null;try{saved=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
  const n=UI.setupN;
  return `<div class="sheet wide"><div class="sheethead"><div class="eyebrow">${T('Gra detektywistyczna · chemia i ochrona środowiska · klasa 8 i liceum','Detective game · chemistry and environmental protection · grade 8 and high school')}</div><div class="row">${themeSeg()}${langSeg()}</div></div><h2 style="font-size:clamp(28px,4vw,40px)">${T('Inspektor Środowiska','Environmental Inspector')}</h2>
  <p class="story">${T('W Jeziorze Olszynowym od dziewięciu dni giną ryby. Wokół jeziora działa sześć zakładów, a do wody prowadzą rowy, potok, dreny i rury. Jesteście zespołem inspektorów ochrony środowiska. Ustalcie, <b>jaka substancja</b> zanieczyszcza wodę, <b>który zakład</b> ją zrzuca i <b>którędy</b> trafia do jeziora. Rozwiązanie jest zamknięte w kopercie.','For nine days, fish have been dying in Lake Olszynowe. Six plants operate around the lake, and ditches, a stream, drains and pipes lead into the water. You are a team of environmental inspectors. Find out <b>which substance</b> is polluting the water, <b>which plant</b> is discharging it and <b>which route</b> it takes into the lake. The solution is sealed in an envelope.')}</p>
  ${saved&&saved.phase==='play'?`<div class="eventcard"><b>${T('Zapisana sprawa','Saved case')}</b> – ${T('runda','round')} ${saved.round}, ${T('gracze','players')}: ${saved.players.map(p=>esc(pname(p))).join(', ')}. <button class="btn small primary" data-o="resume" style="margin-left:8px">${T('Wznów grę','Resume game')}</button></div>`:''}
  <h3>${T('Liczba graczy','Number of players')}</h3><div class="seg">${[3,4,5].map(x=>`<button data-n="${x}" aria-pressed="${n===x}">${x}</button>`).join('')}</div>
  <h3>${T('Imiona inspektorów','Inspectors’ names')}</h3><div class="grid2">${[...Array(n)].map((_,i)=>`<label class="f"><span><span class="dot" style="display:inline-block;vertical-align:-1px;background:${COLORS[i]}"></span> ${T('Gracz','Player')} ${i+1}</span><input type="text" id="nm${i}" maxlength="18" value="${esc(UI.names[i])}" placeholder="${T('Inspektor','Inspector')} ${i+1}"></label>`).join('')}</div>
  <h3>${T('Poziom','Level')}</h3><div class="seg"><button data-mode="8" aria-pressed="${UI.setupMode==='8'}">${T('Klasa 8','Grade 8')}</button><button data-mode="LO" aria-pressed="${UI.setupMode==='LO'}">${T('Liceum','High school')}</button></div>
  <p class="note">${UI.setupMode==='8'?T('Klasa 8: próbki do testów z BaCl₂ i AgNO₃ są już zakwaszone, w ciekach nie ma tła z legalnych zrzutów.','Grade 8: samples for the BaCl₂ and AgNO₃ tests are already acidified, and there is no background from legal discharges.'):T('Liceum: fosforany przeszkadzają w testach z BaCl₂ i AgNO₃ (trzeba zakwasić osad), a legalne zrzuty dają słabe tło. Trzeba odróżnić opalescencję od obfitego osadu.','High school: phosphates interfere with the BaCl₂ and AgNO₃ tests (you must acidify the precipitate), and legal discharges give a faint background. You need to tell opalescence from a copious precipitate.')}</p>
  <h3>${T('Czas śledztwa','Investigation time')}</h3><div class="seg">${[[30,'30 min'],[40,'40 min'],[60,'60 min'],[0,T('bez limitu','no limit')]].map(([v,l])=>`<button data-timer="${v}" aria-pressed="${UI.setupTimer===v}">${l}</button>`).join('')}</div>
  <div class="checks" style="margin-top:12px"><label><input type="checkbox" id="cheatcb" ${UI.setupCheat?'checked':''}> ${T('Ściąga odczynników dostępna w trakcie gry','Reagent sheet available during the game')}</label></div>
  <div class="row" style="margin-top:18px"><button class="btn accent" data-o="start">${T('Otwórz sprawę','Open the case')}</button><button class="btn" data-o="rules">${T('Zasady gry','Game rules')}</button></div></div>`;
}
function curtainHTML(){
  const p=curP();const e=curEvent();
  const ev=e&&S.eventRound===S.round&&S.cur===0?`<div class="eventcard"><div class="eyebrow">${T('Wydarzenie rundy','Round event')} ${S.round}</div><b>${esc(e.t)}</b><p style="margin:4px 0 0">${esc(e.x)}</p></div>`:'';
  const susp=p.suspended>0;
  return `<div class="sheet curtain" style="--pc:${p.color}"><div class="sheethead"><div class="eyebrow">${T('Runda','Round')} ${S.round} · ${T('przekaż komputer','pass the computer')}</div>${langSeg()}</div><div class="who">${esc(pname(p))}</div><p>${susp?T('Ten inspektor jest zawieszony – tura zostanie pominięta.','This inspector is suspended – the turn will be skipped.'):T('Pozostali gracze odwracają wzrok od ekranu. Twoje karty, notatnik i wyniki badań są widoczne tylko podczas twojej tury.','The other players look away from the screen. Your cards, notebook and test results are visible only during your turn.')}</p>${ev}
  ${S.finalRound?`<p style="color:var(--bad)"><b>${T('Ostatnia runda!','Final round!')}</b> ${T('To twoja ostatnia tura.','This is your last turn.')}</p>`:''}
  <button class="btn accent" data-o="beginTurn" style="margin-top:8px">${susp?T('Dalej','Continue'):T('Jestem gotowy(-a) – zaczynam turę','I’m ready – start my turn')}</button></div>`;
}
function rulesHTML(){
  return `<div class="sheet wide"><button class="closex" data-o="close">${T('Zamknij','Close')}</button><h2>${T('Zasady gry','Game rules')}</h2>
  ${LANG==='en'?`<p class="story">For 3–5 players, about 40 minutes. As in Cluedo, the envelope holds three cards – a <b>substance</b>, a <b>plant</b> and a <b>route to the lake</b>. The remaining cards are dealt to the players: a card in your hand is definitely not in the envelope.</p>
  <h3>A turn</h3><p>1. Pass the computer – the others look away. 2. Roll the die and move along the roads (the number at a destination is its movement cost), or stay where you are. 3. Take one action where you stand. 4. Note your conclusions in the notebook and end your turn.</p>
  <h3>Actions</h3>
  <p><b>Sampling points and the lake</b> – test with a chosen reagent. The game gives only the observation (colour, precipitate, smell); you work out which ions are present. Water flows from the plants towards the lake: if a result appears at a point below a plant but not above it, you have a lead.</p>
  <p><b>Plants</b> – review documents (water permit, inspection report, employee statement; each visit reveals the next document) or make a <b>hypothesis</b>: name a substance and a route for the plant you are standing at. The first player after you who holds any of those cards shows you one of them.</p>
  <p><b>Municipal office</b> – the archive: monitoring registers, connection maps, complaints. <b>Village, jetty, beach</b> – witness statements. <b>Laboratory</b> – restock reagents and get a chemist’s tip.</p>
  <h3>Events</h3><p>From round 2, every round starts with an event: rain weakens results in open channels, a delivery brings reagents, witnesses and officials offer leads (some false, like newspaper gossip).</p>
  <h3>Solving the case</h3><p>On your turn you can submit a solution: substance, plant and route, plus <b>chemical evidence</b> (a test and its observation). If the evidence does not fit the chosen substance, the commission rejects the report and you lose your turn. If the solution is wrong, you can no longer accuse, but you still show cards. A correct <b>reaction equation</b> earns a bonus.</p>
  <h3>End of the game</h3><p>The first player with a correct, justified solution wins. When time runs out, everyone gets one more turn. At the end, the team writes an <b>inspector’s report</b> with recommendations for the plant.</p>`
  :`<p class="story">Gra dla 3–5 osób, ok. 40 minut. Jak w Cluedo: w kopercie leżą trzy karty – <b>substancja</b>, <b>zakład</b> i <b>droga do jeziora</b>. Pozostałe karty rozdano graczom: kart, które masz w ręce, na pewno nie ma w kopercie.</p>
  <h3>Przebieg tury</h3><p>1. Przekaż komputer – reszta odwraca wzrok. 2. Rzuć kostką i przejdź po drogach (cyfra przy celu to koszt ruchu) albo zostań w miejscu. 3. Wykonaj jedną akcję w miejscu, w którym stoisz. 4. Zapisz wnioski w notatniku i zakończ turę.</p>
  <h3>Akcje</h3>
  <p><b>Punkty poboru i jezioro</b> – test wybranym odczynnikiem. Gra podaje tylko obserwację (barwa, osad, zapach), wniosek o jonach wyciągasz sam(a). Woda płynie od zakładów do jeziora: jeśli w punkcie poniżej zakładu wynik nagle się pojawia, a powyżej go nie ma, masz trop.</p>
  <p><b>Zakłady</b> – przegląd dokumentów (pozwolenie wodnoprawne, raport z kontroli, zeznanie pracownika; każda wizyta to kolejny dokument) albo <b>hipoteza</b>: wskazujesz substancję i drogę dla zakładu, w którym stoisz. Pierwszy gracz po tobie, który ma którąś z tych kart, pokazuje ci jedną z nich.</p>
  <p><b>Urząd gminy</b> – archiwum: rejestry monitoringu, mapy przyłączy, skargi. <b>Wieś, przystań, plaża</b> – zeznania świadków. <b>Laboratorium</b> – uzupełnienie odczynników i rada chemika.</p>
  <h3>Wydarzenia</h3><p>Od 2. rundy każda runda zaczyna się wydarzeniem: ulewa osłabia wyniki w otwartych ciekach, dostawa daje odczynniki, świadkowie i służby podsuwają tropy (czasem fałszywe, jak plotki w gazecie).</p>
  <h3>Rozwiązanie</h3><p>W swojej turze możesz zgłosić rozwiązanie: substancję, zakład i drogę oraz <b>dowód chemiczny</b> (test i obserwację). Jeśli dowód nie pasuje do wybranej substancji, komisja odrzuca raport i tracisz turę. Jeśli rozwiązanie jest błędne, nie możesz już oskarżać, ale nadal pokazujesz karty. Za poprawne <b>równanie reakcji</b> wykrywania jest bonus.</p>
  <h3>Koniec gry</h3><p>Wygrywa pierwsza osoba z poprawnym, uzasadnionym rozwiązaniem. Gdy skończy się czas, każdy ma jeszcze jedną turę. Na koniec zespół pisze <b>raport inspektora</b> z zaleceniami dla zakładu.</p>`}</div>`;
}
function cheatHTML(){
  const lo=S?S.cfg.mode==='LO':UI.setupMode==='LO';
  const rows=[
   ['Cu²⁺',['NaOH','NaOH'],['niebieski, galaretowaty osad Cu(OH)₂','blue, gelatinous precipitate of Cu(OH)₂'],'Cu²⁺ + 2OH⁻ → Cu(OH)₂↓'],
   ['Cu²⁺',['woda amoniakalna (nadmiar)','aqueous ammonia (excess)'],['szafirowy roztwór [Cu(NH₃)₄]²⁺','deep-blue solution of [Cu(NH₃)₄]²⁺'],'—'],
   ['SO₄²⁻',['BaCl₂','BaCl₂'],['biały, drobnokrystaliczny osad BaSO₄, nie znika po dodaniu HCl','white, fine crystalline precipitate of BaSO₄, does not dissolve in HCl'],'Ba²⁺ + SO₄²⁻ → BaSO₄↓'],
   ['Cl⁻',['AgNO₃','AgNO₃'],['biały, serowaty osad AgCl, ciemnieje na świetle, nie znika w HNO₃','white, curdy precipitate of AgCl, darkens in light, insoluble in HNO₃'],'Ag⁺ + Cl⁻ → AgCl↓'],
   ['NH₄⁺ / NH₃',['NaOH + ogrzewanie','NaOH + heating'],['zapach amoniaku, zwilżony papierek uniwersalny niebieszczeje','smell of ammonia, moist universal indicator paper turns blue'],'NH₄⁺ + OH⁻ → NH₃↑ + H₂O'],
   ['NH₄⁺ / NH₃',['odczynnik Nesslera','Nessler’s reagent'],['żółtopomarańczowe zabarwienie, brunatny osad','yellow-orange colour, brown precipitate'],'—'],
   ['PO₄³⁻',['molibdenian amonu (HNO₃)','ammonium molybdate (HNO₃)'],['żółty, krystaliczny osad','yellow crystalline precipitate'],'—'],
   ['PO₄³⁻',['AgNO₃','AgNO₃'],['żółty osad Ag₃PO₄, znika w HNO₃','yellow precipitate of Ag₃PO₄, dissolves in HNO₃'],'3Ag⁺ + PO₄³⁻ → Ag₃PO₄↓'],
   [['ropopochodne','petroleum products'],['oględziny','visual check'],['tęczowy film na powierzchni, zapach paliwa','rainbow film on the surface, smell of fuel'],['— (wykrywanie fizyczne)','— (physical detection)']],
   ['—',['papierek uniwersalny','universal indicator paper'],['pH: kwaśne (czerwony–pomarańczowy), obojętne (żółtozielony), zasadowe (zielononiebieski–niebieski)','pH: acidic (red–orange), neutral (yellow-green), alkaline (blue-green–blue)'],'—'],
  ];
  return `<div class="sheet wide"><button class="closex" data-o="close">${T('Zamknij','Close')}</button><h2>${T('Ściąga odczynników','Reagent sheet')}</h2><p class="note">${T('Karta laboratoryjna inspektora.','The inspector’s lab card.')} ${lo?T('Poziom liceum: fosforany też dają osady z BaCl₂ (biały) i AgNO₃ (żółty) – rozróżnisz je, zakwaszając osad.','High school level: phosphates also give precipitates with BaCl₂ (white) and AgNO₃ (yellow) – tell them apart by acidifying the precipitate.'):T('Poziom klasa 8: próbki do testów z BaCl₂ i AgNO₃ są już zakwaszone, więc osad daje tylko jon szukany.','Grade 8 level: samples for the BaCl₂ and AgNO₃ tests are already acidified, so only the target ion gives a precipitate.')}</p>
  <div class="tw"><table class="ref"><thead><tr><th>${T('Jon','Ion')}</th><th>${T('Odczynnik','Reagent')}</th><th>${T('Obserwacja','Observation')}</th><th>${T('Równanie','Equation')}</th></tr></thead><tbody>${rows.map(r=>`<tr><td class="mono">${tr(r[0])}</td><td>${tr(r[1])}</td><td>${tr(r[2])}</td><td class="eq">${tr(r[3])}</td></tr>`).join('')}</tbody></table></div>
  <h3>${T('Jak czytać natężenie','How to read intensity')}</h3><p>${T('Słabe zmętnienie (opalescencja) to zwykle tło – np. legalny zrzut w granicach pozwolenia. Wyraźny lub obfity osad oznacza zanieczyszczenie. W jeziorze substancja jest rozcieńczona, więc wynik jest słabszy niż w cieku tuż za zakładem.','Faint turbidity (opalescence) is usually background – e.g. a legal discharge within its permit. A distinct or copious precipitate means pollution. In the lake the substance is diluted, so the result is weaker than in the channel just below the plant.')}</p></div>`;
}
let _stableOrder=null;function shuffleStable(arr){if(!_stableOrder||_stableOrder.length!==arr.length)_stableOrder=shuffle(arr.map((_,i)=>i));return _stableOrder.map(i=>arr[i])}
function accuseHTML(){
  const d=UI.ovData||{};
  const s=d.s||SUB_IDS[0];
  const opts=d.eqOpts&&d.eqFor===s?d.eqOpts:shuffle([0,1,2,3]);UI.ovData=Object.assign(d,{eqOpts:opts,eqFor:s});
  const isOil=s==='OIL';
  return `<div class="sheet wide"><button class="closex" data-o="close">${T('Anuluj','Cancel')}</button><div class="eyebrow">${T('Raport dla komisji','Report to the commission')} · ${esc(pname(curP()))}</div><h2>${T('Zgłoś rozwiązanie','Submit solution')}</h2>
  <p class="note">${T('Błędne rozwiązanie odbiera prawo do kolejnych oskarżeń. Dowód chemiczny musi potwierdzać wybraną substancję.','A wrong solution removes your right to accuse again. The chemical evidence must confirm the chosen substance.')}</p>
  <div class="grid2" style="margin-top:12px">
   <label class="f">${T('Substancja','Substance')}<select id="as">${SUB_IDS.map(x=>`<option value="${x}" ${x===s?'selected':''}>${esc(sN(x))} (${SUB[x].f})</option>`).join('')}</select></label>
   <label class="f">${T('Zakład','Plant')}<select id="ap">${PLANT_IDS.map(x=>`<option value="${x}" ${x===d.p?'selected':''}>${esc(pN(x))}</option>`).join('')}</select></label>
   <label class="f">${T('Droga do jeziora','Route to the lake')}<select id="ar">${ROUTE_IDS.map(x=>`<option value="${x}" ${x===d.r?'selected':''}>${esc(rN(x))}</option>`).join('')}</select></label></div>
  <h3>${T('Uzasadnienie chemiczne – który test i jaka obserwacja?','Chemical evidence – which test and what observation?')}</h3>
  <div>${shuffleStable(JUST).map(j=>`<label class="radio"><input type="radio" name="aj" value="${j.id}" ${d.j===j.id?'checked':''}><span>${esc(tr(j.t))}</span></label>`).join('')}</div>
  <h3>${T('Bonus','Bonus')}: ${isOil?esc(tr(EQ.OIL.q)):T('wybierz równanie reakcji wykrywania','choose the detection reaction equation')}</h3>
  <div>${opts.map((o,i)=>`<label class="radio"><input type="radio" name="aeq" value="${i}" ${d.eqi===i?'checked':''}><span class="${isOil?'':'eq'}">${esc(eqText(s,o))}</span></label>`).join('')}<label class="radio"><input type="radio" name="aeq" value="-1" ${d.eqi===-1||d.eqi==null?'checked':''}><span>${T('Pomijam bonus','Skip the bonus')}</span></label></div>
  <p id="aerr" class="note" style="color:var(--bad)"></p>
  <div class="row" style="margin-top:12px"><button class="btn accent" data-o="accuseGo">${T('Złóż raport w komisji','Submit report to the commission')}</button><button class="btn" data-o="close">${T('Anuluj','Cancel')}</button></div></div>`;
}
function teacherHTML(){
  return `<div class="sheet"><button class="closex" data-o="close">${T('Zamknij','Close')}</button><h2>${T('Panel prowadzącego','Teacher panel')}</h2>
  <p>${T('Przytrzymaj przycisk przez 2 sekundy, aby podejrzeć zawartość koperty. Uczniowie nie powinni patrzeć na ekran.','Hold the button for 2 seconds to see what’s in the envelope. Students should not be looking at the screen.')}</p>
  <button class="btn hold" id="holdbtn">${T('Przytrzymaj, aby odsłonić kopertę','Hold to reveal the envelope')}</button><div id="tsol" style="margin-top:12px"></div>
  <h3>${T('Czas','Time')}</h3><div class="row"><button class="btn" data-o="pause">${S.paused?T('Wznów odliczanie','Resume timer'):T('Wstrzymaj odliczanie','Pause timer')}</button><button class="btn" data-o="add5">${T('+5 minut','+5 minutes')}</button>${S.timeLeft!=null&&!S.finalRound?`<button class="btn" data-o="timeup">${T('Zakończ czas teraz','End time now')}</button>`:''}</div>
  <h3>${T('Wskazówki dydaktyczne','Teaching tips')}</h3><p class="note">${T('Poproś uczniów, by przy każdym teście zapisywali w notatniku: obserwację → wniosek → równanie. Po grze omówcie, dlaczego słabe zmętnienie nie dowodzi zanieczyszczenia i jak porównanie punktów w górze i w dole cieku wskazuje źródło.','Ask students to record each test in the notebook as: observation → conclusion → equation. After the game, discuss why faint turbidity does not prove pollution and how comparing upstream and downstream points reveals the source.')}</p></div>`;
}
function endHTML(){
  const sol=S.sol;const P=PLANT[sol.p];const w=S.winner!=null?S.players[S.winner]:null;
  const rep=S.report;const insp=rep.insp!=null?rep.insp:(S.winner!=null?S.winner:0);
  const recs=RECO[sol.p];
  return `<div class="sheet wide"><button class="closex" data-o="close">${T('Wróć do mapy','Back to the map')}</button><div class="sheethead"><div class="eyebrow">${T('Sprawa nr 47/2026 · zamknięta','Case no. 47/2026 · closed')}</div>${langSeg()}</div>
  <h2>${w?esc(pname(w))+T(' rozwiązuje sprawę',' solves the case'):T('Zawartość koperty','Contents of the envelope')}</h2>
  ${w?`<p>${T('Poprawne rozwiązanie z uzasadnieniem chemicznym','Correct solution with chemical evidence')}${S.bonus?T(' i <b>bonusem za równanie reakcji</b>',' and a <b>bonus for the reaction equation</b>'):''}.</p>`:`<p>${S.endReason==='time'?T('Czas minął, zanim zespół zgłosił poprawne rozwiązanie.','Time ran out before the team submitted a correct solution.'):T('Nikt nie wskazał poprawnego rozwiązania.','Nobody found the correct solution.')}</p>`}
  <div class="solution"><div class="gcard s"><span class="k">${T('Substancja','Substance')}</span><span class="f">${SUB[sol.s].f}</span><b>${esc(sN(sol.s))}</b></div><div class="gcard p"><span class="k">${T('Zakład','Plant')}</span><b>${esc(pN(sol.p))}</b><span class="note">${esc(tr(P.desc))}</span></div><div class="gcard r"><span class="k">${T('Droga','Route')}</span><b>${esc(rN(sol.r))}</b><span class="note">${esc(tr(ROUTES[sol.r].kind))}</span></div></div>
  <h3>${T('Dlaczego ginęły ryby','Why the fish died')}</h3><p>${esc(tr(EFFECT[sol.s]))}</p>
  <h3>${T('Wykrywanie','Detection')}</h3><p>${esc(JUST.filter(j=>j.s.includes(sol.s)).map(j=>tr(j.t)).join('; '))}.${EQ[sol.s].q?'':` ${T('Równanie','Equation')}: <span class="eq">${esc(EQ[sol.s].ok)}</span>`}</p>
  <h3>${T('Statystyki zespołu','Team statistics')}</h3><div class="tw"><table class="ref"><thead><tr><th>${T('Inspektor','Inspector')}</th><th>${T('Testy','Tests')}</th><th>${T('Dokumenty','Documents')}</th><th>${T('Hipotezy','Hypotheses')}</th><th>Status</th></tr></thead><tbody>${S.players.map((p,i)=>`<tr><td><span class="dot" style="display:inline-block;background:${p.color}"></span> ${esc(pname(p))}</td><td class="mono">${p.stats.tests}</td><td class="mono">${p.stats.docs}</td><td class="mono">${p.stats.conf}</td><td>${S.winner===i?T('rozwiązał(a) sprawę','solved the case'):p.out?T('błędne oskarżenie','wrong accusation'):'—'}</td></tr>`).join('')}</tbody></table></div>
  <h3 style="margin-top:22px;font-size:20px">${T('Raport inspektora','Inspector’s report')}</h3><p class="note">${T('Wariant zakończenia: zespół pisze krótki raport z zaleceniami dla zakładu. Tekst zostaje zapisany na tym komputerze; skopiuj go do zeszytu lub dokumentu klasy.','Closing activity: the team writes a short report with recommendations for the plant. The text is saved on this computer; copy it into a notebook or a class document.')}</p>
  <div class="grid2"><label class="f">${T('Autor raportu','Report author')}<select id="rinsp">${S.players.map((p,i)=>`<option value="${i}" ${i===insp?'selected':''}>${esc(pname(p))}</option>`).join('')}<option value="-1" ${insp===-1?'selected':''}>${T('Cały zespół','The whole team')}</option></select></label>
  <label class="f">${T('Kontrolowany zakład','Inspected plant')}<input type="text" id="rplant" value="${esc(pN(sol.p))}" readonly></label></div>
  <label class="f" style="margin-top:10px">${T('Ustalenia: co, skąd i którędy?','Findings: what, from where and by which route?')}<textarea id="rfind" placeholder="${T('Np. Jony miedzi(II) zrzucane przez galwanizernię Rowem Północnym…','E.g. Copper(II) ions discharged by the electroplating plant via the North Ditch…')}">${esc(rep.find||'')}</textarea></label>
  <label class="f" style="margin-top:10px">${T('Dowody chemiczne (obserwacje i równania)','Chemical evidence (observations and equations)')}<textarea id="rproof" placeholder="${T('Punkt P1B: obfity niebieski osad z NaOH, w P1A brak osadu…','Point 1B: copious blue precipitate with NaOH, no precipitate at 1A…')}">${esc(rep.proof||'')}</textarea></label>
  <div class="checks" style="margin-top:10px"><b style="font-size:14px">${T('Zalecenia dla zakładu','Recommendations for the plant')}</b>${recs.map((r,i)=>`<label><input type="checkbox" data-reco="${i}" ${(rep.reco||[]).includes(i)?'checked':''}> ${esc(tr(r))}</label>`).join('')}</div>
  <label class="f" style="margin-top:10px">${T('Własne zalecenia i odpowiedzialność zakładu','Your own recommendations and the plant’s responsibility')}<textarea id="rown" placeholder="${T('Np. zakład pokrywa koszty zarybienia i rekultywacji (zasada „zanieczyszczający płaci”)…','E.g. the plant pays for restocking fish and restoring the lake (the “polluter pays” principle)…')}">${esc(rep.own||'')}</textarea></label>
  <div class="row" style="margin-top:14px"><button class="btn accent" data-o="copyrep">${T('Kopiuj raport','Copy report')}</button><button class="btn" data-o="doNew">${T('Nowa gra','New game')}</button><span id="copymsg" class="note"></span></div>
  <textarea id="repfallback" hidden readonly style="margin-top:10px"></textarea></div>`;
}
function reportText(){
  const sol=S.sol,rep=S.report;const who=rep.insp===-1?T('Cały zespół','The whole team'):pname(S.players[rep.insp!=null?rep.insp:(S.winner??0)]);
  return `${T('RAPORT INSPEKTORA ŚRODOWISKA – sprawa nr 47/2026 (Jezioro Olszynowe)','ENVIRONMENTAL INSPECTOR’S REPORT – case no. 47/2026 (Lake Olszynowe)')}
${T('Autor','Author')}: ${who}
${T('Substancja','Substance')}: ${sN(sol.s)} (${SUB[sol.s].f})
${T('Zakład','Plant')}: ${pN(sol.p)}
${T('Droga do jeziora','Route to the lake')}: ${rN(sol.r)}

${T('Ustalenia','Findings')}:
${rep.find||'—'}

${T('Dowody chemiczne','Chemical evidence')}:
${rep.proof||'—'}

${T('Skutki dla jeziora','Effects on the lake')}:
${tr(EFFECT[sol.s])}

${T('Zalecenia dla zakładu','Recommendations for the plant')}:
${(rep.reco||[]).map(i=>'– '+tr(RECO[sol.p][i])).join('\n')||'—'}
${rep.own?'\n'+T('Inne zalecenia i odpowiedzialność','Other recommendations and responsibility')+':\n'+rep.own:''}`;
}
