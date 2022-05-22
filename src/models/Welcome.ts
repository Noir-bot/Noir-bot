import { model, Schema } from 'mongoose'
import WelcomeSchemaInterface from './interfaces/Welcome'

const WelcomeSchema = new Schema<WelcomeSchemaInterface>({
	guild: { type: String, required: true },
	role: {
		role: { type: [String], default: [] },
		status: { type: Boolean, default: true }
	},
	message: {
		channel: { type: String },
		guild: {
			status: { type: Boolean, default: true },
			join: {
				message: { type: String },
				color: { type: String },
				title: { type: String },
				description: { type: String },
				thumbnail: { type: String },
				image: { type: String },
				footer: { type: String },
				timestamp: { type: Boolean, default: false }
			},
			left: {
				message: { type: String },
				color: { type: String },
				title: { type: String },
				description: { type: String },
				thumbnail: { type: String },
				image: { type: String },
				footer: { type: String },
				timestamp: { type: Boolean, default: false }
			}
		},
		direct: {
			status: { type: Boolean, default: false },
			join: {
				message: { type: String },
				color: { type: String },
				title: { type: String },
				description: { type: String },
				thumbnail: { type: String },
				image: { type: String },
				footer: { type: String },
				timestamp: { type: Boolean, default: false }
			}
		}
	}
}, {
	timestamps: true
})

export const WelcomeModel = model<WelcomeSchemaInterface>('Welcome', WelcomeSchema)