import express from 'express';
import { createImage } from './stream/video/index.js'
import { getAudio } from './stream/audio/index.js'
import { oauth2Client, authorizationUrl } from './stream/transcode/oauth.js'
const app = express();

app.get('/', async (req, res) => {
  res.send('Welcome to Bilbox.ai!')
});

// Google Authorize
app.get('/auth', async (req, res) => {
  return res.redirect(authorizationUrl);
});

// Google OAuth Callback
app.get('/oauth2callback', async (req, res) => {
  const authorizationCode = req.query.code;

  const { tokens } = await oauth2Client.getToken(authorizationCode);
console.log(tokens)
  oauth2Client.setCredentials(tokens);

  // Store the tokens securely for later use
  console.log(tokens.access_token);
  console.log(tokens.refresh_token);
  console.log(tokens.expiry_date);

  res.send('Google Authorization successful!');
});




app.get('/image-gen/:topic', async (req, res) => {
  const imageString = await createImage({
    topic: req?.params?.topic
  });
  const html = `<html><head></head><body><img src="data:image/png;base64,${imageString}" alt="Base64 Image"/></body></html>`;
  res.send(html);
})

app.get('/audio-gen/:genre', async (req, res) => {
  const { track, trackTitle, trackIdentifier, audioFile } = await getAudio({
    genre: req?.params?.genre
  })

  console.log(JSON.stringify({ track, trackTitle, trackIdentifier, audioFile }, null, 4))
 
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
        <h1>${trackTitle}</h1>
        <audio controls>
          <source src="https://archive.org/download/${trackIdentifier}/${audioFile?.name}" type="audio/mpeg">
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



