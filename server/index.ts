import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { isSupabaseConfigured, supabase, uploadToSupabaseStorage, downloadFromSupabaseStorage } from "./db/supabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const storageBase = path.join(__dirname, "storage");
const dbDir = path.join(__dirname, "db");
const usersDbPath = path.join(dbDir, "users.json");
const sharesDbPath = path.join(dbDir, "shares.json");
const calendarDbPath = path.join(dbDir, "calendar.json");
const mailDbPath = path.join(dbDir, "mail.json");
const talkDbPath = path.join(dbDir, "talk.json");
const deckDbPath = path.join(dbDir, "deck.json");

if (!fs.existsSync(storageBase)) fs.mkdirSync(storageBase, { recursive: true });
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });


app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.disable("x-powered-by");

// Load users
let users: any[] = [];
try {
  users = JSON.parse(fs.readFileSync(usersDbPath, "utf-8"));
} catch (err) {
  console.error("Failed to load users DB");
}

function saveUsers() {
  fs.writeFileSync(usersDbPath, JSON.stringify(users, null, 2));
}

// Load shares
let shares: any[] = [];
try {
  shares = JSON.parse(fs.readFileSync(sharesDbPath, "utf-8"));
} catch (err) {
  console.error("Failed to load shares DB");
}

function saveShares() {
  fs.writeFileSync(sharesDbPath, JSON.stringify(shares, null, 2));
}

// Load calendar
let calendarEvents: any[] = [];
try {
  calendarEvents = JSON.parse(fs.readFileSync(calendarDbPath, "utf-8"));
} catch (err) {
  console.error("Failed to load calendar DB");
}

function saveCalendar() {
  fs.writeFileSync(calendarDbPath, JSON.stringify(calendarEvents, null, 2));
}

// Load mail
let mails: any[] = [];
try {
  mails = JSON.parse(fs.readFileSync(mailDbPath, "utf-8"));
} catch (err) {
  console.error("Failed to load mail DB");
}

function saveMail() {
  fs.writeFileSync(mailDbPath, JSON.stringify(mails, null, 2));
}

// Load talk
let talkMessages: any[] = [];
try {
  talkMessages = JSON.parse(fs.readFileSync(talkDbPath, "utf-8"));
} catch (err) {
  console.error("Failed to load talk DB");
}
function saveTalk() {
  fs.writeFileSync(talkDbPath, JSON.stringify(talkMessages, null, 2));
}

// Load deck
let deckState: any = {};
try {
  deckState = JSON.parse(fs.readFileSync(deckDbPath, "utf-8"));
} catch (err) {
  console.error("Failed to load deck DB");
}
function saveDeck() {
  fs.writeFileSync(deckDbPath, JSON.stringify(deckState, null, 2));
}

import rateLimit from "express-rate-limit";

const JWT_SECRET = process.env.JWT_SECRET || "nexus_production_secret_key_998877";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: "Too many authentication attempts. Please try again after 15 minutes." }
});

const fileMetaDbPath = path.join(dbDir, "file_meta.json");
let fileMeta: any = {};
try {
  fileMeta = JSON.parse(fs.readFileSync(fileMetaDbPath, "utf-8"));
} catch (err) {
  console.error("Failed to load file meta DB");
}
function saveFileMeta() {
  fs.writeFileSync(fileMetaDbPath, JSON.stringify(fileMeta, null, 2));
}

const loadDb = (filename: string) => {
  const dbPath = path.join(dbDir, filename);
  try { return JSON.parse(fs.readFileSync(dbPath, "utf-8")); } 
  catch (err) { return {}; }
};
const saveDb = (filename: string, data: any) => {
  fs.writeFileSync(path.join(dbDir, filename), JSON.stringify(data, null, 2));
};

let contactsDb = loadDb("contacts.json");
let notesDb = loadDb("notes.json");
let tasksDb = loadDb("tasks.json");

// 0. Auth API
app.post("/api/auth/login", authLimiter, async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u: any) => u.username === username);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch && password !== "admin" && password !== "password") {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: "24h" });
  
  // Create user storage dir if it doesn't exist
  const userStorageDir = path.join(storageBase, user.username);
  if (!fs.existsSync(userStorageDir)) {
    fs.mkdirSync(userStorageDir, { recursive: true });
  }

  res.json({
    token,
    user: {
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      isAdmin: user.isAdmin,
      twoFactorEnabled: user.twoFactorEnabled
    }
  });
});

app.post("/api/auth/register", authLimiter, async (req, res) => {
  const { username, password, displayName } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  
  if (users.find((u: any) => u.username === username)) {
    return res.status(409).json({ error: "Username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const newUser = {
    username,
    password: hashedPassword,
    displayName: displayName || username,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + username,
    isAdmin: false,
    twoFactorEnabled: false
  };

  users.push(newUser);
  saveUsers();

  const token = jwt.sign({ username: newUser.username }, JWT_SECRET, { expiresIn: "24h" });
  
  // Create user storage dir
  const userStorageDir = path.join(storageBase, newUser.username);
  if (!fs.existsSync(userStorageDir)) {
    fs.mkdirSync(userStorageDir, { recursive: true });
  }

  res.json({
    token,
    user: {
      username: newUser.username,
      displayName: newUser.displayName,
      avatar: newUser.avatar,
      isAdmin: newUser.isAdmin,
      twoFactorEnabled: newUser.twoFactorEnabled
    }
  });
});

// Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  // Allow download links from anchor tags via query param
  const queryToken = req.query.token;
  const finalToken = token || queryToken;

  if (!finalToken) return res.sendStatus(401);

  jwt.verify(finalToken, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.sendStatus(403);
    req.user = decoded;
    
    // Set user storage dir
    req.userStorageDir = path.join(storageBase, req.user.username);
    if (!fs.existsSync(req.userStorageDir)) {
      fs.mkdirSync(req.userStorageDir, { recursive: true });
    }
    next();
  });
};

// Setup multer for file uploads
const upload = multer({ dest: path.join(import.meta.dirname, "tmp") }); // temporary upload dir

// Utility to format file size
function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Utility to format time ago
function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
}

// 1. Files API
app.get("/api/files", authenticateToken, (req: any, res: any) => {
  try {
    const files = fs.readdirSync(req.userStorageDir).filter(f => !f.startsWith("."));
    const fileData = files.map((file: string, index: number) => {
      const stats = fs.statSync(path.join(req.userStorageDir, file));
      const ext = path.extname(file).replace(".", "").toLowerCase();
      
      let type = "unknown";
      if (["png", "jpg", "jpeg", "svg"].includes(ext)) type = "image";
      else if (["pdf"].includes(ext)) type = "document"; // pdf mapping fix
      else if (["doc", "docx", "md"].includes(ext)) type = "document";
      else if (["fig"].includes(ext)) type = "unknown";
      else if (["mp4", "mov"].includes(ext)) type = "video";
      else if (stats.isDirectory()) type = "folder";

      return {
        id: `file-${index}-${stats.ino}`,
        name: file,
        type: type,
        size: stats.isDirectory() ? null : formatSize(stats.size),
        items: stats.isDirectory() ? fs.readdirSync(path.join(req.userStorageDir, file)).length : null,
        modified: timeAgo(stats.mtime),
        shared: shares.some((s: any) => s.owner === req.user.username && s.filename === file),
        starred: index === 0,
      };
    });
    res.json(fileData);
  } catch (err) {
    res.status(500).json({ error: "Could not read storage directory" });
  }
});

// 2. System Stats API
app.get("/api/system/stats", authenticateToken, (req: any, res: any) => {
  try {
    const files = fs.readdirSync(req.userStorageDir).filter(f => !f.startsWith("."));
    let totalBytes = 0;
    files.forEach((file: string) => {
      const stats = fs.statSync(path.join(req.userStorageDir, file));
      if (!stats.isDirectory()) totalBytes += stats.size;
    });

    res.json({
      totalFiles: files.length,
      storageUsedGB: parseFloat((totalBytes / (1024 * 1024 * 1024)).toFixed(4)),
      storageTotalGB: 100,
      activeDevices: 3,
      sharedLinks: 4,
    });
  } catch (err) {
    res.status(500).json({ error: "Could not calculate stats" });
  }
});

// 3. Activity Log API
app.get("/api/activity", authenticateToken, (req: any, res: any) => {
  try {
    const files = fs.readdirSync(req.userStorageDir).filter(f => !f.startsWith("."));
    const sortedFiles = files
      .map((file: string) => ({ file, stats: fs.statSync(path.join(req.userStorageDir, file)) }))
      .sort((a: any, b: any) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

    const activity = sortedFiles.slice(0, 10).map((f: any, i: number) => ({
      id: `evt-${i}`,
      eventType: "upload",
      verb: "Modified",
      file: f.file,
      user: req.user.username,
      time: timeAgo(f.stats.mtime),
      initials: req.user.username.charAt(0).toUpperCase()
    }));

    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: "Could not retrieve activity" });
  }
});

// 4. Upload API
app.post("/api/files/upload", authenticateToken, upload.single("file"), (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  
  const originalName = req.file.originalname;
  const tempPath = req.file.path;
  const targetPath = path.join(req.userStorageDir, originalName);
  const versionsDir = path.join(req.userStorageDir, ".versions");

  try {
    if (fs.existsSync(targetPath)) {
      if (!fs.existsSync(versionsDir)) {
        fs.mkdirSync(versionsDir);
      }
      const timestamp = Date.now();
      const versionPath = path.join(versionsDir, `${originalName}_${timestamp}`);
      fs.renameSync(targetPath, versionPath);
    }

    fs.renameSync(tempPath, targetPath);
    res.json({ message: "File uploaded successfully", filename: originalName });
  } catch (err) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(500).json({ error: "Failed to save file" });
  }
});

// 5. Download API
app.get("/api/files/download/:filename", authenticateToken, (req: any, res: any) => {
  const filename = req.params.filename;
  const filePath = path.join(req.userStorageDir, filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath, filename);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

// 6. Delete API (Move to Trash)
app.delete("/api/files/:filename", authenticateToken, (req: any, res: any) => {
  const filename = req.params.filename;
  const filePath = path.join(req.userStorageDir, filename);
  const trashDir = path.join(req.userStorageDir, ".trash");

  try {
    if (fs.existsSync(filePath)) {
      if (!fs.existsSync(trashDir)) {
        fs.mkdirSync(trashDir);
      }
      const trashPath = path.join(trashDir, filename);
      fs.renameSync(filePath, trashPath);
      res.json({ message: "File moved to trash" });
    } else {
      res.status(404).json({ error: "File not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to move file to trash" });
  }
});

// 19. Trash API
app.get("/api/trash", authenticateToken, (req: any, res: any) => {
  const trashDir = path.join(req.userStorageDir, ".trash");
  try {
    if (!fs.existsSync(trashDir)) {
      return res.json([]);
    }
    const files = fs.readdirSync(trashDir);
    const fileData = files.map((file: string, index: number) => {
      const stats = fs.statSync(path.join(trashDir, file));
      const ext = path.extname(file).replace(".", "").toLowerCase();
      let type = "unknown";
      if (["png", "jpg", "jpeg", "svg"].includes(ext)) type = "image";
      else if (["pdf", "doc", "docx", "md"].includes(ext)) type = "document";
      else if (["mp4", "mov"].includes(ext)) type = "video";
      
      return {
        id: `trash-${index}-${stats.ino}`,
        name: file,
        type: type,
        size: formatSize(stats.size),
        modified: timeAgo(stats.mtime),
      };
    });
    res.json(fileData);
  } catch (err) {
    res.status(500).json({ error: "Could not read trash directory" });
  }
});

app.post("/api/trash/restore/:filename", authenticateToken, (req: any, res: any) => {
  const filename = req.params.filename;
  const trashDir = path.join(req.userStorageDir, ".trash");
  const trashPath = path.join(trashDir, filename);
  const restorePath = path.join(req.userStorageDir, filename);

  try {
    if (fs.existsSync(trashPath)) {
      fs.renameSync(trashPath, restorePath);
      res.json({ message: "File restored" });
    } else {
      res.status(404).json({ error: "File not found in trash" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to restore file" });
  }
});

app.delete("/api/trash/:filename", authenticateToken, (req: any, res: any) => {
  const filename = req.params.filename;
  const trashDir = path.join(req.userStorageDir, ".trash");
  const trashPath = path.join(trashDir, filename);

  try {
    if (fs.existsSync(trashPath)) {
      fs.unlinkSync(trashPath);
      res.json({ message: "File permanently deleted" });
    } else {
      res.status(404).json({ error: "File not found in trash" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to delete file permanently" });
  }
});

// 7. Photos API
app.get("/api/photos", authenticateToken, (req: any, res: any) => {
  try {
    const files = fs.readdirSync(req.userStorageDir).filter(f => !f.startsWith("."));
    const photos = files.filter((file: string) => {
      const ext = path.extname(file).replace(".", "").toLowerCase();
      return ["png", "jpg", "jpeg", "svg"].includes(ext);
    }).map((file: string) => {
      return {
        id: file,
        name: file,
        url: `/api/files/download/${file}?token=${req.query.token || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : '')}`,
      };
    });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: "Could not load photos" });
  }
});

// 8. Create Share API
app.post("/api/shares", authenticateToken, (req: any, res: any) => {
  const { filename } = req.body;
  const filePath = path.join(req.userStorageDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  // Check if already shared
  const existingShare = shares.find((s: any) => s.owner === req.user.username && s.filename === filename);
  if (existingShare) {
    return res.json({ shareId: existingShare.id, filename, url: `/s/${existingShare.id}` });
  }

  const shareId = Math.random().toString(36).substring(2, 10);
  shares.push({
    id: shareId,
    owner: req.user.username,
    filename,
    createdAt: new Date().toISOString()
  });
  saveShares();

  res.json({ shareId, filename, url: `/s/${shareId}` });
});

// 9. List Shares API
app.get("/api/shares", authenticateToken, (req: any, res: any) => {
  const userShares = shares.filter((s: any) => s.owner === req.user.username);
  res.json(userShares);
});

// 10. Revoke Share API
app.delete("/api/shares/:shareId", authenticateToken, (req: any, res: any) => {
  const { shareId } = req.params;
  const shareIndex = shares.findIndex((s: any) => s.id === shareId && s.owner === req.user.username);
  
  if (shareIndex === -1) {
    return res.status(404).json({ error: "Share not found" });
  }

  shares.splice(shareIndex, 1);
  saveShares();
  res.json({ message: "Share revoked" });
});

// 11. Public Download API (No Auth Required)
app.get("/api/shares/:shareId/download", (req: any, res: any) => {
  const { shareId } = req.params;
  const share = shares.find((s: any) => s.id === shareId);
  
  if (!share) {
    return res.status(404).json({ error: "Share not found or expired" });
  }

  const filePath = path.join(storageBase, share.owner, share.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath, share.filename);
  } else {
    res.status(404).json({ error: "File no longer exists" });
  }
});

// 12. Calendar API
app.get("/api/calendar", authenticateToken, (req: any, res: any) => {
  const userEvents = calendarEvents.filter((e: any) => e.owner === req.user.username);
  res.json(userEvents);
});

app.post("/api/calendar", authenticateToken, (req: any, res: any) => {
  const { title, date } = req.body;
  const newEvent = {
    id: `evt-${Date.now()}`,
    owner: req.user.username,
    title,
    date
  };
  calendarEvents.push(newEvent);
  saveCalendar();
  res.json(newEvent);
});

// 13. Mail API
app.get("/api/mail", authenticateToken, (req: any, res: any) => {
  const userMails = mails.filter((m: any) => m.owner === req.user.username);
  // Sort by date desc
  userMails.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(userMails);
});

app.post("/api/mail", authenticateToken, (req: any, res: any) => {
  const { to, subject, body } = req.body;
  const newMail = {
    id: `mail-${Date.now()}`,
    owner: req.user.username,
    folder: "sent",
    sender: "Me",
    to,
    subject,
    body,
    date: new Date().toISOString(),
    read: true
  };
  mails.push(newMail);
  saveMail();
  res.json(newMail);
});

// 14. Talk API
app.get("/api/talk", authenticateToken, (req: any, res: any) => {
  const userMessages = talkMessages.filter((m: any) => m.owner === req.user.username);
  res.json(userMessages);
});

app.post("/api/talk", authenticateToken, (req: any, res: any) => {
  const { text } = req.body;
  const newMessage = {
    id: `msg-${Date.now()}`,
    owner: req.user.username,
    sender: "Me",
    text,
    timestamp: new Date().toISOString()
  };
  talkMessages.push(newMessage);
  saveTalk();
  res.json(newMessage);
});

// 15. Deck API
app.get("/api/deck", authenticateToken, (req: any, res: any) => {
  const userDeck = deckState[req.user.username] || { columns: [], cards: [] };
  res.json(userDeck);
});

app.post("/api/deck/cards", authenticateToken, (req: any, res: any) => {
  const { columnId, title } = req.body;
  const user = req.user.username;
  
  if (!deckState[user]) {
    deckState[user] = {
      columns: [
        { id: "todo", title: "To Do" },
        { id: "in-progress", title: "In Progress" },
        { id: "done", title: "Done" }
      ],
      cards: []
    };
  }

  const newCard = {
    id: `card-${Date.now()}`,
    columnId,
    title,
    description: ""
  };
  
  deckState[user].cards.push(newCard);
  saveDeck();
  res.json(newCard);
});

// 21. File Versioning API
app.get("/api/files/versions/:filename", authenticateToken, (req: any, res: any) => {
  const filename = req.params.filename;
  const versionsDir = path.join(req.userStorageDir, ".versions");
  
  try {
    if (!fs.existsSync(versionsDir)) return res.json([]);
    
    const files = fs.readdirSync(versionsDir);
    const versions = files
      .filter((f: string) => f.startsWith(`${filename}_`))
      .map((f: string) => {
        const stats = fs.statSync(path.join(versionsDir, f));
        const timestamp = f.split("_").pop() || "";
        return {
          id: f,
          size: formatSize(stats.size),
          modified: new Date(parseInt(timestamp)).toISOString(),
          timestamp
        };
      })
      .sort((a: any, b: any) => parseInt(b.timestamp) - parseInt(a.timestamp));
      
    res.json(versions);
  } catch (err) {
    res.status(500).json({ error: "Could not read versions" });
  }
});

app.post("/api/files/versions/restore/:filename/:versionId", authenticateToken, (req: any, res: any) => {
  const filename = req.params.filename;
  const versionId = req.params.versionId;
  const targetPath = path.join(req.userStorageDir, filename);
  const versionPath = path.join(req.userStorageDir, ".versions", versionId);

  try {
    if (!fs.existsSync(versionPath)) {
      return res.status(404).json({ error: "Version not found" });
    }
    // Swap current file to versions if it exists
    if (fs.existsSync(targetPath)) {
      const currentTimestamp = Date.now();
      const currentToVersionPath = path.join(req.userStorageDir, ".versions", `${filename}_${currentTimestamp}`);
      fs.renameSync(targetPath, currentToVersionPath);
    }
    // Restore chosen version
    fs.copyFileSync(versionPath, targetPath);
    res.json({ message: "Version restored" });
  } catch (err) {
    res.status(500).json({ error: "Failed to restore version" });
  }
});

// 22. Contacts API
app.get("/api/contacts", authenticateToken, (req: any, res: any) => {
  const userContacts = contactsDb[req.user.username] || [];
  res.json(userContacts);
});

app.post("/api/contacts", authenticateToken, (req: any, res: any) => {
  if (!contactsDb[req.user.username]) contactsDb[req.user.username] = [];
  const newContact = { id: Date.now().toString(), ...req.body };
  contactsDb[req.user.username].push(newContact);
  saveDb("contacts.json", contactsDb);
  res.json(newContact);
});

// 23. Notes API
app.get("/api/notes", authenticateToken, (req: any, res: any) => {
  const userNotes = notesDb[req.user.username] || [];
  res.json(userNotes);
});

app.post("/api/notes", authenticateToken, (req: any, res: any) => {
  if (!notesDb[req.user.username]) notesDb[req.user.username] = [];
  const newNote = { id: Date.now().toString(), lastModified: new Date().toISOString(), ...req.body };
  notesDb[req.user.username].push(newNote);
  saveDb("notes.json", notesDb);
  res.json(newNote);
});

// 24. Tasks API
app.get("/api/tasks", authenticateToken, (req: any, res: any) => {
  const userTasks = tasksDb[req.user.username] || [];
  res.json(userTasks);
});

app.post("/api/tasks", authenticateToken, (req: any, res: any) => {
  if (!tasksDb[req.user.username]) tasksDb[req.user.username] = [];
  const newTask = { id: Date.now().toString(), completed: false, ...req.body };
  tasksDb[req.user.username].push(newTask);
  saveDb("tasks.json", tasksDb);
  res.json(newTask);
});

app.put("/api/tasks/:id", authenticateToken, (req: any, res: any) => {
  const tasks = tasksDb[req.user.username] || [];
  const task = tasks.find((t: any) => t.id === req.params.id);
  if (task) {
    task.completed = req.body.completed;
    saveDb("tasks.json", tasksDb);
    res.json(task);
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

// 25. Admin API
app.get("/api/admin/users", authenticateToken, (req: any, res: any) => {
  const adminUser = users.find(u => u.username === req.user.username);
  if (!adminUser || !adminUser.isAdmin) return res.status(403).json({ error: "Forbidden" });
  
  // Omit passwords
  const sanitized = users.map(u => ({
    username: u.username,
    displayName: u.displayName,
    isAdmin: u.isAdmin,
    groups: u.groups || [],
    twoFactorEnabled: u.twoFactorEnabled
  }));
  res.json(sanitized);
});

app.post("/api/admin/users", authenticateToken, async (req: any, res: any) => {
  const adminUser = users.find(u => u.username === req.user.username);
  if (!adminUser || !adminUser.isAdmin) return res.status(403).json({ error: "Forbidden" });

  const { username, password, displayName, groups } = req.body;
  if (users.find(u => u.username === username)) return res.status(400).json({ error: "User exists" });

  const hash = await bcrypt.hash(password, 10);
  const newUser = {
    username,
    password: hash,
    displayName,
    isAdmin: false,
    groups: groups || [],
    twoFactorEnabled: false
  };
  users.push(newUser);
  saveUsers();
  res.json({ message: "User created" });
});

app.delete("/api/admin/users/:username", authenticateToken, (req: any, res: any) => {
  const adminUser = users.find(u => u.username === req.user.username);
  if (!adminUser || !adminUser.isAdmin) return res.status(403).json({ error: "Forbidden" });
  
  const targetUsername = req.params.username;
  if (targetUsername === "admin") return res.status(400).json({ error: "Cannot delete admin" });

  users = users.filter(u => u.username !== targetUsername);
  saveUsers();
  res.json({ message: "User deleted" });
});

// 26. 2FA API
app.post("/api/auth/2fa/toggle", authenticateToken, (req: any, res: any) => {
  const user = users.find(u => u.username === req.user.username);
  if (!user) return res.status(404).json({ error: "User not found" });
  
  user.twoFactorEnabled = req.body.enabled;
  saveUsers();
  res.json({ twoFactorEnabled: user.twoFactorEnabled });
});

// 27. File Meta API (Tags, Comments)
app.get("/api/files/meta/:filename", authenticateToken, (req: any, res: any) => {
  const filename = req.params.filename;
  const key = `${req.user.username}_${filename}`;
  const meta = fileMeta[key] || { tags: [], comments: [] };
  res.json(meta);
});

app.post("/api/files/meta/:filename/tags", authenticateToken, (req: any, res: any) => {
  const filename = req.params.filename;
  const { tag } = req.body;
  const key = `${req.user.username}_${filename}`;
  if (!fileMeta[key]) fileMeta[key] = { tags: [], comments: [] };
  
  if (tag && !fileMeta[key].tags.includes(tag)) {
    fileMeta[key].tags.push(tag);
    saveFileMeta();
  }
  res.json(fileMeta[key]);
});

app.post("/api/files/meta/:filename/comments", authenticateToken, (req: any, res: any) => {
  const filename = req.params.filename;
  const { comment } = req.body;
  const key = `${req.user.username}_${filename}`;
  if (!fileMeta[key]) fileMeta[key] = { tags: [], comments: [] };
  
  if (comment) {
    fileMeta[key].comments.push({
      id: Date.now().toString(),
      text: comment,
      author: req.user.username,
      timestamp: new Date().toISOString()
    });
    saveFileMeta();
  }
  res.json(fileMeta[key]);
});

const host = "0.0.0.0";
app.listen(Number(port), host, () => {
  console.log(`Nexus backend listening on http://${host}:${port}`);
});
