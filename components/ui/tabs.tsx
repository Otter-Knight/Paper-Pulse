"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue || "");

  const currentValue = value !== undefined ? value : activeTab;

  const handleValueChange = (newValue: string) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div className={cn("w-full", className)} data-value={currentValue}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            value: currentValue,
            onValueChange: handleValueChange,
          });
        }
        return child;
      })}
    </div>
  );
}

function TabsList({
  className,
  children,
  value,
  onValueChange,
}: {
  className?: string;
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const isActive = (child.props as { value?: string }).value === value;
          return React.cloneElement(child as React.ReactElement<any>, {
            isActive,
            onClick: () => onValueChange?.((child.props as { value?: string }).value || ""),
          });
        }
        return child;
      })}
    </div>
  );
}

function TabsTrigger({
  className,
  value,
  isActive,
  onClick,
  children,
}: {
  className?: string;
  value?: string;
  isActive?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function TabsContent({
  className,
  value: tabValue,
  currentValue,
  children,
}: {
  className?: string;
  value?: string;
  currentValue?: string;
  children: React.ReactNode;
}) {
  if (tabValue !== currentValue) return null;

  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
