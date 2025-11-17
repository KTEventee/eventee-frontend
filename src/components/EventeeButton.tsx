import React from 'react';
import { ButtonHTMLAttributes, forwardRef } from "react";

interface EventeeButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  children: React.ReactNode;
}

const EventeeButton = forwardRef<
  HTMLButtonElement,
  EventeeButtonProps
>(
  (
    {
      variant = "primary",
      children,
      className = "",
      disabled,
      style,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "relative h-[59px] rounded-[9px] px-6 transition-all duration-200";

    const variants = {
      primary: `bg-[#67594c] text-white shadow-[0px_4px_61px_0px_rgba(77,71,195,0.4)] hover:bg-[#7a6a5c] active:shadow-[0px_2px_30px_0px_rgba(77,71,195,0.3)] ${disabled ? "opacity-50 cursor-not-allowed" : ""}`,
      outline: `bg-white border-2 border-[#67594c] text-[#67594c] hover:bg-[#FAF9F6] ${disabled ? "opacity-50 cursor-not-allowed" : ""}`,
      ghost: `bg-transparent text-[#67594c] hover:bg-[#FAF9F6] ${disabled ? "opacity-50 cursor-not-allowed" : ""}`,
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className} flex items-center justify-center`}
        disabled={disabled}
        style={style}
        {...props}
      >
        <span className="text-center text-[16px] leading-normal whitespace-nowrap">
          {children}
        </span>
      </button>
    );
  },
);

EventeeButton.displayName = "EventeeButton";

export default EventeeButton;