"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const filters = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last-7-days", label: "Last 7 days" },
  { value: "last-30-days", label: "Last 30 days" },
  { value: "this-month", label: "This month" },
  { value: "last-month", label: "Last month" },
];

interface DateFilterProps {
  defaultValue?: string;
}

export function DateFilter({ defaultValue = "last-7-days" }: DateFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", value);
    router.push(`?${params.toString()}`);
  }

  return (
    <Select defaultValue={defaultValue} onValueChange={handleChange}>
      <SelectTrigger size="sm" className="w-[160px]">
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        {filters.map((filter) => (
          <SelectItem key={filter.value} value={filter.value}>
            {filter.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
