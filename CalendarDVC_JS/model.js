class CalendarDocument {

  constructor() {
    this.listeners = [];
    this.year = NaN;
    this.month = NaN;
    this.textout = "";
  }

  setMonth(month) {
    this.month = month;
    this.notifyChange("monthChanged", month);
  }

  setYear(year) {
    this.year = year;
    this.notifyChange("yearChanged", year);
  }

  printCalendarMonth() {  // 2. Set up date information
    if (isNaN(this.year) || isNaN(this.month)) {
      this.notifyChange("error", "Year and month must be set before printing calendar.");
      return;
    }
    
    const date = new Date(this.year, this.month, 1);
    const monthName = date.toLocaleString('default', { month: 'long' });

    // Find which day of the week the 1st falls on (0 = Sunday, 6 = Saturday)
    const firstDayIndex = date.getDay();
    
    // Get total days in month (setting day to 0 of the next month gives last day of current)
    const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();
    this.textout = ""; // Clear previous output before building new calendar
     
    // 3. Build the Header
    this.println(`\n    ${monthName}   ${this.year}`);
    this.println(" Su  Mo  Tu  We  Th  Fr  Sa");

    // 4. Build the Calendar Grid
    
    // Add leading spaces for the first week
    for (let i = 0; i < firstDayIndex; i++) {
      this.print("    "); 
    }

    // Fill in the days
    for (let day = 1; day <= daysInMonth; day++) {
      // Format day to take up 2 characters (e.g., " 1" or "10")
      this.print(String(day).padStart(3, " ") + " ")
      // If it's Saturday (end of week) or the last day of the month, print the line
      if ((day + firstDayIndex) % 7 === 0 || day === daysInMonth) {
        this.println("");
      }
    }
    this.println(""); // Add an extra newline at the end
    this.flush();
  }

  print(text) {
    this.textout += text;
  }

  println(text) {
    this.textout += text  + "\n";
  }
  
  flush() {
    this.notifyChange("calendarUpdated", { year: this.year, month: this.month });
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  notifyChange(event, data) {
    this.listeners.forEach(function(listener) {
      listener(event, data);
    });
  }

}



