#!/usr/bin/env node

const { program } = require('commander')

const { main } = require('../dist/main')

program
  .option('-f, --folder <folder>', 'Folder in which the files are located')
  .option('-r, --releaseId <releaseId>', 'Release id')
  .option('-p, --precision <maxPrecision>', 'Maximum precision')
  .option('-s, --sampleRate <maxSampleRate>', 'Maximum sample rate')

program.parse(process.argv)

main(program)
