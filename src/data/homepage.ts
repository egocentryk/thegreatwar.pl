// Hand-picked content for the homepage sections. Every slug is checked at
// build time: a typo or a renamed article fails the build instead of
// silently dropping a card.

// "Lata wojny": one card per year.
export const WAR_YEARS = [
  {
    year: 1914,
    summary:
      "Zamach w Sarajewie i lawina wypowiedzeń wojny. Wojna ruchowa kończy się nad Marną, a do grudnia front zachodni zamiera w okopach.",
    highlights: [
      "arcyksiaze-franciszek-ferdynand-zamordowany-w-sarajewie",
      "poczatek-bitwy-nad-marna",
      "poczatek-pierwszej-bitwy-pod-ypres",
    ],
  },
  {
    year: 1915,
    summary:
      "Gaz pod Ypres, lądowanie na Gallipoli i przełom pod Gorlicami. Rosjanie tracą Królestwo Polskie, do wojny wchodzą Włochy i Bułgaria.",
    highlights: [
      "alianci-laduja-na-gallipoli",
      "poczatek-bitwy-pod-gorlicami",
      "niemcy-zajmuja-warszawe",
    ],
  },
  {
    year: 1916,
    summary:
      "Rok wielkich bitew materiałowych: Verdun, Somma, Jutlandia i ofensywa Brusiłowa. Akt 5 listopada otwiera sprawę polską.",
    highlights: [
      "poczatek-bitwy-pod-verdun",
      "pierwszy-dzien-bitwy-nad-somma",
      "akt-5-listopada",
    ],
  },
  {
    year: 1917,
    summary:
      "Dwie rewolucje w Rosji, Stany Zjednoczone wchodzą do wojny. Błoto Passchendaele, klęska pod Caporetto i rozejm na wschodzie.",
    highlights: [
      "rewolucja-lutowa",
      "usa-wypowiadaja-wojne-niemcom",
      "rewolucja-pazdziernikowa",
    ],
  },
  {
    year: 1918,
    summary:
      "Brześć, ostatnia wielka ofensywa Niemiec i sto dni aliantów. Imperia się rozpadają, 11 listopada milkną działa, a Polska odzyskuje niepodległość.",
    highlights: [
      "poczatek-operacji-michael",
      "rozejm-w-compiegne",
      "odzyskanie-niepodleglosci-przez-polske",
    ],
  },
] as const

// "Kamienie milowe": the turning points, in date order.
export const TURNING_POINTS = [
  "arcyksiaze-franciszek-ferdynand-zamordowany-w-sarajewie",
  "austro-wegry-wypowiadaja-wojne-serbii",
  "poczatek-bitwy-nad-marna",
  "alianci-laduja-na-gallipoli",
  "poczatek-bitwy-pod-gorlicami",
  "zatopienie-lusitanii",
  "poczatek-bitwy-pod-verdun",
  "poczatek-bitwy-jutlandzkiej",
  "poczatek-ofensywy-brusilowa",
  "pierwszy-dzien-bitwy-nad-somma",
  "abdykacja-mikolaja-ii",
  "usa-wypowiadaja-wojne-niemcom",
  "poczatek-bitwy-pod-caporetto",
  "rewolucja-pazdziernikowa",
  "traktat-brzeski",
  "poczatek-operacji-michael",
  "poczatek-bitwy-pod-amiens",
  "rozejm-w-compiegne",
] as const

// "Od czego zacząć": a reading path for a first visit.
export const READING_PATH = [
  {
    collection: "timeline",
    slug: "arcyksiaze-franciszek-ferdynand-zamordowany-w-sarajewie",
    note: "Strzały, od których wszystko się zaczęło.",
  },
  {
    collection: "battles",
    slug: "pierwsza-bitwa-nad-marna",
    note: "Bitwa, która przekreśliła niemiecki plan szybkiego zwycięstwa.",
  },
  {
    collection: "battles",
    slug: "ladowanie-na-gallipoli",
    note: "Desant, który miał otworzyć drogę na Konstantynopol.",
  },
  {
    collection: "battles",
    slug: "bitwa-pod-verdun",
    note: "Dziesięć miesięcy wykrwawiania na jednym skrawku ziemi.",
  },
  {
    collection: "battles",
    slug: "bitwa-nad-somma",
    note: "Najkrwawszy dzień w dziejach armii brytyjskiej i jego skutki.",
  },
  {
    collection: "timeline",
    slug: "rewolucja-pazdziernikowa",
    note: "Bolszewicy przejmują władzę, a Rosja wychodzi z wojny.",
  },
  {
    collection: "timeline",
    slug: "rozejm-w-compiegne",
    note: "Wagon w lesie pod Compiègne i koniec walk na zachodzie.",
  },
  {
    collection: "timeline",
    slug: "odzyskanie-niepodleglosci-przez-polske",
    note: "11 listopada 1918 roku w Warszawie.",
  },
] as const

// "Fronty": one line per theatre, in the order the cards are shown.
export const FRONT_NOTES: Record<string, string> = {
  "Front zachodni":
    "Od kanału La Manche po Szwajcarię: Marna, Ypres, Verdun, Somma i sto dni 1918 roku.",
  "Front wschodni":
    "Od Prus Wschodnich po Karpaty, w dużej części na ziemiach polskich: Tannenberg, Gorlice, Brusiłow, Brześć.",
  "Front bałkański":
    "Serbia, Saloniki i Macedonia: od pierwszych strzałów nad Dunajem po rozejm z Bułgarią.",
  "Front włoski":
    "Bitwy nad Isonzo, klęska pod Caporetto, obrona Piawy i Vittorio Veneto.",
  "Bliski Wschód":
    "Gallipoli, Mezopotamia, Kaukaz, Palestyna i Syria: koniec Imperium Osmańskiego.",
  "Wojna na morzu":
    "Blokada, okręty podwodne i Jutlandia: wojna o szlaki morskie.",
  Afryka:
    "Togo, Kamerun, Afryka Południowo-Zachodnia i niepokonany Lettow-Vorbeck.",
  "Azja i Pacyfik":
    "Tsingtao, wyspy Pacyfiku i rajdy niemieckich krążowników.",
}

// "Polska w Wielkiej Wojnie": the Polish thread, in date order.
export const POLISH_THREAD = [
  "odezwa-wielkiego-ksiecia-mikolaja-do-polakow",
  "poczatek-bitwy-pod-gorlicami",
  "niemcy-zajmuja-warszawe",
  "akt-5-listopada",
  "aresztowanie-pilsudskiego",
  "bitwa-pod-rarancza",
  "walki-pod-kaniowem",
  "wyzwolenie-krakowa",
  "poczatek-walk-o-lwow",
  "odzyskanie-niepodleglosci-przez-polske",
  "wybuch-powstania-wielkopolskiego",
] as const
