# Hermes Help Center 🏥

A **native Hermes Desktop plugin** that adds a full interactive Help Center as a workspace page — CLI reference, tools, slash commands, connections, configuration, skills, CLI symbols, FAQ, troubleshooting, and a complete features overview. Access it from the sidebar, Cmd+K, or the `/help` route.

---

## ✨ Features (11 Tabs)

| Tab | What's Covered |
|-----|----------------|
| 🖥 Desktop | Getting started, UI features, plugins, skins/themes, Petdex mascots |
| 💻 Terminal/CLI | CLI basics, global flags, every command, session management |
| 🔧 Tools | All toolsets explained, key individual tools (~90 built-in) |
| ⚡ Slash Cmds | Every in-session command organized by category |
| 🔌 Connections | Hosted connectors, 20+ messaging platforms, MCP, credential pools |
| ⚙️ Config | Sections, voice/STT/TTS, provider setup, profiles |
| 🧠 Skills | Skills vs memory, managing skills, writing skills, bot mode, bundles |
| 🔣 Symbols | CLI symbol decoder — transcript, status bar, approvals, subagents |
| ❓ FAQ | Model selection, cost, privacy, offline use, multi-user, surfaces |
| 🩹 Troubleshoot | First aid, common fixes for every problem |
| 📋 Features | Capabilities, artifacts, cron, dashboard, memory, kanban, newswire |

---

## 📥 Installation

### Manual (all platforms)

```bash
mkdir -p ~/.hermes/desktop-plugins/help-center
cp plugin.js ~/.hermes/desktop-plugins/help-center/
```

Or for a named profile:
```bash
cp plugin.js ~/.hermes/profiles/<name>/desktop-plugins/help-center/
```

### Git clone

```bash
git clone https://github.com/totuslife7-arch/hermes-help-center.git
cp -r hermes-help-center ~/.hermes/desktop-plugins/help-center
```

### Activate

1. Open **Hermes Desktop**
2. Press **⌘K** → **"Reload desktop plugins"**
3. Click **"Help Center"** in the sidebar (below Artifacts)
4. Or press **⌘K** and search **"Open Help Center"**

---

## 🔧 Files

| File | Purpose |
|------|---------|
| `plugin.js` | Self-contained Hermes plugin (HTML embedded via `dangerouslySetInnerHTML`) |
| `help-center.html` | Standalone HTML source (edit this file if you want to change content) |
| `README.md` | This file |

---

## 📄 License

MIT © [Totus Life Services](https://totuslife.org).  
Built for the [Hermes Agent](https://hermes-agent.nousresearch.com) community.