var config = {
    dev: {},
    prd: {}
};


config.dev = {
    serverHostName: 'localhost',
    serverPortNumber: 1337
};

config.prd = {
    serverHostName: 'phimosis.dix.asia',
    serverPortNumber: 80
};


module.exports = config.dev;