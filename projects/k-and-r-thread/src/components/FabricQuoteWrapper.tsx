"use client";

import RequestQuote from "@/components/RequestQuote";

interface FabricQuoteWrapperProps {
  fabricId: string;
  fabricName: string;
  composition: string;
  weight: string;
  swatchImage: string;
}

export default function FabricQuoteWrapper(props: FabricQuoteWrapperProps) {
  return <RequestQuote {...props} onClose={() => {}} />;
}