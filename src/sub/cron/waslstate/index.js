const cron = require('node-cron')
const _ = require('lodash')

const initCron = (services) => {
    const { deviceService, waslService } = services
    cron.schedule('*/30 * * * * *', async () => {
        console.log("running wasl state call")
        const devices = await deviceService.getAllDevices()
        const groupedByInventory = _.groupBy(devices, 'inventoryUid')
        // console.log('GI', groupedByInventory)
        for (const invX in groupedByInventory) {
            // console.log(invX)
            let totalTemp = 0
            let totalHum = 0
            let counterTemp = 0
            let counterHum = 0

            for (const dev of groupedByInventory[invX]) {
                if (dev.deviceMacId === 'test') continue
                if (dev.lastTemp) {
                    counterTemp++
                    totalTemp += dev.lastTemp
                }
                if (dev.lastHum) {
                    counterHum++
                    totalHum += dev.lastHum
                }
            }
            const data = { name: 'test' }
            if (counterTemp > 0) {
                data.rTemp = (totalTemp / counterTemp).toFixed(2)
            }
            if (counterHum > 0) {
                data.rHum = (totalHum / counterHum).toFixed(2)
            }
            waslService.sendInvState(groupedByInventory[invX][0].companyUid, invX, data)
        }
    })
}

module.exports = { initCron }
