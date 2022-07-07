const mdb = require('./help-all-mdb')
const handleError = require('./help-all-handleError.js')

module.exports = async function(req, res) {
  try {
    const {id: purchaseCategoryId} = req.body

    await mdb.postQuery(
      `DELETE FROM itms WHERE id=?`,
      [purchaseCategoryId]
    )

    res.send()
  } catch(err) {
    handleError(res, err)
  }
}