import express from 'express';
import session from 'express-session';
import crypto from 'crypto';
import { createImage } from './stream/video/video.js'
import { getAudio } from './stream/audio/audio.js'
import { google } from 'googleapis';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import ffmpeg from 'fluent-ffmpeg';
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic);
const app = express();

// initialize app session to be carried over between requests
app.use(session({
  secret: crypto.randomBytes(64).toString('hex'), // unique session Id
  resave: false,
  saveUninitialized: true
}));
// google oauth credentials
const credentials = {
  client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
  client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  client_redirect_url: 'https://bilbox-ai.arjshiv.repl.co/oauth2callback',
}
// get Google OAuth client
const oauth2Client = new google.auth.OAuth2(
  credentials.client_id,
  credentials.client_secret,
  credentials.client_redirect_url,
);
// Retrieve Authorization URL
const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.force-ssl',
  ]
});


function mapMoodToGenre(mood) {
  switch (mood) {
    case 'happy':
      return 'classical';
    case 'sad':
      return 'romantic';
    case 'energetic':
      return 'baroque';
    case 'relaxed':
      return 'ambient';
    default:
      return 'classical';
  }
}
// TODO: @arjshiv updated route from / to /mood
app.get('/mood', async (req, res) => {
  const html = `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Homepage</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Roboto', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #262626;
      overflow: hidden;
    }

    form {
      position: relative;
      text-align: center;
    }

    label {
      font-size: 1.5rem;
      color: #f0f0f0;
    }

    select {
      font-size: 1.2rem;
      padding: 0.5rem;
      margin: 1rem 0;
      border: none;
      border-radius: 5px;
      outline: none;
      background-color: #f0f0f0;
      cursor: pointer;
    }

    button {
      font-size: 1.2rem;
      padding: 0.5rem 1.5rem;
      border: none;
      border-radius: 5px;
      background-color: #62c370;
      color: #f0f0f0;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    button:hover {
      background-color: #42a250;
    }

    .circle {
      position: absolute;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      animation: circle-animation 10s linear infinite;
      background-color: rgba(98, 195, 112, 0.2);
    }

    .circle:nth-child(1) {
      top: 20%;
      left: 20%;
      animation-delay: 0s;
    }

    .circle:nth-child(2) {
      top: 40%;
      left: 80%;
      animation-delay: 3s;
      width: 80px;
      height: 80px;
    }

    .circle:nth-child(3) {
      top: 80%;
      left: 50%;
      animation-delay: 5s;
      width: 120px;
      height: 120px;
    }

    .circle:nth-child(4) {
      top: 60%;
      left: 10%;
      animation-delay: 7s;
      width: 150px;
      height: 150px;
    }

    @keyframes circle-animation {
      0% {
        transform: translateY(0) scale(1);
      }
      50% {
        transform: translateY(-50px) scale(1.2);
      }
      100% {
        transform: translateY(0) scale(1);
      }
    }
  </style>
</head>
<body>
  <div class="circle"></div>
  <div class="circle"></div>
  <div class="circle"></div>
  <div class="circle"></div>
  <form action="/stream-v1" method="get">
    <label for="mood">Select a mood:</label>
    <br>
    <select name="mood" id="mood" required>
      <option value="">--Choose a mood--</option>
      <option value="happy">Happy</option>
      <option value="sad">Sad</option>
      <option value="energetic">Energetic</option>
      <option value="relaxed">Relaxed</option>
    </select>
    <br>
    <button type="submit">Stream Music</button>
  </form>
</body>
</html>
  `;
  res.send(html);
});
 
app.get('/stream-v1', async (req, res) => {
  const mood = req.query.mood;
  const genre = mapMoodToGenre(mood);

  try {
    console.info({ mood, genre })

    console.info('picture')
    // Fetch a picture based on mood
    const imageString = await createImage({
    prompt: `abstract representation of ${genre} music`
  });
  const imageUrl = `data:image/png;base64,${imageString}`;

    console.info('audio')
  const { audio, name } = await getAudio({
  genre
})

    // Create the HTML page with the background image and audio player to stream the music
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Streaming Music</title>
        <style>
          body {
            background-image: url('${imageUrl}');
            background-size: cover;
            background-position: center;
            margin: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          audio {
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
          }
        </style>
      </head>
      <body>
        <audio controls autoplay loop>
          <source src="${audio}" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
        <script>
          const audio = document.querySelector('audio');
          audio.volume = 0.5;
        </script>
      </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching music tracks and background image');
  }
});

// Google Authorize - DONE
app.get('/auth', (req, res) => {
  return res.redirect(authorizationUrl);
});

// Google OAuth Callback - DONE
app.get('/oauth2callback', async (req, res) => {
  let responseSent = false;

  const authorizationCode = req.query.code;
  const { tokens } = await oauth2Client.getToken(authorizationCode);

  // Store the tokens securely for later use
  oauth2Client.setCredentials(tokens);
  req.session.tokens = tokens;

  if (!responseSent){
    responseSent = true;
    // TODO: send 200 and then redirect to stream here res.status(200).send('Google Authorization successful. Redirecting..');
    setTimeout(() => {res.redirect('/stream');}, 3000);
  }
});



// Live YouTube Stream  - DONE
app.get('/stream', async(req, res) => {
  if (req?.session?.tokens === null){
    // TODO: instead of erroring, redirect to /auth here
    res.status(500).send('Error authentication, go to /auth');
  }
   try {
     // todo: remove hardcoding later
     const fileId = '1zNMg59CIBC5F7125IXHRrisoamYVA4dW';
     const drive = google.drive({version: 'v3',auth: oauth2Client,});
     const file = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
     const stream = file.data;

    const videoFile = await transcode(oauth2Client);
    console.log(videoFile);

    const youtubeStreamKey =  process.env['YOUTUBE_STREAM_KEY'];
    ffmpeg(videoFile)
      .outputOptions(['-movflags frag_keyframe+empty_moov', '-reset_timestamps 1', '-vcodec copy', '-acodec copy', '-f flv'])
      .pipe(res, { end: true });
    const videoData = {
      snippet: {
        title: 'Bilbox Blues',
        description: 'Welcome to Bilbox!',
      },
      status: {
        privacyStatus: 'unlisted',
      },
     contentDetails: {
        isReusable: true,
        enableLowLatency: true,
        latencyPreference: 'ultraLow',
        enableAutoStart: true,
        enableAutoStop: true,
        ingestionAddress: `rtmp://a.rtmp.youtube.com/live2/${youtubeStreamKey}`,
        backupIngestionAddress: `rtmp://b.rtmp.youtube.com/live2/${youtubeStreamKey}`,
        streamPriority: 'high',
       },
    };
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const response = await youtube.videos.insert({
      auth: oauth2Client,
      part: 'snippet,status,contentDetails',
      resource: videoData,
    });

    const youtubeVideoId = response.data.id;
    const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;

    res.send(`<a href="${youtubeUrl}" target="_blank">${youtubeUrl}</a>`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error streaming video');
  }
});
async function transcode(inputFile, outputFile){
  return new Promise((resolve, reject) => {
    ffmpeg(inputFile)
      .outputOptions('-preset ultrafast')
      .outputOptions('-movflags frag_keyframe+empty_moov')
      .outputOptions('-c:v copy')
      .outputOptions('-c:a copy')
      .outputOptions('-f mp4')
      .on('error', (err) => {
        reject(err);
      })
      .on('end', () => {
        resolve(outputFile);
      })
      .save(outputFile);
  });
}

app.get('/image-gen/:topic', async (req, res) => {
  const imageString = await createImage({
    topic: req?.params?.topic
  });
  const html = `<html><head></head><body><img src="data:image/png;base64,${imageString}" alt="Base64 Image"/></body></html>`;
  res.send(html);
})

app.get('/audio-gen/:genre', async (req, res) => {
  const { audio, name } = await getAudio({
    genre: req?.params?.genre
  })

  console.log(JSON.stringify({ audio, name }, null, 4))
 
  // Create the HTML page with an audio player to stream the music
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Streaming Music</title>
      </head>
      <body>
        <h1>${name}</h1>
        <audio controls>
          <source src="${audio}" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
      </body>
      </html>
    `;

  res.send(html);
})

app.listen(3000, () => {
  console.log('server started');
});