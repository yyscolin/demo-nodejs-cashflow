const emptyValues = [null, undefined, ``]

function validateAccountId(accountId) {
  if (emptyValues.includes(accountId))
    throw new Error(`400::Account ID cannot be empty`)

  const isInteger = parseInt(accountId) == accountId
  if (!isInteger || accountId < 1)
    throw new Error(`400::Invalid Account ID`)
}

function validateAccountName(accountName) {
  if (emptyValues.includes(accountName))
    throw new Error(`400::Account name cannot be empty`)

  if (typeof(accountName) != `string`)
    throw new Error(`400::Invalid account name`)

  if (!/^[a-zA-Z0-9_\-]*$/.test(accountName)) throw new Error(
    `400::Account name can only contain alphanumeric and hyphens and underscores`
  )

  if (accountName.length > 48)
    throw new Error(`400::Account name cannot exceed 48 characters long`)
}

function validateAmount(amount) {
  if (emptyValues.includes(amount))
    throw new Error(`400::Amount cannot be empty`)

  const isFloat = parseFloat(amount) == amount
  if (!isFloat)
    throw new Error(`400::Invalid amount`)
}

function validateCurrencyCode(currencyCode) {
  if (emptyValues.includes(currencyCode))
    throw new Error(`400::Currency cannot be empty`)

  if (typeof(currencyCode) != `string`)
    throw new Error(`400::Invalid currency`)

  if (!/^[a-zA-Z]{3}$/.test(currencyCode))
    throw new Error(`400::Currency must be 3 alphabets long`)
}

function validateDate(date) {
  if (emptyValues.includes(date))
    throw new Error(`400::Date cannot be empty`)

  date = new Date(date)
  const isValidDate = date instanceof Date && !isNaN(date)
  if (!isValidDate)
    throw new Error(`400::Invalid date`)
}

module.exports = {
  validateAccountId,
  validateAccountName,
  validateAmount,
  validateCurrencyCode,
  validateDate,
}
