export default interface LogsSchemaInterface {
	guild: string
	channel: string
	status: {
		overall: boolean
		message: boolean
		channel: boolean
		role: boolean
		ban: boolean
		warn: boolean
		kick: boolean
		clear: boolean
		restriction: boolean
	}
}