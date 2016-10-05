'use strict';


var redisModel = require('../models/redis'),
    q = require('q');


module.exports = function (app) {
    var requestActive = function(req, res){
        var dfd = q.defer();
        var page = req.params.page || 0;
        var limit = req.params.limit || 10;
        
        redisModel.getStatus("active").done(function(active){
            redisModel.getJobsInList(active).done(function(keys){
                redisModel.formatKeys(keys).done(function(formattedKeys){
                    redisModel.getDataForKeys(formattedKeys).done(function(keyList) {
                        redisModel.getProgressForKeys(keyList).done(function (keyList) {
                            redisModel.getStatusCounts().done(function (countObject) {
                                var model = { 
                                    keys: keyList, 
                                    counts: countObject, 
                                    active: true, 
                                    type: "Active", 
                                    back: '/active/' + (page*1-1) + '/' + limit, 
                                    next: '/active/' + (page*1+1) + '/' + limit
                                };
                                dfd.resolve(model);
                            });
                        });
                    });
                });
            });
        });
        return dfd.promise;
    }

    app.get('/active/:page/:limit', function (req, res) {
        requestActive(req, res).done(function(model){
            res.render('jobList', model);
        });
    });

    app.get('/api/active/:page/:limit', function (req, res) {
        requestActive(req, res).done(function(model){
            res.json(model);
        });
    });
};
