const mdb = require('./help-all-mdb')

module.exports = async function(req, res) {
  try {
    const pageContext = {
      apiMethod: `POST`,
      accountInfo: {},
      pageTitle: `Account Entry Form`,
    }

    const {id: accountId} = req.params
    if (accountId != undefined) {
      const isInteger = accountId == parseInt(accountId)
      if (!isInteger)
        return res.status(404).send(`Page not found`)

      pageContext.accountInfo = await mdb.get(
        `select id, name, currency from accs where id=?`,
        [accountId]
      )
      if (!pageContext.accountInfo)
        return res.status(404).send(`Page not found`)

      pageContext.apiMethod = `PUT`
      pageContext.pageTitle = `Account Alteration Form`
    }

    res.render('accs_form', pageContext)
  } catch(err) {
    console.error(err)
    res.status(500).send(`Internal server error`)
  }
}