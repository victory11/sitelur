import AppShell from "@/components/AppShell";
import RapatDetailContent from "@/components/RapatDetailContent";

export default async function RapatDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <RapatDetailContent id={id} />
    </AppShell>
  );
}
