const handleError = require('./help-all-handleError')
const con = require('./help-all-mdb')

module.exports = async function(req, res) {
  try {
    var bals = req.body
    if (bals.length) {
      bals = bals.map(_ => `( "${_.date}", ${_.acc},${_.amt})`)
      await con.postQuery(`insert into exp11.bals (date, acc, amt) values ${bals.toString()} on duplicate key update date=values(date), acc=values(acc), amt=values(amt)`)
    }
    res.send()
  } catch(err) {
    handleError(res, err)
  }
}