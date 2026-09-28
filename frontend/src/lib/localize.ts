/** Picks the English field when the UI is in English and a translation
 * exists, otherwise falls back to the Chinese source text. Product data
 * is only ever translated one-way (zh -> en) by the import pipeline. */
export function localize(
  lang: string,
  zh: string,
  en: string | null | undefined,
): string {
  return lang === "en" && en ? en : zh;
}
