let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { id: 1, text: "Knowledge is power.", category: "Education", lastModified: Date.now() },
  { id: 2, text: "Simplicity is the ultimate sophistication.", category: "Philosophy", lastModified: Date.now() },
  { id: 3, text: "Code is like humor. When you have to explain it, it is bad.", category: "Technology", lastModified: Date.now() }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const importFileInput = document.getElementById("importFile");
const exportButton = document.getElementById("exportQuotes");
const categoryFilter = document.getElementById("categoryFilter");


function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  const selectedCategory = localStorage.getItem('lastCategory') || 'all';

  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  uniqueCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    if (cat === selectedCategory) option.selected = true;
    categoryFilter.appendChild(option);
  });
}

function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem('lastCategory', selectedCategory);

  let filteredQuotes = selectedCategory === 'all' ? quotes : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const selectedQuote = filteredQuotes[randomIndex];

  sessionStorage.setItem('lastQuote', JSON.stringify(selectedQuote));

  quoteDisplay.innerHTML = '';

  const quoteText = document.createElement("p");
  quoteText.textContent = `"${selectedQuote.text}"`;

  const quoteCategory = document.createElement("small");
  quoteCategory.textContent = `Category: ${selectedQuote.category}`;

  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
}


function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";
  quoteInput.id = "newQuoteText";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.id = "newQuoteCategory";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!quoteText || !quoteCategory) {
    alert("Please enter both a quote and a category.");
    return;
  }

  const newQuote = {
    id: Date.now(),
    text: quoteText,
    category: quoteCategory,
    lastModified: Date.now()
  };

  quotes.push(newQuote);
  saveQuotes();
  populateCategories();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  filterQuotes();
}
-
function exportQuotes() {
  const json = JSON.stringify(quotes, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (!Array.isArray(importedQuotes)) {
        alert("Invalid JSON format. Must be an array of quotes.");
        return;
      }
      importedQuotes.forEach(q => {
        if (!q.id) q.id = Date.now() + Math.floor(Math.random() * 1000);
        if (!q.lastModified) q.lastModified = Date.now();
        quotes.push(q);
      });
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
      filterQuotes();
    } catch (err) {
      alert("Error parsing JSON file.");
      console.error(err);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}


const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; 

async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    const serverQuotes = serverData.map(item => ({
      id: item.id,
      text: item.title || item.body,
      category: "General",
      lastModified: Date.now()
    }));

    syncQuotes(serverQuotes);

  } catch (err) {
    console.error("Error fetching server quotes:", err);
  }
}

async function sendLocalChangesToServer() {
  try {
    for (const quote of quotes) {
      await fetch(SERVER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(quote)
      });
    }
  } catch (err) {
    console.error("Error sending quotes to server:", err);
  }
}

function syncQuotes(serverQuotes) {
  let conflictsResolved = 0;

  serverQuotes.forEach(serverQuote => {
    const localIndex = quotes.findIndex(q => q.id === serverQuote.id);

    if (localIndex === -1) {
      quotes.push(serverQuote);
    } else {
      if (serverQuote.lastModified > quotes[localIndex].lastModified) {
        quotes[localIndex] = serverQuote;
        conflictsResolved++;
      }
    }
  });

  if (conflictsResolved > 0) {
    alert(`${conflictsResolved} quotes were updated from the server due to conflicts.`);
  } else {
    alert("Quotes synced with server!");
  }

  saveQuotes();
  populateCategories();
  filterQuotes();
}


newQuoteButton.addEventListener("click", filterQuotes);
exportButton.addEventListener("click", exportQuotes);
importFileInput.addEventListener("change", importFromJsonFile);
categoryFilter.addEventListener("change", filterQuotes);


createAddQuoteForm();
populateCategories();
filterQuotes();
fetchQuotesFromServer(); ync
setInterval(fetchQuotesFromServer, 30000);
