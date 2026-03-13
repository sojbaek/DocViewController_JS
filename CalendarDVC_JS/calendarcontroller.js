const Status = Object.freeze({
    INIT_ASK_YEAR: "INIT_ASK_YEAR",
    ASK_MONTH: "ASK_MONTH"
});

class CalendarController {
    constructor(documentModel) {
        this.doc = documentModel;
        this.stat = Status.INIT_ASK_YEAR;
        
        // Initialize View with a callback to handleCommand
        this.view = new ConsoleView((cmd) => this.handleCommand(cmd));

        // Listen to Model updates
        this.doc.addListener((event, data) => this.documentChanged(event, data));

        this.initWelcomeMessage();
    }

    initWelcomeMessage() {
        this.view.println("Welcome to the Web Terminal Calendar.");
        this.view.println("Please enter the year and month to display the calendar.");
        this.view.println("For example, enter '2026' for year and '1' for January.\n");
        this.updatePrompt();
    }

    documentChanged(event, data) {
        if (event === "calendarUpdated") {
            this.view.println(this.doc.textout);
            this.stat = Status.INIT_ASK_YEAR;
        } else if (event === "yearChanged") {
            this.stat = Status.ASK_MONTH;
        } else if (event === "monthChanged") {
            this.doc.printCalendarMonth();
        } else if (event === "error") {
            this.view.println(`Error: ${data}`);
        }
        this.updatePrompt();
    }

    handleCommand(command) {
        // Echo the command back to history
        this.view.println(this.view.prompt + command);
        if (this.stat === Status.INIT_ASK_YEAR) {
            const year = parseInt(command.trim());
            if (isNaN(year)) {
                this.view.println("Invalid input. Please enter a valid year.");
                this.updatePrompt();
            } else {
                this.doc.setYear(year);
            }
        } else if (this.stat === Status.ASK_MONTH) {
            const month = parseInt(command.trim());
            if (isNaN(month) || month < 1 || month > 12) {
                this.view.println("Invalid input. Please enter a valid month (1-12).");
                this.updatePrompt();
            } else {
                this.doc.setMonth(month - 1);
                // State is reset inside documentChanged usually, but setting here for safety
            }
        }
    }

    updatePrompt() {
        const promptText = (this.stat === Status.INIT_ASK_YEAR) 
            ? "Enter Year (e.g., 2026):" 
            : "Enter Month (1-12):";
        this.view.setPrompt(promptText);
    }
}

// Initialization
const documentModel = new CalendarDocument();
const controller = new CalendarController(documentModel);