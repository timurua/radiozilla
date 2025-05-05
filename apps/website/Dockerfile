# Base on Node.js LTS
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app/website

# Copy package files
COPY website/package.json website/package-lock.json* ./
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app/website
COPY --from=deps /app/website/node_modules ./node_modules
COPY website/src ./src
COPY website/public ./public
COPY website/.env.production ./.env
COPY website/components.json ./components.json
COPY website/drizzle.config.ts ./drizzle.config.ts
COPY website/eslint.config.mjs ./eslint.config.mjs
COPY website/next.config.ts ./next.config.ts
COPY website/next-env.d.ts ./next-env.d.ts
COPY website/package.json ./package.json
COPY website/postcss.config.mjs ./postcss.config.mjs
COPY website/tsconfig.json ./tsconfig.json

# Next.js collects telemetry data by default - disable it
ENV NEXT_TELEMETRY_DISABLED 1

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app/website

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 8000

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/website/public ./public
COPY --from=builder /app/website/.next/standalone ./
COPY --from=builder /app/website/.next/static ./.next/static

# Set proper permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose the listening port
EXPOSE 8000

# Set the correct command to run the app
CMD ["node", "server.js"]