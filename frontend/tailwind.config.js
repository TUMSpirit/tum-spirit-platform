// tailwind.config.js

module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx,html}"], // Include HTML files if applicable
    theme: {
      extend: {
        colors: {
          'chat-filter': '#f5f7fb',
          'chat-messages-received': '#ffffff',
          'chat-messages-send': '#dcedff',
          'chat-input-bar': '#f5f7fb',
          'chat-background': '#f5f7fb',
          'chat-grid': '#f0f0f2',
        },
      },
    },
    plugins: [
      require('tailwind-scrollbar-hide'), // Ensure plugins are correctly included
    ],
  };
  