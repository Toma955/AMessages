import express from "express";
import { handleLoginUser, handleLogoutUser } from "../controllers/AuthController.js";
import { checkAdminRedirect } from "../middlewares/adminMiddleware.js";
import jwtMiddleware from "../middlewares/jwtMiddleware.js";

const router = express.Router();


router.post("/login", handleLoginUser);


router.post("/logout", jwtMiddleware, handleLogoutUser);


router.get("/check-user", checkAdminRedirect, (req, res) => {
    
    res.json({
        success: true,
        redirectUrl: '/main',
        isAdmin: false
    });
});

export default router;
