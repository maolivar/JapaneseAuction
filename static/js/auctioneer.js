(function () {
  const gameId = document.body.dataset.gameId;

  const socket = io();

  // Join the room for this game
  socket.emit("join_room", { game_id: gameId, role: "auctioneer" });

  // UI elements
  const priceEl = document.getElementById("current-price");
  const activeCountEl = document.getElementById("active-count");
  const totalCountEl = document.getElementById("total-count");
  const btnStart = document.getElementById("btn-start");
  const btnRaise = document.getElementById("btn-raise");
  const btnEnd = document.getElementById("btn-end");
  const resultsEl = document.getElementById("results");
  const resultsBody = document.getElementById("results-body");
  const winnersSectionEl = document.getElementById("winners-section");
  const btnCsv = document.getElementById("btn-download-csv");
  const btnNewAuction = document.getElementById("btn-new-auction");
  const qrSectionEl = document.getElementById("qr-section");

  // Buttons
  btnStart.addEventListener("click", function () {
    socket.emit("start_auction", { game_id: gameId });
  });

  btnRaise.addEventListener("click", function () {
    socket.emit("raise_price", { game_id: gameId });
  });

  btnEnd.addEventListener("click", function () {
    socket.emit("end_auction", { game_id: gameId });
  });

  socket.on("bidder_joined", function (data) {
    totalCountEl.textContent = data.total_count;
    activeCountEl.textContent = data.total_count;
  });

  // Socket events
  socket.on("auction_started", function (state) {
    btnStart.classList.add("hidden");
    btnRaise.classList.remove("hidden");
    btnEnd.classList.remove("hidden");
    if (qrSectionEl) qrSectionEl.classList.add("hidden");
    activeCountEl.textContent = state.active_count;
    totalCountEl.textContent = state.total_bidders;
    priceEl.textContent = "$" + state.current_price;
  });

  socket.on("price_update", function (data) {
    priceEl.textContent = "$" + data.new_price;
    activeCountEl.textContent = data.active_count;
  });

  socket.on("bidder_dropped", function (data) {
    activeCountEl.textContent = data.remaining_count;
  });

  socket.on("auction_ended", function (data) {
    // Hide control buttons
    btnStart.classList.add("hidden");
    btnRaise.classList.add("hidden");
    btnEnd.classList.add("hidden");

    // Show results
    resultsEl.classList.remove("hidden");

    // Winners
    if (data.winners && data.winners.length > 0) {
      winnersSectionEl.textContent = "Winner(s): " + data.winners.join(", ") +
        " — Final Price: $" + data.final_price;
    } else {
      winnersSectionEl.textContent = "No winners.";
    }

    // Price history table
    resultsBody.innerHTML = "";
    if (data.price_history) {
      data.price_history.forEach(function (entry) {
        const tr = document.createElement("tr");
        tr.innerHTML = "<td>$" + entry.price + "</td><td>" + entry.active_count + "</td>";
        resultsBody.appendChild(tr);
      });
    }

    // Update displayed price and active count
    if (data.final_price !== undefined) {
      priceEl.textContent = "$" + data.final_price;
    }
    activeCountEl.textContent = "0";

    // CSV download and new auction
    btnCsv.classList.remove("hidden");
    btnNewAuction.classList.remove("hidden");
    btnCsv.addEventListener("click", function () {
      const rows = [["Price", "Active Bidders"]];
      if (data.price_history) {
        data.price_history.forEach(function (e) {
          rows.push(["$" + e.price, e.active_count]);
        });
      }
      rows.push([]);
      rows.push(["Winners", (data.winners || []).join("; ")]);
      rows.push(["Final Price", "$" + data.final_price]);
      const csv = rows.map(function (r) { return r.join(","); }).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "auction-results.csv";
      a.click();
      URL.revokeObjectURL(url);
    });
  });
})();
