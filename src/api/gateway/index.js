const GatewayHandler = require('./handlers')
const routes = require('./routes')

module.exports = {
    name: 'gateway',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        const gatewayHandler = new GatewayHandler(service, validator)
        server.route(routes(gatewayHandler))
    }
}
