export const MOTION = {
    // Durations (in seconds)
    duration: {
        instant: 0.1,   // Immediate feedback (buttons)
        fast: 0.15,     // Page transitions
        normal: 0.2,    // Modals, drawers
    },

    // Easings
    ease: {
        default: 'easeOut',
        smooth: [0.4, 0, 0.2, 1], // iOS-like ease
    },

    // Page transitions - SUBTLE FADE ONLY
    page: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    },

    // Card hover - subtle scale
    cardHover: {
        whileHover: { scale: 1.01 },
        whileTap: { scale: 0.99 },
    },

    // Fade in simple
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.15 },
    },
} as const;
