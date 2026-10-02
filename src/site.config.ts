// Edit this file to re-label the entire site. Header, Footer, the homepage
// and SEO defaults all read from here instead of hardcoding copy.
export const SITE = {
  name: "TheGreatWar.pl",
  role: "Product design & frontend engineering",
  email: "timelineof@thegreatwar.pl",
  tagline:
    "Wielka Wojna zapisana przez daty, wydarzenia, rozkazy i polityczne decyzje.",
  description:
    "Polska kronika I wojny światowej. Wydarzenia z lat 1914–1918 dzień po dniu: bitwy, decyzje polityczne, rozkazy i losy ludzi.",
  status: "Projekt w ciągłym przygotowaniu · ETA / Q4 2027",
  // Default social preview (public/og-image.png), used when a page sets no image.
  ogImage: "/og-image.png",
  social: [
    { label: "GitHub", href: "https://github.com/your-username" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/your-username" },
    { label: "X", href: "https://x.com/your-username" },
  ],
  locale: "pl",
} as const

export const NAV_LINKS = [
  { label: "Oś czasu", href: "/timeline" },
  { label: "Bitwy", href: "/bitwy" },
  { label: "O Projekcie", href: "/about" },
] as const
