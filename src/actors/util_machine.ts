import { Err, None, Ok, type Option, type Result, Some } from 'ts-results'
import {
	assign,
	createActor,
	createMachine,
	fromPromise,
	setup,
	spawnChild,
} from 'xstate'

import {
	ErrBadRequest,
	type Error,
	type IAcQuote,
	type IActorCtx,
	acQuoteStateMachine,
	fakeDb,
	mock_authors,
	mock_quotes,
	simulateLoad,
} from '.'

// const libraryMachine = createMachine({
//   id: 'library',
//   initial: 'idle',
//   states: {
//     idle: {
//       on: {
//         FETCH: 'fetching'
//       }
//     },
//     fetching: {
//       invoke: {
//         src: libraryService.getRecommendations,
//         onDone: {
//           target: 'idle',
//           actions: send((context, event) => ({ type: 'DONE', data: event.data }), { to: (context) => context.parent })
//         },
//         onError: 'idle'
//       }
//     }
//   }
// });

// // Modify mainPageMachine to communicate with libraryActor
// const mainPageMachine = createMachine({
//   id: 'mainPage',
//   initial: 'loading',
//   context: {
//     quotes: [],
//     libraryActor: undefined
//   },
//   entry: (context) => {
//     context.libraryActor = spawnChild(libraryMachine, 'library');
//   },
//   states: {
//     loading: {
//       entry: send('FETCH', { to: (context) => context.libraryActor }),
//       on: {
//         DONE: {
//           target: 'loaded',
//           actions: (context, event) => {
//             context.quotes = event.data.map(quote => spawn(quoteActor(quote)));
//           }
//         }
//       }
//     },
//     loaded: {},
//     failure: {}
//   }
// });

export interface IAcAuthor extends IActorCtx {
	fullname: string
	birthDate: Option<Date>
	isDraft: boolean
}

export interface IAcEditor extends IActorCtx {
	quote: Option<IAcQuote>
	author: Option<IAcAuthor>
	showUi: boolean
}

// ===================
// Context

interface IAcLibraryCtx extends IActorCtx {
	readonly quotes: IAcQuote[]
	readonly authors: IAcAuthor[]
	readonly editors: IAcEditor[]
}
const AcLibraryCtxInitial: IAcLibraryCtx = {
	id: 'aclibrary',
	quotes: [],
	authors: [],
	editors: [],
}

// ===================
// Actor's methods (aka events in XState)

interface AcLibraryEventGetRecommendations {
	readonly type: 'AcLibrary.getRecommendations'
}
type AcLibraryEvents = AcLibraryEventGetRecommendations

// ===================
// Actions

// const onGetRecommendations = (ctx: IAcLibraryCtx): Partial<IAcLibraryCtx> => ({
// 	quotes: ctx.quotes,
// 	authors: ctx.authors,
// 	editors: ctx.editors,
// })

// ===================
// Actor and its logic in the state machine

// export const acLibraryStateMachine = setup({
// 	types: {
// 		context: {} as IAcLibraryCtx,
// 		events: {} as AcLibraryEvents,
// 	},
// }).createMachine({
// 	context: AcLibraryCtxInitial,
// 	initial:,
// 	states: {
// 		Initialize
// 	},
// 	on: {
// 		'AcLibrary.getRecommendations': {
// 			actions: assign({
// 				quotes: ({ context }) => {
// 					for (const quote of context.quotes) {
// 						spawnChild(acQuoteStateMachine, {
// 							id: quote.id,
// 							input: {
// 								text: quote.text,
// 								authorRef: quote.authorRef,
// 								collectionRef: quote.collectionRef,
// 								isDraft: quote.isDraft,
// 								createdAt: quote.createdAt,
// 							},
// 						})
// 					}
// 					return context.quotes
// 				},
// 				authors: ({ context }) => context.authors,
// 				editors: ({ context }) => context.editors,
// 			}),
// 		},
// 	},
// })
// export const actorLibrary = createActor(acLibraryStateMachine, { inspect })

/**
 * It loads all the actor quotes and authors to the Tarant system and make a copy
 * to ActorLibrary.
 */
export async function getQuotesRecommendations(): Promise<
	Result<{ quotes: IAcQuote[]; authors: IAcAuthor[] }, Error>
> {
	try {
		await simulateLoad()

		return Ok({
			quotes: fakeDb.quotes,
			authors: fakeDb.authors,
		})
	} catch (error) {
		return Err(new ErrBadRequest('Failed to load recommendations'))
	}
}

export const getRecommendationLogic = fromPromise(async () => {
	return getQuotesRecommendations()
})

// const acLibraryPromise = fromPromise(async () => {
// 	const content = await getQuotesRecommendations()
// 	if (content.ok) return content.val
// 	return content.val
// })

// const acLibrary = createActor(acLibraryPromise)
