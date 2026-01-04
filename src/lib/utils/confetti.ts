import confetti from 'canvas-confetti'

/**
 * Triggers a "burst" of confetti from a specific location or center.
 */
export const triggerConfetti = (options?: confetti.Options) => {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        ...options,
    })
}

/**
 * Triggers a side-by-side "cannon" effect.
 */
export const triggerCannon = () => {
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
            return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        // since particles fall down, start a bit higher than random
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
    }, 250)
}

/**
 * Triggers a subtle "pop" of confetti around an element.
 */
export const triggerSuccessPop = (x: number, y: number) => {
    confetti({
        particleCount: 40,
        angle: 90,
        spread: 45,
        origin: { x, y },
        ticks: 100,
        gravity: 1,
        decay: 0.94,
        startVelocity: 30,
        shapes: ['circle'],
        colors: ['#3b82f6', '#ffffff']
    });
}
