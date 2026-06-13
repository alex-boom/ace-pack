import { describe, expect, it } from 'vitest'

import { validateFinishRequirements } from '../scripts/ai-task-finish.mjs'

const currentTaskWithReview = `# Current Task

## Business Value / Product Alignment
This improves support quality by making risky work explicit before implementation.

## Technical Approach
Option 1:
- Keep the process manual, which is fast but easy to skip.

Option 2:
- Validate closeout by task tier, which adds guardrails without CI blockers.

Chosen Approach:
- Use tier validation because it preserves speed for small tasks and rigor for risky work.
`

const handoffWithQuality = `# Session Handoff

## Quality Review
Product Alignment:
- The work preserves the stated product outcome.

Architecture:
- The chosen local script pattern fits the existing ACE workflow.

Security:
- Security-sensitive areas are surfaced for explicit review.

Code Quality:
- The implementation stays split into focused files and has targeted tests.
`

const reflectionLog = `# Reflection Log

## Unresolved

### 2026-06-12 13:00 Repeated closeout overhead on small tasks
Status: unresolved
- Stuck Point: Small tasks paid the same documentation cost as large tasks.
- Likely Cause: The workflow lacked a task-tier classifier.
- Proposed Improvement: Use adaptive closeout gates.

## Resolved
`

describe('validateFinishRequirements', () => {
  it('blocks large tasks without design review', () => {
    const missing = validateFinishRequirements({
      classification: { designReviewRequired: true, tier: 'large' },
      currentTaskContent: currentTaskWithReview.replace('Option 2:', 'Second path:'),
      handoffContent: handoffWithQuality,
      reflectionLogContent: reflectionLog,
    })

    expect(missing).toContain(
      'Fill .ai/current-task.md Technical Approach with Option 1, Option 2, and Chosen Approach.',
    )
  })

  it('blocks high-risk standard tasks without design review', () => {
    const missing = validateFinishRequirements({
      classification: { designReviewRequired: true, tier: 'standard' },
      currentTaskContent: currentTaskWithReview.replace('Chosen Approach:', 'Decision:'),
      handoffContent: handoffWithQuality,
      reflectionLogContent: reflectionLog,
    })

    expect(missing).toContain(
      'Fill .ai/current-task.md Technical Approach with Option 1, Option 2, and Chosen Approach.',
    )
  })

  it('requires quality review notes for standard tasks', () => {
    const missing = validateFinishRequirements({
      classification: { designReviewRequired: false, tier: 'standard' },
      currentTaskContent: currentTaskWithReview,
      handoffContent: '# Session Handoff\n\n## Quality Review\n[Add content here]\n',
      reflectionLogContent: reflectionLog,
    })

    expect(missing).toContain(
      'Fill .ai/session-handoff.md Quality Review for product, architecture, security, and code quality.',
    )
  })

  it('passes when large-task closeout notes are present', () => {
    const missing = validateFinishRequirements({
      classification: { designReviewRequired: true, tier: 'large' },
      currentTaskContent: currentTaskWithReview,
      handoffContent: handoffWithQuality,
      reflectionLogContent: reflectionLog,
    })

    expect(missing).toEqual([])
  })
})
