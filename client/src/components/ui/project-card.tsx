import { Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Clock, Building2, GraduationCap } from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

const schoolNames = {
  spelman: "Spelman College",
  morehouse: "Morehouse College",
  cau: "Clark Atlanta University",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const interestMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/projects/${project.id}/interest`, {
        message,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Interest Submitted",
        description: "The professor will be notified of your interest.",
      });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit interest",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cvUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("cv", file);
      await apiRequest("POST", "/api/cv", formData);
    },
    onSuccess: () => {
      toast({
        title: "CV Uploaded",
        description: "Your CV has been successfully uploaded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "CV Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <CardTitle>{project.title}</CardTitle>
          <Badge variant="outline">
            {project.compensationType.replace("_", " ")}
          </Badge>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Building2 className="h-4 w-4" />
            {schoolNames[project.school]}
          </div>
          <div className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            {project.department}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {format(new Date(project.createdAt), "MMM d, yyyy")}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm">{project.description}</p>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Required Skills:</h4>
          <div className="flex flex-wrap gap-2">
            {project.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium">Time Commitment:</h4>
          <p className="text-sm text-muted-foreground">{project.timeCommitment}</p>
        </div>
      </CardContent>

      {user?.role === "student" && (
        <CardFooter>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">Express Interest</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Express Interest in Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Upload CV (PDF only)
                  </label>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) cvUploadMutation.mutate(file);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Message to Professor
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Briefly describe your interest and qualifications..."
                    rows={4}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={() => interestMutation.mutate()}
                  disabled={interestMutation.isPending}
                >
                  {interestMutation.isPending
                    ? "Submitting..."
                    : "Submit Interest"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardFooter>
      )}
    </Card>
  );
}