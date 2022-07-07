const con = require('./help-all-mdb')
const fieldValidator = require(`../modules/field-validator`)

module.exports = async function(req, res) {
  try {
    var name = req.body.name
    let apiError = fieldValidator.validateAccountName(name)
    if (apiError) return res.status(400).send(apiError)

    if (req.method == `POST`) {
      await con.postQuery(
        `insert into itms (name, cat) values (?, ?)`,
        [name, cat]
      )
      return res.send()
    }

    const id = req.body.id
    apiError = fieldValidator.validateId(id)
    if (apiError) return res.status(400).send(apiError)
    await con.postQuery(
      `update itms set name=?, cat=? where id=?`,
      [name, cat, id]
    )

    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send(`Internal server error`)
  }
}