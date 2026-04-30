import { PedagogicalPhase } from './schemas';

export type DensityProfile = 'comfortable' | 'balanced' | 'compact' | 'compact_safe';

export type RenderMode = 'preview' | 'print' | 'measure';

export interface RenderContext {
  phase: PedagogicalPhase;
  subject: string;
  mode: RenderMode;
  density: DensityProfile;
}

export const DENSITY_CONFIGS: Record<DensityProfile, { gap: string; padding: string; fontSizeMultiplier: number }> = {
  comfortable: {
    gap: '24px',
    padding: '16mm 20mm',
    fontSizeMultiplier: 1.0,
  },
  balanced: {
    gap: '16px',
    padding: '14mm 18mm',
    fontSizeMultiplier: 1.0,
  },
  compact: {
    gap: '12px',
    padding: '12mm 16mm',
    fontSizeMultiplier: 0.95,
  },
  compact_safe: {
    gap: '8px',
    padding: '10mm 14mm',
    fontSizeMultiplier: 0.9,
  },
};
