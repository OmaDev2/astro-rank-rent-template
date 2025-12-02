export const themes = {
    industrial: {
        label: 'Industrial (Naranja/Gris)',
        colors: {
            primary: '217 119 6',   // Amber 600
            secondary: '15 23 42',  // Slate 900 (Main BG)
            surface: '30 41 59',    // Slate 800 (Cards)
            accent: '234 179 8',    // Yellow 500
            textMain: '255 255 255',
            textMuted: '148 163 184', // Slate 400
        },
        gradient: 'linear-gradient(135deg, rgb(217 119 6) 0%, rgb(30 41 59) 100%)'
    },
    corporate: {
        label: 'Corporativo (Azul/Oscuro)',
        colors: {
            primary: '37 99 235',   // Blue 600
            secondary: '15 23 42',  // Slate 900
            surface: '30 41 59',    // Slate 800
            accent: '96 165 250',   // Blue 400
            textMain: '255 255 255',
            textMuted: '148 163 184',
        },
        gradient: 'linear-gradient(to right, rgb(37 99 235), rgb(15 23 42))'
    },
    nature: {
        label: 'Naturaleza (Verde/Tierra)',
        colors: {
            primary: '22 163 74',   // Green 600
            secondary: '20 83 45',  // Green 900
            surface: '22 101 52',   // Green 800
            accent: '74 222 128',   // Green 400
            textMain: '255 255 255',
            textMuted: '187 247 208', // Green 100
        },
        gradient: 'linear-gradient(to bottom, rgb(22 163 74), rgb(20 83 45))'
    },
    urgent: {
        label: 'Urgencia (Rojo/Negro)',
        colors: {
            primary: '220 38 38',   // Red 600
            secondary: '24 24 27',  // Zinc 950
            surface: '39 39 42',    // Zinc 800
            accent: '239 68 68',    // Red 500
            textMain: '255 255 255',
            textMuted: '161 161 170', // Zinc 400
        },
        gradient: 'linear-gradient(45deg, rgb(220 38 38) 0%, rgb(185 28 28) 100%)'
    },
    legal: {
        label: 'Legal (Navy/Oro)',
        colors: {
            primary: '202 138 4',   // Yellow 600
            secondary: '23 37 84',  // Blue 950
            surface: '30 58 138',   // Blue 900
            accent: '234 179 8',    // Yellow 500
            textMain: '255 255 255',
            textMuted: '191 219 254', // Blue 200
        },
        gradient: 'linear-gradient(to right, rgb(30 58 138), rgb(23, 37, 84))'
    },
    health: {
        label: 'Salud (Turquesa)',
        colors: {
            primary: '13 148 136',  // Teal 600
            secondary: '17 24 39',  // Gray 900
            surface: '31 41 55',    // Gray 800
            accent: '45 212 191',   // Teal 400
            textMain: '255 255 255',
            textMuted: '156 163 175', // Gray 400
        },
        gradient: 'linear-gradient(to bottom right, rgb(13 148 136), rgb(17 24 39))'
    },
    luxury: {
        label: 'Lujo (Negro/Oro)',
        colors: {
            primary: '217 119 6',   // Amber 600
            secondary: '0 0 0',     // Black
            surface: '24 24 27',    // Zinc 900
            accent: '251 191 36',   // Amber 400
            textMain: '255 255 255',
            textMuted: '161 161 170', // Zinc 400
        },
        gradient: 'linear-gradient(135deg, rgb(0 0 0) 0%, rgb(60 60 60) 100%)'
    },
    beauty: {
        label: 'Estética (Rosa)',
        colors: {
            primary: '219 39 119',  // Pink 600
            secondary: '80 7 36',   // Rose 950
            surface: '131 24 67',   // Rose 900
            accent: '244 114 182',  // Pink 400
            textMain: '255 255 255',
            textMuted: '253 164 175', // Rose 200
        },
        gradient: 'linear-gradient(to right, rgb(219 39 119), rgb(131 24 67))'
    },
    tech: {
        label: 'Tech (Violeta)',
        colors: {
            primary: '124 58 237',  // Violet 600
            secondary: '15 23 42',  // Slate 900
            surface: '30 41 59',    // Slate 800
            accent: '167 139 250',  // Violet 400
            textMain: '255 255 255',
            textMuted: '148 163 184', // Slate 400
        },
        gradient: 'linear-gradient(to right, rgb(79 70 229), rgb(124 58 237))'
    },
    clean_light: {
        label: 'Clean (Claro/Minimal)',
        colors: {
            primary: '37 99 235',    // Blue 600
            secondary: '248 250 252', // Slate 50 (Fondo BLANCO/Gris muy pálido)
            surface: '255 255 255',   // White
            accent: '59 130 246',    // Blue 500
            textMain: '15 23 42',    // Slate 900 (Casi negro)
            textMuted: '71 85 105',  // Slate 600 (Gris medio)
        },
        gradient: 'linear-gradient(to right, rgb(255 255 255), rgb(241 245 249))'
    },
    clay_paper: {
        label: 'Arcilla y Papel (Artesano Cálido)',
        colors: {
            primary: '180 83 9',      // Orange 800 (Terracota)
            secondary: '254 252 232', // Yellow 50 (Crema/Pergamino)
            surface: '255 255 255',   // White (Papel)
            accent: '217 119 6',      // Amber 600 (Arcilla clara)
            textMain: '78 29 29',     // Brown 900 (Café oscuro)
            textMuted: '120 53 15',   // Orange 900 (Marrón medio)
        },
        gradient: 'linear-gradient(135deg, rgb(254 252 232) 0%, rgb(254 243 199) 100%)'
    },
    forest_stone: {
        label: 'Bosque y Piedra (Artesano Natural)',
        colors: {
            primary: '77 124 15',     // Lime 800 (Verde Oliva)
            secondary: '241 245 249', // Slate 50 (Gris Piedra muy suave)
            surface: '248 250 252',   // Slate 50 (Superficie clara)
            accent: '161 98 7',       // Yellow 800 (Madera/Ocre)
            textMain: '30 41 59',     // Slate 800 (Gris oscuro)
            textMuted: '71 85 105',   // Slate 600 (Gris medio)
        },
        gradient: 'linear-gradient(to bottom right, rgb(241 245 249), rgb(226 232 240))'
    },
    classic_workshop: {
        label: 'Taller Clásico (Artesano Premium)',
        colors: {
            primary: '180 83 9',      // Orange 800 (Bronce/Dorado viejo)
            secondary: '23 37 84',    // Blue 950 (Azul Marino profundo)
            surface: '30 41 59',      // Slate 800 (Madera oscura)
            accent: '234 179 8',      // Yellow 500 (Oro)
            textMain: '255 255 255',  // White
            textMuted: '203 213 225', // Slate 300 (Gris claro)
        },
        gradient: 'linear-gradient(135deg, rgb(23 37 84) 0%, rgb(30 41 59) 100%)'
    }
};