import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { generate3DAnimatedImageTool } from '../../../../src/commands/tool/virtual-tools/generate-3d-animated-image.js';
import { createMockStitch, createMockProject, createMockScreen } from '../../../../src/services/stitch-sdk/MockStitchSDK.js';

const mockStitch = createMockStitch(createMockProject('proj-1', [
  createMockScreen({ screenId: 'home', projectId: 'proj-1' }),
  createMockScreen({ screenId: 'no-html', projectId: 'proj-1', getHtml: mock(() => Promise.resolve(null)) }),
]));

describe('generate_3d_animated_image virtual tool', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = { callTool: mock() };
    global.fetch = mock(() => Promise.resolve(new Response('<div>Hello</div>', { status: 200 }))) as any;
  });

  it('returns animated HTML wrapping the screen content', async () => {
    const result = await generate3DAnimatedImageTool.execute(
      mockClient,
      { projectId: 'proj-1', screenId: 'home' },
      mockStitch as any,
    );

    expect(result.screenId).toBe('home');
    expect(result.projectId).toBe('proj-1');
    expect(result.animatedHtml).toBeDefined();
    expect(result.animatedHtml).toContain('<!DOCTYPE html>');
    expect(result.animatedHtml).toContain('3D Animated');
    expect(result.animatedHtml).toContain('@keyframes float');
    expect(result.animatedHtml).toContain('rotateX');
  });

  it('returns null animatedHtml when getHtml() returns null', async () => {
    const result = await generate3DAnimatedImageTool.execute(
      mockClient,
      { projectId: 'proj-1', screenId: 'no-html' },
      mockStitch as any,
    );

    expect(result.animatedHtml).toBeNull();
  });

  it('throws when stitch instance is not provided', async () => {
    expect(
      generate3DAnimatedImageTool.execute(mockClient, { projectId: 'proj-1', screenId: 'home' }),
    ).rejects.toThrow('generate_3d_animated_image requires a Stitch instance');
  });
});
