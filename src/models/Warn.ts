import { model, Schema } from 'mongoose'
import WarnSchemaInterface from './interfaces/Warn'

const WarnSchema = new Schema<WarnSchemaInterface>({
	guild: { type: String, required: true },
	user: { type: String, required: true },
	moderator: { type: String, required: true },
	reason: { type: String },
	reference: { type: String }
}, {
	timestamps: true
})

export const WarnModel = model<WarnSchemaInterface>('Warn', WarnSchema)