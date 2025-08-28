import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ placeholder, value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 w-full"
      />
    </div>
  );
}
