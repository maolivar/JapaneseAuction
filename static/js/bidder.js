(function () {
  const gameId = document.body.dataset.gameId;
  const bidderId = document.body.dataset.bidderId;

  const socket = io();

  // (Re)join the room on every connect. Socket.IO reconnects automatically
  // (phone sleep, Wi-Fi blips), but the new connection is not in the room
  // until we join again. The server replies with a state_sync.
  socket.on("connect", function () {
    socket.emit("join_room", { game_id: gameId, role: "bidder", bidder_id: bidderId });
  });

  // UI elements
  const priceEl = document.getElementById("current-price");
  const statusEl = document.getElementById("status-message");
  const btnDropout = document.getElementById("btn-dropout");
  const winnerSection = document.getElementById("winner-section");
  const winnerAnnouncement = document.getElementById("winner-announcement");

  let droppedOut = false;     // student pressed Drop Out (or auction ended)
  let dropConfirmed = false;  // server acknowledged the drop
  let dropPending = false;    // a drop_out request is awaiting its ack

  function disableDropout() {
    btnDropout.disabled = true;
    droppedOut = true;
  }

  function confirmDropout() {
    dropConfirmed = true;
    disableDropout();
    statusEl.textContent = "You have dropped out";
  }

  // Send drop_out and retry until the server acknowledges it, so a request
  // lost on a dead connection doesn't leave the student marked as active.
  function sendDropOut() {
    if (dropConfirmed || dropPending) return;
    dropPending = true;
    socket.timeout(4000).emit("drop_out", { game_id: gameId, bidder_id: bidderId }, function (err, res) {
      dropPending = false;
      if (dropConfirmed) return;
      if (!err && res && res.ok) {
        confirmDropout();
      } else if (!err) {
        // Server answered but refused (e.g. game no longer exists): don't loop.
        statusEl.textContent = "Could not drop out. Please tell the instructor.";
      } else {
        statusEl.textContent = "Connection problem, retrying drop out...";
        setTimeout(sendDropOut, 1000);
      }
    });
  }

  // Drop Out button
  btnDropout.addEventListener("click", function () {
    if (droppedOut) return;
    disableDropout();
    statusEl.textContent = "Dropping out...";
    sendDropOut();
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
        confirmDropout();
      } else if (bidder && bidder.active && droppedOut) {
        // We pressed Drop Out but the server never got it: send it again.
        sendDropOut();
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
    dropConfirmed = true;
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
