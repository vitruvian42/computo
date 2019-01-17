require('dotenv').config()
import kue from 'kue'
import cluster from 'cluster'
import os from 'os'
import AWS from 'aws-sdk'
import fs from 'fs'

AWS.config.update({region: process.env.S3_REGION})

const s3 = new AWS.S3()

let uploadParams={
    Bucket: process.env.S3_BUCKET
}

const clusterWorkerSize = os.cpus().length

let queue = kue.createQueue({
    redis : {
        host : process.env.REDIS_HOST,
        port : process.env.REDIS_PORT
    }
})


if (cluster.isMaster) {
    kue.app.listen(process.env.WORKER_PORT);
    for (var i = 0; i < clusterWorkerSize; i++) {
        cluster.fork();
    }
}else{
    queue.process("uploadFile",5,(job,done)=>{
        console.log(job.data.path,job.data.originalname)
        var fileStream = fs.createReadStream(job.data.path);
        fileStream.on('error', function(err) {
            console.log('File Error', err);
        });
        uploadParams.Body = fileStream;
        uploadParams.Key = job.data.originalname;
        s3.upload (uploadParams, function (err, data) {
            if (err) {
              console.log("Error", err);
            } if (data) {
              console.log("Upload Success", data.Location);
                done(null,data)
            }
            
        });
    })
}



