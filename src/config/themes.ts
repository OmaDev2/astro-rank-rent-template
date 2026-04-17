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
    },

    // ---- TEMAS CLAROS ----

    sky_white: {
        label: '☀️ Cielo Blanco (Claro/Azul)',
        colors: {
            primary: '37 99 235',     // Blue 600
            secondary: '255 255 255', // White
            surface: '240 249 255',   // Sky 50
            accent: '56 189 248',     // Sky 400
            textMain: '15 23 42',     // Slate 900
            textMuted: '100 116 139', // Slate 500
        },
        gradient: 'linear-gradient(to right, rgb(240 249 255), rgb(224 242 254))'
    },
    sand_terra: {
        label: '🏺 Arena y Terracota (Cálido Claro)',
        colors: {
            primary: '234 88 12',     // Orange 600 (Terracota)
            secondary: '255 247 237', // Orange 50 (Arena)
            surface: '255 255 255',   // White
            accent: '245 158 11',     // Amber 500
            textMain: '28 25 23',     // Stone 900
            textMuted: '87 83 78',    // Stone 600
        },
        gradient: 'linear-gradient(135deg, rgb(255 247 237) 0%, rgb(254 243 199) 100%)'
    },
    mint_fresh: {
        label: '🌿 Menta Fresco (Salud/Bienestar Claro)',
        colors: {
            primary: '5 150 105',     // Emerald 600
            secondary: '236 253 245', // Emerald 50
            surface: '255 255 255',   // White
            accent: '45 212 191',     // Teal 400
            textMain: '17 24 39',     // Gray 900
            textMuted: '107 114 128', // Gray 500
        },
        gradient: 'linear-gradient(to bottom right, rgb(236 253 245), rgb(209 250 229))'
    },
    slate_modern: {
        label: '🔷 Pizarra Moderno (Minimalista Claro)',
        colors: {
            primary: '249 115 22',    // Orange 500
            secondary: '241 245 249', // Slate 100
            surface: '255 255 255',   // White
            accent: '251 191 36',     // Amber 400
            textMain: '15 23 42',     // Slate 900
            textMuted: '71 85 105',   // Slate 600
        },
        gradient: 'linear-gradient(to right, rgb(241 245 249), rgb(248 250 252))'
    },
    lavender_soft: {
        label: '💜 Lavanda Suave (Estética Claro)',
        colors: {
            primary: '124 58 237',    // Violet 600
            secondary: '245 243 255', // Violet 50
            surface: '255 255 255',   // White
            accent: '192 132 252',    // Purple 400
            textMain: '15 23 42',     // Slate 900
            textMuted: '71 85 105',   // Slate 600
        },
        gradient: 'linear-gradient(135deg, rgb(245 243 255) 0%, rgb(237 233 254) 100%)'
    },
    rose_clean: {
        label: '🌸 Rosa Clean (Moda/Belleza Claro)',
        colors: {
            primary: '225 29 72',     // Rose 600
            secondary: '255 241 242', // Rose 50
            surface: '255 255 255',   // White
            accent: '251 113 133',    // Rose 400
            textMain: '17 24 39',     // Gray 900
            textMuted: '107 114 128', // Gray 500
        },
        gradient: 'linear-gradient(to right, rgb(255 241 242), rgb(254 226 226))'
    },
    navy_gold_light: {
        label: '⚓ Navy y Oro (Legal/Corporativo Claro)',
        colors: {
            primary: '29 78 216',     // Blue 700
            secondary: '239 246 255', // Blue 50
            surface: '255 255 255',   // White
            accent: '202 138 4',      // Yellow 600
            textMain: '15 23 42',     // Slate 900
            textMuted: '71 85 105',   // Slate 600
        },
        gradient: 'linear-gradient(to right, rgb(239 246 255), rgb(219 234 254))'
    },
};