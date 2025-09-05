import { CarFilters } from "./_component/car-filter";
import { getCarFilters } from "@/action/car-listing";
import { CarListings } from "./_component/cars-listing";

export const metadata = {
  title: "Cars | Vehiql",
  description: "Browse and search for your dream car",
};

export default async function CarsPage() {
  // Fetch filters data on the server
  const filtersData = await getCarFilters();

  return (
    <div className="container mx-auto px-4 py-12">
  <h1 className="font-bold tracking-tighter pr-2 pb-2 text-transparent bg-clip-text text-4xl md:text-4xl 
               bg-gradient-to-br from-rose-500 via-cyan-300 via-red-400 to-green-200">
  Browse Cars
</h1>





      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Section */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <CarFilters filters={filtersData.data} />
        </div>

        {/* Car Listings */}
        <div className="flex-1">
          <CarListings />
        </div>
      </div>
    </div>
  );
}
