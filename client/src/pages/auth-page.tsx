import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, InsertUser } from "@shared/schema";
import { useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Hero Section */}
      <div className="hidden md:flex flex-col justify-center p-10 bg-primary text-primary-foreground">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold mb-4">
            AUC Research Connect
          </h1>
          <p className="text-lg mb-6">
            Connect with research opportunities across Spelman, Morehouse, and Clark Atlanta University.
            Join a community of scholars and make your mark in academia.
          </p>
          <div 
            className="aspect-video rounded-lg overflow-hidden bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1576670159375-8beb7c963ead)'
            }}
          />
        </div>
      </div>

      {/* Auth Forms */}
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <LoginForm />
              </TabsContent>

              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoginForm() {
  const { loginMutation } = useAuth();
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))}
      className="space-y-4 mt-4"
    >
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
          disabled={loginMutation.isPending}
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...form.register("password")}
          disabled={loginMutation.isPending}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}

function RegisterForm() {
  const { registerMutation } = useAuth();
  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      role: "student",
      school: "spelman",
      department: "",
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((data) => registerMutation.mutate(data))}
      className="space-y-4 mt-4"
    >
      <div>
        <Label htmlFor="email">Academic Email</Label>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
          disabled={registerMutation.isPending}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          {...form.register("username")}
          disabled={registerMutation.isPending}
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...form.register("password")}
          disabled={registerMutation.isPending}
        />
      </div>

      <div>
        <Label htmlFor="role">Role</Label>
        <Select
          onValueChange={(value) => form.setValue("role", value as "student" | "professor")}
          defaultValue={form.getValues("role")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="professor">Professor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="school">School</Label>
        <Select
          onValueChange={(value) => form.setValue("school", value as "spelman" | "morehouse" | "cau")}
          defaultValue={form.getValues("school")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your school" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="spelman">Spelman College</SelectItem>
            <SelectItem value="morehouse">Morehouse College</SelectItem>
            <SelectItem value="cau">Clark Atlanta University</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          {...form.register("department")}
          disabled={registerMutation.isPending}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
}
