const Status = Object.freeze({
    INIT_ASK_YEAR: "INIT_ASK_YEAR",
    ASK_MONTH: "ASK_MONTH"
});

class CalendarViewController {

  constructor(documentModel) {

    this.doc = documentModel;
    this.prompt = ">"
    this.stat = Status.INIT_ASK_YEAR
    
    this.history = document.getElementById('history');
    this.input = document.getElementById('input');
    this.cursor = document.getElementById('cursor');
    this.content = document.getElementById('terminal');

    this.newline = "\n";
    this.maxScroll = this.content.scrollHeight;
    this.scrollBarAdjustment = 73; // Adjust this value based on padding/margin if necessary

    var textout = "";  // Global variable to hold the output text

    document.addEventListener('selectionchange', () => {
        if (document.activeElement.id !== 'input') return;
        
        const range = window.getSelection().getRangeAt(0);
        const start = range.startOffset;
        const end = range.endOffset;
        const length = this.input.textContent.length;
        
        if (end < length) {
            this.input.classList.add('noCaret');
        } else {
            this.input.classList.remove('noCaret');
        }
    });

    this.doc.addListener(
      (event, data) => this.documentChanged(event, data)
    );

    this.input.addEventListener('input', () => this.getInput());

    document.addEventListener('keydown', (e) => {   
    // If some key is pressed outside the input, focus it and move the cursor
    // to the end:
        if (e.target !== this.input) this.focusAndMoveCursorToTheEnd();
    });

    this.input.addEventListener('keydown', (e) => {    
    if (this.input.textContent.length === 1 && e.key === 'Backspace') { // Prevent deleting the this.prompt character
        e.preventDefault();
        return;
    }
    if (e.key === 'Enter') {
        e.preventDefault();
        this.handleCommand(this.input.textContent.substring(this.prompt.length)); // Remove the '> ' this.prompt characters
        this.input.textContent = this.prompt;
        this.focusAndMoveCursorToTheEnd();
    }
    });


    // Set the focus to the input so that you can start typing straigh away:
    if (this.stat === Status.INIT_ASK_YEAR) {
        this.println("Welcome to the Web Terminal Calendar.");
        this.println("Please enter the year and month to display the calendar.");
        this.println("For example, enter '2026' for year and '1' for January.");
        this.println("");
        this.flush();
        this.updatePrompt()
    }   

    this.input.focus();
    this.focusAndMoveCursorToTheEnd();

    this.content.addEventListener("scroll", function () {
        // Get vertical scroll position
        console.log("Scroll Top: " + this.content.scrollTop);
        console.log("Scroll Height: " + this.content.scrollHeight);
        console.log("Client Height: " + this.content.clientHeight);
        // make scrollTop = concent.scrollHeight - content.clientHeight - 93.5;
    });
    }

  documentChanged(event, data) {
    if(event === "calendarUpdated") {
      this.puts2(this.doc.textout);
      this.doc.textout = "";
      this.stat = Status.INIT_ASK_YEAR
      this.updatePrompt();
      this.scrollToEnd();
      console.log("Document changed: calendar updated" + data);
    }
  }

  flush() {
    this.puts2(this.textout);
    this.textout = "";
  }

  puts2(text) {
    const line = document.createElement('DIV');
    line.textContent = text;
    this.history.appendChild(line);
  }

  print(text) {
    this.textout += text;
  }

  println(text) {
    this.textout += text  + "\n";
  }

  handleCommand(command) {
    this.puts2(this.prompt + command);
    if (this.stat == Status.INIT_ASK_YEAR) {
        const year = parseInt(command.trim());
        if (isNaN(year)) {
        this.puts2("Invalid input. Please enter a valid year.");
        input.textContent = this.prompt;
        return;
        } else {
        this.doc.setYear(year);
        this.stat = Status.ASK_MONTH;
        this.updatePrompt();
        }
    } else if (this.stat === Status.ASK_MONTH) {
        const month = parseInt(command.trim());
        if (isNaN(month) || month < 0 || month > 12) {
        this.puts2("Invalid input. Please enter a valid month (1<= month <=12).");
        input.textContent = this.prompt;
        return;
        } else {
        this.doc.setMonth(month - 1); // month -1 because JS months are 0-indexed
        this.doc.printCalendarMonth(); // month -1 because JS months are 0-indexed
        this.stat = Status.INIT_ASK_YEAR; // Reset to initial state for the next command
        }
    } else {
        input.textContent = this.prompt;
    }
  }

  getInput() {    
    // If we paste HTML, format it as plain text and break it up
    // input individual lines/commands:
    if (input.childElementCount > 0) {
        const lines = input.innerText.replace(/\n$/, '').split('\n');
        const lastLine = lines[lines.length - 1];
        
        for (let i = 0; i <= lines.length - 2; ++i) {
        this.handleCommand(lines[i]);
        }
    
        input.textContent = lastLine;
        
        this.focusAndMoveCursorToTheEnd();
    }
    
    // If we delete everything, display the square caret again:
    if (input.innerText.length === 0) {
        input.classList.remove('noCaret');  
    }  
   }

  updatePrompt = (text) => {
    if (this.stat === Status.INIT_ASK_YEAR) {
        this.prompt = "Enter Year (e.g., 2026):";
    } else if (this.stat === Status.ASK_MONTH) {
        this.prompt = "Enter Month (1-12):";
    }
    input.textContent = this.prompt;
 }

  scrollToEnd() {
    this.content.scrollTo({
    top: this.content.scrollHeight - this.content.clientHeight - this.scrollBarAdjustment, // Adjusted for padding/margin if necessary
    behavior: "auto" // or "smooth"
    });
  }

  focusAndMoveCursorToTheEnd(e) {  
    this.input.focus();
    
    const range = document.createRange();
    const selection = window.getSelection();
    const { childNodes } = this.input;
    const lastChildNode = childNodes && childNodes.length - 1;
    
    range.selectNodeContents(lastChildNode === -1 ? this.input : childNodes[lastChildNode]);
    range.collapse(false);

    selection.removeAllRanges();
    selection.addRange(range);
    this.scrollToEnd();
  }
}

const documentModel = new CalendarDocument();
const controller = new CalendarViewController(documentModel);
