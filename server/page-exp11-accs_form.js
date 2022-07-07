const mdb = require('./help-all-mdb')
const handleError = require('./help-all-handleError.js')

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
      if (!isInteger) throw new Error('400::Page not found')

      pageContext.accountInfo = await mdb.get(
        `select id, name, currency from accs where id=?`,
        [accountId]
      )
      if (!pageContext.accountInfo) throw new Error('400::Page not found')

      pageContext.apiMethod = `PUT`
      pageContext.pageTitle = `Account Alteration Form`
    }

    res.render('accs_form', pageContext)
  } catch(err) {
    handleError(res, err)
  }
}