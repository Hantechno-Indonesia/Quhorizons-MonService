const routes = (handler) => [
    {
        method: 'POST',
        path: '/record',
        handler: handler.postRecordSingleHandler
    },
    {
        method: 'GET',
        path: '/record/{deviceMacId}',
        handler: handler.getRecordByDevMacIdHandler
    },
    {
        method: 'GET',
        path: '/record/{companyUid}/{deviceUid}',
        handler: handler.getAllRecord
    },
    {
        method: 'GET',
        path: '/record/{companyUid}/{deviceUid}/bytime',
        handler: handler.getAllRecordByTime
    },
    {
        method: 'GET',
        path: '/ping',
        handler: handler.checkSystemOnline
    }
]

module.exports = routes
