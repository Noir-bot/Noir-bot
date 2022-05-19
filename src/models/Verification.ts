import { model, Schema } from 'mongoose'
import { VerificationSchemaInterface } from './interfaces/Verification'

const VerificationSchema = new Schema<VerificationSchemaInterface>({
	guild: { type: String, required: true },
	status: { type: Boolean, default: false },
	button: { type: String, default: 'Verify' },
	embed: {
		title: { type: String, default: '{server name} verification' },
		description: { type: String, default: 'Click the button bellow to verify yourself' },
		color: { type: String, default: '#7d52ff' }
	},
	response: {
		title: { type: String, default: 'Verified' },
		description: { type: String, default: 'Successfully verified' }
	}
})

export const VerificationModel = model<VerificationSchemaInterface>('Verification', VerificationSchema)