const express = require("express");
const {
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleGetAllUsers
} = require("../controllers/UserController");

const jwtMiddleware = require("../middlewares/jwtMiddleware");

const router = express.Router();

router.post("/users", handleCreateUser);
router.put("/users/:id", handleUpdateUser);
router.delete("/users/:id", handleDeleteUser);
router.get("/users", handleGetAllUsers);

router.get("/me", jwtMiddleware, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});

module.exports = router;