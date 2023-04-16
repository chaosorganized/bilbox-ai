// import request from 'request-promise';

import axios, {isCancel, AxiosError} from 'axios';

export const getAudio = async ({genre = 'pop'} = {}) => {
  
  // Fetch music tracks based on genre
  const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${process.env.JAMENDO_CLIENT_ID}&format=json&limit=10&order=popularity_total&tags=${genre}`;

  try {
    const body = await axios.get(url);
    const data = JSON.parse(body);
    const tracks = data.results;
    if (tracks.length === 0) {
      res.status(404).send('No tracks found for the specified genre');
      return;
    }

    // Choose a random track to stream
    const track = tracks[Math.floor(Math.random()*tracks.length)];

    return {
      audio: track?.audio,
      name: track?.name
    }
  } catch (e) {
    console.error(e)
    return {}
  }
}
