// const DeviceModel = require('./../Models/device')
const _ = require('lodash')

class DeviceService {
    constructor (model) {
        this._model = model
    }

    async addDevice (data) {
        try {
            const device = new this._model(data)
            const deviceCount = await this.getByDeviceMacOrUid(data.deviceUid, device.deviceMacId)

            if (deviceCount > 0) {
                return {
                    status: 'failed',
                    message: 'Device Already Exists'+deviceCount,
                    filter: [data.deviceUid, device.deviceMacId]
                }
            }

            return await device.save(function (err, res) {
                if (err) throw err
                return res
            })
        } catch (error) {
            console.log(error)
            throw new Error(error)
        }
    }

    async getByDeviceMacOrUid (uid, mac) {
        try {
            const deviceCount = await this._model.countDocuments({ $or: [{ deviceUid: uid }, { deviceMacId: mac }] })
            return deviceCount
        } catch (error) {
            throw new Error(error)
        }
    }

    async removeDeviceByCompanyDeviceUid (companyUid, deviceUid) {
        console.log('deleting', companyUid, deviceUid)
        const result = await this._model.deleteOne({
            companyUid: companyUid, deviceUid: deviceUid
        })
        return result
    }

    async updateDeviceByCompanyDeviceUid (companyUid, deviceUid, data) {
        try {
            const device = await this._model.updateOne({
                companyUid: companyUid, deviceUid: deviceUid
            }, data, function (err, res) {
                if (err) throw new Error(err)
            })

            return device
        } catch (error) {
            throw new Error(error)
        }
    }

    async getDeviceByDeviceMacId (deviceMacId, vendor) {
        try {
            const device = await this._model.findOne({ deviceMacId: deviceMacId })
            return device
            // if (vendor.toLowerCase() === 'akcp') {
            //     const device = await this._model.findOne({ $or: [{ tempMacId: deviceMacId }, { humMacId: deviceMacId }] })
            //     return device
            // } else if (vendor.toLowerCase() === 'tzone') {
            //     const device = await this._model.findOne({ deviceMacId: deviceMacId })
            //     return device
            // }
        } catch (error) {
	    console.log('eror retrieve device data', error)
            throw new Error(error)
        }
    }

    async getDeviceByCompanyUid (companyUid, deviceUid = null) {
        try {
            let filter = { companyUid: companyUid}
            if (deviceUid !== null) {
                filter.deviceUid = deviceUid
            }
            const devices = await this._model.find(filter).exec()
            return devices
        } catch (error) {
            console.log('error fetching device by companyUid', error)
            return []
        }
    }

    async getDeviceByCompanyInventoryUid (companyUid, inventoryUid, deviceUid) {
        try {
            let filter = { companyUid: companyUid, inventoryUid: inventoryUid }
            if (deviceUid !== null) {
                filter.deviceUid = deviceUid
            }
            // console.log('filter', filter, deviceUid)
            const devices = await this._model.find(filter).exec()
            return devices
        } catch (error) {
            console.log('error fetching device by companyUid', error)
            return []
        }
    }

    generateFineStatus (deviceInfos, records, periodInSeconds = 60) {
        const grouped = _.groupBy(records, 'deviceUUID')
        for (const gridx in grouped) {
            grouped[gridx] = _.sortBy(grouped[gridx], 'time')
        }

        const fineStatus = deviceInfos.map(di => {
            const meta = {
                deviceUUID: di.deviceUUID,
                inventoryUid: di.inventoryUid,
                deviceUid: di.deviceUid,
                deviceMacId: di.deviceMacId,
                deviceVendor: di.vendor,
                lastTemp: di.lastTemp,
                humVal: di.lastHum
            }
            if (typeof grouped[di._id] !== 'undefined') {
                const record = grouped[di._id][grouped[di._id].length - 1]
                let tempVal = di.lastTemp
                let humVal = di.lastHum
                for (const rec of grouped[di._id]) {
                    if (rec.sensorValues.temp !== null) {
                        tempVal = rec.sensorValues.temp
                    }

                    if (rec.sensorValues.hum !== null) {
                        humVal = rec.sensorValues.hum
                    }
                }
                // return []
                return {
                    ...meta,
                    time: record.time,
                    tempVal: tempVal,
                    humVal: humVal,
                    isOnline: record.time > (Date.now() - (periodInSeconds * 1000))
                }
            } else {
                return {
                    ...meta,
                    isOnline: false
                }
            }
        })
        return fineStatus
    }

    generateFineStatus2 (deviceInfos, periodInSeconds = null) {
        if (periodInSeconds == null) {
            periodInSeconds = process.env.offlineTimeLimitInSecond
        }
        const meta = deviceInfos.map(dv => {
            return {
                name: dv.deviceName,
                inventoryUid: dv.inventoryUid,
                deviceUid: dv.deviceUid,
                deviceMacId: dv.deviceMacId,
                deviceVendor: dv.vendor,
                lastTemp: dv.lastTemp,
                lastHum: dv.lastHum,
                lastRecord: dv.lastRecord,
                isOnline: dv.lastRecord ? dv.lastRecord > (Date.now() - (periodInSeconds * 1000)) : false,
            }
        })
        return meta
    }

    async getDevicesByGatewayMacIds (gatewayMacIds) {
        try {
            const devices = this._model.find({ gatewayMacId: { $in: gatewayMacIds } }).exec()
            return devices
        } catch (error) {
            console.log('Error fetching devices by gateway mac ids', error)
            return []
        }
    }

    async getAllDevices (periodInSeconds = null) {
        try {
            if (periodInSeconds == null) {
                periodInSeconds = process.env.offlineTimeLimitInSecond
            }
            // const devices = this._model.find({ lastRecord: { $gt: Date.now() - (periodInSeconds * 100000) } }).exec()
            const devices = this._model.find().exec()
            return devices
        } catch (error) {
            console.log('Error fetching devices', error)
            return []
        }
    }

    async getDeviceOnlineStatus (periodInSeconds = null) {
        try {
            if (periodInSeconds == null) {
                periodInSeconds = process.env.offlineTimeLimitInSecond
            }
            // const devices = this._model.find({ lastRecord: { $gt: Date.now() - (periodInSeconds * 100000) } }).exec()
            const devices = await this._model.find().exec()
            // return devices
            const online = devices.filter(it => it.lastRecord > (Date.now() - (periodInSeconds * 1000)))
            // return online
            return {
                online: online.length,
                offline: devices.length - online.length
            }
        } catch (error) {
            console.log('Error fetching devices', error)
            return []
        }
    }
}

module.exports = DeviceService
