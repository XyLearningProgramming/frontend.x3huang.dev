/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    `components/**/*.{vue,js}`,
    `layouts/**/*.vue`,
    `pages/**/*.vue`,
    `composables/**/*.{js,ts}`,
    `plugins/**/*.{js,ts}`,
    `App.{js,ts,vue}`,
    `app.{js,ts,vue}`
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: {
          bg: '#fdf6e3',
          surface: '#eee8d5',
          border: '#d3af86',
          text: '#657b83',
          'text-strong': '#073642',
          accent: '#268bd2',
          secondary: '#2aa198'
        },
        dark: {
          bg: '#002b36',
          surface: '#073642',
          border: '#586e75',
          text: '#839496',
          'text-strong': '#fdf6e3',
          accent: '#268bd2',
          secondary: '#2aa198'
        }
      },
      fontSize: {
        'xxs': '0.5rem',
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'highlight': '5rem',
        'h1': '4rem',
        'h2': '3rem',
        'h3': '2rem',
        'h4': '1.5rem',
        'h5': '1.25rem',
        'highlight_sm': '3.5rem',
        'h1_sm': '3rem',
        'h2_sm': '2.25rem',
        'h3_sm': '1.75rem',
        'h4_sm': '1.5rem',
        'h5_sm': '1.25rem'
      },
      lineHeight: {
        'xxs': '0.75rem',
        'xs': '1rem',
        'sm': '1.25rem',
        'base': '1.35rem',
        'lg': '1.45rem',
        'highlight': '5.5rem',
        'h1': '4.25rem',
        'h2': '3.25rem',
        'h3': '2.25rem',
        'h4': '1.75rem',
        'h5': '1.5rem',
        'highlight_sm': '3.75rem',
        'h1_sm': '3.25rem',
        'h2_sm': '2.5rem',
        'h3_sm': '2rem',
        'h4_sm': '1.75rem',
        'h5_sm': '1.5rem',
      },
      padding: {
        'section_x_sm': '1.5rem',
        'section_x': '5rem',
        'section_y_sm': '3rem',
        'section_y': '5rem'
      },
      spacing: {
        'nav': '4rem',
        'section_x': '5rem',
      }
    },
  },
  plugins: [],
}