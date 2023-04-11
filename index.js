import express from 'express';
import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY)

const app = express();

app.get('/', (req, res) => {
  res.send('Welcome to Bilbox.ai!')
});

app.get('/image-gen', async (req, res) => {
  const img = await hf.textToImage({
    inputs: 'award winning high resolution photo of a giant tortoise/((ladybird)) hybrid, [trending on artstation]',
    negative_prompt: 'blurry',
    model: 'stabilityai/stable-diffusion-2',
  })

  const buffer = Buffer.from(await img.arrayBuffer());
  const imageString = buffer.toString('base64');
  const html = `<html><head></head><body><img src="data:image/png;base64,${imageString}" alt="Base64 Image"/></body></html>`;
  res.send(html);
})

app.listen(3000, () => {
  console.log('server started');
});

