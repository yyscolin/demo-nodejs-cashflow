const mdb = require('./help-all-mdb')
const handleError = require('./help-all-handleError.js')

module.exports = async function(req, res) {
  try {
    let ext = {}
    let isNew = true

    const {id: extId} = req.params
    if (extId != undefined) {
      if (extId != parseInt(extId)) throw new Error('400::Page not found')
      ext = await mdb.get(`select exts.id, date_format(date, '%Y-%m-%d') as date, name as tft, acc, amt, remarks
        from exts join tfts on exts.tft = tfts.id
        where exts.id = ${parseInt(extId)}`)
      if (!ext) throw new Error('400::Page not found')
      isNew = false
    }

    let accs = await mdb.postQuery(`select id, name from accs order by name`)
    accs.forEach(acc => acc.selected = (isNew && acc.id==7) || (!isNew && acc.id==ext.acc) ? ` selected='selected'` : '')
    let tfts = await mdb.getValues(`SELECT name FROM tfts`)
    res.render('exts_form', { ext, tfts, accs, isNew })
  } catch(err) {
    handleError(res, err)
  }
}