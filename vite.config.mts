import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

export default defineConfig({
	server: {
		open: false,
		port: 3000,
	},
	plugins: [react({ devTarget: 'esnext' })],
})
