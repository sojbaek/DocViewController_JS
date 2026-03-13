// webterminalcalendar/console.js
// A simple web terminal that displays a calendar for a given month and year
// By SBaek 2026 

const history = document.getElementById('history');
const input = document.getElementById('input');
const cursor = document.getElementById('cursor');
const content = document.getElementById('terminal');
const newline = "\n";
const maxScroll = content.scrollHeight;
const scrollBarAdjustment = 73; // Adjust this value based on padding/margin if necessary

var textout = "";  // Global variable to hold the output text

const Status = Object.freeze({
  INIT_ASK_YEAR: "INIT_ASK_YEAR",
  ASK_MONTH: "ASK_MONTH"
});

updatePrompt = (text) => {
  prompt = text;
  input.textContent = prompt;
}
function scrollToEnd() {
  content.scrollTo({
  top: content.scrollHeight - content.clientHeight - scrollBarAdjustment, // Adjusted for padding/margin if necessary
  behavior: "auto" // or "smooth"
  });
}

function focusAndMoveCursorToTheEnd(e) {  
  input.focus();
  
  const range = document.createRange();
  const selection = window.getSelection();
  const { childNodes } = input;
  const lastChildNode = childNodes && childNodes.length - 1;
  
  range.selectNodeContents(lastChildNode === -1 ? input : childNodes[lastChildNode]);
  range.collapse(false);

  selection.removeAllRanges();
  selection.addRange(range);
  scrollToEnd();
}

function print(text) {
  textout += text;
}

function println(text) {
  textout += text  + "\n";
}

function flush() {
  puts2(textout);
  textout = "";
}

function puts2(text) {
  const line = document.createElement('DIV');
    line.textContent = text;
  history.appendChild(line);
}

function handleCommand(command) {
  puts2(prompt + command);
  if (stat == Status.INIT_ASK_YEAR) {
    year = parseInt(command.trim());
    if (isNaN(year)) {
      puts2("Invalid input. Please enter a valid year.");
      input.textContent = prompt;
      return;
    } else {
    stat = Status.ASK_MONTH;
    updatePrompt("Enter Month (1-12):");
    }
  } else if (stat === Status.ASK_MONTH) {
    month = parseInt(command.trim());
    if (isNaN(month) || month < 0 || month > 12) {
      puts2("Invalid input. Please enter a valid month (1<= month <=12).");
      input.textContent = prompt;
      return;
    } else {
      printCalendarMonth(year, month - 1); // month -1 because JS months are 0-indexed
      stat = Status.INIT_ASK_YEAR
      updatePrompt("Enter Year (e.g., 2026):");
    }
  } else {
    input.textContent = prompt;
  }
}

function getInput() 
{    
  // If we paste HTML, format it as plain text and break it up
  // input individual lines/commands:
  if (input.childElementCount > 0) {
    const lines = input.innerText.replace(/\n$/, '').split('\n');
    const lastLine = lines[lines.length - 1];
    
    for (let i = 0; i <= lines.length - 2; ++i) {
      handleCommand(lines[i]);
    }
  
    input.textContent = lastLine;
    
    focusAndMoveCursorToTheEnd();
  }
  
  // If we delete everything, display the square caret again:
  if (input.innerText.length === 0) {
    input.classList.remove('noCaret');  
  }  
}


// Every time the selection changes, add or remove the .noCursor
// class to show or hide, respectively, the bug square cursor.
// Note this function could also be used to enforce showing always
// a big square cursor by always selecting 1 chracter from the current
// cursor position, unless it's already at the end, in which case the
// #cursor element should be displayed instead.

var prompt = ">"
var year = NaN;
var month = NaN;
var stat = Status.INIT_ASK_YEAR


document.addEventListener('selectionchange', () => {
  if (document.activeElement.id !== 'input') return;
  
  const range = window.getSelection().getRangeAt(0);
  const start = range.startOffset;
  const end = range.endOffset;
  const length = input.textContent.length;
  
  if (end < length) {
    input.classList.add('noCaret');
  } else {
    input.classList.remove('noCaret');
  }
});

input.addEventListener('input', () => getInput());

document.addEventListener('keydown', (e) => {   
  // If some key is pressed outside the input, focus it and move the cursor
  // to the end:
  if (e.target !== input) focusAndMoveCursorToTheEnd();
});

input.addEventListener('keydown', (e) => {    
  if (input.textContent.length === 1 && e.key === 'Backspace') { // Prevent deleting the prompt character
    e.preventDefault();
    return;
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    handleCommand(input.textContent.substring(prompt.length)); // Remove the '> ' prompt characters
    input.textContent = prompt;
    focusAndMoveCursorToTheEnd();
  }
});


// Set the focus to the input so that you can start typing straigh away:
if (stat === Status.INIT_ASK_YEAR) {
  println("Welcome to the Web Terminal Calendar.");
  println("Please enter the year and month to display the calendar.");
  println("For example, enter '2026' for year and '1' for January.");
  println("");
  flush();
  updatePrompt("Enter Year (e.g., 2026):")
}   

input.focus();
focusAndMoveCursorToTheEnd();

content.addEventListener("scroll", function () {
      // Get vertical scroll position
    console.log("Scroll Top: " + content.scrollTop);
    console.log("Scroll Height: " + content.scrollHeight);
    console.log("Client Height: " + content.clientHeight);
    // make scrollTop = concent.scrollHeight - content.clientHeight - 93.5;
  });


