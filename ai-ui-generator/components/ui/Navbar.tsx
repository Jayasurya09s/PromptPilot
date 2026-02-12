type Props = {
  title?: string;
  children?: React.ReactNode;
};

export const Navbar = ({ title = "Navbar", children }: Props) => {
  return (
    <div className="navbar">
      {title}
      {children}
    </div>
  );
};
