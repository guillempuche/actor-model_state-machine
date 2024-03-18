import { None, type Option, Some } from 'ts-results'
import { assign, createActor, setup, spawnChild } from 'xstate'

import {
	type IAcAuthor,
	type IAcQuote,
	fakeDb,
	getRecommendationLogic,
} from '.'

export enum LibraryIds {
	author = 'author',
	collection = 'collectionyar',
	editorsManager = 'editors-manager',
	editor = 'editor',
	quote = 'quote',
}

type OutputResult = {
	ok: boolean
	err: boolean
}

// Example subscription to quotes
fakeDb.subscribeToQuotes({
	updateQuotes: quotes => console.log('Updated quotes:', quotes),
})

// Example subscription to authors
fakeDb.subscribeToAuthors({
	updateAuthors: authors => console.log('Updated authors:', authors),
})

export const fypStateMachine = setup({
	types: {
		context: {} as {
			readonly quotes: IAcQuote[]
			readonly authors: IAcAuthor[]
			readonly errors: Option<Error[]>
		},
		events: {} as { type: 'fyp.FETCH' },
		output: {} as OutputResult,
	},
	actors: {
		'library.getRecommendations': getRecommendationLogic,
		// 'database.watchQuote': ,
	},
	guards: {
		isResultOk: ({ event }) => {
			return event.output.ok
		},
		// isResultOk: ({ event }) => {
		// 	return (event as EventResult).ok
		// },
		isResultErr: ({ event }) => {
			return event.output.err
		},
	},
}).createMachine({
	/** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOlwgBswBiCAe0LPwDc6BrMEtLPQ08qggKtM6AC64GAbQAMAXVlzEoAA51YuCQ2UgAHogDMAFgCcJABwBGAEymA7NYCsdx+YMAaEAE9EVkgetrE0tzW0dLADYIkwiAX1jPbhwCYjJKGnpGYXZOJN5UgTAhFjpRLXxFKUslJBA1DXKdfQRjMytbEwdnVw9vREs7AxJnGQNLAzs7EJDHR3iEkHw6CDgdPJSiHXrNSXwmxABaCM8fBAPHEhMr65ubg3jEjGS+NKot9R3tWuajaxPEExDcLGVy-IyDTrmB4gdYvCh0dAQAhQd4NXb7BCWX4kLGdAwyCKOGQDOwxf6YkzmCw2QGWAaOK7mOzQ2Gpdioz57b6ISaWYZjQJGCJWNzmEzkywyawkOzEtzWAyUhwRUYsp75UhgABOWroWo5jW5CF5-JstmFIQMYolJiMl1MgVJTgmdji8yAA */
	id: 'fyp',
	context: {
		quotes: [],
		authors: [],
		errors: None,
	},
	invoke: {
		src: 'library.getRecommendations',
		input: ({ context }) => ({
			quotes: [],
			authors: [],
			errors: None,
		}),
	},
	initial: 'idle',
	states: {
		idle: {
			always: {
				target: 'loading',
			},
		},
		loading: {
			invoke: {
				src: 'library.getRecommendations',
				onDone: [
					{
						target: 'ok',
						guard: 'isResultOk',
						actions: assign({
							quotes: ({ event }) => {
								return event.output.unwrap().quotes
							},
							authors: ({ event }) => {
								return event.output.unwrap().authors
							},
							errors: None,
						}),
					},
					{
						target: 'error',
						guard: 'isResultErr',
						actions: assign({
							errors: ({ event }) => {
								return Some([event.output.val as Error])
							},
						}),
					},
				],
			},
		},
		ok: {},
		error: {},
	},
})
