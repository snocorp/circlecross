const fs = require('fs')
const path = require('path')
const readline = require('readline')
const yargs = require('yargs/yargs')

const MIN_WORD_LENGTH = 3
const MAX_WORD_LENGTH = 6

async function main(argv) {
  let min = MIN_WORD_LENGTH
  if (argv.min) {
    min = argv.min
  }

  let max = MAX_WORD_LENGTH
  if (argv.max) {
    max = argv.max
  }

  if (min > max) {
    throw Error(`minimum word length ${min} is greater than the maximum ${max}`)
  }
  if (min < 1) {
    throw Error(`minimum length must be at least 1`)
  }

  const fileStream = fs.createReadStream(
    path.join(__dirname, '..', 'data', 'words.txt')
  )

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  const root = {
    value: '',
    word: false,
    children: {}
  }
  for await (const line of rl) {
    let currNode = root
    if (line.length >= min && line.length <= max) {
      //console.log(line)
      for (let i = 0; i < line.length; i++) {
        if (!currNode.children[line[i]]) {
          currNode.children[line[i]] = {
            value: currNode.value + line[i],
            word: i + 1 === line.length,
            children: {}
          }
        } else {
          currNode.children[line[i]].word =
            currNode.children[line[i]].word || i + 1 === line.length
        }
        currNode = currNode.children[line[i]]
      }
    }
  }

  console.log(JSON.stringify(root))
}

;(async () => {
  const argv = yargs(process.argv.slice(2)).number('min').number('max').argv
  try {
    await main(argv)
  } catch (error) {
    console.error(error)
  }
})()
