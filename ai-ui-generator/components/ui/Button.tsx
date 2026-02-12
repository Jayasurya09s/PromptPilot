/**
 * Button Component - Interactive button with variants
 */

type Props = {
  label: string;
  variant?: "primary" | "secondary";
};

export const Button = ({ label, variant = "primary" }: Props) => {
  const baseStyles = "px-4 py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm hover:shadow-md"
  };
  return <button className={`${baseStyles} ${variants[variant]}`}>{label}</button>;
};
