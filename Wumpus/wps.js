const readline = require("readline");

class WumpusGame {
  constructor() {
    this.rooms = {
      1:[2,5,8], 2:[1,3,10], 3:[2,4,12], 4:[3,5,14], 5:[1,4,6],
      6:[5,7,15], 7:[6,8,17], 8:[1,7,9], 9:[8,10,18], 10:[2,9,11],
      11:[10,12,19], 12:[3,11,13], 13:[12,14,20], 14:[4,13,15],
      15:[6,14,16], 16:[15,17,20], 17:[7,16,18], 18:[9,17,19],
      19:[11,18,20], 20:[13,16,19]
    };

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

    this.arrows = 5;
  }

  randomRoom() {
    return Math.floor(Math.random()*20)+1;
  }

  randomRoomExcluding(excluded) {
    let r;
    do { r = this.randomRoom(); } while (excluded.includes(r));
    return r;
  }

  describeRoom() {
    console.log("\nYou are in room", this.player);
    console.log("Tunnels lead to:", this.rooms[this.player].join(", "));

    if (this.rooms[this.player].includes(this.wumpus))
      console.log("You smell a Wumpus!");
    if (this.rooms[this.player].some(r=>this.pits.includes(r)))
      console.log("You feel a cold draft.");
    if (this.rooms[this.player].some(r=>this.bats.includes(r)))
      console.log("You hear flapping.");
  }

  move(room) {
    if (!this.rooms[this.player].includes(room)) {
      console.log("You can't go there.");
      return;
    }

    this.player = room;

    if (this.player === this.wumpus) {
      console.log("The Wumpus ate you!");
      process.exit();
    }

    if (this.pits.includes(this.player)) {
      console.log("You fell into a pit!");
      process.exit();
    }

    if (this.bats.includes(this.player)) {
      console.log("Bats carry you away!");
      this.player = this.randomRoom();
      this.checkHazards();
    }
  }

  shoot(room) {
    this.arrows--;

    if (this.rooms[this.player].includes(room)) {
      if (room === this.wumpus) {
        console.log("You killed the Wumpus! You win!");
        process.exit();
      } else {
        console.log("Missed!");
        this.moveWumpus();
      }
    } else {
      console.log("Arrow can't reach that room.");
    }

    if (this.arrows === 0) {
      console.log("Out of arrows. Game over.");
      process.exit();
    }
  }

  moveWumpus() {
    if (Math.random() < 0.75) {
      const options = this.rooms[this.wumpus];
      this.wumpus = options[Math.floor(Math.random()*options.length)];
    }

    if (this.wumpus === this.player) {
      console.log("The Wumpus moved into your room and ate you!");
      process.exit();
    }
  }

  checkHazards() {
    if (this.player === this.wumpus) {
      console.log("The Wumpus ate you!");
      process.exit();
    }
    if (this.pits.includes(this.player)) {
      console.log("You fell into a pit!");
      process.exit();
    }
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const game = new WumpusGame();

function turn() {
  game.describeRoom();
  console.log("Arrows:", game.arrows);

  rl.question("Move or Shoot? (m/s): ", action => {

    if (action === "m") {
      rl.question("Room number: ", r => {
        game.move(parseInt(r));
        turn();
      });
    }

    else if (action === "s") {
      rl.question("Shoot into room: ", r => {
        game.shoot(parseInt(r));
        turn();
      });
    }

    else {
      turn();
    }

  });
}

console.log("HUNT THE WUMPUS");
turn();