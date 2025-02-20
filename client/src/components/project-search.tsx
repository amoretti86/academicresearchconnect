import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface ProjectSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  department: string;
  onDepartmentChange: (value: string) => void;
  school: string;
  onSchoolChange: (value: string) => void;
}

export function ProjectSearch({
  search,
  onSearchChange,
  department,
  onDepartmentChange,
  school,
  onSchoolChange,
}: ProjectSearchProps) {
  return (
    <div className="p-4 bg-card rounded-lg border space-y-4">
      <h2 className="font-semibold">Search Projects</h2>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title or description..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="space-y-2">
        <Label>Department</Label>
        <Select value={department} onValueChange={onDepartmentChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="Computer Science">Computer Science</SelectItem>
            <SelectItem value="Biology">Biology</SelectItem>
            <SelectItem value="Chemistry">Chemistry</SelectItem>
            <SelectItem value="Physics">Physics</SelectItem>
            <SelectItem value="Mathematics">Mathematics</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>School</Label>
        <Select value={school} onValueChange={onSchoolChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Schools" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Schools</SelectItem>
            <SelectItem value="spelman">Spelman College</SelectItem>
            <SelectItem value="morehouse">Morehouse College</SelectItem>
            <SelectItem value="cau">Clark Atlanta University</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}