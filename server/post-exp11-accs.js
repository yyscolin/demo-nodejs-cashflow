const handleError = require('./help-all-handleError')
const mdb = require('./help-all-mdb')
const getApiRequestId = require('./help-exp11-getApiRequestId')
const validateCurrency = require('./help-exp11-validateCurrency')
const validateName = require('./help-exp11-validateName')

module.exports = async function(req, res) {
  try {
    const accountId = getApiRequestId(req)
    const {name: accountName, currency: accountCurrency} = req.body
    validateName(accountName)
    validateCurrency(accountCurrency)

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