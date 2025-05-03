const API_BASE_URL = '/api';

export const transcribeAudio = async (audioFile: File): Promise<string> => {
  // Enqueue transcription job
  try {
    const formData = new FormData();
    formData.append('audio', audioFile);
    // Step 1: Submit audio, get jobId
    const response = await fetch(`${API_BASE_URL}/transcribe`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = 'Failed to start transcription';
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.error || errorMsg;
      } catch {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }
    const { jobId } = await response.json();
    // Step 2: Poll for job status
    let status = 'processing';
    let transcript = '';
    let error = '';
    for (let i = 0; i < 60; i++) { // up to 60s
      await new Promise(res => setTimeout(res, 1000));
      const pollRes = await fetch(`${API_BASE_URL}/transcribe/status?id=${jobId}`);
      if (!pollRes.ok) continue;
      const result = await pollRes.json();
      status = result.status;
      if (status === 'done') {
        transcript = result.transcript;
        break;
      }
      if (status === 'error') {
        error = result.error;
        break;
      }
    }
    if (status === 'done') return transcript;
    if (status === 'error') throw new Error(error || 'Transcription failed');
    throw new Error('Transcription timed out');
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
      // Read the response body as text once, then try to parse as JSON
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
