(function () {
  const gameId = document.body.dataset.gameId;
  const bidderId = document.body.dataset.bidderId;

  const socket = io();

  // Join room and request current state
  socket.emit("join_room", { game_id: gameId, role: "bidder", bidder_id: bidderId });
  socket.emit("request_state", { game_id: gameId });

  // UI elements
  const priceEl = document.getElementById("current-price");
  const statusEl = document.getElementById("status-message");
  const btnDropout = document.getElementById("btn-dropout");
  const winnerSection = document.getElementById("winner-section");
  const winnerAnnouncement = document.getElementById("winner-announcement");

  let droppedOut = false;

  function disableDropout() {
    btnDropout.disabled = true;
    droppedOut = true;
  }

  // Drop Out button
  btnDropout.addEventListener("click", function () {
    if (droppedOut) return;
    socket.emit("drop_out", { game_id: gameId, bidder_id: bidderId });
    disableDropout();
    statusEl.textContent = "You have dropped out";
  });

  // State sync on connect (for late joiners or page reload)
  socket.on("state_sync", function (state) {
    priceEl.textContent = "$" + state.current_price;

    if (state.status === "finished") {
      disableDropout();
      statusEl.textContent = "Auction ended";
      return;
    }

    if (state.status === "running") {
      const bidder = state.bidders && state.bidders[bidderId];
      if (bidder && !bidder.active) {
        disableDropout();
        statusEl.textContent = "You have dropped out";
      } else if (bidder && bidder.active) {
        btnDropout.disabled = false;
        statusEl.textContent = "You are active";
      }
    } else {
      // waiting
      btnDropout.disabled = true;
      statusEl.textContent = "Waiting for auction to start...";
    }
  });

  socket.on("auction_started", function (state) {
    priceEl.textContent = "$" + state.current_price;
    if (!droppedOut) {
      btnDropout.disabled = false;
      statusEl.textContent = "You are active";
    }
  });

  socket.on("price_update", function (data) {
    priceEl.textContent = "$" + data.new_price;
  });

  socket.on("bidder_dropped", function (data) {
    // No action needed unless we want to show count, but spec doesn't require it on bidder page
  });

  socket.on("auction_ended", function (data) {
    disableDropout();
    statusEl.textContent = "Auction ended";

    winnerSection.classList.remove("hidden");
    if (data.winners && data.winners.length > 0) {
      winnerAnnouncement.innerHTML =
        "<strong>Auction over!</strong><br>" +
        "Winner(s): " + data.winners.join(", ") +
        "<br>Final Price: $" + data.final_price;
    } else {
      winnerAnnouncement.textContent = "Auction ended with no winners.";
    }
  });
})();
