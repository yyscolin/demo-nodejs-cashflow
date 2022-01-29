const mdb = require('./help-all-mdb')
const handleError = require('./help-all-handleError.js')

module.exports = async function(req, res) {
  try {
    let query = 'select id, name, amt from (select t1.acc, t1.amt from bals t1 join (select acc, max(date) as date from bals group by acc) t2 on t1.date=t2.date and t1.acc=t2.acc) t3 join accs on t3.acc=accs.id'
    let bals = await mdb.postQuery(query)
    res.render('bals', { bals })
  } catch(err) {
    handleError(res, err)
  }
}