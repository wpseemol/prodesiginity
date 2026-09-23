import { Request, Response } from "express";
import { Item, CreateItemDTO } from "../types/item.types.js";

// In-memory data store
const items: Item[] = [];

export const getItems = (_req: Request, res: Response): void => {
    res.status(200).json({ data: items });
};

export const getItemById = (req: Request, res: Response): void => {
    const { id } = req.params;
    const item = items.find((i) => i.id === id);

    if (!item) {
        res.status(404).json({ error: "Item not found" });
        return;
    }

    res.status(200).json({ data: item });
};

export const createItem = (
    req: Request<{}, {}, CreateItemDTO>,
    res: Response,
): void => {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
        res.status(400).json({
            error: "Name is required and must be a string",
        });
        return;
    }

    const newItem: Item = {
        id: crypto.randomUUID(),
        name,
    };

    items.push(newItem);
    res.status(201).json({ data: newItem });
};
