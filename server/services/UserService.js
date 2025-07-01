import CreateUser from "../models/CreateUser.js";
import fs from "fs";
import path from "path";
import checkDiskSpace from "check-disk-space";

async function createNewUser(userData) {
    try {
        const requiredFields = ["username", "name", "surname", "gender", "date_of_birth"];
        for (const field of requiredFields) {
            if (!userData[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        const allowedGenders = ["male", "female"];
        if (!allowedGenders.includes(userData.gender)) {
            throw new Error("Invalid gender: must be 'male' or 'female'");
        }

        const nameRegex = /^[A-Za-zčćžšđČĆŽŠĐ\s-]+$/;

        if (!nameRegex.test(userData.name)) {
            throw new Error("Invalid characters in name");
        }

        if (!nameRegex.test(userData.surname)) {
            throw new Error("Invalid characters in surname");
        }

        const disk = await checkDiskSpace(path.resolve(__dirname, "../"));
        if (disk.free < 10 * 1024 * 1024) {
            throw new Error("Not enough disk space (requires at least 10MB)");
        }

        const testPath = path.resolve(__dirname, "../database/test.tmp");
        try {
            fs.writeFileSync(testPath, "test");
            fs.unlinkSync(testPath);
        } catch (err) {
            throw new Error("Filesystem write failed. Cannot proceed.");
        }

        const result = CreateUser(userData);
        return result;
    } catch (err) {
        throw new Error("Failed to create user: " + err.message);
    }
}

export { createNewUser };
