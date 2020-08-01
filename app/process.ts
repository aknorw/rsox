import path from 'path'

// @ts-ignore
import exec from 'await-exec'
import glob from 'glob-promise'
import inquirer from 'inquirer'
import mkdirp from 'mkdirp'
import NodeID3 from 'node-id3'

import { GetReleaseDataType } from './discogs'

const AUDIO_EXTENSIONS = ['aiff', 'alac', 'flac', 'wav']

export async function processFiles(
  folder: string,
  releaseData: GetReleaseDataType,
  maxPrecision: number,
  maxSampleRate: number,
) {
  // Change current folder
  process.chdir(folder)

  // List files
  const files = await glob(`*.@(${AUDIO_EXTENSIONS.join('|')})`)

  if (!files.length) {
    console.log('No audio files found.')
    process.exit(-1)
  }

  // Create new folder
  const folderName = `${releaseData.artist} - ${releaseData.album} (${releaseData.year})`
  await mkdirp(`./${folderName}`)

  const availableTracks = new Set(Array.from(releaseData.tracklist))

  for (const file of files) {
    console.log(`Working on ${file}`)

    const { precision, sampleRate } = await getMetadata(file)

    const fileExtension = path.extname(file)
    const fileBasename = path.basename(file, fileExtension)
    const newFile = `${folderName}/${fileBasename}.flac`

    await convertFile(file, newFile, Math.min(maxPrecision, precision), Math.min(maxSampleRate, sampleRate))

    await tagTrack(newFile, releaseData, availableTracks)
  }
}

async function getMetadata(file: string) {
  const soxi = await exec(`soxi '${file}'`)
  const metadata: ReadonlyArray<string> = soxi.stdout.split(`\n`)

  const [precision] = metadata.find((d) => d.includes('Precision'))!.match(/[0-9]{2}/)!

  const [samplerate] = metadata.find((d) => d.includes('Sample Rate'))!.match(/[0-9]{5}/)!

  return {
    precision: Number(precision),
    sampleRate: Number(samplerate),
  }
}

async function convertFile(originalFile: string, createdFile: string, precision: number, sampleRate: number) {
  await exec(`sox '${originalFile}' -G -b ${precision} '${createdFile}' rate -v -L ${sampleRate} dither`)
  console.log('File converted')
}

async function tagTrack(
  file: string,
  { artist, album, genre, tracklist, year }: GetReleaseDataType,
  availableTracks: Set<string>,
) {
  const { track } = await inquirer.prompt({
    type: 'list',
    name: 'track',
    message: 'Choose the track',
    choices: [...availableTracks],
  })

  availableTracks.delete(track)

  const trackNumber = tracklist.indexOf(track) + 1

  const tags = {
    title: track,
    artist,
    album,
    genre,
    trackNumber: trackNumber.toString(),
    date: year,
  }

  await NodeID3.update(tags, file)
}
