// components/ui/PrimaryButton.tsx
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface PrimaryButtonProps {
  children: ReactNode;
  [key: string]: unknown; // This allows you to pass any additional props, like className, etc.
}

export const PrimaryButton = ({ children, ...props }: PrimaryButtonProps) => (
  <Button className="px-6 py-3 rounded-lg text-lg font-semibold bg-blue-600 hover:bg-blue-700 focus:outline-none" {...props}>
    {children}
  </Button>
);
