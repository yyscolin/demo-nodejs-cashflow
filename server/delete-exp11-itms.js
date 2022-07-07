const mdb = require('./help-all-mdb')

module.exports = async function(req, res) {
  try {
    const {id: purchaseCategoryId} = req.body
    await mdb.postQuery(`DELETE FROM itms WHERE id=?`, [purchaseCategoryId])
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send(`Internal server error`)
  }
}