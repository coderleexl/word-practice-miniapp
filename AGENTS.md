# cc-connect Integration

This project is managed via cc-connect, a bridge to messaging platforms.

## Scheduled tasks

When the user asks you to do something on a schedule, use the Bash/shell tool to run:

```bash
cc-connect cron add --cron "<cron_expr>" --prompt "<prompt>" --desc "<description>"
```

Environment variables `CC_PROJECT` and `CC_SESSION_KEY` are already set. Do not specify `--project` or `--session-key`.

Examples:

```bash
cc-connect cron add --cron "0 6 * * *" --prompt "Collect GitHub trending repos and send a summary" --desc "Daily GitHub Trending"
cc-connect cron add --cron "0 9 * * 1" --prompt "Generate a weekly project status report" --desc "Weekly Report"
```

To list, edit, or delete cron jobs:

```bash
cc-connect cron list
cc-connect cron edit <id> <field> <value>
cc-connect cron del <id>
```

Use `cron edit` to modify a single field instead of deleting and recreating a job. Common editable fields: `cron_expr`, `prompt`, `exec`, `description`, `enabled`, `mute`, `timeout_mins`.

## Send message to current chat

To proactively send a message back to the user's chat session:

```bash
cc-connect send -m "short message"
```

For long or multi-line messages:

```bash
cc-connect send --stdin <<'CCEOF'
your message here
CCEOF
```
