const Status = Object.freeze({
  //  START_OVER  : "START_OVER",
    MOVE_OR_SHOOT: "MOVE_OR_SHOOT",
    ASK_ROOM: "ASK_ROOM",
    SHOOT_ROOM: "SHOOT_ROOM",
    GAME_OVER: "GAME_OVER"
});

class WumpusController {
    constructor(documentModel) {
        this.game = documentModel;
        this.stat = Status.MOVE_OR_SHOOT;
        // Initialize View with a callback to handleCommand
        this.view = new ConsoleView((cmd) => this.handleCommand(cmd));
        // Listen to Model updates
        this.game.addListener((event, data) => this.documentChanged(event, data));
        this.game.init();
        this.updatePrompt();
    }
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
   
    async documentChanged(event, data) {
        if (event === "updated") {
            this.view.print(this.game.textout);
            this.game.clear();
        } else if (event === "exitGame") {
            this.view.setPrompt("### Game Over ###");
            this.view.print(this.game.textout);
            this.game.clear();
            this.view.println("Thanks for playing!");
            await this.sleep(4000);
            this.stat = Status.GAME_OVER;
        }
        this.updatePrompt();
    }

    handleCommand(command) {
        // Echo the command back to history
        if (this.stat === Status.MOVE_OR_SHOOT) {
            var cmd = command.trim().toLowerCase();
            if (cmd === "m") {
                this.stat = Status.ASK_ROOM;
            } else if (cmd === "s") {
                this.stat = Status.SHOOT_ROOM;
            } else {
                this.view.println("Invalid command. Please enter 'm' to move or 's' to shoot.");
                //this.updatePrompt();
                //return;
            }
        } else if (this.stat === Status.ASK_ROOM) {
            var roomnum = parseInt(command.trim());
            if (isNaN(roomnum) || roomnum < 0 || roomnum > 20) {
                this.view.println("Invalid room number. Please enter a number between 1 and 20.");
                //this.updatePrompt();
                //return;
            }
            this.game.move(roomnum);
            this.game.describeRoom();
            this.stat = Status.MOVE_OR_SHOOT;
        } else if (this.stat === Status.SHOOT_ROOM) {
            this.game.shoot(parseInt(command.trim() ));
            var roomnum = parseInt(command.trim());
            if (isNaN(roomnum) || roomnum < 1 || roomnum > 20) {
                this.view.println("Invalid room number. Please enter a number between 1 and 20.");
                //this.updatePrompt();
                //return;
            }
            this.game.describeRoom();
            this.stat = Status.MOVE_OR_SHOOT;
        } else if (this.stat === Status.GAME_OVER) {
            this.game.init();
            this.stat = Status.MOVE_OR_SHOOT;
        }
        this.updatePrompt();
    }

    updatePrompt() {
        if (this.stat === Status.MOVE_OR_SHOOT) {
            this.view.setPrompt("Move or Shoot? (m/s): ");
        } else if (this.stat === Status.ASK_ROOM) {
            this.view.setPrompt("Enter room number: ");
        } else if (this.stat === Status.SHOOT_ROOM) {            
            this.view.setPrompt("Enter room to shoot: ");
        } else if (this.stat === Status.GAME_OVER) {
            this.view.setPrompt("Game Over. Press enter key to play again: ");
        }
    }
}

// Initialization
const game = new WumpusGame();
const controller = new WumpusController(game);