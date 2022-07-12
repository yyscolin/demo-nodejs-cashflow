const bodyParser = require(`body-parser`)
const dotenv = require(`dotenv`)
const express = require(`express`)
const favicon = require(`serve-favicon`)
const fs = require(`fs`)
const https = require(`https`)
const path = require(`path`)
const session = require(`express-session`)
const uuid = require(`uuid/v4`)

const app = express()
dotenv.config({path: path.join(__dirname, `.env`)})

const accountsController = require(`./controllers/accounts`)
const balancesController = require(`./controllers/balances`)
const busEntitiesController = require(`./controllers/business-entities`)
const purCategoriesController = require(`./controllers/purchase-categories`)
const purchasesController = require(`./controllers/purchases`)
const transfersController = require(`./controllers/transfers`)
const weeklyCFController = require(`./controllers/weekly-cash-flow`)

/** bodyparser middleware */
app.use(bodyParser.json({limit: `50mb`}))
app.use(bodyParser.urlencoded({limit: `50mb`, extended: true}))

/** favicon middleware */
app.use(favicon(path.join(__dirname, `favicon.ico`)))

/** Set session ID */
app.use(session({
  genid: () => {
    return uuid()
  },
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}))

/** Check if session is authorised */
let authorisedSession
app.post(`/login`, (req, res) => {
  const password = req.body.id
  if (password == `testPassword`) {
    authorisedSession = req.sessionID
    res.send()
  } else
    res.status(400).send()
})

app.use((req, res, next) => {
  const isAuthorised = req.sessionID == authorisedSession
  const bypassIps = [
    // `example.com`,
    new RegExp(`localhost`),
    new RegExp(`192\.168\.[0-9]{1,3}\.[0-9]{1,3}`),
  ]
  const isBypass = bypassIps.find(_ => _.test(req.hostname)) != undefined
  if (isAuthorised || isBypass)
    next()
  else
    res.render(`login`)
})

/** View engine */
app.set(`view engine`, `ejs`)
app.set(`views`, path.join(__dirname, `views`))

/** Routing */
app.get(``, (req, res) => res.redirect(`/purchases`))
app.get(`/accounts`, accountsController.renderAccountsPage)
app.get(`/balances`, balancesController.renderBalancesPage)
app.get(`/balances-form/:week`, balancesController.renderBalancesFormPage)
app.get(`/business-entities`, busEntitiesController.renderBusEntitiesPage)
app.get(`/external-transfer/:id?`, transfersController.renderExtTransferForm)
app.get(`/internal-transfer/:id?`, transfersController.renderIntTransferForm)
app.get(`/purchase-categories`, purCategoriesController.renderPurchaseCatsPage)
app.get(`/purchases`, purchasesController.renderPurchasesPage)
app.get(`/purchases/form/:id?`, purchasesController.renderPurchaseForm)
app.get(`/transfer-types`, transfersController.renderExtTransTypesPage)
app.get(`/weekly-cash-flow/:week?`, weeklyCFController.renderWeeklyCashFlowPage)
app.post(`/api/account`, accountsController.addAccount)
app.post(`/api/business-entity`, busEntitiesController.addBusinessEntity)
app.post(`/api/external-transfer`, transfersController.addExternalTransfer)
app.post(`/api/internal-transfer`, transfersController.addInternalTransfer)
app.post(`/api/purchase`, purchasesController.addOrEditPurchase)
app.post(`/api/purchase-category`, purCategoriesController.addPurCategory)
app.post(`/api/transfer-type`, transfersController.addExtTransferType)
app.put(`/api/account`, accountsController.editAccount)
app.put(`/api/balances`, balancesController.putBalances)
app.put(`/api/business-entity`, busEntitiesController.editBusinessEntity)
app.put(`/api/external-transfer`, transfersController.editExternalTransfer)
app.put(`/api/internal-transfer`, transfersController.editInternalTransfer)
app.put(`/api/purchase`, purchasesController.addOrEditPurchase)
app.put(`/api/purchase-category`, purCategoriesController.editPurCategory)
app.put(`/api/transfer-type`, transfersController.editExtTransferType)
app.delete(`/api/account`, accountsController.deleteAccount)
app.delete(`/api/business-entity`, busEntitiesController.deleteBusinessEntity)
app.delete(`/api/external-transfer`, transfersController.deleteExtTransfer)
app.delete(`/api/internal-transfer`, transfersController.deleteIntTransfer)
app.delete(`/api/payment`, purchasesController.deletePayment)
app.delete(`/api/purchase`, purchasesController.deletePurchase)
app.delete(`/api/purchase-category`, purCategoriesController.deletePurCategory)
app.delete(`/api/transfer-type`, transfersController.deleteExtTransferType)

/* Static files */
app.get(/^\/(images|scripts|styles)\/.+/, (req, res) => {
  const filePath = path.join(__dirname, `/static`, req.url)
  if (!fs.existsSync(filePath))
    return res.status(404).send()
  res.sendFile(filePath)
})

/** USING HTTP */
const httpPort = process.env.PORT_HTTP || 8080
app.listen(httpPort, () => {
  console.log(`Listening on Port ${httpPort}`)
})

/** HTTP redirect HTTPS */
// const http = require(`http`)
// var port1 = process.env.PORT_HTTP

// http.createServer(function(req, res) {
//   res.writeHead(301, {
//     Location: `https://${req.headers.host}${req.url}`
//   })
//   res.end()
// }).listen(port1, function() {
//  console.log(`Listening on Port ${port1}`)
// })

/** USING HTTPS */
const httpsPort = process.env.PORT_HTTPS
if (httpsPort) {
  const credentials = {
    key: fs.readFileSync(process.env.SSL_KEY, `utf8`),
    cert: fs.readFileSync(process.env.SSL_CRT, `utf8`)
  }
  const httpsServer = https.createServer(credentials, app)
  httpsServer.listen(httpsPort, () => {
    console.log(`Listening on Port ${httpsPort}`)
  })
}
