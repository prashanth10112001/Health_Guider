const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");

// All routes via POST
router.post("/register", userController.createUser);
router.post("/get", userController.getUserById); // Pass { id } in body
router.post("/getAll", userController.getUsers); // Can pass filters in body if needed
router.post("/update", userController.updateUser); // Pass { id, ...fields } in body
router.post("/delete", userController.deleteUser); // Pass { id } in body

module.exports = router;
