"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createItem = exports.getItemById = exports.getItems = void 0;
// In-memory data store
const items = [];
const getItems = (_req, res) => {
    res.status(200).json({ data: items });
};
exports.getItems = getItems;
const getItemById = (req, res) => {
    const { id } = req.params;
    const item = items.find((i) => i.id === id);
    if (!item) {
        res.status(404).json({ error: "Item not found" });
        return;
    }
    res.status(200).json({ data: item });
};
exports.getItemById = getItemById;
const createItem = (req, res) => {
    const { name } = req.body;
    if (!name || typeof name !== "string") {
        res.status(400).json({
            error: "Name is required and must be a string",
        });
        return;
    }
    const newItem = {
        id: crypto.randomUUID(),
        name,
    };
    items.push(newItem);
    res.status(201).json({ data: newItem });
};
exports.createItem = createItem;
