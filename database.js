const Database = require("better-sqlite3");
const db = new Database("fishtopia.db", {
    verbose: console.log
});

function setUpDatabase() {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            coins INTEGER DEFAULT 0,
            gold INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            xp INTEGER DEFAULT 0,
            data TEXT DEFAULT '{}',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        `).run();
    console.log("Database initialized successfully.");
}

setUpDatabase();