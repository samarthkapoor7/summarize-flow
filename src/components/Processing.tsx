import { Mic } from "lucide-react";

interface ProcessingIndicatorProps {
  step: "transcribing" | "summarizing";
}

const ProcessingIndicator = ({ step }: ProcessingIndicatorProps) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
        <div className="relative bg-blue-500 text-white p-4 rounded-full">
          <Mic className="h-6 w-6" />
        </div>
      </div>
      <p className="mt-4 font-medium">
        {step === "transcribing" ? "Transcribing audio..." : "Generating summary..."}
      </p>
      <p className="text-sm text-gray-500 mt-1">
        {step === "transcribing" 
          ? "Converting your audio to text" 
          : "Creating a concise summary"}
      </p>
    </div>
  );
};

export default ProcessingIndicator;