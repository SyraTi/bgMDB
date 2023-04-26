import readline from 'src/readline'

export default readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})
