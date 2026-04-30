import { DensityProfile } from './layout-engine-types';

export const DENSITY_PROGRESSION: DensityProfile[] = [
  'comfortable',
  'balanced',
  'compact',
  'compact_safe',
];

export function getNextDensityProfile(current: DensityProfile): DensityProfile | null {
  const currentIndex = DENSITY_PROGRESSION.indexOf(current);
  if (currentIndex === -1 || currentIndex === DENSITY_PROGRESSION.length - 1) {
    return null;
  }
  return DENSITY_PROGRESSION[currentIndex + 1];
}

/**
 * Heuristic to infer the initial target pages based on question count and phase.
 */
export function inferTargetPages(questionCount: number, phase: string): number {
  if (phase === 'phase_1' || phase === 'phase_2') {
    // Phase 1-2 have more lúdico content, 2-3 questions per page usually
    return Math.max(2, Math.ceil(questionCount / 2) + 1);
  }
  // Phase 3-5 can be more dense, 4-5 questions per page
  return Math.max(2, Math.ceil(questionCount / 4) + 1);
}
