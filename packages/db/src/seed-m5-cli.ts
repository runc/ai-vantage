import { seedM5Demo } from './seed-m5.js';

seedM5Demo().catch((err) => {
  console.error(err);
  process.exit(1);
});
