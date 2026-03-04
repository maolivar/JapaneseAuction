import uuid


class AuctionGame:
    def __init__(self, game_id, title, starting_price, increment):
        self.game_id = game_id
        self.title = title
        self.starting_price = starting_price
        self.increment = increment
        self.current_price = starting_price
        self.status = "waiting"
        self.bidders = {}  # bidder_id -> {id, name, active}
        self.price_history = []
        self.last_dropper = None

    def add_bidder(self, name):
        if self.status not in ("waiting", "running"):
            raise ValueError("Cannot join: auction is not open.")
        bidder_id = str(uuid.uuid4())
        self.bidders[bidder_id] = {"id": bidder_id, "name": name, "active": True}
        return bidder_id

    def start_auction(self):
        self.status = "running"
        self.price_history.append({
            "price": self.current_price,
            "active_count": self.get_active_count()
        })
        return True

    def raise_price(self):
        self.current_price += self.increment
        self.price_history.append({
            "price": self.current_price,
            "active_count": self.get_active_count()
        })
        return {"new_price": self.current_price, "active_count": self.get_active_count()}

    def drop_out(self, bidder_id):
        if bidder_id not in self.bidders:
            return {"bidder_id": bidder_id, "name": None, "remaining_active_count": self.get_active_count()}
        bidder = self.bidders[bidder_id]
        if not bidder["active"]:
            return {"bidder_id": bidder_id, "name": bidder["name"], "remaining_active_count": self.get_active_count()}
        bidder["active"] = False
        self.last_dropper = bidder

        # Update the most recent price history entry with new active count
        if self.price_history:
            self.price_history[-1]["active_count"] = self.get_active_count()

        return {
            "bidder_id": bidder_id,
            "name": bidder["name"],
            "remaining_active_count": self.get_active_count()
        }

    def end_auction(self):
        self.status = "finished"
        active = self.get_active_bidders()
        if active:
            winners = [b["name"] for b in active]
        elif self.last_dropper:
            winners = [self.last_dropper["name"]]
        else:
            winners = []
        return {
            "winners": winners,
            "final_price": self.current_price,
            "price_history": self.price_history
        }

    def get_active_bidders(self):
        return [b for b in self.bidders.values() if b["active"]]

    def get_active_count(self):
        return len(self.get_active_bidders())

    def get_state(self):
        return {
            "game_id": self.game_id,
            "title": self.title,
            "status": self.status,
            "current_price": self.current_price,
            "increment": self.increment,
            "active_count": self.get_active_count(),
            "total_bidders": len(self.bidders),
            "bidders": self.bidders,
            "price_history": self.price_history
        }

    def is_valid_bidder(self, bidder_id):
        return bidder_id in self.bidders

    def get_price_history(self):
        return self.price_history
