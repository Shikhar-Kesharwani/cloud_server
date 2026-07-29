import React from "react";
import {
  Folder, FileText, Image, Music, Archive,
  Film, FileCode, Clock, Upload, AlertTriangle, Download, RefreshCw
} from "lucide-react";

export type Module = "dashboard" | "files" | "photos" | "activity" | "calendar" | "talk" | "mail" | "settings";
export type FileType = "folder" | "image" | "video" | "audio" | "document" | "archive" | "code";
export type ViewMode = "grid" | "list";

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  size?: string;
  items?: number;
  modified: string;
  starred?: boolean;
  shared?: boolean;
}

export interface ActivityEvent {
  id: string;
  verb: string;
  file: string;
  time: string;
  eventType: "sync" | "share" | "upload" | "conflict" | "download" | "restore";
  user: string;
  initials?: string;
}

import { useState, useEffect } from "react";

export const getAuthHeaders = () => {
  const token = localStorage.getItem("nexus_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

export function useFiles() {
  const [files, setFiles] = useState<FileItem[]>([]);
  
  const refreshFiles = () => {
    fetch("/api/files", { headers: getAuthHeaders() }).then(r => r.json()).then(setFiles).catch(console.error);
  };

  useEffect(() => {
    refreshFiles();
  }, []);
  
  return { files, refreshFiles };
}

export interface PhotoItem {
  id: string;
  name: string;
  url: string;
}

export function usePhotos() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  
  const refreshPhotos = () => {
    fetch("/api/photos", { headers: getAuthHeaders() }).then(r => r.json()).then(setPhotos).catch(console.error);
  };

  useEffect(() => {
    refreshPhotos();
  }, []);
  
  return { photos, refreshPhotos };
}


export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/files/upload", {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function deleteFile(filename: string) {
  const res = await fetch(`/api/files/${encodeURIComponent(filename)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}

export async function createShare(filename: string) {
  const res = await fetch("/api/shares", {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ filename })
  });
  if (!res.ok) throw new Error("Share failed");
  return res.json();
}

export async function getFileMeta(filename: string) {
  const res = await fetch(`/api/files/meta/${encodeURIComponent(filename)}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to load meta");
  return res.json();
}

export async function addTag(filename: string, tag: string) {
  const res = await fetch(`/api/files/meta/${encodeURIComponent(filename)}/tags`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ tag })
  });
  if (!res.ok) throw new Error("Add tag failed");
  return res.json();
}

export async function addComment(filename: string, comment: string) {
  const res = await fetch(`/api/files/meta/${encodeURIComponent(filename)}/comments`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ comment })
  });
  if (!res.ok) throw new Error("Add comment failed");
  return res.json();
}

export async function getVersions(filename: string) {
  const res = await fetch(`/api/files/versions/${encodeURIComponent(filename)}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to load versions");
  return res.json();
}

export async function restoreVersion(filename: string, versionId: string) {
  const res = await fetch(`/api/files/versions/restore/${encodeURIComponent(filename)}/${encodeURIComponent(versionId)}`, {
    method: "POST",
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Restore version failed");
  return res.json();
}

export function useActivity() {
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  useEffect(() => {
    fetch("/api/activity", { headers: getAuthHeaders() }).then(r => r.json()).then(setActivity).catch(console.error);
  }, []);
  return activity;
}

export function useStorageStats() {
  return [
    { label: "Photos",    gb: 18.2, pct: 38.5, color: "oklch(79% 0.14 175)" },
    { label: "Documents", gb: 12.4, pct: 26.2, color: "oklch(67% 0.21 275)" },
    { label: "Videos",    gb: 11.8, pct: 24.9, color: "oklch(68% 0.18 25)"  },
    { label: "Other",     gb: 4.9,  pct: 10.4, color: "oklch(81% 0.16 85)"  },
  ];
}

export const COMMANDS = [
  "Upload files", "New folder", "Share selected", "Download",
  "Resolve conflict", "Restore version", "Open settings",
  "View activity", "Manage sync", "Open terminal",
];

export function fileIcon(type: FileType, size = 18) {
  const p = { size, strokeWidth: 1.5 };
  switch (type) {
    case "folder":   return <Folder   {...p} />;
    case "image":    return <Image    {...p} />;
    case "video":    return <Film     {...p} />;
    case "audio":    return <Music    {...p} />;
    case "document": return <FileText {...p} />;
    case "archive":  return <Archive  {...p} />;
    case "code":     return <FileCode {...p} />;
  }
}

export function fileColor(type: FileType): string {
  switch (type) {
    case "folder":   return "oklch(81% 0.16 85)";
    case "image":    return "oklch(79% 0.14 175)";
    case "video":    return "oklch(68% 0.18 25)";
    case "audio":    return "oklch(67% 0.21 275)";
    case "document": return "oklch(73% 0.13 230)";
    case "archive":  return "oklch(52% 0.025 265)";
    case "code":     return "oklch(79% 0.14 175)";
  }
}

export function eventColor(type: ActivityEvent["eventType"]): string {
  switch (type) {
    case "sync":     return "oklch(67% 0.21 275)";
    case "share":    return "oklch(79% 0.14 175)";
    case "upload":   return "oklch(73% 0.13 230)";
    case "conflict": return "oklch(68% 0.18 25)";
    case "download": return "oklch(81% 0.16 85)";
    case "restore":  return "oklch(52% 0.025 265)";
  }
}
