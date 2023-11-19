const fieldValidator = require(`../modules/field-validator`)
const busEntitiesModel = require(`../models/business-entities`)

const isDemo = process.env.IS_DEMO?.toLowerCase() == "true"

async function addBusinessEntity(req, res) {
  try {
    const entityName = req.body.name

    const apiError = fieldValidator.checkString(`Account Name`, entityName, 48)
    if (apiError) return res.status(400).send(apiError)

    if (isDemo) return res.status(202).send()

    await busEntitiesModel.addBusinessEntity(entityName)
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function deleteBusinessEntity(req, res) {
  try {
    const entityId = req.body.id

    const apiError = fieldValidator.checkId(`Business entity ID`, entityId)
    if (apiError) return res.status(400).send(apiError)

    if (isDemo) return res.status(202).send()

    await busEntitiesModel.deleteBusinessEntity(entityId)
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function editBusinessEntity(req, res) {
  try {
    const entityId = req.body.id
    const entityName = req.body.name

    const apiErrors = [
      fieldValidator.checkId(`Business entity ID`, entityId),
      fieldValidator.checkString(`Account name`, entityName, 48),
    ]
    for (const apiError of apiErrors)
      if (apiError) return res.status(400).send(apiError)

    if (isDemo) return res.status(202).send()

    await busEntitiesModel.editBusinessEntity(entityId, entityName)
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function renderBusEntitiesPage(req, res) {
  try {
    const pageType = {plural: `Business Entities`, singular: `Business Entity`}
    const typeAttributes = [{name: `name`, label: `Name`, type: `text`}]
    const entitiesInfo = await busEntitiesModel.getBusEntitiesInfo()
    const dataRows = entitiesInfo.map(({id, ...entityInfo}) => {
      return {id, columns: entityInfo}
    })
    res.render(`common-management-page`, {pageType, typeAttributes, dataRows})
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

module.exports = {
  addBusinessEntity,
  deleteBusinessEntity,
  editBusinessEntity,
  renderBusEntitiesPage,
}
