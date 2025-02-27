import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

// Sample project data
const projects = [
  {
    id: "1",
    name: "Mobile Game",
    description: "A cross-platform mobile game with real-time multiplayer",
    apiKey: "kg_live_mobileGame123",
    status: "active",
    createdAt: "2023-01-15",
  },
  {
    id: "2",
    name: "Web RPG",
    description: "Browser-based role-playing game with persistent world",
    apiKey: "kg_live_webRpg456",
    status: "active",
    createdAt: "2023-03-22",
  },
  {
    id: "3",
    name: "AR Experience",
    description: "Augmented reality experience for mobile devices",
    apiKey: "kg_live_arExp789",
    status: "development",
    createdAt: "2023-05-10",
  },
];

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your game projects</p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>New Project</span>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <span className="text-sm">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        project.status === "active"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    ></span>
                    {project.status === "active" ? "Active" : "Development"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Created:</span>
                  <span className="text-sm">{project.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">API Key:</span>
                  <span className="text-sm font-mono">
                    {project.apiKey.substring(0, 8)}...
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                View Details
              </Button>
              <Button variant="outline" size="sm">
                API Keys
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
