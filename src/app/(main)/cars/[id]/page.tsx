import { getCarById } from "@/action/car-listing";
import { CarDetails } from "./_component/car-details";
import { notFound } from "next/navigation";

// interface TestDriveInfo {
//   userTestDrive?: {
//     id: string;
//     status: string;
//     scheduledDate?: string;
//     scheduledTime?: string;
//   };
//   dealership?: {
//     id: string;
//     name: string;
//     address?: string;
//     phone?: string;
//     email?: string;
//     workingHours?: Array<{
//       dayOfWeek: string;
//       isOpen: boolean;
//       openTime: string;
//       closeTime: string;
//     }>;
//   } | null;
// }

interface Metadata {
  title: string;
  description?: string;
  openGraph?: {
    images: string[];
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getCarById(id);

  if (!result.success || !result.data) {
    return {
      title: "Car Not Found | Vehiql",
      description: "The requested car could not be found",
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const carData = result.data as any;

  return {
    title: `${carData.year} ${carData.make} ${carData.model} | Vehiql`,
    description: carData.description?.substring(0, 160) || "Car details",
    openGraph: {
      images: carData.images?.[0] ? [carData.images[0]] : [],
    },
  };
}

export default async function CarDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Fetch car details
  const { id } = await params;
  const result = await getCarById(id);

  // If car not found, show 404
  if (!result.success) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const car = result.data as any;
  const { testDriveInfo, ...carData } = car;

  return (
    <div className="container mx-auto px-4 py-12">
      <CarDetails car={carData} testDriveInfo={testDriveInfo} />
    </div>
  );
}
