"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format, parseISO, isPast } from "date-fns";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Calendar as CalendarIcon,
  Car,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { bookTestDrive } from "@/action/test-drive";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { Card, CardContent } from "@/components/ui/card";

// Define Zod schema for form validation
const testDriveSchema = z.object({
  date: z.date({
    message: "Please select a date for your test drive",
  }),
  timeSlot: z.string({
    message: "Please select a time slot",
  }),
  notes: z.string().optional(),
});

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  [key: string]: string | number | boolean | null | undefined;
}

interface UserTestDrive {
  id?: string;
  status?: string;
  scheduledDate?: string;
  scheduledTime?: string;
}

interface WorkingHours {
  [key: string]: { start: string; end: string; } | null;
}

interface Dealership {
  id: string;
  name: string;
  workingHours: WorkingHours;
}

interface ExistingBooking {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
}

interface TestDriveInfo {
  userTestDrive?: UserTestDrive;
  dealership?: Dealership;
  existingBookings?: ExistingBooking[];
}

export function TestDriveForm({ car, testDriveInfo }: { car: Car; testDriveInfo?: TestDriveInfo }) {
  const router = useRouter();
  const [availableTimeSlots, setAvailableTimeSlots] = useState<Array<{
    id: string;
    label: string;
    startTime: string;
    endTime: string;
  }>>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{
    date: string;
    timeSlot: string;
    notes?: string;
  } | null>(null);

  // Initialize react-hook-form with zod resolver
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(testDriveSchema),
    defaultValues: {
      date: undefined,
      timeSlot: undefined,
      notes: "",
    },
  });

  // Get dealership and booking information
  const dealership = testDriveInfo?.dealership;
  const existingBookings = useMemo(() => testDriveInfo?.existingBookings || [], [testDriveInfo?.existingBookings]);

  // Watch date field to update available time slots
  const selectedDate = watch("date");

  // Custom hooks for API calls
  const {
    loading: bookingInProgress,
    fn: bookTestDriveFn,
    data: bookingResult,
    error: bookingError,
  } = useFetch(bookTestDrive);

  // Handle successful booking
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = bookingResult as { success?: boolean; data?: any } | undefined;
    if (result?.success) {
      setBookingDetails({
        date: format(result?.data?.bookingDate, "EEEE, MMMM d, yyyy"),
        timeSlot: `${format(
          parseISO(`2022-01-01T${result?.data?.startTime}`),
          "h:mm a"
        )} - ${format(
          parseISO(`2022-01-01T${result?.data?.endTime}`),
          "h:mm a"
        )}`,
        notes: result?.data?.notes,
      });
      setShowConfirmation(true);

      // Reset form
      reset();
    }
  }, [bookingResult, reset]);

  // Handle booking error
  useEffect(() => {
    if (bookingError) {
      toast.error(
        bookingError.message || "Failed to book test drive. Please try again."
      );
    }
  }, [bookingError]);

  // Update available time slots when date changes
  useEffect(() => {
    if (!selectedDate || !dealership?.workingHours) return;

    const selectedDayOfWeek = format(selectedDate, "EEEE").toUpperCase();

    // Find working hours for the selected day
    const daySchedule = dealership.workingHours[selectedDayOfWeek];

    if (!daySchedule || !daySchedule.start || !daySchedule.end) {
      setAvailableTimeSlots([]);
      return;
    }

    // Parse opening and closing hours
    const openHour = parseInt(daySchedule.start.split(":")[0]);
    const closeHour = parseInt(daySchedule.end.split(":")[0]);

    // Generate time slots (every hour)
    const slots = [];
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const isToday = format(selectedDate, 'yyyy-MM-dd') === today;

    for (let hour = openHour; hour < closeHour; hour++) {
      const startTime = `${hour.toString().padStart(2, "0")}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;

      // Check if this slot is already booked
      const isBooked = existingBookings.some((booking) => {
        const bookingDate = booking.scheduledDate;
        return (
          bookingDate === format(selectedDate, "yyyy-MM-dd") &&
          booking.scheduledTime === startTime
        );
      });

      // Check if the slot is in the past on the current day
      const slotDateTime = new Date(selectedDate);
      slotDateTime.setHours(hour, 0, 0, 0);
      const isPastSlot = isToday && isPast(slotDateTime);

      if (!isBooked && !isPastSlot) {
        slots.push({
          id: `${startTime}-${endTime}`,
          label: `${format(
            parseISO(`2022-01-01T${startTime}`),
            "h:mm a"
          )} - ${format(parseISO(`2022-01-01T${endTime}`), "h:mm a")}`,
          startTime,
          endTime,
        });
      }
    }

    setAvailableTimeSlots(slots);

    // Clear time slot selection when date changes
    setValue("timeSlot", "");
  }, [selectedDate, dealership?.workingHours, existingBookings, setValue]);

  // Create a function to determine which days should be disabled
  const isDayDisabled = (day: Date) => {
    // Disable past dates, but allow today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isPast(day) && format(day, 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd')) {
        return true;
    }

    // Get day of week
    const dayOfWeek = format(day, "EEEE").toUpperCase();

    // Find working hours for the day
    const daySchedule = dealership?.workingHours[dayOfWeek];

    // Disable if dealership is closed on this day
    return !daySchedule || !daySchedule.start || !daySchedule.end;
  };

  // Submit handler
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    const selectedSlot = availableTimeSlots.find(
      (slot) => slot.id === data.timeSlot
    );

    if (!selectedSlot) {
      toast.error("Selected time slot is not available");
      return;
    }

    await bookTestDriveFn({
      carId: car.id,
      bookingDate: format(data.date, "yyyy-MM-dd"),
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      notes: data.notes || "",
    });
  };

  // Close confirmation handler
  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    router.push(`/cars/${car.id}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Column - Car Summary */}
      <div className="md:col-span-1">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Car Details</h2>

            <div className="aspect-video rounded-lg overflow-hidden relative mb-4">
              {car.images && Array.isArray(car.images) && car.images.length > 0 ? (
                <Image
                  src={car.images[0]}
                  alt={`${car.year} ${car.make} ${car.model}`}
                  width={600}
                  height={337}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Car className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold">
              {car.year} {car.make} {car.model}
            </h3>

            <div className="mt-2 text-xl font-bold text-blue-600">
              ${car.price ? car.price.toLocaleString() : 'Price not available'}
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <div className="flex justify-between py-1 border-b">
                <span>Mileage</span>
                <span className="font-medium">
                  {car.mileage ? car.mileage.toLocaleString() : 'N/A'} miles
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Fuel Type</span>
                <span className="font-medium">{car.fuelType}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Transmission</span>
                <span className="font-medium">{car.transmission}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Body Type</span>
                <span className="font-medium">{car.bodyType}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Color</span>
                <span className="font-medium">{car.color}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dealership Info */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Dealership Info</h2>
            <div className="text-sm">
              <p className="font-medium">
                {dealership?.name || "Vehiql Motors"}
              </p>
              <p className="text-gray-600 mt-1">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(dealership as any)?.address || "Address not available"}
              </p>
              <p className="text-gray-600 mt-3">
                <span className="font-medium">Phone:</span>{" "}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(dealership as any)?.phone || "Not available"}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Email:</span>{" "}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(dealership as any)?.email || "Not available"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Booking Form */}
      <div className="md:col-span-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6">Schedule Your Test Drive</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Select a Date
                </label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, "PPP")
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={isDayDisabled}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.date && (
                        <p className="text-sm font-medium text-red-500 mt-1">
                          {errors.date.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Time Slot Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Select a Time Slot
                </label>
                <Controller
                  name="timeSlot"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={
                          !selectedDate || availableTimeSlots.length === 0
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedDate
                                ? "Please select a date first"
                                : availableTimeSlots.length === 0
                                ? "No available slots on this date"
                                : "Select a time slot"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTimeSlots.map((slot) => (
                            <SelectItem key={slot.id} value={slot.id}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.timeSlot && (
                        <p className="text-sm font-medium text-red-500 mt-1">
                          {errors.timeSlot.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Additional Notes (Optional)
                </label>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      placeholder="Any specific questions or requests for your test drive?"
                      className="min-h-24"
                    />
                  )}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={bookingInProgress}
              >
                {bookingInProgress ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking Your Test Drive...
                  </>
                ) : (
                  "Book Test Drive"
                )}
              </Button>
            </form>

            {/* Instructions */}
            <div className="mt-8 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">What to expect</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  Bring your driver&apos;s license for verification
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  Test drives typically last 30-60 minutes
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  A dealership representative will accompany you
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Test Drive Booked Successfully
            </DialogTitle>
            <DialogDescription>
              Your test drive has been confirmed with the following details:
            </DialogDescription>
          </DialogHeader>

          {bookingDetails && (
            <div className="py-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Car:</span>
                  <span>
                    {car.year} {car.make} {car.model}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{bookingDetails.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Time Slot:</span>
                  <span>{bookingDetails.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Dealership:</span>
                  <span>{dealership?.name || "Vehiql Motors"}</span>
                </div>
              </div>

              <div className="mt-4 bg-blue-50 p-3 rounded text-sm text-blue-700">
                Please arrive 10 minutes early with your driver&apos;s license.
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleCloseConfirmation}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}