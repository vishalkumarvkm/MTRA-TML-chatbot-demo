"use client";

import React from "react";

interface LogoLockupProps {
  className?: string;
  variant?: "light" | "blue";
  size?: "sm" | "lg";
}

export function LogoLockup({
  className,
  variant = "light",
  size = "sm",
}: LogoLockupProps) {
  const src =
    variant === "blue"
      ? "/assets/images/logo_lockup_blue.png"
      : "/logo_lockup.jpg";

  const heightClass =
    size === "lg" ? "h-[38px] md:h-[48px]" : "h-[28px] md:h-[36px]";

  const maxH = size === "lg" ? "48px" : "36px";
  const minH = size === "lg" ? "38px" : "28px";

  return (
    <img
      src={src}
      alt="HealthyME | Life@ Montefiore Human Resources"
      className={`${heightClass} w-auto object-contain block shrink-0 select-none ${className || ""}`}
      style={{
        maxHeight: maxH,
        minHeight: minH,
      }}
    />
  );
}
