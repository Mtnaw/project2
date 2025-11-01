import { startCronJobs } from './lib/cronJobs';

console.log('🚀 Initializing server with cron jobs...');

// Initialize cron jobs when the server starts
startCronJobs();

console.log('✅ Server initialization complete');

export {};