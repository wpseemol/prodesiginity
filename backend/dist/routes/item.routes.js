"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const item_controller_js_1 = require("../controllers/item.controller.js");
const router = (0, express_1.Router)();
router.get("/", item_controller_js_1.getItems);
router.get("/:id", item_controller_js_1.getItemById);
router.post("/", item_controller_js_1.createItem);
exports.default = router;
