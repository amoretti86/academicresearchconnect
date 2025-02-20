import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookOpenText, PlusCircle, LogOut } from "lucide-react";

export function NavHeader() {
  const { user, logoutMutation } = useAuth();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <BookOpenText className="h-6 w-6" />
          <span>AUC Research Connect</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {user?.email} ({user?.role})
          </div>

          {user?.role === "professor" && (
            <Link href="/projects/create">
              <Button variant="outline" size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Post Project
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
