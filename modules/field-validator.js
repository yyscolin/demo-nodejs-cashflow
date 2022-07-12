const emptyValues = [null, undefined, ``]

function checkAmount(amountName, amountValue) {
  if (emptyValues.includes(amountValue))
    return `${amountName} cannot be empty`

  const isFloat = parseFloat(amountValue) == amountValue
  if (!isFloat)
    return `Invalid ${amountName}`
}

function checkCurrencyCode(fieldName, currencyCode) {
  if (emptyValues.includes(currencyCode))
    return `${fieldName} cannot be empty`

  if (typeof(currencyCode) != `string`)
    return `Invalid ${fieldName}`

  if (!/^[a-zA-Z]{3}$/.test(currencyCode))
    return `${fieldName} must be 3 alphabets long`
}

function checkDate(dateName, dateValue) {
  if (emptyValues.includes(dateValue))
    return `${dateName} cannot be empty`

  dateValue = new Date(dateValue)
  const isValidDate = dateValue instanceof Date && !isNaN(dateValue)
  if (!isValidDate)
    return `Invalid ${dateName}`
}

function checkId(idName, idValue) {
  if (emptyValues.includes(idValue))
    return `${idName} cannot be empty`

  const isInteger = parseInt(idValue) == idValue
  if (!isInteger)
    return `${idName} must be an integer`

  if (idValue < 1)
    return `${idName} cannot be less than 1`
}

function checkString(attrName, attrValue, maxLength) {
  if (emptyValues.includes(attrValue))
    return `${attrName} cannot be empty`

  if (typeof(attrValue) != `string`)
    return `Invalid ${attrName}`

  if (attrValue.length > maxLength)
    return `${attrName} cannot exceed 72 characters long`
}

module.exports = {
  checkAmount,
  checkCurrencyCode,
  checkDate,
  checkId,
  checkString,
}
