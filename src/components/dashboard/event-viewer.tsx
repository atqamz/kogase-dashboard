'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TelemetryEvent } from '@/lib/types';

interface EventViewerProps {
  event: TelemetryEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventViewer({ event, isOpen, onClose }: EventViewerProps) {
  const [activeTab, setActiveTab] = useState('payload');

  if (!event) return null;

  const formatJson = (data: any): string => {
    return JSON.stringify(data, null, 2);
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.eventName}</DialogTitle>
          <DialogDescription>
            {event.category} event • {formatTimestamp(event.timestamp)}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Event ID:</span>
            <span className="ml-2 font-mono">{event.id}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Project ID:</span>
            <span className="ml-2 font-mono">{event.projectId}</span>
          </div>
          {event.userId && (
            <div>
              <span className="text-muted-foreground">User ID:</span>
              <span className="ml-2 font-mono">{event.userId}</span>
            </div>
          )}
          {event.deviceId && (
            <div>
              <span className="text-muted-foreground">Device ID:</span>
              <span className="ml-2 font-mono">{event.deviceId}</span>
            </div>
          )}
          {event.sessionId && (
            <div>
              <span className="text-muted-foreground">Session ID:</span>
              <span className="ml-2 font-mono">{event.sessionId}</span>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList>
            <TabsTrigger value="payload">Payload</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="clientInfo">Client Info</TabsTrigger>
          </TabsList>
          <TabsContent value="payload" className="mt-2">
            <pre className="max-h-96 overflow-auto rounded-lg bg-slate-50 p-4 text-sm font-mono dark:bg-slate-900">
              {formatJson(event.payload || {})}
            </pre>
          </TabsContent>
          <TabsContent value="parameters" className="mt-2">
            <pre className="max-h-96 overflow-auto rounded-lg bg-slate-50 p-4 text-sm font-mono dark:bg-slate-900">
              {formatJson(event.parameters || {})}
            </pre>
          </TabsContent>
          <TabsContent value="clientInfo" className="mt-2">
            <pre className="max-h-96 overflow-auto rounded-lg bg-slate-50 p-4 text-sm font-mono dark:bg-slate-900">
              {formatJson(event.clientInfo || {})}
            </pre>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}