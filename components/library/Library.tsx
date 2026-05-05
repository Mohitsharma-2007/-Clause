"use client";

import React from "react";
import EnhancedDataRoom from "./EnhancedDataRoom";

export default function Library({
  onPreview,
}: {
  onPreview?: (doc: any) => void;
}) {
  return <EnhancedDataRoom />;
}
