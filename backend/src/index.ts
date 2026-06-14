import { createApp } from './app.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

const app = createApp();

app.listen(PORT, () => {
  console.log(`Backend running at http://127.0.0.1:${PORT}`);
});
