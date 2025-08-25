export const MEAL_CONFIG = {
  SERVING_OPTIONS: [5, 10, 15, 20] as const,
  MAX_CUSTOM_SERVING: 200,
  MIN_CUSTOM_SERVING: 1,
  VISIBLE_TOWER_ITEMS: 4,
  CELEBRATION_THRESHOLD: 0.8,
  AUTO_SCROLL_DELAY: 100,
} as const;

export const NUTRITION_TARGETS = {
  CALORIES: 300,
  IRON: 10,
  PROTEIN: 15,
  CALCIUM: 300,
  COMPLIANCE_GOOD_THRESHOLD: 0.8,
  COMPLIANCE_EXCELLENT_THRESHOLD: 0.9,
} as const;

export const UI_CONFIG = {
  ANIMATION: {
    STAGGER_DELAY: 150,
    FADE_DURATION: 200,
    CELEBRATE_DURATION: 600,
    HOVER_SCALE: 1.02,
    PULSE_DURATION: 2000,
  },
  RESPONSIVE: {
    MOBILE_BREAKPOINT: 768,
    TABLET_BREAKPOINT: 1024,
    DESKTOP_BREAKPOINT: 1280,
    MOBILE_DRAWER_MAX_WIDTH: '85vw',
    MOBILE_DRAWER_WIDTH: 320,
  },
  TOUCH: {
    MIN_TARGET_SIZE: 48,
    TAP_HIGHLIGHT_COLOR: 'transparent',
  },
} as const;

export const STORAGE_KEYS = {
  CHILD_PROFILE: 'pappobot-child-profile',
  DARK_MODE: 'pappobot-dark-mode',
  MEAL_HISTORY: 'pappobot-meal-history',
  USER_PREFERENCES: 'pappobot-user-preferences',
} as const;

export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  AUTO_SAVE: 1000,
  RESIZE: 150,
} as const;

export const FOOD_CATEGORIES = {
  FRUIT: 'fruit',
  VEGETABLE: 'vegetable',  
  PROTEIN: 'protein',
  GRAIN: 'grain',
  DAIRY: 'dairy',
  OTHER: 'other',
} as const;

export type ServingSize = typeof MEAL_CONFIG.SERVING_OPTIONS[number];
export type FoodCategory = typeof FOOD_CATEGORIES[keyof typeof FOOD_CATEGORIES];