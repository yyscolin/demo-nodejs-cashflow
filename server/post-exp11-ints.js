const handleError = require('./help-all-handleError')
const con = require('./help-all-mdb')
const getApiRequestId = require('./help-exp11-getApiRequestId')
const validateDate = require('./help-exp11-validateDate')
const validateAccount = require('./help-exp11-validateAccount')
const validateAmount = require('./help-exp11-validateAmount')

module.exports = async function(req, res) {
  try {
    var id = getApiRequestId(req)
    var date = req.body.date
    var sr_acc = req.body.sr_acc
    var sr_amt = req.body.sr_amt
    var de_acc = req.body.de_acc
    var de_amt = req.body.de_amt
    validateDate(date)
    validateAccount(sr_acc)
    validateAccount(de_acc)
    validateAmount(sr_amt)
    validateAmount(de_amt)

    var query = `insert into ints (id, date, sr_acc, sr_amt, de_acc, de_amt) values (${id}, "${date}", ${sr_acc}, ${sr_amt}, ${de_acc}, ${de_amt})
      on duplicate key update date=values(date), sr_acc=values(sr_acc), sr_amt=values(sr_amt), de_acc=values(de_acc), de_amt=values(de_amt)`
    await con.postQuery(query)
    
    res.send()
  } catch(err) {
    handleError(res, err)
  }
}