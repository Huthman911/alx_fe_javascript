const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Mock API
const quotes = JSON.parse(localStorage.getItem("quotes")) || [];

// Function to save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
  localStorage.setItem("categories", JSON.stringify(getUniqueCategories()));
}

// Function to display a random quote
function showRandomQuote() {
    const quoteDisplay = document.getElementById("quoteDisplay");
    if (quotes.length === 0) {
      quoteDisplay.textContent = "No quotes available. Add one!";
      return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const { text, category } = quotes[randomIndex];
    quoteDisplay.innerHTML = `<p><strong>${category}:</strong> "${text}"</p>`;
    sessionStorage.setItem("lastViewedQuote", JSON.stringify({ text, category }));
  }
  
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Function to create and add a new quote form dynamically
function createAddQuoteForm() {
    const formContainer = document.createElement("div");
    
    const inputText = document.createElement("input");
    inputText.setAttribute("type", "text");
    inputText.setAttribute("id", "newQuoteText");
    inputText.setAttribute("placeholder", "Enter a new quote");
  
    const inputCategory = document.createElement("input");
    inputCategory.setAttribute("type", "text");
    inputCategory.setAttribute("id", "newQuoteCategory");
    inputCategory.setAttribute("placeholder", "Enter quote category");
  
    const addButton = document.createElement("button");
    addButton.textContent = "Add Quote";
    addButton.addEventListener("click", addQuote);
  
    formContainer.appendChild(inputText);
    formContainer.appendChild(inputCategory);
    formContainer.appendChild(addButton);
  
    document.body.appendChild(formContainer);
  }
  
  // Function to add a new quote to the list dynamically
  function addQuote() {
    const newText = document.getElementById("newQuoteText").value.trim();
    const newCategory = document.getElementById("newQuoteCategory").value.trim();
    
    if (newText === "" || newCategory === "") {
      alert("Please enter both a quote and a category.");
      return;
    }
    
    quotes.push({ text: newText, category: newCategory });
    saveQuotes();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("Quote added successfully!");
  }

// Fetch quotes from server and sync with local storage
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL, { method: "POST", headers: { "Content-Type": "application/json" } });
    const serverQuotes = await response.json();
    
    let newQuotes = serverQuotes.map(q => ({ text: q.title, category: "Uncategorized" }));
    let mergedQuotes = mergeQuotes(quotes, newQuotes);
    
    localStorage.setItem("quotes", JSON.stringify(mergedQuotes));
    alert("Quotes synced with server!");
    populateCategories();
  } catch (error) {
    console.error("Error syncing with server:", error);
  }
}

// Function to merge local and server quotes, resolving conflicts
function mergeQuotes(local, server) {
  let merged = [...local];
  server.forEach(sq => {
    if (!local.some(lq => lq.text === sq.text)) {
      merged.push(sq);
    }
  });
  return merged;
}

// Function to populate categories dropdown
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  getUniqueCategories().forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  
  const lastCategory = localStorage.getItem("selectedCategory");
  if (lastCategory) {
    categoryFilter.value = lastCategory;
    filterQuotes();
  }
}

// Function to filter quotes based on category selection
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  const quoteDisplay = document.getElementById("quoteDisplay");
  
  let filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "No quotes available for this category.";
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const { text, category } = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `<p><strong>${category}:</strong> "${text}"</p>`;
}

document.getElementById("newQuote").addEventListener("click", filterQuotes);

document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  filterQuotes();
  syncWithServer(); // Initial sync with server on page load
  setInterval(syncWithServer, 60000); // Sync every 60 seconds
});

// Function to add a new quote dynamically
function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();
  
  if (newText === "" || newCategory === "") {
    alert("Please enter both a quote and a category.");
    return;
  }
  
  quotes.push({ text: newText, category: newCategory });
  saveQuotes();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added successfully!");
  populateCategories();
}

// Function to export quotes as a JSON file
function exportToJsonFile() {
  const dataStr = "data:application/json; Blob," + encodeURIComponent(JSON.stringify(quotes));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "quotes.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    alert("Quotes imported successfully!");
    populateCategories();
  };
  fileReader.readAsText(event.target.files[0]);
}