import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App.1.tsx'
import './global.css'

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
)
