
interface SummaryDisplayProps {
  summary: string;
  isLoading: boolean;
}

const SummaryDisplay = ({ summary, isLoading }: SummaryDisplayProps) => {
  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-xl border shadow-sm flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-11/12"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-10/12"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-9/12"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-white rounded-xl border-blue-500 border shadow-sm">
      <h3 className="text-xl font-medium mb-3">Summary</h3>
      <div className="h-[250px] overflow-y-auto">
        <div className="whitespace-pre-wrap text-sm text-gray-700">
          {summary || "Summary will appear here..."}
        </div>
      </div>
    </div>
  );
};

export default SummaryDisplay;
