import { google } from "googleapis";

// google oauth credentials
const credentials = {
  client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
  client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  client_redirect_url: 'https://bilbox-ai.arjshiv.repl.co/oauth2callback',
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
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.force-ssl',
  ]
});
