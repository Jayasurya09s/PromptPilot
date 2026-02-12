type Props = {
  placeholder?: string;
};

export const Input = ({ placeholder }: Props) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 font-medium"
    />
  );
};
