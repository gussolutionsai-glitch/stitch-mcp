import type { StitchToolClient } from '@google/stitch-sdk';
import type { VirtualTool } from '../spec.js';

const SEARCH_API_BASE = 'https://transcriptapi.com/api/v2/youtube/search';

export const searchYoutubeVideosTool: VirtualTool = {
  name: 'search_youtube_videos',
  description: '(Virtual) Searches YouTube for videos matching a query using the TranscriptAPI.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Required. The search query string.',
      },
      type: {
        type: 'string',
        description: 'Optional. Result type filter. Defaults to "video".',
        enum: ['video', 'channel', 'playlist'],
      },
      limit: {
        type: 'number',
        description: 'Optional. Maximum number of results to return. Defaults to 5.',
      },
      apiKey: {
        type: 'string',
        description: 'Optional. TranscriptAPI key. Defaults to the TRANSCRIPT_API_KEY environment variable.',
      },
    },
    required: ['query'],
  },
  execute: async (_client: StitchToolClient, args: any) => {
    const { query, type = 'video', limit = 5, apiKey } = args;
    const key = apiKey ?? process.env.TRANSCRIPT_API_KEY;

    if (!key) {
      throw new Error(
        'A TranscriptAPI key is required. Pass it as the "apiKey" argument or set the TRANSCRIPT_API_KEY environment variable.',
      );
    }

    const url = new URL(SEARCH_API_BASE);
    url.searchParams.set('q', query);
    url.searchParams.set('type', type);
    url.searchParams.set('limit', String(limit));

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`TranscriptAPI search request failed (${response.status}): ${body}`);
    }

    const data = await response.json();
    return data;
  },
};
