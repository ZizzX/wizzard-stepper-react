import type { ReactNode } from "react";

interface ProTipProps {
  children: ReactNode;
}

export function ProTip({ children }: ProTipProps) {
  return (
    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4 my-8">
      <div className="text-2xl shrink-0">💡</div>
      <div className="text-sm text-blue-800 leading-relaxed">
        <strong className="block mb-1">Pro Tip:</strong>
        {children}
      </div>
    </div>
  );
}
