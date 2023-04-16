// AV Transcoding Coming Soon
import { google } from 'googleapis';
import { authorizationUrl, oauth2Client } from './google/google.js';
import ffmpeg from 'ffmpeg-static';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import path from 'path';

const pipelineAsync = promisify(pipeline);
var __dirname = path.resolve();

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client,
});

const youtube = google.youtube({
  version: 'v3',
  auth: oauth2Client,
});

async function transcode() {
  const fileId = '1zNMg59CIBC5F7125IXHRrisoamYVA4dW';
  const file = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
  const fileDest = `${__dirname}/stream/transcode/${fileId}.mp4`;

  await pipelineAsync(file.data, createWriteStream(fileDest));

  const command = ffmpeg(fileDest).format('flv').videoCodec('copy').audioCodec('aac').outputOptions('-strict -2');
  const ffstream = command.pipe();

  return new Promise((resolve, reject) => {
    ffstream
      .on('end', () => {
      console.log('Transcoding complete');
      resolve(fileDest);
    })
    .on('error', (error) => {
      console.error('Transcoding error:', error);
      reject(error);
    })
    // .pipe(outputStream)
      ;
  });
}

async function stream(youtubeVideoId, youtubeUrl, fileDest) {
  const res = await youtube.liveBroadcasts.insert({
    auth: oauth2Client,
    part: 'snippet,status',
    requestBody: {
      snippet: {
        title: 'Bilbox Blues',
        description: 'Bilbox Blues - A new livestream',
        scheduledStartTime: new Date().toISOString(),
        scheduledEndTime: new Date(Date.now() + 3600000).toISOString(),
      },
      status: {
        privacyStatus: 'unlisted',
      },
    },
  });

  const streamId = res.data.id;
  console.log(`Stream id: ${streamId}`);

  await youtube.liveBroadcasts.bind({
    part: 'id,contentDetails',
    id: streamId,
    requestBody: {
      streamId: youtubeVideoId,
    },
  });

  const rtmpUrl = `${youtubeUrl}/${streamId}`;

  const command = ffmpeg(fileDest)
    .outputOptions('-c:v copy')
    .outputOptions('-c:a aac')
    .outputOptions(`-f flv ${rtmpUrl}`);

  command.on('error', (error) => {
    console.error(`Error: ${error.message}`);
  });

  command.on('end', () => {
    console.log('Streaming ended.');
  });

  command.run();
}

export default { transcode, stream };
