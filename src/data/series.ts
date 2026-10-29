// Themed series: hand-picked reading paths through existing articles, each
// with its own page at /serie/<slug> and /en/series/<slugEn>. A step is a
// timeline slug, or "bitwy/<slug>" for a battle page; steps are listed in
// reading order (here: by date). `overview` is a battle page that tells the
// whole story in one text. Every slug is checked at build time
// (i18n/local.ts `curated`), so a renamed article fails the build.

export interface Series {
  slug: string
  slugEn: string
  title: string
  titleEn: string
  // One line for cards.
  lead: string
  leadEn: string
  intro: string
  introEn: string
  overview?: string
  steps: string[]
  // Why a step is in the series, one sentence per language, keyed like `steps`.
  notes?: Record<string, { pl: string; en: string }>
}

export const SERIES: Series[] = [
  {
    slug: "lato-1914",
    slugEn: "summer-1914",
    title: "Lato 1914",
    titleEn: "Summer 1914",
    lead: "Droga do wojny: od strzałów w Sarajewie po cud nad Marną.",
    leadEn: "The road to war: from the shots in Sarajevo to the miracle of the Marne.",
    intro:
      "28 czerwca 1914 roku w Sarajewie Gavrilo Princip zastrzelił arcyksięcia Franciszka Ferdynanda i jego żonę. Wiedeń, pewny poparcia Niemiec, postawił Serbii ultimatum i 28 lipca wypowiedział jej wojnę, a w ciągu tygodnia konflikt wciągnął wszystkie wielkie mocarstwa. Niemiecki plan wojenny zakładał, że główne uderzenie spadnie najpierw na Francję, a wkroczenie do Belgii przesądziło o przystąpieniu do wojny Wielkiej Brytanii. W sierpniu francuskie ofensywy załamały się, a alianci zaczęli wielki odwrót, ale we wrześniu zatrzymali Niemców od Paryża po Verdun i upadł plan szybkiego zwycięstwa. Seria prowadzi od zamachu w Sarajewie przez kryzys lipcowy, łańcuch wypowiedzeń wojny i pierwsze bitwy w Belgii, Francji i Prusach Wschodnich po odwrót Niemców znad Marny.",
    introEn:
      "On 28 June 1914 in Sarajevo, Gavrilo Princip shot Archduke Franz Ferdinand and his wife Sophie. Vienna, sure of Germany's backing, sent Serbia an ultimatum and declared war on 28 July, and within a week the conflict drew all the great powers of Europe into war. The German war plan assumed that the main blow would fall first on France, and the invasion of Belgium settled Great Britain's entry into the war. In August the French offensives collapsed and the Allies began the Great Retreat, but in September they halted the Germans from Paris to Verdun and the plan for a quick victory collapsed. The series runs from the Sarajevo assassination through the July Crisis, the chain of declarations of war and the first battles in Belgium, France and East Prussia to the German retreat from the Marne.",
    steps: [
      "arcyksiaze-franciszek-ferdynand-zamordowany-w-sarajewie",
      "kajzer-obiecuje-austro-wegrom-pelne-poparcie",
      "austro-wegry-przesylaja-ultimatum-serbii",
      "austro-wegry-wypowiadaja-wojne-serbii",
      "car-zarzadza-powszechna-mobilizacje-armii-rosyjskiej",
      "niemcy-oglaszaja-mobilizacje-i-wypowiadaja-wojne-rosji",
      "niemcy-stawiaja-belgii-ultimatum",
      "niemcy-wypowiadaja-wojne-francji",
      "wielka-brytania-wypowiada-wojne-niemcom",
      "bitwy/bitwa-pod-liege",
      "bitwy/bitwa-graniczna",
      "bitwy/bitwa-pod-mons",
      "bitwy/bitwa-pod-tannenbergiem",
      "bitwy/pierwsza-bitwa-nad-marna",
      "niemcy-wycofuja-sie-znad-marny",
      "falkenhayn-zastepuje-moltkego",
    ],
    notes: {
      "arcyksiaze-franciszek-ferdynand-zamordowany-w-sarajewie": {
        pl: "Punkt wyjścia serii: dwa strzały Principa stają się zapalnikiem kryzysu lipcowego, który w ciągu pięciu tygodni prowadzi Europę do wojny między mocarstwami.",
        en: "The starting point of the series: Princip's two shots become the trigger of the July Crisis, which within five weeks leads Europe to a war between the great powers.",
      },
      "kajzer-obiecuje-austro-wegrom-pelne-poparcie": {
        pl: "„Czek in blanco” z Poczdamu: Wilhelm II zapewnia Wiedeń, że Niemcy pozostaną przy nim nawet wtedy, gdyby spór z Serbią przerodził się w konflikt z Rosją.",
        en: "The Potsdam “blank cheque”: Wilhelm II assures Vienna that Germany will stand by it even if the quarrel with Serbia turns into a conflict with Russia.",
      },
      "austro-wegry-przesylaja-ultimatum-serbii": {
        pl: "Wiedeń daje Belgradowi zaledwie 48 godzin. Już krótkość terminu pokazuje, że nie chodzi o dyplomację, lecz o kapitulację Serbii albo pretekst do wojny.",
        en: "Vienna gives Belgrade just 48 hours. The very shortness of the deadline shows that the aim is not diplomacy but Serbia's capitulation or a pretext for war.",
      },
      "austro-wegry-wypowiadaja-wojne-serbii": {
        pl: "Wiedeń wypowiada wojnę Serbii, licząc na krótką, lokalną rozprawę. Ale za Serbią stoi Rosja, a za Austro-Węgrami Niemcy.",
        en: "Vienna declares war on Serbia, counting on a short, local reckoning. But behind Serbia stands Russia, and behind Austria-Hungary stands Germany.",
      },
      "car-zarzadza-powszechna-mobilizacje-armii-rosyjskiej": {
        pl: "Mikołaj II ustępuje Sazonowowi i zgadza się na mobilizację powszechną. Decyzja z Peterhofu przesądza, że wojna na Bałkanach stanie się wojną wielkich mocarstw.",
        en: "Nicholas II gives way to Sazonov and agrees to general mobilisation. The Peterhof decision settles that the war in the Balkans will become a war of the great powers.",
      },
      "niemcy-oglaszaja-mobilizacje-i-wypowiadaja-wojne-rosji": {
        pl: "Niemcy wypowiadają wojnę Rosji, a nocny epizod z telegramem z Londynu pokazuje, że planów przerzutu armii nie dało się już zmienić w kilka godzin.",
        en: "Germany declares war on Russia, and the night's episode with the telegram from London shows that the plans for moving the army could no longer be changed in a few hours.",
      },
      "niemcy-stawiaja-belgii-ultimatum": {
        pl: "Niemcy żądają przemarszu przez neutralną Belgię. To ultimatum staje się jednym z kluczowych powodów, dla których do wojny przystąpi Wielka Brytania.",
        en: "Germany demands passage through neutral Belgium. This ultimatum becomes one of the key reasons why Great Britain enters the war.",
      },
      "niemcy-wypowiadaja-wojne-francji": {
        pl: "Wypowiedzenie wojny Francji: od tej chwili Niemcy walczą na dwa fronty, z Rosją na wschodzie i z Francją na zachodzie.",
        en: "War on France: from this moment Germany fights on two fronts, against Russia in the east and France in the west.",
      },
      "wielka-brytania-wypowiada-wojne-niemcom": {
        pl: "Z Wielką Brytanią do wojny wchodzi całe jej imperium: konflikt, który zaczął się jako austro-serbski, obejmuje wszystkie mocarstwa Europy i nabiera wymiaru światowego.",
        en: "Britain brings its whole empire into the war: a conflict that began as Austro-Serbian now engulfs all the great powers of Europe and takes on a global dimension.",
      },
      "bitwy/bitwa-pod-liege": {
        pl: "Pierwsza przeszkoda na drodze niemieckiego planu. Obrona fortów pokazuje, że Belgia nie przepuści Niemców bez walki, i daje Francji oraz Wielkiej Brytanii nieco czasu.",
        en: "The first obstacle in the path of the German plan. The defence of the forts shows that Belgium will not let the Germans through without a fight, and buys France and Britain a little time.",
      },
      "bitwy/bitwa-graniczna": {
        pl: "Klęska francuskiego planu wojny: ofensywy w Alzacji, Lotaryngii i Ardenach przynoszą tylko ogromne straty, a niemieckie prawe skrzydło przechodzi przez Belgię zgodnie z planem.",
        en: "The French war plan fails: the offensives in Alsace, Lorraine and the Ardennes bring nothing but enormous losses, and the German right wing passes through Belgium as planned.",
      },
      "bitwy/bitwa-pod-mons": {
        pl: "Pierwsza bitwa Brytyjczyków w Europie od czasów Waterloo: Brytyjski Korpus Ekspedycyjny zatrzymuje na jeden dzień armię Klucka, idącą na skrajnym prawym skrzydle.",
        en: "The first British battle in Europe since Waterloo: the British Expeditionary Force holds up Kluck's army, on the far right of the German wing, for one day.",
      },
      "bitwy/bitwa-pod-tannenbergiem": {
        pl: "Wschodnia strona planu: Rosja przegrywa w Prusach Wschodnich, ale jej ofensywa skłania Niemców do przerzucenia dwóch korpusów z zachodu w przededniu bitwy nad Marną.",
        en: "The eastern side of the plan: Russia is defeated in East Prussia, but its offensive makes the Germans move two corps from the west on the eve of the Battle of the Marne.",
      },
      "bitwy/pierwsza-bitwa-nad-marna": {
        pl: "Punkt zwrotny lata: upada plan szybkiego pokonania Francji, a Niemcy zostają skazani na długą wojnę na dwóch frontach, której ich sztabowcy najbardziej się obawiali.",
        en: "The turning point of the summer: the plan for a quick defeat of France collapses, and Germany is condemned to the long two-front war its staff officers had feared most.",
      },
      "niemcy-wycofuja-sie-znad-marny": {
        pl: "Dzień, w którym rozstrzyga się bitwa nad Marną. Hentsch tylko przypieczętowuje odwrót: przesądziły o nim luka między armiami, wyczerpanie wojsk i słabe dowodzenie Moltkego.",
        en: "The day the Battle of the Marne is decided. Hentsch merely seals the retreat: it was decided by the gap between the armies, the exhaustion of the troops and Moltke's weak leadership.",
      },
      "falkenhayn-zastepuje-moltkego": {
        pl: "Epilog serii: załamany Moltke traci dowodzenie, a jego następca Falkenhayn szybko rozumie, że Niemcy nie odniosą już szybkiego, rozstrzygającego zwycięstwa.",
        en: "The epilogue: a broken Moltke loses command, and his successor, Falkenhayn, soon understands that Germany will no longer win a quick, decisive victory.",
      },
    },
  },
  {
    slug: "legiony-polskie",
    slugEn: "polish-legions",
    title: "Legiony Polskie",
    titleEn: "The Polish Legions",
    lead: "Od Kadrówki przez Łowczówek i Kostiuchnówkę po Rarańczę i Kaniów.",
    leadEn: "From the Cadre Company through Łowczówek and Kostiuchnówka to Rarańcza and Kaniów.",
    intro:
      "6 sierpnia 1914 roku z Krakowa wyruszyła Pierwsza Kompania Kadrowa Józefa Piłsudskiego, a kilka tygodni później powstały Legiony Polskie, walczące u boku armii austro-węgierskiej. Legioniści bili się z Rosjanami w Królestwie, w Karpatach i na Wołyniu, a pod Łowczówkiem pokazali, że stali się pełnowartościowym wojskiem. Niemcy chcieli zrobić z nich zaczątek armii polskiej u swego boku, ale w lipcu 1917 roku legioniści I i III Brygady odmówili przysięgi, a Piłsudski trafił do Magdeburga. Seria prowadzi od wymarszu Kadrówki przez Krzywopłoty, Łowczówek i Kostiuchnówkę, kryzys przysięgowy i aresztowanie Komendanta po przebicie się II Brygady pod Rarańczą i ostatni bój legionistów Hallera pod Kaniowem.",
    introEn:
      "On 6 August 1914 Józef Piłsudski's First Cadre Company set out from Kraków, and a few weeks later the Polish Legions were formed to fight alongside the Austro-Hungarian army. The legionaries fought the Russians in the Kingdom, in the Carpathians and in Volhynia, and at Łowczówek they showed that they had become a fully fledged army. Germany wanted to make them the core of a Polish army at its side, but in July 1917 the legionaries of the I and III Brigades refused the oath, and Piłsudski ended up in Magdeburg. The series runs from the march of the Cadre Company through Krzywopłoty, Łowczówek and Kostiuchnówka, the oath crisis and the Commandant's arrest to the Second Brigade's breakthrough at Rarańcza and the last fight of Haller's legionaries at Kaniów.",
    steps: [
      "austro-wegry-wypowiadaja-wojne-rosji",
      "odwrot-austro-wegier-w-galicji",
      "bitwy/bitwa-pod-warszawa-i-deblinem",
      "austriacy-odbijaja-syhot",
      "rosjanie-zajmuja-stanislawow",
      "bitwy/bitwa-pod-krakowem",
      "bitwy/bitwa-pod-limanowa",
      "bitwy/bitwa-pod-lowczowkiem",
      "austriacy-zdobywaja-stanislawow",
      "bitwy/ofensywa-brusilowa",
      "akt-5-listopada",
      "kryzys-przysiegowy",
      "aresztowanie-pilsudskiego",
      "bitwa-pod-rarancza",
      "bitwy/bitwa-pod-kaniowem",
    ],
    notes: {
      "austro-wegry-wypowiadaja-wojne-rosji": {
        pl: "Punkt wyjścia: w dniu, w którym dwaj zaborcy stają przeciw sobie, Pierwsza Kompania Kadrowa Piłsudskiego wyrusza z Krakowa i przekracza granicę Królestwa Polskiego.",
        en: "The starting point: on the day two partitioning powers go to war with each other, Piłsudski's First Cadre Company sets out from Kraków and crosses into the Kingdom of Poland.",
      },
      "odwrot-austro-wegier-w-galicji": {
        pl: "Pierwszy kryzys Legionów: przy odwrocie z Galicji Legion Wschodni się rozpada, a tylko żołnierze skupieni wokół Hallera składają przysięgę i wchodzą do nowego 3 Pułku.",
        en: "The Legions' first crisis: in the retreat from Galicia the Eastern Legion falls apart, and only the men around Haller take the oath and join the new 3rd Regiment.",
      },
      "bitwy/bitwa-pod-warszawa-i-deblinem": {
        pl: "Legioniści Piłsudskiego w wielkiej jesiennej bitwie nad Wisłą: pod Laskami i Anielinem staczają jedną ze swoich pierwszych dużych bitew z Rosjanami.",
        en: "Piłsudski's legionaries in the great autumn battle on the Vistula: at Laski and Anielin they fight one of their first large battles with the Russians.",
      },
      "austriacy-odbijaja-syhot": {
        pl: "Druga gałąź Legionów, przyszła II Brygada, zaczyna wojnę w Karpatach: potyczka pod Syhotem to pierwsza walka Legionów w Karpatach Wschodnich.",
        en: "The other branch of the Legions, the future Second Brigade, begins its war in the Carpathians: the skirmish near Máramarossziget is the Legions' first action in the Eastern Carpathians.",
      },
      "rosjanie-zajmuja-stanislawow": {
        pl: "Mołotków, jedna z pierwszych dużych i najkrwawszych bitew Legionów z Rosjanami, zatrzymuje jesienny marsz karpackich pułków na Stanisławów.",
        en: "Mołotków, one of the first large and bloodiest battles of the Legions against the Russians, halts the Carpathian regiments' autumn advance on Stanisławów.",
      },
      "bitwy/bitwa-pod-krakowem": {
        pl: "W bitwie pod Krakowem Legiony zyskują pierwszą legendę: bój pod Krzywopłotami przechodzi do ich tradycji jako „legionowe Termopile”.",
        en: "In the Battle of Kraków the Legions gain their first legend: the fight at Krzywopłoty passes into their tradition as \"the Legions' Thermopylae\".",
      },
      "bitwy/bitwa-pod-limanowa": {
        pl: "Zwycięstwo pod Limanową otwiera Legionom Nowy Sącz, gdzie oddziały Piłsudskiego zostają przekształcone w I Brygadę Legionów Polskich.",
        en: "Victory at Limanowa opens Nowy Sącz to the Legions, and there Piłsudski's units are reorganised into the First Brigade of the Polish Legions.",
      },
      "bitwy/bitwa-pod-lowczowkiem": {
        pl: "Pierwszy bój I Brygady, toczony także w Wigilię, pokazuje, że ochotnicze oddziały Piłsudskiego stały się pełnowartościowym wojskiem.",
        en: "The First Brigade's first battle, fought on Christmas Eve too, shows that Piłsudski's volunteer units have become a fully fledged army.",
      },
      "austriacy-zdobywaja-stanislawow": {
        pl: "Karpacka zima Legionów: grupa podpułkownika Hallera, późniejsza II Brygada, bierze udział w zimowej ofensywie, która na krótko odbiera Rosjanom Stanisławów.",
        en: "The Legions' Carpathian winter: Lieutenant Colonel Haller's group, the later Second Brigade, takes part in the winter offensive that briefly wins back Stanisławów.",
      },
      "bitwy/ofensywa-brusilowa": {
        pl: "Legiony w ofensywie Brusiłowa: Kostiuchnówka kosztuje je około 2 tysięcy zabitych i rannych i staje się jedną z najważniejszych bitew w ich tradycji.",
        en: "The Legions in the Brusilov offensive: Kostiuchnówka costs them about 2,000 killed and wounded and becomes one of the most important battles in their tradition.",
      },
      "akt-5-listopada": {
        pl: "Legiony zmieniają się w Polski Korpus Posiłkowy, Piłsudski odchodzi z wojska, a manifest cesarzy ma przede wszystkim dać państwom centralnym polskiego rekruta.",
        en: "The Legions become the Polish Auxiliary Corps, Piłsudski leaves the army, and the emperors' manifesto is above all meant to give the Central Powers Polish recruits.",
      },
      "kryzys-przysiegowy": {
        pl: "Punkt zwrotny serii: odmowa przysięgi przez I i III Brygadę kończy Legiony w dotychczasowej postaci i współpracę Piłsudskiego z państwami centralnymi.",
        en: "The turning point of the series: the refusal of the I and III Brigades to swear ends the Legions in their existing form and Piłsudski's cooperation with the Central Powers.",
      },
      "aresztowanie-pilsudskiego": {
        pl: "Twórca Legionów staje się więźniem Niemiec: Komendant spędza ponad rok w Magdeburgu, a niewola czyni go symbolem walki o niepodległość.",
        en: "The creator of the Legions becomes a prisoner of Germany: the Commandant spends over a year in Magdeburg, and captivity makes him a symbol of the struggle for independence.",
      },
      "bitwa-pod-rarancza": {
        pl: "Zerwanie II Brygady z Austrią: po raz pierwszy polskie oddziały walczące u boku państw centralnych otwarcie zrywają z nimi z bronią w ręku.",
        en: "The Second Brigade's break with Austria: for the first time Polish units fighting alongside the Central Powers openly break with them, arms in hand.",
      },
      "bitwy/bitwa-pod-kaniowem": {
        pl: "Koniec drogi legionistów Hallera: w II Korpusie Polskim stawiają opór Niemcom pod Kaniowem, który staje się symbolem zbrojnego sprzeciwu wobec państw centralnych.",
        en: "The end of the road for Haller's legionaries: in the Polish II Corps they resist the Germans at Kaniów, which becomes a symbol of armed opposition to the Central Powers.",
      },
    },
  },
  {
    slug: "droga-do-niepodleglosci",
    slugEn: "road-to-independence",
    title: "Droga do niepodległości",
    titleEn: "The road to independence",
    lead: "Sprawa polska od obietnic zaborców po własne państwo.",
    leadEn: "The Polish question, from the partitioning powers' promises to a state of its own.",
    intro:
      "Wojna, w której trzy państwa zaborcze stanęły przeciw sobie, po raz pierwszy od rozbiorów uczyniła sprawę polską przedmiotem międzynarodowej rywalizacji. Mocarstwa licytowały się obietnicami: od autonomii pod berłem cara po zjednoczoną i niepodległą Polskę z dostępem do morza. Jesienią 1918 roku, gdy wszystkie trzy mocarstwa zaborcze przegrały wojnę albo się rozpadły, Polacy sami przejęli władzę w Krakowie, Lublinie i Warszawie. Nowe państwo nie miało jednak ani granic, ani uznania mocarstw, a o Lwów i Galicję Wschodnią trzeba było walczyć. Seria prowadzi od odezwy wielkiego księcia Mikołaja przez akt 5 listopada, orędzia Wilsona i Radę Regencyjną po 11 listopada, obronę Lwowa i powstanie wielkopolskie.",
    introEn:
      "A war in which the three partitioning powers fought one another made the Polish question, for the first time since the partitions, an object of international rivalry. The powers outbid one another with promises, from autonomy under the Tsar to a united and independent Poland with access to the sea. In the autumn of 1918, when all three partitioning powers had lost the war or fallen apart, the Poles took power themselves in Kraków, Lublin and Warsaw. Yet the new state had no borders and no recognition from the powers, and Lwów and Eastern Galicia had to be fought for. The series runs from Grand Duke Nicholas's proclamation through the Act of 5 November, Wilson's addresses and the Regency Council to 11 November, the defence of Lwów and the Greater Poland uprising.",
    steps: [
      "odezwa-wielkiego-ksiecia-mikolaja-do-polakow",
      "akt-5-listopada",
      "pierwsze-posiedzenie-tymczasowej-rady-stanu",
      "pokoj-bez-zwyciestwa",
      "odezwa-rzadu-tymczasowego-do-polakow",
      "powstanie-komitetu-narodowego-polskiego",
      "rada-regencyjna-obejmuje-wladze",
      "czternascie-punktow-wilsona",
      "deklaracja-wersalska",
      "deklaracja-rady-regencyjnej",
      "przemowienie-korfantego-w-reichstagu",
      "wyzwolenie-krakowa",
      "bitwy/obrona-lwowa-1918",
      "rzad-lubelski",
      "odzyskanie-niepodleglosci-przez-polske",
      "rozwiazanie-rady-regencyjnej",
      "powstanie-naczelnej-rady-ludowej",
      "bitwy/powstanie-wielkopolskie",
    ],
    notes: {
      "odezwa-wielkiego-ksiecia-mikolaja-do-polakow": {
        pl: "Punkt wyjścia: Rosja obiecuje zjednoczyć ziemie polskie, a sprawa polska staje się przedmiotem licytacji mocarstw.",
        en: "The starting point: Russia promises to unite the Polish lands, and the Polish question becomes something the powers bid for.",
      },
      "akt-5-listopada": {
        pl: "Państwa centralne obiecują Polakom państwo, choć tylko „samodzielne”; z tego aktu wyrośnie Rada Regencyjna, która odda władzę Piłsudskiemu.",
        en: "The Central Powers promise the Poles a state, if only a “self-governing” one; from this act grows the Regency Council that will hand power to Piłsudski.",
      },
      "pierwsze-posiedzenie-tymczasowej-rady-stanu": {
        pl: "Pierwsza polska instytucja w okupowanym Królestwie: mianowana i doradcza, ale pierwszy raz od dziesięcioleci przygotowuje po polsku instytucje państwa.",
        en: "The first Polish body in the occupied Kingdom: appointed and advisory, but for the first time in decades preparing state institutions in Polish.",
      },
      "pokoj-bez-zwyciestwa": {
        pl: "Głos spoza Europy: prezydent USA idzie dalej niż obietnice obu stron wojny i mówi o Polsce zjednoczonej i niepodległej.",
        en: "A voice from outside Europe: the US president goes further than the promises of either side and speaks of a united and independent Poland.",
      },
      "odezwa-rzadu-tymczasowego-do-polakow": {
        pl: "Rosja, która uważała sprawę polską za swoją wewnętrzną, sama uznaje prawo Polski do niepodległości i otwiera drogę zachodnim sojusznikom.",
        en: "Russia, which had treated the Polish question as its internal affair, itself recognises Poland's right to independence, freeing the Western Allies to speak.",
      },
      "powstanie-komitetu-narodowego-polskiego": {
        pl: "Obóz Dmowskiego zyskuje reprezentację w państwach Ententy, pomyślaną jako zalążek rządu odbudowanej Polski.",
        en: "Dmowski's camp gains a representation in the Entente countries, conceived as the nucleus of a government of a restored Poland.",
      },
      "rada-regencyjna-obejmuje-wladze": {
        pl: "Regenci obejmują władzę z nadania Berlina i Wiednia, ale ich przysięga nie wspomina ani słowem o mocarstwach okupacyjnych.",
        en: "The regents take office by grace of Berlin and Vienna, yet their oath makes no mention whatsoever of the occupying powers.",
      },
      "czternascie-punktow-wilsona": {
        pl: "Trzynasty punkt czyni niepodległą Polskę z dostępem do morza oficjalnym celem wojny Stanów Zjednoczonych.",
        en: "The thirteenth point makes an independent Poland with access to the sea an official war aim of the United States.",
      },
      "deklaracja-wersalska": {
        pl: "Francja, Wielka Brytania i Włochy pierwszy raz wspólnie wpisują zjednoczoną Polskę do warunków przyszłego pokoju.",
        en: "France, Britain and Italy for the first time jointly make a united Poland one of the conditions of the future peace.",
      },
      "deklaracja-rady-regencyjnej": {
        pl: "Pierwszy raz od rozbiorów władza na ziemiach polskich ogłasza za cel pełną niepodległość i zaczyna działać bez oglądania się na Berlin i Wiedeń.",
        en: "For the first time since the partitions an authority on Polish soil declares full independence its aim and begins acting without looking to Berlin and Vienna.",
      },
      "przemowienie-korfantego-w-reichstagu": {
        pl: "Zabór pruski zabiera głos: z trybuny Reichstagu Korfanty żąda polskich ziem Rzeszy, a Polacy stamtąd zaczynają liczyć na konferencję pokojową, nie na Berlin.",
        en: "The Prussian partition speaks up: from the Reichstag rostrum Korfanty claims the Polish lands of the Reich, and their Poles now look to the peace conference, not to Berlin.",
      },
      "wyzwolenie-krakowa": {
        pl: "Kraków sam zrzuca obce panowanie w rozpadzie monarchii Habsburgów, zanim o jego losie zdecydowano w Wiedniu, Warszawie czy Paryżu.",
        en: "Kraków throws off foreign rule by its own efforts as the Habsburg monarchy collapses, before Vienna, Warsaw or Paris can decide its fate.",
      },
      "bitwy/obrona-lwowa-1918": {
        pl: "Niepodległość od pierwszych dni oznacza walkę o granice: Lwów zostaje przy Polsce, ale wojna o Galicję Wschodnią dopiero się zaczyna.",
        en: "From its first days independence means fighting for borders: Lwów stays Polish, but the war for Eastern Galicia is only beginning.",
      },
      "rzad-lubelski": {
        pl: "Lewica niepodległościowa nie czeka na regentów: w Lublinie powstaje pierwszy rząd, który nazywa swoje państwo republiką.",
        en: "The pro-independence left will not wait for the regents: in Lublin the first government forms that calls its state a republic.",
      },
      "odzyskanie-niepodleglosci-przez-polske": {
        pl: "Symboliczna data: polska władza przejmuje wojsko w stolicy w dniu, w którym wojna kończy się klęską ostatniego z zaborców.",
        en: "The symbolic date: Polish authority takes over the army in the capital on the day the war ends with the defeat of the last partitioning power.",
      },
      "rozwiazanie-rady-regencyjnej": {
        pl: "Koniec regencji: organ powołany przez Berlin i Wiedeń przestaje istnieć, a na czele odradzającego się państwa staje jeden człowiek.",
        en: "The end of the regency: the body set up by Berlin and Vienna ceases to exist, and a single man stands at the head of the reviving state.",
      },
      "powstanie-naczelnej-rady-ludowej": {
        pl: "Zabór pruski zyskuje własną polską władzę, która zamiast powstania chce przejmować prowincję krok po kroku i czekać na rozstrzygnięcie konferencji pokojowej.",
        en: "The Prussian partition gains a Polish authority of its own, which instead of an uprising means to take over the province step by step and wait for the peace conference.",
      },
      "bitwy/powstanie-wielkopolskie": {
        pl: "Zamknięcie serii w zaborze pruskim: Polacy przejmują władzę w większej części Wielkopolski, zanim konferencja pokojowa zacznie mówić o granicach.",
        en: "The series ends in the Prussian partition: the Poles take power in most of Greater Poland before the peace conference begins discussing borders.",
      },
    },
  },
  {
    slug: "wojna-na-ziemiach-polskich",
    slugEn: "war-on-polish-soil",
    title: "Wojna na ziemiach polskich",
    titleEn: "The war on Polish soil",
    lead: "Bitwy, oblężenia i okupacje, które przetoczyły się przez polskie miasta i wsie.",
    leadEn: "The battles, sieges and occupations that swept through Polish towns and villages.",
    intro:
      "Od 1 sierpnia 1914 roku wojna na froncie wschodnim toczyła się na ziemiach polskich, a Polacy służyli w armiach trzech zaborców po przeciwnych stronach. W pierwszych miesiącach Rosjanie zajęli Lwów i oblegli Przemyśl, a Niemcy doszli pod Warszawę i zajęli Łódź. Przełamanie pod Gorlicami w maju 1915 roku odwróciło losy wojny: w czerwcu państwa centralne odzyskały Przemyśl i Lwów, a latem Rosjanie musieli opuścić całe Królestwo Polskie. Cofając się, Rosjanie wywozili fabryki, pustoszyli kraj i wysiedlali ludność, a na zajętych ziemiach Niemcy i Austriacy zaprowadzili własne rządy. Seria prowadzi od zburzenia Kalisza przez Galicję, Przemyśl, Łódź i Limanową po Gorlice, upadek Warszawy i falę bieżeństwa.",
    introEn:
      "From 1 August 1914 the war on the Eastern Front was fought on Polish soil, and Poles served in the armies of all three partitioning powers, on opposite sides. In the first months the Russians took Lemberg and besieged Przemyśl, while the Germans came within reach of Warsaw and took Łódź. The breakthrough at Gorlice in May 1915 turned the tide: in June the Central Powers recovered Przemyśl and Lemberg, and in the summer the Russians had to abandon the whole Kingdom of Poland. As they withdrew, the Russians carried factory machinery east, laid waste to the country and deported the population, and in the occupied lands the Germans and Austrians set up their own rule. The series runs from the destruction of Kalisz through Galicia, Przemyśl, Łódź and Limanowa to Gorlice, the fall of Warsaw and the wave of bezhenstvo.",
    steps: [
      "pierwsze-walki-na-granicy-krolestwa-polskiego",
      "bitwy/bitwa-galicyjska",
      "rosjanie-zdobywaja-lwow",
      "poczatek-oblezenia-przemysla",
      "bitwy/bitwa-pod-warszawa-i-deblinem",
      "bitwy/bitwa-pod-lodzia",
      "bitwy/bitwa-pod-limanowa",
      "niemcy-zajmuja-lodz",
      "bitwy/walki-nad-rawka-i-bzura",
      "kapitulacja-przemysla",
      "bitwy/bitwa-pod-gorlicami",
      "austro-wegrzy-odbijaja-lwow",
      "koniec-bitwy-pod-biskupicami",
      "niemcy-zajmuja-warszawe",
      "niemcy-zajmuja-bialystok",
    ],
    notes: {
      "pierwsze-walki-na-granicy-krolestwa-polskiego": {
        pl: "Punkt wyjścia: granica zaborów staje się linią frontu, a zburzenie Kalisza otwiera listę przemocy wobec ludności cywilnej w tej wojnie.",
        en: "The starting point: the partition border becomes a front line, and the destruction of Kalisz opens the list of violence against civilians in this war.",
      },
      "bitwy/bitwa-galicyjska": {
        pl: "Pierwsza wielka bitwa toczona prawie w całości na ziemiach polskich, w której Polacy walczą po obu stronach frontu.",
        en: "The first great battle fought almost entirely on Polish lands, with Poles fighting on both sides of the front.",
      },
      "rosjanie-zdobywaja-lwow": {
        pl: "Pierwszy reżim okupacyjny w serii: zajęte ziemie Galicji i Bukowiny przechodzą pod rosyjski zarząd generał-gubernatorstwa z siedzibą we Lwowie.",
        en: "The first occupation regime in the series: the occupied lands of Galicia and Bukovina are placed under a Russian governorate-general based in Lemberg.",
      },
      "poczatek-oblezenia-przemysla": {
        pl: "Zaczyna się pierwsze oblężenie Przemyśla: w okrążeniu zostaje ponad 120 tysięcy żołnierzy i kilkanaście tysięcy cywilów.",
        en: "The first siege of Przemyśl begins: more than 120,000 soldiers and over ten thousand civilians are shut in the fortress.",
      },
      "bitwy/bitwa-pod-warszawa-i-deblinem": {
        pl: "Wojna dochodzi do serca Królestwa Polskiego: dla mieszkańców bitwa oznacza przejście frontu przez ich domy dwa razy w ciągu miesiąca.",
        en: "The war reaches the heart of the Kingdom of Poland: for its inhabitants the battle means the front passing through their homes twice within a month.",
      },
      "bitwy/bitwa-pod-lodzia": {
        pl: "Wielka bitwa manewrowa toczy się wokół Łodzi, a samo miasto jest pod ostrzałem: według milicji ginie w nim 135 cywilów.",
        en: "A great battle of manoeuvre is fought around Łódź, and the city itself is shelled: according to the militia, 135 civilians are killed there.",
      },
      "bitwy/bitwa-pod-limanowa": {
        pl: "Zwycięstwo Austriaków odsuwa Rosjan od Krakowa i ustala front na Dunajcu i Białej, gdzie przetrwa on do przełamania pod Gorlicami.",
        en: "The Austrian victory pushes the Russians back from Kraków and fixes the front on the Dunajec and the Biała, where it holds until the breakthrough at Gorlice.",
      },
      "niemcy-zajmuja-lodz": {
        pl: "Jak wyglądała okupacja w praktyce: w Łodzi Niemcy rekwirują wszystko, co przyda się armii i niemieckiemu przemysłowi.",
        en: "What occupation meant in practice: in Łódź the Germans requisition everything that might be of use to the army and to German industry.",
      },
      "bitwy/walki-nad-rawka-i-bzura": {
        pl: "Front zamiera w okopach na zachód od Warszawy; najbardziej cierpi Sochaczew, który przez siedem miesięcy leży na samej linii frontu nad Bzurą.",
        en: "The front freezes in trenches west of Warsaw; Sochaczew suffers most, lying for seven months on the very front line on the Bzura.",
      },
      "kapitulacja-przemysla": {
        pl: "Finał drugiego oblężenia: wygłodzona załoga niszczy umocnienia i poddaje się Rosjanom w jednej z największych kapitulacji tej wojny.",
        en: "The end of the second siege: the starving garrison destroys the fortifications and surrenders to the Russians in one of the largest capitulations of the war.",
      },
      "bitwy/bitwa-pod-gorlicami": {
        pl: "Punkt zwrotny serii: po przełamaniu Rosjanie tracą Przemyśl i Lwów, a latem muszą opuścić całe Królestwo Polskie.",
        en: "The turning point of the series: after the breakthrough the Russians lose Przemyśl and Lemberg, and in the summer have to abandon the whole Kingdom of Poland.",
      },
      "austro-wegrzy-odbijaja-lwow": {
        pl: "Zamyka wątek z 3 września 1914 roku: Lwów wraca pod władzę Austro-Węgier po rosyjskiej okupacji, która trwała 293 dni.",
        en: "It closes the thread of 3 September 1914: Lemberg returns to Austro-Hungarian rule after a Russian occupation that lasted 293 days.",
      },
      "koniec-bitwy-pod-biskupicami": {
        pl: "Pokazuje, jak wyglądał rosyjski odwrót z Królestwa Polskiego: pustoszenie kraju przed nadejściem przeciwnika i przymusowe wysiedlanie ludności.",
        en: "It shows what the Russian retreat from the Kingdom of Poland looked like: the country laid waste before the enemy arrived and the population forcibly deported.",
      },
      "niemcy-zajmuja-warszawe": {
        pl: "Koniec rosyjskiej Warszawy i nowy porządek: Niemcy tworzą Generalne Gubernatorstwo Warszawskie z generałem Beselerem na czele.",
        en: "The end of Russian Warsaw and a new order: the Germans create the Government General of Warsaw under General Beseler.",
      },
      "niemcy-zajmuja-bialystok": {
        pl: "Bieżeństwo z bliska: z Białegostoku wyjeżdża większość prawosławnych mieszkańców, część wielkiej fali uchodźców, która w 1915 roku ogarnęła zachodnie gubernie Rosji.",
        en: "Bezhenstvo close up: most of Białystok's Orthodox inhabitants leave, part of the great refugee exodus that swept the western governorates of Russia in 1915.",
      },
    },
  },
  {
    slug: "verdun",
    slugEn: "verdun",
    title: "Verdun 1916",
    titleEn: "Verdun 1916",
    lead: "Dziesięć miesięcy walki o wzgórza nad Mozą, francuski symbol całej wojny.",
    leadEn: "Ten months of fighting for the heights above the Meuse, France's symbol of the war.",
    intro:
      "21 lutego 1916 roku Niemcy uderzyli pod Verdun po ostrzale z ponad 1200 dział, a 25 lutego niemal bez walki weszli do fortu Douaumont. Bitwa, która miała trwać kilka tygodni, przerodziła się w walkę na wyniszczenie: Niemcy zdobyli jeszcze fort Vaux i doszli pod fort Souville, ale miasta nie wzięli. Jesienią Francuzi Nivelle’a i Mangina odbili forty Douaumont i Vaux, a 18 grudnia skończyła się najdłuższa bitwa tej wojny. Żadna ze stron nie osiągnęła celu, ale Verdun stało się dla Francuzów symbolem całej wojny. Seria prowadzi od pierwszego ostrzału przez Douaumont, Vaux, Thiaumont i odsiecz nad Sommą po jesienne kontrnatarcia, awans Nivelle’a i koniec bitwy.",
    introEn:
      "On 21 February 1916 the Germans attacked at Verdun after a bombardment from more than 1,200 guns, and on 25 February they entered Fort Douaumont almost without a fight. The battle, meant to last a few weeks, turned into a struggle of attrition: the Germans went on to take Fort Vaux and reached Fort Souville, but never took the city. In the autumn the French under Nivelle and Mangin retook Forts Douaumont and Vaux, and on 18 December the longest battle of the war came to an end. Neither side achieved its aim, but Verdun became for the French a symbol of the whole war. The series runs from the first bombardment through Douaumont, Vaux, Thiaumont and the relief on the Somme to the autumn counter-offensives, Nivelle's promotion and the end of the battle.",
    overview: "bitwy/bitwa-pod-verdun",
    steps: [
      "poczatek-bitwy-pod-verdun",
      "niemcy-zdobywaja-fort-douaumont",
      "trzecia-konferencja-w-chantilly",
      "poczatek-bitwy-nad-jeziorem-narocz",
      "koniec-plagi-fokkerow",
      "niemcy-zdobywaja-fort-vaux",
      "niemcy-zdobywaja-thiaumont",
      "pierwszy-dzien-bitwy-nad-somma",
      "hindenburg-szefem-sztabu-generalnego",
      "koniec-francuskiej-obrony-pod-verdun",
      "bitwy/pierwsza-ofensywna-bitwa-pod-verdun",
      "francuzi-odbijaja-fort-douaumont",
      "francuzi-odbijaja-fort-vaux",
      "nivelle-naczelnym-wodzem",
      "koniec-bitwy-pod-verdun",
    ],
    notes: {
      "poczatek-bitwy-pod-verdun": {
        pl: "Punkt wyjścia serii: ostrzał z ponad 1200 dział otwiera bitwę, która z przerwami trwała do grudnia 1916 roku.",
        en: "The starting point of the series: a bombardment from more than 1,200 guns opens a battle that, with pauses, lasted until December 1916.",
      },
      "niemcy-zdobywaja-fort-douaumont": {
        pl: "Największy fort Verdun pada bez walki, ale tego samego dnia Francuzi postanawiają bronić prawego brzegu Mozy, a obronę miasta obejmuje Pétain.",
        en: "Verdun's largest fort falls without a fight, but that same day the French decide to hold the right bank of the Meuse, and Pétain takes over the defence.",
      },
      "trzecia-konferencja-w-chantilly": {
        pl: "Verdun zmienia plany sprzymierzonych: w Chantilly postanawiają, że wspólna ofensywa ruszy jak najszybciej, by zdjąć nacisk z Verdun.",
        en: "Verdun changes the Allies' plans: at Chantilly they agree that the joint offensive must start as soon as possible to take the pressure off Verdun.",
      },
      "poczatek-bitwy-nad-jeziorem-narocz": {
        pl: "Verdun odbija się na froncie wschodnim: Rosjanie uderzają, by odciążyć Francuzów, i już pierwszego dnia ponoszą ciężkie straty, nic nie zdobywając.",
        en: "Verdun echoes on the Eastern Front: the Russians attack to relieve the French and on the very first day suffer heavy losses for no gain.",
      },
      "koniec-plagi-fokkerow": {
        pl: "Bitwa w powietrzu: nad Verdun niemieckie samoloty oślepiają francuską artylerię, i to tu Francuzi pierwsi odbierają Niemcom przewagę.",
        en: "The battle in the air: over Verdun German aircraft blind the French artillery, and it is here that the French are the first to wrest superiority from them.",
      },
      "niemcy-zdobywaja-fort-vaux": {
        pl: "Ostatni fort zdobyty przez Niemców po walce w jego korytarzach: po upadku Vaux stają o kilka kilometrów od miasta, przed ostatnimi wzgórzami.",
        en: "The last fort the Germans take, after a fight in its corridors: with Vaux fallen they stand a few kilometres from the city, before the last heights.",
      },
      "niemcy-zdobywaja-thiaumont": {
        pl: "Najgroźniejszy dzień bitwy od lutego: Francuzi zatrzymują natarcie, a Nivelle wydaje rozkaz, z którego rodzi się hasło „Ils ne passeront pas”.",
        en: "The most dangerous day of the battle since February: the French halt the attack, and Nivelle issues the order that gives rise to \"Ils ne passeront pas\".",
      },
      "pierwszy-dzien-bitwy-nad-somma": {
        pl: "Obiecana w Chantilly odsiecz nadchodzi: rusza wielka ofensywa nad Sommą, która miała przede wszystkim odciążyć Francuzów pod Verdun.",
        en: "The relief promised at Chantilly arrives: the great Somme offensive opens, meant above all to relieve the French at Verdun.",
      },
      "hindenburg-szefem-sztabu-generalnego": {
        pl: "Autor ataku traci stanowisko: plan Falkenhayna załamał się, bo Verdun nie padło, a sprzymierzeni uderzyli nad Sommą i na wschodzie.",
        en: "The author of the attack is dismissed: Falkenhayn's plan has collapsed, because Verdun did not fall and the Allies struck on the Somme and in the east.",
      },
      "koniec-francuskiej-obrony-pod-verdun": {
        pl: "Granica między obroną a natarciem: Francuzi odbijają Fleury, a Niemcy przestają szukać rozstrzygnięcia nad Mozą.",
        en: "The line between defence and attack: the French retake Fleury, and the Germans stop seeking a decision on the Meuse.",
      },
      "bitwy/pierwsza-ofensywna-bitwa-pod-verdun": {
        pl: "Jesienne kontrnatarcie w jednym tekście: dwa starannie przygotowane uderzenia Nivelle'a i Mangina, którymi Francuzi zakończyli bitwę.",
        en: "The autumn counter-offensive in one text: the two carefully prepared blows by Nivelle and Mangin with which the French brought the battle to a close.",
      },
      "francuzi-odbijaja-fort-douaumont": {
        pl: "Zwrot bitwy: fort stracony w lutym wraca do Francuzów, a krótkie natarcie za ruchomą zaporą czyni z Nivelle'a i Mangina bohaterów.",
        en: "The turn of the battle: the fort lost in February returns to the French, and a short attack behind a creeping barrage makes heroes of Nivelle and Mangin.",
      },
      "francuzi-odbijaja-fort-vaux": {
        pl: "Role się odwracają: Niemcy opuszczają odcięty fort, a Francuzi odzyskują w praktyce pozycje z czwartego dnia bitwy.",
        en: "The roles are reversed: the Germans abandon the cut-off fort, and the French in practice recover the positions of the fourth day of the battle.",
      },
      "nivelle-naczelnym-wodzem": {
        pl: "Skutek Verdun w dowództwie: zwycięzca spod Douaumont zastępuje Joffre'a, przekonany, że jego metodę można zastosować na dużo większą skalę.",
        en: "Verdun's effect on the high command: the victor of Douaumont replaces Joffre, convinced that his method can be applied on a much larger scale.",
      },
      "koniec-bitwy-pod-verdun": {
        pl: "Koniec i bilans najdłuższej bitwy wojny: żadna ze stron nie osiągnęła celu, a Verdun stało się dla Francuzów symbolem całej wojny.",
        en: "The end and the reckoning of the war's longest battle: neither side achieved its aim, and Verdun became for the French a symbol of the whole war.",
      },
    },
  },
  {
    slug: "bitwa-nad-somma",
    slugEn: "battle-of-the-somme",
    title: "Bitwa nad Sommą",
    titleEn: "The Battle of the Somme",
    lead: "Najkrwawsza bitwa armii brytyjskiej: od pierwszego dnia po śnieg nad Ancre.",
    leadEn: "The British Army's bloodiest battle, from the first day to the snow on the Ancre.",
    intro:
      "1 lipca 1916 roku Brytyjczycy i Francuzi uderzyli nad Sommą w ofensywie uzgodnionej w Chantilly. Pierwszy dzień był najkrwawszym w dziejach armii brytyjskiej, a zamiast przełamania przyszła bitwa na wyniszczenie o kolejne wsie, lasy i grzbiety. We wrześniu po raz pierwszy w historii poszły do boju czołgi, ale alianci nie przełamali frontu i posunęli się najwyżej o około dziesięć kilometrów. Bitwa odciążyła jednak Verdun i wykrwawiła armię niemiecką, a obie strony straciły łącznie ponad milion ludzi. Seria prowadzi od Chantilly i pierwszego dnia przez letnie boje o Bazentin, las Delville, Pozières i Guillemont, pierwsze czołgi pod Flers-Courcelette i jesień w błocie po ostatnie natarcie nad Ancre 18 listopada.",
    introEn:
      "On 1 July 1916 the British and French attacked on the Somme, in an offensive agreed at Chantilly. The first day was the bloodiest in the British Army's history, and instead of a breakthrough came a battle of attrition over one village, wood and ridge after another. In September tanks went into battle for the first time in history, but the Allies did not break through and advanced about ten kilometres at most. Yet the battle relieved Verdun and bled the German army, and the two sides together lost more than a million men. The series runs from Chantilly and the first day through the summer fighting for Bazentin, Delville Wood, Pozières and Guillemont, the first tanks at Flers-Courcelette and the autumn in the mud to the last attack on the Ancre on 18 November.",
    overview: "bitwy/bitwa-nad-somma",
    steps: [
      "druga-konferencja-w-chantilly",
      "pierwszy-dzien-bitwy-nad-somma",
      "wybuch-miny-lochnagar",
      "bitwy/bitwa-pod-albert-1916",
      "bitwy/bitwa-o-grzbiet-bazentin",
      "bitwy/bitwa-o-las-delville",
      "bitwy/bitwa-o-grzbiet-pozieres",
      "bitwy/bitwa-pod-guillemont",
      "bitwy/bitwa-pod-ginchy",
      "bitwy/bitwa-pod-flers-courcelette",
      "bitwy/bitwa-pod-morval",
      "bitwy/bitwa-o-grzbiet-thiepval",
      "bitwy/bitwa-o-grzbiety-transloy",
      "bitwy/bitwa-o-wzgorza-nad-ancre",
      "bitwy/bitwa-nad-ancre",
      "koniec-bitwy-nad-somma",
    ],
    notes: {
      "druga-konferencja-w-chantilly": {
        pl: "Skąd wzięła się ofensywa: sprzymierzeni uzgodnili tu jednoczesne uderzenia na wszystkich głównych frontach, a z tych ustaleń wyrosła latem bitwa nad Sommą.",
        en: "Where the offensive came from: the Allies agreed here on simultaneous blows on all the main fronts, and the Battle of the Somme grew out of these decisions.",
      },
      "pierwszy-dzien-bitwy-nad-somma": {
        pl: "Początek bitwy i najkrwawszy dzień w dziejach armii brytyjskiej: 57 470 strat, a 1 lipca 1916 roku stał się dla Brytyjczyków symbolem całej wojny.",
        en: "The battle opens with the bloodiest day in the British Army's history: 57,470 losses, and 1 July 1916 became for the British a symbol of the whole war.",
      },
      "wybuch-miny-lochnagar": {
        pl: "Pierwszy dzień z bliska: mina Lochnagar nie przyniosła zwycięstwa, a atakująca za nią 34 Dywizja straciła więcej ludzi niż jakakolwiek inna dywizja.",
        en: "The first day up close: the Lochnagar mine did not bring victory, and the 34th Division attacking behind it lost more men than any other division.",
      },
      "bitwy/bitwa-pod-albert-1916": {
        pl: "Skutek, dla którego zaczęto bitwę: 11 lipca Falkenhayn przechodzi pod Verdun do ścisłej obrony i zabiera stamtąd artylerię, a ofensywa osiąga pierwszy cel.",
        en: "The result the battle was fought for: on 11 July Falkenhayn goes over to strict defence at Verdun and takes artillery away, and the offensive achieves its first aim.",
      },
      "bitwy/bitwa-o-grzbiet-bazentin": {
        pl: "Odpowiedź na 1 lipca: nocne podejście i krótki ostrzał dają zdobycz przy wielokrotnie mniejszych stratach i pokazują, że armia potrafi się uczyć.",
        en: "The answer to 1 July: a night approach and a short bombardment bring gains at far smaller losses and show that the army can learn.",
      },
      "bitwy/bitwa-o-las-delville": {
        pl: "Somma to także bitwa dominiów: Brygada Południowoafrykańska przez sześć dni i pięć nocy broni lasu pod ostrzałem z trzech stron i wychodzi z niego zdziesiątkowana.",
        en: "The Somme was also a battle of the Dominions: the South African Brigade holds the wood for six days and five nights under fire from three sides and comes out decimated.",
      },
      "bitwy/bitwa-o-grzbiet-pozieres": {
        pl: "Rozdział australijski: zanim Kanadyjczycy ich zluzowali, Australijczycy stracili pod Pozières w niespełna siedem tygodni około 23 tysięcy ludzi.",
        en: "The Australian chapter: before the Canadians relieved them, the Australians lost about 23,000 men at Pozières in under seven weeks.",
      },
      "bitwy/bitwa-pod-guillemont": {
        pl: "Koniec ponad pięciu tygodni nieudanych ataków na prawym skrzydle: 3 września 20 Dywizja (Lekka) zdobywa Guillemont w niespełna trzy godziny.",
        en: "The end of more than five weeks of failed attacks on the right wing: on 3 September the 20th (Light) Division takes Guillemont in less than three hours.",
      },
      "bitwy/bitwa-pod-ginchy": {
        pl: "Zdobycie Ginchy daje Brytyjczykom grzbiet i podstawę do natarcia 15 września, a w Irlandii bitwa staje się jednym z najważniejszych miejsc pamięci wojny.",
        en: "Taking Ginchy gives the British the ridge and a base for the attack of 15 September, and for Ireland the battle becomes one of the main places of memory of the war.",
      },
      "bitwy/bitwa-pod-flers-courcelette": {
        pl: "Druga brytyjska próba przełamania nad Sommą i pierwsza bitwa w historii, w której do boju poszły czołgi.",
        en: "The second British attempt at a breakthrough on the Somme, and the first battle in history in which tanks were used.",
      },
      "bitwy/bitwa-pod-morval": {
        pl: "Najbardziej udane natarcie od 14 lipca: po nim cały główny grzbiet jest w rękach aliantów, choć przełamania znów nie ma.",
        en: "The most successful attack since 14 July: afterwards the whole main ridge is in Allied hands, though again there is no breakthrough.",
      },
      "bitwy/bitwa-o-grzbiet-thiepval": {
        pl: "Powrót do celu pierwszego dnia: Thiepval, pod którym 1 lipca poległy tysiące Brytyjczyków, a kolejne ataki nie dały nic, teraz wpada w ręce Armii Rezerwowej.",
        en: "Back to an objective of the first day: Thiepval, where thousands of British soldiers fell on 1 July and later attacks achieved nothing, now falls to the Reserve Army.",
      },
      "bitwy/bitwa-o-grzbiety-transloy": {
        pl: "Tu ofensywa dochodzi do swoich granic: ostatnie duże natarcie Rawlinsona grzęźnie, a po 18 października alianci ograniczają się do lokalnych natarć.",
        en: "Here the offensive reaches its limits: Rawlinson's last major attack bogs down, and after 18 October the Allies limit themselves to local attacks.",
      },
      "bitwy/bitwa-o-wzgorza-nad-ancre": {
        pl: "Jesień w błocie na północnym skrzydle: grzbiet, który miał być punktem wyjścia do większej ofensywy, zdobywano przez sześć tygodni.",
        en: "Autumn in the mud on the northern flank: the ridge that was meant to be the starting point for a larger offensive took six weeks to capture.",
      },
      "bitwy/bitwa-nad-ancre": {
        pl: "Ostatnie wielkie natarcie zamyka klamrę: 51 Dywizja Górnoszkocka zdobywa Beaumont-Hamel, przed którym 1 lipca wykrwawił się batalion z Nowej Fundlandii.",
        en: "The last great attack closes the circle: the 51st (Highland) Division takes Beaumont-Hamel, before which the Newfoundland battalion had bled to death on 1 July.",
      },
      "koniec-bitwy-nad-somma": {
        pl: "Bilans i lekcje: ruchoma zapora ogniowa, za którą piechota szła tuż za ścianą pocisków, stała się pod koniec bitwy podstawową brytyjską metodą natarcia.",
        en: "The reckoning and the lessons: the creeping barrage, with the infantry following close behind a wall of shells, had become the basic British method of attack by the end.",
      },
    },
  },
  {
    slug: "rosja-1917",
    slugEn: "russia-1917",
    title: "Rosja 1917",
    titleEn: "Russia 1917",
    lead: "Od upadku caratu przez przewrót bolszewicki po pokój brzeski.",
    leadEn: "From the fall of tsarism through the Bolshevik coup to the peace of Brest.",
    intro:
      "W marcu 1917 roku zbuntował się garnizon Piotrogrodu, car zrzekł się tronu, a władzę objął Rząd Tymczasowy, który musiał dzielić ją z radami. Nieudana ofensywa Kiereńskiego i sprawa Korniłowa podkopały ten rząd, a największymi wygranymi okazali się bolszewicy, którzy w listopadzie przejęli władzę. Lenin zawarł z państwami centralnymi rozejm, a po niemieckiej ofensywie przyjął w Brześciu pokój podyktowany siłą. Na wschodzie skończyła się wojna, a Niemcy mogli przerzucać dywizje na zachód. Seria prowadzi od rewolucji lutowej przez dni lipcowe, pucz Korniłowa i przewrót bolszewicki po traktat brzeski i bunt Legionu Czechosłowackiego, jeden z punktów zwrotnych wojny domowej.",
    introEn:
      "In March 1917 the Petrograd garrison mutinied, the Tsar renounced the throne and power passed to the Provisional Government, which had to share it with the soviets. The failed Kerensky Offensive and the Kornilov affair undermined that government, and the biggest winners were the Bolsheviks, who seized power in November. Lenin concluded an armistice with the Central Powers, and after a German offensive accepted at Brest a peace dictated by force. The war in the east was over, and Germany could move divisions to the west. The series runs from the February Revolution through the July Days, the Kornilov affair and the Bolshevik coup to the Treaty of Brest-Litovsk and the revolt of the Czechoslovak Legion, one of the turning points of the civil war.",
    steps: [
      "rewolucja-lutowa",
      "abdykacja-mikolaja-ii",
      "lenin-wraca-do-piotrogrodu",
      "bitwy/ofensywa-kierenskiego",
      "dni-lipcowe-w-piotrogrodzie",
      "upadek-tarnopola-i-stanislawowa",
      "bitwy/bitwa-o-ryge",
      "pucz-kornilowa",
      "upadek-puczu-kornilowa",
      "rewolucja-pazdziernikowa",
      "powstanie-rady-komisarzy-ludowych",
      "rozejm-w-brzesciu",
      "rozpedzenie-konstytuanty",
      "pokoj-brzeski-z-ukraina",
      "bitwy/operacja-faustschlag",
      "traktat-brzeski",
      "bunt-legionu-czechoslowackiego",
    ],
    notes: {
      "rewolucja-lutowa": {
        pl: "Punkt wyjścia serii: bunt garnizonu kończy władzę cara w stolicy, a w Pałacu Taurydzkim rodzi się „dwuwładza” Dumy i Rady, która określi następne miesiące.",
        en: "The starting point of the series: the garrison's mutiny ends tsarist rule in the capital, and in the Tauride Palace the \"dual power\" of Duma and Soviet is born, shaping the months ahead.",
      },
      "abdykacja-mikolaja-ii": {
        pl: "Koniec monarchii: cara skłaniają do abdykacji nie rewolucjoniści, lecz jego własni generałowie, przekonani, że tylko tak opanują rewolucję i dalej poprowadzą wojnę.",
        en: "The end of the monarchy: the Tsar is brought to abdicate not by revolutionaries but by his own generals, convinced that only this will master the revolution and keep the war going.",
      },
      "lenin-wraca-do-piotrogrodu": {
        pl: "Na scenę wchodzi Lenin: Niemcy przewożą go przez swoje terytorium, licząc, że ten nieprzejednany przeciwnik wojny osłabi Rosję od środka.",
        en: "Lenin enters the stage: the Germans carry him across their territory, hoping that this implacable opponent of the war will weaken Russia from within.",
      },
      "bitwy/ofensywa-kierenskiego": {
        pl: "Ostatnia ofensywa armii rosyjskiej miała wzmocnić rewolucyjną Rosję, a stała się jednym z gwoździ do trumny Rządu Tymczasowego.",
        en: "The Russian army's last offensive was meant to strengthen revolutionary Russia, and became instead one of the nails in the coffin of the Provisional Government.",
      },
      "dni-lipcowe-w-piotrogrodzie": {
        pl: "Zbrojny zryw w stolicy kończy się porażką bolszewików, ale Lenin wyciąga z niego wniosek, że władzę trzeba zdobyć zbrojnym powstaniem.",
        en: "The armed rising in the capital ends in defeat for the Bolsheviks, but Lenin draws the lesson that power must be taken by an armed rising.",
      },
      "upadek-tarnopola-i-stanislawowa": {
        pl: "Klęska letniego natarcia: armia cofa się w nieładzie, a z Tarnopolem i Stanisławowem przepadają wszystkie zdobycze ofensywy Brusiłowa i ofensywy Kiereńskiego.",
        en: "The summer offensive ends in defeat: the army retreats in disorder, and with Tarnopol and Stanislau all the gains of the Brusilov and Kerensky offensives are lost.",
      },
      "bitwy/bitwa-o-ryge": {
        pl: "Upadek Rygi budzi w Piotrogrodzie strach przed marszem Niemców na stolicę, a kilka dni później spór Korniłowa z Kiereńskim przeradza się w sprawę Korniłowa.",
        en: "The fall of Riga raises fears in Petrograd of a German march on the capital, and a few days later the quarrel between Kornilov and Kerensky turns into the Kornilov affair.",
      },
      "pucz-kornilowa": {
        pl: "Punkt zwrotny rewolucji: Kiereński bierze słowa przywiezione z Mohylewa za ultimatum, widzi spisek i w nocy odwołuje naczelnego wodza.",
        en: "A turning point of the revolution: Kerensky takes the message brought from Mogilev for an ultimatum, sees a conspiracy and dismisses the commander-in-chief during the night.",
      },
      "upadek-puczu-kornilowa": {
        pl: "Z obrony stolicy przed Korniłowem największą korzyść wynoszą bolszewicy, a Czerwona Gwardia zachowuje broń wydaną do tej walki.",
        en: "The Bolsheviks gain most from the defence of the capital against Kornilov, and the Red Guard keeps the weapons issued for the fight.",
      },
      "rewolucja-pazdziernikowa": {
        pl: "Przewrót bolszewicki: oddziały Rady Piotrogrodzkiej niemal bez walki zajmują najważniejsze punkty stolicy, a ich komitet ogłasza obalenie Rządu Tymczasowego.",
        en: "The Bolshevik coup: the Petrograd Soviet's units take the key points of the capital almost without a fight, and their committee announces that the Provisional Government is overthrown.",
      },
      "powstanie-rady-komisarzy-ludowych": {
        pl: "Nowa władza dostaje rząd Lenina i dekret o pokoju, który ten traktuje poważnie – od Smolnego prowadzi prosta droga do rokowań w Brześciu.",
        en: "The new regime gets Lenin's government and the Decree on Peace, which he takes seriously: the road from the Smolny leads straight to the talks at Brest-Litovsk.",
      },
      "rozejm-w-brzesciu": {
        pl: "Front wschodni milknie, a dla Niemców rozejm jest wielkim zwycięstwem strategicznym: mogą przerzucać dywizje na zachód przed ofensywą wiosenną.",
        en: "The Eastern Front falls silent, and for the Germans the armistice is a great strategic victory: they can move divisions to the West before the spring offensive.",
      },
      "rozpedzenie-konstytuanty": {
        pl: "Bolszewicy rozpędzają Zgromadzenie Ustawodawcze, na które Rosja czekała od upadku caratu, i gaśnie nadzieja na demokratyczne zakończenie rewolucji.",
        en: "The Bolsheviks disperse the Constituent Assembly that Russia had awaited since the fall of tsarism, and the hope of a democratic end to the revolution dies.",
      },
      "pokoj-brzeski-z-ukraina": {
        pl: "Państwa centralne zawierają pokój z Ukrainą, a nazajutrz Trocki ogłasza, że Rosja kończy wojnę, ale pokoju na niemieckich warunkach nie podpisze.",
        en: "The Central Powers make peace with Ukraine, and the next day Trotsky declares that Russia is ending the war but will not sign a peace on German terms.",
      },
      "bitwy/operacja-faustschlag": {
        pl: "Odpowiedź Niemiec: wypowiadają rozejm i ruszają na wschód, armia rosyjska prawie nie stawia oporu, a nieudane rokowania zamieniają się w pokój dyktowany.",
        en: "Germany's answer: it ends the armistice and advances east, the Russian army barely resists, and failed negotiations turn into a dictated peace.",
      },
      "traktat-brzeski": {
        pl: "Koniec wojny na wschodzie: po „ani wojnie, ani pokoju” Trockiego i niemieckiej ofensywie Rosja wychodzi z wojny na warunkach podyktowanych jej siłą.",
        en: "The end of the war in the east: after Trotsky's \"neither war nor peace\" and the German offensive, Russia leaves the war on terms dictated to it by force.",
      },
      "bunt-legionu-czechoslowackiego": {
        pl: "Epilog serii: Czechosłowacy, którzy chcieli tylko wyjechać z Rosji, nie oddają broni, a ich bunt staje się jednym z punktów zwrotnych wojny domowej.",
        en: "The epilogue: the Czechoslovaks, who only wanted to leave Russia, keep their weapons, and their revolt becomes one of the turning points of the civil war.",
      },
    },
  },
  {
    slug: "1918-ostatni-rok-wojny",
    slugEn: "1918-the-last-year",
    title: "1918: ostatni rok wojny",
    titleEn: "1918: The Last Year of the War",
    lead: "Od ofensywy wiosennej po rozejm w Compiègne: jak państwa centralne przegrały wojnę.",
    leadEn: "From the spring offensive to Compiègne: how the Central Powers lost the war.",
    intro:
      "Po wyjściu Rosji z wojny Niemcy przerzucili dywizje na zachód i wiosną 1918 roku w kolejnych ofensywach próbowali rozstrzygnąć wojnę przed przybyciem Amerykanów. Doszli aż nad Marnę, ale w lipcu kontrofensywa Focha wyparła ich z występu, a inicjatywa na froncie zachodnim przeszła w ręce sprzymierzonych. Bitwa pod Amiens otworzyła ofensywę stu dni, a klęska na Linii Hindenburga przyczyniła się do tego, że Ludendorff zażądał rozejmu. Jesienią z wojny wychodziły kolejno Bułgaria, Turcja i Austro-Węgry. Seria prowadzi od operacji Michael przez drugą bitwę nad Marną, Amiens i Linię Hindenburga, rozejmy Bułgarii, Turcji i Austro-Węgier oraz rewolucję w Niemczech po rozejm w Compiègne.",
    introEn:
      "With Russia leaving the war, Germany moved divisions west and in the spring of 1918 tried, in one offensive after another, to decide the war before the Americans arrived. The Germans got as far as the Marne, but in July Foch's counter-offensive drove them from the salient, and the initiative on the Western Front passed to the Allies. The Battle of Amiens opened the Hundred Days Offensive, and the defeat on the Hindenburg Line helped push Ludendorff to demand an armistice. In the autumn Bulgaria, Turkey and Austria-Hungary left the war one after another. The series runs from Operation Michael through the Second Battle of the Marne, Amiens and the Hindenburg Line, the armistices with Bulgaria, Turkey and Austria-Hungary and the revolution in Germany to the Armistice of Compiègne.",
    steps: [
      "bitwy/operacja-michael",
      "konferencja-w-doullens",
      "bitwy/bitwa-nad-lys-1918",
      "bitwy/trzecia-bitwa-nad-aisne",
      "bitwy/druga-bitwa-nad-marna",
      "bitwy/bitwa-pod-amiens",
      "bitwy/bitwy-o-linie-hindenburga",
      "ludendorff-zada-rozejmu",
      "rozejm-w-salonikach",
      "noty-pokojowe-do-wilsona",
      "bitwy/bitwa-pod-vittorio-veneto",
      "rozejm-w-mudros",
      "bunt-w-kilonii",
      "rozejm-w-villa-giusti",
      "rewolucja-w-berlinie",
      "rozejm-w-compiegne",
    ],
    notes: {
      "bitwy/operacja-michael": {
        pl: "Otwiera serię: pierwsza i największa z ofensyw wiosennych, którymi Ludendorff chciał rozstrzygnąć wojnę, zanim na front dotrą Amerykanie.",
        en: "It opens the series: the first and largest of the spring offensives, with which Ludendorff hoped to decide the war before the Americans arrived.",
      },
      "konferencja-w-doullens": {
        pl: "Odpowiedź sprzymierzonych na przełamanie frontu: po raz pierwszy wojska brytyjskie i francuskie we Francji miały nad sobą jednego człowieka. Foch na razie tylko koordynował, nie rozkazywał.",
        en: "The Allied answer to the breakthrough: for the first time the British and French forces in France had one man above them. For now Foch could only coordinate, not issue orders.",
      },
      "bitwy/bitwa-nad-lys-1918": {
        pl: "Druga ofensywa wiosenna, tym razem we Flandrii: Niemcy rozbili Portugalczyków i zdobyli Kemmel, ale znów nie osiągnęli celu, Hazebrouck i portów nad La Manche.",
        en: "The second spring offensive, this time in Flanders: the Germans routed the Portuguese and took Kemmel, but again fell short of their goal, Hazebrouck and the Channel ports.",
      },
      "bitwy/trzecia-bitwa-nad-aisne": {
        pl: "Największe zaskoczenie wiosny i marsz nad Marnę okazały się dla Niemców pułapką: utknęli w trudnym do zaopatrzenia występie i zużyli dywizje przeznaczone do uderzenia we Flandrii.",
        en: "The spring's greatest surprise and the march to the Marne proved a trap for the Germans: they were stuck in a salient hard to supply and used up the divisions meant for Flanders.",
      },
      "bitwy/druga-bitwa-nad-marna": {
        pl: "Punkt zwrotny roku: ostatnia niemiecka ofensywa załamała się, a kontrofensywa Focha była pierwszym wielkim zwycięstwem sprzymierzonych. Ludendorff musiał przejść do obrony.",
        en: "The turning point of the year: the last German offensive collapsed, and Foch's counter-offensive was the first great Allied victory. Ludendorff had to go over to the defensive.",
      },
      "bitwy/bitwa-pod-amiens": {
        pl: "„Czarny dzień armii niemieckiej”: po tym uderzeniu Ludendorff przestał myśleć o ofensywie, a sprzymierzeni zaczęli ofensywę stu dni, w której nie zatrzymali się aż do rozejmu.",
        en: "After this blow Ludendorff concluded that a new offensive was no longer conceivable, and the Allies began the Hundred Days Offensive, in which they did not halt until the armistice.",
      },
      "bitwy/bitwy-o-linie-hindenburga": {
        pl: "Przełamanie najsilniejszej niemieckiej pozycji przesądziło, że wojna skończy się w 1918 roku, a nie w 1919.",
        en: "Breaking the strongest German line settled that the war would end in 1918 and not in 1919.",
      },
      "ludendorff-zada-rozejmu": {
        pl: "Moment, w którym niemieckie naczelne dowództwo samo przyznało, że wojny nie da się prowadzić dalej i Niemcy muszą natychmiast poprosić o rozejm.",
        en: "The moment the German Supreme Army Command itself admitted that the war could no longer be continued and that Germany must immediately ask for an armistice.",
      },
      "rozejm-w-salonikach": {
        pl: "Pierwsze z państw centralnych wychodzi z wojny. Kapitulacja Bułgarii odcięła Imperium Osmańskie od Niemiec i odsłoniła Austro-Węgry.",
        en: "The first of the Central Powers leaves the war, cutting the Ottoman Empire off from Germany and exposing Austria-Hungary.",
      },
      "noty-pokojowe-do-wilsona": {
        pl: "Pierwszy krok do rozejmu: Berlin i Wiedeń proszą Wilsona o rokowania na podstawie czternastu punktów, co otwiera trwającą cały październik wymianę not.",
        en: "The first step towards the armistice: Berlin and Vienna ask Wilson for talks based on the Fourteen Points, opening an exchange of notes that lasted the whole of October.",
      },
      "bitwy/bitwa-pod-vittorio-veneto": {
        pl: "Ostatnia bitwa armii austro-węgierskiej: Austro-Węgry weszły w nią jako jedno państwo, a wyszły z niej jako kilka nowych państw.",
        en: "The last battle of the Austro-Hungarian army: Austria-Hungary entered it as one state and came out of it as several new states.",
      },
      "rozejm-w-mudros": {
        pl: "Turcja jako druga z państw centralnych wychodzi z wojny, a rozejm otwiera drogę do podziału imperium.",
        en: "Turkey becomes the second of the Central Powers to leave the war, and the armistice opens the way to the partition of the empire.",
      },
      "bunt-w-kilonii": {
        pl: "Iskra rewolucji: plan ostatniej bitwy, który miał ocalić honor floty, wywołał bunt marynarzy, a ten doprowadził do rewolucji listopadowej i upadku cesarstwa.",
        en: "The spark of the revolution: a plan for a last battle to save the fleet's honour provoked a sailors' mutiny that led to the November Revolution and the fall of the empire.",
      },
      "rozejm-w-villa-giusti": {
        pl: "Habsburgowie wychodzą z wojny: Austro-Węgry podpisują rozejm jako państwo w stanie rozpadu, a ich armia cofa się w nieładzie.",
        en: "The Habsburgs leave the war: Austria-Hungary signs the armistice as a state in dissolution, its army retreating in disorder.",
      },
      "rewolucja-w-berlinie": {
        pl: "Rewolucja dociera do Berlina i obala cesarstwo: kanclerz ogłasza abdykację cesarza i oddaje władzę Ebertowi, a Scheidemann proklamuje republikę.",
        en: "The revolution reaches Berlin and brings down the empire: the chancellor announces the Kaiser's abdication and hands power to Ebert, and Scheidemann proclaims a republic.",
      },
      "rozejm-w-compiegne": {
        pl: "Ostatni krok: rozejm nie kończył formalnie wojny, ale odbierał Niemcom możliwość jej wznowienia, a 11 listopada stał się dniem pamięci o poległych.",
        en: "The last step: the armistice did not formally end the war, but it deprived Germany of the ability to resume it, and 11 November became a day of remembrance for the fallen.",
      },
    },
  },
]
