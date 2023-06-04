const ClientError = require('../../Exceptions/ClientError')
const DBDeleteError = require('../../Exceptions/DbDeleteError')
const NotFoundError = require('../../Exceptions/NotFoundError')

class GatewayHandler {
    constructor (service, validator) {
        const { gatewayService, deviceService } = service
        this._service = gatewayService
        this._deviceService = deviceService
        this._validator = validator

        this.postGatewayHandler = this.postGatewayHandler.bind(this)
        this.patchGatewayByIdHandler = this.patchGatewayByIdHandler.bind(this)
        this.deleteGatewayByIdHandler = this.deleteGatewayByIdHandler.bind(this)
        this.getGatewayStatusByCompanyHandler = this.getGatewayStatusByCompanyHandler.bind(this)
        this.getGatewayStatusByInventoryHandler = this.getGatewayStatusByInventoryHandler.bind(this)
        this.getGatewayStatusByWarehouseHandler = this.getGatewayStatusByWarehouseHandler.bind(this)
    }

    async postGatewayHandler (request, h) {
        try {
            console.log('add gateway', request.payload)

            this._validator.validatePostGatewayPayload(request.payload)

            const insertGateway = await this._service.addGateway(request.payload)

            const response = h.response({
                status: 'success',
                message: 'gateway created successfully',
                data: insertGateway
            })

            response.code(200)
            return response
        } catch (error) {
            const response = h.response({
                status: 'fail',
                message: error.message
            })
            response.code(400)
            return response
        }
    }

    async patchGatewayByIdHandler (request, h) {
        try {
            this._validator.validatePatchGatewayPayload(request.payload)

            const { companyUid, gatewayUid } = request.params
            const updateGateway = await this._service.updateGatewayByCompanyGatewayUid(companyUid, gatewayUid, request.payload)

            const response = h.response({
                status: 'success',
                message: 'Gateway has been updated',
                data: updateGateway
            })

            response.code(200)
            return response
        } catch (error) {
            const response = h.response({
                status: 'fail',
                message: error.message
            })
            response.code(400)
            return response
        }
    }

    async deleteGatewayByIdHandler (request, h) {
        try {
            const { companyUid, gatewayUid } = request.params
            console.log(request.params);
            const removeGateway = await this._service.removeGatewayByCompanyGatewayUid(companyUid, gatewayUid)

            if (removeGateway.n === 0) {
                console.log('device not found')
                // throw new NotFoundError('Data device not found', 404, 'handler')
            } else if (!removeGateway.ok || removeGateway.deletedCount === 0) {
                throw new DBDeleteError('Device found but not deleted', 500, 'devicedb', removeGateway)
            }

            const response = h.response({
                status: 'success',
                message: 'device deleted successfully',
                data: removeGateway
            })

            response.code(200)
            return response
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message
                })
                response.code(error.statusCode)
                return response
            } else {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                    extra: error.extra
                })
                response.code(500)
                return response
            }
        }
    }

    async getGatewayStatusHandler (request, h) {
        // get specific gateway status
    }

    async getGatewayStatusByCompanyHandler (request, h) {
        const { companyUid } = request.params

        const gatewayInfos = await this._service.getGatewaysByCompanyUid(companyUid)
        const gatewayMacIds = gatewayInfos.map(gw => gw.gatewayMacId)

        const devices = await this._deviceService.getDevicesByGatewayMacIds(gatewayMacIds)

        const fineData = this._service.generateFineStatus(gatewayInfos, devices)

        const response = h.response({
            status: 0,
            data: fineData
        })
        response.code(200)
        return response
    }

    async getGatewayStatusByInventoryHandler (request, h) {
        const { companyUid, inventoryUid } = request.params
        console.log("CompanyUid", companyUid, inventoryUid)

        const gatewayInfos = await this._service.getGatewaysByCompanyInventoryUid(companyUid, inventoryUid)
        const gatewayMacIds = gatewayInfos.map(gw => gw.gatewayMacId)

        const devices = await this._deviceService.getDevicesByGatewayMacIds(gatewayMacIds)

        const fineData = this._service.generateFineStatus(gatewayInfos, devices)

        const response = h.response({
            status: 0,
            data: fineData
        })
        response.code(200)
        return response
    }

    async getGatewayStatusByWarehouseHandler (request, h) {
        const { companyUid, warehouseUid } = request.params
        console.log("CompanyUid", companyUid, warehouseUid)

        const gatewayInfos = await this._service.getGatewaysByCompanyWarehouseUid(companyUid, warehouseUid)
        const gatewayMacIds = gatewayInfos.map(gw => gw.gatewayMacId)

        const devices = await this._deviceService.getDevicesByGatewayMacIds(gatewayMacIds)

        const fineData = this._service.generateFineStatus(gatewayInfos, devices)

        const response = h.response({
            status: 0,
            data: fineData
        })
        response.code(200)
        return response
    }
}

module.exports = GatewayHandler
