import "dotenv/config";
import app from "./app.js";
const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API index: http://localhost:${PORT}/`);
    console.log(`Health:    http://localhost:${PORT}/api/health`);
});
//# sourceMappingURL=index.js.map