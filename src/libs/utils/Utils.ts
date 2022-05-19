import ms from 'ms'
import { promisify } from 'util'
import { durationRegex } from '../../config/config'
import NoirClient from '../structures/Client'

export default class NoirUtils {
	public client: NoirClient

	constructor(client: NoirClient) {
		this.client = client
	}

	public capitalize(paragraph: string, underscore?: boolean) {
		return underscore ? (paragraph.charAt(0).toUpperCase() + paragraph.slice(1)).replace(/\_/, ' ') : paragraph.charAt(0).toUpperCase() + paragraph.slice(1)
	}

	public convertSeconds(seconds: number) {
		return seconds >= 60 ? seconds >= 3600 ? seconds / 3600 + ' hours' : seconds / 60 + ' minutes' : seconds + ' seconds'
	}

	public async wait(duration: string) {
		const durationParams = durationRegex.exec(duration)
		const wait = promisify(setTimeout)

		if (durationParams && durationParams[1] != duration && ms(duration.replace(durationParams[1], '')) + ms(durationParams[1]) <= 604800000) return await wait(ms(duration.replace(durationParams[1], '')) + ms(durationParams[1]))
		else if (durationParams != null && durationParams[1] == duration && ms(duration) <= 604800000) return await wait(ms(duration))
		else return
	}
}