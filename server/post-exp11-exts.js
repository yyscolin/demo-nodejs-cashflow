const mdb = require('./help-all-mdb')
const getApiRequestId = require('./help-exp11-getApiRequestId')
const getDatabaseIdByName = require('./help-exp11-getDatabaseIdByName')
const fieldValidator = require(`../modules/field-validator`)

module.exports = async function(req, res) {
  try {
    var id = getApiRequestId(req)
    var date = req.body.date
    var tft = req.body.tft
    var acc = req.body.acc
    var amt = req.body.amt
    var remarks = req.body.remarks

    const apiErrors = [
      fieldValidator.validateDate(date),
      fieldValidator.validateAccountId(acc),
      fieldValidator.validateAmount(amt),
    ]
    for (const apiError of apiErrors)
      if (apiError) return res.status(400).send(apiError)

    tft = await getDatabaseIdByName(`tfts`, tft)

    const sqlQuery = `insert into exts (id, date, tft, acc, amt, remarks)
      values (?, ?, ?, ?, ?, ?)
      on duplicate key update date=values(date), tft=values(tft),
      acc=values(acc), amt=values(amt), remarks=values(remarks)`
    await mdb.postQuery(sqlQuery, [id, date, tft, acc, amt, remarks])
    
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send(`Internal server error`)
  }
}