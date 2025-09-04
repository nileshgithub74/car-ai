"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { serializeCarData } from "@/lib/helpers";

// -------------------
// Types
// -------------------
export interface CarDetails {
  make: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
  price: number | null;
  mileage: number | null;
  bodyType:
    | "SUV"
    | "Sedan"
    | "Hatchback"
    | "Coupe"
    | "Convertible"
    | "Pickup"
    | "Van"
    | "Wagon"
    | null;
  fuelType: "Petrol" | "Diesel" | "CNG" | "Hybrid" | "Electric" | null;
  transmission: "Manual" | "Automatic" | null;
  description: string;
  confidence: number;
  [key: string]: any;
}

export interface CarResponse {
  success: boolean;
  data?: CarDetails | CarDetails[];
  error?: string;
}

// -------------------
// Utility
// -------------------
async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
}

// -------------------
// Gemini AI integration
// -------------------
export async function processCarImageWithAI(file: File): Promise<CarResponse> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const base64Image = await fileToBase64(file);

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: file.type,
      },
    };

    const prompt = `
      Analyze this car image and extract the following information:
      1. Make (manufacturer)
      2. Model
      3. Year (approximately)
      4. Color
      5. Body type (SUV, Sedan, Hatchback, etc.)
      6. Mileage
      7. Fuel type (your best guess)
      8. Transmission type (your best guess)
      9. Price (your best guess)
      10. Short Description as to be added to a car listing

      Format your response as a clean JSON object with these fields:
      {
        "make": "",
        "model": "",
        "year": 0000,
        "color": "",
        "price": 0,
        "mileage": 0,
        "bodyType": "",
        "fuelType": "",
        "transmission": "",
        "description": "",
        "confidence": 0.0
      }

      For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
      Only respond with the JSON object, nothing else.
    `;

    const result = await model.generateContent([imagePart, prompt]);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const carDetails: CarDetails = JSON.parse(cleanedText);

      const requiredFields: (keyof CarDetails)[] = [
        "make",
        "model",
        "year",
        "color",
        "bodyType",
        "price",
        "mileage",
        "fuelType",
        "transmission",
        "description",
        "confidence",
      ];

      const missingFields = requiredFields.filter(
        (field) => !(field in carDetails)
      );

      if (missingFields.length > 0) {
        throw new Error(
          `AI response missing required fields: ${missingFields.join(", ")}`
        );
      }

      return { success: true, data: carDetails };
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Raw response:", text);
      return { success: false, error: "Failed to parse AI response" };
    }
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return { success: false, error: "Gemini API error: " + error.message };
  }
}


interface AddCarParams {
  carData: any;
  images: string[];
}

export async function addCar({
  carData,
  images,
}: AddCarParams): Promise<CarResponse> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const carId = uuidv4();
    const folderPath = `cars/${carId}`;

    const cookieStore =  cookies();
    const supabase = await createClient(cookieStore);

    const imageUrls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const base64Data = images[i];
      if (!base64Data || !base64Data.startsWith("data:image/")) {
        console.warn("Skipping invalid image data");
        continue;
      }

      const base64 = base64Data.split(",")[1];
      const imageBuffer = Buffer.from(base64, "base64");

      const mimeMatch = base64Data.match(/data:image\/([a-zA-Z0-9]+);/);
      const fileExtension = mimeMatch ? mimeMatch[1] : "jpeg";

      const fileName = `image-${Date.now()}-${i}.${fileExtension}`;
      const filePath = `${folderPath}/${fileName}`;

      const { data, error } = await supabase.storage
        .from("car-ai ")
        .upload(filePath, imageBuffer, {
          contentType: `image/${fileExtension}`,
        });

      if (error) {
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/car-images/${filePath}`;
      imageUrls.push(publicUrl);
    }

    if (imageUrls.length === 0) {
      throw new Error("No valid images were uploaded");
    }

    await db.car.create({
      data: {
        id: carId,
        make: carData.make,
        model: carData.model,
        year: carData.year,
        price: carData.price,
        mileage: carData.mileage,
        color: carData.color,
        fuelType: carData.fuelType,
        transmission: carData.transmission,
        bodyType: carData.bodyType,
        seats: carData.seats,
        description: carData.description,
        status: carData.status,
        featured: carData.featured,
        images: imageUrls,
      },
    });

    revalidatePath("/admin/cars");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Error adding car: " + error.message };
  }
}

// -------------------
// Get cars
// -------------------
export async function getCars(search = ""): Promise<CarResponse> {
  try {
    let where: any = {};

    if (search) {
      where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { color: { contains: search, mode: "insensitive" } },
      ];
    }

    const cars = await db.car.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: cars.map(serializeCarData) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------
// Delete car
// -------------------
export async function deleteCar(id: string): Promise<CarResponse> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const car = await db.car.findUnique({
      where: { id },
      select: { images: true },
    });

    if (!car) {
      return { success: false, error: "Car not found" };
    }

    await db.car.delete({ where: { id } });

    try {
      const cookieStore = cookies();
      const supabase = createClient(cookieStore);

      const filePaths = car.images
        .map((imageUrl) => {
          const url = new URL(imageUrl);
          const pathMatch = url.pathname.match(/\/car-images\/(.*)/);
          return pathMatch ? pathMatch[1] : null;
        })
        .filter(Boolean) as string[];

      if (filePaths.length > 0) {
        await supabase.storage.from("car-images").remove(filePaths);
      }
    } catch (storageError) {
      console.error("Error deleting images:", storageError);
    }

    revalidatePath("/admin/cars");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------
// Update car status
// -------------------
interface UpdateCarStatusParams {
  status?: string;
  featured?: boolean;
}

export async function updateCarStatus(
  id: string,
  { status, featured }: UpdateCarStatusParams
): Promise<CarResponse> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (featured !== undefined) updateData.featured = featured;

    await db.car.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/cars");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
