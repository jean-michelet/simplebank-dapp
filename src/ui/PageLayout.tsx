interface Props {
  title: string;
  children: React.ReactNode;
}

export default function PageLayout({ title, children }: Props) {
  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-6">{title}</h1>
      {children}
    </>
  );
}
