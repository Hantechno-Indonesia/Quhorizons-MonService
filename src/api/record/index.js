const RecordHandler = require('./handlers')
const routes = require('./routes')

module.exports = {
    name: 'records',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        console.log('Validator on plugins: ', validator)
        const recordHandler = new RecordHandler(service, validator)
        server.route(routes(recordHandler))
    }
}
