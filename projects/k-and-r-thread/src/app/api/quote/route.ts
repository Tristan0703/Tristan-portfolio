import { NextResponse } from "next/server";

interface QuoteRequest {
  fabricId: string;
  projectType: string;
  yardage: string;
  width: string;
  deadline: string;
  addOns: string[];
  name: string;
  company: string;
  email: string;
  notes: string;
}

const generateReferenceNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `KR-${year}-${random}`;
};

const generateAdminEmailHTML = (data: QuoteRequest, referenceNumber: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Georgia', serif; background: #F9F8F4; color: #1A1A1A; padding: 40px; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { border-bottom: 2px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px; }
        .label { font-size: 10px; letter-spacing: 0.2em; color: #666; text-transform: uppercase; }
        .value { font-size: 16px; margin-bottom: 20px; }
        .gold { color: #D4AF37; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="label">New Inquiry</span>
          <h1 style="font-size: 24px; margin: 10px 0 0 0;">${referenceNumber}</h1>
        </div>
        <p class="label">FABRIC ID</p>
        <p class="value">${data.fabricId}</p>
        <p class="label">PROJECT TYPE</p>
        <p class="value">${data.projectType}</p>
        <p class="label">DIMENSIONS</p>
        <p class="value">${data.yardage} yards × ${data.width}</p>
        ${data.deadline ? `<p class="label">DEADLINE</p><p class="value">${data.deadline}</p>` : ""}
        ${data.addOns.length > 0 ? `<p class="label">ADD-ONS</p><p class="value gold">${data.addOns.join(", ")}</p>` : ""}
        <hr style="border: none; border-top: 1px solid #E5E4E2; margin: 30px 0;">
        <p class="label">CLIENT DETAILS</p>
        <p class="value">${data.name}${data.company ? ` • ${data.company}` : ""}</p>
        <p class="value">${data.email}</p>
        ${data.notes ? `<p class="label">PROJECT NOTES</p><p class="value">${data.notes}</p>` : ""}
      </div>
    </body>
    </html>
  `;
};

const generateClientEmailHTML = (name: string, referenceNumber: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Georgia', serif; background: #F9F8F4; color: #1A1A1A; padding: 40px; }
        .container { max-width: 600px; margin: 0 auto; text-align: center; }
        .logo { font-size: 24px; letter-spacing: 0.3em; margin-bottom: 40px; }
        h1 { font-size: 28px; margin-bottom: 20px; }
        p { line-height: 1.8; color: #666; }
        .gold { color: #D4AF37; }
        .divider { width: 60px; height: 2px; background: #D4AF37; margin: 30px auto; }
      </style>
    </head>
    <body>
      <div class="container">
        <p class="logo">K&R</p>
        <div class="divider"></div>
        <h1>Thank you, ${name}</h1>
        <p>Your inquiry has been received by the <span class="gold">K&R Atelier</span>.</p>
        <p>A specialist will review your project requirements and respond within 24 hours.</p>
        <p style="margin-top: 30px; font-size: 12px; letter-spacing: 0.2em;" class="gold">${referenceNumber}</p>
      </div>
    </body>
    </html>
  `;
};

export async function POST(request: Request) {
  try {
    const data: QuoteRequest = await request.json();

    if (!data.name || !data.email || !data.projectType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const referenceNumber = generateReferenceNumber();

    console.log("=== NEW QUOTE REQUEST ===");
    console.log("Reference:", referenceNumber);
    console.log("Client:", data.name, data.email);
    console.log("Fabric:", data.fabricId);
    console.log("========================");

    await fetch(process.env.SMTP_WEBHOOK_URL || "", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: process.env.ADMIN_EMAIL,
        subject: `New Inquiry: ${referenceNumber}`,
        html: generateAdminEmailHTML(data, referenceNumber),
      }),
    });

    await fetch(process.env.SMTP_WEBHOOK_URL || "", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: data.email,
        subject: "Your K&R Atelier Inquiry",
        html: generateClientEmailHTML(data.name, referenceNumber),
      }),
    });

    return NextResponse.json({
      success: true,
      referenceNumber,
      message: "Inquiry submitted successfully",
    });
  } catch (error) {
    console.error("Quote submission error:", error);
    return NextResponse.json(
      { error: "Failed to process inquiry" },
      { status: 500 }
    );
  }
}