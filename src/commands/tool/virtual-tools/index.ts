export type { VirtualTool } from '../spec.js';
export { getScreenCodeTool } from './get-screen-code.js';
export { getScreenImageTool } from './get-screen-image.js';
export { buildSiteTool } from './build-site.js';
export { listToolsTool } from './list-tools.js';
export { generate3DAnimatedImageTool } from './generate-3d-animated-image.js';

import { getScreenCodeTool } from './get-screen-code.js';
import { getScreenImageTool } from './get-screen-image.js';
import { buildSiteTool } from './build-site.js';
import { listToolsTool } from './list-tools.js';
import { generate3DAnimatedImageTool } from './generate-3d-animated-image.js';
import type { VirtualTool } from '../spec.js';

export const virtualTools: VirtualTool[] = [
  getScreenCodeTool,
  getScreenImageTool,
  buildSiteTool,
  listToolsTool,
  generate3DAnimatedImageTool,
];
