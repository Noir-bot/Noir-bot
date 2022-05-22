export default interface VerificationSchemaInterface {
	guild: string
	status: boolean
	button: string
	embed: {
		title: string
		description: string
		color: string
	},
	response: {
		title: string
		description: string
	}
}