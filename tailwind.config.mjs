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
			},
			fontFamily: {
				sans: ['Inter', 'Roboto', 'sans-serif'],
				heading: ['Oswald', 'Barlow Condensed', 'sans-serif'],
			},
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
}