// please use promise approach to fight the naive one in parse-callback.js
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const parse = Promise.promisify(require('csv-parse'));
const helper = Promise.promisifyAll(require('./helper'));
const util = require('util');

const filePath = './sample.csv';

function sendAndLog(line) {
    const transformed = [`${line[0]} ${line[1]}`].concat(line.slice(2));

    return helper.sendSmsAsync(transformed)
        .error(e => {
            const sendingStatus = {
                status: 500,
                message: e.message,
            };

            const lineToLog = {
                sendingStatus,
                line: transformed,
            };

            return helper.logToS3Async(lineToLog);
        })
        .error(e => {});
}

fs.readFileAsync(filePath)
    .then(parse)
    .then(parsed => {
        const toBeSent = parsed.slice(1);

        return Promise.each(toBeSent, sendAndLog);
    })
    .catch(err => {
        console.error(err);
    });
