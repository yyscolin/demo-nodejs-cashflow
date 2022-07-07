const mdb = require('./help-all-mdb')
const getDatabaseIdByName = require('./help-exp11-getDatabaseIdByName')
const fieldValidator = require(`../modules/field-validator`)

module.exports = async function(req, res) {
  try {
    var date = req.body.date
    var tft = req.body.tft
    var acc = req.body.acc
    var amt = req.body.amt
    var remarks = req.body.remarks

    const apiErrors = [
      fieldValidator.validateDate(date),
      fieldValidator.validateId(acc),
      fieldValidator.validateAmount(amt),
    ]
    for (const apiError of apiErrors)
      if (apiError) return res.status(400).send(apiError)

    tft = await getDatabaseIdByName(`tfts`, tft)

    if (req.method == `POST`) {
      await mdb.postQuery(
        `insert into exts (date, tft, acc, amt, remarks) values (?, ?, ?, ?, ?)`,
        [date, tft, acc, amt, remarks]
      )
      return res.send()
    }

    const id = req.body.id
    const apiError = fieldValidator.validateId(id)
    if (apiError) return res.status(400).send(apiError)

    await mdb.postQuery(
      `update exts set date=?, tft=?, acc=?, amt=?, remarks=? where id=?`,
      [date, tft, acc, amt, remarks, id]
    )
    
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send(`Internal server error`)
  }
}