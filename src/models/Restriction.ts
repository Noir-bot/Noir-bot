import { model, Schema } from 'mongoose'
import RestrictionSchemaInterface from './interfaces/Restriction'

const RestrictionSchema = new Schema<RestrictionSchemaInterface>({
	guild: { type: String, required: true },
	user: { type: String, required: true },
	moderator: { type: String, required: true },
	reason: { type: String },
	duration: { type: Number },
	reference: { type: String }
}, {
	timestamps: true
})

export const RestrictionModel = model<RestrictionSchemaInterface>('Restriction', RestrictionSchema)