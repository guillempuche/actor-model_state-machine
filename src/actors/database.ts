import { None, Some } from 'ts-results'

import { type IAcAuthor, type IAcQuote, mock_authors, mock_quotes } from '.'

interface QuotesSubscriber {
	updateQuotes: (quotes: IAcQuote[]) => void
}

interface AuthorsSubscriber {
	updateAuthors: (authors: IAcAuthor[]) => void
}

export class FakeDatabase {
	#quotes: IAcQuote[]
	#authors: IAcAuthor[]
	// #quotesSubscribers: QuotesSubscriber[]
	#quoteObservers: Function[] = []
	#authorsSubscribers: AuthorsSubscriber[]

	constructor(quotes: IAcQuote[] = [], authors: IAcAuthor[] = []) {
		this.#quotes = quotes
		this.#authors = authors
		// this.#quotesSubscribers = []
		this.#quoteObservers = []
		this.#authorsSubscribers = []
	}

	get quotes() {
		return this.#quotes
	}

	get authors() {
		return this.#authors
	}

	// subscribeToQuotes(subscriber: QuotesSubscriber) {
	// this.#quotesSubscribers.push(subscriber)
	// }
	subscribeToQuoteChanges(observer: Function) {
		this.#quoteObservers.push(observer)
	}

	// unsubscribeFromQuotes(subscriber: QuotesSubscriber) {
	// 	this.#quotesSubscribers = this.#quotesSubscribers.filter(
	// 		sub => sub !== subscriber,
	// 	)
	// }
	unsubscribeFromQuoteChanges(observer: Function) {
		this.#quoteObservers = this.#quoteObservers.filter(obs => obs !== observer)
	}

	subscribeToAuthors(subscriber: AuthorsSubscriber) {
		this.#authorsSubscribers.push(subscriber)
	}

	unsubscribeFromAuthors(subscriber: AuthorsSubscriber) {
		this.#authorsSubscribers = this.#authorsSubscribers.filter(
			sub => sub !== subscriber,
		)
	}

	updateQuoteById(quoteId: string, newText: string) {
		const quote = this.#quotes.find(q => q.id === quoteId)
		if (quote) {
			quote.text = newText
			this.notifyQuotesSubscribers()
		}
	}

	updateAuthorById(authorId: string, newFullname: string) {
		const author = this.#authors.find(a => a.id === authorId)
		if (author) {
			author.fullname = newFullname
			this.notifyAuthorsSubscribers()
		}
	}

	// setQuote(quote: IAcQuote) {
	// 	const index = this.#quotes.findIndex(q => q.id === quote.id)
	// 	if (index > -1) {
	// 		this.#quotes[index] = quote
	// 	} else {
	// 		this.#quotes.push(quote)
	// 	}
	// 	this.notifyQuotesSubscribers()
	// }
	// setAuthor(author: IAcAuthor) {
	// 	const index = this.#authors.findIndex(a => a.id === author.id)
	// 	if (index > -1) {
	// 		this.#authors[index] = author
	// 	} else {
	// 		this.#authors.push(author)
	// 	}
	// 	this.notifyAuthorsSubscribers()
	// }

	// private notifyQuotesSubscribers() {
	// 	this.#quotesSubscribers.forEach(subscriber =>
	// 		subscriber.updateQuotes(this.#quotes),
	// 	)
	// }
	private notifyQuotesSubscribers() {
		this.#quoteObservers.forEach(obs => obs(this.#quotes))
	}

	private notifyAuthorsSubscribers() {
		this.#authorsSubscribers.forEach(subscriber =>
			subscriber.updateAuthors(this.#authors),
		)
	}
}

export const fakeDb = new FakeDatabase(
	mock_quotes.map(mock => ({
		id: mock.id,
		text: mock.text,
		authorRef: !mock.authorRef ? None : Some(mock.authorRef),
		collectionRef: !mock.collectionRef ? None : Some(mock.collectionRef),
		createdAt: mock.createdAt,
		isDraft: mock.isDraft,
	})),
	mock_authors.map(mock => ({
		id: mock.id,
		fullname: mock.fullname,
		birthDate: !mock.birthDate ? None : Some(mock.birthDate),
		isDraft: mock.isDraft,
	})),
)

// ===========================================
// Simulators to make database change.

// export function simulateQuoteChange(
// 	db: FakeDatabase,
// 	quoteId: string,
// 	min: number,
// 	max: number,
// ) {
// 	const simulateChange = () => {
// 		const delay = Math.random() * (max - min) + min
// 		setTimeout(() => {
// 			const quote = db.quotes.find(q => q.id === quoteId)
// 			if (quote) {
// 				const newText = modifyQuoteText(quote.text)
// 				db.updateQuoteById(quoteId, newText)
// 				console.debug(`Quote ${quoteId} updated to: "${newText}"`)
// 				simulateChange() // Repeat for continuous updates
// 			}
// 		}, delay)
// 	}
// 	simulateChange()
// }
export function simulateQuoteChange(db: FakeDatabase, quoteId: string) {
	const quote = db.quotes.find(q => q.id === quoteId)
	if (quote) {
		const newText = modifyQuoteText(quote.text)
		db.updateQuoteById(quoteId, newText)
		console.debug(`Quote ${quoteId} updated to: "${newText}"`)
	}
}

export function simulateAuthorChange(
	db: FakeDatabase,
	authorId: string,
	min: number,
	max: number,
) {
	const simulateChange = () => {
		const delay = Math.random() * (max - min) + min
		setTimeout(() => {
			const author = db.authors.find(a => a.id === authorId)
			if (author) {
				const newFullname = modifyAuthorName(author.fullname)
				db.updateAuthorById(authorId, newFullname)
				console.debug(`Author ${authorId} updated to: "${newFullname}"`)
				simulateChange() // Repeat for continuous updates
			}
		}, delay)
	}

	simulateChange()
}

// Randomly adds or deletes words from a quote
function modifyQuoteText(originalText: string): string {
	const actions = ['add', 'delete']
	const action = actions[Math.floor(Math.random() * actions.length)]
	const words = originalText.split(' ')

	if (
		action === 'add' &&
		words.length < 10 // Limiting to prevent excessively long quotes
	) {
		const newWord = 'new' // Simplification; ideally, pick from a list of meaningful words
		const position = Math.floor(Math.random() * words.length)
		words.splice(position, 0, newWord)
	} else if (action === 'delete' && words.length > 1) {
		// Ensuring we don't delete the last word
		const position = Math.floor(Math.random() * words.length)
		words.splice(position, 1)
	}

	return words.join(' ')
}

// Randomly changes part of an author's name
function modifyAuthorName(originalName: string): string {
	const nameParts = originalName.split(' ')
	let newNameParts = []
	const firstNames = [
		'Alex',
		'Blake',
		'Casey',
		'Dana',
		'Elliot',
		'Jamie',
		'Morgan',
		'Quinn',
		'Riley',
		'Taylor',
	]
	const surnames = [
		'Adams',
		'Brooks',
		'Carter',
		'Davis',
		'Evans',
		'Flynn',
		'Green',
		'Hill',
		'Lee',
		'Murphy',
	]

	// Decide randomly whether to change the first name or the surname
	if (Math.random() < 0.5 || nameParts.length === 1) {
		// Change the first name
		const newFirstName =
			firstNames[Math.floor(Math.random() * firstNames.length)]
		newNameParts = [newFirstName]
		if (nameParts.length > 1) {
			newNameParts.push(nameParts[1]) // Keep the original surname if it exists
		}
	} else {
		// Change the surname
		newNameParts = [nameParts[0]] // Keep the original first name
		const newSurname = surnames[Math.floor(Math.random() * surnames.length)]
		newNameParts.push(newSurname)
	}

	return nameParts.join(' ')
}

// // Example subscription to quotes
// fakeDb.subscribeToQuotes({
// 	updateQuotes: quotes => console.log('Updated quotes:', quotes),
// })
// // Example subscription to authors
// fakeDb.subscribeToAuthors({
// 	updateAuthors: authors => console.log('Updated authors:', authors),
// })
