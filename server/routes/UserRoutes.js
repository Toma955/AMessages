const express = require("express");
const {
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser
} = require("../controllers/UserController");

const router = express.Router();

router.post("/users", handleCreateUser);
router.put("/users/:id", handleUpdateUser);
router.delete("/users/:id", handleDeleteUser);

module.exports = router;
