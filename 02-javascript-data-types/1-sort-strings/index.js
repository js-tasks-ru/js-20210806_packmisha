/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  let newArr = arr.slice();

  return newArr.sort((a, b) =>
    (param === "asc" ? a : b).localeCompare(
      param === "asc" ? b : a,
      ["ru", "en"],
      { caseFirst: "upper" }
    )
  );
}