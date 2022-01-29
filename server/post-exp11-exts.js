const handleError = require('./help-all-handleError')
const mdb = require('./help-all-mdb')
const getApiRequestId = require('./help-exp11-getApiRequestId')
const getDatabaseIdByName = require('./help-exp11-getDatabaseIdByName')
const validateAccount = require('./help-exp11-validateAccount')
const validateAmount = require('./help-exp11-validateAmount')
const validateDate = require('./help-exp11-validateDate')
const validateString = require('./help-exp11-validateString')

module.exports = async function(req, res) {
  try {
    var id = getApiRequestId(req)
    var date = req.body.date
    var tft = req.body.tft
    var acc = req.body.acc
    var amt = req.body.amt
    var remarks = req.body.remarks
    validateDate(date)
    validateString(tft, 'Item')
    validateAccount(acc)
    validateAmount(amt)

    if (remarks) {
      validateString(remarks, 'Remarks')
      remarks = `"${remarks}"`
    } else
      remarks = 'NULL'

    tft = await getDatabaseIdByName('exp11', 'tfts', tft)

    var query = `insert into exts (id, date, tft, acc, amt, remarks) values (${id}, "${date}", ${tft}, ${acc}, ${amt}, ${remarks})
      on duplicate key update date=values(date), tft=values(tft), acc=values(acc), amt=values(amt), remarks=values(remarks)`
    await mdb.postQuery(query)
    
    res.send()
  } catch(err) {
    handleError(res, err)
  }
}