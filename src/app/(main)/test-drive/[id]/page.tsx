import { getCarById } from "@/action/car-listing";
import { notFound } from "next/navigation";
import { TestDriveForm } from "./_component/test-drive-form";

export async function generateMetadata({ params: _params }: { params: Promise<{ id: string }> }) {
  // const { id } = await params;
  return {
    title: `Book Test Drive | Vehiql`,
    description: `Schedule a test drive in few seconds`,
  };
}

export default async function TestDrivePage({ params }: { params: Promise<{ id: string }> }) {
  // Fetch car details
  const { id } = await params;
  const result = await getCarById(id);

  // If car not found, show 404
  if (!result.success) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-6xl mb-6 gradient-title">Book a Test Drive</h1>
      <TestDriveForm
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        car={result.data as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        testDriveInfo={result.data?.testDriveInfo as any}
      />
    </div>
  );
}
