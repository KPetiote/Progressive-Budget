// DB JS
// ---------------------------------------------------------------------------

const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

let db;
// Creates a new db request for budget database
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = (event) => {
    event.target.result.createObjectStore("pending", {
        keyPath: "id",
        autoIncrement: true
    });
};

request.onsuccess = (event) => {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = (err) => {
    // Logs error message
    console.log(err.message);
};

function saveRecord(record) {

    // Creates a transaction in the pending database with read-write access
    const transaction = db.transaction("pending", "readwrite");

    // Accesses the pending object store
    const store = transaction.objectStore("pending");
    
    // Adds a record to the store with add method
    store.add(record);
}

function checkDatabase() {

    // Opens a transaction in pending db
    const transaction = db.transaction("pending", "readonly");

    // Accesses all pending object store
    const store = transaction.objectStore("pending");
    
    // Gets all records from the store and sets them to a variable
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
            headers: {
                Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
            }
        })
        .then((response) => response.json())
        .then(() => {

            // If successful, a transaction in pending db opens
            const transaction = db.transaction("pending", "readwrite");

            // Accesses all pending object store
            const store = transaction.objectStore("pending");

            // Clears all items in store
            store.clear();
        });
        }
    };
}

// Checks if app came back online
window.addEventListener("online", checkDatabase);