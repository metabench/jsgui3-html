# Skill: ui-pick-prompting

## Scope
Use the ui-pick tool to present structured choices to the user.

**Does:**
- Show GUI picker with options.
- Wait for user selection.
- Return structured result (selection, cancelled, etc.).

**Does Not:**
- Handle complex multi-step wizards.
- Manage state between prompts.

## Inputs
- Options array (strings or objects with label/value/description).
- Theme (optional): `wlilo` (dark) or `bright` (light).

## Procedure

### Via HTTP (Current Session)
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:3333/prompt" -Method POST `
  -ContentType "application/json" `
  -Body '{"options":[{"label":"Option A","value":"a"}],"theme":"wlilo"}'
```

### Via CLI
```bash
node tools/dev/ui-pick.js --options-file=options.json --output-file=result.json
```

### Via MCP (After Restart)
```json
{
  "tool": "prompt_user",
  "arguments": {
    "options": [{"label": "Option A", "value": "a"}],
    "theme": "wlilo"
  }
}
```

## Validation
- Window appears with options.
- Selection returns in response.

## References
- [ui-pick.js](file:///c:/Users/james/Documents/repos/jsgui3-html/tools/dev/ui-pick.js) - CLI wrapper.
- [mcp-http-server.js](file:///c:/Users/james/Documents/repos/jsgui3-html/tools/ui/quick-picker/mcp-http-server.js) - MCP server.
