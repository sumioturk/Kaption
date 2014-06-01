var CronJob = require('cron').CronJob;
var fs = require('fs');

var doJob = function () {
    console.error("job started");
    fs.readdir('./public/images/', function (err, list) {
        if (err) throw err;
        console.error(list);
        list.forEach(function (file) {
            fs.stat('./public/images/' + file, function (ferr, stat) {
                if (Date.parse(stat.mtime) + 60000 < Date.now()) {
                    fs.unlink('./public/images/' + file, function (e) {
                        if (e) console.log("failed to delete " + e);
                        console.log('deleted ' + file);
                    });
                }
            });
        })
    });
};

var job = new CronJob({
    cronTime: "*/1 * * * *",
    onTick: function () {
        doJob();
    },
    onComplete: function () {
        console.log('tock');
    }
});

job.start();