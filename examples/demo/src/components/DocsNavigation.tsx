import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface NavItem {
  label: string;
  href: string;
}

interface DocsNavigationProps {
  prev?: NavItem;
  next?: NavItem;
}

const MotionLink = motion(Link);

export default function DocsNavigation({ prev, next }: DocsNavigationProps) {
  return (
    <div className="pt-10 mt-12 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-4">
      <div className="flex-1">
        {prev && (
          <MotionLink
            to={prev.href}
            whileHover={{ x: -5 }}
            className="group flex flex-col items-start gap-1 p-4 rounded-2xl hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </span>
            <span className="text-lg font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors">
              {prev.label}
            </span>
          </MotionLink>
        )}
      </div>

      <div className="flex-1 flex justify-end">
        {next && (
          <MotionLink
            to={next.href}
            whileHover={{ x: 5 }}
            className="group flex flex-col items-end gap-1 p-4 rounded-2xl hover:bg-gray-50 transition-colors w-full sm:w-auto text-right"
          >
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              Next
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </span>
            <span className="text-lg font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors">
              {next.label}
            </span>
          </MotionLink>
        )}
      </div>
    </div>
  );
}
