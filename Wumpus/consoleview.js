class ConsoleView {
    constructor(onCommandCallback) {
        this.history = document.getElementById('history');
        this.input = document.getElementById('input');
        this.content = document.getElementById('terminal');
        
        this.onCommand = onCommandCallback;
        this.prompt = ">";
        this.scrollBarAdjustment = 73;
        this.clear();
        this.numline = 0;
        this.lineprinted = 0;
        this.showPromptAfterLine = 100000;
        this.initEventListeners();
    }

    initEventListeners() {
        // Selection/Caret logic
        document.addEventListener('selectionchange', () => {
            if (document.activeElement.id !== 'input') return;
            const range = window.getSelection().getRangeAt(0);
            if (range.endOffset < this.input.textContent.length) {
                this.input.classList.add('noCaret');
            } else {
                this.input.classList.remove('noCaret');
            }
        });

        // Global focus redirection
        document.addEventListener('keydown', (e) => {
            if (e.target !== this.input) this.focusAndMoveCursorToTheEnd();
        });

        // Input handling
        this.input.addEventListener('keydown', (e) => {
            if (this.input.textContent.length <= this.prompt.length && e.key === 'Backspace') {
                e.preventDefault();
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                const command = this.input.textContent.substring(this.prompt.length);
                this.println(this.prompt + command);
                this.input.style.visibility = 'hidden';
                this.onCommand(command);
            }
        });

        this.input.addEventListener('input', () => this.handlePaste());
    }

    cls() {
        this.textBuffer = "";
        this.history.innerHTML = "";
        this.setPrompt(this.prompt); // Reset prompt and focus  
    }

    clear() {
        this.textBuffer = "";
    }

    handlePaste() {
        if (this.input.childElementCount > 0) {
            const lines = this.input.innerText.replace(/\n$/, '').split('\n');
            const lastLine = lines.pop();
            lines.forEach(line => this.onCommand(line));
            this.setRawInput(lastLine);
        }
    }

    setPrompt(newPrompt) {
        this.prompt = newPrompt;
        this.input.textContent = this.prompt;
        this.showPromptAfterLine = this.numline;
        this.focusAndMoveCursorToTheEnd();
    }

    setRawInput(text) {
        this.input.textContent = text;
        this.focusAndMoveCursorToTheEnd();
    }

    print(text) {
        this.textBuffer += text;
        this.flush();
    }

    println(text) {
        this.textBuffer += text + "\n";
        this.flush();
    }

    flush() {
        if (!this.textBuffer || this.textBuffer === '') return;
//        const lines = this.textBuffer.trim().split('\n');
        const lines = this.textBuffer.split('\n');
        this.clear();
        let index = 0;
        this.numline += lines.length;
        const addLine = () => {
            if (index < lines.length) {
                const div = document.createElement('DIV');
                div.textContent = lines[index] === '' ? '\n' : lines[index];
                this.history.appendChild(div);
                index++;
                this.scrollToEnd();
                if (this.lineprinted >= this.showPromptAfterLine-1) {
                    this.input.style.visibility = 'visible';
                    this.focusAndMoveCursorToTheEnd();
                } else {
                    this.input.style.visibility = 'hidden';
                }
                this.lineprinted += 1;
                setTimeout(addLine, 100);
            } 
        };
        addLine();
    }

    scrollToEnd() {
        this.content.scrollTo({
            top: this.content.scrollHeight - this.content.clientHeight - this.scrollBarAdjustment,
            behavior: "auto"
        });
    }

    focusAndMoveCursorToTheEnd() {
        this.input.focus();
        const range = document.createRange();
        const selection = window.getSelection();
        const { childNodes } = this.input;
        const lastChildNode = childNodes && childNodes.length - 1;
        
        range.selectNodeContents(lastChildNode === -1 ? this.input : childNodes[lastChildNode]);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}
