import { getReleaseData } from './discogs'
import { processFiles } from './process'

export async function main({ folder, releaseId, maxPrecision, maxSampleRate }: Record<string, string>) {
  if (!folder) throw new Error('Folder must be defined!')

  if (!releaseId) throw new Error('Release id must be defined!')

  // Get release information
  const releaseData = await getReleaseData(Number(releaseId))

  await processFiles(
    folder,
    releaseData,
    maxPrecision ? Number(maxPrecision) : 24,
    maxSampleRate ? Number(maxSampleRate) : 48000,
  )
}
