var schema = {
    fs_files:{
        schema:{
            filename:String,
            contentType:String,
            length:Number,
            chunkSize:Number,
            uploadDate:Date,
            md5:String
        },
        option:{
            collection: "fs.files"
        }
    },
    fs_chunks:{
        schema:{
            files_id:   Object,
            n:   Number,
            data: Buffer
        },
        option:{
            collection: "fs.chunks"
        }
    }
};

module.exports = schema;