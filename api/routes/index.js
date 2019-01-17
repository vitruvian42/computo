'use strict'

// import rotues ;
import { ResponseBody } from '../../lib'
import { FilesRouter } from './Files'

let Routes = [
  { path: '/files', router: FilesRouter }
]

Routes.init = (app) => {
  if (!app || !app.use) {
    console.error('[Error] Route Initialization Failed: app / app.use is undefined')
    return process.exit(1)
  }

  Routes.forEach(route => {
    app.use(route.path, route.router)
  })

  app.use('*', (request, response, next) => {
    const message = ['Cannot', request.method, request.originalUrl].join(' ')
    const error = new ResponseBody(404, message)
    next(error)
  })

  app.use((error, request, response, next) => {
    if (!error) { return }

    if (error.statusCode) {
      response.statusMessage = error.message
      return response.status(error.statusCode).json(error)
    }

    const message = error.toString()
    const err = new ResponseBody(500, message)
    response.statusMessage = err.message
    return response.status(err.statusCode).json(err)
  })
}

export { Routes }
