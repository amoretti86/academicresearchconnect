import { IStorage } from "./types";
import createMemoryStore from "memorystore";
import session from "express-session";
import { InsertUser, User, Project, ProjectInterest } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

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
    const user: User = { ...insertUser, id, isVerified: false };
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

    return projects;
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
    };
    this.projectInterests.set(id, newInterest);
    return newInterest;
  }
}

export const storage = new MemStorage();
