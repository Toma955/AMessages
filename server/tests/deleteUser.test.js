const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const config = require("./testUtils");

describe("🧹 Brisanje korisnika iz testConfig", () => {
  const user = config.users.user1;

  const clientDb = new Database(path.resolve(__dirname, "../database/data/client_info.db"));
  const authDb = new Database(path.resolve(__dirname, "../database/data/auth.db"));

  let usernamesDb;
  const usernamesDbPath = path.resolve(__dirname, "../database/data/usernames.db");
  if (fs.existsSync(usernamesDbPath)) {
    usernamesDb = new Database(usernamesDbPath);
  }

  test("Briše korisnika iz baza i filesystema", () => {
    const clientUser = clientDb
      .prepare("SELECT id FROM clients WHERE username = ?")
      .get(user.username);

    if (!clientUser) {
      console.log(" Korisnik ne postoji, preskačem brisanje");
      return expect(true).toBe(true);
    }

    const { id } = clientUser;

    clientDb.prepare("DELETE FROM clients WHERE id = ?").run(id);
    authDb.prepare("DELETE FROM credentials WHERE username = ?").run(user.username);

    if (usernamesDb) {
      try {
        usernamesDb.prepare("DELETE FROM usernames WHERE username = ?").run(user.username);
      } catch (err) {
        console.log(`Preskacem brisanje iz usernames: ${err.message}`);
      }
    }

    const userFolder = path.resolve(__dirname, `../database/users/${id}`);
    if (fs.existsSync(userFolder)) {
      fs.rmSync(userFolder, { recursive: true, force: true });
    }

    console.log(`Obrisani podaci za korisnika: ${user.username}`);
    expect(true).toBe(true);
  });

  afterAll(() => {
    clientDb.close();
    authDb.close();
    if (usernamesDb) usernamesDb.close();
  });
});
