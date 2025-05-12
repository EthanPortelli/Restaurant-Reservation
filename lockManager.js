// Import required module
const { Mutex } = require('async-mutex');

// Map to hold one mutex per tableID
const tableLocks = new Map();
function getTableMutex(tableID) {
    if (!tableLocks.has(tableID)) {
        tableLocks.set(tableID, new Mutex());
    }
    return tableLocks.get(tableID);
}


module.exports = { getTableMutex }; // Export the mutex for uses
