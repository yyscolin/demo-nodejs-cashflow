const emptyValues = [null, undefined, ``]

function validateAccountId(accountId) {
  if (emptyValues.includes(accountId))
    return `Account ID cannot be empty`

  const isInteger = parseInt(accountId) == accountId
  if (!isInteger || accountId < 1)
    return `Invalid Account ID`
}

function validateAccountName(accountName) {
  if (emptyValues.includes(accountName))
    return `Account name cannot be empty`

  if (typeof(accountName) != `string`)
    return `Invalid account name`

  if (!/^[a-zA-Z0-9_\-]*$/.test(accountName)) return
    `Account name can only contain alphanumeric and hyphens and underscores`

  if (accountName.length > 48)
    return `Account name cannot exceed 48 characters long`
}

function validateAmount(amount) {
  if (emptyValues.includes(amount))
    return `Amount cannot be empty`

  const isFloat = parseFloat(amount) == amount
  if (!isFloat)
    return `Invalid amount`
}

function validateCurrencyCode(currencyCode) {
  if (emptyValues.includes(currencyCode))
    return `Currency cannot be empty`

  if (typeof(currencyCode) != `string`)
    return `Invalid currency`

  if (!/^[a-zA-Z]{3}$/.test(currencyCode))
    return `Currency must be 3 alphabets long`
}

function validateDate(date) {
  if (emptyValues.includes(date))
    return `Date cannot be empty`

  date = new Date(date)
  const isValidDate = date instanceof Date && !isNaN(date)
  if (!isValidDate)
    return `Invalid date`
}

module.exports = {
  validateAccountId,
  validateAccountName,
  validateAmount,
  validateCurrencyCode,
  validateDate,
}
