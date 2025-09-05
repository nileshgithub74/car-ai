"use client";

// import { useState } from "react";
import Image from "next/image";
import { Calendar, Clock, User, Phone, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  user?: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
};

type TestDriveCardProps = {
  booking: TestDriveBooking;
  onCancel?: (bookingId: string) => void;
  showActions?: boolean;
  isAdmin?: boolean;
  isCancelling?: boolean;
  cancelError?: Error | null;
  renderStatusSelector?: () => React.ReactNode;
};

export const TestDriveCard = ({
  booking,
  onCancel,
  showActions = false,
  isAdmin = false,
  isCancelling = false,
  cancelError,
  renderStatusSelector,
}: TestDriveCardProps) => {
  // const [showDetails, setShowDetails] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "CONFIRMED":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {booking.car.make} {booking.car.model} ({booking.car.year})
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(booking.bookingDate)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {booking.startTime} - {booking.endTime}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(booking.status)}
            {isAdmin && renderStatusSelector && renderStatusSelector()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Customer Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="font-medium">{booking.user?.name || "Unnamed User"}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {booking.user?.email || "No email"}
                </div>
                {booking.user?.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {booking.user.phone}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Car Image */}
          {booking.car.images && booking.car.images.length > 0 && (
            <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={booking.car.images[0]}
                alt={`${booking.car.make} ${booking.car.model}`}
                width={400}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
              <p className="text-sm text-gray-600">{booking.notes}</p>
            </div>
          )}

          {/* Error Alert */}
          {cancelError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to cancel test drive: {cancelError.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          {showActions && onCancel && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(booking.id)}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Cancel"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
