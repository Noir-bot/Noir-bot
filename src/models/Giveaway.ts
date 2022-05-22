import { model, Schema } from 'mongoose'
import GiveawaySchemaInterface from './interfaces/Giveaway'

const GiveawaySchema = new Schema<GiveawaySchemaInterface>({
	guild: { type: String, required: true },
	maintainer: { type: String, required: true },
	duration: { type: String, required: true },
	message: {
		title: { type: String, default: 'Verify' },
		description: { type: String, default: 'Click the button bellow to verify yourself' }
	},
	members: { type: [String], default: [] }
}, {
	timestamps: true
})

export const GiveawayModel = model<GiveawaySchemaInterface>('Giveaway', GiveawaySchema)