import { readFile } from 'node:fs/promises'

import { describe, expect, it } from 'vitest'

async function readText(filePath: string) {
  return readFile(filePath, 'utf8')
}

describe('product growth kit', () => {
  it('surfaces the 60-second demo from both README surfaces', async () => {
    const githubReadme = await readText('README.md')
    const npmReadme = await readText('README.npm.md')

    expect(githubReadme).toContain('## 60-Second Demo')
    expect(githubReadme).toContain('./docs/demo-script.md')
    expect(githubReadme).toContain('./docs/launch-copy.md')
    expect(githubReadme).toContain('./examples/context-loss-demo/README.md')

    expect(npmReadme).toContain('## 60-Second Demo')
    expect(npmReadme).toContain(
      'https://github.com/alex-boom/ace-pack/blob/main/docs/demo-script.md',
    )
    expect(npmReadme).toContain(
      'https://github.com/alex-boom/ace-pack/blob/main/examples/context-loss-demo/README.md',
    )
  })

  it('keeps the demo script, launch copy, and fixture focused on ACE guardrails', async () => {
    const demoScript = await readText('docs/demo-script.md')
    const launchCopy = await readText('docs/launch-copy.md')
    const fixtureReadme = await readText('examples/context-loss-demo/README.md')
    const fixtureSession = await readText('examples/context-loss-demo/src/auth/session.js')

    expect(demoScript).toContain('Ordinary AI Chat')
    expect(demoScript).toContain('ACE Onboarding')
    expect(demoScript).toContain('Handoff To The Next Chat')
    expect(launchCopy).toContain('Zero-dependency local AgentOps')
    expect(fixtureReadme.toLowerCase()).toContain('context loss')
    expect(fixtureReadme).toContain('src/auth/session.ts')
    expect(fixtureSession).toContain('expired-token')
  })

  it('keeps marketing and demo artifacts out of the npm package payload boundary', async () => {
    const packageJson = JSON.parse(await readText('package.json')) as {
      files?: string[]
    }

    expect(packageJson.files).not.toContain('docs')
    expect(packageJson.files).not.toContain('docs/**')
    expect(packageJson.files).not.toContain('examples')
    expect(packageJson.files).not.toContain('examples/**')
  })
})
