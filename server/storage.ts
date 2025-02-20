import { IStorage } from "./types";
import createMemoryStore from "memorystore";
import session from "express-session";
import { InsertUser, User, Project, ProjectInterest } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

// Create some sample projects
const sampleProjects: Omit<Project, "id" | "createdAt">[] = [
  {
    title: "AI in Healthcare Research",
    description: "Research project exploring applications of machine learning in diagnostic medicine.",
    department: "Computer Science",
    school: "spelman",
    skills: ["Python", "Machine Learning", "Healthcare"],
    timeCommitment: "10 hours per week",
    compensationType: "paid",
    professorId: 1,
  },
  {
    title: "Quantum Computing Foundations",
    description: "Theoretical research in quantum computing algorithms and their applications.",
    department: "Physics",
    school: "morehouse",
    skills: ["Quantum Mechanics", "Linear Algebra", "Programming"],
    timeCommitment: "15 hours per week",
    compensationType: "course_credit",
    professorId: 1,
  }
];

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private projectInterests: Map<number, ProjectInterest>;
  sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.projectInterests = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Add sample professor
    const professorId = this.currentId++;
    this.users.set(professorId, {
      id: professorId,
      email: "prof@spelman.edu",
      username: "professor",
      password: "hashed_password",
      role: "professor",
      school: "spelman",
      isVerified: true,
      verificationToken: null,
      department: "Computer Science",
      cvPath: null,
    });

    // Add sample projects
    sampleProjects.forEach(project => {
      const id = this.currentId++;
      this.projects.set(id, {
        ...project,
        id,
        createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7), // Random date within last week
      });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      isVerified: false,
      verificationToken: null,
      cvPath: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserCV(userId: number, cvPath: string): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      this.users.set(userId, { ...user, cvPath });
    }
  }

  async verifyUser(email: string): Promise<void> {
    const user = await this.getUserByEmail(email);
    if (user) {
      this.users.set(user.id, { ...user, isVerified: true });
    }
  }

  async getProjects(filters: {
    department?: string;
    school?: string;
    search?: string;
  }): Promise<Project[]> {
    let projects = Array.from(this.projects.values());

    if (filters.department) {
      projects = projects.filter(p => p.department === filters.department);
    }
    if (filters.school) {
      projects = projects.filter(p => p.school === filters.school);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      projects = projects.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    return projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createProject(project: Omit<Project, "id" | "createdAt">): Promise<Project> {
    const id = this.currentId++;
    const newProject: Project = {
      ...project,
      id,
      createdAt: new Date(),
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async createProjectInterest(interest: Omit<ProjectInterest, "id" | "createdAt">): Promise<ProjectInterest> {
    const id = this.currentId++;
    const newInterest: ProjectInterest = {
      ...interest,
      id,
      createdAt: new Date(),
      message: interest.message || null,
    };
    this.projectInterests.set(id, newInterest);
    return newInterest;
  }
}

export const storage = new MemStorage();