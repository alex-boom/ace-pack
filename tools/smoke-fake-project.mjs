import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const stagingDir = path.join(repoRoot, '.npm-publish')

export async function runSmokeFakeProjects(options = {}) {
  await buildStagedPackage()

  const cases = options.cases ?? ['js', 'non-js']
  const results = []

  for (const caseName of cases) {
    results.push(await runSmokeCase(caseName, options))
  }

  return results
}

async function runSmokeCase(caseName, options) {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), `ace-smoke-${caseName}-`))
  let keepProject = Boolean(options.keep)

  try {
    await createFakeProject(rootDir, caseName)
    await installFromStagedPackage(rootDir)
    await writeCompleteTaskState(rootDir)

    await runNodeScript(rootDir, 'ace-cli.mjs', ['onboard', '--apply'])
    await runNodeScript(rootDir, 'ace-cli.mjs', ['discover'])
    await initGitRepo(rootDir)
    await writeProjectFile(rootDir, 'README.md', `# ${caseName} smoke change\n`)
    await runNodeScript(rootDir, 'ace-cli.mjs', ['finish'])
    await runNodeScript(rootDir, 'ace-cli.mjs', ['check'])
    await runNodeScript(rootDir, 'ace-cli.mjs', ['hub', '--mode', 'start'])
    await runNodeScript(rootDir, 'ace-cli.mjs', ['gate'])

    const verification = await verifySmokeProject(rootDir)

    return {
      caseName,
      rootDir: keepProject ? rootDir : null,
      verification,
    }
  } catch (error) {
    keepProject = options.keepOnFailure !== false
    throw new Error(
      `ACE fake-project smoke failed for ${caseName} at ${rootDir}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
  } finally {
    if (!keepProject) {
      await rm(rootDir, { force: true, recursive: true })
    }
  }
}

async function buildStagedPackage() {
  await execFileAsync(process.execPath, [path.join(repoRoot, 'tools', 'build-npm-package.mjs')], {
    cwd: repoRoot,
  })
}

async function initGitRepo(rootDir) {
  await execFileAsync('git', ['init'], { cwd: rootDir })
  await execFileAsync('git', ['config', 'user.email', 'ace@example.com'], { cwd: rootDir })
  await execFileAsync('git', ['config', 'user.name', 'ACE Smoke'], { cwd: rootDir })
  await execFileAsync('git', ['add', '.'], { cwd: rootDir })
  await execFileAsync('git', ['commit', '-m', 'Initial smoke fixture'], { cwd: rootDir })
}

async function installFromStagedPackage(rootDir) {
  const installerUrl = pathToFileURL(path.join(stagingDir, 'install-ace-pack.mjs')).href
  const { installAcePack } = await import(`${installerUrl}?t=${Date.now()}`)

  await installAcePack(rootDir)
}

async function createFakeProject(rootDir, caseName) {
  if (caseName === 'js') {
    await writeProjectFile(
      rootDir,
      'package.json',
      `${JSON.stringify(
        {
          dependencies: {
            express: '^5.0.0',
            prisma: '^6.0.0',
          },
          name: 'ace-smoke-js',
          private: true,
          scripts: {
            test: 'node -e "console.log(\'ok\')"',
          },
        },
        null,
        2,
      )}\n`,
    )
    await writeProjectFile(rootDir, 'src/routes/users.ts', 'export const users = true\n')
    await writeProjectFile(rootDir, 'prisma/schema.prisma', 'model User { id String @id }\n')
    return
  }

  if (caseName === 'non-js') {
    await writeProjectFile(rootDir, 'requirements.txt', 'fastapi==0.115.0\nalembic==1.13.0\n')
    await writeProjectFile(rootDir, 'app/core/security.py', 'def verify():\n    return True\n')
    await writeProjectFile(rootDir, 'alembic/env.py', 'config = None\n')
    return
  }

  throw new Error(`Unknown smoke case: ${caseName}`)
}

async function writeCompleteTaskState(rootDir) {
  await writeProjectFile(
    rootDir,
    '.ai/state/task-state.md',
    `# Task State

## Lifecycle & Meta

### Feature Name
ACE smoke fixture

### Lifecycle
Status: complete
Version: v1
Task Tier: small
Design Review Required: no
Started: 2026-06-14 12:00
Ready For Archive: yes

### Goal
Verify that the ACE candidate package works inside a disposable project.

### Current Status
- [x] Fake project created.
- [x] ACE installed.

### Affected Areas
- .ai
- scripts

### Constraints
- Keep smoke local and disposable.

### Acceptance Criteria
- ACE check, hub, onboard, and gate pass.

### Completion Checklist
- [x] Goal completed
- [x] Future agent context preserved
- [x] Verification recorded
- [x] Publish/deploy decision recorded when relevant
- [x] Extra docs updated only where changed
- [x] \`ace:validate\` and \`ace finish\` passed

## Business Value & Approach

### Business Value / Product Alignment
This smoke test protects release quality by validating the installed ACE workflow outside the source repository.

### Technical Approach
Option 1:
- Trust unit tests only.

Option 2:
- Install ACE into a fake project and run the local workflow.

Chosen Approach:
- Use the fake project workflow because it catches packaging and installation regressions.

## Changed Files / Diff

[fake-project]
- Smoke fixture files generated for local release validation.

## Handoff & Next Steps

### Last Update
2026-06-14 12:00

### What Was Done
- Installed ACE into a fake project and prepared smoke-test memory.

### Current State
- Fake project is ready for local ACE commands.

### Quality Review
Product Alignment:
- Smoke testing validates the release workflow.

Architecture:
- The smoke project uses installed ACE scripts, not source-only helpers.

Security:
- No network calls or secrets are used.

Code Quality:
- The smoke checks cover install, onboard, check, hub, and gate commands.

### Next Steps
- Remove the disposable project after smoke completes.

### Known Issues
- None.

### Verification
- \`ace onboard --apply\` passed.
- \`ace check\` passed.
- \`ace hub start\` passed.
- \`ace gate\` passed.

### Notes
- NPM publish: required before final release; deferred by maintainer.
`,
  )
  await writeProjectFile(
    rootDir,
    '.ai/knowledge/reflection-log.md',
    `# Reflection Log

## Unresolved

## Resolved

### 2026-06-14 12:00 Smoke fixture
Status: resolved
- Stuck Point: Release candidates need package-level validation.
- Likely Cause: Unit tests do not exercise installed projects.
- Proposed Improvement: Run fake-project smoke before final release.
`,
  )
}

async function verifySmokeProject(rootDir) {
  const packageJson = JSON.parse(await readFile(path.join(rootDir, 'package.json'), 'utf8'))
  const agentsContent = await readFile(path.join(rootDir, 'AGENTS.md'), 'utf8')
  const memoryConfig = JSON.parse(
    await readFile(path.join(rootDir, '.ai/config/memory-config.json'), 'utf8'),
  )
  const generatedContext = await readFile(path.join(rootDir, '.ai/generated/context.md'), 'utf8')
  const projectConventions = await readFile(
    path.join(rootDir, '.ai/knowledge/project-conventions.md'),
    'utf8',
  )
  const taskState = await readFile(path.join(rootDir, '.ai/state/task-state.md'), 'utf8')
  const cursorRules = await readFile(path.join(rootDir, '.cursorrules'), 'utf8')
  const windsurfRules = await readFile(path.join(rootDir, '.windsurfrules'), 'utf8')
  const copilotInstructions = await readFile(
    path.join(rootDir, '.github/copilot-instructions.md'),
    'utf8',
  )
  const qualityGateScript = await readFile(path.join(rootDir, 'scripts/ace-quality-gate.mjs'), 'utf8')

  assert(packageJson.scripts?.ace === 'node ./scripts/ace-cli.mjs', 'package.json missing ace router script')
  assert(packageJson.scripts?.['ace:validate'], 'package.json missing ace:validate gate script')
  assert(!packageJson.scripts?.['ace:onboard'], 'package.json should not expose ace:onboard script')
  assert(!packageJson.scripts?.['ace:gate'], 'package.json should not expose ace:gate script')
  assert(
    agentsContent.includes('## ACE (Agentic Context Engine) Workflow'),
    'AGENTS.md missing ACE workflow',
  )
  assert(
    memoryConfig._profile?.status === 'profiled',
    '.ai/config/memory-config.json is not profiled',
  )
  assert(
    projectConventions.includes('<!-- ace-discover:managed -->'),
    'ace discover did not generate project conventions',
  )
  assert(generatedContext.includes('# ACE Hub Context'), 'ace:hub did not generate context')
  assert(
    generatedContext.includes('# --- FILE: .ai/knowledge/project-conventions.md ---'),
    'ace:hub did not include project conventions',
  )
  assert(taskState.includes('ACE auto-closed a small low-risk task'), 'ace:finish did not auto-close small smoke diff')
  assert(cursorRules.includes('ace-managed-ide-rules:start'), '.cursorrules missing ACE bridge')
  assert(windsurfRules.includes('ace-managed-ide-rules:start'), '.windsurfrules missing ACE bridge')
  assert(copilotInstructions.includes('ace-managed-ide-rules:start'), 'Copilot instructions missing ACE bridge')
  assert(qualityGateScript.includes('runQualityGate'), 'ace-quality-gate script missing gate export')

  return {
    bridges: ['.cursorrules', '.windsurfrules', '.github/copilot-instructions.md'],
    generatedContext: '.ai/generated/context.md',
    packageManager: memoryConfig._profile?.packageManager ?? 'unknown',
    profileStatus: memoryConfig._profile?.status,
    projectConventions: '.ai/knowledge/project-conventions.md',
    smallAutoCloseout: taskState.includes('ACE auto-closed a small low-risk task'),
  }
}

async function runNodeScript(rootDir, scriptName, args) {
  try {
    await execFileAsync(process.execPath, [path.join(rootDir, 'scripts', scriptName), ...args], {
      cwd: rootDir,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    })
  } catch (error) {
    const stdout = typeof error?.stdout === 'string' && error.stdout.trim() ? error.stdout.trim() : ''
    const stderr = typeof error?.stderr === 'string' && error.stderr.trim() ? error.stderr.trim() : ''
    const details = [stdout && `stdout:\n${stdout}`, stderr && `stderr:\n${stderr}`]
      .filter(Boolean)
      .join('\n\n')

    throw new Error(
      `${scriptName} failed${details ? `\n${details}` : ''}`,
      { cause: error },
    )
  }
}

async function writeProjectFile(rootDir, relativePath, content) {
  const filePath = path.join(rootDir, relativePath)

  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, content, 'utf8')
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function parseArgs(argv) {
  return {
    keep: argv.includes('--keep'),
    keepOnFailure: !argv.includes('--no-keep-on-failure'),
  }
}

async function main() {
  const results = await runSmokeFakeProjects(parseArgs(process.argv.slice(2)))

  for (const result of results) {
    process.stdout.write(`[ACE SMOKE] ${result.caseName}: passed\n`)

    if (result.rootDir) {
      process.stdout.write(`[ACE SMOKE] kept project: ${result.rootDir}\n`)
    }
  }
}

const isMainModule =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMainModule) {
  await main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
  })
}
