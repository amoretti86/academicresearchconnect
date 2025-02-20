import { NavHeader } from "@/components/nav-header";
import { ProjectSearch } from "@/components/project-search";
import { ProjectCard } from "@/components/ui/project-card";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [school, setSchool] = useState("");

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: [
      "/api/projects",
      { department, school, search }
    ],
  });

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-[300px,1fr] gap-6">
          <aside>
            <ProjectSearch
              search={search}
              onSearchChange={setSearch}
              department={department}
              onDepartmentChange={setDepartment}
              school={school}
              onSchoolChange={setSchool}
            />
          </aside>

          <div className="space-y-6">
            <header>
              <h1 className="text-3xl font-bold">Research Projects</h1>
              <p className="text-muted-foreground">
                Discover research opportunities across the Atlanta University Center
              </p>
            </header>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !projects?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                No projects found matching your criteria
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
