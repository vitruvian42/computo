import async from 'async'
import Redis from 'ioredis'

import knex from 'knex'
import bookshelf from 'bookshelf'

import knexConfig from './knexfile'

import kue from 'kue'

export let bookshelfInstance
export let kueInstance


const PORT = process.env.PORT || 8080

let knexConnection = knex(knexConfig)


const startServer  = app => {
    async.series([
        next => {
            // Check mysql connection and initialize bookshelf instance
            console.log('[Info] Connecting to Mysql using bookshelf...')
            knexConnection.raw('select 1').catch(err => {
                error => next('[Error] Mysql Connection Error: ' + error)
            });
            bookshelfInstance = bookshelf(knexConnection)
            console.log(`[Info] Mysql connection on port ${process.env.MYSQL_PORT} successful using bookshelf!`)
            next(null)
        },
        next =>{
            // Check redis connection and initialize queue (kue worker)
            console.log('[Info] Connecting to Redis...')
            let redisClient = new Redis({
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
                db: process.env.REDIS_DB
            })
            redisClient.on('error', () => {
                error => next('[Error] Redis Connection Error: ' + error)
            })
            redisClient.on('connect', () => {
                kueInstance = kue.createQueue({
                    redis : {
                        host : process.env.REDIS_HOST,
                        port : process.env.REDIS_PORT,
                        db : process.env.REDIS_DB
                    }
                });
                console.log(`[Info] RedisDB connection on port ${process.env.REDIS_PORT} successful and Queue created!`)
                next(null)
            })
        }

    ],error => {
        if(error){
            console.log(error)
            return process.exit(-1)
        }
        // Start server
        app.listen(PORT, () => console.log('[Info] Server Started Successfully! Listening on Port:', PORT))
    })
}

export default startServer