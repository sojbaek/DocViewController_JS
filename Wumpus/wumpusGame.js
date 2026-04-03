const GameStatus = Object.freeze({
    IN_GAME: "IN_GAME",
    GAME_OVER: "GAME_OVER"
});

class WumpusGame {
  constructor() {
    this.listeners = [];
    this.rooms = { // Room connections: Originally from Hunt the Wumpus game, adapted for 20 roomsß
      1:[2,5,8], 2:[1,3,10], 3:[2,4,12], 4:[3,5,14], 5:[1,4,6],
      6:[5,7,15], 7:[6,8,17], 8:[1,7,9], 9:[8,10,18], 10:[2,9,11],
      11:[10,12,19], 12:[3,11,13], 13:[12,14,20], 14:[4,13,15],
      15:[6,14,16], 16:[15,17,20], 17:[7,16,18], 18:[9,17,19],
      19:[11,18,20], 20:[13,16,19]
    };
  }

  init() {
    this.player = this.randomRoom();
    this.wumpus = this.randomRoomExcluding([this.player]);
    this.pits = [
      this.randomRoomExcluding([this.player,this.wumpus]),
      this.randomRoomExcluding([this.player,this.wumpus])
    ];
    this.bats = [
      this.randomRoomExcluding([this.player,this.wumpus,...this.pits]),
      this.randomRoomExcluding([this.player,this.wumpus,...this.pits])
    ];
    this.textout = "";
    this.arrows = 5;
    this.println("\nWelcome to Hunt the Wumpus.");
    this.println("You are in a cave with 20 rooms. Your goal is to hunt the Wumpus");
    this.println("without falling into pits or being eaten by bats.   ");
    this.println("You have 5 arrows. You can move to adjacent rooms or ");
    this.println("shoot an arrow into an adjacent room. Good luck!");
    this.gamestatus = GameStatus.IN_GAME;
    this.describeRoom();
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  notifyChange(event, data) {
    this.listeners.forEach(function(listener) {
      listener(event, data);
    });
  }

  print(text) {
    this.textout += text;
  }

  println(text) {
    this.textout += text  + "\n";
  }
  
  clear() {
    this.textout = "";
  }
  
  flush() {
    this.notifyChange("updated", { player: this.player, wumpus: this.wumpus, pits: this.pits, bats: this.bats, arrows: this.arrows });
  }
  
  randomRoom() {
    return Math.floor(Math.random()*20)+1;
  }

  randomRoomExcluding(excluded) {
    let r;
    do { r = this.randomRoom(); } while (excluded.includes(r));
    return r;
  }

  exitgame() {
    this.gamestatus = GameStatus.GAME_OVER;
    this.notifyChange("exitGame");
  }

  describeRoom() {
    if (this.gamestatus === GameStatus.GAME_OVER) return;
    this.println("\nYou are in room " + this.player);
    this.println("Tunnels lead to: " +this.rooms[this.player].join(", "));
    if (this.rooms[this.player].includes(this.wumpus))
      this.println("You smell a Wumpus!");
    if (this.rooms[this.player].some(r=>this.pits.includes(r)))
      this.println("You feel a cold draft.");
    if (this.rooms[this.player].some(r=>this.bats.includes(r)))
      this.println("You hear flapping.");
    this.println("Arrows:" + this.arrows);
    this.flush();
  }

  move(room) {
    if (!this.rooms[this.player].includes(room)) {
      this.println("You can't go there.");
    }

    if (room === 0) {
      this.println("You fell into a crack!");
      this.exitgame();
    }

    this.player = room;

    if (this.player === this.wumpus) {
      this.println("The Wumpus ate you!");
      this.exitgame();
    }

    if (this.pits.includes(this.player)) {
      this.println("You fell into a pit!");
      this.exitgame();
    }

    if (this.bats.includes(this.player)) {
      this.println("Bats carry you away!");
      this.player = this.randomRoom();
      this.checkHazards();
    }
    this.flush();
  }

  shoot(room) {
    this.arrows--;

    if (this.rooms[this.player].includes(room)) {
      if (room === this.wumpus) {
        this.println("You killed the Wumpus! You win!");
        this.exitgame();
      } else {
        this.println("Missed!");
        this.moveWumpus();
      }
    } else {
      this.println("Arrow can't reach that room.");
    }

    if (this.arrows === 0) {
      this.println("Out of arrows. Game over.");
      this.exitgame();
    }
    this.flush();
  }

  moveWumpus() {
    if (Math.random() < 0.75) {
      const options = this.rooms[this.wumpus];
      this.wumpus = options[Math.floor(Math.random()*options.length)];
    }

    if (this.wumpus === this.player) {
      this.println("The Wumpus moved into your room and ate you!");
      this.exitgame();
    }
  }

  checkHazards() {
    if (this.player === this.wumpus) {
      this.println("The Wumpus ate you!");
      this.exitgame();
    }
    if (this.pits.includes(this.player)) {
      this.println("You fell into a pit!");
      this.exitgame();
    }
  }
}
