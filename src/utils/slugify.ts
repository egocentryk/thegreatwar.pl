// Letters that Unicode normalization does not split into base letter + accent.
const specialLetters: Record<string, string> = { ł: "l", đ: "d", ß: "ss" }

// "Austro-Węgry" -> "austro-wegry", "zamach w Sarajewie" -> "zamach-w-sarajewie"
export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[łđß]/g, (letter) => specialLetters[letter])
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}
