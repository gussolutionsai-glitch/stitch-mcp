import type { StitchToolClient, Stitch } from '@google/stitch-sdk';
import type { VirtualTool } from '../spec.js';
import sharp from 'sharp';
// @ts-ignore – no bundled types for gif-encoder-2
import GIFEncoder from 'gif-encoder-2';

const FRAMES = 20;
const FRAME_DELAY_MS = 60;   // 60 ms/frame → ~1.2 s loop
const MAX_WIDTH = 600;

/**
 * Builds an animated GIF that zooms the image gently in and out (float effect).
 * Uses a sine curve so the animation loops smoothly.
 */
async function buildAnimatedGif(imageBuffer: Buffer): Promise<Buffer> {
  const meta = await sharp(imageBuffer).metadata();
  const origW = meta.width!;
  const origH = meta.height!;
  const downscale = Math.min(1, MAX_WIDTH / origW);
  const outW = Math.round(origW * downscale);
  const outH = Math.round(origH * downscale);

  // Resize once to output dimensions
  const base = await sharp(imageBuffer).resize(outW, outH).png().toBuffer();

  const encoder = new GIFEncoder(outW, outH, 'neuquant', true, FRAMES);
  encoder.setDelay(FRAME_DELAY_MS);
  encoder.setRepeat(0); // infinite loop
  encoder.start();

  for (let i = 0; i < FRAMES; i++) {
    // Sine over [0, 2π] → scale oscillates between 1.0 and 1.06
    const t = (Math.sin((i / FRAMES) * Math.PI * 2) + 1) / 2; // 0..1
    const frameScale = 1.0 + 0.06 * t;
    const fw = Math.round(outW * frameScale);
    const fh = Math.round(outH * frameScale);
    const cropLeft = Math.round((fw - outW) / 2);
    const cropTop = Math.round((fh - outH) / 2);

    // Scale up then crop center back to (outW × outH), add alpha for RGBA
    const pixels = await sharp(base)
      .resize(fw, fh)
      .extract({ left: cropLeft, top: cropTop, width: outW, height: outH })
      .ensureAlpha()
      .raw()
      .toBuffer();

    encoder.addFrame(pixels);
  }

  encoder.finish();
  return encoder.out.getData();
}

export const generate3DAnimatedImageTool: VirtualTool = {
  name: 'generate_3d_animated_image',
  description:
    '(Virtual) Retrieves a screen\'s screenshot and returns a looping animated GIF ' +
    '(base64-encoded) that presents the design with a smooth float/zoom animation.',
  inputSchema: {
    type: 'object',
    properties: {
      projectId: {
        type: 'string',
        description: 'Required. The project ID of the screen to animate.',
      },
      screenId: {
        type: 'string',
        description: 'Required. The ID of the screen to animate.',
      },
    },
    required: ['projectId', 'screenId'],
  },
  execute: async (client: StitchToolClient, args: any, stitch?: Stitch) => {
    if (!stitch) throw new Error('generate_3d_animated_image requires a Stitch instance');
    const { projectId, screenId } = args;

    const screen = await stitch.project(projectId).getScreen(screenId);

    let animatedGifBase64: string | null = null;
    try {
      const imageUrl = await screen.getImage();
      if (imageUrl) {
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);
        const gifBuffer = await buildAnimatedGif(imageBuffer);
        animatedGifBase64 = gifBuffer.toString('base64');
      }
    } catch (e) {
      console.error(`Error generating animated GIF: ${e}`);
    }

    return {
      screenId: screen.screenId,
      projectId: screen.projectId,
      animatedGifBase64,
      mimeType: 'image/gif',
    };
  },
};
