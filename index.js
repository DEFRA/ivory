import dotenv from 'dotenv'
import { createServer } from './server/index.js'
dotenv.config()

createServer()
  .then(server => server.start())
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
