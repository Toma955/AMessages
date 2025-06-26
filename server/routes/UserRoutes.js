const express = require("express");
const {
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleGetAllUsers,
    addUserToUserlist,
    getUserlist
} = require("../controllers/UserController");

const jwtMiddleware = require("../middlewares/jwtMiddleware");
const { verifyAdminToken } = require("../middlewares/adminMiddleware");

const router = express.Router();

router.post("/users", handleCreateUser);
router.put("/users/:id", handleUpdateUser);
router.delete("/users/:id", jwtMiddleware, handleDeleteUser);
router.get("/users", handleGetAllUsers);

router.get("/me", jwtMiddleware, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});

router.post("/users/userlist/add", jwtMiddleware, addUserToUserlist);

router.get("/users/userlist", jwtMiddleware, getUserlist);

module.exports = router;