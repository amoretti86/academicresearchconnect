import { NavHeader } from "@/components/nav-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProjectCreate() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const form = useForm({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      department: "",
      school: "spelman",
      skills: [],
      timeCommitment: "",
      compensationType: "paid",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: typeof form.getValues) => {
      const res = await apiRequest("POST", "/api/projects", {
        ...data,
        skills,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Project Created",
        description: "Your research project has been posted successfully.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Post a Research Project</CardTitle>
          </CardHeader>
          
          <CardContent>
            <form
              onSubmit={form.handleSubmit((data) => createProjectMutation.mutate(data))}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  disabled={createProjectMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  rows={4}
                  disabled={createProjectMutation.isPending}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    {...form.register("department")}
                    disabled={createProjectMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school">School</Label>
                  <Select
                    onValueChange={(value) => form.setValue("school", value as "spelman" | "morehouse" | "cau")}
                    defaultValue={form.getValues("school")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select school" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spelman">Spelman College</SelectItem>
                      <SelectItem value="morehouse">Morehouse College</SelectItem>
                      <SelectItem value="cau">Clark Atlanta University</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="Type a skill and press Enter"
                    disabled={createProjectMutation.isPending}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSkill}
                    disabled={createProjectMutation.isPending}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {skill}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeCommitment">Time Commitment</Label>
                <Input
                  id="timeCommitment"
                  {...form.register("timeCommitment")}
                  placeholder="e.g. 10 hours per week"
                  disabled={createProjectMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="compensationType">Compensation Type</Label>
                <Select
                  onValueChange={(value) => form.setValue("compensationType", value as "paid" | "course_credit" | "volunteer")}
                  defaultValue={form.getValues("compensationType")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select compensation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="course_credit">Course Credit</SelectItem>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createProjectMutation.isPending}
              >
                {createProjectMutation.isPending
                  ? "Creating Project..."
                  : "Create Project"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
