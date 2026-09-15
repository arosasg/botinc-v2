# BotInc MCP

Connect an MCP client to `https://botinc.ai/api/mcp`.

BotInc publishes OAuth protected-resource and authorization-server metadata, registers public clients dynamically, and requires Authorization Code with PKCE S256.
The authorization screen asks the signed-in member to choose exactly one workspace.
Access and refresh credentials are stored only as hashes and remain bound to that workspace and MCP resource.

Supported scopes:

- `read` lists the authorized workspace, issues, conversations, messages, and runs.
- `write` includes read access and adds issue creation, issue comments, conversation creation, and message sending.

Available tools:

- `get_workspace`
- `list_issues`
- `get_issue`
- `list_conversations`
- `get_conversation`
- `create_issue` with `write`
- `add_issue_comment` with `write`
- `create_conversation` with `write`
- `send_message` with `write`

Use the MCP client's browser authorization flow.
Do not paste an access token or refresh token into chat, configuration files, logs, or issue comments.
