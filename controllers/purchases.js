const accountsModel = require(`../models/accounts`)
const busEntsModel = require(`../models/business-entities`)
const fieldValidator = require(`../modules/field-validator`)
const purchasesModel = require(`../models/purchases`)
const purCatsModel = require(`../models/purchase-categories`)

async function addOrEditPurchase(req, res) {
  try {
    const purchaseId = req.body.id
    const purchaseDate = req.body.date
    const purCatName = req.body.category
    const currency = req.body.currency
    const purchaseAmount = req.body.amount
    const busEntName = req.body.entity
    const remarks = req.body.remarks
    const payments = req.body.payments

    const apiErrors = [
      fieldValidator.checkDate(`Purchase date`, purchaseDate),
      fieldValidator.checkCurrencyCode(`Purchase currency`, currency),
      fieldValidator.checkAmount(`Purchase amount`, purchaseAmount),
      fieldValidator.checkString(`Purchase category`, purCatName, 72),
    ]
    if (req.method == `PUT`) apiErrors.push(
      fieldValidator.checkId(`Purchase ID`, purchaseId)
    )
    for (const apiError of apiErrors)
      if (apiError) return res.status(400).send(apiError)

    for (const payment of payments || []) {
      const apiErrors = [
        fieldValidator.checkDate(`Payment date`, payment.date),
        fieldValidator.checkId(`Account ID`, payment.accountId),
        fieldValidator.checkAmount(`Payment amount`, payment.amount),
      ]
      for (const apiError of apiErrors)
        if (apiError) return res.status(400).send(apiError)
    }

    const newPayments = payments.filter(({id}) => !id)
    const oldPayments = payments.filter(({id}) => id)
    
    const oldPayIds = oldPayments.map(({id}) => parseInt(id))
    const nonExistPayIds = await purchasesModel.getNonExistPayments(oldPayIds)
    if (nonExistPayIds.length)
      return res.status(400).send(`Invalid payment ID(s) given`)
    
    const [purCatId, busEntId] = await Promise.all([
      purCatsModel.getPurchaseCatId(purCatName),
      busEntsModel.getBusEntityId(busEntName),
    ])

    if (req.method == `POST`) await purchasesModel.addPurchase(
      purchaseDate,
      purCatId,
      currency,
      purchaseAmount,
      busEntId,
      remarks,
      newPayments,
      oldPayments
    )
    else await purchasesModel.editPurchase(
      purchaseId,
      purchaseDate,
      purCatId,
      currency,
      purchaseAmount,
      busEntId,
      remarks,
      newPayments,
      oldPayments
    )
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function deletePayment(req, res) {
  try {
    const paymentId = req.body.id

    const apiError = fieldValidator.checkId(`Payment ID`, paymentId)
    if (apiError) return res.status(400).send(apiError)

    await purchasesModel.deletePayment(paymentId)
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function deletePurchase(req, res) {
  try {
    const purchaseId = req.body.id

    const apiError = fieldValidator.checkId(`Purchase ID`, purchaseId)
    if (apiError) return res.status(400).send(apiError)

    await purchasesModel.deletePurchase(purchaseId)
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function getPurchaseInfo(req, res) {
  try {
    const purchaseId = req.params.id
    const purchaseInfo = await purchasesModel.getPurchaseInfo(purchaseId)
    res.json(purchaseInfo)
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

async function renderPurchasesPage(req, res) {
  try {
    let isRedirecting = false

    let dateEnd = req.query[`date-end`]
    if (dateEnd == undefined) {
      req.query[`date-end`] = new Date().toLocaleDateString(`fr-CA`)
      isRedirecting = true
    }

    let dateStart = req.query[`date-start`]
    if (dateStart == undefined) {
      const dateEndTimestamp = new Date(req.query[`date-end`]).getTime()
      const timeDelta = 7 * 24 * 60 * 60 * 1000
      req.query[`date-start`] = new Date(dateEndTimestamp - timeDelta)
        .toLocaleDateString(`fr-CA`)
      isRedirecting = true
    }

    const currency = req.query.currency
    if (req.query.currency == undefined) {
      req.query.currency = `AUD`
      isRedirecting = true
    }

    if (isRedirecting) {
      const paramsString = Object.entries(req.query)
        .map(([key, value]) => `${key}=${value}`)
        .join(`&`)
      return res.redirect(`/purchases?${paramsString}`)
    }

    if (dateEnd) dateEnd = new Date(dateEnd)
    if (dateEnd == `Invalid Date`)
      return res.status(400).send(`Invalid end date given`)

    if (dateStart) dateStart = new Date(dateStart)
    if (dateStart == `Invalid Date`)
      return res.status(400).send(`Invalid start date given`)

    if (dateStart && dateEnd && dateStart > dateEnd)
      return res.status(400).send(`Start date must be before end date`)

    if (dateStart) dateStart = dateStart.toLocaleDateString(`fr-CA`)
    if (dateEnd) dateEnd = dateEnd.toLocaleDateString(`fr-CA`)

    const purCatIds = req.query[`purchase-categories`]
      ? req.query[`purchase-categories`].split(`,`).map(_ => parseInt(_))
      : null
    const busEntIds = req.query[`business-entities`]
      ? req.query[`business-entities`].split(`,`).map(_ => parseInt(_))
      : null

    const sqlConditions = {
      dateStart, dateEnd, currency, purCatIds, busEntIds
    }
    const purchasesInfo = await purchasesModel.getPurchasesInfo(sqlConditions)

    const [totalPurchaseAmt, totalOutstandingAmt] = purchasesInfo.reduce(
      ([accumPur, accumOut], {buy, paid}) => [accumPur + buy, accumOut + paid],
      [0, 0]
    ).map(_ => _.toFixed(2))

    const accountsInfo = await accountsModel.getAccountsInfo()
    const dataLists = {}

    const purchaseCategories = await purCatsModel.getPurchaseCatsInfo()
    dataLists[`purchase-categories`] = purchaseCategories.map(_ => _.name)
    if (purCatIds)
      purchaseCategories.forEach(_ => _.isChecked = purCatIds.includes(_.id))

    const businessEntities = await busEntsModel.getBusEntitiesInfo()
    dataLists[`business-entities`] = businessEntities.map(_ => _.name)
    if (busEntIds)
      businessEntities.forEach(_ => _.isChecked = busEntIds.includes(_.id))

    businessEntities.unshift({
      id: 0,
      name: `(NONE)`,
      isChecked: busEntIds?.includes(0) ? true : false,
    })

    let currencies = await accountsModel.getCurrencies()
    dataLists.currencies = currencies
    currencies = currencies.map(currencyCode => {
      const selectedAttr = currencyCode == currency ? `selected` : ``
      return {code: currencyCode, selectedAttr}
    })

    for (filterTypeItems of [purchaseCategories, businessEntities]) {
      const checkedItems = filterTypeItems.filter(_ => _.isChecked)
      filterTypeItems.dataValue = checkedItems.map(_ => _.id).toString()
      filterTypeItems.displayValue = checkedItems.length > 1
        ? `${checkedItems.length} items selected`
        : checkedItems[0]?.name || ``
    }
    
    res.render(`purchases-page`, {
      purchasesInfo,
      dateStart,
      dateEnd,
      purchaseCategories,
      businessEntities,
      currencies,
      totalPurchaseAmt,
      totalOutstandingAmt,
      dataLists,
      accountsInfo,
      selectedCurrency: currency,
    })
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

module.exports = {
  addOrEditPurchase,
  deletePayment,
  deletePurchase,
  getPurchaseInfo,
  renderPurchasesPage,
}
