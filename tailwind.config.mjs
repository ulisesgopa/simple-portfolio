/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['media'],
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		container: {
			center: true,
			screens: {
				sm: "100%",
				md: "100%",
				lg: "520px",
				xl: "620px"
			},
			padding: '2rem',
		},
    	extend: {
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
				colors: {
					// Light mode colors (reemplazando amarillos con azules)
					'light-theme': '#E9EBEC',
					'primary-light': '#1E88E5',       // Un azul vibrante para el primario en claro
					'primary-hover-light': '#1565C0',   // Un azul más oscuro para el hover en claro

					// Dark mode colors (reemplazando amarillos con azules que contrasten con el fondo oscuro)
					'dark-theme': '#0C151D',
					'primary-dark': '#82B1FF',        // Un azul más claro y llamativo para el primario en oscuro
					'primary-hover-dark': '#448AFF',    // Un azul aún más claro para el hover en oscuro

					// Neutrals (se mantienen igual)
					'n200': '#d7d9da',
					'n900': '#222222',
					'n700': '#171F26',
					'n500': '#555555',
				},
    	}
    },
	plugins: [require("tailwindcss-animate"), require('@tailwindcss/typography')],
}
