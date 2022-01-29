const mdb = require('./help-all-mdb')
const handleError = require('./help-all-handleError.js')

module.exports = async function(req, res) {
  try {
    let id = req.params.id
    if (id != undefined) {
      if (id != parseInt(id)) throw new Error('400::Page not found')
      var dbResponse = await mdb.get(`select date_format(date, '%Y-%m-%d') as date, sr_acc, sr_amt, de_acc, de_amt from ints where id = ${id}`)
      if (!dbResponse) throw new Error('400::Page not found')
      var int = {
        id,
        date: ` value=${dbResponse.date}`,
        sr_amt: ` value=${dbResponse.sr_amt}`,
        de_amt: ` value=${dbResponse.de_amt}`
      }
      var isNew = false
    } else {
      var int = {
        date: '',
        sr_amt: '',
        de_amt: ''
      }
      var isNew = true
    }
    let accs = await mdb.postQuery(`select id, name from accs order by name`)
    accs.forEach(acc => {
      acc.sr = (isNew && acc.id==7) || (!isNew && acc.id==dbResponse.sr_acc) ? ` selected='selected'` : ''
      acc.de = (isNew && acc.id==4) || (!isNew && acc.id==dbResponse.de_acc) ? ` selected='selected'` : ''
    })
    res.render('ints_form', { int, accs, isNew })
  } catch(err) {
    handleError(res, err)
  }
}