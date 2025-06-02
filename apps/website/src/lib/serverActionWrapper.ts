type ServerActionFunction<T extends unknown[], R> = (...args: T) => Promise<R>;

export function withErrorHandler<T extends unknown[], R>(
    action: ServerActionFunction<T, R>,
    context?: string
) {
    return async (...args: T): Promise<R> => {
        try {
            return await action(...args);
        } catch (error) {
            // Log the error with full details
            console.error('\n' + '='.repeat(50));
            console.error(`SERVER ACTION ERROR${context ? ` in ${context}` : ''}`);
            console.error('='.repeat(50));

            if (error instanceof Error) {
                console.error('Message:', error.message);
                console.error('Name:', error.name);

                // PostgreSQL specific details
                const pgError = error as any;
                if (pgError.code) {
                    console.error('PostgreSQL Details:', {
                        code: pgError.code,
                        severity: pgError.severity,
                        position: pgError.position,
                        file: pgError.file,
                        line: pgError.line,
                        routine: pgError.routine,
                        digest: pgError.digest
                    });
                }

                console.error('\nStack Trace:');
                console.error(error.stack);
            } else {
                console.error('Non-Error object:', error);
            }

            console.error('='.repeat(50) + '\n');

            // Re-throw or handle as needed
            throw error;
        }
    };
}