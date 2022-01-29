const mdb = require('./help-all-mdb')
const handleError = require('./help-all-handleError.js')

module.exports = async function(req, res) {
  try {
    function getCats(supercat) {
      let cats = itms.filter(_ => _.supercat == supercat)
      cats.map(cat => {
        cat.subcats = getCats(cat.id)
        if (cat.subcats.length) {
          cat.rowspan = 0
          cat.subcats.forEach(_ => cat.rowspan += _.rowspan)
          cat.colspan = 1
        } else {
          cat.rowspan = 1
          cat.colspan = 100
        }
        return cat
      })
      return cats
    }

    Array.prototype.parseHTML = function() {
      let html = ''
      for (let i = 0; i < this.length; i++) {
        if (i) html += '</tr><tr>'
        html += `<td id='${this[i].id}' name='${this[i].name}' rowspan='${this[i].rowspan}' colspan='${this[i].colspan}'>`
        html += `<span>${this[i].subname}</span>`
        if (this[i].syns) html += `<p style='color:yellow;margin:0 auto'>${this[i].syns}</p>`
        html += `</td>`
        html += this[i].subcats.parseHTML()
      }
      return html
    }

    let itms = await mdb.select(`
      select itms.id, name, cat as supercat, ifnull(subname, name) as subname, syns
      from itms
      left join (
        select of, group_concat(name separator "<span>, </span>") as syns
        from itms_syns
        group by of
      ) t1 on itms.id = t1.of
    `)
    let catsMap = getCats(null)
    catsMap = '<table><tr>' + catsMap.parseHTML() + '</tr></table>'

    res.render('itms', {catsMap})
  } catch(err) {
    handleError(res, err)
  }
}