import type { StitchToolClient } from '@google/stitch-sdk';
import type { VirtualTool } from '../spec.js';

const TRANSCRIPT_API_BASE = 'https://transcriptapi.com/api/v2/youtube/transcript';

export const getYoutubeTranscriptTool: VirtualTool = {
  name: 'get_youtube_transcript',
  description: '(Virtual) Fetches the transcript of a YouTube video using the TranscriptAPI.',
  inputSchema: {
    type: 'object',
    properties: {
      videoUrl: {
        type: 'string',
        description: 'Required. The YouTube video URL or video ID (e.g. "dQw4w9WgXcQ" or "https://www.youtube.com/watch?v=dQw4w9WgXcQ").',
      },
      apiKey: {
        type: 'string',
        description: 'Optional. TranscriptAPI key. Defaults to the TRANSCRIPT_API_KEY environment variable.',
      },
    },
    required: ['videoUrl'],
  },
  execute: async (_client: StitchToolClient, args: any) => {
    const { videoUrl, apiKey } = args;
    const key = apiKey ?? process.env.TRANSCRIPT_API_KEY;

    if (!key) {
      throw new Error(
        'A TranscriptAPI key is required. Pass it as the "apiKey" argument or set the TRANSCRIPT_API_KEY environment variable.',
      );
    }

    const url = new URL(TRANSCRIPT_API_BASE);
    url.searchParams.set('video_url', videoUrl);
    url.searchParams.set('format', 'json');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`TranscriptAPI request failed (${response.status}): ${body}`);
    }

    const data = await response.json();
    return data;
  },
};
