// Shared helpers for the Wikimedia Commons scripts (article-images.mjs,
// person-photos.mjs).

export const UNKNOWN = "autor nieznany / unknown author"

// Commons' author field is free text: licence notices, uploader notes,
// doubled names, links and HTML entities end up in it. Keep a readable name,
// or "unknown author".
export function cleanAuthor(raw = "") {
  let a = raw
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim()
  a = a.replace(/^File:.*?:\s*(PK-Aufnahme:\s*)?(Kriegsberichter\s+)?/i, "") // "File:Bundesarchiv …: PK-Aufnahme: Kriegsberichter X"
  a = a.replace(/^[^:]*\.(png|jpe?g|svg):.*?derivative work:\s*/i, "") // "Map.png: X derivative work: Y"
  a = a.replace(/\(?\s*talk( · contribs)?\s*\)?|- contribs/gi, "")
  a = a.replace(/\s*\(?https?:\/\/\S+\)?/g, "").replace(/\s*\[\d+\]/g, "")
  a = a.replace(/\s*\((Photo identification number[^)]*)\)/i, "")
  a = a.replace(/\s+-\s+Author wrote the Story.*$/i, "") // a book's author noting he didn't take the photos
  if (/^This work was published on territory of/i.test(a)) return UNKNOWN // a copyright notice, not a name
  a = a.replace(/^(.{4,})\1$/, "$1") // "UnknownUnknown" (the whole field twice)
  a = a.replace(/^(anonymous|unknown|nieznany|unknown-anonymous|\(unknown\)|unknown (author|photographer)|unknown \/ not disclosed|не указан)\s*(autor nieznany \/ unknown author)?\.?$/i, UNKNOWN)
  if (/^the original uploader was /i.test(a)) return UNKNOWN // the uploader, not the author
  a = a.replace(/^anonymous\s*autor nieznany \/ unknown author/i, UNKNOWN)
  a = a.replace(/\s*(\d{4} )?seems unlikely$/i, "").replace(/\s+,/g, ",").replace(/[\s,.;:-]+$/, "").trim()
  if (!a || /this tag does not indicate|^note:|^not specified|^none given|^unknown author or not provided$|^ARC Identifier/i.test(a)) return UNKNOWN
  if (/^autor nieznany \/ unknown author/i.test(a) && a.length > UNKNOWN.length + 2) return a
  return a.length > 110 ? a.slice(0, 110).replace(/\s+\S*$/, "") + "…" : a
}

