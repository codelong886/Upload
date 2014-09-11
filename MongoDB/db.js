var mongoose = require('mongoose');
var merge = require('utils-merge');
mongoose.connect('mongodb://localhost/Dragon');
var Schema = require('./schema');
var ObjectId = mongoose.Schema.ObjectId;

var dbConnection = mongoose.connection;

var dataContext = {};
exports.getDataContext = getDataContext;

/*
var fs_files_schema = mongoose.Schema(Schema.fs_files,Schema.option);
var fs_chunks_schema = mongoose.Schema(Schema.fs_chunks,Schema.option);

var fs_files_model = mongoose.model(Schema.fs_files, fs_files_schema);
var fs_chunks_model = mongoose.model(Schema.fs_chunks, fs_chunks_schema);
*/

var Grid = require('gridfs-stream');
var fs = require('fs');

dbConnection.on('error', console.error);
dbConnection.once('open', function() {
    console.log('open database');
    dataContext.find = find;
    dataContext.findOne = findOne;
    dataContext.Upload = Upload;
});

function getDataContext(callback){
    if(!dbConnection) {
        dbConnection = mongoose.connection;

        dbConnection.on('error', function (err) {
            callback(err);
        });

        dbConnection.on('open', function () {
            dataContext.find = find;
            dataContext.insert = insert;

            callback(null, dataContext);
        });
    }
    else{
        callback(null, dataContext);
    }
}

function getModel(key) {
    var model = dbConnection.modelNames();

    if(model.indexOf(key) != -1) {
        return dbConnection.model(key);
    } else {
        var schemaObj = Schema[key];

        if(schemaObj) {
            var companySchema = mongoose.Schema(schemaObj.schema, schemaObj.option);

            return dbConnection.model(key, companySchema);
        } else {
            return null;
        }
    }
}

function find(modelKey,argObj,callback){
    var model = getModel(modelKey);
    if(model){
        var query = argObj.query || {};
        var select = argObj.select || {};
        var sort = argObj.sort || {};

        if("string" == typeof argObj.sort) {
            sort[argObj.sort] = 1;
        } else if("object" == typeof argObj.sort) {
            sort = merge(sort, argObj.sort);
        }

        var option = argObj.option || {};
        option.sort = sort;

        model.find(query, select, option, callback);
    }
    else{
        callback('can`t get model');
    }
}

function findOne(modelKey, argObj, callback) {
    var model = getModel(modelKey);

    if (model) {
        model.findOne(argObj, callback);
    } else {
        callback('can`t get model');
    }
}

function Upload(filepath,gfs_options,callback){
    var gfs = Grid(dbConnection.db,mongoose.mongo);
    var writestream = gfs.createWriteStream(gfs_options);
    fs.createReadStream(filepath).pipe(writestream);
    callback(null, filepath);
}