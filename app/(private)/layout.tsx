import { AddIn } from "@/components/add-in";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="max-w-6xl mx-auto w-full py-4 px-4 space-y-4">
      <AddIn />
      {children}
    </main>
  );
}
