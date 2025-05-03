
const API_BASE_URL = '/api';

export const transcribeAudio = async (audioFile: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await fetch(`${API_BASE_URL}/transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      // Try to parse JSON, but fallback to text if not valid JSON
      let errorMsg = 'Failed to transcribe audio';
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch (jsonErr) {
        const errorText = await response.text();
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
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
      // Try to parse JSON, but fallback to text if not valid JSON
      let errorMsg = 'Failed to generate summary';
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch (jsonErr) {
        const errorText = await response.text();
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
