import { model, Schema } from 'mongoose'
import PremiumSchemaInterface from './interfaces/Premium'

const PremiumSchema = new Schema<PremiumSchemaInterface>({
	status: { type: Boolean, default: false },
	guild: { type: String, required: true },
	expire: { type: Date, required: true }
}, {
	timestamps: true
})

export const PremiumModel = model<PremiumSchemaInterface>('Premium', PremiumSchema)