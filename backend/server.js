const express = require('express');
const cors = require('cors');
const scanRoutes = require('./routes/scan');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/scan', scanRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
