import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(root, "public");
const port = Number(process.env.PORT || 4173);
const host = "127.0.0.1";

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".avif": "image/avif",
  ".svg": "image/svg+xml"
};

const matches = [
  {
    id: "kkr-rr-2026",
    title: "Kolkata Knight Riders vs Rajasthan Royals",
    shortTitle: "KKR vs RR",
    league: "TATA IPL 2026",
    date: "Sun 19 Apr 2026",
    time: "3:30 PM",
    venue: "Eden Gardens, Kolkata",
    location: "Kolkata",
    image: "/assists/media-desktop-kolkata-knight-riders-vs-rajasthan-royals-0-2026-3-28-t-6-2-55.jpg",
    priceFrom: 1200,
    availability: "Filling Fast",
    teams: ["Kolkata Knight Riders", "Rajasthan Royals"],
    accent: "#e44878"
  },
  {
    id: "gt-csk-2026",
    title: "Gujarat Titans vs Chennai Super Kings",
    shortTitle: "GT vs CSK",
    league: "TATA IPL 2026",
    date: "Sat 18 Apr 2026",
    time: "7:30 PM",
    venue: "Narendra Modi Stadium, Ahmedabad",
    location: "Ahmedabad",
    image: "/assists/media-desktop-gujarat-titans-vs-chennai-super-kings-tata-ipl-2026-0-2026-4-5-t-11-33-13.avif",
    priceFrom: 1500,
    availability: "Only Few Left",
    teams: ["Gujarat Titans", "Chennai Super Kings"],
    accent: "#2f8fa1"
  },
  {
    id: "mi-lsg-2026",
    title: "Mumbai Indians vs Lucknow Super Giants",
    shortTitle: "MI vs LSG",
    league: "TATA IPL 2026",
    date: "Fri 17 Apr 2026",
    time: "3:30 PM",
    venue: "Wankhede Stadium, Mumbai",
    location: "Mumbai",
    image: "/assists/media-desktop-mumbai-indians-vs-lucknow-super-giants-0-2026-4-10-t-12-1-34.avif",
    priceFrom: 1000,
    availability: "Available",
    teams: ["Mumbai Indians", "Lucknow Super Giants"],
    accent: "#2f6fd6"
  },
  {
    id: "lsg-rr-2026",
    title: "Lucknow Super Giants vs Rajasthan Royals",
    shortTitle: "LSG vs RR",
    league: "TATA IPL 2026",
    date: "Tue 21 Apr 2026",
    time: "7:30 PM",
    venue: "BRSABV Ekana Stadium, Lucknow",
    location: "Lucknow",
    image: "/assists/media-desktop-lucknow-super-giants-vs-rajasthan-royals-0-2026-4-1-t-8-42-10.avif",
    priceFrom: 1800,
    availability: "Available",
    teams: ["Lucknow Super Giants", "Rajasthan Royals"],
    accent: "#7c52c8"
  },
  {
    id: "gt-rcb-2026",
    title: "Gujarat Titans vs Royal Challengers Bengaluru",
    shortTitle: "GT vs RCB",
    league: "TATA IPL 2026",
    date: "Thu 23 Apr 2026",
    time: "7:30 PM",
    venue: "Narendra Modi Stadium, Ahmedabad",
    location: "Ahmedabad",
    image: "/assists/media-desktop-gujarat-titans-vs-royal-challengers-bengaluru-tata-ipl-2026-0-2026-4-16-t-10-48-18.avif",
    priceFrom: 1200,
    availability: "Fast Filling",
    teams: ["Gujarat Titans", "Royal Challengers Bengaluru"],
    accent: "#d84d4d"
  }
];

function json(res, data, status = 200) {
  res.writeHead(status, { "Content-Type": mime[".json"] });
  res.end(JSON.stringify(data));
}

async function serveFile(res, pathname) {
  const cleanPath = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const filePath = cleanPath.startsWith("/assists/")
    ? join(root, cleanPath)
    : join(publicDir, cleanPath === "/" ? "index.html" : cleanPath);

  try {
    const data = await readFile(filePath);
    res.writeHead(200, { "Content-Type": mime[extname(filePath)] || "application/octet-stream" });
    res.end(data);
  } catch {
    const index = await readFile(join(publicDir, "index.html"));
    res.writeHead(200, { "Content-Type": mime[".html"] });
    res.end(index);
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  if (url.pathname === "/api/matches") {
    json(res, matches);
    return;
  }

  if (url.pathname.startsWith("/api/matches/")) {
    const id = url.pathname.split("/").pop();
    const match = matches.find((item) => item.id === id);
    json(res, match || { message: "Match not found" }, match ? 200 : 404);
    return;
  }

  await serveFile(res, url.pathname);
});

function listen(nextPort) {
  server.once("error", (error) => {
    if (error.code === "EADDRINUSE" && nextPort < port + 10) {
      console.log(`Port ${nextPort} is busy, trying ${nextPort + 1}...`);
      listen(nextPort + 1);
      return;
    }

    throw error;
  });

  server.listen(nextPort, host, () => {
    console.log(`IPL booking app running at http://localhost:${nextPort}`);
  });
}

listen(port);
