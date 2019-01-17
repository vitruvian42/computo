'use strict'

import express from 'express'
import { ResponseBody } from '../../lib'

import {kueInstance, bookshelfInstance} from '../../server'

import multer from 'multer'
import fs from 'fs'

let upload = multer({ dest: 'uploads/' })

const FilesRouter = new express.Router()

// Route exposed to upload file to s3
FilesRouter.post('/',upload.single('file'), uploadToS3)

//FilesRouter.delete('/:id', deleteFromS3)

FilesRouter.get('/', fetchDetails)

export { FilesRouter }

function uploadToS3 (request, response) {
    let files = bookshelfInstance.Model.extend({
        tableName: 'files',
    });
    let job = kueInstance.create('uploadFile', {
        path : request.file.path,
        originalname : request.file.originalname
    }).save( function(err){
        if( err ) {
            let responseBody = new ResponseBody(500,"Error", err.toString())
            response.statusMessage = responseBody.message
            response.status(responseBody.statusCode).json(responseBody)
            return true
        }
        console.log("Job ID : " +job.id +" created to upload "+request.file.originalname+" to s3!!")
        let message = "Job ID : " +job.id +" created to upload "+request.file.originalname+" to s3!!" 
        let responseBody = new ResponseBody(200,"Success", message)
        response.statusMessage = responseBody.message
        response.status(responseBody.statusCode).json(responseBody)
    })
    job.on('complete', function(result){
        console.log('Job completed with data ', result)
        new files({
            filename: result.key,
            s3_url: result.Location,
            status: "uploaded",
        })
        .save()
        .then(function(saved) {
            fs.unlinkSync(request.file.path)
        });
    })
}

function fetchDetails(request, response){
    let files = bookshelfInstance.Model.extend({
        tableName: 'files',
    });
    files
    .fetchAll()
    .then(function(files) {
        let responseBody
        responseBody = new ResponseBody(200, "Success",files)
        response.statusMessage = responseBody.message
        response.status(responseBody.statusCode).json(responseBody)
    });
}

// function deleteFromS3(request, response){

// }
