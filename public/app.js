const app = document.querySelector("#app");

const state = {
  route: parseRoute(),
  matches: [],
  selectedMatch: null,
  selectedCategory: null,
  selectedSeats: 2,
  showSeatModal: false,
  showLayoutZoom: false,
  bookingRef: null,
  search: "",
  city: "All Cities",
  page: 1,
  pageSize: 12,
  filters: {
    category: "cricket",
    date: "all",
    time: "all",
    price: "all",
    venue: "all",
    team: "all"
  },
  ui: {
    filterOpen: {
      categories: true,
      date: false,
      more: false,
      price: false
    },
    pickupExpanded: false
  },
  customer: {
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: ""
  }
};

const categories = [
  { id: "1000", label: "B Block Upper", stand: "B Block", price: 1000, color: "#3f91a6", left: 42 },
  { id: "1200", label: "J Block Olivol Pavilion", stand: "J Block", price: 1200, color: "#e44878", left: 28 },
  { id: "1500", label: "D Block Clubhouse", stand: "D Block", price: 1500, color: "#2b7892", left: 36 },
  { id: "1800", label: "Club House Lower Tier", stand: "Club House", price: 1800, color: "#8550bf", left: 18 },
  { id: "3000", label: "Club House Upper Tier", stand: "Club House", price: 3000, color: "#e9953e", left: 12 },
  { id: "3300", label: "F1 Block Jio Pavilion", stand: "F1 Block", price: 3300, color: "#d84482", left: 10 },
  { id: "3500", label: "E Block BK Tyres Pavilion", stand: "E Block", price: 3500, color: "#4599ad", left: 8 },
  { id: "4000", label: "B1 Block Premium", stand: "B1 Block", price: 4000, color: "#61b6e2", left: 6 },
  { id: "8000", label: "Corporate Box", stand: "Corporate", price: 8000, color: "#8e61c8", left: 4 },
  { id: "60000", label: "VIP Hospitality Suite", stand: "Suite", price: 60000, color: "#d45762", left: 2 }
];

const sponsors = ["TATA", "Angel One", "RuPay", "CEAT", "My11Circle"];
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

function parseRawDate(rawDate) {
  const [day, month, year] = String(rawDate || "").split("-");
  return new Date(2000 + Number(year), monthIndex[month], Number(day));
}

function todayRawDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = Object.entries(monthIndex).find(([, index]) => index === today.getMonth())?.[0] || "JAN";
  const year = String(today.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}

window.addEventListener("popstate", () => {
  state.route = parseRoute();
  render();
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const { action, id, value } = target.dataset;
  if (target.closest("summary")) event.preventDefault();
  if (action === "home") navigate("/");
  if (action === "details") navigate(`/match/${id}`);
  if (action === "startSeats") startSeatSelection(id);
  if (action === "selectCategory") openSeatModal(id);
  if (action === "closeModal") closeSeatModal();
  if (action === "openLayoutZoom") openLayoutZoom();
  if (action === "closeLayoutZoom") closeLayoutZoom();
  if (action === "seatCount") setSeatCount(Number(value));
  if (action === "continueSeats") confirmSeatCount();
  if (action === "proceedCheckout") continueToTicketMode();
  if (action === "pay") completeBooking();
  if (action === "reset") navigate("/");
  if (action === "viewAllMatches") navigate("/matches");
  if (action === "setFilter") {
    const key = target.dataset.filter;
    const next = target.dataset.value ?? "all";
    if (!key) return;
    state.filters[key] = next;
    state.page = 1;
    const section = target.dataset.section;
    if (section && state.ui?.filterOpen) state.ui.filterOpen[section] = true;
    render();
  }
  if (action === "clearSection") {
    const section = target.dataset.section;
    if (section === "categories") state.filters.category = "cricket";
    if (section === "date") state.filters.date = "all";
    if (section === "price") state.filters.price = "all";
    if (section === "more") {
      state.filters.time = "all";
      state.filters.venue = "all";
    }
    state.page = 1;
    if (section && state.ui?.filterOpen) state.ui.filterOpen[section] = true;
    render();
  }
  if (action === "browseVenues") {
    if (state.ui?.filterOpen) state.ui.filterOpen.more = true;
    render();
  }
  if (action === "page") {
    state.page = Number(value);
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  if (action === "togglePickupInfo") {
    if (state.ui) state.ui.pickupExpanded = !state.ui.pickupExpanded;
    render();
  }
  if (action === "clearFilters") {
    state.city = "All Cities";
    state.search = "";
    state.page = 1;
    state.filters = { category: "cricket", date: "all", time: "all", price: "all", venue: "all", team: "all" };
    render();
  }
});

document.addEventListener("toggle", (event) => {
  const details = event.target;
  if (!details || !(details instanceof HTMLDetailsElement)) return;
  if (!details.matches(".filter-section[data-filter-section]")) return;
  const key = details.dataset.filterSection;
  if (!key || !state.ui?.filterOpen) return;
  state.ui.filterOpen[key] = details.open;
});

document.addEventListener("input", (event) => {
  if (event.target.matches("[data-search]")) {
    const input = event.target;
    const value = input.value;
    const selectionStart = input.selectionStart;
    const selectionEnd = input.selectionEnd;
    state.search = value;
    state.page = 1;
    render();
    const next = document.querySelector("[data-search]");
    if (next && next instanceof HTMLInputElement) {
      next.focus();
      if (selectionStart !== null && selectionEnd !== null) {
        next.setSelectionRange(selectionStart, selectionEnd);
      }
    }
  }

  if (event.target.matches("[data-customer]")) {
    state.customer[event.target.dataset.customer] = event.target.value;
  }
});

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-city]")) {
    state.city = event.target.value;
    state.page = 1;
    render();
  }

  if (event.target.matches("[data-filter]")) {
    state.filters[event.target.dataset.filter] = event.target.value;
    state.page = 1;
    render();
  }
});

// Centralized <img> fallback handler (avoids inline onerror, which some deployments block via CSP).
document.addEventListener("error", (event) => {
  const img = event.target;
  if (!(img instanceof HTMLImageElement)) return;

  const rawFallbacks = img.dataset.fallback || "";
  const fallbacks = rawFallbacks.split("|").map((s) => s.trim()).filter(Boolean);
  const next = fallbacks.shift();
  if (next) {
    img.dataset.fallback = fallbacks.join("|");
    img.src = next;
    return;
  }

  img.style.display = "none";
  const fb = img.nextElementSibling;
  if (fb && fb instanceof HTMLElement) {
    fb.style.display = fb.dataset.show || "flex";
  }
}, true);

async function init() {
  const response = await fetch("/api/matches");
  state.matches = await response.json();
  render();
}

function parseRoute() {
  const parts = location.pathname.split("/").filter(Boolean);
  return { page: parts[0] || "home", id: parts[1] || null };
}

function navigate(path) {
  history.pushState({}, "", path);
  state.route = parseRoute();
  state.showSeatModal = false;
  render();
}

function startSeatSelection(matchId) {
  history.pushState({}, "", `/seats/${matchId}`);
  state.route = parseRoute();
  state.selectedCategory = categories[1];
  state.selectedSeats = 2;
  state.showSeatModal = true;
  render();
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function getMatch() {
  return state.matches.find((match) => match.id === state.route.id) || state.matches[0];
}

function getAvailability(categoryId) {
  const key = `booked:${state.route.id}:${categoryId}`;
  const booked = Number(localStorage.getItem(key) || 0);
  const category = categories.find((item) => item.id === categoryId);
  return Math.max((category?.left || 0) - booked, 0);
}

function openSeatModal(categoryId) {
  const category = categories.find((item) => item.id === categoryId);
  if (!category || getAvailability(categoryId) <= 0) return;
  state.selectedCategory = category;
  state.selectedSeats = Math.min(state.selectedSeats, getAvailability(categoryId), 10);
  state.showSeatModal = true;
  render();
}

function closeSeatModal() {
  state.showSeatModal = false;
  render();
}

function openLayoutZoom() {
  state.showLayoutZoom = true;
  render();
}

function closeLayoutZoom() {
  state.showLayoutZoom = false;
  render();
}

function setSeatCount(count) {
  const available = getAvailability(state.selectedCategory.id);
  state.selectedSeats = Math.min(count, available, 10);
  render();
}

function confirmSeatCount() {
  state.showSeatModal = false;
  render();
}

function continueToTicketMode() {
  state.showSeatModal = false;
  navigate(`/checkout/${state.route.id}`);
}

function completeBooking() {
  const email = (state.customer.email || "").trim();
  const phone = (state.customer.phone || "").trim();
  if (!email || !phone) {
    alert("Please enter your email and mobile number where the ticket will be sent.");
    return;
  }

  const key = `booked:${state.route.id}:${state.selectedCategory.id}`;
  localStorage.setItem(key, String(Number(localStorage.getItem(key) || 0) + state.selectedSeats));
  state.bookingRef = `IPL${Date.now().toString().slice(-6)}`;
  renderConfirmation();
}

function filteredMatches() {
  const q = state.search.trim().toLowerCase();
  return state.matches.filter((match) => {
    const cityMatch = state.city === "All Cities" || match.location === state.city;
    const searchText = [
      match.matchNo,
      match.title,
      match.shortTitle,
      ...(match.teams || []),
      match.venue,
      match.location,
      match.league,
      match.date,
      match.time
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const searchMatch = !q || searchText.includes(q);
    const categoryMatch = matchesCategoryFilter(match);
    const dateMatch = matchesDateFilter(match);
    const timeMatch = matchesTimeFilter(match);
    const priceMatch = matchesPriceFilter(match);
    const venueMatch = matchesVenueFilter(match);
    const teamMatch = matchesTeamFilter(match);
    return cityMatch && searchMatch && categoryMatch && dateMatch && timeMatch && priceMatch && venueMatch && teamMatch;
  });
}

function matchesCategoryFilter(match) {
  // This app currently lists only cricket events; keep the hook for future categories.
  if (state.filters.category === "all") return true;
  if (state.filters.category === "cricket") return true;
  return true;
}

function matchesDateFilter(match) {
  if (state.filters.date === "all") return true;
  if (state.filters.date === "today") return match.rawDate === todayRawDate();
  if (state.filters.date === "weekend") {
    const day = parseRawDate(match.rawDate).getDay();
    return day === 0 || day === 6;
  }
  if (state.filters.date === "apr") return parseRawDate(match.rawDate).getMonth() === 3;
  if (state.filters.date === "may") return parseRawDate(match.rawDate).getMonth() === 4;
  return true;
}

function matchesTimeFilter(match) {
  if (state.filters.time === "all") return true;
  if (state.filters.time === "afternoon") return match.time === "3:30 PM";
  if (state.filters.time === "evening") return match.time === "7:30 PM";
  return true;
}

function matchesPriceFilter(match) {
  if (state.filters.price === "all") return true;
  if (state.filters.price === "under1000") return match.priceFrom < 1000;
  if (state.filters.price === "1000to1300") return match.priceFrom >= 1000 && match.priceFrom <= 1300;
  if (state.filters.price === "above1300") return match.priceFrom > 1300;
  return true;
}

function matchesVenueFilter(match) {
  if (state.filters.venue === "all") return true;
  return match.venue === state.filters.venue;
}

function matchesTeamFilter(match) {
  if (state.filters.team === "all") return true;
  return match.teams?.includes(state.filters.team);
}

function header() {
  const cities = ["All Cities", ...new Set(state.matches.map((match) => match.location))].sort((a, b) => {
    if (a === "All Cities") return -1;
    if (b === "All Cities") return 1;
    return a.localeCompare(b);
  });

  return `
    <div class="site-header">
      <header class="topbar">
        <button class="brand" data-action="home" aria-label="Go home">
          <span>book</span><strong>my</strong><span>show</span>
        </button>
        <label class="search">
          <span>Search</span>
          <input data-search value="${state.search}" />
        </label>
        <select class="city-select" data-city aria-label="Filter by city">
          ${cities.map((city) => (
            `<option ${state.city === city ? "selected" : ""}>${city}</option>`
          )).join("")}
        </select>
      </header>
    </div>
  `;
}

function renderHome() {
  const matches = filteredMatches();
  const totalPages = Math.max(1, Math.ceil(matches.length / state.pageSize));
  if (state.page > totalPages) state.page = totalPages;
  const start = (state.page - 1) * state.pageSize;
  const cards = matches.slice(start, start + state.pageSize);
  app.innerHTML = `
    ${header()}
    <main class="home-page explore-page">
      <section class="explore-banner">
        <img src="/assists/dashboard.avif" alt="TATA IPL 2026 dashboard banner" />
      </section>
      <section class="explore-shell">
        <aside class="filters-panel">
          ${filtersPanel()}
        </aside>
        <div class="sports-listing">
          <div class="sports-heading">
            <div>
            </div>
            <div>
              <button class="view-all-matches" data-action="viewAllMatches" type="button">View All Matches</button>
            </div>
          </div>
          <div class="sports-grid">
            ${cards.map(sportsCard).join("") || emptyState()}
          </div>
          ${pagination(totalPages, matches.length)}
        </div>
      </section>
      <section class="info-panel">
        <p>Home → Sports</p>
        <h2>Online Information of Sporting Events On BookMyShow</h2>
        <p>BookMyShow brings cricket fans closer to the biggest TATA IPL 2026 matches with quick discovery, venue details, ticket categories, and an easy booking journey. The dashboard helps users compare upcoming fixtures, check stadium locations, view starting prices, and move directly into the ticket booking flow.</p>
        <h2>Witness Your Team in Different Sports Events</h2>
        <p>Whether it is Kolkata Knight Riders, Rajasthan Royals, Gujarat Titans, Mumbai Indians, Chennai Super Kings, or Lucknow Super Giants, every listing gives fans a quick view of the match, venue, ticket price, and availability. Users can open any event card to continue into the event details, stadium layout, seat quantity popup, pickup mode, and payment confirmation.</p>
        <h2>Book Tickets With A Smooth Match-Day Flow</h2>
        <p>The booking experience is designed to feel simple and familiar. Select a match, choose a ticket category from the stadium layout, confirm how many seats you need, review the box office pickup instructions, and proceed with the final booking confirmation.</p>
        <h2>Stay Up To Date With IPL Ticket Availability</h2>
        <p>Keep checking the dashboard for upcoming fixtures, venue updates, fast-filling ticket categories, and the latest match-day options across your selected city.</p>
      </section>
      <section class="sponsor-strip">
        <div class="sponsor-stack">
          <p>OFFICIAL BROADCASTER</p>
          <strong class="logo-star">Star Sports</strong>
        </div>
        <div class="sponsor-stack">
          <p>TITLE SPONSOR</p>
          <strong class="logo-tata">TATA</strong>
        </div>
        <div class="sponsor-stack">
          <p>OFFICIAL DIGITAL STREAMING PARTNER</p>
          <strong class="logo-jio">JioHotstar</strong>
        </div>
        <div class="sponsor-stack associate">
          <p>ASSOCIATE PARTNER</p>
          <div>
            <strong>MY11CIRCLE</strong>
            <strong>AngelOne</strong>
            <strong>RuPay</strong>
          </div>
        </div>
        <div class="sponsor-bottom">
          <div class="sponsor-stack">
            <p>OFFICIAL UMPIRE PARTNER</p>
            <strong>WONDER<br />CEMENT</strong>
          </div>
          <div class="sponsor-stack">
            <p>OFFICIAL STRATEGIC TIMEOUT PARTNER</p>
            <strong class="logo-ceat">CEAT</strong>
          </div>
        </div>
      </section>
    </main>
  `;
}

function renderAllMatches() {
  const matches = filteredMatches();
  const teamMap = teamCodeMap(state.matches);
  const teams = ["all", ...new Set(state.matches.flatMap((match) => match.teams || []))].sort((a, b) => {
    if (a === "all") return -1;
    if (b === "all") return 1;
    return a.localeCompare(b);
  });

  app.innerHTML = `
    ${header()}
    <main class="matches-page">
      <section class="matches-banner">
        <img src="/assists/dashboard.avif" alt="TATA IPL 2026 matches banner" />
      </section>
      <section class="matches-shell">
        <div class="matches-feed">
          <div class="matches-head">
            <div>
              <h1>All Upcoming Matches</h1>
              <p>${matches.length} match(es) found based on your filters. Click any match to view details.</p>
            </div>
            <button class="view-all-matches secondary" data-action="home" type="button">Back</button>
          </div>
          <div class="matches-list">
            ${matches.map(allMatchesCard).join("") || emptyState()}
          </div>
        </div>
        <aside class="teams-rail" aria-label="Teams">
          <h2>Teams</h2>
          <div class="teams-grid">
            ${teams.map((team) => team === "all"
              ? teamChip({ label: "All", value: "all", active: state.filters.team === "all" })
              : teamChip({
                  label: teamMap[team] || team.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase(),
                  value: team,
                  active: state.filters.team === team,
                  subtitle: team
                })
            ).join("")}
          </div>
        </aside>
      </section>
    </main>
  `;
}

function allMatchesCard(match) {
  const teamMap = teamCodeMap(state.matches);
  const homeCode = teamCodeForName(match.teams?.[0], teamMap);
  const awayCode = teamCodeForName(match.teams?.[1], teamMap);
  return `
    <article class="match-row" data-action="details" data-id="${match.id}">
      <div class="match-row-top">
        <div class="match-row-titlewrap">
          ${homeCode ? teamLogoInline(homeCode) : ""}
          ${awayCode ? teamLogoInline(awayCode) : ""}
          <strong class="match-row-title">${match.shortTitle || match.title}</strong>
        </div>
        <span class="match-row-date">${match.date} • ${match.time}</span>
      </div>
      <div class="match-row-meta">
        <span><b>Home:</b> ${match.teams?.[0] || "-"}</span>
        <span><b>Away:</b> ${match.teams?.[1] || "-"}</span>
        <span><b>Venue:</b> ${match.venue}</span>
      </div>
      <div class="match-row-bottom">
        <span class="match-row-pill">Match ${match.matchNo}</span>
        <span class="match-row-price">${money(match.priceFrom)} onwards</span>
        <span class="match-row-availability">${match.availability || "Available"} tickets</span>
      </div>
    </article>
  `;
}

function teamChip({ label, value, active, subtitle }) {
  const logo = subtitle ? teamLogoBlock(label) : `<span class="team-logo-fallback">${escapeHtml(label)}</span>`;
  return `
    <button
      type="button"
      class="team-chip ${active ? "active" : ""}"
      data-action="setFilter"
      data-filter="team"
      data-value="${escapeHtmlAttr(value)}"
      title="${subtitle ? escapeHtmlAttr(subtitle) : ""}"
      aria-pressed="${active ? "true" : "false"}"
    >
      <div class="team-chip-top">
        <span class="team-logo-wrap" aria-hidden="true">
          ${logo}
        </span>
        <span class="team-chip-code">${escapeHtml(label)}</span>
      </div>
      ${subtitle ? `<span class="team-chip-name">${escapeHtml(subtitle)}</span>` : ""}
    </button>
  `;
}

function teamLogoBlock(code) {
  const [src, ...fallbacks] = teamLogoCandidates(code);
  const fallbackAttr = fallbacks.length ? ` data-fallback="${escapeHtmlAttr(fallbacks.join("|"))}"` : "";
  return `
    <img class="team-logo" src="${escapeHtmlAttr(src)}" alt="" loading="lazy" decoding="async"${fallbackAttr} />
    <span class="team-logo-fallback" data-show="flex" style="display:none">${escapeHtml(code)}</span>
  `;
}

function teamLogoInline(code) {
  const [src, ...fallbacks] = teamLogoCandidates(code);
  const fallbackAttr = fallbacks.length ? ` data-fallback="${escapeHtmlAttr(fallbacks.join("|"))}"` : "";
  return `
    <span class="team-mini" aria-hidden="true">
      <img class="team-mini-logo" src="${escapeHtmlAttr(src)}" alt="" loading="lazy" decoding="async"${fallbackAttr} />
      <span class="team-mini-fallback" data-show="inline-flex" style="display:none">${escapeHtml(code)}</span>
    </span>
  `;
}

function teamLogoBadge(code, size = "sm") {
  const [src, ...fallbacks] = teamLogoCandidates(code);
  const fallbackAttr = fallbacks.length ? ` data-fallback="${escapeHtmlAttr(fallbacks.join("|"))}"` : "";

  return `
    <span class="team-badge team-badge--${escapeHtmlAttr(size)}" aria-hidden="true">
      <img class="team-badge-img" src="${escapeHtmlAttr(src)}" alt="" loading="lazy" decoding="async"${fallbackAttr} />
      <span class="team-badge-fallback" data-show="flex" style="display:none">${escapeHtml(code)}</span>
    </span>
  `;
}

function matchHero({ homeCode, awayCode, bg, title, variant }) {
  if ((variant || "card") === "card") {
    return `
      <div class="match-hero match-hero--card"${bg ? ` style="--hero-bg: url('${escapeHtmlAttr(bg)}')"` : ""} aria-label="${escapeHtmlAttr(title || "")}"></div>
    `;
  }

  const home = homeCode || "";
  const away = awayCode || "";
  const bgStyle = "";
  const singleSrc = bg || teamLogoCandidates(home)[0] || teamLogoCandidates(away)[0] || "";
  const fallbackCandidates = [
    ...teamLogoCandidates(home),
    ...teamLogoCandidates(away),
    "/assists/dashboard.avif"
  ].filter(Boolean);
  const [, ...fallbacks] = fallbackCandidates.filter((src, index, arr) => arr.indexOf(src) === index);
  const fallbackAttr = fallbacks.length ? ` data-fallback="${escapeHtmlAttr(fallbacks.join("|"))}"` : "";
  return `
    <div class="match-hero match-hero--${escapeHtmlAttr(variant || "card")} match-hero--no-bg"${bgStyle} aria-label="${escapeHtmlAttr(title || "")}">
      <div class="match-hero-single">
        ${singleSrc
          ? `<img class="match-hero-single-img" src="${escapeHtmlAttr(singleSrc)}" alt="" loading="lazy" decoding="async"${fallbackAttr} />`
          : `<span class="match-hero-fallback" data-show="flex">${escapeHtml(home || away || "IPL")}</span>`}
      </div>
    </div>
  `;
}

function teamHeroImage(code) {
  if (!code) return `<span class="match-hero-fallback">?</span>`;
  const [src, ...fallbacks] = teamLogoCandidates(code);
  const fallbackAttr = fallbacks.length ? ` data-fallback="${escapeHtmlAttr(fallbacks.join("|"))}"` : "";
  return `
    <img class="match-hero-team-img" src="${escapeHtmlAttr(src)}" alt="" loading="lazy" decoding="async"${fallbackAttr} />
    <span class="match-hero-fallback" data-show="flex" style="display:none">${escapeHtml(code)}</span>
  `;
}

function teamLogoCandidates(code) {
  const normalized = String(code || "").trim().toLowerCase();
  const candidates = [];
  // Preferred folder.
  for (const ext of ["png", "svg", "webp", "jpg", "jpeg"]) {
    candidates.push(`/assists/team-logos/${normalized}.${ext}`);
  }
  // Your existing files already present in /assists (rcb.jpeg, mi.jpeg, etc).
  for (const ext of ["png", "svg", "webp", "jpg", "jpeg"]) {
    candidates.push(`/assists/${normalized}.${ext}`);
  }
  // Punjab special-case: file name is "punjba.jpeg" in your repo.
  if (normalized === "pbks") {
    candidates.push("/assists/punjba.jpeg", "/assists/punjab.jpeg", "/assists/pbks.jpeg");
  }
  return candidates;
}

function teamCodeForName(teamName, map) {
  if (!teamName) return "";
  const fromMap = map?.[teamName];
  if (fromMap) return fromMap;
  return teamName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 4)
    .toUpperCase();
}

function teamCodeMap(matches) {
  const map = {};
  for (const match of matches || []) {
    if (!match?.shortTitle || !Array.isArray(match.teams) || match.teams.length < 2) continue;
    const parts = match.shortTitle.split(" vs ").map((p) => p.trim()).filter(Boolean);
    if (parts.length !== 2) continue;
    map[match.teams[0]] = parts[0];
    map[match.teams[1]] = parts[1];
  }
  return map;
}

function filtersPanel() {
  const venueOptions = ["all", ...new Set(state.matches.map((match) => match.venue))].sort((a, b) => a.localeCompare(b));

  return `
    <h2>Filters</h2>
    ${filterAccordionSection({
      id: "categories",
      title: "Categories",
      open: !!state.ui?.filterOpen?.categories,
      body: filterChips("category", "categories", [
        ["cricket", "Cricket"]
      ])
    })}
    ${filterAccordionSection({
      id: "date",
      title: "Date",
      open: !!state.ui?.filterOpen?.date,
      body: filterChips("date", "date", [
        ["all", "All Dates"],
        ["today", "Today"],
        ["weekend", "Weekend"],
        ["apr", "April"],
        ["may", "May"]
      ])
    })}
    ${filterAccordionSection({
      id: "more",
      title: "More Filters",
      open: !!state.ui?.filterOpen?.more,
      body: `
        <div class="filter-subtitle">Time</div>
        <div class="filter-chip-row">
          ${filterChips("time", "more", [
            ["all", "All Times"],
            ["afternoon", "3:30 PM"],
            ["evening", "7:30 PM"]
          ])}
        </div>
        <div class="filter-subtitle">Venue</div>
        <select class="filter-select" data-filter="venue" aria-label="Filter by venue">
          ${venueOptions.map((venue) => (
            `<option value="${escapeHtmlAttr(venue)}" ${state.filters.venue === venue ? "selected" : ""}>${venue === "all" ? "All Venues" : escapeHtml(venue)}</option>`
          )).join("")}
        </select>
      `
    })}
    ${filterAccordionSection({
      id: "price",
      title: "Price",
      open: !!state.ui?.filterOpen?.price,
      body: filterChips("price", "price", [
        ["all", "All Prices"],
        ["under1000", "Below ₹1000"],
        ["1000to1300", "₹1000 - ₹1300"],
        ["above1300", "Above ₹1300"]
      ])
    })}
    <button class="browse-button" type="button" data-action="browseVenues">Browse by Venues</button>
  `;
}

function filterAccordionSection({ id, title, body, open }) {
  return `
    <details class="filter-section" data-filter-section="${id}" ${open ? "open" : ""}>
      <summary>
        <span class="filter-summary-left">
          <span class="filter-caret" aria-hidden="true"></span>
          <span class="filter-title">${title}</span>
        </span>
        <button class="filter-clear" type="button" data-action="clearSection" data-section="${id}">Clear</button>
      </summary>
      <div class="filter-body">
        ${body}
      </div>
    </details>
  `;
}

function filterChips(key, section, options) {
  return options.map(([value, label]) => `
    <button
      type="button"
      class="filter-chip ${state.filters[key] === value ? "active" : ""}"
      data-action="setFilter"
      data-filter="${key}"
      data-value="${value}"
      data-section="${section}"
    >${label}</button>
  `).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeHtmlAttr(value) {
  return escapeHtml(value).replaceAll("\n", " ");
}

function filterBlock(title, value, action) {
  return `
    <div class="filter-block">
      <div>
        <strong>${title}</strong>
        <button>${action}</button>
      </div>
      <span>${value}</span>
    </div>
  `;
}

function filterSelect(title, key, options) {
  return `
    <label class="filter-block">
      <div>
        <strong>${title}</strong>
      </div>
      <select data-filter="${key}">
        ${options.map(([value, label]) => `<option value="${value}" ${state.filters[key] === value ? "selected" : ""}>${label}</option>`).join("")}
      </select>
    </label>
  `;
}

function pagination(totalPages, totalMatches) {
  if (totalMatches === 0) return "";

  return `
    <nav class="pagination" aria-label="Match pagination">
      <button data-action="page" data-value="${Math.max(1, state.page - 1)}" ${state.page === 1 ? "disabled" : ""}>Previous</button>
      ${Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => `
        <button class="${state.page === page ? "active" : ""}" data-action="page" data-value="${page}">${page}</button>
      `).join("")}
      <button data-action="page" data-value="${Math.min(totalPages, state.page + 1)}" ${state.page === totalPages ? "disabled" : ""}>Next</button>
    </nav>
  `;
}

function cardDateLabel(match) {
  const date = parseRawDate(match?.rawDate);
  if (!(date instanceof Date) || Number.isNaN(date.valueOf())) return match?.date || "";
  const weekday = date.toLocaleString("en-IN", { weekday: "short" });
  const month = date.toLocaleString("en-IN", { month: "short" });
  return `${weekday}, ${date.getDate()} ${month}`;
}

function sportsCard(match) {
  const teamMap = teamCodeMap(state.matches);
  const homeName = match.teams?.[0] || "";
  const awayName = match.teams?.[1] || "";
  const homeCode = teamCodeForName(homeName, teamMap);
  const awayCode = teamCodeForName(awayName, teamMap);
  const promoted = match.matchNo % 9 === 0;
  return `
    <article class="sports-card" data-action="details" data-id="${match.id}">
      <div class="sports-card-media">
        ${matchHero({ homeCode, awayCode, bg: match.image, title: match.shortTitle || match.title, variant: "card" })}
        ${promoted ? `<span class="sports-card-badge">PROMOTED</span>` : ""}
        <div class="sports-card-date">${escapeHtml(cardDateLabel(match))}</div>
      </div>
      <div class="sports-card-body">
        <strong title="${escapeHtmlAttr(match.title)}">${escapeHtml((match.shortTitle || match.title || "").toUpperCase())}</strong>
        <p>${escapeHtml(match.venue || match.location || "")}</p>
        <small>T20</small>
        <span>${money(match.priceFrom)} onwards</span>
      </div>
    </article>
  `;
}

function matchCard(match) {
  return `
    <article class="match-card">
      <div class="date-ribbon">
        <span>${match.date}</span>
        <strong>${match.time}</strong>
      </div>
      <div class="teams">
        <div><span class="team-badge">${match.teams[0].split(" ").map((x) => x[0]).join("").slice(0, 3)}</span><p>${match.teams[0]}</p></div>
        <strong>VS</strong>
        <div><span class="team-badge alt">${match.teams[1].split(" ").map((x) => x[0]).join("").slice(0, 3)}</span><p>${match.teams[1]}</p></div>
      </div>
      <div class="match-meta">
        <span>${match.venue}</span>
        <span class="status">${match.availability}</span>
      </div>
      <button class="primary full" data-action="details" data-id="${match.id}">Book Tickets</button>
    </article>
  `;
}

function emptyState() {
  return `<div class="empty">No matches found. Try another city or search term.</div>`;
}

function renderDetails() {
  const match = getMatch();
  const related = state.matches.filter((item) => item.id !== match.id).slice(0, 4);
  const teamMap = teamCodeMap(state.matches);
  const homeName = match.teams?.[0] || "";
  const awayName = match.teams?.[1] || "";
  const homeCode = teamCodeForName(homeName, teamMap);
  const awayCode = teamCodeForName(awayName, teamMap);

  app.innerHTML = `
    ${header()}
    <main class="detail-page">
      <section class="event-layout">
        <div>
          <button class="back-link" data-action="home">Back to matches</button>
          <h1>${match.title} - ${match.league}</h1>
          <div class="event-teams" aria-label="Teams playing">
            <div class="event-team">
              ${homeCode ? teamLogoBadge(homeCode, "lg") : ""}
              <div class="event-team-meta">
                <strong>${escapeHtml(homeCode || "HOME")}</strong>
                <span>${escapeHtml(homeName)}</span>
              </div>
            </div>
            <span class="event-vs" aria-hidden="true">vs</span>
            <div class="event-team">
              ${awayCode ? teamLogoBadge(awayCode, "lg") : ""}
              <div class="event-team-meta">
                <strong>${escapeHtml(awayCode || "AWAY")}</strong>
                <span>${escapeHtml(awayName)}</span>
              </div>
            </div>
          </div>
          ${matchHero({ homeCode, awayCode, bg: match.image, title: match.title, variant: "detail" })}
          <div class="score-row">
            <span>${match.availability}</span>
            <span>Cricket</span>
            <span>Family friendly</span>
          </div>
          <h2>About The Event</h2>
          <p class="body-copy">Get ready for an electric IPL night as ${match.teams[0]} take on ${match.teams[1]} at ${match.venue}. Choose your preferred stand, confirm the ticket mode, and finish your booking in a few quick steps.</p>
          <div class="detail-links">
            <a>Event Terms</a>
            <a>Layout Map</a>
            <a>Box Office Pickup</a>
          </div>
        </div>
        <aside class="booking-panel">
          <div class="booking-teams" aria-hidden="true">
            ${homeCode ? teamLogoBadge(homeCode, "sm") : ""}
            <span class="booking-vs">vs</span>
            ${awayCode ? teamLogoBadge(awayCode, "sm") : ""}
          </div>
          <p>${match.date}</p>
          <p>${match.time}</p>
          <p>${match.venue}</p>
          <div class="price-box">
            <span>Ticket price starting at</span>
            <strong>${money(match.priceFrom)}</strong>
          </div>
          <button class="primary full" data-action="startSeats" data-id="${match.id}">Book Now</button>
        </aside>
      </section>
      <section class="content-band">
        <div class="section-heading">
          <p>You May Also Like</p>
          <h2>More IPL Matches</h2>
        </div>
        <div class="recommend-grid">${related.map(recommendCard).join("")}</div>
      </section>
    </main>
  `;
}

function recommendCard(match) {
  const teamMap = teamCodeMap(state.matches);
  const homeName = match.teams?.[0] || "";
  const awayName = match.teams?.[1] || "";
  const homeCode = teamCodeForName(homeName, teamMap);
  const awayCode = teamCodeForName(awayName, teamMap);
  return `
    <article class="recommend-card" data-action="details" data-id="${match.id}">
      <img src="${match.image}" alt="${match.shortTitle}" />
      <div class="recommend-teams" aria-hidden="true">
        ${homeCode ? teamLogoBadge(homeCode, "xs") : ""}
        <span>vs</span>
        ${awayCode ? teamLogoBadge(awayCode, "xs") : ""}
      </div>
      <strong>${match.shortTitle}</strong>
      <span>${match.location}</span>
    </article>
  `;
}

function renderSeatMap() {
  const match = getMatch();
  app.innerHTML = `
    <header class="seat-header">
      <button class="brand" data-action="home"><span>book</span><strong>my</strong><span>show</span></button>
      <button class="back-link" data-action="details" data-id="${match.id}">Back</button>
      <strong>${match.title} - ${match.league}</strong>
      <span>${state.selectedSeats} Tickets</span>
    </header>
    <div class="timer">You have approximately <strong>4 minutes</strong> to select your seats.</div>
    <main class="seat-page">
      <aside class="category-panel">
        <div class="mini-teams"><span>KKR</span><strong>vs</strong><span>RR</span></div>
        <h1>${match.title} - ${match.league}</h1>
        <p>${match.date} | ${match.time}</p>
        <p>Please select the category of your choice. It will get highlighted on the layout.</p>
        <div class="seat-summary">
          <span>Selected</span>
          <strong>${state.selectedSeats} ticket(s)</strong>
          <small>${state.selectedCategory ? state.selectedCategory.label : "Choose a ticket category"}</small>
        </div>
        <div class="category-list">
          ${categories.map(categoryRow).join("")}
        </div>
        <button class="primary full proceed-seat" data-action="proceedCheckout">Continue</button>
      </aside>
      <section class="stadium-zone">
        ${seatLayoutImage()}
        <div class="zoom-note">The layout can be zoomed in/out</div>
      </section>
    </main>
    ${state.showSeatModal ? seatModal() : ""}
    ${state.showLayoutZoom ? layoutZoomModal() : ""}
  `;
}

function categoryRow(category) {
  const left = getAvailability(category.id);
  return `
    <button class="category-row ${left === 0 ? "sold" : ""}" data-action="selectCategory" data-id="${category.id}">
      <span style="background:${category.color}"></span>
      <div>
        <strong>${category.price}</strong>
        <p>${category.label}</p>
      </div>
      <small>${left ? `${left} left` : "Sold out"}</small>
    </button>
  `;
}

function seatLayoutImage() {
  return `
    <button class="seat-layout-image" data-action="openLayoutZoom" aria-label="Zoom seating layout">
      <img src="/assists/download.png" alt="IPL seating layout preview" />
      <span>Click to zoom layout</span>
    </button>
  `;
}

function layoutZoomModal() {
  return `
    <div class="layout-zoom-overlay">
      <section class="layout-zoom-modal">
        <button class="modal-close zoom-close" data-action="closeLayoutZoom">Close</button>
        <img src="/assists/download.png" alt="Zoomed IPL seating layout" />
      </section>
    </div>
  `;
}

function stadiumSvg() {
  const segments = categories.slice(0, 9).map((category, index) => {
    const rotation = index * 32 - 120;
    const left = getAvailability(category.id);
    return `
      <button class="stand stand-${index} ${left === 0 ? "sold" : ""}" style="--rotate:${rotation}deg; --color:${category.color}" data-action="selectCategory" data-id="${category.id}">
        <span>${category.stand}</span>
      </button>
    `;
  }).join("");

  return `
    <div class="stadium" aria-label="Interactive stadium layout">
      <div class="field">I</div>
      ${segments}
    </div>
  `;
}

function seatModal() {
  const counts = Array.from({ length: 10 }, (_, index) => index + 1);
  return `
    <div class="overlay">
      <section class="seat-modal">
        <button class="modal-close" data-action="closeModal">Close</button>
        <h2>How many seats?</h2>
        <div class="scooter" aria-hidden="true">
          <div></div><span></span><strong></strong>
        </div>
        <div class="seat-counts">
          ${counts.map((count) => `
            <button class="${state.selectedSeats === count ? "active" : ""}" data-action="seatCount" data-value="${count}">${count}</button>
          `).join("")}
        </div>
        <strong class="selected-count">${state.selectedSeats} ticket(s) selected</strong>
        <p class="hint">You can add upto 10 tickets.</p>
        <button class="primary full" data-action="continueSeats">Continue</button>
      </section>
    </div>
  `;
}

function renderCheckout() {
  const match = getMatch();
  if (!state.selectedCategory) state.selectedCategory = categories[1];
  const total = state.selectedSeats * state.selectedCategory.price;

  app.innerHTML = `
    <header class="checkout-header">
      <button class="brand" data-action="home"><span>book</span><strong>my</strong><span>show</span></button>
      <strong>${match.title} - ${match.league}</strong>
    </header>
    <div class="steps">
      <span>1 Seats</span>
      <strong>2 Ticket Mode</strong>
      <span>3 Review & Proceed to Pay</span>
    </div>
    <main class="checkout-page">
      <section class="checkout-card">
        <h1>${match.venue}</h1>
        <h2>${match.date} | ${match.time} | ${state.selectedCategory.label}: ${state.selectedSeats} ticket(s)</h2>
        <div class="pickup-card">
          <div>
            <h3>Box Office Pick Up</h3>
            <p>Customer(s) will receive an order confirmation via email, which must be presented at the pickup counter to collect ticket(s).</p>
            <p>Cardholder should be present with the card used for booking.</p>
            ${state.ui?.pickupExpanded ? `
              <div class="pickup-more" role="note">
                <p>Keep your booking ID and a valid photo ID handy at the venue pickup counter.</p>
                <p>Arrive early to avoid queues. Ticket pickup timings may vary by stadium.</p>
              </div>
            ` : ""}
            <button type="button" class="pickup-more-toggle" data-action="togglePickupInfo">
              ${state.ui?.pickupExpanded ? "Read Less" : "Read More"}
            </button>
          </div>
          <div class="pickup-icon">BO</div>
        </div>
        <div class="customer-form">
          <div class="form-heading">
            <h3>Ticket Delivery Details</h3>
            <p>Please enter your email and mobile number where the ticket will be sent.</p>
          </div>
          <div class="form-grid">
            <label>
              Mobile Number
              <input type="tel" data-customer="phone" value="${state.customer.phone}" placeholder="Enter mobile number" inputmode="tel" autocomplete="tel" required />
            </label>
            <label>
              Email Address
              <input type="email" data-customer="email" value="${state.customer.email}" placeholder="Enter email address" inputmode="email" autocomplete="email" required />
            </label>
          </div>
        </div>
        <div class="summary-row">
          <span>Total Amount</span>
          <strong>${money(total)}</strong>
          <button class="primary" data-action="pay">Proceed to Pay</button>
        </div>
      </section>
    </main>
  `;
}

function renderConfirmation() {
  const match = getMatch();
  const total = state.selectedSeats * state.selectedCategory.price;
  app.innerHTML = `
    ${header()}
    <main class="confirmation">
      <section>
        <span class="success-mark">✓</span>
        <h1>Booking Confirmed</h1>
        <p>Your ${state.selectedSeats} ticket(s) for ${match.title} are reserved.</p>
        <div class="confirm-card">
          <p><strong>Booking ID:</strong> ${state.bookingRef}</p>
          <p><strong>Stand:</strong> ${state.selectedCategory.label}</p>
          <p><strong>Venue:</strong> ${match.venue}</p>
          <p><strong>Amount:</strong> ${money(total)}</p>
          <p><strong>Email:</strong> ${state.customer.email || "Not provided"}</p>
          <p><strong>Mobile:</strong> ${state.customer.phone || "Not provided"}</p>
        </div>
        <button class="primary" data-action="reset">Book Another Match</button>
      </section>
    </main>
  `;
}

function formatCustomerAddress() {
  const parts = [state.customer.address, state.customer.city, state.customer.pincode].filter(Boolean);
  return parts.length ? parts.join(", ") : "Not provided";
}

function render() {
  if (state.route.page === "match") renderDetails();
  else if (state.route.page === "seats") renderSeatMap();
  else if (state.route.page === "checkout") renderCheckout();
  else if (state.route.page === "matches") renderAllMatches();
  else renderHome();
}

init();
