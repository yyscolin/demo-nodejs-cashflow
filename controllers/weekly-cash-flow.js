const accountsModel = require(`../models/accounts`)
const balancesModel = require(`../models/balances`)
const busEntsModel = require(`../models/business-entities`)
const purchasesModel = require(`../models/purchases`)
const purCatsModel = require(`../models/purchase-categories`)
const transfersModel = require(`../models/transfers`)

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

async function renderWeeklyCashFlowPage(req, res) {
  try {
    const datetimeNow = new Date()
    const timeNow = datetimeNow.toString().split(` `)[4]

    /** Get details of the date of the last interaction with the database */
    const lastIntString = await balancesModel.getLastDbInteractDate()
    const lastIntDate = new Date(lastIntString + ` ` + timeNow)
    const lastIntTime = lastIntDate.getTime()

    const systemStartString = process.env.SYSTEM_START_DATE
    const systemStartDate = new Date(systemStartString + ` ` + timeNow)
    const systemStartTime = systemStartDate.getTime()

    /** Get week number of the last interaction */
    let timeDisplacement = lastIntTime - systemStartTime
    let weeksDisplacement = timeDisplacement / 7 / 24 / 60 / 60 / 1000
    const lastIntWeekNo = Math.max(Math.ceil(weeksDisplacement), 1)

    /** Get the current week number */
    timeDisplacement = datetimeNow.getTime() - systemStartTime
    weeksDisplacement = timeDisplacement / 7 / 24 / 60 / 60 / 1000
    const thisWeekNo = Math.ceil(weeksDisplacement)

    let isRedirecting = false
    let pageWeekNo = req.params.week
    if (!pageWeekNo)
      isRedirecting = true
    else {
      const isInteger = parseInt(pageWeekNo) == pageWeekNo
      const isBeforeMin = pageWeekNo < 1
      const isAfterMax = pageWeekNo > thisWeekNo
      isRedirecting = !isInteger || isBeforeMin || isAfterMax
    }

    if (isRedirecting)
      return res.redirect(`/weekly-cash-flow/${lastIntWeekNo}`)

    pageWeekNo = parseInt(pageWeekNo)
    const weekIndex = pageWeekNo - 1
    const [
      dateBefore, // 1 day before the start of the financial week
      dateStart, // the first day of the financial week
      dateEnd, // the last day of the financial week
    ] = [-1, 0, 6].map(daysDiplacement => {
      const daysSinceSystemStart = weekIndex * 7 + daysDiplacement
      const timeSinceSystemStart = daysSinceSystemStart * 24 * 60 * 60 * 1000
      const timestamp = systemStartTime + timeSinceSystemStart
      return new Date(timestamp).toLocaleDateString(`fr-CA`)
    })

    const [startYear, startMonth, startDom] = dateStart.split("-")
    const startWeek = Math.ceil(startDom / 7)
    const weekTitle = `Week ${startWeek} ${MONTHS[startMonth - 1]} ${startYear}`

    const [
      accountBalancesLast, // last financial week's account balance
      accountBalancesThis, // this financial week's account balance
      internalTransfers,
      externalTransfers,
      payments,
      accountsInfo,
      purchaseCategories,
      businessEntities,
      currencies,
    ] = await Promise.all([
      balancesModel.getCurrentBalances(dateBefore),
      balancesModel.getCurrentBalances(dateEnd),
      transfersModel.getInternalTransfersInDateRange(dateStart, dateEnd),
      transfersModel.getExternalTransfersInDateRange(dateStart, dateEnd),
      purchasesModel.getPaymentsInDateRange(dateStart, dateEnd),
      accountsModel.getAccountsInfo(),
      purCatsModel.getPurchaseCatsInfo(),
      busEntsModel.getBusEntitiesInfo(),
      accountsModel.getCurrencies(),
    ])

    const accountBalances = accountBalancesLast.map(({id, name, amount}) => {
      const getSum = array => array.reduce(
        (accum, current) => {
          if (accountId == current.accountId)
            accum += current.amount
          return Math.round(accum * 100) / 100
        }, 0)

      const accountId = id
      const accountName = name
      const startingAmount = amount
      const paymentAmount = getSum(payments)
      const internalTransferAmount = internalTransfers.reduce(
        (accum, transferInfo) => {
          if (accountId == transferInfo.sourceAccountId)
            accum -= transferInfo.sourceAmount
          if (accountId == transferInfo.targetAccountId)
            accum += transferInfo.targetAmount
          return Math.round(accum * 100) / 100
        }, 0
      )
      const externalTransferAmount = getSum(externalTransfers)
      const balanceAmount = accountBalancesThis.find(_ => _.id == accountId)
        .amount

      if (
        startingAmount == balanceAmount
        && !paymentAmount
        && !internalTransferAmount
        && !externalTransferAmount
      ) return null

      const errorAmount = startingAmount
        + paymentAmount
        + internalTransferAmount
        + externalTransferAmount
        - balanceAmount

      return {
        accountName,
        startingAmount,
        paymentAmount,
        internalTransferAmount,
        externalTransferAmount,
        balanceAmount,
        errorAmount: Math.round(errorAmount * 100) / 100,
      }
    }).filter(_ => _ != null)

    res.render(`weekly-cash-flow-page`, {
      dateStart,
      dateEnd,
      pageWeekNo,
      thisWeekNo,
      accountBalances,
      internalTransfers,
      externalTransfers,
      payments,
      accountsInfo,
      dataLists: {
        "purchase-categories": purchaseCategories.map(_ => _.name),
        "business-entities": businessEntities.map(_ => _.name),
        currencies,
      },
      weekTitle
    })
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

module.exports = {
  renderWeeklyCashFlowPage,
}
