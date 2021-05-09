const mdb = require('./help-all-mdb')
const getSynsV2 = require('./help-exp11-getSynsV2')
const handleError = require('./help-all-handleError.js')

module.exports = async function(req, res) {
  try {
    let id = req.params.id
    if (id != undefined) {
      if (id != parseInt(id)) throw new Error('400::Page not found')
      var dbResponse = await mdb.get(`select date_format(date, '%Y-%m-%d') as date, name as tft, acc, amt, remarks
        from exp11.exts join exp11.tfts on exts.tft = tfts.id
        where exts.id = ${parseInt(id)}`)
      if (!dbResponse) throw new Error('400::Page not found')
      var ext = {
        id,
        date: ` value=${dbResponse.date}`,
        tft: dbResponse.tft ? ` value=${dbResponse.tft}` : '',
        amt: ` value=${dbResponse.amt}`,
        remarks: dbResponse.remarks ? ` value=${dbResponse.remarks}` : ''
      }
      var isNew = false
    } else {
      var ext = {
        id,
        date: '',
        tft: '',
        amt: '',
        remarks: ''
      }
      var isNew = true
    }
    let accs = await mdb.postQuery(`select id, name from exp11.accs order by name`)
    accs.forEach(acc => acc.selected = (isNew && acc.id==7) || (!isNew && acc.id==dbResponse.acc) ? ` selected='selected'` : '')
    let tfts = await getSynsV2('tft', ext.tft)
    res.render('exts_form', { ext, tfts, accs, isNew })
  } catch(err) {
    handleError(res, err)
  }
}