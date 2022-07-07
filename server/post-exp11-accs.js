const handleError = require('./help-all-handleError')
const mdb = require('./help-all-mdb')
const getApiRequestId = require('./help-exp11-getApiRequestId')
const fieldValidator = require(`../modules/field-validator`)

module.exports = async function(req, res) {
  try {
    const accountId = getApiRequestId(req)
    const {name: accountName, currency: accountCurrency} = req.body
    fieldValidator.validateAccountName(accountName)
    fieldValidator.validateCurrencyCode(accountCurrency)

    await mdb.postQuery(
      `insert into accs (id, name, currency) values (?, ?, ?)
        on duplicate key update name=values(name), currency=values(currency)`,
      [accountId, accountName, accountCurrency.toUpperCase()]
    )

    res.send()
  } catch(err) {
    handleError(res, err)
  }
}