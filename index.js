const express = require('express');
const videoRoutes = require('./routes/videoRoutes');

const app = express();

app.use(express.json());
app.use('/api/videos', videoRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
