import { getCarById } from "@/action/car-listing";
import { CarDetails } from "./_component/car-details";
import { notFound } from "next/navigation";
import { SerializedCar } from "@/lib/helpers";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getCarById(id);

  if (!result.success) {
    return {
      title: "Car Not Found | Vehiql",
      description: "The requested car could not be found",
    };
  }

  const carData = result.data as SerializedCar & { testDriveInfo: any };

  return {
    title: `${carData.year} ${carData.make} ${carData.model} | Vehiql`,
    description: carData.description?.substring(0, 160) || "Car details",
    openGraph: {
      images: carData.images?.[0] ? [carData.images[0]] : [],
    },
  };
}

export default async function CarDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Fetch car details
  const { id } = await params;
  const result = await getCarById(id);

  // If car not found, show 404
  if (!result.success) {
    notFound();
  }

  const fullData = result.data as SerializedCar & { testDriveInfo: any };
  const { testDriveInfo, ...carData } = fullData;

  return (
    <div className="container mx-auto px-4 py-12">
      <CarDetails car={carData as any} testDriveInfo={testDriveInfo} />
    </div>
  );
}
