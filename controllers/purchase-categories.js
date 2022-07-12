const fieldValidator = require(`../modules/field-validator`)
const purCategoriesModel = require(`../models/purchase-categories`)

async function addPurCategory(req, res) {
  try {
    const categoryName = req.body.name
    const superCatName = req.body.superCatName

    const apiErrors = [
      fieldValidator.checkString(`Purchase category`, categoryName, 72)
    ]
    if (superCatName) {
      if (categoryName == superCatName)
        return res.status(400).send(`A category's parent cannot be itself`)
      apiErrors.push(
        fieldValidator.checkString(`Parent category`, superCatName, 72)
      )
    }
    for (const apiError of apiErrors)
      if (apiError) return res.status(400).send(apiError)

    const superCatId = superCatName
      ? await purCategoriesModel.getPurchaseCatId(superCatName)
      : null
    await purCategoriesModel.addPurCategory(categoryName, superCatId)
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function deletePurCategory(req, res) {
  try {
    const categoryId = req.body.id

    const apiError = fieldValidator.checkId(`Purchase category ID`, categoryId)
    if (apiError) return res.status(400).send(apiError)

    await purCategoriesModel.deletePurCategory(categoryId)
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function editPurCategory(req, res) {
  try {
    const categoryId = req.body.id
    const categoryName = req.body.name
    const superCatName = req.body.superCatName || null

    const apiErrors = [
      fieldValidator.checkId(`Purchase category ID`, categoryId),
      fieldValidator.checkString(`Purchase category name`, categoryName, 72),
    ]
    if (superCatName) {
      if (categoryName == superCatName)
        return res.status(400).send(`A category's parent cannot be itself`)
      apiErrors.push(
        fieldValidator.checkString(`Parent category`, superCatName, 72)
      )
    }
    for (const apiError of apiErrors)
      if (apiError) return res.status(400).send(apiError)

    let superCatId = null
    if (superCatName) {
      superCatId = await purCategoriesModel.getPurchaseCatId(superCatName)
      const purchaseCats = await purCategoriesModel.getPurchaseCatsInfo()
      let loopSuperId = superCatId
      do {
        const nextSuperId = purchaseCats.find(_ => _.id == loopSuperId)
          .superCatId
        if (nextSuperId && categoryId == nextSuperId)
          return res.status(400).send(`Parent Category cannot be a descendent`)
        loopSuperId = nextSuperId
      } while (loopSuperId)
    }

    await purCategoriesModel.editPurCategory(categoryId, categoryName, superCatId)
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function renderPurchaseCatsPage(req, res) {
  function parseArrayToHTML(array) {
    let html = ``
    for (let i = 0; i < array.length; i++) {
      const superCatName = array[i].superCatName || ``
      if (i) html += `</tr><tr>`
      html += `<td id="${array[i].id}" name="${array[i].name}" `
        + `onclick="openFormWindow(${array[i].id}, `
        + `{&#34;name&#34;:&#34;${array[i].name}&#34;,`
        + `&#34;superCatName&#34;:&#34;${superCatName}&#34;})" `
        + `onmouseover="$(this).css(\`background-color\`, \`#2E64DE\`)" `
        + `onmouseout="$(this).css(\`background-color\`, \`\`)" `
        + `rowspan="${array[i].rowspan}" colspan="${array[i].colspan}">`
        + `${array[i].name}`
        + `</td>`
        + parseArrayToHTML(array[i].subCategories)
    }
    return html
  }

  try {
    const pageType = {
      plural: `Purchase Categories`,
      singular: `Purchase Category`,
    }
    const purchaseCats = await purCategoriesModel.getPurchaseCatsInfo()
    const typeAttributes = [
      {name: `name`, label: `Name`, type: `text`},
      {
        name: `super-cat-name`,
        nameInCamelCaps: `superCatName`,
        label: `Parent Category`,
        type: `datalist`,
        options: purchaseCats.map(_ => _.name),
      }
    ]
  
    function findCategoriesByParentId(superCatId) {
      const superCatName = superCatId
        ? purchaseCats.find(_ => _.id == superCatId).name
        : null
      const categoryFilter = category => category.superCatId == superCatId
      const levelCategories = purchaseCats.filter(categoryFilter)
      return levelCategories.map(category => {
        if (superCatName) category.superCatName = superCatName
        category.subCategories = findCategoriesByParentId(category.id)
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

    const nestedCategories = findCategoriesByParentId(null)
    const tableHtml = `<tr>`
      + parseArrayToHTML(nestedCategories)
      + `</tr>`
    res.render(`common-management-page`, {pageType, typeAttributes, tableHtml})
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

module.exports = {
  addPurCategory,
  deletePurCategory,
  editPurCategory,
  renderPurchaseCatsPage,
}
