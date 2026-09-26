import "dotenv/config";
import app from "./app.js";
const PORT = Number(process.env.PORT || 4000);
// Keep the process alive on unexpected async failures (DB blips, etc.).
// Request-level errors should still go through Express middleware.
process.on("unhandledRejection", (reason) => {
    console.error("[process] Unhandled rejection (server kept running):", reason);
});
process.on("uncaughtException", (error) => {
    console.error("[process] Uncaught exception (server kept running):", error);
});
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API index: http://localhost:${PORT}/`);
    console.log(`Health:    http://localhost:${PORT}/api/health`);
});
server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
        console.error(`[process] Port ${PORT} is already in use`);
    }
    else {
        console.error("[process] HTTP server error:", error);
    }
});
//# sourceMappingURL=index.js.map