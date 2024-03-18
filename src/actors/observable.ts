import {
	type Observer,
	type Subscribable,
	type Subscription,
	createActor,
	fromObservable,
} from 'xstate'

import {
	type FakeDatabase,
	type IAcQuoteCtx,
	fakeDb,
	simulateQuoteChange,
} from '.'

/**
 * Simulates periodic updates for a specific quote in the database and provides
 * a way to subscribe to these updates. Useful for creating observable actors in
 * XState that react to changes in quote data.
 *
 * @param db The fake database instance.
 * @param quoteId The ID of the quote to simulate updates for.
 *
 * @example
 * const quoteUpdates = createQuoteUpdateObservable(fakeDb, 'quote1');
 * const subscription = quoteUpdates.subscribe({
 *   next: (quote) => console.log('Updated quote:', quote),
 * });
 *
 * // To stop listening for updates
 * subscription.unsubscribe();
 */
function createQuoteUpdateObservable(
	db: FakeDatabase,
	quoteId: string,
): Subscribable<IAcQuoteCtx> {
	// let intervalId: number
	return {
		subscribe: (
			observerOrNext: Observer<IAcQuoteCtx> | ((value: IAcQuoteCtx) => void),
			error?: (error: any) => void,
			complete?: () => void,
		): Subscription => {
			const observer =
				typeof observerOrNext === 'function'
					? { next: observerOrNext, error, complete }
					: observerOrNext

			const intervalId = setInterval(() => {
				// Simulating a quote change
				simulateQuoteChange(db, quoteId)

				// Fetching the updated quote by ID from the database after simulation
				const updatedQuote = db.quotes.find(q => q.id === quoteId)

				// Calling the observer with the updated quote if it exists
				if (updatedQuote && observer.next) {
					observer.next(updatedQuote) // Emit the updated quote
				}
			}, 1500) // Interval for simulating quote changes

			return {
				unsubscribe: () => {
					clearInterval(intervalId)
					if (observer.complete) observer.complete()
				},
			}
		},
	}
}

export function quoteFakeUpdateLogic(quoteId: string) {
	return fromObservable(() => createQuoteUpdateObservable(fakeDb, quoteId))
}

const quoteUpdateActor = createActor(quoteFakeUpdateLogic('id'))

// quoteUpdateActor.subscribe({
// 	next: snapshot => console.log('Quote updates:', snapshot.context),
// })

// quoteUpdateActor.start()
