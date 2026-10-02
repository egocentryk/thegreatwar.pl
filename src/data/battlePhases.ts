// Phases group battles on the /bitwy page, in this order.
// A battle's `phase` field must be one of these slugs.
export const BATTLE_PHASES = [
  {
    slug: "1914-pierwsze-starcia",
    title: "1914: Pierwsze starcia i bitwy graniczne",
    front: "Front zachodni",
    dates: "4–26 sierpnia 1914",
    intro:
      "W pierwszych tygodniach wojny na zachodzie zderzyły się dwa plany. Niemcy, zgodnie z planem Schlieffena, uderzyły przez Belgię, by obejść francuskie fortyfikacje i okrążyć armię francuską. Francja, realizując własny plan ofensywny, zaatakowała w Alzacji i Lotaryngii, a następnie w Ardenach. Po oporze Belgów pod Liège seria krwawych starć na granicach zakończyła się klęską Francuzów i Brytyjczyków, którzy rozpoczęli wielki odwrót w kierunku Marny.",
  },
  {
    slug: "1914-wielki-odwrot",
    title: "1914: Wielki odwrót",
    front: "Front zachodni",
    dates: "24 sierpnia – 5 września 1914",
    intro:
      "Po klęskach w bitwach granicznych armie francuskie i Brytyjski Korpus Ekspedycyjny zaczęły się wycofywać na południe, w kierunku Paryża i Marny. Niemieckie prawe skrzydło parło za nimi w wielkim pościgu, próbując okrążyć sprzymierzonych. Odwrót nie był jednak bezładną ucieczką. Wycofujące się wojska stoczyły szereg bitew opóźniających, pod Le Cateau, nad Mozą i pod Guise, a w Lotaryngii Francuzi zatrzymali Niemców przed Nancy. Dzięki temu Joffre zdołał przegrupować siły i utworzyć nową armię, która na początku września przeszła do kontrofensywy nad Marną.",
  },
  {
    slug: "1914-bitwa-nad-marna",
    title: "1914: Bitwa nad Marną",
    front: "Front zachodni",
    dates: "4–13 września 1914",
    intro:
      "Na początku września niemieckie armie stanęły kilkadziesiąt kilometrów od Paryża. Niemieckie prawe skrzydło, zamiast obejść stolicę od zachodu, skręciło na wschód od niej, odsłaniając swoją flankę. Joffre wykorzystał tę okazję. 5 września nowa francuska 6 Armia uderzyła znad Paryża nad rzeką Ourcq, a następnego dnia do kontrofensywy przeszły wszystkie armie sprzymierzonych, razem z Brytyjskim Korpusem Ekspedycyjnym. Równocześnie w Lotaryngii Francuzi odparli niemieckie natarcie na Nancy. Po kilku dniach zaciętych walk Niemcy zaczęli się wycofywać nad Aisne. Plan szybkiego zwycięstwa na zachodzie upadł, a wojna zaczęła zmieniać się w długotrwałe zmagania.",
  },
  {
    slug: "1914-nad-aisne-i-wyscig-do-morza",
    title: "1914: Nad Aisne i wyścig do morza",
    front: "Front zachodni",
    dates: "12 września – październik 1914",
    intro:
      "Po klęsce nad Marną armie niemieckie wycofały się na północ i okopały na wzgórzach nad rzeką Aisne, zwłaszcza na grzbiecie Chemin des Dames. Nacierający Francuzi i Brytyjczycy nie zdołali ich stamtąd zepchnąć. Obie strony zaczęły budować coraz rozleglejsze okopy, a front na tym odcinku zastygł na lata. Następnie każda ze stron próbowała obejść przeciwnika od północy. Seria kolejnych starć, nazwana wyścigiem do morza, przesuwała front ku wybrzeżu, aż w październiku linia okopów sięgnęła Morza Północnego.",
  },
  {
    slug: "1914-obrona-antwerpii",
    title: "1914: Armia belgijska i obrona Antwerpii",
    front: "Front zachodni",
    dates: "18 sierpnia – 10 października 1914",
    intro:
      "Po upadku Liège i odwrocie znad Gete armia belgijska schroniła się w twierdzy Antwerpia, tzw. redukcie narodowej. Stamtąd król Albert I prowadził wypady przeciw skrzydłu i tyłom niemieckich armii maszerujących na Francję, zmuszając Niemców do pozostawienia w Belgii znacznych sił. Pod koniec września Niemcy rozpoczęli oblężenie Antwerpii z użyciem ciężkiej artylerii. Mimo pomocy brytyjskiej twierdza padła 10 października, a armia belgijska wycofała się nad Yser.",
  },
  {
    slug: "1914-flandria",
    title: "1914: Walki we Flandrii",
    front: "Front zachodni",
    dates: "10 października – 22 listopada 1914",
    intro:
      "W październiku 1914 roku wyścig do morza dobiegł końca we Flandrii. Brytyjski Korpus Ekspedycyjny został przerzucony znad Aisne na północ, armia belgijska po upadku Antwerpii wycofała się nad Yser, a Niemcy skierowali tu nowe korpusy rezerwowe, złożone w dużej części z młodych ochotników. Od La Bassée przez Armentières i Messines aż po Ypres i ujście Yseru rozgorzał łańcuch zaciętych bitew, w których każda ze stron próbowała przełamać front lub obejść przeciwnika. Żadnej się to nie udało, a linia okopów sięgnęła Morza Północnego i zastygła na długie lata. Pierwsza bitwa pod Ypres stała się grobem starej, zawodowej armii brytyjskiej.",
  },
  {
    slug: "1914-zima-na-froncie-zachodnim",
    title: "1914–1915: Zimowe ofensywy na froncie zachodnim",
    front: "Front zachodni",
    dates: "grudzień 1914 – marzec 1915",
    intro:
      "Gdy pod koniec listopada 1914 roku wygasły walki pod Ypres, front zachodni ciągnął się już nieprzerwaną linią okopów od Morza Północnego po granicę szwajcarską. Generał Joffre nie zamierzał jednak czekać do wiosny. Uważał, że Niemcy, przerzucając wojska na wschód, osłabili front we Francji, a sojusznicy na wschodzie potrzebują odciążenia. W grudniu Francuzi i Brytyjczycy uderzyli we Flandrii i w Artois, a przede wszystkim w Szampanii, gdzie rozpoczęła się pierwsza wielka ofensywa przeciw umocnionym pozycjom. Zimowe natarcia w błocie i deszczu przyniosły ciężkie straty i znikome zdobycze terenu. Pokazały, jak trudno przełamać front obsadzony karabinami maszynowymi i osłonięty zasiekami.",
  },
  {
    slug: "1915-ypres",
    title: "1915: Druga bitwa pod Ypres",
    front: "Front zachodni",
    dates: "kwiecień – maj 1915",
    intro:
      "Wiosną 1915 roku walki wróciły pod Ypres, gdzie po jesiennej bitwie aliancki front tworzył głęboki łuk wysunięty w stronę niemieckich linii. W połowie kwietnia Brytyjczycy zaatakowali niewielkie Wzgórze 60 na południe od miasta. 22 kwietnia Niemcy po raz pierwszy na froncie zachodnim użyli chmury chloru, która otworzyła wyrwę w linii francuskiej na północnym skraju łuku. Kanadyjczycy, Brytyjczycy i Francuzi zdołali ją zamknąć, ale w kolejnych tygodniach, w serii bitew o grzbiety wokół miasta, musieli ustąpić z dużej części łuku. Ypres zostało niemal całkowicie zrujnowane ostrzałem, ale pozostało w rękach aliantów.",
  },
  {
    slug: "1915-artois",
    title: "1915: Wiosenna ofensywa w Artois",
    front: "Front zachodni",
    dates: "maj – czerwiec 1915",
    intro:
      "W maju 1915 roku, gdy pod Ypres trwały jeszcze walki, alianci podjęli wielką wiosenną ofensywę w Artois. Francuska 10 Armia generała d'Urbala uderzyła 9 maja na grzbiet Vimy, a Brytyjczycy tego samego dnia zaatakowali na północ od niej grzbiet Aubers, by związać niemieckie odwody. Francuzi w pierwszych godzinach przełamali niemiecką linię i dotarli na skraj grzbietu, ale nie zdołali go utrzymać. Brytyjski atak załamał się w ciągu jednego dnia, a ponowione w połowie maja natarcie pod Festubert przyniosło jedynie niewielkie zdobycze. Walki w Artois ciągnęły się do połowy czerwca i kosztowały obie strony ogromne straty, nie przynosząc przełomu. Niepowodzenie pod Aubers wywołało w Wielkiej Brytanii skandal z brakiem pocisków artyleryjskich.",
  },
  {
    slug: "1915-wogezy",
    title: "1915: Walki w Wogezach",
    front: "Front zachodni",
    dates: "1915",
    intro:
      "Najbardziej wysunięty na południe odcinek frontu zachodniego biegł przez góry Wogezy, w pobliżu dawnej granicy francusko-niemieckiej w Alzacji. Walczono tu w trudnym, zalesionym terenie o pojedyncze szczyty i grzbiety, z których można było obserwować dolinę Renu albo doliny prowadzące w głąb Francji. Zimą i wiosną 1915 roku Francuzi i Niemcy kilkakrotnie odbijali sobie szczyt Hartmannswillerkopf. Latem francuscy strzelcy alpejscy zaatakowali niemieckie pozycje na grzbiecie Le Linge nad doliną Munster. Walki w Wogezach, toczone często na odległość rzutu granatem, przyniosły obu stronom ciężkie straty przy niewielkich zmianach linii frontu.",
  },
  {
    slug: "1915-jesienna-ofensywa",
    title: "1915: Jesienna ofensywa – Loos i Szampania",
    front: "Front zachodni",
    dates: "wrzesień – listopad 1915",
    intro:
      "Jesienią 1915 roku alianci podjęli największą jak dotąd próbę przełamania frontu zachodniego. Joffre liczył, że jednoczesne uderzenia w Szampanii i w Artois rozerwą niemiecką linię i zmuszą wroga do odwrotu z Francji, a przy okazji odciążą Rosjan, wycofujących się na wschodzie. 25 września Francuzi zaatakowali w Szampanii i pod Vimy, a Brytyjczycy pod Loos, gdzie po raz pierwszy na dużą skalę użyli chmury chloru i rzucili do walki dywizje Nowych Armii. Pierwszego dnia zdobyli pierwszą linię niemieckich okopów, ale druga pozycja, przygotowana przez Niemców w ciągu lata, okazała się nie do przejścia. Walki trwały do listopada i przyniosły obu stronom ogromne straty bez rozstrzygnięcia. Niepowodzenie pod Loos kosztowało stanowisko dowódcę Brytyjskiego Korpusu Ekspedycyjnego, Johna Frencha.",
  },
  {
    slug: "1914-pierwsza-inwazja-na-serbie",
    title: "1914: Pierwsza inwazja na Serbię",
    front: "Front bałkański",
    dates: "12–24 sierpnia 1914",
    intro:
      "Wojna zaczęła się od konfliktu Austro-Węgier z Serbią, a Wiedeń liczył na szybką rozprawę z sąsiadem. 12 sierpnia wojska austro-węgierskie przekroczyły Drinę i Sawę. Serbska armia, dowodzona przez wojewodę Radomira Putnika, choć słabiej uzbrojona, miała doświadczenie z wojen bałkańskich i dobrze znała teren. W ciągu dwóch tygodni rozbiła najeźdźców w bitwie na górze Cer i wyparła ich za rzeki, odnosząc pierwsze zwycięstwo aliantów w tej wojnie.",
  },
  {
    slug: "1914-druga-inwazja-na-serbie",
    title: "1914: Druga inwazja na Serbię",
    front: "Front bałkański",
    dates: "6 września – 4 października 1914",
    intro:
      "Na początku września, pod naciskiem Rosji, armia serbska przeszła do ofensywy i wkroczyła na terytorium Austro-Węgier, do Sremu. Równocześnie generał Potiorek rozpoczął drugą inwazję na Serbię przez Drinę. Serbowie musieli przerwać ofensywę i zawrócić wojska na zagrożony front. W górach nad Driną rozgorzały zacięte, wielotygodniowe walki, w których obie strony poniosły ogromne straty. Austro-Węgrom udało się utrzymać przyczółki na serbskim brzegu, ale nie zdołały rozbić armii serbskiej. Na froncie nastąpił okres wyczerpującej wojny pozycyjnej.",
  },
  {
    slug: "1914-trzecia-inwazja-na-serbie",
    title: "1914: Trzecia inwazja na Serbię",
    front: "Front bałkański",
    dates: "6 listopada – 15 grudnia 1914",
    intro:
      "Na początku listopada 1914 roku generał Potiorek po raz trzeci uderzył na Serbię, tym razem z przyczółków nad Driną i Sawą. Wyczerpana, pozbawiona amunicji armia serbska cofała się w głąb kraju, a 2 grudnia Austriacy wkroczyli do opuszczonego Belgradu. Wojewoda Putnik zatrzymał jednak odwrót w górach nad Kolubarą. Gdy nadeszła amunicja od sojuszników, Serbowie przeszli do kontrofensywy, rozbili siły Potiorka i do połowy grudnia wyparli je z całego kraju. Było to jedno z największych zwycięstw aliantów w pierwszym roku wojny.",
  },
  {
    slug: "1914-prusy-wschodnie",
    title: "1914: Walki w Prusach Wschodnich",
    front: "Front wschodni",
    dates: "17 sierpnia – 29 września 1914",
    intro:
      "Rosja, zobowiązana wobec Francji do szybkiej ofensywy, uderzyła na Prusy Wschodnie już w połowie sierpnia, zanim zakończyła mobilizację. Od wschodu nacierała 1 Armia generała Rennenkampfa, od południa, z Królestwa Polskiego, 2 Armia generała Samsonowa. Broniła się niemiecka 8 Armia. Po początkowym sukcesie Rosjan pod Gąbinem Niemcy, pod nowym dowództwem Hindenburga i Ludendorffa, rozbili armię Samsonowa pod Tannenbergiem, a następnie wyparli Rennenkampfa znad jezior mazurskich. Rosyjska ofensywa zmusiła jednak Niemców do przerzucenia na wschód części sił z frontu zachodniego.",
  },
  {
    slug: "1914-bitwa-galicyjska",
    title: "1914: Bitwa galicyjska",
    front: "Front wschodni",
    dates: "23 sierpnia – 11 września 1914",
    intro:
      "Równocześnie z walkami w Prusach Wschodnich na południu frontu starły się główne siły Austro-Węgier i Rosji. Armie austro-węgierskie uderzyły z Galicji na północ, na ziemie Królestwa Polskiego, i odniosły początkowe zwycięstwa pod Kraśnikiem i Komarowem. W tym samym czasie Rosjanie nacierali od wschodu na Lwów, który zajęli na początku września. Zagrożone okrążeniem wojska austro-węgierskie wycofały się za San, pozostawiając oblężoną twierdzę Przemyśl. Była to jedna z największych bitew całej wojny, a większość walk toczyła się na ziemiach polskich.",
  },
  {
    slug: "1914-daleki-wschod-i-pacyfik",
    title: "1914: Daleki Wschód i Pacyfik",
    front: "Azja i Pacyfik",
    dates: "sierpień – listopad 1914",
    intro:
      "Wojna szybko dotarła do Azji i na Pacyfik, gdzie Niemcy posiadały dzierżawę Kiautschou z portem Tsingtao oraz liczne wyspy. Japonia, sojuszniczka Wielkiej Brytanii, wypowiedziała Niemcom wojnę i obległa Tsingtao, a jej flota zajęła niemieckie wyspy na północ od równika. Na południe od równika niemieckie kolonie zajęły wojska Australii i Nowej Zelandii. Do końca 1914 roku Niemcy straciły wszystkie posiadłości na Dalekim Wschodzie i Pacyfiku.",
  },
  {
    slug: "1914-przemysl-san-i-wisla",
    title: "1914: Przemyśl, San i Wisła",
    front: "Front wschodni",
    dates: "wrzesień 1914 – marzec 1915",
    intro:
      "Po klęsce w bitwie galicyjskiej armie austro-węgierskie wycofały się za San i dalej na zachód, pozostawiając w okrążeniu twierdzę Przemyśl. Rosjanie wkroczyli w głąb Galicji i do przełęczy karpackich. Na pomoc sojusznikowi Niemcy utworzyły na Śląsku nową 9 Armię, która na przełomie września i października uderzyła przez ziemie Królestwa Polskiego na Warszawę i Dęblin. Jesienią 1914 roku na ziemiach polskich toczyły się wielkie bitwy nad Wisłą i Sanem, a Przemyśl został na krótko odblokowany, by wkrótce znów znaleźć się w oblężeniu.",
  },
  {
    slug: "1914-lodz-i-krakow",
    title: "1914: Bitwy pod Łodzią i Krakowem",
    front: "Front wschodni",
    dates: "listopad 1914 – lipiec 1915",
    intro:
      "Po niepowodzeniu jesiennej ofensywy nad Wisłą i Sanem armie państw centralnych wycofały się na zachód, a Rosjanie ruszyli w pościg, szykując uderzenie na Śląsk i Kraków. Hindenburg i Ludendorff uprzedzili ich zamiar. Przerzucili koleją 9 Armię na północ, w rejon Torunia, i uderzyli w bok rosyjskich armii, co doprowadziło do zaciętej bitwy pod Łodzią. W tym samym czasie na południu Rosjanie podeszli pod Kraków, a twierdza szykowała się do oblężenia. Zagrożenie odsunęło dopiero grudniowe zwycięstwo Austro-Węgrów pod Limanową. Walki toczone w listopadzie i grudniu 1914 roku na ziemiach polskich zatrzymały rosyjski marsz na zachód, a front na wschodzie zaczął zastygać w okopach. Nad Rawką i Bzurą wojna pozycyjna trwała aż do lata 1915 roku.",
  },
  {
    slug: "1915-karpaty",
    title: "1915: Zimowa wojna w Karpatach",
    front: "Front wschodni",
    dates: "styczeń – kwiecień 1915",
    intro:
      "Zimą 1915 roku Austro-Węgry, wspierane przez niemiecką Armię Południową, uderzyły w Karpatach, by odepchnąć Rosjan od przełęczy prowadzących na Węgry i uwolnić oblężony Przemyśl. Rosjanie odpowiedzieli własną ofensywą. Walki w górach, w śniegu i mrozie, przyniosły obu stronom ogromne straty, w dużej części z powodu chorób i odmrożeń. Przemyśla nie udało się odblokować, a twierdza skapitulowała w marcu.",
  },
  {
    slug: "1915-mazury-i-przasnysz",
    title: "1915: Mazury i Przasnysz",
    front: "Front wschodni",
    dates: "luty 1915",
    intro:
      "W lutym 1915 roku Niemcy uderzyli na północnym skrzydle frontu wschodniego. Hindenburg i Ludendorff, wzmocnieni nowo utworzoną 10 Armią, zaatakowali w śniegu i mrozie rosyjską 10 Armię nad jeziorami mazurskimi i wyparli ją z Prus Wschodnich. W Puszczy Augustowskiej okrążony rosyjski XX Korpus musiał złożyć broń. Próba rozwinięcia sukcesu na południe, ku Narwi, zakończyła się jednak niepowodzeniem pod Przasnyszem, gdzie Rosjanie zmusili Niemców do odwrotu. Mimo wielkich strat po obu stronach front na północy ustabilizował się w pobliżu granicy Prus Wschodnich.",
  },
  {
    slug: "1915-gorlice",
    title: "1915: Gorlice i odwrót Rosjan z Galicji",
    front: "Front wschodni",
    dates: "od maja 1915",
    intro:
      "Wiosną 1915 roku Niemcy postanowili ratować słabnące Austro-Węgry i zadać Rosji cios, który wyłączyłby ją z wojny. W rejonie Gorlic i Tarnowa skoncentrowano nową niemiecką 11 Armię generała Augusta von Mackensena oraz austro-węgierską 4 Armię, wspierane przez potężną artylerię. 2 maja, po kilkugodzinnym ostrzale, uderzyły one na rosyjską 3 Armię i przełamały jej front. Rosjanie, którzy zimą wykrwawili się w Karpatach i cierpieli na brak amunicji, musieli porzucić przełęcze karpackie i cofać się przez całą Galicję. W ciągu kilku tygodni państwa centralne odzyskały linię Sanu, Jarosław i Przemyśl, a ofensywa przerodziła się w wielki odwrót armii rosyjskiej, który latem objął całe Królestwo Polskie.",
  },
  {
    slug: "1915-odwrot-rosjan",
    title: "1915: Wielki odwrót armii rosyjskiej",
    front: "Front wschodni",
    dates: "lipiec – wrzesień 1915",
    intro:
      "Latem 1915 roku państwa centralne rozszerzyły ofensywę na cały front wschodni. Po odzyskaniu Galicji armie Mackensena skręciły na północ, między Wisłę a Bug, w stronę Lublina i Chełma, a 13 lipca niemieckie armie Hindenburga uderzyły znad granicy Prus Wschodnich na Narew. Celem było okrążenie wojsk rosyjskich w wysuniętym na zachód Królestwie Polskim. Rosjanie, pozbawieni amunicji i rezerw, toczyli zacięte boje opóźniające, ale nie zdołali utrzymać linii Wisły i Narwi. W sierpniu opuścili Warszawę, Iwangród i Nowogieorgijewsk, a do jesieni wycofali się z całego Królestwa Polskiego, Litwy i części Kurlandii. Wielki odwrót zakończył trwające od 1815 roku rosyjskie panowanie nad centralną Polską.",
  },
  {
    slug: "1915-isonzo",
    title: "1915: Front włoski i bitwy nad Isonzo",
    front: "Front włoski",
    dates: "od czerwca 1915",
    intro:
      "24 maja 1915 roku Włochy, związane tajnym paktem londyńskim z Ententą, rozpoczęły wojnę z Austro-Węgrami. Szef sztabu generał Luigi Cadorna skierował główne siły na wschód, nad rzekę Isonzo, skąd chciał uderzyć na Gorycję i Triest. Austro-Węgry, zajęte wojną z Rosją i Serbią, obsadziły jednak dogodne pozycje na wzgórzach i płaskowyżu Krasu, a ich 5 Armia generała Svetozara Boroevicia odpierała kolejne natarcia. Już pierwsze bitwy nad Isonzo latem 1915 roku pokazały, że wojna w górach i na skalistym Krasie będzie równie krwawa i statyczna jak we Francji. Do jesieni 1917 roku Włosi przeprowadzili nad tą rzeką jedenaście ofensyw.",
  },
  {
    slug: "1914-wojna-na-morzu",
    title: "1914: Wojna na morzu",
    front: "Wojna na morzu",
    dates: "sierpień – grudzień 1914",
    intro:
      "Przed wojną Wielka Brytania i Niemcy toczyły wyścig zbrojeń morskich, a obie strony spodziewały się wielkiej bitwy flot na Morzu Północnym. Do niej nie doszło. Brytyjska Grand Fleet zablokowała wyjścia z Morza Północnego, a niemiecka Flota Pełnomorska unikała otwartej walki z silniejszym przeciwnikiem. Zamiast tego rozgrywały się mniejsze starcia krążowników i niszczycieli, pościgi za niemieckimi rajderami na oceanach oraz pierwsze ataki okrętów podwodnych, które szybko pokazały, jak groźną stały się bronią. Najgłośniejszym epizodem roku była wędrówka niemieckiej eskadry admirała von Spee przez Pacyfik, zakończona zwycięstwem pod Coronelem i klęską pod Falklandami.",
  },
  {
    slug: "1915-wojna-na-morzu",
    title: "1915: Wojna na morzu",
    front: "Wojna na morzu",
    dates: "od stycznia 1915",
    intro:
      "W 1915 roku wojna na morzu zmieniła charakter. Niemiecka Flota Pełnomorska nadal unikała walnej bitwy z Grand Fleet, a jej wypady na wybrzeże Anglii zakończyły się w styczniu starciem na Dogger Bank. Coraz większą rolę odgrywały okręty podwodne, które Niemcy zaczęli wysyłać przeciw statkom handlowym wokół Wysp Brytyjskich.",
  },
  {
    slug: "1914-afryka",
    title: "1914: Wojna w Afryce",
    front: "Afryka",
    dates: "sierpień 1914 – styczeń 1915",
    intro:
      "Wojna szybko objęła kolonie w Afryce. Niemcy posiadały tu cztery kolonie: Togo, Kamerun, Niemiecką Afrykę Południowo-Zachodnią i Niemiecką Afrykę Wschodnią. Wielka Brytania, Francja i Belgia chciały je zająć, odebrać Niemcom porty i stacje radiowe oraz zabezpieczyć własne posiadłości. Togo padło już w sierpniu, a w Kamerunie alianci zajęli wybrzeże. Na wschodzie kontynentu niemieckie oddziały pułkownika Paula von Lettow-Vorbecka zadały Brytyjczykom dotkliwe porażki i rozpoczęły kampanię, która trwała aż do końca wojny. W styczniu 1915 roku odbiły jeszcze przygraniczny Jasin. Ciężar walk w Afryce ponieśli głównie afrykańscy żołnierze i tragarze.",
  },
  {
    slug: "1914-imperium-osmanskie",
    title: "1914: Przystąpienie Imperium Osmańskiego",
    front: "Bliski Wschód",
    dates: "listopad 1914 – luty 1915",
    intro:
      "Pod koniec października 1914 roku flota osmańska pod dowództwem niemieckiego admirała Souchona zaatakowała rosyjskie porty nad Morzem Czarnym. W ciągu kilku dni Rosja, Wielka Brytania i Francja wypowiedziały Imperium Osmańskiemu wojnę, a sułtan ogłosił dżihad. Wojna objęła nowe obszary: Kaukaz, gdzie starły się armie rosyjska i osmańska, Mezopotamię, gdzie wojska z Indii wylądowały u ujścia Szatt al-Arab, a także Dardanele i Kanał Sueski. Zimą Enver Pasza poprowadził na Kaukazie ofensywę, która pod Sarykamyszem zakończyła się katastrofą jego armii, a na początku lutego 1915 roku wojska osmańskie bezskutecznie zaatakowały Kanał Sueski. Przystąpienie Imperium Osmańskiego odcięło Rosję od sojuszników przez cieśniny czarnomorskie i rozszerzyło wojnę na cały Bliski Wschód.",
  },
  {
    slug: "1915-dardanele",
    title: "1915: Dardanele",
    front: "Bliski Wschód",
    dates: "od lutego 1915",
    intro:
      "Na początku 1915 roku rząd brytyjski postanowił przebić się flotą przez Dardanele, zdobyć Konstantynopol, wyłączyć Imperium Osmańskie z wojny i otworzyć drogę morską do Rosji. W lutym brytyjskie i francuskie okręty zaczęły ostrzeliwać forty strzegące wejścia do cieśniny. Wkrótce okazało się, że sama flota nie poradzi sobie z fortami i polami minowymi, a do Egiptu i na wyspę Lemnos zaczęto ściągać wojska lądowe.",
  },
  {
    slug: "1915-bliski-wschod",
    title: "1915: Mezopotamia, Persja i Kaukaz",
    front: "Bliski Wschód",
    dates: "od kwietnia 1915",
    intro:
      "Wiosną 1915 roku Imperium Osmańskie, mimo zimowej klęski pod Sarykamyszem, próbowało odzyskać inicjatywę na swoich wschodnich rubieżach. W Mezopotamii wojska osmańskie i plemienni sojusznicy uderzyli na Brytyjczyków broniących Basry, ale zostali pobici pod Szuajbą, co otworzyło drogę brytyjskiemu marszowi w górę Tygrysu i Eufratu. Na pograniczu z Persją i Rosją wojna przyniosła tragedię ludności cywilnej. Władze osmańskie rozpoczęły deportacje i masakry Ormian, a w Wanie Ormianie przez kilka tygodni bronili się przed oblężeniem, aż do nadejścia wojsk rosyjskich.",
  },
] as const

export type BattlePhaseSlug = (typeof BATTLE_PHASES)[number]["slug"]

export const BATTLE_PHASE_SLUGS = BATTLE_PHASES.map((phase) => phase.slug) as [
  BattlePhaseSlug,
  ...BattlePhaseSlug[],
]
