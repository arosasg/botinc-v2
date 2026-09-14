# The API. One static binary with its migrations embedded, so a deploy is the
# image and nothing else: there is no migration step to forget.
FROM public.ecr.aws/docker/library/golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/botinc-server ./cmd/server
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/migrate-v1 ./cmd/migrate-v1

FROM public.ecr.aws/docker/library/node:22-alpine
WORKDIR /opt/botinc
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund
COPY scripts/e2b-launch.mjs ./e2b-launch.mjs
COPY --from=build /out/botinc-server /botinc-server
COPY --from=build /out/migrate-v1 /migrate-v1
ENV BOTINC_E2B_LAUNCHER=/opt/botinc/e2b-launch.mjs
ENV BOTINC_ATTACHMENT_DIR=/var/lib/botinc/attachments
EXPOSE 8080
USER node
ENTRYPOINT ["/botinc-server"]
