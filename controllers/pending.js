'use strict';


var redisModel = require('../models/redis'),
    q = require('q');


module.exports = function (app) {
    var getPendingModel = function(req, res){
        var dfd = q.defer();
        var page = req.params.page || 0;
        var limit = req.params.limit || 10;
        
        redisModel.getStatus("wait").done(function(active){
            redisModel.getJobsInList(active).done(function(keys){
                redisModel.formatKeys(keys).done(function(formattedKeys){
                    redisModel.getDataForKeys(formattedKeys).done(function(keyList) {
                        redisModel.getStatusCounts().done(function (countObject) {
                            var model = { 
                                keys: keyList, 
                                counts: countObject, 
                                pending: true, 
                                type: "Pending", 
                                back: '/pending/' + (page*1-1) + '/' + limit, 
                                next: '/pending/' + (page*1+1) + '/' + limit
                            };
                            dfd.resolve(model);
                        });
                    });
                });
            });
        });
        return dfd.promise;
    };

    app.get('/pending/:page/:limit', function (req, res) {
        getPendingModel(req, res).done(function(model){
            res.render('jobList', model);
        });
    });

    app.get('/api/pending/:page/:limit', function (req, res) {
        getPendingModel(req, res).done(function(model){
            res.json(model);
        });
    });
};
