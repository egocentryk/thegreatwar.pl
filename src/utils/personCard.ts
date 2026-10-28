import type { APIRoute } from "astro"
import { getImage } from "astro:assets"
import type { Lang } from "@/i18n"
import { localPeople, type LocalPerson } from "@/i18n/local"
import { lifeYears } from "@/utils/people"

// One person as a homepage card (RandomPeople.astro). Like the battle cards,
// the shuffle pool is a separate static file (/postacie.json,
// /en/people.json), cached by the browser. Only people with a portrait.
export interface PersonCard {
  href: string
  name: string
  years: string
  role: string
  country: string
  photo: string
}

export async function toPersonCard(person: LocalPerson): Promise<PersonCard | undefined> {
  const d = person.source.data
  if (!d.photo) return undefined
  const photo = await getImage({ src: d.photo.src, width: 300, height: 400, fit: "cover", position: "top" })
  return {
    href: person.href,
    name: person.data.name,
    years: lifeYears(person.source),
    role: person.data.role,
    country: person.data.country,
    photo: photo.src,
  }
}

export async function localPersonCards(lang: Lang) {
  const people = await localPeople(lang)
  return (await Promise.all(people.map((person) => toPersonCard(person)))).filter(
    (card): card is PersonCard => card !== undefined,
  )
}

export const personCards =
  (lang: Lang): APIRoute =>
  async () =>
    new Response(JSON.stringify(await localPersonCards(lang)), {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    })
