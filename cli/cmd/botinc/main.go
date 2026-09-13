// Command botinc is the BotInc command line.
package main

import (
	"os"

	"github.com/arosasg/botinc-v2/cli/internal/commands"
)

// version is set at build time with -ldflags "-X main.version=...".
var version = "dev"

func main() {
	commands.Version = version
	os.Exit(commands.Execute())
}
