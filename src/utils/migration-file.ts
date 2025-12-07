import { WORD_SEPARATOR } from "../config";

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
 * Sort migration file names by attached number/timestamp prefix with hyphen separator in ascending order. 
 * 
 * This is usually used in Array.sort function for migration filenames in this format [timestamp]-[suffix].
 * @example 
 * const filenames = ["345-abs", "012-aaa"]
 * filenames.sort(getSortNumber) // -> ["012-aaa", "345-abs"]
 * @param a first file name eg "345-abs"
 * @param b next file name eg "012-aaa"
 * @returns sort number
 */
export function ascendSortByTimestamp(a: string, b: string) {
  return (
    parseInt(a.split(WORD_SEPARATOR)[0]) - parseInt(b.split(WORD_SEPARATOR)[0])
  );
}
