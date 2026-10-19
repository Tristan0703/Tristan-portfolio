import { NextResponse } from "next/server";

interface SwatchPDFRequest {
  fabricId: string;
  fabricName: string;
  referenceNumber: string;
}

export async function POST(request: Request) {
  try {
    const { fabricName, referenceNumber }: SwatchPDFRequest = await request.json();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page { margin: 0; }
          body {
            font-family: 'Georgia', serif;
            background: #F9F8F4;
            color: #1A1A1A;
            padding: 60px;
            min-height: 100vh;
            box-sizing: border-box;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #D4AF37;
            padding-bottom: 30px;
            margin-bottom: 60px;
          }
          .logo {
            font-size: 32px;
            letter-spacing: 0.4em;
          }
          .ref {
            font-size: 12px;
            letter-spacing: 0.2em;
            color: #D4AF37;
          }
          .fabric-name {
            font-size: 48px;
            font-style: italic;
            margin: 40px 0;
            font-family: 'Playfair Display', serif;
          }
          .specs {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
            margin: 60px 0;
          }
          .spec-item {
            padding: 20px;
            border: 1px solid #E5E4E2;
          }
          .spec-label {
            font-size: 10px;
            letter-spacing: 0.2em;
            color: #999;
            text-transform: uppercase;
            margin-bottom: 8px;
          }
          .spec-value {
            font-size: 18px;
          }
          .divider {
            width: 80px;
            height: 2px;
            background: #D4AF37;
            margin: 60px 0;
          }
          .footer {
            position: fixed;
            bottom: 40px;
            left: 60px;
            right: 60px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            letter-spacing: 0.15em;
            color: #999;
            border-top: 1px solid #E5E4E2;
            padding-top: 20px;
          }
        </style>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital@1&display=swap" rel="stylesheet">
      </head>
      <body>
        <div class="header">
          <span class="logo">K&R</span>
          <span class="ref">${referenceNumber}</span>
        </div>

        <div class="fabric-name">${fabricName}</div>

        <div class="specs">
          <div class="spec-item">
            <p class="spec-label">Material</p>
            <p class="spec-value">Premium Silk Blend</p>
          </div>
          <div class="spec-item">
            <p class="spec-label">Weight</p>
            <p class="spec-value">Medium / Drape</p>
          </div>
          <div class="spec-item">
            <p class="spec-label">Origin</p>
            <p class="spec-value">Italy</p>
          </div>
          <div class="spec-item">
            <p class="spec-label">Thread Count</p>
            <p class="spec-value">380 TC</p>
          </div>
        </div>

        <div class="divider"></div>

        <p style="color: #666; line-height: 2;">
          This digital swatch sheet has been prepared by the K&R Atelier.<br>
          For physical samples or consultations, please contact your designated specialist.
        </p>

        <div class="footer">
          <span>Digital Swatch Sheet</span>
          <span>${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="KR-Swatch-${referenceNumber}.pdf.html"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate swatch sheet" },
      { status: 500 }
    );
  }
}