/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				// Industrial Palette
				slate: {
					50: '#f8fafc',
					800: '#1e293b',
					900: '#0f172a',
				},
				amber: {
					600: '#d97706', // Rust/Fire
				},
				yellow: {
					500: '#eab308', // Metallic Gold
				},
				zinc: {
					400: '#a1a1aa', // Steel
				},
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
