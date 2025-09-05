"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

interface DealershipInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  workingHours: Record<string, { start: string; end: string; } | null>;
  createdAt: string;
  updatedAt: string;
}

interface UserInfo {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkingHour {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

// Get dealership info with working hours
export async function getDealershipInfo(): Promise<{ success: boolean; data?: DealershipInfo }> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Get the dealership record
    let dealership = await db.dealershipInfo.findFirst({
      include: {
        workingHours: {
          orderBy: {
            dayOfWeek: "asc",
          },
        },
      },
    });

    // If no dealership exists, create a default one
    if (!dealership) {
      dealership = await db.dealershipInfo.create({
        data: {
          // Default values will be used from schema
          workingHours: {
            create: [
              {
                dayOfWeek: "MONDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "TUESDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "WEDNESDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "THURSDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "FRIDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "SATURDAY",
                openTime: "10:00",
                closeTime: "16:00",
                isOpen: true,
              },
              {
                dayOfWeek: "SUNDAY",
                openTime: "10:00",
                closeTime: "16:00",
                isOpen: false,
              },
            ],
          },
        },
        include: {
          workingHours: {
            orderBy: {
              dayOfWeek: "asc",
            },
          },
        },
      });
    }

    // Format the data
    const formattedDealership: DealershipInfo = {
      id: dealership.id,
      name: dealership.name,
      address: dealership.address,
      phone: dealership.phone,
      email: dealership.email,
      workingHours: dealership.workingHours.reduce((acc, hour) => {
        if (hour.isOpen) {
          acc[hour.dayOfWeek] = {
            start: hour.openTime,
            end: hour.closeTime,
          };
        } else {
          acc[hour.dayOfWeek] = null;
        }
        return acc;
      }, {} as Record<string, { start: string; end: string; } | null>),
      createdAt: dealership.createdAt.toISOString(),
      updatedAt: dealership.updatedAt.toISOString(),
    };

    return {
      success: true,
      data: formattedDealership,
    };
  } catch (error: unknown) {
    console.error("Error fetching dealership info:", error);
    return { success: false, data: undefined };
  }
}

// Save working hours
export async function saveWorkingHours(
  workingHours: WorkingHour[]
): Promise<{ success: boolean }> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get current dealership info
    const dealership = await db.dealershipInfo.findFirst();

    if (!dealership) {
      throw new Error("Dealership info not found");
    }

    // Update working hours - first delete existing hours
    await db.workingHour.deleteMany({
      where: { dealershipId: dealership.id },
    });

    // Then create new hours
    for (const hour of workingHours) {
      await db.workingHour.create({
        data: {
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isOpen: hour.isOpen,
          dealershipId: dealership.id,
        },
      });
    }

    // Revalidate paths
    revalidatePath("/admin/settings");
    revalidatePath("/"); // Homepage might display hours

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error("Error saving working hours:", error);
    return { success: false };
  }
}

// Get all users
export async function getUsers(): Promise<{ success: boolean; data?: UserInfo[] }> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check if user is admin
    const adminUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get all users
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
    };
  } catch (error: unknown) {
    console.error("Error fetching users:", error);
    return { success: false, data: [] };
  }
}

// Update user role
export async function updateUserRole(
  userId: string,
  role: "USER" | "ADMIN"
): Promise<{ success: boolean }> {
  try {
    const { userId: adminId } = await auth();
    if (!adminId) throw new Error("Unauthorized");

    // Check if user is admin
    const adminUser = await db.user.findUnique({
      where: { clerkUserId: adminId },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Update user role
    await db.user.update({
      where: { id: userId },
      data: { role },
    });

    // Revalidate paths
    revalidatePath("/admin/settings");

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error("Error updating user role:", error);
    return { success: false };
  }
}
