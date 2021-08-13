/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  const newArr = [...arr];
  let dir = param == "desc" ? -1 : 1;

  newArr.sort(
    (a, b) =>
      dir *
      a.localeCompare(b, ["ru", "en"], {
        caseFirst: "upper",
      })
  );

  return newArr;
}
