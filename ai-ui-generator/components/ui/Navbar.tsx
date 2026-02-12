type Props = {
  title: string;
};

export const Navbar = ({ title }: Props) => {
  return <div className="navbar">{title}</div>;
};
