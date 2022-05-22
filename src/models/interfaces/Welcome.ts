export default interface WelcomeSchemaInterface {
	guild: string
	role: {
		role: [string]
		status: boolean
	}
	message: {
		channel?: string
		guild: {
			status: boolean,
			join: {
				message?: string
				color?: string
				title?: string
				description?: string
				thumbnail?: string
				image?: string
				footer?: string
				timestamp: string
			},
			left: {
				message?: string
				color?: string
				title?: string
				description?: string
				thumbnail?: string
				image?: string
				footer?: string
				timestamp: string
			}
		},
		direct: {
			status: boolean,
			join: {
				message?: string
				color?: string
				title?: string
				description?: string
				thumbnail?: string
				image?: string
				footer?: string
				timestamp: string
			}
		}
	}
}