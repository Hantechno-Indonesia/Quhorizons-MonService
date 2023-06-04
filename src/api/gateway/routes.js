
const routes = (handler) => [
    {
        method: 'POST',
        path: '/gateway',
        handler: handler.postGatewayHandler
    },
    {
        method: 'PATCH',
        path: '/gateway/{companyUid}/{gatewayUid}',
        handler: handler.patchGatewayByIdHandler
    },
    {
        method: 'DELETE',
        path: '/gateway/{companyUid}/{gatewayUid}',
        handler: handler.deleteGatewayByIdHandler
    },
    {
        method: 'GET',
        path: '/gateway/{companyUid}/status',
        handler: handler.getGatewayStatusByCompanyHandler
    },
    {
        method: 'GET',
        path: '/gateway/{companyUid}/status/{warehouseUid}',
        handler: handler.getGatewayStatusByWarehouseHandler
    }
]

module.exports = routes
