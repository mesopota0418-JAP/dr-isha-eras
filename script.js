'use strict';

const API_KEY = import.meta.env.VITE_GOOGLE_AI_KEY || process.env.REACT_APP_GOOGLE_AI_KEY || 'YOUR_GOOGLE_AI_STUDIO_API_KEY';

if (!API_KEY) {
    throw new Error('API key is not defined!');
}

// Additional code follows...