// AV Transcoding Coming Soon
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

var __dirname = path.resolve();






// transcode video
const transcodeVideo = async(oauth2Client) => {
  const driveClient = google.drive({version: 'v3', auth: oauth2Client});
  const fileId = '1zNMg59CIBC5F7125IXHRrisoamYVA4dW'; // todo: replace with stream of files
  const fileSrc = await driveClient.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
  const fileDest = `${__dirname}/stream/transcode/${fileId}.mp4`;

  const outputStream = fs.createWriteStream(fileDest);
  await new Promise((resolve, reject) => {
    fileSrc.data
      .on('end', () => {
        console.log('Transcoding complete');
        resolve();
      })
      .on('error', error => {
        console.error('Transcoding error:', error);
        reject(error);
      })
      .pipe(outputStream);
  });

  return fileDest;
};

