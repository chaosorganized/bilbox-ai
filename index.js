import express from 'express';
import session from 'express-session';
import crypto from 'crypto';

import { createImage } from './stream/video/index.js'
import { getAudio } from './stream/audio/index.js'
import { oauth2Client, authorizationUrl } from './google/oauth.js'
const app = express();

// initialize app session to be carried over between requests
app.use(session({
  secret: crypto.randomBytes(64).toString('hex'), // unique session Id
  resave: false,
  saveUninitialized: true
}));


app.get('/', async (req, res) => {
  res.send('Welcome to Bilbox.ai!')
});

// Google Authorize
app.get('/auth', (req, res) => {
  return res.redirect(authorizationUrl);
});

// Google OAuth Callback
app.get('/oauth2callback', async (req, res) => {
  let responseSent = false;

  const authorizationCode = req.query.code;
  const { tokens } = await oauth2Client.getToken(authorizationCode);

  // Store the tokens securely for later use
  oauth2Client.setCredentials(tokens);

  if (!responseSent){
    responseSent = true;
    console.log('Authenticated!');
    // res.status(200).send('Google Authorization successful. Redirecting..');
    setTimeout(() => {res.redirect('/stream');}, 3000);
  }
});

// Live YouTube Stream
app.get('/stream', async(req, res) => {
   res.send('Stream coming soon!');
});

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



