import type { StitchToolClient, Stitch } from '@google/stitch-sdk';
import { downloadText } from '../../../ui/copy-behaviors/clipboard.js';
import type { VirtualTool } from '../spec.js';

/**
 * Wraps screen HTML with CSS 3D animation: a floating card with perspective
 * rotation on hover, a subtle continuous float, and a shimmer highlight.
 */
function wrap3DAnimation(screenId: string, htmlContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>3D Animated – ${screenId}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(ellipse at 60% 40%, #1a1a2e 0%, #0d0d1a 100%);
      font-family: sans-serif;
      perspective: 1200px;
    }

    .scene {
      perspective: 1200px;
    }

    .card {
      position: relative;
      width: min(90vw, 800px);
      border-radius: 16px;
      overflow: hidden;
      box-shadow:
        0 25px 60px rgba(0, 0, 0, 0.6),
        0 0 40px rgba(99, 179, 237, 0.15);
      transform-style: preserve-3d;
      animation: float 6s ease-in-out infinite;
      transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;
      cursor: pointer;
    }

    .card:hover {
      box-shadow:
        0 40px 80px rgba(0, 0, 0, 0.7),
        0 0 60px rgba(99, 179, 237, 0.3);
    }

    .card-inner {
      width: 100%;
      transform-origin: center center;
    }

    .card-inner iframe {
      width: 100%;
      height: min(80vh, 600px);
      border: none;
      display: block;
      border-radius: 16px;
    }

    /* Shimmer overlay */
    .card::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 16px;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.08) 0%,
        transparent 50%,
        rgba(255, 255, 255, 0.04) 100%
      );
      pointer-events: none;
      animation: shimmer 4s ease-in-out infinite alternate;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotateX(2deg); }
      25%       { transform: translateY(-12px) rotateX(-1deg) rotateY(1.5deg); }
      50%       { transform: translateY(-18px) rotateX(0deg) rotateY(-1deg); }
      75%       { transform: translateY(-8px) rotateX(1deg) rotateY(0.5deg); }
    }

    @keyframes shimmer {
      0%   { opacity: 0.6; transform: skewX(-5deg) translateX(-10%); }
      100% { opacity: 1;   transform: skewX(-5deg) translateX(10%); }
    }
  </style>
</head>
<body>
  <div class="scene">
    <div class="card" id="card">
      <div class="card-inner">
        <iframe
          srcdoc="${htmlContent.replace(/"/g, '&quot;').replace(/`/g, '&#96;')}"
          sandbox="allow-scripts allow-same-origin"
          title="${screenId}"
        ></iframe>
      </div>
    </div>
  </div>

  <script>
    const card = document.getElementById('card');
    let animating = false;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      card.style.animation = 'none';
      card.style.transform =
        'translateY(-12px) rotateX(' + (-dy * 12) + 'deg) rotateY(' + (dx * 12) + 'deg)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.animation = 'float 6s ease-in-out infinite';
    });
  </script>
</body>
</html>`;
}

export const generate3DAnimatedImageTool: VirtualTool = {
  name: 'generate_3d_animated_image',
  description:
    '(Virtual) Retrieves a screen\'s HTML and returns a self-contained HTML document that presents the design as a 3D animated floating card with perspective rotation and a shimmer effect.',
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

    // 1. Get the screen using the SDK
    const screen = await stitch.project(projectId).getScreen(screenId);

    // 2. Fetch HTML content
    let animatedHtml: string | null = null;
    try {
      const htmlUrl = await screen.getHtml();
      if (htmlUrl) {
        const htmlContent = await downloadText(htmlUrl);
        animatedHtml = wrap3DAnimation(screenId, htmlContent);
      }
    } catch (e) {
      console.error(`Error generating 3D animated image: ${e}`);
    }

    // 3. Return result
    return {
      screenId: screen.screenId,
      projectId: screen.projectId,
      animatedHtml,
    };
  },
};
