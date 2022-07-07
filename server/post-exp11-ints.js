const con = require('./help-all-mdb')
const fieldValidator = require(`../modules/field-validator`)

module.exports = async function(req, res) {
  try {
    var date = req.body.date
    var sr_acc = req.body.sr_acc
    var sr_amt = req.body.sr_amt
    var de_acc = req.body.de_acc
    var de_amt = req.body.de_amt

    const apiErrors = [
      fieldValidator.validateDate(date),
      fieldValidator.validateId(sr_acc),
      fieldValidator.validateId(de_acc),
      fieldValidator.validateAmount(sr_amt),
      fieldValidator.validateAmount(de_amt),
    ]
    for (const apiError of apiErrors)
      if (apiError) return res.status(400).send(apiError)

    if (req.method == `POST`) {
      await con.postQuery(
        `insert into ints (date, sr_acc, sr_amt, de_acc, de_amt) values (?, ?, ?, ?, ?)`,
        [date, sr_acc, sr_amt, de_acc, de_amt]
      )
      return res.send()
    }

    const id = req.body.id
    const apiError = fieldValidator.validateId(id)
    if (apiError) return res.status(400).send(apiError)

    await con.postQuery(
      `update ints date=?, sr_acc=?, sr_amt=?, de_acc=?, de_amt=? where id=?`,
      [date, sr_acc, sr_amt, de_acc, de_amt, id]
    )
    
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send(`Internal server error`)
  }
}