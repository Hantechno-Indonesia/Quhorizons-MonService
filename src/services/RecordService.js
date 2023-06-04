
class RecordService {
    constructor (model) {
        this._model = model
    }

    async addRecord (payload) {
        try {
            const data = {
                deviceUUID: payload.deviceUUID,
                companyUid: payload.companyUid,
                deviceUid: payload.deviceUid,
                deviceMacId: payload.deviceMacId,
                sensorValues: {
                    temp: payload.sensorValues.temp,
                    hum: payload.sensorValues.hum
                },
                time: payload.time
            }
            const record = new this._model(data)

            const result = await record.save(function (err, res) {
		// console.log('r msk', res)
                if (err) throw err
            })

            return result
        } catch (error) {
 	    console.log('eror add rcord', error)
            throw new Error(error)
        }
    }

    async generateRecordData (raw, deviceInfo) {
        const result = {
            deviceUUID: deviceInfo._id,
            companyUid: deviceInfo.companyUid,
            deviceUid: deviceInfo.deviceUid,
            deviceMacId: deviceInfo.deviceMacId,
            time: raw.timestamp,
            sensorValues: {
                temp: raw.val[0] ?? null,
                hum: raw.val[1] ?? null
            }
        }

        // if (deviceInfo.vendor.toLowerCase() === 'akcp') {
        //     result = {
        //         ...result,
        //         sensorValues: {
        //             temp: raw.deviceMacId === deviceInfo.tempMacId ? raw.val[2] : null,
        //             hum: raw.deviceMacId === deviceInfo.humMacId ? raw.val[2] : null
        //         }
        //     }
        // } else if (deviceInfo.vendor.toLowerCase() === 'tzone') {
        //     result = {
        //         ...result,
        //         sensorValues: {
        //             temp: raw.val[0] ?? null,
        //             hum: raw.val[1] ?? null
        //         }
        //     }
        // }
        return result
    }

    async getRecordByDevMacId (devMacId) {
        const records = await this._model.find({ deviceMacId: devMacId }).exec()
        return records
    }

    async getAllRecord (companyUid, deviceUid, filter) {
        const { startTs, endTs } = filter
        const records = await this._model.find({
            deviceUid: deviceUid,
            time: {
                $gt: startTs,
                $lt: endTs
            }
        }).exec()
        return records
    }

    async getAllByDeviceUid (companyUid, deviceUid, filter) {
        const { startTs, endTs } = filter
        // console.log("finding ", deviceUid, filter)
        const records = await this._model.find({
            companyUid: companyUid,
            deviceUid: deviceUid,
            time: {
                $gt: startTs,
                $lt: endTs
            }
        }).exec()
        return records
    }

    generateFineHistory (records) {
        const temperature = []
        const humidity = []

        try {
            for (const r of records) {
                if (r.sensorValues.temp !== null) {
                    temperature.push({
                        value: r.sensorValues.temp,
                        time: r.time
                    })
                }
                if (r.sensorValues.hum !== null) {
                    humidity.push({
                        value: r.sensorValues.hum,
                        time: r.time
                    })
                }
            }

            return { temperature, humidity }
        } catch (error) {
            console.log('Error fine data', error)
            return []
        }
    }

    async getLastRecordsByDevicesIds (devicesIds, periodInSeconds = 60) {
        try {
            const startTime = Date.now() - (periodInSeconds * 1000)
            const records = await this._model.find({
                deviceUUID: { $in: devicesIds },
                time: { $gt: startTime }
            }).exec()
            // const records = await this._model.aggregate().group({ _id: '$deviceMacId', maxTime: { $max: '$time' } })

            return records
        } catch (error) {
            console.error('Error in fetching record by devices id', error)
            return []
        }
    }
}

module.exports = RecordService
