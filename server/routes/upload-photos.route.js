'use strict'

const { Paths, Views } = require('../utils/constants')
// const { buildErrorSummary } = require('../utils/validation')

// TODO validate length (413 error - Payload content length greater than maximum allowed: 1048576")
const MAX_MEGABYES = 5

const handlers = {
  get: (request, h) => {
    return h.view(Views.UPLOAD_PHOTOS, {
      ..._getContext()
    })
  },

  post: (request, h) => {
    const payload = request.payload
    console.log(payload)

    // const errors = _validateForm(payload)
    // if (errors.length) {
    // return h.view(Views.UPLOAD_PHOTOS, {
    //       ..._getContext(),
    //       ...buildErrorSummary(errors)
    // })
    //     .code(400)
    // }

    return h.view(Views.UPLOAD_PHOTOS)

    // return h.redirect(Paths.WHO_OWNS_ITEM)
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Add up to 6 photos of your item'
  }
}

// const _validateForm = payload => {
//   const errors = []

//   // TODO Validation

//   return errors
// }

module.exports = [
  {
    method: 'GET',
    path: `${Paths.UPLOAD_PHOTOS}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.UPLOAD_PHOTOS}`,
    handler: handlers.post,
    config: {
      payload: {
        maxBytes: 1024 * 1024 * MAX_MEGABYES,
        multipart: {
          output: 'file'
        },
        parse: true
      }
    }
  }
]
