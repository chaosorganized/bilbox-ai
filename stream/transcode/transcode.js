// AV Transcoding Coming Soon
import { google } from 'googleapis';
import { authorizationUrl, oauth2Client } from './google/google.js';
import ffmpeg from 'ffmpeg-static';
import fs from 'fs';
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
const readFileAsync = promisify(fs.readFile);

export async function transcode(outputFile) {
  const fileId = '1zNMg59CIBC5F7125IXHRrisoamYVA4dW';
  const fileResponse = await drive.files.get({
    fileId: fileId,
    alt: 'media',
  }, {
    responseType: 'stream',
  });
  const videoStream = fileResponse.data;
  const proc = ffmpeg(videoStream)
    .format('mp4')
    .videoCodec('libx264')
    .audioCodec('aac')
    .outputOptions([
      '-preset fast',
      '-crf 22',
      '-pix_fmt yuv420p',
    ])
    .on('error', (err) => {
      console.error(`Error in transcoding: ${err.message}`);
    })
    .on('end', () => {
      console.log(`Transcoding finished for file with ID ${driveFileId}`);
    });

  proc.pipe(outputFile, { end: true });
}


// async function transcode() {
//   const fileId = '1zNMg59CIBC5F7125IXHRrisoamYVA4dW';
//   const file = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
//   const fileDest = `${__dirname}/stream/transcode/${fileId}.mp4`;

//   await pipelineAsync(file.data, createWriteStream(fileDest));

//   const command = ffmpeg(fileDest)
//     .addInputOption('-re')
//     .inputFPS(30)
//     .inputFormat('mp4')
//     .videoCodec('copy')
//     .audioCodec('aac');
//   const ffstream = command.pipe();

//   return new Promise((resolve, reject) => {
//     ffstream
//       .on('end', () => {
//       console.log('Transcoding complete');
//       resolve(fileDest);
//     })
//     .on('error', (error) => {
//       console.error('Transcoding error:', error);
//       reject(error);
//     });
//   });
// }

// async function stream(youtubeVideoId, youtubeUrl, fileDest) {
//   const res = await youtube.liveBroadcasts.insert({
//     auth: oauth2Client,
//     part: 'snippet,status',
//     requestBody: {
//       snippet: {
//         title: 'Bilbox Blues',
//         description: 'Bilbox Blues - A new livestream',
//         scheduledStartTime: new Date().toISOString(),
//         scheduledEndTime: new Date(Date.now() + 3600000).toISOString(),
//       },
//       status: {
//         privacyStatus: 'unlisted',
//       },
//     },
//   });

//   const streamId = res.data.id;
//   console.log(`Stream id: ${streamId}`);

//   await youtube.liveBroadcasts.bind({
//     part: 'id,contentDetails',
//     id: streamId,
//     requestBody: {
//       streamId: youtubeVideoId,
//     },
//   });

//   const rtmpUrl = `${youtubeUrl}/${streamId}`;

//   const command = ffmpeg(fileDest)
//     .outputOptions('-c:v copy')
//     .outputOptions('-c:a aac')
//     .outputOptions(`-f flv ${rtmpUrl}`);

//   command.on('error', (error) => {
//     console.error(`Error: ${error.message}`);
//   });

//   command.on('end', () => {
//     console.log('Streaming ended.');
//   });

//   command.run();
// }

export const stream = async (req, res) => {
  try {
    // Define YouTube Live API client
    const youtube = new YouTubeLive({
      credentials: {
        access_token: YOUR_ACCESS_TOKEN,
        refresh_token: YOUR_REFRESH_TOKEN,
        client_id: YOUR_CLIENT_ID,
        client_secret: YOUR_CLIENT_SECRET,
        redirect_uri: YOUR_REDIRECT_URI,
      },
    });

    // Define YouTube live stream information
    const streamTitle = 'My Live Stream';
    const streamDescription = 'This is my first live stream!';
    const streamPrivacy = 'public';
    const streamTags = ['live stream', 'test'];
    const streamLatencyPreference = 'ultraLowLatency';

    // Create the YouTube live stream
    const { id: streamId, ingestionInfo } = await youtube.createBroadcast({
      part: 'id,snippet,status,contentDetails',
      requestBody: {
        snippet: {
          title: streamTitle,
          description: streamDescription,
          tags: streamTags,
          defaultLanguage: 'en',
        },
        status: {
          privacyStatus: streamPrivacy,
          selfDeclaredMadeForKids: false,
        },
        contentDetails: {
          latencyPreference: streamLatencyPreference,
        },
      },
    });

    // Extract the stream key and stream URL from the YouTube ingestion info
    const { streamName: streamKey, ingestionAddress: streamUrl } = ingestionInfo;

    // Define input file path
    const inputFile = 'path/to/your/video.mp4';

    // Transcode and stream the video to YouTube Live
    ffmpeg(inputFile)
      .inputFormat('mp4')
      .videoCodec('libx264')
      .audioCodec('aac')
      .format('flv')
      .outputOptions([
        '-preset ultrafast',
        '-tune zerolatency',
        '-g 1',
        '-c:a aac',
        '-b:a 128k',
        '-c:v libx264',
        '-b:v 512k',
        '-pix_fmt yuv420p',
        '-flags',
        '+global_header',
      ])
      .on('start', () => {
        console.log('Transcoding and streaming started...');
      })
      .on('end', () => {
        console.log('Transcoding and streaming finished!');
      })
      .on('error', (err) => {
        console.error(err);
        res.status(500).send('Error transcoding and streaming video.');
      })
      .pipe(res, { end: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating YouTube live stream.');
  }
};
export default { transcode, stream };
