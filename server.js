const http = require("http");
const app = require("./app");
require("dotenv").config();
const PORT = process.env.PORT || 8000;
const httpServer = http.createServer(app);
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
