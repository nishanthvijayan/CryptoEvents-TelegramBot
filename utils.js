function isNonEmptyArray(arr) {
  return arr && Array.isArray(arr) && arr.length > 0;
}

function isEmptyArray(arr) {
  return !isNonEmptyArray(arr);
}

module.exports = { isNonEmptyArray, isEmptyArray };
