import fs from "node:fs"

/*
 * Memvalidasi registry.json di CI, sebelum PR bisa di-merge.
 *
 * Ada di sini dan bukan hanya di sisi Titah karena keduanya melindungi hal yang
 * berbeda: Titah membuang entri rusak supaya picker tetap jalan untuk semua
 * orang, dan skrip ini menolak entri rusak supaya tidak pernah sampai ke sana.
 * Tanpa yang kedua, satu PR yang salah tulis diam-diam menghilangkan satu
 * extension dari picker — dan tidak ada yang tahu sampai penulisnya bertanya.
 */

const registry = JSON.parse(fs.readFileSync("registry.json", "utf8"))
const problems = []

if (registry.version !== 1) problems.push('top-level "version" must be 1')
if (!Array.isArray(registry.extension)) problems.push('"extension" must be an array')

const ids = new Set()
const packages = new Set()

for (const [index, entry] of (registry.extension ?? []).entries()) {
  const at = (field) => `extension[${index}] (${entry?.id ?? "no id"}): ${field}`

  for (const field of ["id", "package", "version"]) {
    if (typeof entry?.[field] !== "string" || entry[field].trim() === "") {
      problems.push(at(`"${field}" is required and must be a non-empty string`))
    }
  }

  // Versi PERSIS, bukan rentang. Alasannya sama dengan MarketEntry di Titah:
  // `market:git` di dua mesin harus berarti kode yang sama, dan "^1.0.0" tidak
  // bisa memberi jaminan itu.
  if (typeof entry?.version === "string" && !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(entry.version)) {
    problems.push(at(`"version" must be an exact version, not a range (got "${entry.version}")`))
  }

  if (typeof entry?.id === "string" && !/^[a-z0-9][a-z0-9-]*$/.test(entry.id)) {
    problems.push(at('"id" must be lowercase letters, digits, and dashes'))
  }

  if (ids.has(entry?.id)) problems.push(at('duplicate "id"'))
  ids.add(entry?.id)

  // Dua entri yang menunjuk paket yang sama membuat picker menampilkan satu
  // extension dua kali, dan `I` pada keduanya melakukan hal yang sama.
  if (packages.has(entry?.package)) problems.push(at('duplicate "package"'))
  packages.add(entry?.package)
}

if (problems.length > 0) {
  console.error("registry.json is not valid:\n")
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

console.log(`registry.json ok — ${registry.extension.length} extension(s)`)
