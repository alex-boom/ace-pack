import { describe, expect, it } from 'vitest'

import { getAceHelpText, resolveAceCommand } from '../scripts/ace-cli.mjs'

describe('ACE command router', () => {
  it('routes daily commands to existing scripts', () => {
    expect(resolveAceCommand(['finish'])).toMatchObject({
      rest: [],
      scriptName: 'ai-task-finish.mjs',
    })
    expect(resolveAceCommand(['gate', '--json'])).toMatchObject({
      rest: ['--json'],
      scriptName: 'ace-quality-gate.mjs',
    })
    expect(resolveAceCommand(['hub', 'start'])).toMatchObject({
      rest: ['start'],
      scriptName: 'ace-hub.mjs',
    })
    expect(resolveAceCommand(['report', 'brief'])).toMatchObject({
      rest: [],
      scriptName: 'ai-report-brief.mjs',
    })
    expect(resolveAceCommand(['migrate'])).toMatchObject({
      rest: [],
      scriptName: 'ace-migrate.mjs',
    })
  })

  it('prints help and rejects unknown commands', () => {
    expect(resolveAceCommand([])).toMatchObject({ help: true })
    expect(getAceHelpText()).toContain('npm run ace -- <command>')
    expect(getAceHelpText()).toContain('migrate')
    expect(() => resolveAceCommand(['unknown'])).toThrow('Unknown ACE command: unknown')
  })
})
