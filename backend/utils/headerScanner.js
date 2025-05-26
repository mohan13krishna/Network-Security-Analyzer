const https = require('https');

module.exports = function headerScanner(hostname) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'HEAD',
      host: hostname,
      port: 443,
      path: '/',
    };

    const req = https.request(options, (res) => {
      resolve(res.headers);
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
};
