export interface Song {
  title: string;
  album: string;
  year: number;
  lyrics: string;
  word_count: number;
  character_count: number;
  roberta_label: 'positive' | 'negative' | 'neutral';
  roberta_confidence: number;
  roberta_compound: number;
  textblob_polarity: number;
  textblob_subjectivity: number;
  [key: string]: any;
}

export interface AlbumSummary {
  album: string;
  songCount: number;
  avgSentiment: number;
  positiveSongs: number;
  negativeSongs: number;
  neutralSongs: number;
}

// Era color mapping
export const ERA_COLORS: { [key: string]: { bg: string; text: string; border: string } } = {
  'Taylor Swift': { 
    bg: 'debut-bg', 
    text: 'text-blue-800', 
    border: 'border-blue-200' 
  },
  'Fearless': { 
    bg: 'fearless-bg', 
    text: 'text-yellow-800', 
    border: 'border-yellow-200' 
  },
  'Speak Now': { 
    bg: 'speak-now-bg', 
    text: 'text-purple-800', 
    border: 'border-purple-200' 
  },
  'Red': { 
    bg: 'red-bg', 
    text: 'text-red-800', 
    border: 'border-red-200' 
  },
  '1989': { 
    bg: 'nineteen-eighty-nine-bg', 
    text: 'text-blue-600', 
    border: 'border-blue-200' 
  },
  'Reputation': { 
    bg: 'reputation-bg', 
    text: 'text-gray-800', 
    border: 'border-gray-300' 
  },
  'Lover': { 
    bg: 'lover-bg', 
    text: 'text-pink-800', 
    border: 'border-pink-200' 
  },
  'Folklore': { 
    bg: 'folklore-bg', 
    text: 'text-gray-700', 
    border: 'border-gray-200' 
  },
  'Evermore': { 
    bg: 'evermore-bg', 
    text: 'text-orange-800', 
    border: 'border-orange-200' 
  },
  'Midnights': { 
    bg: 'midnights-bg', 
    text: 'text-indigo-800', 
    border: 'border-indigo-200' 
  },
  'The Tortured Poets Department': { 
    bg: 'tortured-poets-bg', 
    text: 'text-red-900', 
    border: 'border-red-300' 
  },
  'The Life of a Showgirl': { 
    bg: 'life-of-showgirl-bg', 
    text: 'text-green-800', 
    border: 'border-green-200' 
  }
};

export const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case 'positive': return 'sentiment-positive';
    case 'negative': return 'sentiment-negative';
    case 'neutral': return 'sentiment-neutral';
    default: return 'sentiment-neutral';
  }
};

export const getSentimentEmoji = (sentiment: string) => {
  switch (sentiment) {
    case 'positive': return '😊';
    case 'negative': return '😢';
    case 'neutral': return '😐';
    default: return '🎵';
  }
};

export const getEraColor = (album: string) => {
  return ERA_COLORS[album] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
};