'use strict'

const RedisService = require('../services/redis.service')
const config = require('./config')

const checkForDuplicates = (payload, uploadData) => {
  let duplicateFound

  if (uploadData.files && uploadData.fileSizes) {
    for (let i = 0; i < uploadData.files.length; i++) {
      if (
        uploadData.files[i] === payload.files.filename &&
        uploadData.fileSizes[i] === payload.files.bytes
      ) {
        duplicateFound = true
        break
      }
    }
  }

  return duplicateFound
}

const checkForFileSizeError = async (request, redisKey) => {
  const errors = []

  if (await RedisService.get(request, redisKey)) {
    errors.push({
      name: 'files',
      text: `The file must be smaller than ${config.maximumFileSize}MB`
    })
  }

  await RedisService.set(request, redisKey, false)

  return errors
}

module.exports = {
  checkForDuplicates,
  checkForFileSizeError
}
