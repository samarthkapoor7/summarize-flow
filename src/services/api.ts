
// API service for communicating with the backend

const API_BASE_URL = 'http://localhost:3000/api';

export const transcribeAudio = async (audioFile: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await fetch(`${API_BASE_URL}/transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to transcribe audio');
    }

    const data = await response.json();
    return data.transcript;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
};

export const generateSummary = async (transcript: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate summary');
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Summary generation error:', error);
    throw error;
  }
};
