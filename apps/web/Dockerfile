# The web app. Next standalone output, so the image carries only what it needs.
# The API address is read per request, never baked, so this image is the same
# on test.botinc.ai and botinc.ai.
FROM public.ecr.aws/docker/library/node:22-alpine AS build
RUN corepack enable
WORKDIR /src
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY packages ./packages
COPY apps/web ./apps/web
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @botinc/web build

FROM public.ecr.aws/docker/library/node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /src/apps/web/.next/standalone ./
COPY --from=build /src/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /src/apps/web/public ./apps/web/public
RUN adduser -D -u 10001 web
USER web
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
