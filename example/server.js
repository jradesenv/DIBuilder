#!/bin/env node

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    cors = require('cors'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    path_module = require('path'),
    dibuilder = require('dibuilder');

var appPort = parseInt(process.env.PORT) || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(__dirname));

//ROUTES
//==========================================
var router = express.Router();
router.use(function(req, res, next){
	console.log('request received: ' + req.originalUrl);
	next();
});

// DIBuilder
dibuilder.addInstance('router', router);
dibuilder.addInstance('mongoose', mongoose);
dibuilder.loadModules(path_module.join(__dirname, './project/resources'));
dibuilder.loadModules(path_module.join(__dirname, './project/domain'));

dibuilder.build(function(){
    router.get('/', function(req, res){
        res.send("DIBuilder example!");
    });

    //register api routes
    app.use('/api', router);


    // Banco de dados
    //=========================================================
    // var mongoUrl = 'mongodb://localhost/example';
    //  if (process.env.URL_MONGOLAB){
    //     mongoUrl = process.env.URL_MONGOLAB;
    //  }

    // mongoose.connect(mongoUrl, function(err, res) {
    //     if (err) {
    //         console.log('Error connecting to Database: ' + err);
    //     } else {
    //         console.log('Connected to Database: ' + mongoUrl);
    //     }
    // });

    // Start
    //=========================================================
    server.listen(appPort, function() {
        console.log('Express server listening on port ' + appPort);

    });       
});