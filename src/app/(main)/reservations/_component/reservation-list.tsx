"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { TestDriveCard } from "@/app/(admin)/admin/test-drives/_component/test-drive-card";
import useFetch from "@/hooks/use-fetch";
import { cancelTestDrive } from "@/action/test-drive";

interface Booking {
  id: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  carId: string;
  userId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
  car: {
    id: string;
    make: string;
    model: string;
    year: number;
    images: string[];
  };
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
}

interface InitialData {
  data?: Booking[];
  [key: string]: any;
}

export function ReservationsList({ initialData }: { initialData: InitialData }) {
  const {
    loading: cancelling,
    fn: cancelBookingFn,
    error: cancelError,
  } = useFetch(cancelTestDrive);

  // Handle cancellation
  const handleCancelBooking = async (bookingId: string) => {
    await cancelBookingFn(bookingId);
  };

  // Group bookings by status
  const upcomingBookings = initialData?.data?.filter((booking: Booking) =>
    ["PENDING", "CONFIRMED"].includes(booking.status)
  );

  const pastBookings = initialData?.data?.filter((booking: Booking) =>
    ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(booking.status)
  );

  // No reservations
  if (initialData?.data?.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-gray-50">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Calendar className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Reservations Found</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          You don't have any test drive reservations yet. Browse our cars and
          book a test drive to get started.
        </p>
        <Button variant="default" asChild>
          <Link href="/cars">Browse Cars</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Bookings */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Upcoming Test Drives</h2>
        {!upcomingBookings || upcomingBookings.length === 0 ? (
          <p className="text-gray-500 italic">No upcoming test drives.</p>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((booking: Booking) => (
              <TestDriveCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancelBooking}
                isCancelling={cancelling}
                showActions
                cancelError={cancelError}
              />
            ))}
          </div>
        )}
      </div>

      {/* Past Bookings */}
      {pastBookings && pastBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Past Test Drives</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastBookings.map((booking: Booking) => (
              <TestDriveCard
                key={booking.id}
                booking={booking}
                showActions={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
