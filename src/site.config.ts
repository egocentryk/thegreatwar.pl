// Edit this file to re-label the entire site. Header, Footer, the homepage
// and SEO defaults all read from here instead of hardcoding copy.
export const SITE = {
  name: "TheGreatWar.pl",
  role: "Product design & frontend engineering",
  email: "timelineof@thegreatwar.pl",
  // The only way to support the site (CoffeeButton, SupportCard, header).
  support: "https://buymeacoffee.com/thegreatwar",
  tagline:
    "Wielka Wojna zapisana przez daty, wydarzenia, rozkazy i polityczne decyzje.",
  description:
    "Polska kronika I wojny światowej. Wydarzenia z lat 1914–1918 dzień po dniu: bitwy, decyzje polityczne, rozkazy i losy ludzi.",
  status: "Kompletna kronika Wielkiej Wojny · 1914-1918",
  // English edition.
  taglineEn:
    "The Great War told through dates, events, orders and political decisions.",
  descriptionEn:
    "A Polish chronicle of the First World War, in English. The events of 1914–1918 day by day: battles, political decisions, orders and the fates of people.",
  statusEn: "The complete chronicle of the Great War · 1914-1918",
  // Default social preview (public/og-image.png), used when a page sets no image.
  ogImage: "/og-image.png",
  // Footer links (sister sites).
  footerLinks: [{ label: "The Second War", href: "https://thesecondwar.pl" }],
  locale: "pl",
} as const

export const NAV_LINKS = [
  { label: "Oś czasu", href: "/timeline" },
  { label: "Bitwy", href: "/bitwy" },
  { label: "Postacie", href: "/postacie" },
] as const

export const NAV_LINKS_EN = [
  { label: "Timeline", href: "/en/timeline" },
  { label: "Battles", href: "/en/battles" },
  { label: "People", href: "/en/people" },
] as const

// The reference sections, under one "Przewodnik" menu item (a dropdown on
// desktop, a sub-list in the mobile menu). `more` is the smaller row below.
export const GUIDE = {
  label: "Przewodnik",
  items: [
    { label: "Tematy", href: "/tematy", note: "Najważniejsze pytania o wojnę" },
    { label: "Kraje", href: "/kraje", note: "Państwa walczące i neutralne" },
    { label: "Miejsca", href: "/miejsca", note: "Miasta, twierdze, rzeki, wyspy" },
    { label: "Siły zbrojne", href: "/sily-zbrojne", note: "Armie, floty i lotnictwo" },
    { label: "Serie", href: "/serie", note: "Wybrane wątki, tekst po tekście" },
    { label: "Słownik", href: "/slownik", note: "Pojęcia, skróty i nazwy" },
  ],
  more: [
    { label: "Najważniejsze daty", href: "/najwazniejsze-daty" },
    { label: "Wojna w liczbach", href: "/wojna-w-liczbach" },
    { label: "Głosy z frontu", href: "/glosy" },
  ],
} as const

export const GUIDE_EN = {
  label: "Guide",
  items: [
    { label: "Topics", href: "/en/topics", note: "The key questions about the war" },
    { label: "Countries", href: "/en/countries", note: "The warring and neutral states" },
    { label: "Places", href: "/en/places", note: "Cities, fortresses, rivers, islands" },
    { label: "Armed forces", href: "/en/armed-forces", note: "Armies, fleets and air services" },
    { label: "Series", href: "/en/series", note: "Selected threads, article by article" },
    { label: "Glossary", href: "/en/glossary", note: "Terms, abbreviations and names" },
  ],
  more: [
    { label: "Key dates", href: "/en/key-dates" },
    { label: "The war in numbers", href: "/en/war-in-numbers" },
    { label: "Voices from the front", href: "/en/voices" },
  ],
} as const
