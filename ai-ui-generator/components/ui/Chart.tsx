type Props = {
  title?: string;
};

export const Chart = ({ title }: Props) => {
  return (
    <div className="w-full h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 flex items-center justify-center shadow-md">
      <div className="text-center">
        <svg className="w-16 h-16 mx-auto mb-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
        <p className="text-gray-600 font-semibold">{title || "Chart"}</p>
      </div>
    </div>
  );
};
