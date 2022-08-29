// @ts-ignore
import exec from 'await-exec'

const input = '/Users/antoinewronka/Downloads/Telegram/Sotto Mayor - When I See You (UNPROCESSED 2)/02 - Up To Me Alone.aiff';
const track = 'b';

async function main() {
  const tests = [[10], [60], [110]];
  const outputs = [];

  for (const [index, [start, duration = 10]] of tests.entries()) {
    const output = `${track}-${index}.flac`;
    outputs.push(output);

    await exec(`sox '${input}' ${output} trim ${start} ${duration}`)
  }

  const test = [...outputs].reverse().map((output, index) => {
    if (index === 0)
      return `sox ${output} -p pad 11 0`
    
    if (index === outputs.length - 1)
      return `sox - -m ${output} ${track}.flac`
    
    return `sox - -m ${output} -p pad 11 0`
  });

  await exec(test.join(' | '))

  await exec(`sox -r 8000 -c 1 ${track}.flac ${track}.mp3`)
}

main()
