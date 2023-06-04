const { PostDevicePayloadSchema, DeleteDeviceParamsSchema, PatchDevicePayloadSchema } = require('./schema')

const DeviceValidator = {
    validatePostDevicePayload: (payload) => {
        const validationResult = PostDevicePayloadSchema.validate(payload)
        if (validationResult.error) {
            throw new Error(validationResult.error.message)
        }
    },

    validatePatchDevicePayload: (payload) => {
        const validationResult = PatchDevicePayloadSchema.validate(payload)
        if (validationResult.error) {
            throw new Error(validationResult.error.message)
        }
    },

    validateDeleteDeviceParams: (params) => {
        const validationResult = DeleteDeviceParamsSchema.validate(params)
        if (validationResult.error) {
            throw new Error(validationResult.error.message)
        }
    }
}

module.exports = DeviceValidator
