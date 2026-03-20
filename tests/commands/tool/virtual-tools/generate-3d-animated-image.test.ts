import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { generate3DAnimatedImageTool } from '../../../../src/commands/tool/virtual-tools/generate-3d-animated-image.js';
import { createMockStitch, createMockProject, createMockScreen } from '../../../../src/services/stitch-sdk/MockStitchSDK.js';

// Valid 1×1 white PNG (base64)
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADklEQVQI12P4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg==',
  'base64',
);

const mockStitch = createMockStitch(createMockProject('proj-1', [
  createMockScreen({ screenId: 'home', projectId: 'proj-1' }),
  createMockScreen({ screenId: 'no-image', projectId: 'proj-1', getImage: mock(() => Promise.resolve(null)) }),
]));

describe('generate_3d_animated_image virtual tool', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = { callTool: mock() };
    global.fetch = mock(() =>
      Promise.resolve(new Response(TINY_PNG.buffer, { status: 200 })),
    ) as any;
  });

  it('returns a base64 GIF when the screen has an image', async () => {
    const result = await generate3DAnimatedImageTool.execute(
      mockClient,
      { projectId: 'proj-1', screenId: 'home' },
      mockStitch as any,
    );

    expect(result.screenId).toBe('home');
    expect(result.projectId).toBe('proj-1');
    expect(result.mimeType).toBe('image/gif');
    expect(result.animatedGifBase64).toBeDefined();
    expect(typeof result.animatedGifBase64).toBe('string');
  });

  it('returns null animatedGifBase64 when getImage() returns null', async () => {
    const result = await generate3DAnimatedImageTool.execute(
      mockClient,
      { projectId: 'proj-1', screenId: 'no-image' },
      mockStitch as any,
    );

    expect(result.animatedGifBase64).toBeNull();
  });

  it('throws when stitch instance is not provided', () => {
    expect(
      generate3DAnimatedImageTool.execute(mockClient, { projectId: 'proj-1', screenId: 'home' }),
    ).rejects.toThrow('generate_3d_animated_image requires a Stitch instance');
  });
});
