"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface MemberBarcodeProps {
  value: string;
  bright?: boolean;
}

export default function MemberBarcode({ value, bright = false }: MemberBarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      JsBarcode(svgRef.current, value, {
        format: "CODE128",
        width: bright ? 4 : 3.5,
        height: bright ? 100 : 90,
        displayValue: true,
        fontSize: bright ? 20 : 16,
        font: "monospace",
        textMargin: 8,
        margin: 0,
        background: "#ffffff",
        lineColor: "#000000",
        valid: () => true,
      });
    }
  }, [value, bright]);

  return (
    <svg 
      ref={svgRef} 
      className={`w-full max-w-[320px] transition-all duration-300 ${bright ? "scale-105" : ""}`} 
    />
  );
}