# Japanese Auction — Instructor Guide

## What is a Japanese Auction?

A Japanese auction is a type of ascending-price auction. All bidders start active. The auctioneer raises the price in fixed increments. At each price level, each bidder decides to either **stay in** or **drop out**. Once a bidder drops out, they cannot re-enter. The auction ends when all bidders have dropped out, and the **last bidder(s) remaining win**.

---

## Accessing the App

The app is hosted online — no installation needed. Open this link in your browser:

**[https://ascending-auction-c577c4203da7.herokuapp.com/](https://ascending-auction-c577c4203da7.herokuapp.com/)**

> **Tip:** Use a laptop or desktop as the auctioneer. Project your screen so the class can see the current price. Bidders use their own phones or laptops.

---

## Running an Auction — Step by Step

### Step 1 — Create the Auction

1. Open the app link above.
2. Fill in:
   - **Auction Title** — e.g. "Round 1" or the item being auctioned.
   - **Starting Price** — the price at which the auction begins (can be 0).
   - **Price Increment** — how much the price rises each round (e.g. 10).
3. Click **Create Auction**.

You will be taken to the **Auctioneer page**. Keep this tab open — it is your control panel for the entire auction.

---

### Step 2 — Bidders Join

The auctioneer page shows a **QR code** and a short join URL (e.g. `/join/abc123`).

- **Option A:** Have students scan the QR code with their phone camera.
- **Option B:** Display or share the full join link: `https://ascending-auction-c577c4203da7.herokuapp.com/join/<game-id>`.

Each student enters their name and lands on their personal **bidder page**. They should keep this page open on their device throughout the auction.

The auctioneer page updates live as students join, showing the current participant count.

> OPTIONAL: **Testing before class:** Use the **+ Add Test Bidder** button (below the QR code) to open simulated bidder tabs in your own browser. Useful for verifying the setup before students arrive. After testing, restart and run a new auction when the students are ready to play.

---

### Step 3 — Start the Auction

Once all bidders have joined, click **Start Auction**.

- The QR code and join button disappear (no new participants can join).
- The **Raise Price** and **End Auction** buttons appear.

---

### Step 4 — Run the Auction

Click **Raise Price** to increase the current price by the increment you set. All bidder screens update instantly.

At each price level, students who no longer wish to bid click the **Drop Out** button on their own device. The auctioneer page shows the number of active bidders decreasing in real time.

Continue raising the price until only one (or a few) bidders remain.

---

### Step 5 — End the Auction

The auction ends in one of two ways:

- **Automatically** — when the last bidder drops out. The winner is the last person who dropped out (they held on the longest).
- **Manually** — click **End Auction** at any time. All bidders still active at that moment are declared **co-winners**.

The results panel shows:
- The winner(s) and final price.
- A full price history table (price vs. number of active bidders at each level).

---

### Step 6 — Export and Reset

- Click **Download CSV** to save the results table as a spreadsheet file.
- Click **New Auction** to go back to the start and create another auction.

---

## Quick Reference

| Action | Who does it | Where |
|--------|------------|-------|
| Create auction | Instructor | App home page |
| Join auction | Students | QR code or join link |
| Start / Raise Price / End | Instructor | Auctioneer page |
| Drop Out | Student | Their bidder page |
| Download results | Instructor | Auctioneer page (after auction ends) |

---

## Tips for the Classroom

- **Project the auctioneer page** on the main screen so everyone can see the current price and active bidder count.
- **Announce the price out loud** as you raise it — students on their phones may not be watching the screen.
- **Use a small increment** relative to the price range to make the auction last longer and give students more decision points.
- **Multiple rounds:** After each auction ends, click "New Auction" to run another round with the same or different parameters. Each auction is fully independent.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Student can't load the page | Check they have internet access and are using the correct link |
| Bidder page shows "Waiting for auction to start" | The instructor hasn't clicked Start Auction yet |
| Student accidentally closed their tab | They can reopen the same URL — their bidder page is still valid as long as the auction is running |
| Auction ended before a student could join | Start a new auction from the home page |
