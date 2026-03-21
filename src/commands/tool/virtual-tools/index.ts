export type { VirtualTool } from '../spec.js';
export { getScreenCodeTool } from './get-screen-code.js';
export { getScreenImageTool } from './get-screen-image.js';
export { buildSiteTool } from './build-site.js';
export { listToolsTool } from './list-tools.js';
export { getYoutubeTranscriptTool } from './get-youtube-transcript.js';

import { getScreenCodeTool } from './get-screen-code.js';
import { getScreenImageTool } from './get-screen-image.js';
import { buildSiteTool } from './build-site.js';
import { listToolsTool } from './list-tools.js';
import { getYoutubeTranscriptTool } from './get-youtube-transcript.js';
import type { VirtualTool } from '../spec.js';

export const virtualTools: VirtualTool[] = [
  getScreenCodeTool,
  getScreenImageTool,
  buildSiteTool,
  listToolsTool,
  getYoutubeTranscriptTool,
];
