/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ADHD-friendly color palette for food blocks
      colors: {
        // Food category colors (high contrast, vibrant but not overwhelming)
        food: {
          fruit: '#FF6B6B',      // Warm red for fruits
          vegetable: '#51CF66',   // Fresh green for vegetables  
          protein: '#845EC2',     // Purple for proteins
          grain: '#FEC868',       // Golden yellow for grains
          dairy: '#4ECDC4',       // Soft teal for dairy
          other: '#95A5A6'        // Neutral gray for other foods
        },
        
        // Interaction states
        block: {
          default: 'white',
          hover: '#F8F9FA',
          active: '#E9ECEF',
          selected: '#DEE2E6',
          connecting: '#28A745',   // Green when can connect
          invalid: '#DC3545'      // Red when invalid
        },
        
        // Nutrition status colors
        nutrition: {
          excellent: '#28A745',   // Rich green
          good: '#6FB83F',        // Medium green  
          okay: '#FFC107',        // Warning yellow
          low: '#FD7E14',         // Orange alert
          missing: '#DC3545'      // Red warning
        },
        
        // Age group indicators
        age: {
          safe: '#28A745',        // Green for age-appropriate
          caution: '#FFC107',     // Yellow for caution
          unsafe: '#DC3545'       // Red for unsuitable
        }
      },
      
      // Custom shadows for depth and clarity
      boxShadow: {
        'food-block': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'food-block-hover': '0 8px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'food-block-active': '0 12px 20px -3px rgba(0, 0, 0, 0.15), 0 6px 8px -2px rgba(0, 0, 0, 0.1)',
      },
      
      // Border radius for rounded blocks
      borderRadius: {
        'food-block': '12px',
        'connection-point': '50%'
      },
      
      // Typography for readability
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      
      // Animation for smooth interactions
      animation: {
        'bounce-gentle': 'bounce 0.5s ease-in-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};