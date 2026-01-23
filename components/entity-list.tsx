interface EntityListProps {
  children: React.ReactNode;
}

export function EntityList({ children }: EntityListProps) {
  return <div className="divide-y divide-border flex flex-col">{children}</div>;
}
