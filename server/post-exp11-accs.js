const handleError = require('./help-all-handleError')
const mdb = require('./help-all-mdb')
const getApiRequestId = require('./help-exp11-getApiRequestId')
const validateCurrency = require('./help-exp11-validateCurrency')
const validateName = require('./help-exp11-validateName')

module.exports = async function(req, res) {
  try {
    var id = getApiRequestId(req)
    var name = req.body.name
    var currency = req.body.currency
    validateName(name)
    validateCurrency(currency)

    var query = `insert into exp11.accs (id, name, currency) values (${id}, "${name}", "${currency.toUpperCase()}")
      on duplicate key update name=values(name), currency=values(currency)`
    await mdb.postQuery(query)
    
    res.send()
  } catch(err) {
    handleError(res, err)
  }
}