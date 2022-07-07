const mdb = require('./help-all-mdb')
const fieldValidator = require(`../modules/field-validator`)

module.exports = async function(req, res) {
  try {
    const accountName = req.body.name
    const accountCurrency = req.body.currency.toUpperCase()
    const apiErrors = [
      fieldValidator.validateAccountName(accountName),
      fieldValidator.validateCurrencyCode(accountCurrency),
    ]
    for (const apiError of apiErrors)
      if (apiError) return res.status(400).send(apiError)

    if (req.method == `POST`) {
      await mdb.postQuery(
        `insert into accs (name, currency) values (?, ?)`,
        [accountName, accountCurrency]
      )
      return res.send()
    }

    const accountId = req.body.id
    const apiError = validateId(accountId)
    if (apiError) return res.status(400).send(apiError)

    await mdb.postQuery(
      `update accs set name=?, currency=? where id=?`,
      [accountName, accountCurrency, accountId]
    )

    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send(`Internal server error`)
  }
}