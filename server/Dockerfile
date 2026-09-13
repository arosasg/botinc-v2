# The API. One static binary with its migrations embedded, so a deploy is the
# image and nothing else: there is no migration step to forget.
FROM golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/botinc-server ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/botinc-server /botinc-server
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/botinc-server"]
