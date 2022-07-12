const balancesModel = require(`../models/balances`)
const purchasesModel = require(`../models/purchases`)
const transfersModel = require(`../models/transfers`)

async function renderWeeklyCashFlowPage(req, res) {
  try {
    const systemStartDate = new Date(`2018-11-04`)
    const systemStartTime = systemStartDate.getTime()
    const currentWeekIndex = Math.floor(
      (new Date().getTime() - systemStartTime) / (7 * 24 * 60 * 60 * 1000)
    )
    const currentWeekNo = currentWeekIndex + 1

    let isRedirecting = false
    if (!req.params.week)
      isRedirecting = true
    else {
      const isInteger = parseInt(req.params.week) == req.params.week
      const isBeforeMin = req.params.week < 1
      const isAfterMax = req.params.week > currentWeekNo
      isRedirecting = !isInteger || isBeforeMin || isAfterMax
    }

    if (isRedirecting)
      return res.redirect(`/weekly-cash-flow/${currentWeekNo}`)

    const weekIndex = req.params.week - 1
    const [dateStart, dateEnd] = [0, 6].map(daysDiplacement => {
      const daysSinceSystemStart = weekIndex * 7 + daysDiplacement
      const timeSinceSystemStart = daysSinceSystemStart * 24 * 60 * 60 * 1000
      const timestamp = systemStartTime + timeSinceSystemStart
      return new Date(timestamp).toLocaleDateString(`fr-CA`)
    })

    const [
      accountBalances,
      internalTransfers,
      externalTransfers,
      payments
    ] = await Promise.all([
      balancesModel.getAccountBalancesInDateRange(dateStart, dateEnd),
      transfersModel.getInternalTransfersInDateRange(dateStart, dateEnd),
      transfersModel.getExternalTransfersInDateRange(dateStart, dateEnd),
      purchasesModel.getPaymentsInDateRange(dateStart, dateEnd),
    ])

    res.render(`weekly-cash-flow-page`, {
      dateStart,
      dateEnd,
      pageWeekNo: weekIndex + 1,
      currentWeekNo,
      accountBalances,
      internalTransfers,
      externalTransfers,
      payments,
    })
  } catch(err) {
    console.error(err)
    res.status(500).send()
  }
}

module.exports = {
  renderWeeklyCashFlowPage,
}
