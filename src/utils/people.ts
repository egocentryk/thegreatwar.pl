import { getCollection, type CollectionEntry } from "astro:content"

export type Person = CollectionEntry<"people">

export async function getPeople() {
  return getCollection("people", ({ data }) => !data.draft)
}

// Commander name as written in a battle's `sides` -> person page, if any.
export function personByName(people: Person[], name: string) {
  const wanted = name.trim().toLowerCase()
  return people.find(
    (person) =>
      person.data.name.toLowerCase() === wanted ||
      person.data.aliases.some((alias) => alias.toLowerCase() === wanted),
  )
}

// "1852–1931"
export function lifeYears(person: Person) {
  return `${person.data.born.getUTCFullYear()}–${person.data.died.getUTCFullYear()}`
}
