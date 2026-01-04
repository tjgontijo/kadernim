/**
 * Kadernim Event System - Types
 * Central definition of all system events for the Automation Engine.
 */

export type AppEvent =
    | { type: 'community.request.created'; payload: { requestId: string; userId: string; title: string } }
    | { type: 'community.request.voted'; payload: { requestId: string; userId: string; newVoteCount: number } }
    | { type: 'community.request.selected'; payload: { requestId: string; title: string } }
    | { type: 'community.request.completed'; payload: { requestId: string; resourceId: string } }
    | { type: 'community.request.unfeasible'; payload: { requestId: string; reason: string } }
    | { type: 'user.signup'; payload: { userId: string; email: string } }
    | { type: 'resource.published'; payload: { resourceId: string; title: string } };

export type AppEventType = AppEvent['type'];
