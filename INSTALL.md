# Installing the Ponytail Plugin in Claude Code

Ponytail is a Claude Code plugin that injects a "lazy senior developer" system prompt into every session, enforcing minimal, efficient code output.

---

## Method 1: Plugin Marketplace (recommended)

Open Claude Code and run these commands in the chat:

```
/plugin marketplace add DietrichGebert/ponytail
```

Then install it:

```
/plugin install ponytail@ponytail
```

Reload plugins to activate:

```
/reload-plugins
```

---

## Method 2: Manual install

1. Find your Claude Code plugins directory:
   - macOS/Linux: `~/.claude/plugins/`
   - Windows: `%APPDATA%\Claude\plugins\`

2. Clone the plugin:

```bash
git clone https://github.com/DietrichGebert/ponytail ~/.claude/plugins/ponytail
```

3. Reload Claude Code (close and reopen, or run `/reload-plugins` in chat).

---

## Verify it's active

After installing, you should see `[PONYTAIL]` in the Claude Code status line, or a `PONYTAIL MODE ACTIVE` notice at the start of each session.

You can also check the active system prompt — ponytail injects an AGENTS.md with the lazy senior developer decision tree.

---

## Status line badge (optional)

To show the ponytail mode badge in the Claude Code status bar, add to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "bash \"~/.claude/plugins/cache/ponytail/ponytail/4.4.0/hooks/ponytail-statusline.sh\""
  }
}
```

Replace the version number (`4.4.0`) with the installed version if different.

---

## Switching modes

Once installed, use these slash commands to control intensity:

| Command | Effect |
|---|---|
| `/ponytail lite` | Lighter enforcement — suggestions, not strict rules |
| `/ponytail full` | Default — full decision tree enforced |
| `/ponytail ultra` | Maximum minimalism |
| `stop ponytail` or `normal mode` | Disable for current session |

---

## AWS Bedrock setup

The benchmark uses AWS Bedrock (no Anthropic API key needed). Configure AWS credentials:

```bash
# Option A: env vars
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_DEFAULT_REGION=us-east-1

# Option B: AWS CLI (recommended)
aws configure
```

Then find available inference profile IDs:

```bash
aws bedrock list-inference-profiles --region us-east-1 \
  --query "inferenceProfileSummaries[*].inferenceProfileId"
```
