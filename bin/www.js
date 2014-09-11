#!/usr/bin/env node
var debug = require('debug')('Sample');
var app = require('../app');

app.set('port', process.env.PORT || 2366);

var server = app.listen(app.get('port'), function () {
    console.log(app.get('port'));
    debug('Express server listening on port ' + server.address().port);
});