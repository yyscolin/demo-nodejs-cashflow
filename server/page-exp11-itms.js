const mdb = require('./help-all-mdb')
const handleError = require('./help-all-handleError.js')

module.exports = async function(req, res) {
  try {
    function getCats(superCategory=null) {
      const categoryFilter = category => category.superCategory == superCategory
      const levelCategories = purchaseCategories.filter(categoryFilter)
      return levelCategories.map(category => {
        category.subCategories = getCats(category.id)
        if (category.subCategories.length) {
          const sumFunction = (accum, {rowspan}) => accum + rowspan
          category.rowspan = category.subCategories.reduce(sumFunction, 0)
          category.colspan = 1
        } else {
          category.rowspan = 1
          category.colspan = 100
        }
        return category
      })
    }

    function parseArrayToHTML(array) {
      let html = ``
      for (let i = 0; i < array.length; i++) {
        if (i) html += `</tr><tr>`
        html += `<td id="${array[i].id}" name="${array[i].name}" rowspan="${array[i].rowspan}" colspan="${array[i].colspan}">`
        html += `${array[i].name}`
        html += `</td>`
        html += parseArrayToHTML(array[i].subCategories)
      }
      return html
    }

    const sqlQuery = `select id, name, cat as superCategory from itms`
    const purchaseCategories = await mdb.select(sqlQuery)

    const categoriesMap = getCats()
    const categoriesHTML = `<tr>`
      + parseArrayToHTML(categoriesMap)
      + `</tr>`

    res.render(`itms`, {categoriesHTML})
  } catch(err) {
    handleError(res, err)
  }
}