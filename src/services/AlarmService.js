// const DeviceModel = require('./../Models/device')
const fetch = require('node-fetch')

class AlarmService {
    constructor (model = null) {
        this._model = model
    }

    async check (data) {
        try {
            return fetch('http://localhost:5002/alarm/check', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            }).then(res => {
                console.log('check', res.status)
                if (res.status === 200) {
                    return res.json()
                }
            })
        } catch (error) {
            throw new Error(error)
        }
    }
}

module.exports = AlarmService
