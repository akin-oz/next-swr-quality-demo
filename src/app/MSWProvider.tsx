"use client";
import { useEffect } from "react";
import { startMSW } from "@/mocks/browser";

export default function MSWProvider() {
  useEffect(() => {
    void startMSW();
  }, []);
  return null;
}
