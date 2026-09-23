"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const career_controller_1 = require("../controllers/career.controller");
const upload_1 = __importDefault(require("../middlewares/upload"));
const router = (0, express_1.Router)();
router.post("/send-mail", upload_1.default.single("resume"), career_controller_1.sendCareerEmail);
exports.default = router;
