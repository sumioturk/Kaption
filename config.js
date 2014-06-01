var config = {
    dev: {},
    prd: {}
};


config.dev = {
    serverHostName: 'localhost',
    serverPortNumber: 1337,
    imageCacheTime: 60000
};

config.prd = {
    serverHostName: 'phimosis.dix.asia',
    serverPortNumber: 80,
    imageCacheTime: 60000
};


module.exports = config.dev;