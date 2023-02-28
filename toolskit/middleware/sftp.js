const config = {
    host: 'callme-dev.com',
    port: '49235',
    username: 'chrako',
    password: 'papaMartin4'
};

let Client = require('ssh2-sftp-client');
let sftp = new Client('chris');

let localFile = '/home/christian/toolskit/toolskit_backend/middleware/sftp.js';
let remoteFile = '/home/disk3/txt.js';



module.exports = (req, res, next) => {
    sftp.connect(config)
        .then(() => {
            return sftp.fastPut(localFile, remoteFile);
        })
        .then(data => {
            console.log(`Remote working directory is ${data}`);
            return sftp.end();
        })
        .catch(err => {
            console.log(`Error: ${err.message}`); // error message will include 'example-client'

        });
}