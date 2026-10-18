/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // WhatsApp theme palette
        wa: {
          teal: "#00a884",
          "teal-dark": "#008069",
          "teal-hover": "#017561",
          green: "#25d366",
          blue: "#53bdeb", // Blue check ticks
          "bg-light": "#f0f2f5",
          "bg-dark": "#111b21",
          "panel-light": "#ffffff",
          "panel-dark": "#202c33",
          "header-light": "#f0f2f5",
          "header-dark": "#202c33",
          "chat-light": "#efeae2",
          "chat-dark": "#0b141a",
          "bubble-sent-light": "#d9fdd3",
          "bubble-sent-dark": "#005c4b",
          "bubble-recv-light": "#ffffff",
          "bubble-recv-dark": "#202c33",
          "text-primary-light": "#111b21",
          "text-primary-dark": "#e9edef",
          "text-secondary-light": "#54656f",
          "text-secondary-dark": "#8696a0",
          "border-light": "#e9edef",
          "border-dark": "#222d34",
          "hover-light": "#f5f6f6",
          "hover-dark": "#182229",
          badge: "#25d366",
        },
        // Fallback variables matching theme dynamically
        primary: "#00a884",
        secondary: "var(--wa-panel)",
        surface: "var(--wa-surface)",
        text: "var(--wa-text-primary)",
        background: "var(--wa-bg)",
      },
      boxShadow: {
        'wa-bubble': '0 1px 0.5px rgba(11, 20, 26, 0.13)',
        'wa-dropdown': '0 2px 5px 0 rgba(11,20,26,.26),0 2px 10px 0 rgba(11,20,26,.16)',
        'wa-modal': '0 17px 50px 0 rgba(11,20,26,.19),0 12px 15px 0 rgba(11,20,26,.24)',
      }
    },
  },
  plugins: [],
}
