const Hapi = require('@hapi/hapi')
// Plugins
const device = require('./src/api/device')
const DeviceService = require('./src/services/DeviceService')
const Mongoose = require('mongoose')

// Records
const record = require('./src/api/record')
const RecordService = require('./src/services/RecordService')

// Gateway
const gateway = require('./src/api/gateway')
const GatewayService = require('./src/services/GatewayService')

// Alarm
const AlarmService = require('./src/services/AlarmService')

// Validator
const DeviceValidator = require('./src/validator/device')
const RecordValidator = require('./src/validator/record')
const GatewayValidator = require('./src/validator/gateway')

// Models
const DeviceModel = require('./src/Models/Device')
const RecordModel = require('./src/Models/Record')
const GatewayModel = require('./src/Models/Gateway')

// other
const { initCron } = require('./src/sub/cron/waslstate')
const WaslService = require('./src/services/WaslService')

// GLOBAL ENV
process.env.offlineTimeLimitInSecond = 10800

const init = async () => {
    const deviceService = new DeviceService(DeviceModel)
    const recordService = new RecordService(RecordModel)
    const gatewayService = new GatewayService(GatewayModel)
    const waslService = new WaslService()
    const alarmService = new AlarmService(1)
    // console.log("AS", alarmService)
    const services = { deviceService, recordService, gatewayService, alarmService }

    initCron({ deviceService, waslService })

    await Mongoose.connect('mongodb://localhost:27017/monitor-service', { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('DB Connected'))
        .catch((err) => {
            console.log('DBERROR', err)
        })

    const server = Hapi.server({
        port: 3000,
        host: '127.0.0.1',
        routes: {
            cors: {
                origin: ['https://quhorizons.com', 'http://quhorizons.com', 'http://localhost:8000']
            }
        }
    })

    console.log('Validator on app.js: ', RecordValidator)
    await server.register([
        {
            plugin: device,
            options: {
                service: services,
                validator: DeviceValidator,
                model: DeviceModel
            }
        },
        {
            plugin: record,
            options: {
                service: services,
                validator: RecordValidator,
                model: RecordModel
            }
        },
        {
            plugin: gateway,
            options: {
                service: services,
                validator: GatewayValidator,
                model: GatewayModel
            }
        }
    ])

    await server.start()
    console.log(`Server runs on ${server.info.uri}`)
}

init()
