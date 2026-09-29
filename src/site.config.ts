// Edit this file to re-label the entire site. Header, Footer, the homepage
// and SEO defaults all read from here instead of hardcoding copy.
export const SITE = {
  name: "TheGreatWar.pl",
  role: "Product design & frontend engineering",
  email: "johndoe@example.com",
  tagline:
    "Wielka Wojna zapisana przez daty, wydarzenia, rozkazy i polityczne decyzje.",
  description:
    "Portfolio of John Doe — product design and frontend engineering, with an emphasis on speed, clarity, and the details most people skip.",
  status: "Projekt w ciągłym przygotowaniu · ETA / Q4 2027",
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
