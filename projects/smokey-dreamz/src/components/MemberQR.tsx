"use client";

import { QRCodeSVG } from "qrcode.react";

interface MemberQRProps {
  value: string;
}

export default function MemberQR({ value }: MemberQRProps) {
  return (
    <div className="flex items-center justify-center py-2">
      <QRCodeSVG
        value={value}
        size={200}
        level="H"
        includeMargin={false}
      />
    </div>
  );
}
