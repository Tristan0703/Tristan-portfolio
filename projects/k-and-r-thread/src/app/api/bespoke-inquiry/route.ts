import { NextResponse } from "next/server";

interface BespokeInquiryRequest {
  fabricId: string;
  fabricName: string;
  garmentType: string;
  recommendedYardage?: number;
  measurements: string;
  liningRequired: boolean;
  interfacingRequired: boolean;
  name: string;
  email: string;
  company: string;
  notes: string;
}

const generateReferenceNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `KR-BESPOKE-${year}-${random}`;
};

const formatGarmentType = (type: string): string => {
  return type
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export async function POST(request: Request) {
  try {
    const data: BespokeInquiryRequest = await request.json();

    if (!data.fabricId || !data.garmentType || !data.name || !data.email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const referenceNumber = generateReferenceNumber();

    console.log("=== NEW BESPOKE INQUIRY ===");
    console.log("Reference:", referenceNumber);
    console.log("Client:", data.name, data.company || "No company");
    console.log("Fabric:", data.fabricName);
    console.log("Garment:", formatGarmentType(data.garmentType));
    console.log("Recommended Yardage:", data.recommendedYardage, "meters");
    console.log("Lining:", data.liningRequired ? "Required" : "Not required");
    console.log("Interfacing:", data.interfacingRequired ? "Required" : "Not required");
    if (data.measurements) {
      console.log("Measurements:", data.measurements);
    }
    console.log("=========================");

    return NextResponse.json({
      success: true,
      referenceNumber,
      message: "Bespoke inquiry submitted successfully",
    });
  } catch (error) {
    console.error("Bespoke inquiry error:", error);
    return NextResponse.json(
      { error: "Failed to process inquiry" },
      { status: 500 }
    );
  }
}