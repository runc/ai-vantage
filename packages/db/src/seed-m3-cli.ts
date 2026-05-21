import { seedM3Demo } from './seed-m3.js';

seedM3Demo().catch((err) => {
  console.error(err);
  process.exit(1);
});
