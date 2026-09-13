package mail

import (
	"bufio"
	"context"
	"io"
	"log/slog"
	"net"
	"strings"
	"testing"
)

func TestUnconfiguredSenderFails(t *testing.T) {
	s := New("", "BotInc <hello@botinc.ai>", slog.Default())
	if err := s.SendCode(t.Context(), "a@example.test", "123456"); err == nil {
		t.Fatal("unconfigured delivery reported success")
	}
}
func TestSMTPRefusesPlaintextRelay(t *testing.T) {
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	defer listener.Close()
	done := make(chan string, 1)
	go func() {
		conn, err := listener.Accept()
		if err != nil {
			done <- ""
			return
		}
		defer conn.Close()
		_, _ = io.WriteString(conn, "220 test ESMTP\r\n")
		r := bufio.NewReader(conn)
		line, _ := r.ReadString('\n')
		_, _ = io.WriteString(conn, "250 test\r\n")
		rest, _ := r.ReadString('\n')
		done <- line + rest
	}()
	host, port, _ := net.SplitHostPort(listener.Addr().String())
	s := NewSMTP(SMTPConfig{Host: host, Port: port, Username: "private-user", Password: "private-password", From: "hello@botinc.ai"}, slog.Default())
	if err := s.SendCode(context.Background(), "a@example.test", "123456"); err == nil {
		t.Fatal("plaintext relay accepted")
	}
	if transcript := <-done; strings.Contains(transcript, "AUTH") || strings.Contains(transcript, "123456") {
		t.Fatal("credentials or code sent before TLS")
	}
}
