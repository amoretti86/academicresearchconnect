import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["student", "professor"] }).notNull(),
  school: text("school", { enum: ["spelman", "morehouse", "cau"] }).notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  verificationToken: text("verification_token"),
  department: text("department"),
  cvPath: text("cv_path"),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  department: text("department").notNull(),
  school: text("school", { enum: ["spelman", "morehouse", "cau"] }).notNull(),
  skills: text("skills").array().notNull(),
  timeCommitment: text("time_commitment").notNull(),
  compensationType: text("compensation_type", { 
    enum: ["paid", "course_credit", "volunteer"] 
  }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  professorId: integer("professor_id")
    .notNull()
    .references(() => users.id),
});

export const projectInterests = pgTable("project_interests", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id),
  studentId: integer("student_id")
    .notNull()
    .references(() => users.id),
  message: text("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const emailDomainValidator = z.string().refine(
  (email) => {
    const domain = email.split("@")[1];
    return ["spelman.edu", "morehouse.edu", "cau.edu"].includes(domain);
  },
  { message: "Email must be from Spelman, Morehouse, or Clark Atlanta University" }
);

export const insertUserSchema = createInsertSchema(users)
  .pick({
    email: true,
    username: true,
    password: true,
    role: true,
    school: true,
    department: true,
  })
  .extend({
    email: emailDomainValidator,
    password: z.string().min(8),
  });

export const insertProjectSchema = createInsertSchema(projects).pick({
  title: true,
  description: true,
  department: true,
  school: true,
  skills: true,
  timeCommitment: true,
  compensationType: true,
});

export const insertProjectInterestSchema = createInsertSchema(projectInterests).pick({
  projectId: true,
  message: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ProjectInterest = typeof projectInterests.$inferSelect;
