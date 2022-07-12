const fieldValidator = require(`../modules/field-validator`)
const accountsModel = require(`../models/accounts`)

async function deleteAccount(req, res) {
  try {
    const {id: accountId} = req.body
    const apiError = fieldValidator.checkId(`Account ID`, accountId)
    if (apiError) return res.status(400).send(apiError)
    await accountsModel.deleteAccount(accountId)
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function addAccount(req, res) {
  try {
    const accountName = req.body.name
    const accountCurrency = req.body.currency.toUpperCase()

    const apiErrors = [
      fieldValidator.checkString(`Account name`, accountName, 48),
      fieldValidator.checkCurrencyCode(`Account currency`, accountCurrency),
    ]
    for (const apiError of apiErrors)
      if (apiError) return res.status(400).send(apiError)

    await accountsModel.addAccount(accountName, accountCurrency)
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function editAccount(req, res) {
  try {
    const accountId = req.body.id
    const accountName = req.body.name
    const accountCurrency = req.body.currency.toUpperCase()

    const apiErrors = [
      fieldValidator.checkId(`Account ID`, accountId),
      fieldValidator.checkString(`Account name`, accountName, 48),
      fieldValidator.checkCurrencyCode(`Account currency`, accountCurrency),
    ]
    for (const apiError of apiErrors)
      if (apiError) return res.status(400).send(apiError)

    await accountsModel.editAccount(accountId, accountName, accountCurrency)
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function renderAccountsPage(req, res) {
  try {
    const pageType = {plural: `Accounts`, singular: `Account`}
    const typeAttributes = [
      {name: `name`, label: `Name`, type: `text`},
      {name: `currency`, label: `Currency`, type: `text`},
    ]
    const accountsInfo = await accountsModel.getAccountsInfo()
    const dataRows = accountsInfo.map(({id, ...accountInfo}) => {
      return {id, columns: accountInfo}
    })
    res.render(`common-management-page`, {pageType, typeAttributes, dataRows})
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

module.exports = {
  addAccount,
  deleteAccount,
  editAccount,
  renderAccountsPage,
}
