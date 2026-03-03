import io
import base64
import uuid
import os

import qrcode
from dotenv import load_dotenv
from flask import Flask, render_template, request, redirect, url_for, abort
from flask_socketio import SocketIO, join_room, emit

from game import AuctionGame

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-key")

socketio = SocketIO(app, async_mode="eventlet", cors_allowed_origins="*")

# In-memory store: game_id -> {"game": AuctionGame, "qr_b64": str}
games = {}


def generate_qr_b64(url):
    img = qrcode.make(url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


# ---------------------------------------------------------------------------
# HTTP Routes
# ---------------------------------------------------------------------------

@app.route("/")
def home():
    return render_template("home.html")


@app.route("/create", methods=["POST"])
def create():
    title = request.form.get("title", "Untitled Auction")
    starting_price = int(request.form.get("starting_price", 0))
    increment = int(request.form.get("increment", 10))

    game_id = str(uuid.uuid4())[:8]
    game = AuctionGame(game_id, title, starting_price, increment)

    join_url = url_for("join_get", game_id=game_id, _external=True, _scheme="http")
    qr_b64 = generate_qr_b64(join_url)

    games[game_id] = {"game": game, "qr_b64": qr_b64}

    return redirect(url_for("auctioneer", game_id=game_id))


@app.route("/auctioneer/<game_id>")
def auctioneer(game_id):
    entry = games.get(game_id)
    if not entry:
        abort(404)
    game = entry["game"]
    qr_b64 = entry["qr_b64"]
    return render_template("auctioneer.html", game=game, qr_code_b64=qr_b64)


@app.route("/join/<game_id>", methods=["GET"])
def join_get(game_id):
    entry = games.get(game_id)
    if not entry:
        abort(404)
    game = entry["game"]
    return render_template("lobby.html", game=game, game_id=game_id)


@app.route("/join/<game_id>", methods=["POST"])
def join_post(game_id):
    entry = games.get(game_id)
    if not entry:
        abort(404)
    game = entry["game"]
    name = request.form.get("name", "Anonymous").strip() or "Anonymous"
    try:
        bidder_id = game.add_bidder(name)
    except ValueError as e:
        abort(400, str(e))
    socketio.emit("bidder_joined", {"name": name, "total_count": len(game.bidders)}, to=game_id)
    return redirect(url_for("bidder", game_id=game_id, bidder_id=bidder_id))


@app.route("/test-bidder/<game_id>")
def test_bidder(game_id):
    entry = games.get(game_id)
    if not entry:
        abort(404)
    game = entry["game"]
    n = len(game.bidders) + 1
    name = f"Tester {n}"
    try:
        bidder_id = game.add_bidder(name)
    except ValueError as e:
        abort(400, str(e))
    socketio.emit("bidder_joined", {"name": name, "total_count": len(game.bidders)}, to=game_id)
    return redirect(url_for("bidder", game_id=game_id, bidder_id=bidder_id))


@app.route("/bidder/<game_id>/<bidder_id>")
def bidder(game_id, bidder_id):
    entry = games.get(game_id)
    if not entry:
        abort(404)
    game = entry["game"]
    if not game.is_valid_bidder(bidder_id):
        abort(404)
    return render_template("bidder.html", game=game, bidder_id=bidder_id)


# ---------------------------------------------------------------------------
# SocketIO Events
# ---------------------------------------------------------------------------

@socketio.on("join_room")
def handle_join_room(data):
    game_id = data.get("game_id")
    join_room(game_id)


@socketio.on("start_auction")
def handle_start_auction(data):
    game_id = data.get("game_id")
    entry = games.get(game_id)
    if not entry:
        return
    game = entry["game"]
    game.start_auction()
    socketio.emit("auction_started", game.get_state(), to=game_id)


@socketio.on("raise_price")
def handle_raise_price(data):
    game_id = data.get("game_id")
    entry = games.get(game_id)
    if not entry:
        return
    game = entry["game"]
    result = game.raise_price()
    socketio.emit("price_update", result, to=game_id)


@socketio.on("drop_out")
def handle_drop_out(data):
    game_id = data.get("game_id")
    bidder_id = data.get("bidder_id")
    entry = games.get(game_id)
    if not entry:
        return
    game = entry["game"]
    result = game.drop_out(bidder_id)
    socketio.emit(
        "bidder_dropped",
        {"remaining_count": result["remaining_active_count"], "bidder_name": result["name"]},
        to=game_id
    )
    if result["remaining_active_count"] == 0:
        end_result = game.end_auction()
        socketio.emit("auction_ended", end_result, to=game_id)


@socketio.on("end_auction")
def handle_end_auction(data):
    game_id = data.get("game_id")
    entry = games.get(game_id)
    if not entry:
        return
    game = entry["game"]
    if game.status == "finished":
        return
    result = game.end_auction()
    socketio.emit("auction_ended", result, to=game_id)


@socketio.on("request_state")
def handle_request_state(data):
    game_id = data.get("game_id")
    entry = games.get(game_id)
    if not entry:
        return
    game = entry["game"]
    emit("state_sync", game.get_state())


if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "False").lower() in ("true", "1")
    socketio.run(app, host="0.0.0.0", port=5001, debug=debug)
