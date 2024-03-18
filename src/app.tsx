import { createBrowserInspector } from '@statelyai/inspect'
import { useMachine } from '@xstate/react'

import { fypStateMachine } from './actors'
import { Button } from './components'

const inspector = createBrowserInspector({
	autoStart: false,
})

export const App = () => {
	const [state, send] = useMachine(fypStateMachine, {
		inspect: inspector.inspect,
	})

	const content = () => {
		switch (true) {
			case state.matches('idle'):
				return 'Idle'
			case state.matches('loading'):
				return 'Loading... ⏳'
			case state.matches('ok'):
				return state.context.quotes.map(quote => quote.text)
			case state.matches('error'):
				// if (state.context.error.some) return state.context.error.toString()
				return null
			default:
				return 'Problems... 🧑‍🔧'
		}
	}

	return (
		<>
			<div className='flex-1 overflow-x-hidden rounded-xl space-y-4'>
				{content()}
				{/* {renderQuotes()} */}
			</div>
			<div className='flex flex-col items-end space-y-1 pb-3'>
				{/* {renderEditors()} */}
			</div>
			{/* Floating button */}
			<Button
				tooltip='ACTION: ActorEditorsManager.addEditor'
				// onClick={() => actorEditorsManager.addEditor(None)}
				className='fixed top-0 right-0 m-4'
			>
				Add Quote
			</Button>
		</>
	)
}
