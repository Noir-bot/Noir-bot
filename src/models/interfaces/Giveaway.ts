export interface GiveawaySchemaInterface {
	guild: string
	duration: string
	maintainer: string
	message: {
		title: string
		description: string
	}
	members?: [string]
}