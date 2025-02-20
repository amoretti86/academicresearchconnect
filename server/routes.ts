import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { insertProjectSchema, insertProjectInterestSchema } from "@shared/schema";
import { ZodError } from "zod";

const upload = multer({
  dest: "uploads/",
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf') {
      cb(new Error('Only PDF files are allowed'));
      return;
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Projects
  app.get("/api/projects", async (req, res) => {
    const { department, school, search } = req.query;
    const projects = await storage.getProjects({
      department: department as string,
      school: school as string,
      search: search as string,
    });
    res.json(projects);
  });

  app.post("/api/projects", async (req, res) => {
    if (!req.user || req.user.role !== "professor") {
      return res.status(403).send("Only professors can create projects");
    }

    try {
      const data = insertProjectSchema.parse(req.body);
      const project = await storage.createProject({
        ...data,
        professorId: req.user.id,
      });
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json(error.errors);
      } else {
        throw error;
      }
    }
  });

  // Project Interests
  app.post("/api/projects/:id/interest", async (req, res) => {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).send("Only students can express interest");
    }

    try {
      const data = insertProjectInterestSchema.parse({
        ...req.body,
        projectId: parseInt(req.params.id),
      });

      const interest = await storage.createProjectInterest({
        ...data,
        studentId: req.user.id,
      });
      res.status(201).json(interest);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json(error.errors);
      } else {
        throw error;
      }
    }
  });

  // CV Upload
  app.post("/api/cv", upload.single("cv"), async (req, res) => {
    if (!req.user || !req.file) {
      return res.status(400).send("No file uploaded");
    }

    await storage.updateUserCV(req.user.id, req.file.path);
    res.sendStatus(200);
  });

  const httpServer = createServer(app);
  return httpServer;
}
