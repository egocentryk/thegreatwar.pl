// Reading progress, kept only in this browser (localStorage): nothing is sent
// anywhere. Off until the reader turns it on (ReadingProgress.astro); with
// storage blocked (private mode, full quota) every call quietly does nothing.
//
// One record for both languages: articles are stored under their Polish id,
// which the English lists and pages carry too (data-read-id).

const KEY = "tgw:reading"
const VERSION = 1

type Store = {
  v: number
  // true: on; false: the reader said no; missing: not asked yet.
  on?: boolean
  // Article id → day it was read (days since 1970-01-01, to keep it small).
  read: Record<string, number>
}

const empty = (): Store => ({ v: VERSION, read: {} })

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty()
    const data = JSON.parse(raw)
    if (data?.v !== VERSION || typeof data.read !== "object" || !data.read) return empty()
    return data as Store
  } catch {
    return empty()
  }
}

function save(store: Store): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
    return true
  } catch {
    return false
  }
}

// Whether the browser lets us store anything at all.
export function available(): boolean {
  try {
    const probe = `${KEY}:probe`
    localStorage.setItem(probe, "1")
    localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

export const status = (): "on" | "off" | "unasked" => {
  const { on } = load()
  return on === true ? "on" : on === false ? "off" : "unasked"
}

export function setOn(on: boolean) {
  const store = load()
  // Turning it off keeps nothing: the list is deleted with it.
  save(on ? { ...store, on } : { ...empty(), on })
}

export const readIds = (): Set<string> => {
  const store = load()
  return new Set(store.on ? Object.keys(store.read) : [])
}

export function readOn(id: string): Date | undefined {
  const store = load()
  const day = store.on ? store.read[id] : undefined
  return day === undefined ? undefined : new Date(day * 86_400_000)
}

export function mark(id: string, read: boolean) {
  const store = load()
  if (!store.on) return
  if (read) store.read[id] ??= Math.floor(Date.now() / 86_400_000)
  else delete store.read[id]
  save(store)
}

// Deletes the list but keeps the setting.
export function clearRead() {
  const store = load()
  save({ ...empty(), on: store.on })
}

// Other tabs: the "storage" event fires there after every change.
export function onChange(callback: () => void) {
  window.addEventListener("storage", (event) => {
    if (event.key === KEY || event.key === null) callback()
  })
}
