// const DeviceModel = require('./../Models/device')
const fetch = require('node-fetch')

class WaslService {
    constructor () {
        this.waslServiceUrl = 'http://localhost:5003'
    }

    async sendInvState (companyUid, inventoryUid, data) {
        const payload = {
            companyUid: companyUid,
            inventoryUid: inventoryUid,
            temperature: data.rTemp ?? 0,
            humidity: data.rHum ?? 0
        }

        // console.log('Call State')

        try {
            const url = `${this.waslServiceUrl}/inventory/state`
            console.log(url)
            return fetch(url, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            }).then(res => {
                console.log('wasl inv stats', res.status)
                if (res.status === 200) {
                    return res.json()
                } else return res.json()
            }).then(resData => {
            }).catch(err => {
                console.log('error', err)
            })
        } catch (error) {
            console.log(error)
            // throw new Error(error)
        }
    }
}

module.exports = WaslService
