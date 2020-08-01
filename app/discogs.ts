// @ts-ignore
import Discojs from 'discojs'

type DiscogsResponse = {
  artists: ReadonlyArray<{
    name: string
  }>
  styles: ReadonlyArray<string>
  title: string
  tracklist: ReadonlyArray<{
    position: string | number
    title: string
  }>
  uri: string
  year: string
}

export type GetReleaseDataType = {
  artist: string
  album: string
  genre: string
  tracklist: ReadonlyArray<string>
  year: string
}

export async function getReleaseData(releaseId: number): Promise<GetReleaseDataType> {
  const client = new Discojs()

  const { artists, styles, title, tracklist, year }: DiscogsResponse = await client.getRelease(releaseId)

  const artist = artists.map(({ name }) => name.replace(/\([0-9]*\)/g, '').trim()).join(', ')
  const album = title.trim()
  const parsedTracklist = tracklist.map(({ position, title }) => title.trim())

  return {
    artist,
    album,
    genre: styles.join(' / '),
    tracklist: parsedTracklist,
    year,
  }
}
