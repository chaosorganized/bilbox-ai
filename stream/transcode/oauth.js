// Google OAuth File

import { google } from 'googleapis';
// import { Readable } from 'stream';
// import { spawn } from 'child_process';
// import ffmpeg from 'ffmpeg-static';
// const { Youtube } = google.youtube('v3');
// const { LiveBroadcast, LiveStream } = google.youtube('v3').liveBroadcasts;

// google credentials
const credentials = {
  client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
  client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  client_redirect_url: 'https://bilbox-ai.arjshiv.repl.co/oauth2callback',
  // access_token: '',
  // refresh_token: '',
  // expiry_date: ''
}

// get Google OAuth client
export const oauth2Client = new google.auth.OAuth2(
  credentials.client_id,
  credentials.client_secret,
  credentials.client_redirect_url,
);

// Retrieve Authorization URL
export const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/youtube'
  ]
});

