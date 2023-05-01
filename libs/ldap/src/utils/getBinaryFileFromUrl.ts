import * as https from "https";

export const getBinaryFileFromUrl = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      res.setEncoding('binary');

      let fileData = '';

      res.on('data', (chunk) => {
        fileData += chunk;
      });

      res.on('end', () => {
        resolve(Buffer.from(fileData, "binary"))
      });

    }).on('error', (err) => {
      reject(err)
    });
  })
}
