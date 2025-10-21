import { Server } from 'http';

interface GracefulShutdownOptions {
    signal: string;
    server: Server;
}

const gracefulShutdown = (signal: GracefulShutdownOptions['signal'], server: GracefulShutdownOptions['server']): void => {
    console.log(`📡 Received ${signal}. Shutting down gracefully...`);

    server.close((err?: Error) => {
        if (err) {
            console.error('❌ Error during server close:', err);
            process.exit(1);
        }

        console.log('✅ Server closed successfully');

        // Close database connections
    });

    // Force close after 30 seconds
    setTimeout(() => {
        console.error('⏰ Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
};

export { gracefulShutdown };