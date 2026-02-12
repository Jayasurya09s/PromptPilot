type Props = {
  title?: string;
  children?: React.ReactNode;
};

export const Navbar = ({ title = "Navbar", children }: Props) => {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex gap-3">{children}</div>
      </div>
    </nav>
  );
};
