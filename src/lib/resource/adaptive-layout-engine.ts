import { ResourcePlan, PedagogicalPhase } from './schemas';
import { RenderContext, DensityProfile } from './layout-engine-types';
import { DENSITY_PROGRESSION, getNextDensityProfile, inferTargetPages } from './layout-policy';
import { LayoutQualityReport, calculateLayoutScore } from './layout-report';
import { PdfRenderer } from './pdf-renderer';
import { countQuestions } from './schemas';

export interface AdaptiveLayoutResult {
  plan: ResourcePlan;
  report: LayoutQualityReport;
  html: string;
}

export class AdaptiveLayoutEngine {
  static async process(
    plan: ResourcePlan,
    options: { phase: PedagogicalPhase; subject: string }
  ): Promise<AdaptiveLayoutResult> {
    const questionCount = countQuestions(plan);
    const targetPages = inferTargetPages(questionCount, options.phase);
    
    let bestReport: LayoutQualityReport | null = null;
    let bestPlan: ResourcePlan = plan;
    let currentProfile: DensityProfile = 'comfortable';

    console.log(`[adaptive] START questionCount=${questionCount} targetPages=${targetPages}`);

    while (currentProfile) {
      console.log(`[adaptive] trying profile: ${currentProfile}`);
      
      const context: RenderContext = {
        phase: options.phase,
        subject: options.subject,
        mode: 'measure',
        density: currentProfile,
      };

      // Measure and paginate for this profile
      // Note: PdfRenderer.render needs to be updated to support DensityProfile
      const { paginatedPlan, report } = await PdfRenderer.measureAndAnalyze(plan, context, targetPages);

      const score = calculateLayoutScore(report);
      const fullReport: LayoutQualityReport = { ...report, score };

      console.log(`[adaptive] profile=${currentProfile} score=${score} pages=${report.totalPages}`);

      if (!bestReport || score > bestReport.score) {
        bestReport = fullReport;
        bestPlan = paginatedPlan;
      }

      // If score is perfect or very good, stop
      if (score >= 95) {
        break;
      }

      // Otherwise, try next profile if current is still too large
      if (report.totalPages > targetPages) {
        const next = getNextDensityProfile(currentProfile);
        if (!next) break;
        currentProfile = next;
      } else {
        // If we reached target pages or below, we might still try more compact to see if it's better?
        // Usually, we prefer comfortable if it fits in target pages.
        break;
      }
    }

    const html = PdfRenderer.generateHtml(bestPlan, { 
      phase: options.phase, 
      subject: options.subject,
      density: bestReport!.profile,
      mode: 'print'
    } as any);

    return {
      plan: bestPlan,
      report: bestReport!,
      html,
    };
  }
}
