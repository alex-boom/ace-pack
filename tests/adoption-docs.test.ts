import { readFile } from 'node:fs/promises'

import { describe, expect, it } from 'vitest'

async function readText(filePath: string) {
  return readFile(filePath, 'utf8')
}

describe('adoption documentation', () => {
  it('links adoption guides from both README surfaces', async () => {
    const githubReadme = await readText('README.md')
    const npmReadme = await readText('README.npm.md')

    expect(githubReadme).toContain('## Adoption Guides')
    expect(githubReadme).toContain('./docs/adoption-checklist.md')
    expect(githubReadme).toContain('./docs/faq.md')

    expect(npmReadme).toContain('## Adoption Guides')
    expect(npmReadme).toContain(
      'https://github.com/alex-boom/ace-pack/blob/main/docs/adoption-checklist.md',
    )
    expect(npmReadme).toContain('https://github.com/alex-boom/ace-pack/blob/main/docs/faq.md')
  })

  it('keeps the adoption checklist focused on gradual rollout', async () => {
    const checklist = await readText('docs/adoption-checklist.md')

    expect(checklist).toContain('Start With One Repository')
    expect(checklist).toContain('Install And Profile')
    expect(checklist).toContain('Connect The Real Validation Command')
    expect(checklist).toContain('Add PR/CI Gate Only After The Team Accepts The Workflow')
    expect(checklist).toContain('Upgrade Safely')
  })

  it('answers common adoption objections in the FAQ', async () => {
    const faq = await readText('docs/faq.md')

    expect(faq).toContain('Is ACE another AI coding agent?')
    expect(faq).toContain('Does ACE call OpenAI, Anthropic, Ollama, or any model provider?')
    expect(faq).toContain('Does ACE add runtime dependencies to my app?')
    expect(faq).toContain('What if `ace:gate` is too strict?')
    expect(faq).toContain('When should I not use ACE?')
  })

  it('keeps adoption docs out of the npm package payload boundary', async () => {
    const packageJson = JSON.parse(await readText('package.json')) as {
      files?: string[]
    }

    expect(packageJson.files).not.toContain('docs')
    expect(packageJson.files).not.toContain('docs/**')
  })
})
