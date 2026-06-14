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

  it('routes legacy command names as router arguments', () => {
    expect(resolveAceCommand(['ace:finish'])).toMatchObject({
      rest: [],
      scriptName: 'ai-task-finish.mjs',
    })
    expect(resolveAceCommand(['agent-memory:init'])).toMatchObject({
      rest: [],
      scriptName: 'bootstrap-agent-memory.mjs',
    })
    expect(resolveAceCommand(['ai:task:classify'])).toMatchObject({
      rest: [],
      scriptName: 'ai-task-classify.mjs',
    })
    expect(resolveAceCommand(['update:task', '--message', 'Updated task'])).toMatchObject({
      rest: ['task', '--message', 'Updated task'],
      scriptName: 'ai-update.mjs',
    })
    expect(resolveAceCommand(['ai:update:changed', '--file', 'README.md'])).toMatchObject({
      rest: ['changed', '--file', 'README.md'],
      scriptName: 'ai-update.mjs',
    })
  })

  it('prints help and rejects unknown commands', () => {
    expect(resolveAceCommand([])).toMatchObject({ help: true })
    expect(getAceHelpText()).toContain('npm run ace -- <command>')
    expect(getAceHelpText()).toContain('migrate')
    expect(getAceHelpText()).toContain('supported only as router arguments')
    expect(() => resolveAceCommand(['unknown'])).toThrow('Unknown ACE command: unknown')
  })
})
