import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(), // file lands in req.file.buffer
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
        const allowed = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        cb(null, allowed.includes(file.mimetype));
    },
});

export default upload;
