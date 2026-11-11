import ExecutionHistoryPageContent from "@/components/journeyExecutions";
import { Suspense } from "react";


export default function ExecutionHistoryPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading execution history...</div>}>
      <ExecutionHistoryPageContent />
    </Suspense>
  );
}