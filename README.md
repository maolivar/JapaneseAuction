# Japanese Auction

A real-time Japanese (ascending-price) auction web app built with Python, Flask, and Flask-SocketIO.

## What is a Japanese Auction?

All bidders start active. The auctioneer raises the price in fixed increments. At each level, bidders choose to stay in or drop out. Once you drop out, you can't re-enter. The last remaining bidder(s) win.

## Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/JapaneseAuction.git
cd JapaneseAuction

# 2. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate      # macOS/Linux
# .venv\Scripts\activate       # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the app
python app.py
```

Then open [http://localhost:5001](http://localhost:5001) in your browser.

## How to Run an Auction

1. **Create** — Go to the home page, fill in the auction title, starting price, and increment, then click "Create Auction".
2. **Share** — The auctioneer page shows a QR code. Have bidders scan it (or share the `/join/<id>` URL).
3. **Bidders join** — Each bidder enters their name and lands on their bidder page.
4. **Start** — Click "Start Auction" on the auctioneer page.
5. **Raise price** — Click "Raise Price" to increment the current price.
6. **Bidders drop out** — Bidders click "Drop Out" when they no longer want to bid.
7. **End** — The auction ends automatically when all bidders drop out, or manually via "End Auction". Remaining active bidders are co-winners.

## Tech Stack

- Python 3.11
- Flask + Flask-SocketIO (eventlet)
- Jinja2 templates
- Vanilla JavaScript
- qrcode[pil] for QR generation
- python-dotenv
