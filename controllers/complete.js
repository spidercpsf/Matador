'use strict';


var redisModel = require('../models/redis'),
    q = require('q');


module.exports = function (app) {
    var requestComplete = function(req, res){
        var dfd = q.defer();
        console.log("Rendering completed page:", req.params);
        var page = req.params.page || 0;
        var limit = req.params.limit || 10;
        var queue = req.params.queue || undefined;
        if(queue === 'all') queue = undefined;
        
        redisModel.getStatus("complete", queue, {start: page*limit, limit: limit*1}).done(function(completed){
            redisModel.getJobsInList(completed).done(function(keys){
                redisModel.formatKeys(keys).done(function(formattedKeys){
                    redisModel.getDataForKeys(formattedKeys).done(function(keyList) {
                        redisModel.getStatusCounts().done(function(countObject){
                            var model = { 
                                keys: keyList, 
                                counts: countObject, 
                                complete: true, 
                                type: "Complete", 
                                back: '/complete/' + (page*1-1) + '/' + limit, 
                                next: '/complete/' + (page*1+1) + '/' + limit
                            };
                            dfd.resolve(model);
                        });
                    });
                });
            });
        });
        return dfd.promise;
    };

    app.get('/complete/:page/:limit/:queue', function (req, res) {
        requestComplete(req, res).done(function(model){
            res.render('jobList', model);
        });
    });

    app.get('/api/complete/:page/:limit/:queue', function (req, res) {
        requestComplete(req, res).done(function(model){
            res.json(model);
        });
    });
};
