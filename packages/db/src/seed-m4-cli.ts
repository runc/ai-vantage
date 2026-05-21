import { seedM4Demo } from './seed-m4.js';

seedM4Demo().catch((err) => {
  console.error(err);
  process.exit(1);
});
