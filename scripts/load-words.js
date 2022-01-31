const fs = require('fs')
const path = require('path')
const readline = require('readline')
const yargs = require('yargs/yargs')

const WORD_LENGTH = 6

async function main(argv) {
  let len = WORD_LENGTH
  if (argv.len) {
    len = argv.len
  }

  if (len < 1) {
    throw Error(`minimum length must be at least 1`)
  }

  const fileStream = fs.createReadStream(
    path.join(__dirname, '..', 'data', 'words.txt')
  )

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  const list = []
  for await (const line of rl) {
    if (line.length === len) {
      list.push(line)
    }
  }

  console.log(JSON.stringify(list))
}

;(async () => {
  const argv = yargs(process.argv.slice(2)).number('len').argv
  try {
    await main(argv)
  } catch (error) {
    console.error(error)
  }
})()
