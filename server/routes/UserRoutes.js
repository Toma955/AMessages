import express from "express";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import {
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleGetAllUsers,
    addUserToUserlist,
    getUserlist,
    handleGetProfilePicture
} from "../controllers/UserController.js";

import jwtMiddleware from "../middlewares/jwtMiddleware.js";
import { verifyAdminToken } from "../middlewares/adminMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userId = req.user.id;
        const dir = path.resolve(__dirname, `../database/users/${userId}/media`);
        fs.mkdirSync(dir, { recursive: true });
      
        fs.readdir(dir, (err, files) => {
            if (err) return cb(err);
            for (const file of files) {
                fs.unlink(path.join(dir, file), (err) => {
                    if (err) console.error("Error deleting old profile picture:", err);
                });
            }
            cb(null, dir);
        });
    },
    filename: function (req, file, cb) {
        cb(null, 'profile' + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
const router = express.Router();

router.post("/users", handleCreateUser);
router.put("/users/:id", handleUpdateUser);
router.delete("/users/:id", jwtMiddleware, handleDeleteUser);
router.get("/users", handleGetAllUsers);
router.get("/users/:id/profile-picture", handleGetProfilePicture);



router.get("/me", jwtMiddleware, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});

router.post("/users/userlist/add", jwtMiddleware, addUserToUserlist);

router.get("/users/userlist", jwtMiddleware, getUserlist);

export default router;