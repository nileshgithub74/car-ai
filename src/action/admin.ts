"use server";

import { serializeCarData } from "@/lib/helpers";
import { db } from "@/lib/prisma";
import { Prisma, CarStatus, BookingStatus } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  // If user not found in our db or not an admin, return not authorized
  if (!user || user.role !== "ADMIN") {
    return { authorized: false, reason: "not-admin" };
  }

  return { authorized: true, user };
}

/**
 * Get all test drives for admin with filters
 */
export async function getAdminTestDrives({ search = "", status = "" }: { search?: string; status?: string }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Verify admin status
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    // Build where conditions
    const where: Prisma.CarWhereInput = {};

    // Add status filter
    if (status) {
  where.status = status as CarStatus;
    }

    // Add search filter for test drive bookings
  const bookingWhere: Prisma.TestDriveBookingWhereInput = {};
    if (search) {
      bookingWhere.OR = [
        { car: { make: { contains: search, mode: "insensitive" } } },
        { car: { model: { contains: search, mode: "insensitive" } } },
        { car: { color: { contains: search, mode: "insensitive" } } },
        { car: { year: { equals: parseInt(search) } } },
      ];
    }

    // Get bookings
    const bookings = await db.testDriveBooking.findMany({
      where: bookingWhere,
      include: {
        car: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            phone: true,
          },
        },
      },
      orderBy: [{ bookingDate: "desc" }, { startTime: "asc" }],
    });

    // Format the bookings
  const formattedBookings = bookings.map((booking) => ({
    id: booking.id,
    carId: booking.carId,
    car: serializeCarData({
      ...booking.car,
      price: typeof booking.car.price === 'object' && typeof booking.car.price.toNumber === 'function'
        ? booking.car.price.toNumber()
        : Number(booking.car.price)
    }),
    userId: booking.userId,
    user: booking.user,
    bookingDate: booking.bookingDate.toISOString(),
    startTime: booking.startTime,
    endTime: booking.endTime,
    status: booking.status,
    notes: booking.notes,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  }));

    return {
      success: true,
      data: formattedBookings,
    };
  } catch (error) {
    console.error("Error fetching test drives:", error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Update test drive status
 */
export async function updateTestDriveStatus(bookingId: string, newStatus: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Verify admin status
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    // Get the booking
    const booking = await db.testDriveBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Validate status
    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ];
    if (!validStatuses.includes(newStatus)) {
      return {
        success: false,
        error: "Invalid status",
      };
    }

    // Update status
    await db.testDriveBooking.update({
      where: { id: bookingId },
  data: { status: newStatus as BookingStatus },
    });

    // Revalidate paths
    revalidatePath("/admin/test-drives");
    revalidatePath("/reservations");

    return {
      success: true,
      message: "Test drive status updated successfully",
    };
  } catch (error) {
    throw new Error("Error updating test drive status:" + (error as Error).message);
  }
}

export async function getDashboardData() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Get user
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Fetch all necessary data in a single parallel operation
    const [cars, testDrives] = await Promise.all([
      // Get all cars with minimal fields
      db.car.findMany({
        select: {
          id: true,
          status: true,
          featured: true,
        },
      }),

      // Get all test drives with minimal fields
      db.testDriveBooking.findMany({
        select: {
          id: true,
          status: true,
          carId: true,
        },
      }),
    ]);

    // Calculate car statistics
    const totalCars = cars.length;
    const availableCars = cars.filter((car: { status: string }) => car.status === "AVAILABLE").length;
    const soldCars = cars.filter((car: { status: string }) => car.status === "SOLD").length;
    const unavailableCars = cars.filter((car: { status: string }) => car.status === "UNAVAILABLE").length;
    const featuredCars = cars.filter((car: { featured: boolean }) => car.featured === true).length;

    // Calculate test drive statistics
    const totalTestDrives = testDrives.length;
    const pendingTestDrives = testDrives.filter((td: { status: string }) => td.status === "PENDING").length;
    const confirmedTestDrives = testDrives.filter((td: { status: string }) => td.status === "CONFIRMED").length;
    const completedTestDrives = testDrives.filter((td: { status: string }) => td.status === "COMPLETED").length;
    const cancelledTestDrives = testDrives.filter((td: { status: string }) => td.status === "CANCELLED").length;
    const noShowTestDrives = testDrives.filter((td: { status: string }) => td.status === "NO_SHOW").length;

    // Calculate test drive conversion rate
    const completedTestDriveCarIds = testDrives
      .filter((td: { status: string }) => td.status === "COMPLETED")
      .map((td: { carId: string }) => td.carId);

    const soldCarsAfterTestDrive = cars.filter(
      (car: { status: string, id: string }) =>
        car.status === "SOLD" && completedTestDriveCarIds.includes(car.id)
    ).length;

    const conversionRate =
      completedTestDrives > 0
        ? (soldCarsAfterTestDrive / completedTestDrives) * 100
        : 0;

    return {
      success: true,
      data: {
        cars: {
          total: totalCars,
          available: availableCars,
          sold: soldCars,
          unavailable: unavailableCars,
          featured: featuredCars,
        },
        testDrives: {
          total: totalTestDrives,
          pending: pendingTestDrives,
          confirmed: confirmedTestDrives,
          completed: completedTestDrives,
          cancelled: cancelledTestDrives,
          noShow: noShowTestDrives,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", (error as Error).message);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}
