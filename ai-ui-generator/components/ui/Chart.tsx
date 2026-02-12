type Props = {
  title?: string;
};

export const Chart = ({ title }: Props) => {
  return (
    <div className="chart">
      {title ? `Chart: ${title}` : "Chart Component"}
    </div>
  );
};
