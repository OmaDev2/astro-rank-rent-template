/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				// SISTEMA SEMÁNTICO (Flexible)
				// Usamos esta sintaxis rara para permitir opacidades (ej: bg-primary/50)
				primary: 'rgb(var(--color-primary) / <alpha-value>)',
				secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
				surface: 'rgb(var(--color-surface) / <alpha-value>)',
				accent: 'rgb(var(--color-accent) / <alpha-value>)',

				// Fondos y Textos
				// body: 'rgb(var(--color-bg-body) / <alpha-value>)', // DEPRECATED: Use secondary for BG
				heading: 'rgb(var(--color-text-heading) / <alpha-value>)',
				text: 'rgb(var(--color-text-body) / <alpha-value>)',
				body: 'rgb(var(--color-text-body) / <alpha-value>)', // Alias for text-body to match user request

				// Brand Colors (Semantic)
				brand: {
					whatsapp: '#25D366',
					'whatsapp-dark': '#128C7E', // Standard dark teal for hover
				},
			},
			fontFamily: {
				sans: ['var(--font-body)', 'sans-serif'],
				heading: ['var(--font-heading)', 'sans-serif'],
			},
			keyframes: {
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				}
			},
			animation: {
				'fade-in-up': 'fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
			},
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
}