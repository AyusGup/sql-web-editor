"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assignment_controller_1 = require("../../controllers/assignment.controller");
const router = (0, express_1.Router)();
router.get("/", assignment_controller_1.listAssignments);
router.get("/:id", assignment_controller_1.getAssignment);
exports.default = router;
