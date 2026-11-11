/**
 * Hermes Help Center — native desktop plugin
 *
 * A full-page interactive help center rendered through the Hermes
 * Desktop Plugin SDK — no external files, no iframe, no HTML file
 * dependencies. Tab switching, search, and card collapse are handled
 * with React state and event delegation.
 *
 * Surfaces: ROUTES_AREA /help page, SIDEBAR_NAV_AREA row, PALETTE_AREA command.
 */

import { host, PALETTE_AREA, ROUTES_AREA, SIDEBAR_NAV_AREA } from '@hermes/plugin-sdk'
import { jsx, jsxs } from 'react/jsx-runtime'
import { useState, useEffect, useRef, useCallback } from 'react'

const PLUGIN_ID = 'help-center'
const PLUGIN_NAME = 'Help Center'
const PLUGIN_ROUTE = '/help'

const HCSS = `*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:var(--card,#111);--fg:var(--foreground,#e8e8e8);--muted:var(--muted-foreground,#888);--accent:var(--accent,#6c8cff);--border:var(--border,#2a2a2a);--card-bg:color-mix(in srgb,var(--bg) 97%,var(--accent));--radius:8px;--font:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
::selection{background:var(--accent);color:#000}::-moz-selection{background:var(--accent);color:#000}
body{font-family:var(--font);background:transparent;color:var(--fg);font-size:14px;line-height:1.5;padding:0 0 20px 0;min-width:580px;max-width:780px}
.header{display:flex;align-items:center;gap:14px;padding:16px 16px 10px;border-bottom:1px solid var(--border);margin-bottom:0}
.header-icon{font-size:32px;line-height:1}
.header h1{font-size:20px;font-weight:700;letter-spacing:-0.3px}
.header h1 span{color:var(--accent)}
.header .sub{font-size:12px;color:var(--muted);margin-top:1px}
.search-wrap{position:relative;margin:12px 16px}
.search-wrap input{width:100%;padding:8px 12px 8px 34px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--fg);font-size:13px;outline:none;transition:border .15s}
.search-wrap input:focus{border-color:var(--accent)}
.search-wrap .mag{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:15px;pointer-events:none}
.search-wrap input::placeholder{color:var(--muted)}
.tabs{display:flex;gap:2px;padding:0 16px;border-bottom:1px solid var(--border);overflow-x:auto;scrollbar-width:none;flex-wrap:nowrap}
.tabs::-webkit-scrollbar{display:none}
.tab{flex-shrink:0;padding:7px 12px;font-size:12px;font-weight:500;color:var(--muted);cursor:pointer;border-bottom:2px solid transparent;transition:.15s;white-space:nowrap;user-select:none}
.tab:hover{color:var(--fg)}
.tab.active{color:var(--accent);border-bottom-color:var(--accent)}
.content{padding:0 16px}
.panel{display:none;padding-top:16px}
.panel.active{display:block}
.card{margin-bottom:12px;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}
.card-header{padding:10px 14px;font-weight:600;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;user-select:none;transition:background .15s}
.card-header:hover{background:rgba(255,255,255,.03)}
.card-header .arrow{font-size:10px;transition:transform .2s;color:var(--muted)}
.card-header.open .arrow{transform:rotate(90deg)}
.card-body{padding:4px 14px 12px;display:none;font-size:13px;color:var(--muted);line-height:1.6}
.card-body.open{display:block}
.card-body code{display:inline-block;background:rgba(255,255,255,.06);padding:1px 6px;border-radius:3px;font-size:12px;font-family:'SF Mono','Fira Code','Cascadia Code',monospace;color:var(--accent)}
.card-body pre{background:rgba(0,0,0,.3);padding:10px 12px;border-radius:5px;overflow-x:auto;font-size:12px;line-height:1.5;margin:6px 0;border:1px solid var(--border)}
.card-body pre code{background:none;padding:0;color:var(--fg);display:block}
.card-body ul{padding-left:18px;margin:4px 0}
.card-body li{margin:2px 0}
.card-body b{color:var(--fg)}
.card-body .tag{display:inline-block;font-size:10px;padding:1px 7px;border-radius:10px;background:rgba(108,140,255,.15);color:var(--accent);margin:1px 2px}
.card-body .tag.green{background:rgba(80,200,120,.15);color:#50c878}
.card-body .tag.orange{background:rgba(255,180,50,.15);color:#ffb432}
.card-body .tag.pink{background:rgba(255,100,150,.15);color:#ff6496}
.card-body .tag.purple{background:rgba(180,100,255,.15);color:#b464ff}
.card-body .tag.teal{background:rgba(0,200,200,.15);color:#00c8c8}
.card-body .cmd{font-family:'SF Mono',monospace;font-size:12px;background:rgba(0,0,0,.2);padding:2px 8px;border-radius:4px;color:var(--fg)}
.card-body table{width:100%;border-collapse:collapse;font-size:12px;margin:6px 0}
.card-body td,.card-body th{padding:5px 8px;border:1px solid var(--border);text-align:left}
.card-body th{background:rgba(255,255,255,.04);font-weight:600;color:var(--fg)}
.card-body hr{border:none;border-top:1px solid var(--border);margin:8px 0}
.recent{font-size:11px;color:var(--muted);padding:4px 16px 10px;display:flex;gap:6px;flex-wrap:wrap}
.recent span{cursor:pointer;padding:2px 8px;border-radius:10px;background:rgba(108,140,255,.08);color:var(--accent);transition:.15s}
.recent span:hover{background:rgba(108,140,255,.18)}
.section-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin:12px 0 6px}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.two-col .item{padding:5px 10px;border:1px solid var(--border);border-radius:var(--radius);font-size:12px;cursor:pointer;transition:.15s;color:var(--muted)}
.two-col .item:hover{border-color:var(--accent);color:var(--fg)}
.symbol-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;font-size:12px}
.symbol-row{display:flex;gap:6px;align-items:baseline;padding:2px 0}
.symbol-row .sym{font-family:'SF Mono',monospace;color:var(--accent);min-width:28px;text-align:center;font-size:14px}
.symbol-row .desc{color:var(--muted)}
.footer{text-align:center;padding:16px;font-size:11px;color:var(--muted);border-top:1px solid var(--border);margin-top:8px}
.footer a{color:var(--accent);text-decoration:none}`

const PANELS = {
  desktop: `<div class="card-header open" onclick="toggle(this)">🚀 Getting Started <span class="arrow">▶</span></div>
    <div class="card-body open">
      <p>Launch the Hermes desktop app with:</p>
      <pre><code>hermes desktop    # or:  hermes gui</code></pre>
      <p>The desktop app is a native Electron application for <b>macOS</b>, <b>Windows</b>, and <b>Linux</b>. It gives you a polished chat interface with streaming tool output, side-by-side previews, a file browser, voice mode, cron schedules, profile management, skills browser, and full settings.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">🪟 Key UI Features <span class="arrow">▶</span></div>
    <div class="card-body">
      <ul>
        <li><b>Streaming chat</b> — see tool calls and responses live</li>
        <li><b>Side-by-side preview</b> — preview HTML, markdown, images alongside chat</li>
        <li><b>Cmd+K palette</b> — quick access to every command and setting</li>
        <li><b>Drag-and-drop files</b> — drop images, PDFs, code into chat</li>
        <li><b>File browser</b> — navigate project files without leaving the app</li>
        <li><b>Session list</b> — browse, resume, rename, delete sessions</li>
        <li><b>Voice mode</b> — speak to Hermes and hear responses</li>
        <li><b>Cron tab</b> — manage scheduled tasks visually</li>
        <li><b>Skills &amp; memory browser</b> — see what Hermes has learned</li>
        <li><b>Profile switcher</b> — switch between profiles on the fly</li>
        <li><b>Notifications</b> — native OS notifications for important events</li>
      </ul>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">🔌 Desktop Plugins <span class="arrow">▶</span></div>
    <div class="card-body">
      <p>Extend the desktop app with UI plugins that add custom panes, commands, and widgets. Plugins live in <code>~/.hermes/desktop-plugins/</code>.</p>
      <p>You can add: <b>Panes</b> (custom side panels), <b>Commands</b> (new Cmd+K actions), <b>Widgets</b> (inline UI components in the chat area).</p>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">🎨 Skins &amp; Themes <span class="arrow">▶</span></div>
    <div class="card-body">
      <p>Change how Hermes looks across CLI, TUI, desktop, and dashboard.</p>
      <pre><code>hermes skin list                       # list available skins
hermes config set display.skin synthwave   # apply live
hermes skin set accent "#ff6496"           # tweak one color</code></pre>
      <p><b>Tip:</b> Don't fork the <code>default</code> skin — it drops the palette. Edit the active skin instead.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">🐾 Pet Mascots (Petdex) <span class="arrow">▶</span></div>
    <div class="card-body">
      <p>Adopt an animated mascot that reacts to Hermes's activity across the CLI, TUI, and desktop app.</p>
      <pre><code>hermes pets list             # see available pets
hermes pet select &lt;slug&gt;    # activate one</code></pre>
      <p>Or hatch your own with <code>/hatch [description]</code>.</p>
    </div>
  </div>
</div>

<!-- TERMINAL / CLI -->`,
  terminal: `<div class="card-header open" onclick="toggle(this)">💻 CLI Basics <span class="arrow">▶</span></div>
    <div class="card-body open">
      <p>Hermes runs in your terminal with <b>two interfaces</b>:</p>
      <table>
        <tr><th>Interface</th><th>Command</th><th>Description</th></tr>
        <tr><td>Classic REPL</td><td><code>hermes</code></td><td>Traditional line-based chat, fast and lightweight</td></tr>
        <tr><td>Ink TUI</td><td><code>hermes --tui</code></td><td>Modern terminal UI with mouse, overlays, status bar, docked widgets</td></tr>
        <tr><td>One-shot</td><td><code>hermes chat -q "question"</code></td><td>Single query, non-interactive (great for scripts)</td></tr>
        <tr><td>Quiet mode</td><td><code>hermes chat -q "..." -Q</code></td><td>Suppress banner, spinner, tool previews</td></tr>
      </table>
      <p style="margin-top:6px">Default interface: <code>display.interface: cli</code> or <code>tui</code> in config.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">🚩 Global Flags <span class="arrow">▶</span></div>
    <div class="card-body">
      <table>
        <tr><th>Flag</th><th>Purpose</th></tr>
        <tr><td><code>--version, -V</code></td><td>Show version</td></tr>
        <tr><td><code>-z, --oneshot PROMPT</code></td><td>Print final response only (for scripts)</td></tr>
        <tr><td><code>-m MODEL / --provider P</code></td><td>Model/provider override</td></tr>
        <tr><td><code>-t, --toolsets LIST</code></td><td>Comma-separated toolsets for this invocation</td></tr>
        <tr><td><code>--resume, -r SESSION</code></td><td>Resume session by ID or title</td></tr>
        <tr><td><code>--continue, -c [NAME]</code></td><td>Resume most recent or named session</td></tr>
        <tr><td><code>--worktree, -w</code></td><td>Isolated git worktree mode (parallel agents)</td></tr>
        <tr><td><code>--skills, -s SKILL</code></td><td>Preload skills</td></tr>
        <tr><td><code>--profile, -p NAME</code></td><td>Use a named profile</td></tr>
        <tr><td><code>--yolo</code></td><td>Skip dangerous command approval</td></tr>
        <tr><td><code>--tui / --cli</code></td><td>Force TUI or classic CLI</td></tr>
        <tr><td><code>--safe-mode</code></td><td>Disable ALL customizations (troubleshooting)</td></tr>
        <tr><td><code>--ignore-rules</code></td><td>Skip AGENTS.md/SOUL.md/memory/skill injection</td></tr>
        <tr><td><code>--pass-session-id</code></td><td>Include session ID in system prompt</td></tr>
      </table>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">📋 CLI Commands <span class="arrow">▶</span></div>
    <div class="card-body">
      <div class="section-label">Chat</div>
      <pre><code>hermes chat -q "text" [--image PATH] [--quiet] [--max-turns N]</code></pre>
      <div class="section-label">Configuration</div>
      <pre><code>hermes setup [section]          # Wizard (model|tts|terminal|gateway|tools|agent)
hermes model                    # Interactive model/provider picker
hermes config [show|edit|get|set|unset|path|env-path|check|migrate]
hermes login / logout           # OAuth sign-in / clear stored auth
hermes doctor [--fix]           # Check deps and config</code></pre>
      <div class="section-label">Tools &amp; Skills</div>
      <pre><code>hermes tools [list|enable NAME|disable NAME]
hermes skills list|browse|search|install|config|check|update|uninstall|publish
hermes mcp add|remove|list|test|catalog|install|configure|serve</code></pre>
      <div class="section-label">Gateway &amp; Sessions</div>
      <pre><code>hermes gateway run|install|start|stop|restart|status|setup
hermes sessions list|browse|rename|delete|export|prune|stats
hermes cron list|create|edit|pause|resume|run|remove|status</code></pre>
      <div class="section-label">Other</div>
      <pre><code>hermes kanban &lt;verb&gt;         # Multi-agent work queue
hermes project                # Named multi-folder workspaces
hermes portal                 # Quick setup / sign-in via Nous Portal
hermes desktop / gui          # Launch desktop app
hermes dashboard [--stop|--status]  # Web admin panel + embedded chat
hermes proxy                  # OpenAI-compatible local proxy
hermes logs [-f] [errors]     # View logs
hermes update / uninstall
hermes status [--full]        # Component health summary
hermes fallback [add|remove|list]  # Fallback provider chain
hermes memory setup|status|off|reset  # Memory providers
hermes secrets bitwarden|onepassword   # External secret stores
hermes moa                    # Mixture-of-Agents
hermes completion bash|zsh|fish  # Shell completions
hermes send                   # One-off message through gateway
hermes acp                    # ACP server (IDE integration)</code></pre>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">📝 Session Management <span class="arrow">▶</span></div>
    <div class="card-body">
      <p>Sessions persist across restarts in <code>~/.hermes/state.db</code> (SQLite).</p>
      <pre><code>hermes --continue          # resume most recent
hermes --resume SESSION_ID # resume specific
hermes sessions browse     # interactive session browser</code></pre>
      <p>In-session: <code>/title [name]</code>, <code>/sessions</code>, <code>/resume [name]</code>.</p>
    </div>
  </div>
</div>

<!-- TOOLS -->`,
  tools: `<div class="card-header open" onclick="toggle(this)">🔧 What Are Tools? <span class="arrow">▶</span></div>
    <div class="card-body open">
      <p>Hermes has <b>~90 built-in tools</b> organized into <b>toolsets</b>. Toolsets are groups of related tools that can be enabled/disabled per platform. Plus unlimited MCP tools from external servers.</p>
      <p>Check what's enabled: <code>hermes tools</code> or <code>/tools</code> in-session.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-header open" onclick="toggle(this)">📂 All Toolsets <span class="arrow">▶</span></div>
    <div class="card-body open">
      <table>
        <tr><th>Toolset</th><th>What It Provides</th></tr>
        <tr><td><code>file</code></td><td>Read, write, search, patch files</td></tr>
        <tr><td><code>terminal</code></td><td>Shell commands + process management</td></tr>
        <tr><td><code>web</code></td><td>Web search and page extraction</td></tr>
        <tr><td><code>browser</code></td><td>Browser automation (browser_exec, CDP, vault)</td></tr>
        <tr><td><code>vision</code></td><td>Image analysis (vision_analyze)</td></tr>
        <tr><td><code>image_gen</code></td><td>Image generation and editing (FAL.ai + more)</td></tr>
        <tr><td><code>video / video_gen</code></td><td>Video analysis and generation</td></tr>
        <tr><td><code>code_execution</code></td><td>Sandboxed Python with tool access</td></tr>
        <tr><td><code>delegation</code></td><td>Spawn child agents (delegate_task)</td></tr>
        <tr><td><code>clarify</code></td><td>Ask user questions</td></tr>
        <tr><td><code>memory</code></td><td>Persistent cross-session memory</td></tr>
        <tr><td><code>skills</code></td><td>Skill browsing and management</td></tr>
        <tr><td><code>session_search</code></td><td>Search past conversations</td></tr>
        <tr><td><code>cronjob</code></td><td>Scheduled task management</td></tr>
        <tr><td><code>kanban</code></td><td>Multi-agent work queue</td></tr>
        <tr><td><code>todo</code></td><td>In-session task planning</td></tr>
        <tr><td><code>computer_use</code></td><td>Desktop GUI control (cua-driver)</td></tr>
        <tr><td><code>tts</code></td><td>Text-to-speech</td></tr>
        <tr><td><code>x_search</code></td><td>X (Twitter) search</td></tr>
        <tr><td><code>desktop_ui</code></td><td>Desktop app UI tools (preview, focus, theme, tours)</td></tr>
        <tr><td><code>coding</code></td><td>Code-editing helpers (LSP-backed)</td></tr>
        <tr><td><code>safe</code></td><td>Minimal low-risk toolset for locked-down sessions</td></tr>
        <tr><td><code>context_engine</code></td><td>Pluggable context-engine hooks</td></tr>
        <tr><td><code>search</code></td><td>Search-only subset of web (no extraction)</td></tr>
        <tr><td><code>debugging</code></td><td>Extra introspection tools (off by default)</td></tr>
      </table>
      <p style="margin-top:6px">Enable/disable: <code>hermes tools enable browser</code>. Tool changes take effect on <code>/reset</code>.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">🛠 Key Individual Tools <span class="arrow">▶</span></div>
    <div class="card-body">
      <table>
        <tr><th>Tool</th><th>What It Does</th></tr>
        <tr><td><code>write_file</code></td><td>Write/overwrite files; refused if not read first; auto-lints</td></tr>
        <tr><td><code>read_file</code></td><td>Read text files; auto-extracts PDFs, Office docs, SQLite</td></tr>
        <tr><td><code>search_files</code></td><td>Ripgrep-backed content search or file-find by glob</td></tr>
        <tr><td><code>patch</code></td><td>Targeted find-and-replace with fuzzy matching</td></tr>
        <tr><td><code>terminal</code></td><td>Execute shell commands (foreground/background/PTY)</td></tr>
        <tr><td><code>process_manage</code></td><td>Poll, wait, kill background processes</td></tr>
        <tr><td><code>web_search</code></td><td>Search the web</td></tr>
        <tr><td><code>web_extract</code></td><td>Extract page content as clean markdown</td></tr>
        <tr><td><code>browser_exec</code></td><td>Drive a real browser with Python helpers</td></tr>
        <tr><td><code>vision_an

... [OUTPUT TRUNCATED - 2,415 chars omitted out of 52,343 total] ...

<div class="item"><code>/btw</code> — Side question, no interruption</div>
        <div class="item"><code>/queue</code> — Queue prompt for next turn</div>
        <div class="item"><code>/steer</code> — Inject message after next tool</div>
        <div class="item"><code>/agents</code> — Show running subagents</div>
        <div class="item"><code>/goal [text]</code> — Standing goal across turns</div>
        <div class="item"><code>/branch</code> — Fork the session</div>
        <div class="item"><code>/resume [name]</code> — Resume named session</div>
        <div class="item"><code>/sessions</code> — Browse past sessions</div>
        <div class="item"><code>/handoff</code> — Send session to platform (CLI)</div>
        <div class="item"><code>/status</code> — Session info</div>
      </div>
    </div>
  </div>`,
  slash: `<div class="card-body">
      <div class="two-col">
        <div class="item"><cod

... [OUTPUT TRUNCATED - 219 chars omitted out of 50,149 total] ...

"item"><code>/reasoning [level]</code> — Reasoning effort</div>
        <div class="item"><code>/fast</code> — Priority processing tier</div>
        <div class="item"><code>/verbose</code> — Cycle tool progress display</div>
        <div class="item"><code>/voice [on|off|tts]</code> — Voice mode toggle</div>
        <div class="item"><code>/yolo</code> — Toggle approval bypass</div>
        <div class="item"><code>/skin [name]</code> — Change theme (CLI)</div>
        <div class="item"><code>/timestamps</code> — Message timestamps (CLI)</div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">🛠 Tools &amp; Skills Commands <span class="arrow">▶</span></div>
    <div class="card-body">
      <div class="two-col">
        <div class="item"><code>/tools</code> — Manage tools (CLI)</div>
        <div class="item"><code>/toolsets</code> — List toolsets (CLI)</div>
        <div class="item"><code>/skills</code> — Search/install/manage skills</div>
        <div class="item"><code>/learn &lt;source&gt;</code> — Learn a skill</div>
        <div class="item"><code>/memory</code> — Review pending memory writes</div>
        <div class="item"><code>/pet [toggle|list|&lt;slug&gt;]</code> — Pet control</div>
        <div class="item"><code>/hatch [desc]</code> — Generate a new pet (CLI)</div>
        <div class="item"><code>/cron [sub]</code> — Manage scheduled tasks</div>
        <div class="item"><code>/curator [sub]</code> — Skill maintenance</div>
        <div class="item"><code>/kanban [sub]</code> — Multi-profile board</div>
        <div class="item"><code>/moa &lt;prompt&gt;</code> — Mixture-of-Agents</div>
        <div class="item"><code>/reload-mcp</code> — Reload MCP servers</div>
        <div class="item"><code>/reload-skills</code> — Re-scan skills directory</div>
        <div class="item"><code>/blueprint [name]</code> — Automation blueprint</div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">📡 Gateway &amp; Info Commands <span class="arrow">▶</span></div>
    <div class="card-body">
      <div class="two-col">
        <div class="item"><code>/approve</code> — Approve dangerous command (GW)</div>
        <div class="item"><code>/deny</code> — Deny dangerous command (GW)</div>
        <div class="item"><code>/restart</code> — Restart gateway (GW)</div>
        <div class="item"><code>/sethome</code> — Set home channel (GW)</div>
        <div class="item"><code>/platform</code> — Pause/resume platform (GW)</div>
        <div class="item"><code>/help</code> — Show all commands</div>
        <div class="item"><code>/usage</code> — Token usage</div>
        <div class="item"><code>/insights [days]</code> — Usage analytics</div>
        <div class="item"><code>/whoami</code> — Access level</div>
        <div class="item"><code>/profile</code> — Active profile info</div>
        <div class="item"><code>/platforms</code> — Connection status (CLI)</div>
        <div class="item"><code>/journey</code> — Skills timeline (CLI)</div>
        <div class="item"><code>/version</code> — Show version</div>
        <div class="item"><code>/debug</code> — Upload debug report</div>
        <div class="item"><code>/quit</code> — Exit CLI</div>
      </div>
    </div>
  </div>
</div>

<!-- CONNECTIONS -->
<div class="panel" id="panel-connections">
  <div class="card">
    <div class="card-header open" onclick="toggle(this)">🔌 Overview <span class="arrow">▶</span></div>
    <div class="card-body open">
      <p>Hermes connects to external services in <b>two ways</b>:</p>
      <ul>
        <li><b>Hosted Connectors</b> — authorized through Nous Portal (Gmail, Calendar, Drive, Docs, Notion, more)</li>
        <li><b>MCP Servers</b> — local servers from the catalog or custom config (GitHub, Linear, databases, etc.)</li>
      </ul>
      <p>Manage everything with <code>manage_connections</code> tool or <code>hermes mcp</code> CLI.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">📱 Messaging Platforms <span class="arrow">▶</span></div>
    <div class="card-body">
      <p>Hermes can be a bot on <b>20+ platforms</b>. Start the gateway: <code>hermes gateway run</code>.</p>
      <div class="two-col">
        <div class="item"><span class="tag">Telegram</span> Full-featured bot</div>
        <div class="item"><span class="tag">Discord</span> Bot with intents</div>
        <div class="item"><span class="tag">Slack</span> Socket Mode bot</div>
        <div class="item"><span class="tag">WhatsApp</span> Baileys + Cloud API</div>
        <div class="item"><span class="tag">Signal</span> Via signal-cli daemon</div>
        <div class="item"><span class="tag">iMessage</span> Photon bridge</div>
        <div class="item"><span class="tag">Email</span> IMAP/SMTP</div>
        <div class="item"><span class="tag">SMS</span> Via Twilio</div>
        <div class="item"><span class="tag">Matrix</span> Decentralized chat</div>
        <div class="item"><span class="tag">Mattermost</span> Self-hosted</div>
        <div class="item"><span class="tag">Teams</span> Microsoft bot</div>
        <div class="item"><span class="tag">LINE</span> Messaging API</div>
        <div class="item"><span class="tag">Home Assistant</span> Smart home</div>
        <div class="item"><span class="tag">Webhooks</span> GitHub/GitLab events</div>
        <div class="item"><span class="tag">Google Chat</span> Cloud Pub/Sub</div>
        <div class="item"><span class="tag">Feishu/Lark</span> Enterprise</div>
        <div class="item"><span class="tag">DingTalk</span> Enterprise</div>`,
  connections: `<div class="item"><span class="tag">IRC</span> Classic chat</div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">🔗 MCP Servers <span class="arrow">▶</span></div>
    <div class="card-body">
      <pre><code>hermes mcp add github --url ghcr.io/github/mcp-server
hermes mcp catalog                      # browse catalog
hermes mcp install github               # one-click install
hermes mcp list                         # what's active
hermes mcp test github                  # test connection
hermes mcp configure github             # toggle which tools load</code></pre>
      <p>MCP tools appear as <code>mcp__&lt;server&gt;__&lt;tool&gt;</code> (e.g. <code>mcp__github__create_issue</code>).</p>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">🔑 Credential Pools <span class="arrow">▶</span></div>
    <div class="card-body">
      <p>Multiple credentials per provider rotate automatically and skip exhausted keys.</p>
      <pre><code>hermes auth                     # Interactive manager
hermes auth add openrouter      # Add another key
hermes auth list                # See all credentials
hermes auth remove openrouter 0 # Remove a specific key</code></pre>
    </div>
  </div>
</div>

<!-- CONFIG -->
<div class="panel" id="panel-config">
  <div class="card">
    <div class="card-header open" onclick="toggle(this)">⚙️ Configuration Basics <span class="arrow">▶</span></div>
    <div class="card-body open">
      <p>Two files:</p>
      <ul>
        <li><code>~/.hermes/config.yaml</code> — settings (NEVER secrets here)</li>
        <li><code>~/.hermes/.env</code> — API keys and secrets ONLY</li>
      </ul>
      <p>Edit: <code>hermes config set section.key value</code>. <b>Never hand-edit config.yaml</b> — use <code>hermes config set</code>.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">📋 Key Config Sections <span class="arrow">▶</span></div>
    <div class="card-body">
      <table>
        <tr><th>Section</th><th>Key Options</th></tr>
        <tr><td><code>model</code></td><td><code>default</code>, <code>provider</code>, <code>base_url</code>, <code>context_length</code>, <code>aliases</code></td></tr>
        <tr><td><code>agent</code></td><td><code>max_turns</code> (90), <code>verify_on_stop</code></td></tr>
        <tr><td><code>terminal</code></td><td><code>backend</code> (local/docker/ssh/…), <code>timeout</code> (180)</td></tr>
        <tr><td><code>display</code></td><td><code>skin</code>, <code>interface</code> (cli/tui), <code>language</code>, <code>pet</code></td></tr>
        <tr><td><code>approvals</code></td><td><code>mode</code> (smart/manual/off), <code>timeout</code></td></tr>
        <tr><td><code>stt</code></td><td><code>enabled</code>, <code>provider</code> (local/groq/openai/…)</td></tr>
        <tr><td><code>tts</code></td><td><code>provider</code> (edge/elevenlabs/openai/minimax/…)</td></tr>
        <tr><td><code>memory</code></td><td><code>memory_enabled</code>, <code>provider</code>, <code>write_approval</code></td></tr>
        <tr><td><code>security</code></td><td><code>redact_secrets</code>, <code>website_blocklist</code></td></tr>
        <tr><td><code>delegation</code></td><td><code>model</code>, <code>provider</code>, <code>max_concurrent_children</code></td></tr>
        <tr><td><code>checkpoints</code></td><td><code>enabled</code>, <code>max_snapshots</code> (50)</td></tr>
        <tr><td><code>curator</code></td><td><code>enabled</code>, <code>interval_hours</code>, <code>stale_after_days</code></td></tr>
      </table>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">🎙 Voice Configuration <span class="arrow">▶</span></div>`,
  config: `<pre><code>stt:
  enabled: true
  provider: local    # local | groq | openai | mistral | elevenlabs</code></pre>
      <p><b>TTS</b> (Text-to-Speech):</p>
      <pre><code>tts:
  provider: edge    # edge (free) | elevenlabs | openai | minimax | gemini</code></pre>
      <p>In-session: <code>/voice on</code> (two-way), <code>/voice tts</code> (output only), <code>/voice off</code>.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">🔄 Provider Setup <span class="arrow">▶</span></div>
    <div class="card-body">
      <pre><code>hermes model                    # Interactive picker
hermes auth add openrouter      # Add API key
hermes config set model.default gpt-4o
hermes config set model.provider openai

# Local models:
# Select "Custom endpoint" -> http://localhost:11434/v1
# Or in config:
model:
  default: qwen3.5:27b
  provider: custom
  base_url: http://localhost:11434/v1</code></pre>
      <p>Supports: OpenRouter, Nous Portal, OpenAI, Anthropic, Google, xAI, DeepSeek, local (Ollama/vLLM/llama.cpp), and 20+ more.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">👤 Profiles <span class="arrow">▶</span></div>
    <div class="card-body">
      <p>Run multiple independent Hermes instances with separate configs, sessions, skills, and memory.</p>
      <pre><code>hermes profile list                # list profiles
hermes profile create work --clone preston   # clone from existing
hermes profile use work            # switch to it
hermes --profile work              # use for one command
hermes profile export work         # share a profile</code></pre>
      <p>Each profile: <code>~/.hermes/profiles/&lt;name&gt;/</code>.</p>
    </div>
  </div>
</div>

<!-- SKILLS -->
<div class="panel" id="panel-skills">
  <div class="card">
    <div class="card-header open" onclick="toggle(this)">🧠 What Are Skills? <span class="arrow">▶</span></div>
    <div class="card-body open">
      <p>Skills are <b>Hermes' procedural memory</b> — reusable step-by-step instructions for how to do things. When Hermes encounters a familiar task, the matching skill loads automatically.</p>
      <p><b>vs Memory:</b> Memory stores <b>facts</b> (who you are, preferences, project details). Skills store <b>procedures</b> (how to do something). Both persist across sessions.</p>
      <p>~90 skills bundled, ~60 optional installable ones.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">📚 Managing Skills <span class="arrow">▶</span></div>
    <div class="card-body">
      <pre><code>hermes skills list                # see installed
hermes skills browse               # interactive browser
hermes skills search "deployment"  # search descriptions
hermes skills install &lt;id&gt;        # install from hub or URL
hermes skills config               # enable/disable per platform
hermes skills check                # validate
hermes skills update               # update from source
hermes skills uninstall &lt;name&gt;    # remove</code></pre>
      <p>In-session: <code>/skills</code>, <code>/learn &lt;source&gt;</code>, <code>/curator</code>.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">📝 How to Write a Skill <span class="arrow">▶</span></div>
    <div class="card-body">
      <p>Skills are markdown with YAML frontmatter:</p>
      <pre><code>---
name: my-skill
description: "Use when deploying to Fly.io."
version: 1.0.0
---

# My Skill`,
  skills: `<p>Or use <code>/learn ~/my-project</code> to create one from a directory.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">🤖 Bot Mode <span class="arrow">▶</span></div>
    <div class="card-body">
      <p>Turn profiles into named <b>Bots</b> — each with its own role, model, memory, skills, and avatar. Bots run routines, share group chats, and message each other.</p>
      <p>Set up from the <b>Bots tab</b> in the desktop app, TUI, or dashboard.</p>
    </div>
  </div>
</div>

<!-- SYMBOLS -->
<div class="panel" id="panel-symbols">
  <div class="card">
    <div class="card-header open" onclick="toggle(this)">🔣 CLI Symbols Decoder Ring <span class="arrow">▶</span></div>
    <div class="card-body open">
      <p>Every symbol in the Hermes TUI/CLI and what it means.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">📜 Transcript Symbols <span class="arrow">▶</span></div>
    <div class="card-body">
      <div class="symbol-grid">
        <div class="symbol-row"><span class="sym">❯</span><span class="desc">Input prompt — where you type</span></div>
        <div class="symbol-row"><span class="sym">●</span><span class="desc">A tool call (before tool name)</span></div>
        <div class="symbol-row"><span class="sym">┊</span><span class="desc">Tool-activity rail</span></div>
        <div class="symbol-row"><span class="sym">✓ / ✗</span><span class="desc">Tool succeeded / failed</span></div>
        <div class="symbol-row"><span class="sym">▸ / ▾</span><span class="desc">Collapsed / expanded section</span></div>
        <div class="symbol-row"><span class="sym">▍</span><span class="desc">Streaming cursor — model still talking</span></div>
        <div class="symbol-row"><span class="sym">│ ├─ └─</span><span class="desc">Tree rails (delegation, journey)</span></div>
        <div class="symbol-row"><span class="sym">◈</span><span class="desc">Display-only timeline event</span></div>
        <div class="symbol-row"><span class="sym">◇</span><span class="desc">Injected reference block</span></div>
        <div class="symbol-row"><span class="sym">↳</span><span class="desc">Sticky prompt — message being worked on</span></div>
        <div class="symbol-row"><span class="sym">☐ ☑ •</span><span class="desc">Task list: open / done / bullet</span></div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">📊 Status Bar Symbols <span class="arrow">▶</span></div>
    <div class="card-body">
      <div class="symbol-grid">
        <div class="symbol-row"><span class="sym">⠋⠙⠹…</span><span class="desc">Busy spinner (thinking/tool phases)</span></div>
        <div class="symbol-row"><span class="sym">☤🌀🤔✨</span><span class="desc">Emoji busy indicator frames</span></div>
        <div class="symbol-row"><span class="sym">⏱</span><span class="desc">Per-prompt elapsed time</span></div>
        <div class="symbol-row"><span class="sym">cmp N</span><span class="desc">Session auto-compressed N times</span></div>
        <div class="symbol-row"><span class="sym">▶ N</span><span class="desc">N background tasks running</span></div>`,
  symbols: `<div class="symbol-row"><span class="sym">● REC</span><span class="desc">Voice mode recording</span></div>
        <div class="symbol-row"><span class="sym">♥</span><span class="desc">Affection flash — you were nice!</span></div>
        <div class="symbol-row"><span class="sym">⚡/🔋</span><span class="desc">Battery indicator</span></div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">⚠️ Approval &amp; Subagent Symbols <span class="arrow">▶</span></div>
    <div class="card-body">
      <div class="symbol-grid">
        <div class="symbol-row"><span class="sym">⚠ approval</span><span class="desc">Tool needs your explicit yes</span></div>
        <div class="symbol-row"><span class="sym">🔐</span><span class="desc">Sudo password (masked)</span></div>
        <div class="symbol-row"><span class="sym">🔑</span><span class="desc">Credential input (masked)</span></div>
        <div class="symbol-row"><span class="sym">●</span><span class="desc">Subagent running</span></div>
        <div class="symbol-row"><span class="sym">○</span><span class="desc">Subagent queued</span></div>
        <div class="symbol-row"><span class="sym">✓</span><span class="desc">Subagent completed</span></div>
        <div class="symbol-row"><span class="sym">■</span><span class="desc">Subagent interrupted</span></div>
        <div class="symbol-row"><span class="sym">✗</span><span class="desc">Subagent failed</span></div>
        <div class="symbol-row"><span class="sym">⌛</span><span class="desc">Subagent timed out</span></div>
        <div class="symbol-row"><span class="sym">↻ / ⏸</span><span class="desc">Goal continuing / paused</span></div>
      </div>
    </div>
  </div>
</div>

<!-- FAQ -->
<div class="panel" id="panel-faq">
  <div class="card">
    <div class="card-header open" onclick="toggle(this)">❓ Common Questions <span class="arrow">▶</span></div>
    <div class="card-body open">
      <p>Quick answers to the most frequent questions about Hermes.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">❓ Which model should I use? <span class="arrow">▶</span></div>
    <div class="card-body">
      <ul>
        <li><b>Best overall:</b> Claude Opus 4 / GPT-5 via OpenRouter or Nous Portal</li>
        <li><b>Fast &amp; cheap:</b> Claude Sonnet / GPT-4o mini / Gemini Flash</li>
        <li><b>Coding:</b> Claude Opus 4 / GPT-5-codex / DeepSeek Coder</li>
        <li><b>Local (free):</b> Qwen 3.5, Llama 3.x via Ollama</li>
        <li><b>Newcomer:</b> Nous Portal — one OAuth login, 300+ models</li>
      </ul>
      <p>Run <code>hermes model</code> to pick interactively.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">❓ How much does it cost? <span class="arrow">▶</span></div>
    <div class="card-body">Hermes is <b>free and open-source</b> (MIT). You only pay for LLM API usage. Local models are completely free.</div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">❓ Is my data sent anywhere? <span class="arrow">▶</span></div>
    <div class="card-body">API calls go <b>only to the LLM provider you configure</b>. Hermes does <b>not</b> collect telemetry, usage data, or analytics. Everything is stored locally in <code>~/.hermes/</code>.</div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">❓ Can I use it offline? <span class="arrow">▶</span></div>
    <div class="card-body">Yes! Use local models via Ollama, llama.cpp, vLLM. Run <code>hermes model</code> and select <b>Custom endpoint</b> → <code>http://localhost:11434/v1</code>.</div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">❓ What's the difference between memory and skills? <span class="arrow">▶</span></div>`,
  faq: `<div class="card">
    <div class="card-header" onclick="toggle(this)">❓ Can multiple people use one instance? <span class="arrow">▶</span></div>
    <div class="card-body">Yes — via the messaging gateway (Telegram, Discord, Slack, WhatsApp). Access is controlled through allowlists and DM pairing.</div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">❓ How do I update Hermes? <span class="arrow">▶</span></div>
    <div class="card-body"><code>hermes update</code> or <code>/update</code> in-session. After updating, restart any running gateway processes.</div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">❓ What surfaces does Hermes have? <span class="arrow">▶</span></div>
    <div class="card-body">
      <table>
        <tr><th>Surface</th><th>Command</th></tr>
        <tr><td>Desktop app</td><td><code>hermes desktop</code></td></tr>
        <tr><td>Web Dashboard</td><td><code>hermes dashboard</code></td></tr>
        <tr><td>Ink TUI</td><td><code>hermes --tui</code></td></tr>
        <tr><td>Classic CLI</td><td><code>hermes</code></td></tr>
        <tr><td>OpenAI Proxy</td><td><code>hermes proxy</code></td></tr>
        <tr><td>Messaging</td><td>Gateway (20+ platforms)</td></tr>
        <tr><td>IDE</td><td>ACP server (VS Code, Zed, JetBrains)</td></tr>
      </table>
    </div>
  </div>
</div>

<!-- TROUBLESHOOTING -->
<div class="panel" id="panel-trouble">
  <div class="card">
    <div class="card-header open" onclick="toggle(this)">🩹 First Aid Checklist <span class="arrow">▶</span></div>
    <div class="card-body open">
      <pre><code>hermes doctor --fix          # Check and fix deps/config
hermes auth status           # Check API keys/OAuth
hermes logs -f errors        # Look at error logs
hermes status --full         # See component health</code></pre>
      <p>Gateway issues: <code>grep -i "failed to send\\|error" ~/.hermes/logs/gateway.log | tail -20</code></p>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">💥 "hermes: command not found" <span class="arrow">▶</span></div>
    <div class="card-body">
      <b>Fix:</b>
      <pre><code>source ~/.bashrc    # bash
source ~/.zshrc     # zsh</code></pre>
      Verify: <code>which hermes</code>, <code>ls ~/.local/bin/hermes</code>.
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">🔇 Tool not available <span class="arrow">▶</span></div>
    <div class="card-body">
      <ol>
        <li><code>hermes tools</code> — check toolset enabled for your platform</li>
        <li>Some tools need env vars — check <code>~/.hermes/.env</code></li>
        <li><code>/reset</code> after enabling (new session needed)</li>
      </ol>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">🔑 Model/Provider Issues <span class="arrow">▶</span></div>
    <div class="card-body">
      <ol>`,
  trouble: `<li>Check <code>~/.hermes/.env</code> has the right API key</li>
        <li><b>Copilot 403:</b> <code>gh auth login</code> tokens do NOT work for Copilot API. Use the Copilot-specific OAuth flow via <code>hermes model</code> → GitHub Copilot</li>
      </ol>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">🔄 Changes Not Taking Effect <span class="arrow">▶</span></div>
    <div class="card-body">
      <ul>
        <li><b>Tools/skills:</b> <code>/reset</code> starts a new session</li>
        <li><b>Config (gateway):</b> <code>/restart</code></li>
        <li><b>Config (CLI):</b> Exit and relaunch Hermes</li>
      </ul>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">🌐 web_extract Shows Stale Page <span class="arrow">▶</span></div>
    <div class="card-body">
      <p>Results cached for 20 minutes. Bypass with exempt hosts, min TTL, or disabling cache entirely:</p>
      <pre><code># config.yaml — choose one:
web:
  cache_exempt_hosts:
    - mysite.vercel.app
    - "*.ngrok-free.app"

# Or: web.cache_ttl_minutes: 1   (min TTL)
# Or: web.cache_enabled: false   (disable entirely)</code></pre>
      <p>Localhost/private IPs are always fetched live.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">🎙 Voice Not Working <span class="arrow">▶</span></div>
    <div class="card-body">
      <ol>
        <li>Check <code>stt.enabled: true</code> in config</li>
        <li>Install whisper: <code>python -c "import pm; pm.sync_venv(['stt-whisper'], explicit=True)"</code></li>
        <li>In gateway: <code>/restart</code>. In CLI: exit and relaunch.</li>
      </ol>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">⚙️ Gateway Dies on SSH Logout <span class="arrow">▶</span></div>
    <div class="card-body">
      <ul>
        <li><b>SSH logout:</b> <code>sudo loginctl enable-linger $USER</code></li>
        <li><b>WSL2:</b> <code>systemd=true</code> in <code>/etc/wsl.conf</code></li>
        <li><b>Crash loop:</b> <code>systemctl --user reset-failed hermes-gateway</code></li>
      </ul>
    </div>
  </div>
  <div class="card">
    <div class="card-header" onclick="toggle(this)">🔧 Discord / Slack Bot Issues <span class="arrow">▶</span></div>
    <div class="card-body">
      <ul>
        <li><b>Discord silent:</b> Enable <b>Message Content Intent</b> in Bot settings</li>
        <li><b>Slack only DMs:</b> Subscribe to <code>message.channels</code> event</li>
      </ul>
    </div>
  </div>
</div>`,
  features: `
      <div class="card">
        <div class="card-header open" onclick="toggle(this)">🔧 Capabilities <span class="arrow">▶</span></div>
        <div class="card-body open">
          <p>The <b>Capabilities</b> section in your sidebar is where you manage what Hermes can do — skills, toolsets, MCP servers, and connectors.</p>
          <ul>
            <li><b>Skills</b> — ~90 bundled + ~60 optional procedural knowledge docs. Browse: <code>hermes skills browse</code> or <a href="https://hermes-agent.nousresearch.com/docs/user-guide/features/skills" style="color:var(--accent)">Skills System Docs</a></li>
            <li><b>Toolsets</b> — Enable/disable groups of tools per platform: <code>hermes tools</code></li>
            <li><b>MCP Servers</b> — Connect external tool servers (GitHub, Linear, etc): <code>hermes mcp catalog</code> or <a href="https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp" style="color:var(--accent)">MCP Docs</a></li>
            <li><b>Connectors</b> — Connect Google Workspace, Notion, and more via <code>manage_connections</code></li>
            <li><b>Plugin Catalog</b> — Install community plugins: <code>hermes plugins install &lt;name&gt;</code></li>
          </ul>
          <p>📖 <a href="https://hermes-agent.nousresearch.com/docs/user-guide/features/overview" style="color:var(--accent)">Full Capabilities Overview →</a></p>
        </div>
      </div>

      <div class="card">
        <div class="card-header" onclick="toggle(this)">📦 Artifacts (Deliverable Mode) <span class="arrow">▶</span></div>
        <div class="card-body">
          <p>Hermes can deliver generated files directly into your chat as native attachments — charts, PDFs, spreadsheets, images, audio, and more.</p>
          <p><b>How it works:</b> The agent generates a file to an absolute path (e.g. <code>~/.hermes/cache/scratch/chart.png</code>), mentions that path in its reply, and the gateway uploads it as a native attachment. Images embed inline, PDFs become downloads, audio routes to voice.</p>
          <p><b>Supported:</b> Images (.png, .jpg, .gif, .svg), Video (.mp4, .mov), Audio (.mp3, .wav, .ogg), Documents (.pdf, .docx, .txt), Data (.xlsx, .csv, .json), Presentations (.pptx), and more.</p>
          <p>📖 <a href="https://hermes-agent.nousresearch.com/docs/user-guide/features/deliverable-mode" style="color:var(--accent)">Artifacts Docs →</a></p>
        </div>
      </div>

      <div class="card">
        <div class="card-header" onclick="toggle(this)">⏰ Scheduled Jobs (Cron) <span class="arrow">▶</span></div>
        <div class="card-body">
          <p>Schedule tasks to run automatically — one-shot or recurring, with natural language or cron expressions.</p>
          <pre><code>/cron add "every 2h" "Check server status"
/cron add "daily at 9am" "Morning briefing" --skill daily-briefing
hermes cron list          # see all jobs
hermes cron edit &lt;id&gt;    # modify a job
hermes cron pause &lt;id&gt;   # pause without deleting</code></pre>
          <p><b>Schedule formats:</b> <code>30m</code>, <code>every 2h</code>, <code>daily at 9am</code>, <code>0 9 * * *</code>, ISO timestamps. Jobs can attach skills, run in no-agent (script-only) mode, and fire on external webhook events.</p>
          <p>📖 <a href="https://hermes-agent.nousresearch.com/docs/user-guide/features/cron" style="color:var(--accent)">Cron Docs →</a></p>
        </div>
      </div>

      <div class="card">
        <div class="card-header" onclick="toggle(this)">🏠 Home (Dashboard) <span class="arrow">▶</span></div>
        <div class="card-body">
          <p>The <b>Home</b> page in the sidebar opens the <b>Web Dashboard</b> — a browser-based admin panel for managing your entire Hermes installation:</p>
          <ul>
            <li><b>Status</b> — Agent version, gateway health, active sessions</li>
            <li><b>Config</b> — Edit settings without touching YAML</li>
            <li><b>API Keys</b> — Manage credentials across providers</li>
            <li><b>Skills</b> — Browse, install, and manage skills</li>
            <li><b>MCP</b> — Configure Model Context Protocol servers</li>
            <li><b>Sessions</b> — Browse and manage past sessions</li>
            <li><b>Cron</b> — Visual scheduled job manager</li>
            <li><b>Chat</b> — Embedded terminal chat with profile support</li>
          </ul>
          <pre><code>hermes dashboard          # launch the web dashboard
hermes dashboard --port 8080  # custom port</code></pre>
          <p>📖 <a href="https://hermes-agent.nousresearch.com/docs/user-guide/features/web-dashboard" style="color:var(--accent)">Dashboard Docs →</a></p>
        </div>
      </div>

      <div class="card">
        <div class="card-header" onclick="toggle(this)">🧠 Memory System <span class="arrow">▶</span></div>
        <div class="card-body">
          <p>Persistent memory across sessions — Hermes remembers you, your projects, and your preferences.</p>
          <ul>
            <li><b>MEMORY.md</b> — Agent's notes: environment facts, conventions, lessons (2,200 char limit)</li>
            <li><b>USER.md</b> — Your profile: preferences, style, expectations (1,375 char limit)</li>
            <li><b>Session Search</b> — Search past conversations when needed</li>
            <li><b>Memory Providers</b> — External backends: Honcho, Mem0, OpenViking, Supermemory, and more</li>
          </ul>
          <pre><code>hermes memory setup       # configure memory provider
hermes memory status      # check memory health
/memory [pending|approve|reject]  # review pending writes</code></pre>
          <p>📖 <a href="https://hermes-agent.nousresearch.com/docs/user-guide/features/memory" style="color:var(--accent)">Memory Docs →</a></p>
        </div>
      </div>

      <div class="card">
        <div class="card-header" onclick="toggle(this)">📋 Kanban (Multi-Agent Board) <span class="arrow">▶</span></div>
        <div class="card-body">
          <p>Durable SQLite-backed task board for coordinating multiple Hermes profiles — like having a team of agents working together.</p>
          <p><b>Key concepts:</b></p>
          <ul>
            <li><b>Tasks</b> — Full work items with title, body, assignee, priority, status</li>
            <li><b>Workers</b> — Named agent profiles dispatchable to tasks</li>
            <li><b>Board</b> — Columns: triage → todo → ready → running → review → done</li>
            <li><b>Handoffs</b> — Structured completion summaries and review cycles</li>
            <li><b>Artifacts</b> — Files attach to completion notifications</li>
          </ul>
          <pre><code>hermes kanban list        # see the board
hermes kanban create "title" --assignee worker
/kanban [sub]             # manage in-session</code></pre>
          <p>📖 <a href="https://hermes-agent.nousresearch.com/docs/user-guide/features/kanban" style="color:var(--accent)">Kanban Docs →</a> · <a href="https://hermes-agent.nousresearch.com/docs/user-guide/features/kanban-tutorial" style="color:var(--accent)">Tutorial →</a></p>
        </div>
      </div>

      <div class="card">
        <div class="card-header" onclick="toggle(this)">📡 Newswire <span class="arrow">▶</span></div>
        <div class="card-body">
          <p>A built-in desktop plugin that shows a scrolling news ticker at the bottom of the app and a full /newswire page.</p>
          <ul>
            <li><b>Bottom ticker</b> — Continuous scrolling headlines in a thin strip above the status bar</li>
            <li><b>Full page</b> — Latest headlines, sources, and settings at /newswire</li>
            <li><b>Custom sources</b> — Add RSS/Atom feeds in the Sources tab</li>
            <li><b>No LLM usage</b> — Feed polling and rendering are handled by a Python backend</li>
          </ul>
          <p>📖 Available from the <b>Newswire</b> sidebar entry in the Hermes desktop app.</p>
        </div>
      </div>
`,
}

const TAB_KEYS = ['desktop','terminal','tools','slash','connections','config','skills','symbols','faq','trouble','features']

function HelpPage() {
  const [activeTab, setActiveTab] = useState('desktop')
  const [searchQ, setSearchQ] = useState('')
  const contentRef = useRef(null)

  const handleClick = useCallback((e) => {
    const header = e.target.closest('.card-header')
    if (header && contentRef.current && contentRef.current.contains(header)) {
      const body = header.nextElementSibling
      if (body && body.classList.contains('card-body')) {
        header.classList.toggle('open')
        body.classList.toggle('open')
      }
    }
  }, [])

  useEffect(() => {
    if (!contentRef.current) return
    const q = searchQ.trim().toLowerCase()
    if (!q) {
      contentRef.current.querySelectorAll('.card').forEach(c => c.style.display = '')
      return
    }
    contentRef.current.querySelectorAll('.card').forEach(c => {
      c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none'
    })
  }, [searchQ])

  const showAll = searchQ.trim().length > 0
  const contentHtml = showAll ? TAB_KEYS.map(k => PANELS[k]).join('\n') : PANELS[activeTab]

  return jsxs('div', {
    style: { display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' },
    children: [
      jsxs('div', {
        style: { display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px 8px', borderBottom:'1px solid var(--border)', flexShrink:0 },
        children: [
          jsx('span', { style: { fontSize:'24px' }, children: '\u{1F3E5}' }),
          jsxs('div', { children: [
            jsx('span', { style: { fontSize:'16px', fontWeight:700, color:'var(--foreground)' }, children: 'Hermes ' }),
            jsx('span', { style: { fontSize:'16px', fontWeight:700, color:'var(--accent)' }, children: 'Help Center' }),
            jsx('div', { style: { fontSize:'11px', color:'var(--muted-foreground)' }, children: 'Complete guide — desktop, CLI, tools, connections & more' })
          ]})
        ]
      }),
      jsx('input', {
        type:'text', placeholder:'Search across all sections\u2026',
        value: searchQ,
        onInput: (e) => setSearchQ(e.target.value),
        style: { margin:'8px 16px', padding:'6px 12px', fontSize:'13px', flexShrink:0,
          border:'1px solid var(--border)', borderRadius:'6px',
          background:'var(--bg)', color:'var(--fg)', outline:'none', boxSizing:'border-box' }
      }),
      jsx('div', {
        style: { display:'flex', gap:'2px', padding:'0 16px', borderBottom:'1px solid var(--border)', overflowX:'auto', flexShrink:0, scrollbarWidth:'none' },
        children: TAB_KEYS.map(key =>
          jsx('div', {
            onClick: () => { setActiveTab(key); setSearchQ('') },
            style: {
              padding:'6px 12px', fontSize:'12px', fontWeight:500, cursor:'pointer',
              whiteSpace:'nowrap', borderBottom:'2px solid ' + (key===activeTab&&!showAll?'var(--accent)':'transparent'),
              color: key===activeTab&&!showAll?'var(--accent)':'var(--muted-foreground)',
              transition:'color .15s,border .15s', userSelect:'none', flexShrink:0
            },
            children: ({
              desktop: '🖥 Desktop', terminal: '💻 Terminal/CLI',
              tools: '🔧 Tools', slash: '⚡ Slash Cmds',
              connections: '🔌 Connections', config: '⚙️ Config',
              skills: '🧠 Skills', symbols: '🔣 Symbols',
              faq: '❓ FAQ', trouble: '🩹 Troubleshoot',
              features: '📋 Features'
            })[key] || key
          }, 'tb-'+key)
        )
      }),
      jsx('div', {
        ref: contentRef, onClick: handleClick,
        style: { flex:1, overflow:'auto', padding:'12px 16px' },
        children: jsx('div', {
          dangerouslySetInnerHTML: { __html: contentHtml }
        })
      }),
      jsx('style', { children: HCSS })
    ]
  })
}

function register(ctx) {
  ctx.register({ id:'page', area:ROUTES_AREA, data:{path:PLUGIN_ROUTE}, render:()=>jsx(HelpPage,{}) })
  ctx.register({ id:'nav', area:SIDEBAR_NAV_AREA, data:{path:PLUGIN_ROUTE, label:PLUGIN_NAME, codicon:'book'} })
  ctx.register({ id:'open', area:PALETTE_AREA, data:{id:PLUGIN_ID+'.open', label:'Open '+PLUGIN_NAME, keywords:['help','docs','guide','manual','faq','reference','troubleshoot','hermes'], run:()=>host.navigate(PLUGIN_ROUTE)} })
}

export default {
  id: PLUGIN_ID,
  name: PLUGIN_NAME,
  defaultEnabled: true,
  register
}