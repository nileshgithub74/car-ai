"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search, Loader2, CalendarRange, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TestDriveCard } from "@/app/(admin)/admin/test-drives/_component/test-drive-card";
import useFetch from "@/hooks/use-fetch";
import { getAdminTestDrives, updateTestDriveStatus } from "@/action/admin";
import { cancelTestDrive } from "@/action/test-drive";

type TestDriveBooking = {
  id: string;
  carId: string;
  userId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
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
};

export const TestDrivesList = () => {
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Custom hooks for API calls
  const {
    loading: fetchingTestDrives,
    fn: fetchTestDrives,
    data: testDrivesData,
    error: testDrivesError,
  } = useFetch(getAdminTestDrives);

  const {
    loading: updatingStatus,
    fn: updateStatusFn,
    data: updateResult,
    error: updateError,
  } = useFetch(updateTestDriveStatus);

  const {
    loading: cancelling,
    fn: cancelTestDriveFn,
    data: cancelResult,
    error: cancelError,
  } = useFetch(cancelTestDrive);

  // Initial fetch and refetch on search/filter changes
  useEffect(() => {
    fetchTestDrives({ search, status: statusFilter });
  }, [search, statusFilter]);

  // Handle errors
  useEffect(() => {
    if (testDrivesError) {
      toast.error("Failed to load test drives");
    }
    if (updateError) {
      toast.error("Failed to update test drive status");
    }
    if (cancelError) {
      toast.error("Failed to cancel test drive");
    }
  }, [testDrivesError, updateError, cancelError]);

  // Handle successful operations
  useEffect(() => {
    const updateRes = updateResult as { success?: boolean } | undefined;
    const cancelRes = cancelResult as { success?: boolean } | undefined;
    
    if (updateRes?.success) {
      toast.success("Test drive status updated successfully");
      fetchTestDrives({ search, status: statusFilter });
    }
    if (cancelRes?.success) {
      toast.success("Test drive cancelled successfully");
      fetchTestDrives({ search, status: statusFilter });
    }
  }, [updateResult, cancelResult]);

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchTestDrives({ search, status: statusFilter });
  };

  // Handle status update
  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    if (newStatus) {
      await updateStatusFn(bookingId, newStatus as "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED");
    }
  };

  // Handle booking cancellation
  const handleCancel = async (bookingId: string) => {
    await cancelTestDriveFn(bookingId);
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Status Filter */}
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex w-full">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search by car or customer..."
                className="pl-9 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" className="ml-2">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Test Drives List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5" />
            Test Drive Bookings
          </CardTitle>
          <CardDescription>
            Manage all test drive reservations and update their status
          </CardDescription>
        </CardHeader>

        <CardContent>
          {fetchingTestDrives && !testDrivesData ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : testDrivesError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load test drives. Please try again.
              </AlertDescription>
            </Alert>
          ) : (testDrivesData as { data?: TestDriveBooking[] } | undefined)?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <CalendarRange className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No test drives found
              </h3>
              <p className="text-gray-500 mb-4">
                {statusFilter || search
                  ? "No test drives match your search criteria"
                  : "There are no test drive bookings yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {(testDrivesData as { data?: TestDriveBooking[] } | undefined)?.data?.map((booking: TestDriveBooking) => (
                <div key={booking.id} className="relative">
                  <TestDriveCard
                    booking={booking}
                    onCancel={handleCancel}
                    showActions={["PENDING", "CONFIRMED"].includes(
                      booking.status
                    )}
                    isAdmin={true}
                    isCancelling={cancelling}
                    cancelError={cancelError}
                    renderStatusSelector={() => (
                      <Select
                        value={booking.status}
                        onValueChange={(value) =>
                          handleUpdateStatus(booking.id, value)
                        }
                        disabled={updatingStatus}
                      >
                        <SelectTrigger className="w-full h-8">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

