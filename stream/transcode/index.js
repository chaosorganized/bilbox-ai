// console.log("this is the transcode file");


import { google } from 'googleapis';
import { Readable } from 'stream';
import { spawn } from 'child_process';
import ffmpeg from 'ffmpeg-static';
const { Youtube } = google.youtube('v3');
const { LiveBroadcast, LiveStream } = google.youtube('v3').liveBroadcasts;


// Set up OAuth2 authentication with your Google account
const oauth2Client = new google.auth.OAuth2(
  process.env['GOOGLE_OAUTH_CLIENT_ID'],
  process.env['GOOGLE_OAUTH_CLIENT_SECRET'],
  'http://localhost:3000/oauth2callback'
);
// Generate the URL for user consent
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/youtube'],
});
// Redirect the user to the consent page
console.log('Authorize this app by visiting this URL:', authUrl);



// // Create a readable stream from your transcoded audio and video file
// const transcodedFile = '/path/to/transcoded/file.mp4';
// const streamInput = new Readable();
// streamInput.push(fs.readFileSync(transcodedFile));
// streamInput.push(null);

// const youtube = new Youtube({ auth: oauth2Client });
// // If existing stream use that instead of creating a new stream
// const streamUrl = process.env['YOUTUBE_STREAM_URL'];
// const streamKey = process.env['YOUTUBE_STREAM_KEY'];

// if (streamUrl !=== null && streamKey !=== null) {
//   // Spawn an RTMP server using FFmpeg to send the stream to YouTube Live
//   const rtmpServer = spawn(ffmpeg, [
//   '-i', 'pipe:0', // Read from stdin
//   '-c', 'copy', // Use same codecs as input
//   '-f', 'flv', // Output format
//   `${streamUrl}/${streamKey}`, // RTMP server URL
//     ]);

//   // Pipe the transcoded audio and video stream to the RTMP server
// streamInput.pipe(rtmpServer.stdin);

// // Handle errors and close events for the RTMP server
// rtmpServer.on('error', (error) => {
//   console.error(`RTMP server error: ${error}`);
// });

// rtmpServer.on('close', (code) => {
//   console.log(`RTMP server closed with code ${code}`);
// });

// // Once the stream is connected and live, viewers can watch the live stream on YouTube at the broadcast URL
// const broadcastUrl = `https://www.youtube.com/watch?v=YOUR_STREAM_ID`;

  
// } else {
// // add this later
// }




// // Create a readable stream from your transcoded audio and video file
// const transcodedFile = '/path/to/transcoded/file.mp4';
// const streamInput = new Readable();
// streamInput.push(fs.readFileSync(transcodedFile));
// streamInput.push(null);

// // Spawn an RTMP server using FFmpeg to send the stream to YouTube Live
// const streamUrl = streamResponse.data.cdn.ingestionInfo.ingestionAddress + '/' + streamResponse.data.cdn.ingestionInfo.streamName;
// const rtmpServer = spawn(ffmpeg, [
//   '-i', 'pipe:0', // Read from stdin
//   '-c', 'copy', // Use same codecs as input
//   '-f', 'flv', // Output format
//   streamUrl, // RTMP server URL
// ]);

// // Pipe the transcoded audio and video stream to the RTMP server
// streamInput.pipe(rtmpServer.stdin);

// // Handle errors and close events for the RTMP server
// rtmpServer.on('error', (error) => {
//   console.error(`RTMP server error: ${error}`);
// });

// rtmpServer.on('close', (code) => {
//   console.log(`RTMP server closed with code ${code}`);
// });

// // Once the stream is connected and live, viewers can watch the live stream on YouTube at the broadcast URL
// const broadcastUrl = `https://www.youtube.com/watch?v=${



export const testFunc = async () => {
  // console.log(process.env.GOOGLE_OAUTH_CLIENT_ID);



  
}