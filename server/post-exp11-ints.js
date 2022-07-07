const con = require('./help-all-mdb')
const getApiRequestId = require('./help-exp11-getApiRequestId')
const fieldValidator = require(`../modules/field-validator`)

module.exports = async function(req, res) {
  try {
    var id = getApiRequestId(req)
    var date = req.body.date
    var sr_acc = req.body.sr_acc
    var sr_amt = req.body.sr_amt
    var de_acc = req.body.de_acc
    var de_amt = req.body.de_amt

    const apiErrors = [
      fieldValidator.validateDate(date),
      fieldValidator.validateAccountId(sr_acc),
      fieldValidator.validateAccountId(de_acc),
      fieldValidator.validateAmount(sr_amt),
      fieldValidator.validateAmount(de_amt),
    ]
    for (const apiError of apiErrors)
      if (apiError) return res.status(400).send(apiError)

    var query = `insert into ints (id, date, sr_acc, sr_amt, de_acc, de_amt) values (${id}, "${date}", ${sr_acc}, ${sr_amt}, ${de_acc}, ${de_amt})
      on duplicate key update date=values(date), sr_acc=values(sr_acc), sr_amt=values(sr_amt), de_acc=values(de_acc), de_amt=values(de_amt)`
    await con.postQuery(query)
    
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send(`Internal server error`)
  }
}