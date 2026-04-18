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

window.addEventListener("popstate", () => {
  state.route = parseRoute();
  render();
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const { action, id, value } = target.dataset;
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
});

document.addEventListener("input", (event) => {
  if (event.target.matches("[data-search]")) {
    state.search = event.target.value;
    render();
  }

  if (event.target.matches("[data-customer]")) {
    state.customer[event.target.dataset.customer] = event.target.value;
  }
});

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-city]")) {
    state.city = event.target.value;
    render();
  }
});

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
  const key = `booked:${state.route.id}:${state.selectedCategory.id}`;
  localStorage.setItem(key, String(Number(localStorage.getItem(key) || 0) + state.selectedSeats));
  state.bookingRef = `IPL${Date.now().toString().slice(-6)}`;
  renderConfirmation();
}

function filteredMatches() {
  const q = state.search.trim().toLowerCase();
  return state.matches.filter((match) => {
    const cityMatch = state.city === "All Cities" || match.location === state.city;
    const searchMatch = !q || `${match.title} ${match.venue} ${match.league}`.toLowerCase().includes(q);
    return cityMatch && searchMatch;
  });
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
          <input data-search value="${state.search}" placeholder="Search for matches, teams, venues" />
        </label>
        <select class="city-select" data-city aria-label="Filter by city">
          ${cities.map((city) => (
            `<option ${state.city === city ? "selected" : ""}>${city}</option>`
          )).join("")}
        </select>
      </header>
      <nav class="subnav" aria-label="BookMyShow sections">
        <a>Movies</a>
        <a>Stream</a>
        <a>Events</a>
        <a>Plays</a>
        <a class="active">Sports</a>
        <a>Activities</a>
        <a>Buzz</a>
      </nav>
    </div>
  `;
}

function renderHome() {
  const matches = filteredMatches();
  const cards = buildSportsCards(matches);
  app.innerHTML = `
    ${header()}
    <main class="home-page explore-page">
      <section class="explore-banner">
        <img src="/assists/dashboard.avif" alt="TATA IPL 2026 dashboard banner" />
      </section>
      <section class="explore-shell">
        <aside class="filters-panel">
          <h2>Filters</h2>
          ${filterBlock("Categories", "Cricket", "Clear")}
          ${filterBlock("Date", "Today", "Clear")}
          ${filterBlock("More Filters", "Outdoor Events", "Clear")}
          ${filterBlock("Price", "₹0 - ₹3000", "Clear")}
          <button class="browse-button">Browse by Venues</button>
        </aside>
        <div class="sports-listing">
          <div class="sports-heading">
            <div>
              <h1>Sports in ${state.city === "All Cities" ? "Ahmedabad" : state.city}</h1>
              <p>Explore live IPL fixtures, fan parks, and stadium experiences with real-time ticket categories, venue details, and quick booking options.</p>
            </div>
            <div>
              <button>Cricket</button>
              <button>Outdoor</button>
            </div>
          </div>
          <div class="sports-grid">
            ${cards.map(sportsCard).join("") || emptyState()}
          </div>
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

function buildSportsCards(matches) {
  if (!matches.length) return [];

  const source = state.matches.length ? state.matches : matches;
  const extra = [
    {
      ...(source[0] || {}),
      id: source[0]?.id || "kkr-rr-2026",
      title: "TATA IPL 2026",
      shortTitle: "TATA IPL 2026",
      venue: "Ahmedabad",
      image: "/assists/download.png",
      priceFrom: 750
    },
    {
      ...(source[1] || {}),
      id: source[1]?.id || "gt-csk-2026",
      title: "Mumbai City FC vs East Bengal FC",
      shortTitle: "Mumbai City FC vs East Bengal",
      image: source[1]?.image || "/assists/media-desktop-gujarat-titans-vs-chennai-super-kings-tata-ipl-2026-0-2026-4-5-t-11-33-13.avif",
      venue: "Mumbai Football Arena",
      priceFrom: 499
    },
    {
      ...(source[2] || {}),
      id: source[2]?.id || "mi-lsg-2026",
      title: "Gujarat Titans Fan Park",
      shortTitle: "Gujarat Titans Fan Park",
      image: source[2]?.image || "/assists/media-desktop-mumbai-indians-vs-lucknow-super-giants-0-2026-4-10-t-12-1-34.avif",
      venue: "Narendra Modi Stadium",
      priceFrom: 299
    }
  ].filter(Boolean);

  return [...matches, ...extra].slice(0, 8);
}

function sportsCard(match) {
  return `
    <article class="sports-card" data-action="details" data-id="${match.id}">
      <img src="${match.image}" alt="${match.shortTitle || match.title}" />
      <div>
        <strong>${match.shortTitle || match.title}</strong>
        <p>${match.venue}</p>
        <small>${match.date} • ${match.time}</small>
        <span>${money(match.priceFrom)} onwards</span>
        <em>${match.availability || "Available"} tickets</em>
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

  app.innerHTML = `
    ${header()}
    <main class="detail-page">
      <section class="event-layout">
        <div>
          <button class="back-link" data-action="home">Back to matches</button>
          <h1>${match.title} - ${match.league}</h1>
          <img class="event-poster" src="${match.image}" alt="${match.title}" />
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
  return `
    <article class="recommend-card" data-action="details" data-id="${match.id}">
      <img src="${match.image}" alt="${match.shortTitle}" />
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
            <a>Read More</a>
          </div>
          <div class="pickup-icon">BO</div>
        </div>
        <div class="customer-form">
          <div class="form-heading">
            <h3>Fill your details</h3>
            <p>These details will be used for booking confirmation and ticket pickup verification.</p>
          </div>
          <div class="form-grid">
            <label>
              Full Name
              <input data-customer="name" value="${state.customer.name}" placeholder="Enter your full name" />
            </label>
            <label>
              Mobile Number
              <input data-customer="phone" value="${state.customer.phone}" placeholder="Enter mobile number" inputmode="tel" />
            </label>
            <label>
              Email Address
              <input data-customer="email" value="${state.customer.email}" placeholder="Enter email address" inputmode="email" />
            </label>
            <label>
              City
              <input data-customer="city" value="${state.customer.city}" placeholder="Enter city" />
            </label>
            <label class="full-field">
              Address
              <textarea data-customer="address" placeholder="House / Street / Area">${state.customer.address}</textarea>
            </label>
            <label>
              Pincode
              <input data-customer="pincode" value="${state.customer.pincode}" placeholder="Enter pincode" inputmode="numeric" />
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
          <p><strong>Name:</strong> ${state.customer.name || "Not provided"}</p>
          <p><strong>Mobile:</strong> ${state.customer.phone || "Not provided"}</p>
          <p><strong>Address:</strong> ${formatCustomerAddress()}</p>
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
  else renderHome();
}

init();
