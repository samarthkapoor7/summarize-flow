import { useState, useEffect } from "react";
import { toast } from "sonner";
import FileUploader from "@/components/FileUploader";
import AudioPlayer from "@/components/AudioPlayer";
import ProcessingIndicator from "@/components/Processing";
import TranscriptDisplay from "@/components/Transcript";
import SummaryDisplay from "@/components/Summary";
import { transcribeAudio, generateSummary } from "@/services/api";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [processingStep, setProcessingStep] = useState<"transcribing" | "summarizing" | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleFileUpload = async (file: File) => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setSelectedFile(file);
    setAudioUrl(URL.createObjectURL(file));
    setTranscript("");
    setSummary("");
    try {
      setIsTranscribing(true);
      setProcessingStep("transcribing");
      const transcriptResult = await transcribeAudio(file);
      setTranscript(transcriptResult);
      setIsTranscribing(false);
      setIsSummarizing(true);
      setProcessingStep("summarizing");
      const summaryResult = await generateSummary(transcriptResult);
      setSummary(summaryResult);
      setIsSummarizing(false);
      setProcessingStep(null);
      toast.success("Processing complete!", { id: "processing-complete" });
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("An error occurred while processing your file", { id: "processing-error" });
      setIsTranscribing(false);
      setIsSummarizing(false);
      setProcessingStep(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50">
      <div className="py-12 px-4 mx-auto max-w-5xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent mb-4">
            Whisper Summarize Flow
          </h1>
          <p className="text-lg text-gray-500">
            Upload audio, get transcripts and summaries in seconds
          </p>
        </header>
        <main className="space-y-8">
          {!selectedFile ? (
            <div className="max-w-xl mx-auto">
              <FileUploader onFileUpload={handleFileUpload} isLoading={isTranscribing || isSummarizing} />
            </div>
          ) : (
            <div className="flex flex-wrap gap-8">
              <div className="w-full md:w-[300px] flex-shrink-0">
                <div className="space-y-6">
                  <div className="rounded-2xl border border-blue-200 shadow-lg bg-white p-2">
                    <AudioPlayer audioUrl={audioUrl || ""} fileName={selectedFile.name} />
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setTranscript("");
                        setSummary("");
                      }}
                      className="w-full h-9 px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-400 text-white font-medium hover:from-blue-600 hover:to-blue-500 transition"
                    >
                      Upload new file
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-8">
                {processingStep ? (
                  <div className="h-[600px] flex items-center justify-center">
                    <ProcessingIndicator step={processingStep} />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-blue-200 shadow-lg bg-white">
                      <TranscriptDisplay transcript={transcript} isLoading={isTranscribing} />
                    </div>
                    <div className="rounded-2xl border border-blue-200 shadow-lg bg-white">
                      <SummaryDisplay summary={summary} isLoading={isSummarizing} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
        <footer className="mt-16 text-center text-sm text-gray-400">
          <p>
            Powered by OpenAI Whisper and GPT models
          </p>
          <p className="mt-1">
            For educational purposes only
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;