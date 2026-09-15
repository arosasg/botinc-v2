# The sandbox image. It carries the runtime plus the coding CLIs a run may
# drive; the sandbox provider boots it with BOTINC_API_URL, BOTINC_RUN_ID and
# a token scoped to one run.
FROM golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/botinc-runtime ./cmd/botinc-runtime

FROM node:22-alpine
RUN apk add --no-cache git openssh-client ca-certificates ripgrep
# The coding CLIs the adapters drive. Pinned, so a run is reproducible.
RUN npm install -g --no-fund --no-audit \
      @anthropic-ai/claude-code@2.1.270 \
      @openai/codex@0.154.0 \
      @deepseek-ai/dsh@0.1.5-rc.1 \
  && npm cache clean --force
COPY --from=build /out/botinc-runtime /usr/local/bin/botinc-runtime
RUN adduser -D -u 10001 runner
USER runner
WORKDIR /home/runner
ENTRYPOINT ["botinc-runtime"]
