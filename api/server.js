const otplib = require('otplib');
let { SmartAPI } = require('smartapi-javascript');
const WebSocketV2 = require('./websocket2');
const { DEFAULT } = require('./config/constant')
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });
const cron = require('node-cron');
const { getGoldPrice } = require('./gold')
const {getNextSixMonthsDates, filterDatesAfterToday, calculateXNPV} = require('./xnpv')

let clientSocket;
let GOLDPRICE = 6000;
API_KEY = process.argv[2]
CLIENT_CODE = process.argv[3]
PASSWORD = process.argv[4]
const secret = process.argv[5]
const TOKEN = otplib.authenticator.generate(secret);
const isValid = otplib.authenticator.check(TOKEN, secret);

wss.on('listening', function listen(ws) {
    console.log('server a listing on port 8080');
    updateGoldValue()
    updateXNPV()
    cron.schedule('0 9 * * 1-5', updateGoldValue);
    cron.schedule('0 9 * * 1-5', updateXNPV);
    doTheMagic()
})
async function doTheMagic() {
    const {AUTH_TOKEN,FEED_TOKEN} = await connectToServer()
    createWebSocket2(AUTH_TOKEN, FEED_TOKEN)
}
function connectToServer() {
    return new Promise((resolve) => {
        let smart_api = new SmartAPI({
            api_key: API_KEY
        });
        smart_api
            .generateSession(CLIENT_CODE, PASSWORD, TOKEN)
            .then((data) => {
                AUTH_TOKEN = data['data']['jwtToken']
                FEED_TOKEN = data['data']['feedToken']
                resolve({AUTH_TOKEN, FEED_TOKEN, data})
            })
    })
   
}
function createWebSocket2(AUTH_TOKEN, FEED_TOKEN) {
    let web_socket = new WebSocketV2({
        jwttoken: AUTH_TOKEN,
        apikey: API_KEY,
        clientcode: CLIENT_CODE,
        feedtype: FEED_TOKEN,
    });
    web_socket.connect()
        .then(() => {
            let json_req = {
                correlationID: 'abcde12345',
                action: 1,
                mode: 3,
                tokenList: [
                    {
                        exchangeType: 1,
                        tokens: [
                            17248,
                            18385,
                            18386,
                            18429,
                            18795,
                            19203,
                            20467,
                            20980,
                            21477,
                            250,
                            304,
                            355,
                            398,
                            458,
                            497,
                            540,
                            623,
                            729,
                            795,
                            862,
                            945,
                            2891,
                            5960,
                            6355,
                            7654,
                            8308,
                            8766,
                            10261,
                            11154,
                            12904,
                            13209,
                            13981,
                            14252,
                            15432,
                            17110,
                            17664,
                            18451,
                            18862,
                            18972,
                            19078,
                            22242,
                            22385,
                            149,
                            834,
                            1342,
                            1920,
                            2003,
                            2200,
                            2810,
                            3742,
                            3743,
                            3800,
                            5113,
                            5455,
                            5575,
                            6518,
                            7098,
                            7879,
                            8401,
                            10232,
                            11192,
                            13642,
                            14598,
                            17202,
                            19456
                        ],
                    },
                    {
                        exchangeType: 3,
                        tokens: [
                            800251,
                            800252,
                            800253,
                            800254,
                            800258,
                            800259,
                            800265,
                            800268,
                            800269,
                            800270,
                            800271,
                            800273,
                            800274,
                            800275,
                            800276,
                            800277,
                            800278,
                            800279,
                            800280,
                            800281,
                            800282,
                            800287,
                            800288,
                            800289,
                            800290,
                            800291,
                            800292,
                            800295,
                            800296,
                            800297,
                            800301,
                            800302,
                            800303,
                            800312,
                            800313,
                            800314,
                            800315,
                            800318,
                            800320,
                            800322,
                            800324,
                            800325,
                            800327,
                            800328,
                            800329,
                            800331,
                            800332,
                            800333,
                            800339,
                            800340,
                            800341,
                            800342,
                            800367,
                            800385,
                            800386,
                            800434,
                            800437,
                            800438,
                            800439,
                            800443,
                            800488,
                            800573,
                            800575,
                            800580,
                            800596,
                         ]
                    }
                ],
                
            };
            web_socket.fetchData(json_req);
            web_socket.on('tick', receiveTick);
        })
}
function receiveTick(data) {
    let { token, best_5_sell_data: [{ price }] } = data
    token = token.replace(/"/g, '')
    price = price / 100;
    const objectToUpdate = DEFAULT.find(entry => entry.token === token);

    if (objectToUpdate) {
        let calYield = (objectToUpdate.issuePrice / price) * objectToUpdate.interestRate
        let discountToGold = (1 - (price / GOLDPRICE))
        objectToUpdate.askPrice = price
        objectToUpdate.calYield = calYield
        objectToUpdate.discountToGold = discountToGold
        objectToUpdate.discountToFairValue = 1 - (price/objectToUpdate.fairValue)
        objectToUpdate.goldPrice = GOLDPRICE
        if (clientSocket && clientSocket.readyState === WebSocket.OPEN) {
            clientSocket.send(JSON.stringify(DEFAULT))
        }
    }
}
async function updateGoldValue() {
    GOLDPRICE = await getGoldPrice()
}
function updateXNPV() {
    DEFAULT.forEach((obj) => {
        const startingDate = new Date(obj.issueDate);
        const numberOfDatesToGenerate = 16;
        const nextSixMonthsDates = getNextSixMonthsDates(startingDate, numberOfDatesToGenerate);
        const cashFlowDates = filterDatesAfterToday(nextSixMonthsDates);
        cashFlowDates.unshift(new Date())
        const discountRate = 0.07; // Replace with your desired discount rate
        const cashFlows = Array(cashFlowDates.length).fill(obj.cashFlow,1,cashFlowDates.length);
        cashFlows[0] = 0
        const xnpvResult = calculateXNPV(discountRate, cashFlows, cashFlowDates);
        obj.fairValue = xnpvResult + GOLDPRICE
    })
}

wss.on('connection', function connection(ws) {
    console.log('Server A: Client connected');
    ws.send(JSON.stringify(DEFAULT))
    ws.on('message', function incoming(message) {
        console.log('Server A: Received message:', message.toString());
    });
    ws.on('close', function () {
        console.log('Server A: Client disconnected');
    });
    clientSocket = ws
});