import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY)

export const createImage = async ({ prompt, topic = 'giant tortoise' } = {}) => {
  const img = await hf.textToImage({
    inputs: prompt ? `${prompt}, [trending on artstation]` : `award winning high resolution photo of ${topic}, [trending on artstation]`,
    negative_prompt: 'blurry',
    model: 'stabilityai/stable-diffusion-2',
  });

  const buffer = Buffer.from(await img.arrayBuffer());
  const imageString = buffer.toString('base64');
  return imageString;
}