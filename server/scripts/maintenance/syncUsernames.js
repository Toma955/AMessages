const path = require("path");
const Database = require("sqlite3");

// Putanje do baza podataka
const dbPath = path.resolve(__dirname, "../../database/data");
const clientDbPath = path.join(dbPath, "client_info.db");
const usernamesDbPath = path.join(dbPath, "usernames.db");

console.log("Pokretanje skripte za sinkronizaciju korisničkih imena...");
console.log(`Putanja do client_info.db: ${clientDbPath}`);
console.log(`Putanja do usernames.db: ${usernamesDbPath}`);

try {
    // Povezivanje na baze
    const clientDb = new Database(clientDbPath, { fileMustExist: true });
    const usernamesDb = new Database(usernamesDbPath, { fileMustExist: true });

    console.log("Uspješno povezan na obje baze podataka.");

    // 1. Dohvati sve korisnike iz glavne baze (client_info.db)
    const allClients = clientDb.prepare("SELECT id, username FROM clients").all();
    console.log(`Pronađeno ${allClients.length} korisnika u 'client_info.db'.`);

    // 2. Dohvati sve korisnike iz baze korisničkih imena (usernames.db)
    const registeredUsernames = usernamesDb.prepare("SELECT id, username FROM registered_usernames").all();
    const registeredUsernameSet = new Set(registeredUsernames.map(u => u.username));
    console.log(`Pronađeno ${registeredUsernames.length} korisnika u 'usernames.db'.`);

    // 3. Pronađi korisnike koji nedostaju
    const missingUsers = allClients.filter(client => !registeredUsernameSet.has(client.username));

    if (missingUsers.length === 0) {
        console.log("Nema korisnika za sinkronizaciju. Baze su usklađene.");
        clientDb.close();
        usernamesDb.close();
        process.exit(0);
    }

    console.log(`Pronađeno ${missingUsers.length} korisnika koji nedostaju u 'usernames.db':`);
    missingUsers.forEach(user => console.log(`  - ID: ${user.id}, Username: ${user.username}`));

    // 4. Umetni korisnike koji nedostaju u usernames.db
    const insertStmt = usernamesDb.prepare("INSERT INTO registered_usernames (id, username) VALUES (?, ?)");

    const transaction = usernamesDb.transaction((users) => {
        for (const user of users) {
            insertStmt.run(user.id, user.username);
        }
        return users.length;
    });

    const insertedCount = transaction(missingUsers);
    console.log(`\nUspješno umetnuto ${insertedCount} korisnika u 'usernames.db'.`);

    // Zatvaranje konekcija
    clientDb.close();
    usernamesDb.close();

    console.log("\nSinkronizacija je uspješno završena!");

} catch (error) {
    console.error("\nDošlo je do greške tijekom sinkronizacije:", error.message);
    if (error.code === 'SQLITE_ERROR' && error.message.includes('no such table')) {
        console.error("Provjerite postoje li tablice 'clients' i 'registered_usernames' u bazama.");
    } else if (error.code === 'SQLITE_CANTOPEN') {
        console.error("Provjerite jesu li putanje do baza podataka ispravne i postoje li datoteke.");
    }
} 