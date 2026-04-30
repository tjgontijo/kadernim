import { DensityProfile } from './layout-engine-types';

export interface LayoutQualityReport {
  score: number;
  profile: DensityProfile;
  totalPages: number;
  targetPages: number;
  overflowCount: number;
  underflowPages: number;
  orphansCount: number;
  violations: string[];
}

export function calculateLayoutScore(report: Omit<LayoutQualityReport, 'score'>): number {
  let score = 100;

  // Penalty for target page mismatch
  const pageDiff = Math.abs(report.totalPages - report.targetPages);
  score -= pageDiff * 20;

  // Heavy penalty for overflow (content cut off)
  score -= report.overflowCount * 50;

  // Penalty for underflow (mostly empty pages)
  score -= report.underflowPages * 15;

  // Penalty for orphans/widows (though the engine tries to avoid them)
  score -= report.orphansCount * 10;

  // Penalty for general violations
  score -= report.violations.length * 5;

  return Math.max(0, score);
}
