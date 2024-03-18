export { v4 as uuid } from 'uuid'

export type IActorCtx = {
	id: string
}

export const simulateLoad: (time?: number) => Promise<void> = async time =>
	await new Promise(r => setTimeout(r, time ?? 500))
