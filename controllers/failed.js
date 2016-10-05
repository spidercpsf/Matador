'use strict';


var redisModel = require('../models/redis'),
    q = require('q');


module.exports = function (app) {
    var getFailedData = function(req, res){
        var dfd = q.defer();
        var page = req.params.page || 0;
        var limit = req.params.limit || 10;
        
        redisModel.getStatus("failed").done(function(failed){
            redisModel.getJobsInList(failed).done(function(keys){
                redisModel.formatKeys(keys).done(function(formattedKeys){
                    redisModel.getDataForKeys(formattedKeys).done(function(keyList) {
                        redisModel.getStatusCounts().done(function (countObject) {
                            var model = { 
                                keys: keyList, 
                                counts: countObject, 
                                failed: true, 
                                type: "Failed", 
                                back: '/failed/' + (page*1-1) + '/' + limit, 
                                next: '/failed/' + (page*1+1) + '/' + limit
                            };
                            dfd.resolve(model);
                        });
                    });
                });
            });
        });
        return dfd.promise;
    }

    app.get('/failed/:page/:limit', function (req, res) {
        getFailedData(req, res).done(function(model){
            res.render('jobList', model);
        });
    });

    app.get('/api/failed/:page/:limit', function (req, res) {
        getFailedData(req, res).done(function(model){
            res.json(model);
        });
    });
};
