import { runHardcodedR2Subject } from './_run-hardcoded-r2'

runHardcodedR2Subject('matematica').catch(async (error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
