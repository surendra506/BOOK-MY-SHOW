# IPL Ticket Booking Web App

A BookMyShow-inspired IPL ticket booking experience with match discovery, event details, stadium category selection, ticket mode, and booking confirmation.

## Run Locally

```bash
npm run dev
```

Open:

```text
http://localhost:4173
```

## Features

- Dynamic IPL match listings from a local API endpoint
- Search and city filtering
- Event detail page with venue, date, time, pricing, and recommendations
- Interactive stadium category selection
- Seat quantity modal with a booking timer flow
- Ticket pickup and proceed-to-pay screen
- Booking confirmation with generated booking ID
- Local seat availability updates after confirmation
- Responsive desktop and mobile layout

## Project Structure

```text
server.mjs          Node server and match API
public/index.html  App shell
public/app.js      Frontend booking flow
public/styles.css  Responsive UI styles
assists/           IPL banner and match images
```

