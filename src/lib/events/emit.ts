import { AppEvent } from './types'

/**
 * Global Event Emitter for Kadernim.
 * This is the entry point for the Automation Engine (PRD 14).
 * 
 * In the future, this will push events to a queue (Inngest or BullMQ).
 * For now, it logs the event and prepares the ground for automation.
 */
export async function emitEvent(event: AppEvent) {
    const { type, payload } = event

    console.log(`[EventBus] Emitting: ${type}`, payload)

    // TODO: Integrated with Inngest or BullMQ in the next phase
    // await inngest.send({ name: type, data: payload })

    return { success: true, timestamp: new Date().toISOString() }
}
