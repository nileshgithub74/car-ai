"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getadmin() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("unauthorized");
  }

  const user = await db.user.findUnique({
    where:{
      clerkUserId: userId,
    }
  });

  if(!user || user.role !=="ADMIN"){
    return {authorized:false, reason:"not-admin"}
  }

  return {authorized:true, user};
}

export async function getAdminTestDrives(params: { search?: string; status?: string } = {}): Promise<{
  success: boolean;
  data?: Array<{
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
  }>;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }

    const where: any = {};
    
    if (params.status && params.status !== "") {
      where.status = params.status;
    }

    if (params.search) {
      where.OR = [
        { car: { make: { contains: params.search, mode: "insensitive" } } },
        { car: { model: { contains: params.search, mode: "insensitive" } } },
        { user: { name: { contains: params.search, mode: "insensitive" } } },
        { user: { email: { contains: params.search, mode: "insensitive" } } },
      ];
    }

    const bookings = await db.testDriveBooking.findMany({
      where,
      include: {
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            images: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { bookingDate: "desc" },
    });

    return {
      success: true,
      data: bookings.map((booking) => ({
        id: booking.id,
        carId: booking.carId,
        userId: booking.userId,
        bookingDate: booking.bookingDate.toISOString().split('T')[0],
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status as "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED",
        notes: booking.notes || undefined,
        car: {
          id: booking.car.id,
          make: booking.car.make,
          model: booking.car.model,
          year: booking.car.year,
          images: booking.car.images,
        },
        user: {
          id: booking.user.id,
          name: booking.user.name,
          email: booking.user.email,
          phone: booking.user.phone,
        },
      })),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function updateTestDriveStatus(
  bookingId: string,
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }

    await db.testDriveBooking.update({
      where: { id: bookingId },
      data: { status },
    });

    revalidatePath("/admin/test-drives");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}
