export const themes = {
    industrial: {
        label: 'Industrial (Naranja/Gris)',
        heroOverlay: '15 23 42',    // = secondary
        colors: {
            primary: '217 119 6',
            secondary: '15 23 42',
            surface: '30 41 59',
            accent: '234 179 8',
            textMain: '255 255 255',
            textMuted: '148 163 184',
        },
        gradient: 'linear-gradient(135deg, rgb(217 119 6) 0%, rgb(30 41 59) 100%)'
    },
    corporate: {
        label: 'Corporativo (Azul/Oscuro)',
        heroOverlay: '15 23 42',
        colors: {
            primary: '37 99 235',
            secondary: '15 23 42',
            surface: '30 41 59',
            accent: '96 165 250',
            textMain: '255 255 255',
            textMuted: '148 163 184',
        },
        gradient: 'linear-gradient(to right, rgb(37 99 235), rgb(15 23 42))'
    },
    nature: {
        label: 'Naturaleza (Verde/Tierra)',
        heroOverlay: '20 83 45',
        colors: {
            primary: '22 163 74',
            secondary: '20 83 45',
            surface: '22 101 52',
            accent: '74 222 128',
            textMain: '255 255 255',
            textMuted: '187 247 208',
        },
        gradient: 'linear-gradient(to bottom, rgb(22 163 74), rgb(20 83 45))'
    },
    urgent: {
        label: 'Urgencia (Rojo/Negro)',
        heroOverlay: '24 24 27',
        colors: {
            primary: '220 38 38',
            secondary: '24 24 27',
            surface: '39 39 42',
            accent: '239 68 68',
            textMain: '255 255 255',
            textMuted: '161 161 170',
        },
        gradient: 'linear-gradient(45deg, rgb(220 38 38) 0%, rgb(185 28 28) 100%)'
    },
    legal: {
        label: 'Legal (Navy/Oro)',
        heroOverlay: '23 37 84',
        colors: {
            primary: '202 138 4',
            secondary: '23 37 84',
            surface: '30 58 138',
            accent: '234 179 8',
            textMain: '255 255 255',
            textMuted: '191 219 254',
        },
        gradient: 'linear-gradient(to right, rgb(30 58 138), rgb(23, 37, 84))'
    },
    health: {
        label: 'Salud (Turquesa)',
        heroOverlay: '17 24 39',
        colors: {
            primary: '13 148 136',
            secondary: '17 24 39',
            surface: '31 41 55',
            accent: '45 212 191',
            textMain: '255 255 255',
            textMuted: '156 163 175',
        },
        gradient: 'linear-gradient(to bottom right, rgb(13 148 136), rgb(17 24 39))'
    },
    luxury: {
        label: 'Lujo (Negro/Oro)',
        heroOverlay: '0 0 0',
        colors: {
            primary: '217 119 6',
            secondary: '0 0 0',
            surface: '24 24 27',
            accent: '251 191 36',
            textMain: '255 255 255',
            textMuted: '161 161 170',
        },
        gradient: 'linear-gradient(135deg, rgb(0 0 0) 0%, rgb(60 60 60) 100%)'
    },
    beauty: {
        label: 'Estética (Rosa)',
        heroOverlay: '80 7 36',
        colors: {
            primary: '219 39 119',
            secondary: '80 7 36',
            surface: '131 24 67',
            accent: '244 114 182',
            textMain: '255 255 255',
            textMuted: '253 164 175',
        },
        gradient: 'linear-gradient(to right, rgb(219 39 119), rgb(131 24 67))'
    },
    tech: {
        label: 'Tech (Violeta)',
        heroOverlay: '15 23 42',
        colors: {
            primary: '124 58 237',
            secondary: '15 23 42',
            surface: '30 41 59',
            accent: '167 139 250',
            textMain: '255 255 255',
            textMuted: '148 163 184',
        },
        gradient: 'linear-gradient(to right, rgb(79 70 229), rgb(124 58 237))'
    },
    // Temas claros: heroOverlay usa BLANCO — texto oscuro sobre área blanca semitransparente
    clean_light: {
        label: 'Clean (Claro/Minimal)',
        heroOverlay: '255 255 255',
        colors: {
            primary: '37 99 235',
            secondary: '248 250 252',
            surface: '255 255 255',
            accent: '59 130 246',
            textMain: '15 23 42',
            textMuted: '71 85 105',
        },
        gradient: 'linear-gradient(to right, rgb(37 99 235), rgb(30 64 175))'
    },
    clay_paper: {
        label: 'Arcilla y Papel (Artesano Cálido)',
        heroOverlay: '255 255 255',
        colors: {
            primary: '180 83 9',
            secondary: '254 252 232',
            surface: '255 255 255',
            accent: '217 119 6',
            textMain: '78 29 29',
            textMuted: '120 53 15',
        },
        gradient: 'linear-gradient(135deg, rgb(180 83 9) 0%, rgb(120 53 15) 100%)'
    },
    forest_stone: {
        label: 'Bosque y Piedra (Artesano Natural)',
        heroOverlay: '255 255 255',
        colors: {
            primary: '77 124 15',
            secondary: '241 245 249',
            surface: '248 250 252',
            accent: '161 98 7',
            textMain: '30 41 59',
            textMuted: '71 85 105',
        },
        gradient: 'linear-gradient(135deg, rgb(77 124 15) 0%, rgb(30 41 59) 100%)'
    },
    classic_workshop: {
        label: 'Taller Clásico (Artesano Premium)',
        heroOverlay: '23 37 84',
        colors: {
            primary: '180 83 9',
            secondary: '23 37 84',
            surface: '30 41 59',
            accent: '234 179 8',
            textMain: '255 255 255',
            textMuted: '203 213 225',
        },
        gradient: 'linear-gradient(135deg, rgb(23 37 84) 0%, rgb(30 41 59) 100%)'
    },

    // ---- TEMAS CLAROS ----

    sky_white: {
        label: '☀️ Cielo Blanco (Claro/Azul)',
        heroOverlay: '255 255 255',
        colors: {
            primary: '37 99 235',
            secondary: '255 255 255',
            surface: '240 249 255',
            accent: '56 189 248',
            textMain: '15 23 42',
            textMuted: '100 116 139',
        },
        gradient: 'linear-gradient(to right, rgb(37 99 235), rgb(29 78 216))'
    },
    sand_terra: {
        label: '🏺 Arena y Terracota (Cálido Claro)',
        heroOverlay: '255 255 255',
        colors: {
            primary: '234 88 12',
            secondary: '255 247 237',
            surface: '255 255 255',
            accent: '245 158 11',
            textMain: '28 25 23',
            textMuted: '87 83 78',
        },
        gradient: 'linear-gradient(135deg, rgb(234 88 12) 0%, rgb(180 83 9) 100%)'
    },
    mint_fresh: {
        label: '🌿 Menta Fresco (Salud/Bienestar Claro)',
        heroOverlay: '255 255 255',
        colors: {
            primary:   '4 120 87',
            secondary: '240 253 250',
            surface:   '255 255 255',
            accent:    '13 148 136',
            textMain:  '15 23 42',
            textMuted: '71 85 105',
        },
        gradient: 'linear-gradient(135deg, rgb(4 120 87) 0%, rgb(13 148 136) 100%)'
    },
    slate_modern: {
        label: '🔷 Pizarra Moderno (Minimalista Claro)',
        heroOverlay: '255 255 255',
        colors: {
            primary: '249 115 22',
            secondary: '241 245 249',
            surface: '255 255 255',
            accent: '251 191 36',
            textMain: '15 23 42',
            textMuted: '71 85 105',
        },
        gradient: 'linear-gradient(135deg, rgb(249 115 22) 0%, rgb(217 119 6) 100%)'
    },
    lavender_soft: {
        label: '💜 Lavanda Suave (Estética Claro)',
        heroOverlay: '255 255 255',
        colors: {
            primary: '124 58 237',
            secondary: '245 243 255',
            surface: '255 255 255',
            accent: '192 132 252',
            textMain: '15 23 42',
            textMuted: '71 85 105',
        },
        gradient: 'linear-gradient(135deg, rgb(124 58 237) 0%, rgb(109 40 217) 100%)'
    },
    rose_clean: {
        label: '🌸 Rosa Clean (Moda/Belleza Claro)',
        heroOverlay: '255 255 255',
        colors: {
            primary: '225 29 72',
            secondary: '255 241 242',
            surface: '255 255 255',
            accent: '251 113 133',
            textMain: '17 24 39',
            textMuted: '107 114 128',
        },
        gradient: 'linear-gradient(135deg, rgb(225 29 72) 0%, rgb(190 18 60) 100%)'
    },
    navy_gold_light: {
        label: '⚓ Navy y Oro (Legal/Corporativo Claro)',
        heroOverlay: '255 255 255',
        colors: {
            primary: '29 78 216',
            secondary: '239 246 255',
            surface: '255 255 255',
            accent: '202 138 4',
            textMain: '15 23 42',
            textMuted: '71 85 105',
        },
        gradient: 'linear-gradient(135deg, rgb(29 78 216) 0%, rgb(23 37 84) 100%)'
    },
};