const logger = require('./logger')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    const field = error.path;
    return response.status(400).send({
      error: `malformatted ${field}`
    })

  } else if (error.name === 'ValidationError') {

    return response.status(400).json({ error: error.message })

  } else if (error.name === 'MongoServerError' && error.code === 11000) {

    const [field, value] = Object.entries(error.keyValue)[0]

    return response.status(400).json({
      error: `expected \`${field}\` to be unique, but you provided "${value}`
    })
    
  }

  next(error)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler
}