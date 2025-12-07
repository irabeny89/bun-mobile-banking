import { WORD_SEPARATOR } from "@/config";

/**
 * Transform string to a suitable name for files by trimming and swapping space between letters with hyphen.
 * @example "abc def" -> "abc-def"
 * @param suffix string to transform
 * @returns transformed string
 */
export function renameFile(suffix: string) {
  return suffix.trim().replace(/\s+/g, () => WORD_SEPARATOR);
}

/**
 * Sort migration file names with number/timestamp prefix with hyphen separator in ascending order. This is usually used in Array.sort function.
 * @example filenames.sort(getSortNumber) // sorts in ascending order
 * @param a first file name
 * @param b next file name
 * @returns sort number
 */
export function ascendSort(a: string, b: string) {
  return (
    parseInt(a.split(WORD_SEPARATOR)[0]) - parseInt(b.split(WORD_SEPARATOR)[0])
  );
}
