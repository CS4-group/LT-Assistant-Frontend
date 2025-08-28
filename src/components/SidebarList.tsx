import { cn } from "@/lib/utils";

interface SidebarItem {
  id: string;
  title: string;
}

interface SidebarListProps {
  items: SidebarItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
}

export function SidebarList({ items, selectedItemId, onSelectItem }: SidebarListProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelectItem(item.id)}
          className={cn(
            "w-full text-left p-3 rounded-xl transition-colors",
            selectedItemId === item.id
              ? "bg-primary text-primary-foreground"
              : "hover:bg-gray-100"
          )}
        >
          {item.title}
        </button>
      ))}
    </div>
  );
}
