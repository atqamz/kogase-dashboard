"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateApiKey } from "@/lib/utils";
import { Copy, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function ApiPage() {
  const [liveKey, setLiveKey] = useState(generateApiKey());
  const [testKey, setTestKey] = useState(
    generateApiKey().replace("live", "test")
  );

  const regenerateLiveKey = () => {
    setLiveKey(generateApiKey());
  };

  const regenerateTestKey = () => {
    setTestKey(generateApiKey().replace("live", "test"));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">API</h1>
        <p className="text-muted-foreground">
          Manage your API keys and settings
        </p>
      </div>

      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live API Keys</CardTitle>
              <CardDescription>
                Use these keys in your production environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="live-key">Live Key</Label>
                <div className="flex">
                  <Input
                    id="live-key"
                    value={liveKey}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="ml-2"
                    onClick={() => copyToClipboard(liveKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="ml-2"
                    onClick={regenerateLiveKey}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  This key has full access to your account. Keep it secure!
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test API Keys</CardTitle>
              <CardDescription>
                Use these keys for development and testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-key">Test Key</Label>
                <div className="flex">
                  <Input
                    id="test-key"
                    value={testKey}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="ml-2"
                    onClick={() => copyToClipboard(testKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="ml-2"
                    onClick={regenerateTestKey}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  This key only works in test mode and doesn't affect your live
                  data.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>
                Available endpoints for your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium">Authentication</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    <code className="bg-muted px-1 py-0.5 rounded">
                      POST /api/auth
                    </code>{" "}
                    - Authenticate users
                  </p>
                </div>
                <div className="border rounded-md p-4">
                  <h3 className="font-medium">User Management</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    <code className="bg-muted px-1 py-0.5 rounded">
                      GET /api/users
                    </code>{" "}
                    - List users
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <code className="bg-muted px-1 py-0.5 rounded">
                      POST /api/users
                    </code>{" "}
                    - Create user
                  </p>
                </div>
                <div className="border rounded-md p-4">
                  <h3 className="font-medium">Data Storage</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    <code className="bg-muted px-1 py-0.5 rounded">
                      GET /api/data
                    </code>{" "}
                    - Retrieve data
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <code className="bg-muted px-1 py-0.5 rounded">
                      POST /api/data
                    </code>{" "}
                    - Store data
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">View API Documentation</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Usage</CardTitle>
              <CardDescription>
                Monitor your API usage and limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      API Requests (This Month)
                    </span>
                    <span className="text-sm">543,210 / 1,000,000</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: "54.3%" }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    54.3% of monthly quota used
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Storage Usage</span>
                    <span className="text-sm">2.1 GB / 5 GB</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: "42%" }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    42% of storage quota used
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      Concurrent Connections
                    </span>
                    <span className="text-sm">87 / 500</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: "17.4%" }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    17.4% of connection limit used
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Upgrade Plan</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
