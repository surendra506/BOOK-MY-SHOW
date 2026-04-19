import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(root, "public");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "0.0.0.0";

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".avif": "image/avif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml"
};

const schedule = [
  [1, "28-MAR-26", "Sat", "7:30 PM", "Royal Challengers Bengaluru", "Sunrisers Hyderabad", "Bengaluru"],
  [2, "29-MAR-26", "Sun", "7:30 PM", "Mumbai Indians", "Kolkata Knight Riders", "Mumbai"],
  [3, "30-MAR-26", "Mon", "7:30 PM", "Rajasthan Royals", "Chennai Super Kings", "Guwahati"],
  [4, "31-MAR-26", "Tue", "7:30 PM", "Punjab Kings", "Gujarat Titans", "New Chandigarh"],
  [5, "01-APR-26", "Wed", "7:30 PM", "Lucknow Super Giants", "Delhi Capitals", "Lucknow"],
  [6, "02-APR-26", "Thu", "7:30 PM", "Kolkata Knight Riders", "Sunrisers Hyderabad", "Kolkata"],
  [7, "03-APR-26", "Fri", "7:30 PM", "Chennai Super Kings", "Punjab Kings", "Chennai"],
  [8, "04-APR-26", "Sat", "3:30 PM", "Delhi Capitals", "Mumbai Indians", "Delhi"],
  [9, "04-APR-26", "Sat", "7:30 PM", "Gujarat Titans", "Rajasthan Royals", "Ahmedabad"],
  [10, "05-APR-26", "Sun", "3:30 PM", "Sunrisers Hyderabad", "Lucknow Super Giants", "Hyderabad"],
  [11, "05-APR-26", "Sun", "7:30 PM", "Royal Challengers Bengaluru", "Chennai Super Kings", "Bengaluru"],
  [12, "06-APR-26", "Mon", "7:30 PM", "Kolkata Knight Riders", "Punjab Kings", "Kolkata"],
  [13, "07-APR-26", "Tue", "7:30 PM", "Rajasthan Royals", "Mumbai Indians", "Guwahati"],
  [14, "08-APR-26", "Wed", "7:30 PM", "Delhi Capitals", "Gujarat Titans", "Delhi"],
  [15, "09-APR-26", "Thu", "7:30 PM", "Kolkata Knight Riders", "Lucknow Super Giants", "Kolkata"],
  [16, "10-APR-26", "Fri", "7:30 PM", "Rajasthan Royals", "Royal Challengers Bengaluru", "Guwahati"],
  [17, "11-APR-26", "Sat", "3:30 PM", "Punjab Kings", "Sunrisers Hyderabad", "New Chandigarh"],
  [18, "11-APR-26", "Sat", "7:30 PM", "Chennai Super Kings", "Delhi Capitals", "Chennai"],
  [19, "12-APR-26", "Sun", "3:30 PM", "Lucknow Super Giants", "Gujarat Titans", "Lucknow"],
  [20, "12-APR-26", "Sun", "7:30 PM", "Mumbai Indians", "Royal Challengers Bengaluru", "Mumbai"],
  [21, "13-APR-26", "Mon", "7:30 PM", "Sunrisers Hyderabad", "Rajasthan Royals", "Hyderabad"],
  [22, "14-APR-26", "Tue", "7:30 PM", "Chennai Super Kings", "Kolkata Knight Riders", "Chennai"],
  [23, "15-APR-26", "Wed", "7:30 PM", "Royal Challengers Bengaluru", "Lucknow Super Giants", "Bengaluru"],
  [24, "16-APR-26", "Thu", "7:30 PM", "Mumbai Indians", "Punjab Kings", "Mumbai"],
  [25, "17-APR-26", "Fri", "7:30 PM", "Gujarat Titans", "Kolkata Knight Riders", "Ahmedabad"],
  [26, "18-APR-26", "Sat", "3:30 PM", "Royal Challengers Bengaluru", "Delhi Capitals", "Bengaluru"],
  [27, "18-APR-26", "Sat", "7:30 PM", "Sunrisers Hyderabad", "Chennai Super Kings", "Hyderabad"],
  [28, "19-APR-26", "Sun", "3:30 PM", "Kolkata Knight Riders", "Rajasthan Royals", "Kolkata"],
  [29, "19-APR-26", "Sun", "7:30 PM", "Punjab Kings", "Lucknow Super Giants", "New Chandigarh"],
  [30, "20-APR-26", "Mon", "7:30 PM", "Gujarat Titans", "Mumbai Indians", "Ahmedabad"],
  [31, "21-APR-26", "Tue", "7:30 PM", "Sunrisers Hyderabad", "Delhi Capitals", "Hyderabad"],
  [32, "22-APR-26", "Wed", "7:30 PM", "Lucknow Super Giants", "Rajasthan Royals", "Lucknow"],
  [33, "23-APR-26", "Thu", "7:30 PM", "Mumbai Indians", "Chennai Super Kings", "Mumbai"],
  [34, "24-APR-26", "Fri", "7:30 PM", "Royal Challengers Bengaluru", "Gujarat Titans", "Bengaluru"],
  [35, "25-APR-26", "Sat", "3:30 PM", "Delhi Capitals", "Punjab Kings", "Delhi"],
  [36, "25-APR-26", "Sat", "7:30 PM", "Rajasthan Royals", "Sunrisers Hyderabad", "Jaipur"],
  [37, "26-APR-26", "Sun", "3:30 PM", "Gujarat Titans", "Chennai Super Kings", "Ahmedabad"],
  [38, "26-APR-26", "Sun", "7:30 PM", "Lucknow Super Giants", "Kolkata Knight Riders", "Lucknow"],
  [39, "27-APR-26", "Mon", "7:30 PM", "Delhi Capitals", "Royal Challengers Bengaluru", "Delhi"],
  [40, "28-APR-26", "Tue", "7:30 PM", "Punjab Kings", "Rajasthan Royals", "New Chandigarh"],
  [41, "29-APR-26", "Wed", "7:30 PM", "Mumbai Indians", "Sunrisers Hyderabad", "Mumbai"],
  [42, "30-APR-26", "Thu", "7:30 PM", "Gujarat Titans", "Royal Challengers Bengaluru", "Ahmedabad"],
  [43, "01-MAY-26", "Fri", "7:30 PM", "Rajasthan Royals", "Delhi Capitals", "Jaipur"],
  [44, "02-MAY-26", "Sat", "7:30 PM", "Chennai Super Kings", "Mumbai Indians", "Chennai"],
  [45, "03-MAY-26", "Sun", "3:30 PM", "Sunrisers Hyderabad", "Kolkata Knight Riders", "Hyderabad"],
  [46, "03-MAY-26", "Sun", "7:30 PM", "Gujarat Titans", "Punjab Kings", "Ahmedabad"],
  [47, "04-MAY-26", "Mon", "7:30 PM", "Mumbai Indians", "Lucknow Super Giants", "Mumbai"],
  [48, "05-MAY-26", "Tue", "7:30 PM", "Delhi Capitals", "Chennai Super Kings", "Delhi"],
  [49, "06-MAY-26", "Wed", "7:30 PM", "Sunrisers Hyderabad", "Punjab Kings", "Hyderabad"],
  [50, "07-MAY-26", "Thu", "7:30 PM", "Lucknow Super Giants", "Royal Challengers Bengaluru", "Lucknow"],
  [51, "08-MAY-26", "Fri", "7:30 PM", "Delhi Capitals", "Kolkata Knight Riders", "Delhi"],
  [52, "09-MAY-26", "Sat", "7:30 PM", "Rajasthan Royals", "Gujarat Titans", "Jaipur"],
  [53, "10-MAY-26", "Sun", "3:30 PM", "Chennai Super Kings", "Lucknow Super Giants", "Chennai"],
  [54, "10-MAY-26", "Sun", "7:30 PM", "Royal Challengers Bengaluru", "Mumbai Indians", "Raipur"],
  [55, "11-MAY-26", "Mon", "7:30 PM", "Punjab Kings", "Delhi Capitals", "Dharamshala"],
  [56, "12-MAY-26", "Tue", "7:30 PM", "Gujarat Titans", "Sunrisers Hyderabad", "Ahmedabad"],
  [57, "13-MAY-26", "Wed", "7:30 PM", "Royal Challengers Bengaluru", "Kolkata Knight Riders", "Raipur"],
  [58, "14-MAY-26", "Thu", "7:30 PM", "Punjab Kings", "Mumbai Indians", "Dharamshala"],
  [59, "15-MAY-26", "Fri", "7:30 PM", "Lucknow Super Giants", "Chennai Super Kings", "Lucknow"],
  [60, "16-MAY-26", "Sat", "7:30 PM", "Kolkata Knight Riders", "Gujarat Titans", "Kolkata"],
  [61, "17-MAY-26", "Sun", "3:30 PM", "Punjab Kings", "Royal Challengers Bengaluru", "Dharamshala"],
  [62, "17-MAY-26", "Sun", "7:30 PM", "Delhi Capitals", "Rajasthan Royals", "Delhi"],
  [63, "18-MAY-26", "Mon", "7:30 PM", "Chennai Super Kings", "Sunrisers Hyderabad", "Chennai"],
  [64, "19-MAY-26", "Tue", "7:30 PM", "Rajasthan Royals", "Lucknow Super Giants", "Jaipur"],
  [65, "20-MAY-26", "Wed", "7:30 PM", "Kolkata Knight Riders", "Mumbai Indians", "Kolkata"],
  [66, "21-MAY-26", "Thu", "7:30 PM", "Chennai Super Kings", "Gujarat Titans", "Chennai"],
  [67, "22-MAY-26", "Fri", "7:30 PM", "Sunrisers Hyderabad", "Royal Challengers Bengaluru", "Hyderabad"],
  [68, "23-MAY-26", "Sat", "7:30 PM", "Lucknow Super Giants", "Punjab Kings", "Lucknow"],
  [69, "24-MAY-26", "Sun", "3:30 PM", "Mumbai Indians", "Rajasthan Royals", "Mumbai"],
  [70, "24-MAY-26", "Sun", "7:30 PM", "Kolkata Knight Riders", "Delhi Capitals", "Kolkata"]
];

const teamCodes = {
  "Chennai Super Kings": "CSK",
  "Delhi Capitals": "DC",
  "Gujarat Titans": "GT",
  "Kolkata Knight Riders": "KKR",
  "Lucknow Super Giants": "LSG",
  "Mumbai Indians": "MI",
  "Punjab Kings": "PBKS",
  "Rajasthan Royals": "RR",
  "Royal Challengers Bengaluru": "RCB",
  "Sunrisers Hyderabad": "SRH"
};

const venueByCity = {
  Ahmedabad: "Narendra Modi Stadium, Ahmedabad",
  Bengaluru: "M. Chinnaswamy Stadium, Bengaluru",
  Chennai: "M.A. Chidambaram Stadium, Chennai",
  Delhi: "Arun Jaitley Stadium, Delhi",
  Dharamshala: "HPCA Stadium, Dharamshala",
  Guwahati: "Barsapara Cricket Stadium, Guwahati",
  Hyderabad: "Rajiv Gandhi International Stadium, Hyderabad",
  Jaipur: "Sawai Mansingh Stadium, Jaipur",
  Kolkata: "Eden Gardens, Kolkata",
  Lucknow: "BRSABV Ekana Stadium, Lucknow",
  Mumbai: "Wankhede Stadium, Mumbai",
  "New Chandigarh": "Maharaja Yadavindra Singh Stadium, New Chandigarh",
  Raipur: "Shaheed Veer Narayan Singh International Stadium, Raipur"
};

const imageByTeam = {
  "Chennai Super Kings": "/assists/csk.jpeg",
  "Delhi Capitals": "/assists/dc.jpeg",
  "Gujarat Titans": "/assists/gt.jpeg",
  "Kolkata Knight Riders": "/assists/kkr.webp",
  "Lucknow Super Giants": "/assists/lsg.jpeg",
  "Mumbai Indians": "/assists/mi.jpeg",
  "Punjab Kings": "/assists/punjba.jpeg",
  "Rajasthan Royals": "/assists/rr.jpeg",
  "Royal Challengers Bengaluru": "/assists/rcb.jpeg",
  "Sunrisers Hyderabad": "/assists/srh.jpeg"
};

const priceByCity = {
  Ahmedabad: 1200,
  Bengaluru: 1500,
  Chennai: 1300,
  Delhi: 1000,
  Dharamshala: 900,
  Guwahati: 800,
  Hyderabad: 1100,
  Jaipur: 900,
  Kolkata: 1200,
  Lucknow: 1000,
  Mumbai: 1500,
  "New Chandigarh": 900,
  Raipur: 750
};

const monthIndex = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11
};

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function parseScheduleDate(date) {
  const [day, month, year] = date.split("-");
  return new Date(2000 + Number(year), monthIndex[month], Number(day));
}

function formatDate(dayName, date) {
  const [day, month, year] = date.split("-");
  const label = new Date(2000 + Number(year), monthIndex[month], Number(day)).toLocaleString("en-IN", {
    month: "short"
  });
  return `${dayName} ${Number(day)} ${label} ${2000 + Number(year)}`;
}

function todayStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function availabilityFor(matchNo) {
  if (matchNo % 7 === 0) return "Only Few Left";
  if (matchNo % 5 === 0) return "Fast Filling";
  if (matchNo % 3 === 0) return "Filling Fast";
  return "Available";
}

const matches = schedule.map(([matchNo, rawDate, day, time, home, away, city]) => ({
  id: `match-${matchNo}-${slug(home)}-vs-${slug(away)}`,
  matchNo,
  title: `${home} vs ${away}`,
  shortTitle: `${teamCodes[home]} vs ${teamCodes[away]}`,
  league: "TATA IPL 2026",
  date: formatDate(day, rawDate),
  rawDate,
  time,
  venue: venueByCity[city] || city,
  location: city,
  image: imageByTeam[home] || imageByTeam[away] || "/assists/dashboard.avif",
  priceFrom: priceByCity[city] || 1000,
  availability: availabilityFor(matchNo),
  teams: [home, away],
  accent: matchNo % 2 === 0 ? "#e44878" : "#2f8fa1",
  startsAt: parseScheduleDate(rawDate).toISOString()
}));

function upcomingMatches() {
  const today = todayStart();
  return matches.filter((match) => parseScheduleDate(match.rawDate) >= today);
}

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
    res.writeHead(200, { 
       "Content-Type": mime[extname(filePath)] || "application/octet-stream",
       "Cache-Control": "no-cache, no-store, must-revalidate"
    });
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
    json(res, upcomingMatches());
    return;
  }

  if (url.pathname.startsWith("/api/matches/")) {
    const id = url.pathname.split("/").pop();
    const match = upcomingMatches().find((item) => item.id === id);
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
    const urlHost = host === "0.0.0.0" ? "localhost" : host;
    console.log(`IPL booking app running at http://${urlHost}:${nextPort}`);
  });
}

listen(port);
