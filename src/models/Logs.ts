import { model, Schema } from 'mongoose'
import { LogsSchemaInterface } from './interfaces/Logs'

const LogsSchema = new Schema<LogsSchemaInterface>({
	guild: { type: String, required: true },
	channel: { type: String },
	status: {
		overall: { type: Boolean, default: true },
		message: { type: Boolean, default: false },
		role: { type: Boolean, default: false },
		ban: { type: Boolean, default: false },
		warn: { type: Boolean, default: true },
		kick: { type: Boolean, default: false },
		clear: { type: Boolean, default: true },
		restriction: { type: Boolean, default: true }
	}
}, {
	timestamps: true
})

export const LogsModel = model<LogsSchemaInterface>('Logs', LogsSchema)