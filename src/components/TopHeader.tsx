import React from "react";
import { SidebarTrigger } from "./ui/sidebar";
import { Flame, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { api } from "@/trpc/react";

type TopHeaderProps = {
  functionProp?: () => void;
  title: string;
  subtitle: string;
  buttonText?: string;
};

const TopHeader = ({
  functionProp,
  title,
  subtitle,
  buttonText,
}: TopHeaderProps) => {
  const { data: streak } = api.user.getStreak.useQuery();

  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {title === "Dashboard" && (
            <Badge
              variant="default"
              className="flex items-center gap-1 px-4 py-2"
            >
              <Flame className="h-5 w-5 text-yellow-400" />
              {streak} day streak
            </Badge>
          )}
          {buttonText && (
            <Button onClick={functionProp} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              {buttonText}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
