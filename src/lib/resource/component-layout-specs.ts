import type { Component } from './schemas';

export interface ComponentLayoutSpec {
  canShrink: boolean;
  canSplit: boolean;
  avoidAloneOnPage: boolean;
  keepWithNext: boolean;
  layoutRole: 'question' | 'content' | 'structure' | 'enrichment';
  minLines?: number;
  maxLines?: number;
}

export const COMPONENT_LAYOUT_SPECS: Record<Component['type'], ComponentLayoutSpec> = {
  // Structure
  page_header: {
    canShrink: true,
    canSplit: false,
    avoidAloneOnPage: false,
    keepWithNext: true,
    layoutRole: 'structure',
  },
  page_footer: {
    canShrink: false,
    canSplit: false,
    avoidAloneOnPage: false,
    keepWithNext: false,
    layoutRole: 'structure',
  },
  divider_section: {
    canShrink: false,
    canSplit: false,
    avoidAloneOnPage: false,
    keepWithNext: true,
    layoutRole: 'structure',
  },
  activity_intro: {
    canShrink: true,
    canSplit: true,
    avoidAloneOnPage: true,
    keepWithNext: true,
    layoutRole: 'structure',
  },

  // Content Blocks
  story_block: {
    canShrink: true,
    canSplit: true,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'content',
  },
  concept_box: {
    canShrink: true,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'content',
  },
  tip_box: {
    canShrink: false,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'content',
  },
  vocabulary_box: {
    canShrink: true,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'content',
  },
  prose_block: {
    canShrink: true,
    canSplit: true,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'content',
  },
  callout_box: {
    canShrink: true,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'content',
  },
  connection_web: {
    canShrink: false,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'content',
  },
  reading_box: {
    canShrink: true,
    canSplit: true,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'content',
  },
  dialogue_box: {
    canShrink: true,
    canSplit: true,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'content',
  },

  // Questions
  multiple_choice: {
    canShrink: true,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'question',
  },
  open_short: {
    canShrink: true,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'question',
    minLines: 2,
    maxLines: 4,
  },
  open_long: {
    canShrink: true,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'question',
    minLines: 5,
    maxLines: 10,
  },
  true_false: {
    canShrink: true,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'question',
  },
  fill_blank: {
    canShrink: true,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'question',
  },
  matching: {
    canShrink: true,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'question',
  },
  ordering: {
    canShrink: true,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'question',
  },
  calculation: {
    canShrink: true,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'question',
  },
  comprehension: {
    canShrink: true,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'question',
    minLines: 3,
    maxLines: 6,
  },
  reasoning: {
    canShrink: true,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'question',
    minLines: 3,
    maxLines: 6,
  },
  creation: {
    canShrink: true,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'question',
    minLines: 2,
    maxLines: 6,
  },

  // Enrichment
  timeline: {
    canShrink: false,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'enrichment',
  },
  data_table: {
    canShrink: true,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'enrichment',
  },
  image_placeholder: {
    canShrink: true,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'enrichment',
  },
  challenge_box: {
    canShrink: true,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'enrichment',
  },
  graph_placeholder: {
    canShrink: true,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'enrichment',
  },
  drawing_area: {
    canShrink: true,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'enrichment',
  },
  frame_box: {
    canShrink: true,
    canSplit: true,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'enrichment',
  },
  self_assessment: {
    canShrink: true,
    canSplit: false,
    avoidAloneOnPage: true,
    keepWithNext: false,
    layoutRole: 'enrichment',
  },
};

export function getLayoutSpec(type: Component['type']): ComponentLayoutSpec {
  return COMPONENT_LAYOUT_SPECS[type];
}
