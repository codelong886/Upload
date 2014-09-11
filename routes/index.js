var express = require('express');
var router = express.Router();
var db = require('./../MongoDB/db');
var Schema = require('./../MongoDB/schema');
var fs = require('fs');
var formidable = require('formidable');

router.get('/',function(req,res){
    db.getDataContext(function(err, dataContext){
        dataContext.find("fs_files",{},function (err, docs){
            res.render('index',{title:'Home',FileLists:docs});
        });
    });
})

router.post('/Upload', function (req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = "./../public/LoadFiles/Temp"
    form.parse(req, function (err, fields, files) {
        if(err){
            console.log(err);
        }
    });
    form.on('file', function (field, file) {
        db.getDataContext(function (err, dataContext) {
            var gfs_options = {
                filename: file.name,
                mode: 'w',
                content_type: file.type,
                metadata: {
                    'client': "",
                    'user': ""
                }
            };
            dataContext.Upload(file.path,gfs_options,function(err){
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        });
    });
    form.on('progress', function (bytesReceived, bytesExpected) {
        var percent = Math.round(bytesReceived / bytesExpected * 100);
        //console.log(percent);
    });
    form.on('end', function () {
        db.getDataContext(function(err, dataContext){
            dataContext.find("fs_files",{},function (err, docs){
                res.render('index',{title:'Home',FileLists:docs});
            });
        });
    });
});

var ObjectID = require('mongodb').ObjectID;

router.post('/GetFile',function(req,res){
    var argObj={query:{"files_id": new ObjectID(req.body.ObjectId)},sort:{"n":1}};
    db.getDataContext(function(err, dataContext) {
        dataContext.findOne("fs_files",{"_id": new ObjectID(req.body.ObjectId)},function (err, result){
            var dir = "./../public/LoadFiles/" + result.filename;
            dataContext.find("fs_chunks",argObj, function (err, docs) {
                var buffer = new Buffer(result.length);
                for(var i = 0;i<docs.length;i++){
                    docs[i].data.copy(buffer);
                }
                var write = fs.createWriteStream(dir);
                fs.writeFile(dir,buffer,function(err){
                    if(err) throw err;
                    else{}
                });
                res.pipe(write);
                write.end();
                /*
                 if (fs.existsSync(file.path)) {
                 fs.unlinkSync(file.path);
                 }*/
            });
        });
    });
})

var urlparse = require('url').parse
    , http = require('http');

function download(url, savefile, callback) {
    console.log('download', url, 'to', savefile)
    var urlinfo = urlparse(url);
    var options = {
        method: 'GET',
        host: urlinfo.host,
        path: urlinfo.pathname
    };
    if(urlinfo.port) {
        options.port = urlinfo.port;
    }
    if(urlinfo.search) {
        options.path += urlinfo.search;
    }
    var req = http.request(options, function(res) {
        var writestream = fs.createWriteStream(savefile);
        writestream.on('close', function() {
            callback(null, res);
        });
        res.pipe(writestream);
    });
    req.end();
};


module.exports = router;