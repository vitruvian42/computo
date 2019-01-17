'use strict'

// Import required modules
import Express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

import { Routes } from './api/routes'
import server from './server'

// Initialize variables
const app = new Express()
const corsOptions = {
    credentials : true,
    origin : process.env.CORS_ORIGIN,
    methods : process.env.CORS_METHOD
}

// Set app parameters
app.disable('etag')
app.disable('x-powered-by')
app.use(cors(corsOptions))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }))

//Initialize Routes
Routes.init(app)

// Start Server
server(app)



