const API_BASE_URL = '/api';

export const transcribeAudio = async (audioFile: File): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file.');
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });
    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = 'Failed to transcribe audio';
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.error?.message || errorMsg;
      } catch {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
};

export const generateSummary = async (transcript: string): Promise<string> => {
  try {
    // Limit the transcript length to avoid backend timeouts
    const MAX_TOKENS = 2000; // Roughly ~1500 words, adjust as needed
    let limitedTranscript = transcript;
    if (transcript.length > MAX_TOKENS) {
      limitedTranscript = transcript.slice(0, MAX_TOKENS) + '\n... [truncated]';
    }
    const response = await fetch(`${API_BASE_URL}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript: limitedTranscript }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = 'Failed to generate summary';
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.error || errorMsg;
      } catch {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Summary generation error:', error);
    throw error;
  }
};
