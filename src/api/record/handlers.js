const NotFoundError = require('../../Exceptions/NotFoundError')

class RecordHandler {
    constructor (service, validator) {
        this._service = service.recordService
        this._deviceService = service.deviceService
        this._validator = validator
        this._alarmService = service.alarmService

        this.postRecordSingleHandler = this.postRecordSingleHandler.bind(this)
        this.getRecordByDevMacIdHandler = this.getRecordByDevMacIdHandler.bind(this)
        this.getAllRecord = this.getAllRecord.bind(this)
        this.getAllRecordByTime = this.getAllRecordByTime.bind(this)
        this.checkSystemOnline = this.checkSystemOnline.bind(this)
    }

    async postRecordSingleHandler (request, h) {
        try {
            this._validator.validatePostRecordPayload(request.payload)
            console.log('recording sensor data')
            // fetching device info
            const { deviceMacId, vendor } = request.payload
            const deviceInfo = await this._deviceService.getDeviceByDeviceMacId(deviceMacId, vendor)
            if (deviceInfo === null) {
                throw new NotFoundError('device not found', 404, 'handler', 2)
            }

            // // generate fine data based on device info
            const fineData = await this._service.generateRecordData(request.payload, deviceInfo)
            // // insert fine data to database
            await this._service.addRecord(fineData)

            // // update device last record

            let update = { lastRecord: fineData.time }

            if (fineData.sensorValues.temp !== null) {
                update.lastTemp = fineData.sensorValues.temp
            }
            if (fineData.sensorValues.hum !== null) {
                update.lastHum = fineData.sensorValues.hum
            }

            await this._deviceService.updateDeviceByCompanyDeviceUid(deviceInfo.companyUid, deviceInfo.deviceUid, update)

            this._alarmService.check({
                companyUid: deviceInfo.companyUid,
                inventoryUid: deviceInfo.inventoryUid,
                deviceUid: deviceInfo.deviceUid,
                deviceMacId: deviceInfo.deviceMacId,
                deviceName: deviceInfo.deviceName,
                tempVal: fineData.sensorValues.temp,
                humVal: fineData.sensorValues.hum,
                time: fineData.time + ''
            })

            const response = h.response({
                code: 1,
                message: 'Record (single) saved'
            })
            response.code(200)
            return response
        } catch (error) {
            const response = h.response({
                status: 'fail',
                message: error.message
            })
            response.code(error.statusCode ?? 400)
            return response
        }
    }

    async getRecordByDevMacIdHandler (request, h) {
        // get all record by company's sensor
        const records = await this._service.getRecordByDevMacId(request.params.deviceMacId)
        const response = h.response({
            code: 0,
            data: records
        })
        response.code(200)
        return response
    }

    async getAllRecord (request, h) {
        this._validator.validateGetDeviceRecordsByFilterPayload(request.query)

        const { companyUid, deviceUid } = request.params

        // get record history based on time range
        const records = await this._service.getAllByDeviceUid(companyUid, deviceUid, request.query)

        // console.log('RC', records)

        // generate fineHistory
        const fineHistory = this._service.generateFineHistory(records)

        const response = h.response({
            code: 0,
            data: fineHistory
        })
        response.code(200)
        return response
    }

    async getAllRecordByTime (request, h) {

        const { companyUid, deviceUid } = request.params

        // get record history based on time range
        const records = await this._service.getAllByDeviceUid(companyUid, deviceUid, request.query)

        // console.log('RC', records)

        // generate fineHistory

        const response = h.response({
            code: 0,
            data: records.map(it => {
                return {
                    time: it.time,
                    t: typeof it.sensorValues.temp !== 'undefined' ? it.sensorValues.temp : null,
                    h: typeof it.sensorValues.hum !== 'undefined' ? it.sensorValues.hum : null
                }
            })
        })
        response.code(200)
        return response
    }

    async checkSystemOnline (request, h) {
        const response = h.response({
            status: 'success'
        })

        response.code(200)
        return response
    }
}

module.exports = RecordHandler
