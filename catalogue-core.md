task_id: ses_3a1f98c09ffelNB1hZlWORF0jD (for resuming to continue this task if needed)

<task_result>
Now I have everything. Here is the exhaustive catalogue:

---

# FORME TUI FRAMEWORK — CORE ARCHITECTURE CATALOGUE

Package name: `forme`

---

## FILE: `app.go` (932 lines)

### Debug Variables (package-level)

| # | Name | Line | What | Does | Depends On | Depended On By |
|---|------|------|------|------|-----------|----------------|
| 1 | `DebugTiming` | 14 | `bool` var | Enables per-frame timing instrumentation (build/layout/render/flush) | — | `render()` checks it |
| 2 | `DebugFullRedraw` | 15 | `bool` var | Forces full redraws instead of diff-based; set via `TUI_FULL_REDRAW=1` | — | `render()` checks it |
| 3 | `DebugFlush` | 16 | `bool` var | Dumps flush debug info; set via `TUI_DEBUG_FLUSH=1` | — | Not directly referenced in app.go but sets a mode for screen.go |
| 4 | `lastBuildTime` | 17 | `time.Duration` var | Stores duration of the build phase from last frame | — | `TimingString()`, `GetTimings()` |
| 5 | `lastLayoutTime` | 18 | `time.Duration` var | Stores duration of the layout phase from last frame | — | `TimingString()`, `GetTimings()` |
| 6 | `lastRenderTime` | 19 | `time.Duration` var | Stores duration of the render phase from last frame | — | `TimingString()`, `GetTimings()` |
| 7 | `lastFlushTime` | 20 | `time.Duration` var | Stores duration of the flush phase from last frame | — | `TimingString()`, `GetTimings()` |
| 8 | `init()` | 23-30 | `func` | Reads `TUI_FULL_REDRAW` and `TUI_DEBUG_FLUSH` env vars to set debug flags at package init | `os.Getenv` | — |

### Type: `App` (line 33)

The root application type. Manages the entire TUI lifecycle.

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 9 | `App` | 33 | `struct` | Root TUI application with integrated input handling, view management, cursor, jump mode, and inline mode | `Screen`, `riffkey.Router`, `riffkey.Input`, `riffkey.Reader`, `Template`, `BufferPool`, `Layer`, `JumpMode`, `JumpStyle`, `CursorShape`, `Color` | Everything in the app layer | Central orchestrator |
| 10 | `App.screen` | 34 | field `*Screen` | The terminal screen abstraction (double-buffered) | `Screen` | `render()`, `run()`, `handleResize()`, `Size()` | |
| 11 | `App.router` | 37 | field `*riffkey.Router` | Root key-binding router for single-view mode | `riffkey.Router` | `Handle()`, `HandleNamed()`, `BindField()`, `JumpKey()`, `wireBindings()` | |
| 12 | `App.input` | 38 | field `*riffkey.Input` | Input dispatcher managing a stack of routers | `riffkey.Input` | `run()`, `Push()`, `Pop()`, `Go()`, `PushView()`, `PopView()`, `EnterJumpMode()`, `ExitJumpMode()` | |
| 13 | `App.reader` | 39 | field `*riffkey.Reader` | Reads raw key events from stdin | `riffkey.Reader` | `run()` | |
| 14 | `App.template` | 42 | field `*Template` | Compiled template for single-view mode (SetView path) | `Template` | `render()`, `SetView()` | |
| 15 | `App.pool` | 43 | field `*BufferPool` | Double-buffered pool for rendering | `BufferPool` | `render()`, `SetView()`, `View()`, `handleResize()` | |
| 16 | `App.viewTemplates` | 46 | field `map[string]*Template` | Named templates for multi-view routing | `Template` | `render()`, `View()`, `UpdateView()`, `Go()` | |
| 17 | `App.viewRouters` | 47 | field `map[string]*riffkey.Router` | Per-view routers for multi-view routing | `riffkey.Router` | `View()`, `Go()`, `PushView()`, `ViewRouter()` | |
| 18 | `App.currentView` | 48 | field `string` | Name of the currently active view | — | `render()`, `Go()`, `run()` | |
| 19 | `App.viewStack` | 49 | field `[]string` | Stack of pushed view names for modal overlays | — | `render()`, `PushView()`, `PopView()` | |
| 20 | `App.running` | 52 | field `bool` | Whether the app is currently running | — | `run()`, `Stop()`, `RunNonInteractive()`, `handleRenderRequests()` | |
| 21 | `App.renderMu` | 53 | field `sync.Mutex` | Protects render() from concurrent access | — | `render()` | |
| 22 | `App.renderChan` | 54 | field `chan struct{}` | Buffered channel (cap 1) to coalesce render requests | — | `RequestRender()`, `handleRenderRequests()`, `RunNonInteractive()` | Design: channel cap 1 = coalescing pattern (at most one pending render) |
| 23 | `App.cursorX` | 57 | field `int` | Cursor X position (0-indexed screen coordinates) | — | `SetCursor()`, `Cursor()`, `render()` | |
| 24 | `App.cursorY` | 57 | field `int` | Cursor Y position (0-indexed screen coordinates) | — | `SetCursor()`, `Cursor()`, `render()` | |
| 25 | `App.cursorVisible` | 58 | field `bool` | Whether cursor is visible | — | `ShowCursor()`, `HideCursor()`, `Cursor()`, `render()` | |
| 26 | `App.cursorShape` | 59 | field `CursorShape` | Cursor visual shape (block, bar, underline, etc.) | `CursorShape` | `SetCursorStyle()`, `Cursor()`, `render()` | |
| 27 | `App.cursorColor` | 60 | field `Color` | Cursor color for OSC 12 | `Color` | `SetCursorColor()`, `render()` | |
| 28 | `App.cursorColorSet` | 61 | field `bool` | Whether cursor color was explicitly set | — | `render()` | |
| 29 | `App.onResize` | 64 | field `func(width, height int)` | Resize callback | — | `handleResize()`, `OnResize()` | |
| 30 | `App.onBeforeRender` | 67 | field `func()` | Pre-render callback for syncing state before layout | — | `render()`, `OnBeforeRender()` | |
| 31 | `App.onAfterRender` | 70 | field `func()` | Post-render callback for cursor updates after layout | — | `render()`, `OnAfterRender()` | |
| 32 | `App.activeLayer` | 73 | field `*Layer` | Active layer for cursor translation during template render | `Layer` | `render()` | Set by template execution to translate layer-relative cursor to screen coords |
| 33 | `App.inline` | 76 | field `bool` | Whether this is an inline (non-fullscreen) app | — | `run()`, `render()`, `IsInline()`, `RunNonInteractive()` | |
| 34 | `App.clearOnExit` | 77 | field `bool` | Whether inline app clears content on exit | — | `ClearOnExit()`, `run()`, `RunNonInteractive()` | |
| 35 | `App.linesUsed` | 78 | field `int` | Number of lines rendered in inline mode (for cleanup) | — | `render()`, `run()`, `RunNonInteractive()` | |
| 36 | `App.viewHeight` | 79 | field `int16` | Height for inline mode rendering | — | `Height()`, `render()` | |
| 37 | `App.nonInteractive` | 80 | field `bool` | True when running via RunNonInteractive (no keyboard input) | — | `Stop()`, `RunNonInteractive()` | |
| 38 | `App.jumpMode` | 83 | field `*JumpMode` | State for jump label navigation | `JumpMode` | `EnterJumpMode()`, `ExitJumpMode()`, `JumpModeActive()`, `JumpMode()`, `AddJumpTarget()` | |
| 39 | `App.jumpStyle` | 84 | field `JumpStyle` | Visual style for jump labels | `JumpStyle` | `SetJumpStyle()`, `JumpStyle()`, `NewApp()` | |
| 40 | `App.setViewCount` | 87 | field `int` | Counter for SetView calls (for anti-pattern detection) | — | `SetView()` | |
| 41 | `App.setViewLimit` | 88 | field `int` | Maximum allowed SetView calls (0=unlimited) | — | `SetView()`, `SetViewLimit()` | |

### Constructors

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 42 | `NewApp()` | 92 | `func() (*App, error)` | Creates fullscreen TUI app with screen, router, input, reader, render channel, and jump mode defaults | `NewScreen`, `riffkey.NewRouter`, `riffkey.NewInput`, `riffkey.NewReader`, `JumpMode`, `DefaultJumpStyle` | User code, `NewInlineApp()` | renderChan has cap 1 |
| 43 | `NewInlineApp()` | 118 | `func() (*App, error)` | Creates inline TUI app (renders at cursor position, no alternate buffer) | `NewApp()` | User code | Sets `inline=true` |

### App Methods — Configuration (Builder pattern, returning `*App`)

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 44 | `App.Ref()` | 127 | method `func(f func(*App)) *App` | Calls f with the app pointer and returns self; enables inline configuration closures in chained builder calls | — | User code | Builder pattern helper |
| 45 | `App.ClearOnExit()` | 132 | method `func(clear bool) *App` | Sets whether inline app clears content on exit | — | User code | |
| 46 | `App.IsInline()` | 138 | method `func() bool` | Returns true if this is an inline app | — | User code | |
| 47 | `App.Height()` | 145 | method `func(h int16) *App` | Sets the height for inline apps (number of lines used) | — | User code | |
| 48 | `App.SetViewLimit()` | 200 | method `func(n int) *App` | Sets max number of SetView calls; panics if exceeded; for catching anti-patterns | — | `SetView()` | |

### App Methods — View Management

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 49 | `App.SetView()` | 217 | method `func(view any) *App` | Compiles a declarative view tree into a Template, wires bindings, creates/resizes BufferPool; primary single-view API | `Build()`, `Template.SetApp()`, `wireBindings()`, `NewBufferPool()` | `render()` | Panics if over setViewLimit. Design: pointers in the view are captured at compile time for reactive updates |
| 50 | `App.wireBindings()` | 237 | unexported method | Registers all declarative component bindings on a router, wires focus manager, text input, and Log invalidation | `riffkey.Router.Handle()`, `riffkey.NewTextHandler()`, `Template.pendingBindings`, `Template.pendingFocusManager`, `Template.pendingTIB`, `Template.pendingLogs` | `SetView()`, `View()`, `UpdateView()` | Wraps each handler with `RequestRender()` after dispatch. Focus manager takes precedence over single text input binding |
| 51 | `App.View()` | 290 | method `func(name string, view any) *ViewBuilder` | Registers a named view for multi-view routing; returns ViewBuilder for chaining Handle() calls | `Build()`, `Template.SetApp()`, `riffkey.NewRouter()`, `wireBindings()`, `NewBufferPool()` | User code, `render()` | Lazy-initializes viewTemplates/viewRouters maps. BufferPool is shared across all views |
| 52 | `App.UpdateView()` | 346 | method `func(name string, view any)` | Recompiles a named view with new structure; preserves existing router | `Build()`, `Template.SetApp()`, `wireBindings()` | User code | |
| 53 | `App.Go()` | 360 | method `func(name string)` | Switches to a different named view; swaps template and input handlers | `riffkey.Input.SetRouter()` | User code | |
| 54 | `App.Back()` | 371 | method `func()` | Returns to previous view (currently alias for input.Pop) | `riffkey.Input.Pop()` | User code | Comment says "may add history later" |
| 55 | `App.PushView()` | 379 | method `func(name string)` | Pushes a view as modal overlay; pushed view's handlers take precedence | `riffkey.Input.Push()` | User code | Adds to viewStack |
| 56 | `App.PopView()` | 389 | method `func()` | Removes top modal overlay; returns to previous view in stack | `riffkey.Input.Pop()` | User code | Pops from viewStack |
| 57 | `App.ViewRouter()` | 399 | method `func(name string) (*riffkey.Router, bool)` | Returns the router for a named view for advanced configuration | — | User code | |

### Type: `ViewBuilder` (line 276)

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 58 | `ViewBuilder` | 276 | `struct` | Allows chaining Handle() calls after View() registration | `App`, `riffkey.Router` | User code | Builder pattern |
| 59 | `ViewBuilder.Ref()` | 320 | method | Calls f with the ViewBuilder pointer and returns self | — | User code | |
| 60 | `ViewBuilder.NoCounts()` | 324 | method `func() *ViewBuilder` | Disables vim-style count prefixes (e.g. 5j) for this view; use when view has text input | `riffkey.Router.NoCounts()` | User code | |
| 61 | `ViewBuilder.Handle()` | 332 | method `func(pattern string, handler any) *ViewBuilder` | Registers a key handler for this view; accepts func(riffkey.Match), func(any), or func(); auto-requests re-render | `riffkey.Router.Handle()`, `App.RequestRender()` | User code | |

### App Methods — Accessors

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 62 | `App.Screen()` | 408 | method `func() *Screen` | Returns the Screen | — | User code | |
| 63 | `App.Router()` | 413 | method `func() *riffkey.Router` | Returns the root riffkey router | — | User code | |
| 64 | `App.Input()` | 418 | method `func() *riffkey.Input` | Returns the riffkey input for modal handling (push/pop) | — | User code | |
| 65 | `App.Template()` | 527 | method `func() *Template` | Returns current template for debugging (e.g. DebugDump) | — | User code | |
| 66 | `App.Size()` | 812 | method `func() Size` | Returns current screen dimensions | `Screen.Size()` | User code | |

### App Methods — Input Handling

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 67 | `App.Handle()` | 426 | method `func(pattern string, handler any) *App` | Registers key binding with vim-style pattern; accepts func(riffkey.Match)/func(any)/func(); auto-requests re-render | `riffkey.Router.Handle()`, `RequestRender()` | User code | Builder pattern |
| 68 | `App.HandleNamed()` | 440 | method `func(name, pattern string, handler func(riffkey.Match)) *App` | Registers a named key binding for rebinding support; auto-requests re-render | `riffkey.Router.HandleNamed()`, `RequestRender()` | User code | |
| 69 | `App.BindField()` | 446 | method `func(f *InputState) *App` | Routes unmatched keys to a text input field | `riffkey.Router.TextInput()`, `InputState` | User code | |
| 70 | `App.UnbindField()` | 452 | method `func() *App` | Clears text input field binding | `riffkey.Router.HandleUnmatched()` | User code | |
| 71 | `App.Push()` | 458 | method `func(r *riffkey.Router)` | Pushes a new router onto input stack (for modal input) | `riffkey.Input.Push()` | User code | |
| 72 | `App.Pop()` | 463 | method `func()` | Pops current router from input stack | `riffkey.Input.Pop()` | User code | |

### App Methods — Cursor Management

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 73 | `App.SetCursor()` | 469 | method `func(x, y int)` | Sets cursor position (0-indexed screen coordinates) | — | User code | |
| 74 | `App.SetCursorStyle()` | 475 | method `func(style CursorShape)` | Sets cursor visual shape | `CursorShape` | User code | |
| 75 | `App.ShowCursor()` | 480 | method `func()` | Makes cursor visible | — | User code | |
| 76 | `App.HideCursor()` | 485 | method `func()` | Hides cursor | — | User code | |
| 77 | `App.SetCursorColor()` | 491 | method `func(c Color)` | Sets cursor color using OSC 12 escape sequence | `Color` | User code, `render()` | |
| 78 | `App.Cursor()` | 497 | method `func() Cursor` | Returns current cursor state as Cursor struct | `Cursor` | User code | |

### App Methods — Callbacks

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 79 | `App.OnResize()` | 509 | method `func(fn func(width, height int))` | Sets resize callback | — | `handleResize()` | |
| 80 | `App.OnBeforeRender()` | 515 | method `func(fn func())` | Sets before-render callback for syncing state before layout | — | `render()` | |
| 81 | `App.OnAfterRender()` | 521 | method `func(fn func())` | Sets after-render callback for cursor updates after layout | — | `render()` | |

### App Methods — Render Pipeline

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 82 | `App.RequestRender()` | 533 | method `func()` | Non-blocking send to renderChan; safe from any goroutine; coalesces multiple requests into one | `renderChan` | `Handle()`, `HandleNamed()`, `wireBindings()`, `Go()`, `PushView()`, `PopView()`, `handleResize()`, `EnterJumpMode()`, `ExitJumpMode()` | Channel cap 1 = at most one pending render |
| 83 | `App.RenderNow()` | 544 | method `func()` | Performs render immediately (no channel); for dedicated update goroutines to avoid scheduler overhead | `render()` | User code | Mutex-protected |
| 84 | `App.render()` | 549 | unexported method | **THE CORE RENDER FUNCTION.** Lock, call onBeforeRender, clear activeLayer, get buffer from pool, resolve view priority (viewStack > currentView > template), execute template into buffer, apply layer cursor, call onAfterRender, copy to screen back buffer, flush (inline or fullscreen), swap pool, buffer cursor ops, single-syscall FlushBuffer | `BufferPool.Current()`, `Template.Execute()`, `copyToScreen()`, `Screen.Flush()`/`Screen.FlushFull()`/`Screen.FlushInline()`, `Screen.BufferCursor()`, `Screen.BufferCursorColor()`, `Screen.FlushBuffer()`, `BufferPool.Swap()`, `Layer.ScreenCursor()` | `run()`, `RenderNow()`, `handleRenderRequests()`, `RunNonInteractive()`, `EnterJumpMode()` | View priority: pushed views > current named view > base template. Timing instrumented when DebugTiming set. Design: single syscall for content + cursor |
| 85 | `App.copyToScreen()` | 661 | unexported method `func(src *Buffer)` | Copies pool buffer to screen's back buffer using fast bulk CopyFrom | `Screen.Buffer()`, `Buffer.CopyFrom()` | `render()` | |

### Timing API

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 86 | `TimingString()` | 667 | `func() string` | Returns formatted timing string for last frame | `lastBuildTime`, `lastLayoutTime`, `lastRenderTime`, `lastFlushTime` | User code | |
| 87 | `Timings` | 676 | `struct` | Holds timing data (BuildUs, LayoutUs, RenderUs, FlushUs) as float64 microseconds | — | `GetTimings()` | |
| 88 | `GetTimings()` | 684 | `func() Timings` | Returns timing data for the last frame | All lastXxxTime vars | User code | |

### App Lifecycle

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 89 | `App.Run()` | 695 | method `func() error` | Starts app, blocks until Stop(); for single-view apps | `run("")` | User code | |
| 90 | `App.RunFrom()` | 701 | method `func(startView string) error` | Starts app on specified view; for multi-view apps | `run(startView)` | User code | |
| 91 | `App.run()` | 705 | unexported method | **CORE LIFECYCLE.** Sets running=true, configures starting view, defers pool.Stop(), enters raw/inline mode, defers exit, starts handleResize goroutine, starts handleRenderRequests goroutine, does initial render, runs riffkey input loop with afterDispatch callback that renders after every key | `Screen.EnterRawMode()`/`EnterInlineMode()`, `Screen.ExitRawMode()`/`ExitInlineMode()`, `handleResize()`, `handleRenderRequests()`, `render()`, `riffkey.Input.Run()`, `reopenStdin()` | `Run()`, `RunFrom()` | Input loop calls render() in afterDispatch callback. Stop() closes stdin to unblock reader. |
| 92 | `App.RunNonInteractive()` | 153 | method `func() error` | Runs inline app without input loop; for progress bars/spinners; polls renderChan with 50ms timeout | `Screen.EnterInlineMode()`, `Screen.ExitInlineMode()`, `render()`, `BufferPool.Stop()` | User code | Only works with inline apps |
| 93 | `App.handleRenderRequests()` | 766 | unexported method | Goroutine that reads from renderChan and calls render(); exits when running=false | `renderChan`, `render()` | `run()` | |
| 94 | `App.Stop()` | 779 | method `func()` | Sets running=false and closes stdin to unblock input reader | — | User code | Does not close stdin for non-interactive apps |
| 95 | `reopenStdin()` | 789 | unexported `func()` | Reopens stdin from `/dev/tty` after close; allows running multiple inline apps in sequence | `os.Open("/dev/tty")` | `run()` | Platform-specific (Unix) |
| 96 | `App.handleResize()` | 797 | unexported method | Goroutine reading from Screen.ResizeChan(); resizes buffer pool, calls onResize callback, requests render | `Screen.ResizeChan()`, `BufferPool.Resize()`, `RequestRender()` | `run()` | |

### Jump Mode

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 97 | `App.JumpKey()` | 822 | method `func(pattern string) *App` | Registers a key to trigger jump mode | `riffkey.Router.Handle()`, `EnterJumpMode()` | User code | |
| 98 | `App.SetJumpStyle()` | 830 | method `func(style JumpStyle) *App` | Sets global jump label style | `JumpStyle` | User code | |
| 99 | `App.JumpStyle()` | 836 | method `func() JumpStyle` | Returns current jump style | — | User code | |
| 100 | `App.JumpModeActive()` | 841 | method `func() bool` | Returns true if jump mode is active | `JumpMode.Active` | User code | |
| 101 | `App.JumpMode()` | 846 | method `func() *JumpMode` | Returns jump mode state for rendering | — | User code | |
| 102 | `App.EnterJumpMode()` | 853 | method `func()` | Activates jump mode: triggers render to collect targets, assigns labels, creates temp router with handlers for each label, Esc to cancel, unmatched key handler for multi-char labels | `JumpMode`, `render()`, `riffkey.NewRouter()`, `riffkey.Input.Push()`, `RequestRender()` | `JumpKey()` | Creates a temporary input router pushed onto the stack |
| 103 | `App.ExitJumpMode()` | 914 | method `func()` | Deactivates jump mode, clears targets, pops input router | `JumpMode`, `riffkey.Input.Pop()`, `RequestRender()` | `EnterJumpMode()` closures | |
| 104 | `App.AddJumpTarget()` | 927 | method `func(x, y int16, onSelect func(), style Style)` | Registers a jump target during rendering; called by Jump components | `JumpMode.AddTarget()` | Template execution (Jump components) | |

---

## FILE: `tui.go` (867 lines)

### Attribute System

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 105 | `Attribute` | 8 | `type uint8` | Bitmask for text styling attributes | — | `Style`, all attribute constants | |
| 106 | `AttrNone` | 10 | `const Attribute = 0` | No attributes | — | — | |
| 107 | `AttrBold` | 11 | `const Attribute = 1 << iota` | Bold text (SGR 1) | — | `Screen.writeStyle()` | Uses iota starting from 1 |
| 108 | `AttrDim` | 12 | `const Attribute` | Dim/faint text (SGR 2) | — | `Screen.writeStyle()` | |
| 109 | `AttrItalic` | 13 | `const Attribute` | Italic text (SGR 3) | — | `Screen.writeStyle()` | |
| 110 | `AttrUnderline` | 14 | `const Attribute` | Underline text (SGR 4) | — | `Screen.writeStyle()` | |
| 111 | `AttrBlink` | 15 | `const Attribute` | Blinking text (SGR 5) | — | `Screen.writeStyle()` | |
| 112 | `AttrInverse` | 16 | `const Attribute` | Inverse/reverse video (SGR 7) | — | `Screen.writeStyle()` | |
| 113 | `AttrStrikethrough` | 17 | `const Attribute` | Strikethrough text (SGR 9) | — | `Screen.writeStyle()` | |
| 114 | `Attribute.Has()` | 31 | method `func(attr Attribute) bool` | Checks if bitmask contains a given attribute | — | `Screen.writeStyle()`, `Buffer.styleToANSI()` | |
| 115 | `Attribute.With()` | 36 | method `func(attr Attribute) Attribute` | Returns new bitmask with given attribute added (OR) | — | `Style.Bold()`, etc. | |
| 116 | `Attribute.Without()` | 41 | method `func(attr Attribute) Attribute` | Returns new bitmask with given attribute removed (AND NOT) | — | User code | |

### Text Transform

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 117 | `TextTransform` | 22 | `type uint8` | Text case transformation enum | — | `Style` | |
| 118 | `TransformNone` | 24 | const | No transformation | — | — | |
| 119 | `TransformUppercase` | 25 | const | Uppercase all chars | — | `Style.Uppercase()` | |
| 120 | `TransformLowercase` | 26 | const | Lowercase all chars | — | `Style.Lowercase()` | |
| 121 | `TransformCapitalize` | 27 | const | First letter of each word uppercased | — | `Style.Capitalize()` | |

### Color System

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 122 | `ColorMode` | 46 | `type uint8` | Enum for color mode (Default/16/256/RGB) | — | `Color` | |
| 123 | `ColorDefault` | 49 | const | Terminal default color | — | — | |
| 124 | `Color16` | 50 | const | Basic 16 colours (0-15) | — | — | |
| 125 | `Color256` | 51 | const | 256 color palette (0-255) | — | — | |
| 126 | `ColorRGB` | 52 | const | 24-bit true color | — | — | |
| 127 | `Color` | 56 | `struct` | Terminal color with Mode, R/G/B, Index fields | `ColorMode` | `Style`, `Screen.writeColor()`, `Buffer.colorToANSI()` | Compact: Mode + 3 bytes for RGB or 1 byte index |
| 128 | `DefaultColor()` | 63 | `func() Color` | Returns terminal's default color | — | `DefaultStyle()` | |
| 129 | `BasicColor()` | 68 | `func(index uint8) Color` | Returns one of 16 basic terminal colours | — | All named color vars | |
| 130 | `PaletteColor()` | 73 | `func(index uint8) Color` | Returns one of 256 palette colours | — | User code | |
| 131 | `RGB()` | 78 | `func(r, g, b uint8) Color` | Returns 24-bit true color | — | `Hex()`, `LerpColor()`, User code | |
| 132 | `Hex()` | 83 | `func(hex uint32) Color` | Returns 24-bit true color from hex value (e.g. 0xFF5500) | `RGB` mode (inline) | User code | Bit-shifts to extract R/G/B |
| 133 | `LerpColor()` | 93 | `func(a, b Color, t float64) Color` | Linear interpolation between two colours; t=0 returns a, t=1 returns b | `RGB()` | User code | Clamps t to [0,1] |
| 134 | `Black` through `BrightWhite` | 109-127 | `var Color` (14 vars) | Pre-defined standard terminal colours | `BasicColor()` | User code, `DefaultJumpStyle` | |
| 135 | `Color.Equal()` | 130 | method `func(other Color) bool` | Value equality check | — | — | Uses `==` on struct |

### Style

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 136 | `Style` | 135 | `struct` | Combines FG, BG, Fill colors, Attribute bitmask, TextTransform, Align, and margin | `Color`, `Attribute`, `TextTransform`, `Align` | `Cell`, `Screen.writeStyle()`, everything | FG = text foreground, BG = text background, Fill = container fill. margin is unexported [4]int16 |
| 137 | `DefaultStyle()` | 146 | `func() Style` | Returns style with default colours and no attributes | `DefaultColor()` | `EmptyCell()`, `Screen` (lastStyle init) | |
| 138 | `Style.Foreground()` | 154 | method | Returns new style with given FG color | — | User code | Immutable pattern (returns copy) |
| 139 | `Style.Background()` | 160 | method | Returns new style with given BG color | — | User code | |
| 140 | `Style.FillColor()` | 166 | method | Returns new style with given Fill color (for containers) | — | User code | |
| 141 | `Style.Bold()` | 172 | method | Returns style with bold enabled | `Attribute.With()` | User code | |
| 142 | `Style.Dim()` | 178 | method | Returns style with dim enabled | `Attribute.With()` | User code | |
| 143 | `Style.Italic()` | 183 | method | Returns style with italic enabled | `Attribute.With()` | User code | |
| 144 | `Style.Underline()` | 189 | method | Returns style with underline enabled | `Attribute.With()` | User code | |
| 145 | `Style.Inverse()` | 195 | method | Returns style with inverse enabled | `Attribute.With()` | User code | |
| 146 | `Style.Strikethrough()` | 201 | method | Returns style with strikethrough enabled | `Attribute.With()` | User code | |
| 147 | `Style.Uppercase()` | 208 | method | Returns style with uppercase transform | — | User code | |
| 148 | `Style.Lowercase()` | 213 | method | Returns style with lowercase transform | — | User code | |
| 149 | `Style.Capitalize()` | 220 | method | Returns style with capitalize transform | — | User code | |
| 150 | `Style.Margin()` | 225 | method | Sets uniform margin on all 4 sides | — | User code | |
| 151 | `Style.MarginVH()` | 226 | method | Sets vertical and horizontal margin | — | User code | |
| 152 | `Style.MarginTRBL()` | 227 | method | Sets individual margins (top, right, bottom, left) | — | User code | |
| 153 | `Style.Equal()` | 230 | method `func(other Style) bool` | Value equality via `==` on struct | — | `Screen.writeCell()` | Design: relies on Go struct comparison; works because all fields are value types |

### Cell

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 154 | `Cell` | 235 | `struct` | Single character cell: Rune + Style | `Style` | `Buffer`, `Screen.Flush()` | The fundamental unit of the rendering pipeline |
| 155 | `EmptyCell()` | 241 | `func() Cell` | Returns cell with space rune and default style | `DefaultStyle()` | `Buffer.Clear()`, `Region.Clear()`, etc. | |
| 156 | `NewCell()` | 246 | `func(r rune, style Style) Cell` | Creates cell with given rune and style | `Style` | `Buffer.WriteString()`, `Buffer.DrawBorder()`, etc. | |
| 157 | `Cell.Equal()` | 251 | method `func(other Cell) bool` | Value equality via `==` | — | `Screen.Flush()` (diff comparison) | |

### Flex (Layout)

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 158 | `Flex` | 258 | `struct` (exported) | Layout properties for display components: PercentWidth, Width, Height, FlexGrow | — | `TextNode`, `ProgressNode`, `LayerViewNode`, `RichTextNode` | Embedded in component types |
| 159 | `flex` | 505 | `struct` (unexported) | Internal layout properties: percentWidth, width, height, flexGrow, fitContent | — | `HBoxNode`, `VBoxNode`, `SpacerNode` | Unexported; set via chainable methods. Has `fitContent` field not in exported `Flex` |

### Component Node Types (Declarative View Tree)

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 160 | `TextNode` | 266 | `struct` | Text display; Content can be string or *string for pointer binding | `Flex`, `Style` | Template builder | |
| 161 | `LeaderNode` | 274 | `struct` | "Label.....Value" with dots filling space; Label/Value can be string or *string | `Style` | Template builder | |
| 162 | `Align` | 283 | `type uint8` | Text alignment enum | — | `Style`, `TableColumn` | |
| 163 | `AlignLeft` | 286 | const | Left-aligned (default) | — | — | |
| 164 | `AlignRight` | 287 | const | Right-aligned | — | — | |
| 165 | `AlignCenter` | 288 | const | Center-aligned | — | — | |
| 166 | `TableColumn` | 292 | `struct` | Column definition: Header, Width, Align | `Align` | `Table` | |
| 167 | `Table` | 300 | `struct` | Tabular data with columns, pointer-bound rows, header/row/alt styles | `TableColumn`, `Style` | Template builder | |
| 168 | `SparklineNode` | 312 | `struct` | Mini chart using Unicode block chars; Values can be []float64 or *[]float64 | `Style` | Template builder | |
| 169 | `HRuleNode` | 322 | `struct` | Horizontal line filling available width; default char '─' | `Style` | Template builder | |
| 170 | `VRuleNode` | 329 | `struct` | Vertical line filling available height; default char '│' | `Style` | Template builder | |
| 171 | `SpacerNode` | 344 | `struct` | Empty space; grows to fill if no dimensions set; has Char for dotted leaders | `flex`, `Style` | Template builder | Implicit Grow(1) when no Width/Height |
| 172 | `SpacerNode.Grow()` | 353 | method | Sets flex grow factor | — | User code | |
| 173 | `SpacerNode.FG()` | 356 | method | Sets foreground color for fill character | — | User code | |
| 174 | `SpinnerNode` | 361 | `struct` | Animated loading indicator; Frame pointer controls animation frame | `Style` | Template builder | |
| 175 | `SpinnerBraille` | 368 | `var []string` | Default braille spinner frames | — | `SpinnerNode` | |
| 176 | `SpinnerDots` | 371 | `var []string` | Dot spinner frames | — | User code | |
| 177 | `SpinnerLine` | 374 | `var []string` | Line spinner frames | — | User code | |
| 178 | `SpinnerCircle` | 377 | `var []string` | Circle spinner frames | — | User code | |
| 179 | `ScrollbarNode` | 381 | `struct` | Visual scroll indicator; vertical by default; Position is *int pointer | `Style` | Template builder | |
| 180 | `TabsStyle` | 394 | `type uint8` | Visual style enum for tab headers | — | `TabsNode` | |
| 181 | `TabsStyleUnderline` | 397 | const | Active tab with underline | — | — | |
| 182 | `TabsStyleBox` | 398 | const | Tabs in boxes | — | — | |
| 183 | `TabsStyleBracket` | 399 | const | Tabs with [ ] brackets | — | — | |
| 184 | `TabsNode` | 403 | `struct` | Row of tab headers with active indicator; Selected is *int pointer | `TabsStyle`, `Style` | Template builder | |
| 185 | `TreeNode` | 413 | `struct` | Node in a tree: Label, Children, Expanded, Data | — | `TreeView` | |
| 186 | `TreeView` | 421 | `struct` | Hierarchical tree display with expand/collapse chars and connecting lines | `TreeNode`, `Style` | Template builder | |
| 187 | `Custom` | 436 | `struct` | User-defined component with Measure and Render callbacks | `Buffer` | Template builder | Note in comment: function call overhead, but viewport culling makes it negligible |
| 188 | `JumpNode` | 449 | `struct` | Wraps a component to make it a jump target; OnSelect called when label selected | `Style` | Template builder | |
| 189 | `ProgressNode` | 456 | `struct` | Progress bar; Value can be int or *int (0-100); BarWidth is separate from Flex.Width | `Flex` | Template builder | |
| 190 | `LayerViewNode` | 464 | `struct` | Displays a scrollable Layer; ViewHeight/ViewWidth distinct from Flex.Height/Width | `Flex`, `Layer` | Template builder | |
| 191 | `LayerViewNode.Grow()` | 472 | method | Sets flex grow factor | — | User code | |

### Container Nodes

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 192 | `HBoxNode` | 475 | `struct` | Horizontal layout container; has Children, Title, Gap, CascadeStyle, border, margin | `flex`, `BorderStyle`, `Color`, `Style` | Template builder | CascadeStyle is *Style (pointer for dynamic themes) |
| 193 | `VBoxNode` | 489 | `struct` | Vertical layout container; same fields as HBoxNode | `flex`, `BorderStyle`, `Color`, `Style` | Template builder | |
| 194 | `HBoxNode.WidthPct()` | 516 | method | Sets width as percentage of parent | — | User code | |
| 195 | `HBoxNode.Width()` | 519 | method | Sets explicit width in characters | — | User code | |
| 196 | `HBoxNode.Height()` | 522 | method | Sets explicit height in lines | — | User code | |
| 197 | `HBoxNode.Grow()` | 525 | method | Sets flex grow factor | — | User code | |
| 198 | `HBoxNode.Border()` | 528 | method | Sets border style | `BorderStyle` | User code | |
| 199 | `HBoxNode.BorderFG()` | 531 | method | Sets border foreground color | `Color` | User code | Stores as pointer |
| 200 | `HBoxNode.BorderBG()` | 534 | method | Sets border background color | `Color` | User code | |
| 201 | `HBoxNode.Margin()` | 537 | method | Sets uniform margin | — | User code | |
| 202 | `HBoxNode.MarginVH()` | 543 | method | Sets vertical/horizontal margin | — | User code | |
| 203 | `HBoxNode.MarginTRBL()` | 549 | method | Sets individual margins | — | User code | |
| 204 | `VBoxNode.WidthPct()` | 557 | method | Same as HBoxNode equivalent | — | User code | |
| 205 | `VBoxNode.Width()` | 560 | method | Same as HBoxNode equivalent | — | User code | |
| 206 | `VBoxNode.Height()` | 563 | method | Same as HBoxNode equivalent | — | User code | |
| 207 | `VBoxNode.Grow()` | 566 | method | Same as HBoxNode equivalent | — | User code | |
| 208 | `VBoxNode.Border()` | 569 | method | Same as HBoxNode equivalent | — | User code | |
| 209 | `VBoxNode.BorderFG()` | 572 | method | Same as HBoxNode equivalent | — | User code | |
| 210 | `VBoxNode.BorderBG()` | 575 | method | Same as HBoxNode equivalent | — | User code | |
| 211 | `VBoxNode.Margin()` | 578 | method | Same as HBoxNode equivalent | — | User code | |
| 212 | `VBoxNode.MarginVH()` | 584 | method | Same as HBoxNode equivalent | — | User code | |
| 213 | `VBoxNode.MarginTRBL()` | 590 | method | Same as HBoxNode equivalent | — | User code | |

### Conditional & Iteration Nodes

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 214 | `IfNode` | 596 | `struct` | Conditional render; Cond is *bool, Then is the view | — | Template builder | |
| 215 | `ElseNode` | 602 | `struct` | Renders when preceding If was false | — | Template builder | |
| 216 | `Else()` | 607 | `func(then any) ElseNode` | Constructor for ElseNode | — | User code | |
| 217 | `ForEachNode` | 613 | `struct` | Iterates over a slice; Items is *[]T, Render is func(*T) any | — | Template builder | |

### SelectionList

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 218 | `SelectionList` | 618 | `struct` | List with selection marker; Items *[]T, Selected *int, optional Render func, windowing via MaxVisible | `Style` | Template builder | Has internal offset tracking for scrolling |
| 219 | `SelectionList.ensureVisible()` | 636 | unexported method | Adjusts scroll offset so selected item is in visible window | — | `Up()`, `Down()`, `PageUp()`, `PageDown()`, `First()`, `Last()` | |
| 220 | `SelectionList.Up()` | 652 | method `func(m any)` | Moves selection up by one | — | User code via Handle | Safe to use directly with app.Handle |
| 221 | `SelectionList.Down()` | 660 | method `func(m any)` | Moves selection down by one | — | User code via Handle | |
| 222 | `SelectionList.PageUp()` | 668 | method `func(m any)` | Moves selection up by page size | — | User code | |
| 223 | `SelectionList.PageDown()` | 683 | method `func(m any)` | Moves selection down by page size | — | User code | |
| 224 | `SelectionList.First()` | 698 | method `func(m any)` | Moves selection to first item | — | User code | |
| 225 | `SelectionList.Last()` | 706 | method `func(m any)` | Moves selection to last item | — | User code | |

### RichText & Span

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 226 | `Span` | 714 | `struct` | Styled text segment: Text + Style | `Style` | `RichTextNode`, `Buffer.WriteSpans()`, `Layer.SetLine()` | |
| 227 | `RichTextNode` | 720 | `struct` | Mixed inline styles; Spans can be []Span or *[]Span | `Flex`, `Span` | Template builder | |
| 228 | `Rich()` | 732 | `func(parts ...any) RichTextNode` | Creates RichText from mix of strings and Spans | `Span` | User code | |
| 229 | `Styled()` | 746 | `func(text string, style Style) Span` | Creates a span with given style | — | User code | |
| 230 | `Bold()` | 751 | `func(text string) Span` | Creates bold span | — | User code, `Rich()` | |
| 231 | `Dim()` | 756 | `func(text string) Span` | Creates dim span | — | User code | |
| 232 | `Italic()` | 761 | `func(text string) Span` | Creates italic span | — | User code | |
| 233 | `Underline()` (func) | 766 | `func(text string) Span` | Creates underlined span | — | User code | Not to be confused with Style.Underline() |
| 234 | `Inverse()` (func) | 771 | `func(text string) Span` | Creates inverse span | — | User code | |
| 235 | `FG()` | 776 | `func(text string, color Color) Span` | Creates span with foreground color | `Color` | User code | |
| 236 | `BG()` | 781 | `func(text string, color Color) Span` | Creates span with background color | `Color` | User code | |

### Input Types

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 237 | `InputState` | 787 | `struct` | Bundles Value (string) + Cursor (int) for text input field | — | `TextInput`, `App.BindField()` | |
| 238 | `InputState.Clear()` | 793 | method | Resets value and cursor to zero | — | User code | |
| 239 | `FocusGroup` | 800 | `struct` | Tracks which field in a group is focused; Current int | — | `TextInput` | |
| 240 | `TextInput` | 816 | `struct` | Single-line text input; supports Field-based API (InputState+FocusGroup) or pointer-based API (Value/Cursor/Focused); has Placeholder, Width, Mask, styles | `InputState`, `FocusGroup`, `Style` | Template builder | Two API paths: Field-based (recommended for forms) and pointer-based (single fields) |
| 241 | `OverlayNode` | 841 | `struct` | Floating content above main view; Centered, X/Y, Width/Height, Backdrop, BackdropFG, BG, Child | `Color` | Template builder | |

### Unsafe Helpers

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 242 | `sliceHeader` | 854 | unexported `struct` | Runtime representation of a slice (Data, Len, Cap); for zero-allocation slice iteration | `unsafe.Pointer` | Template execution (likely) | |
| 243 | `isWithinRange()` | 862 | unexported `func` | Checks if a pointer falls within a memory range; for determining if ptr is inside a struct for offset calculation | `unsafe.Pointer` | Template builder (pointer binding resolution) | |

---

## FILE: `screen.go` (737 lines)

### Type: `Screen` (line 17)

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 244 | `Screen` | 17 | `struct` | Terminal display manager with double buffering, diff-based updates, raw mode, signal handling | `Buffer`, `io.Writer`, `unix.Termios`, `Size`, `Style` | `App` | Core rendering target |
| 245 | `Screen.front` | 18 | field `*Buffer` | What's currently displayed on terminal (for diffing) | `Buffer` | `Flush()`, `FlushFull()`, `FlushInline()`, `handleSignals()` | |
| 246 | `Screen.back` | 19 | field `*Buffer` | What we're drawing to (current frame) | `Buffer` | `Flush()`, `FlushFull()`, `FlushInline()`, `Buffer()`, `Clear()`, `handleSignals()` | |
| 247 | `Screen.writer` | 20 | field `io.Writer` | Output destination (usually os.Stdout) | `io.Writer` | All write methods | |
| 248 | `Screen.fd` | 21 | field `int` | File descriptor for terminal ioctls | — | `EnterRawMode()`, `ExitRawMode()`, `EnterInlineMode()`, `ExitInlineMode()`, `handleSignals()` | |
| 249 | `Screen.width` | 23 | field `int` | Current terminal width | — | `Size()`, `Flush()`, `handleSignals()` | |
| 250 | `Screen.height` | 24 | field `int` | Current terminal height | — | `Size()`, `Flush()`, `handleSignals()` | |
| 251 | `Screen.origTermios` | 27 | field `*unix.Termios` | Saved terminal settings for restoration on exit | `unix.Termios` | `EnterRawMode()`, `ExitRawMode()`, `EnterInlineMode()`, `ExitInlineMode()` | |
| 252 | `Screen.inRawMode` | 28 | field `bool` | Whether terminal is currently in raw mode | — | All Enter/Exit methods | |
| 253 | `Screen.inlineMode` | 29 | field `bool` | Whether in inline mode (no alternate buffer) | — | `EnterInlineMode()`, `ExitInlineMode()`, `IsInlineMode()` | |
| 254 | `Screen.resizeChan` | 32 | field `chan Size` | Channel receiving size updates on SIGWINCH | `Size` | `handleSignals()`, `ResizeChan()` | |
| 255 | `Screen.sigChan` | 33 | field `chan os.Signal` | OS signal channel | — | `EnterRawMode()`, `ExitRawMode()`, `handleSignals()` | |
| 256 | `Screen.lastStyle` | 36 | field `Style` | Last emitted style (for optimization — skip redundant style changes) | `Style` | `writeCell()`, `Flush()`, `FlushFull()`, `FlushInline()` | |
| 257 | `Screen.buf` | 37 | field `bytes.Buffer` | Reusable buffer for building ANSI output (avoids allocation per frame) | — | `Flush()`, `FlushFull()`, `FlushInline()`, `BufferCursor()`, `BufferCursorColor()`, `FlushBuffer()` | Design: single bytes.Buffer reused across frames |
| 258 | `Screen.mu` | 40 | field `sync.Mutex` | Protects buffer access during resize | — | `Flush()`, `FlushFull()`, `FlushInline()`, `handleSignals()` | |

### Size

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 259 | `Size` | 44 | `struct` | Width + Height dimensions | — | `Screen`, `App`, `handleResize()` | |

### Screen Constructor & Terminal Size

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 260 | `NewScreen()` | 51 | `func(w io.Writer) (*Screen, error)` | Creates screen; defaults to os.Stdout; queries terminal size (fallback 80x24); creates front + back buffers | `getTerminalSize()`, `NewBuffer()`, `DefaultStyle()` | `NewApp()` | |
| 261 | `getTerminalSize()` | 79 | unexported `func(fd int) (int, int, error)` | Returns terminal dimensions via `unix.IoctlGetWinsize` / `TIOCGWINSZ` | `unix.IoctlGetWinsize` | `NewScreen()`, `handleSignals()` | |

### Screen Accessors

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 262 | `Screen.Size()` | 88 | method `func() Size` | Returns current dimensions | — | `App.Size()`, `App.SetView()` | |
| 263 | `Screen.Width()` | 93 | method `func() int` | Returns screen width | — | — | |
| 264 | `Screen.Height()` | 98 | method `func() int` | Returns screen height | — | — | |
| 265 | `Screen.Buffer()` | 103 | method `func() *Buffer` | Returns back buffer for drawing | — | `App.copyToScreen()` | |
| 266 | `Screen.ResizeChan()` | 108 | method `func() <-chan Size` | Returns read-only channel for resize events | — | `App.handleResize()` | |

### Terminal Mode Management

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 267 | `Screen.EnterRawMode()` | 112 | method `func() error` | Saves termios, configures raw mode (no echo, no canonical, no signals, no flow control, 8-bit, VMIN=1 VTIME=0), starts SIGWINCH handler, enters alternate screen, clears, hides cursor, enables bracketed paste | `ioctlGetTermios`, `ioctlSetTermios`, `unix.Termios`, `signal.Notify`, `handleSignals()` | `App.run()` | Escape sequences: 1049h (alt screen), 2J (clear), H (home), ?25l (hide cursor), ?2004h (bracketed paste) |
| 268 | `Screen.ExitRawMode()` | 158 | method `func() error` | Disables bracketed paste, shows cursor, exits alternate screen, stops signal listener, restores original termios | `ioctlSetTermios` | `App.run()` (deferred) | Escape sequences: ?2004l, ?25h, ?1049l |
| 269 | `Screen.EnterInlineMode()` | 183 | method `func() error` | Same raw mode setup as EnterRawMode but NO alternate screen switch; keeps cursor visible | `ioctlGetTermios`, `ioctlSetTermios`, `signal.Notify`, `handleSignals()` | `App.run()`, `App.RunNonInteractive()` | |
| 270 | `Screen.ExitInlineMode()` | 227 | method `func(linesUsed int, clear bool) error` | If clear: clears rendered lines via per-line clear+move sequence. If not clear: moves cursor below content. Resets style, stops signals, restores termios | `ioctlSetTermios` | `App.run()` (deferred), `App.RunNonInteractive()` | Uses batched writes for all clear commands |
| 271 | `Screen.IsInlineMode()` | 277 | method `func() bool` | Returns true if in inline mode | — | — | |

### Signal Handling

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 272 | `Screen.handleSignals()` | 282 | unexported method | Goroutine reading SIGWINCH signals; on resize: lock mutex, update width/height, resize both front and back buffers, clear both, clear terminal screen, unlock, non-blocking send to resizeChan | `getTerminalSize()`, `Buffer.Resize()`, `Buffer.Clear()` | `EnterRawMode()`, `EnterInlineMode()` | Non-blocking send outside lock to avoid deadlock. Design: clears both buffers after resize to avoid stale content |

### Flush Pipeline

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 273 | `FlushStats` | 310 | `struct` | Holds DirtyRows and ChangedRows from last flush | — | `GetFlushStats()` | |
| 274 | `lastFlushStats` | 316 | `var FlushStats` | Package-level stats from most recent flush | — | `GetFlushStats()` | |
| 275 | `GetFlushStats()` | 319 | `func() FlushStats` | Returns stats from last flush | — | User code | |
| 276 | `debugFlush` | 324 | `var bool` | Flush debug flag from TUI_DEBUG_FLUSH env var | — | `Flush()` | |
| 277 | `Screen.Flush()` | 329 | method `func()` | **DIFF-BASED FLUSH.** Lock mutex, reset buf, iterate rows (skip non-dirty via RowDirty), compare each back cell to front cell, skip unchanged cells, skip placeholder cells (rune==0 for double-width CJK), position cursor with `\x1b[row;colH` when needed, write cell via writeCell, track cursor X advance considering rune display width (fast path for ASCII < 0x1100), copy changed cells to front buffer, reset style, clear dirty flags | `Buffer.RowDirty()`, `writeCell()`, `runewidth.RuneWidth()`, `writeIntToBuf()`, `Buffer.ClearDirtyFlags()` | `App.render()` | Design: builds to internal buf but does NOT write — FlushBuffer() writes. This allows batching cursor ops. CJK double-width handling: checks rune >= 0x1100 before calling RuneWidth for fast ASCII path |
| 278 | `Screen.writeIntToBuf()` | 420 | unexported method | Writes integer to internal buffer without allocation using stack-allocated scratch array | — | `Flush()`, `writeColor()`, `BufferCursor()` | Max 10 digits |
| 279 | `Screen.FlushFull()` | 442 | method `func()` | Full redraw without diffing; clears screen, writes every cell, copies to front buffer | `writeCell()` | `App.render()` (when DebugFullRedraw) | For debugging rendering issues |
| 280 | `Screen.FlushInline()` | 472 | method `func(height int) int` | Inline mode flush; renders at cursor position, clears each line with `\r\x1b[K`, writes cells stopping at first empty cell (rune==0), moves cursor back to first line of content | `writeCell()` | `App.render()` (inline mode) | Returns linesRendered for cleanup tracking |
| 281 | `Screen.writeCell()` | 515 | unexported method | Writes cell's style (if changed from lastStyle) and rune to buffer | `Style.Equal()`, `writeStyle()` | `Flush()`, `FlushFull()`, `FlushInline()` | Optimization: only emits style changes when style differs from last |
| 282 | `Screen.writeStyle()` | 525 | unexported method | Writes ANSI escape codes for a complete style (reset + attributes + FG + BG) | `Attribute.Has()`, `writeColor()` | `writeCell()` | Always starts with \x1b[0 (reset), then adds attributes as semicolon-separated SGR parameters |
| 283 | `Screen.writeColor()` | 562 | unexported method | Writes ANSI color code for a Color (allocation-free); handles Default/16/256/RGB modes | `writeIntToBuf()` | `writeStyle()` | Allocation-free via writeIntToBuf |
| 284 | `Screen.writeString()` | 610 | unexported method | Helper to write string directly to terminal writer | `io.WriteString` | `EnterRawMode()`, `ExitRawMode()`, `EnterInlineMode()`, `ExitInlineMode()`, `handleSignals()` | |

### Screen Drawing Helpers

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 285 | `Screen.Clear()` | 615 | method `func()` | Clears the back buffer | `Buffer.Clear()` | — | |
| 286 | `Screen.ShowCursor()` | 620 | method `func()` | Shows terminal cursor via `\x1b[?25h` | — | — | |
| 287 | `Screen.HideCursor()` | 625 | method `func()` | Hides terminal cursor via `\x1b[?25l` | — | — | |
| 288 | `Screen.MoveCursor()` | 630 | method `func(x, y int)` | Moves cursor via `\x1b[row;colH` (allocation-free) | `appendInt()` | — | Uses stack-allocated scratch buffer |

### Cursor Buffering

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 289 | `Screen.BufferCursor()` | 644 | method `func(x, y int, visible bool, shape CursorShape)` | Writes cursor shape, position, and visibility to internal buffer for batching with content in one syscall | `writeIntToBuf()`, `CursorShape` | `App.render()` | Design: batched with content write for single-syscall output |
| 290 | `Screen.BufferCursorColor()` | 667 | method `func(c Color)` | Writes OSC 12 cursor color escape to internal buffer | `hexDigit()`, `Color` | `App.render()` | Format: `\x1b]12;#RRGGBB\x07` |
| 291 | `hexDigit()` | 680 | unexported `func(n uint8) byte` | Converts 0-15 to hex ASCII char | — | `BufferCursorColor()` | |
| 292 | `Screen.FlushBuffer()` | 688 | method `func()` | Writes accumulated internal buffer to terminal in one syscall | `Screen.writer` | `App.render()` | **THE FINAL WRITE.** Single syscall for content + cursor |

### CursorShape

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 293 | `CursorShape` | 695 | `type int` | Terminal cursor shape enum | — | `App`, `Cursor`, `Screen.BufferCursor()`, `Screen.SetCursorShape()` | |
| 294 | `CursorDefault` | 698 | `const CursorShape = 0` | Terminal default cursor | — | — | |
| 295 | `CursorBlockBlink` | 699 | `const CursorShape = 1` | Blinking block | — | — | |
| 296 | `CursorBlock` | 700 | `const CursorShape = 2` | Steady block | — | `DefaultCursor()` | |
| 297 | `CursorUnderlineBlink` | 701 | `const CursorShape = 3` | Blinking underline | — | — | |
| 298 | `CursorUnderline` | 702 | `const CursorShape = 4` | Steady underline | — | — | |
| 299 | `CursorBarBlink` | 703 | `const CursorShape = 5` | Blinking bar | — | — | |
| 300 | `CursorBar` | 704 | `const CursorShape = 6` | Steady bar | — | — | |
| 301 | `Screen.SetCursorShape()` | 708 | method `func(shape CursorShape)` | Changes cursor shape via `\x1b[N q` (allocation-free) | `appendInt()` | — | |

### Utility

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 302 | `appendInt()` | 719 | unexported `func(b []byte, n int) []byte` | Appends integer to byte slice without allocation | — | `MoveCursor()`, `SetCursorShape()` | Stack-allocated scratch buffer |

---

## FILE: `display.go` (125 lines)

Display helpers for common UI string patterns.

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 303 | `LeaderStr()` | 10 | `func(label, value string, width int) string` | Creates dot-leader string "LABEL...VALUE" | `strings.Repeat()` | User code | Deprecated: Use Leader component instead |
| 304 | `LeaderDash()` | 19 | `func(label, value string, width int) string` | Creates dash-leader string "LABEL---VALUE" | `strings.Repeat()` | User code | |
| 305 | `LED()` | 28 | `func(on bool) string` | Returns single LED indicator: ● (on) or ○ (off) | — | User code | |
| 306 | `LEDs()` | 36 | `func(states ...bool) string` | Returns multiple LED indicators: ●●○○ | — | `LEDsBracket()` | |
| 307 | `LEDsBracket()` | 49 | `func(states ...bool) string` | Returns bracketed LED indicators: [●●○○] | `LEDs()` | User code | |
| 308 | `Bar()` | 54 | `func(filled, total int) string` | Returns segmented bar: ▮▮▮▯▯ | — | `BarBracket()` | |
| 309 | `BarBracket()` | 67 | `func(filled, total int) string` | Returns bracketed bar: [▮▮▮▯▯] | `Bar()` | User code | |
| 310 | `Meter()` | 72 | `func(value, max, width int) string` | Returns analog-style meter: ├──●──────┤ | — | User code | |
| 311 | `Buffer.DrawPanel()` | 103 | method `func(x, y, w, h int, title string, style Style) *Region` | Draws bordered panel with title and returns interior Region | `Buffer.DrawBorder()`, `Buffer.WriteString()`, `Buffer.Region()` | User code | Title appears in top border |
| 312 | `Buffer.DrawPanelEx()` | 115 | method `func(x, y, w, h int, title string, border BorderStyle, style Style) *Region` | Draws panel with custom border style | `Buffer.DrawBorder()`, `Buffer.WriteString()`, `Buffer.Region()` | User code | |

---

## FILE: `buffer.go` (1140 lines)

### Type: `Buffer` (line 11)

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 313 | `Buffer` | 11 | `struct` | 2D grid of Cells representing a drawable surface; has dirty tracking (row-level + allDirty flag + dirtyMaxY) | `Cell` | `Screen`, `BufferPool`, `Layer`, `Region`, `Template.Execute()` | Core rendering primitive |
| 314 | `Buffer.cells` | 12 | field `[]Cell` | Flat array of cells (row-major: y*width+x) | `Cell` | All buffer methods | |
| 315 | `Buffer.width` | 13 | field `int` | Buffer width | — | — | |
| 316 | `Buffer.height` | 14 | field `int` | Buffer height | — | — | |
| 317 | `Buffer.dirtyMaxY` | 15 | field `int` | Highest row written to since last clear; enables partial clear optimization | — | `ClearDirty()`, `ResetDirtyMax()` | Design: only clears rows 0..dirtyMaxY instead of full buffer |
| 318 | `Buffer.dirtyRows` | 18 | field `[]bool` | Per-row dirty flag for efficient flush | — | `Set()`, `SetFast()`, all write methods, `RowDirty()`, `ClearDirtyFlags()` | |
| 319 | `Buffer.allDirty` | 19 | field `bool` | True after Clear()/Resize(); means all rows need checking | — | `RowDirty()`, `ClearDirtyFlags()`, `Clear()`, `CopyFrom()` | |
| 320 | `emptyBufferCache` | 23 | `var []Cell` | Pre-filled buffer of empty cells for fast clearing via copy() (memmove) | `EmptyCell()` | `Buffer.Clear()`, `Buffer.ClearDirty()` | Design: grows on demand, one-time cost. Uses copy() which compiles to memmove — much faster than scalar loop |

### Buffer Constructor & Accessors

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 321 | `NewBuffer()` | 26 | `func(width, height int) *Buffer` | Creates buffer filled with empty cells; new buffer has allDirty=true | `EmptyCell()` | `NewScreen()`, `NewBufferPool()`, `Layer` | |
| 322 | `Buffer.Width()` | 42 | method `func() int` | Returns buffer width | — | — | |
| 323 | `Buffer.Height()` | 47 | method `func() int` | Returns buffer height | — | — | |
| 324 | `Buffer.Size()` | 52 | method `func() (int, int)` | Returns width, height | — | — | |
| 325 | `Buffer.InBounds()` | 57 | method `func(x, y int) bool` | Checks if coordinates are within buffer | — | `Get()`, `Set()`, `WriteString()`, etc. | |
| 326 | `Buffer.index()` | 62 | unexported method `func(x, y int) int` | Converts x,y to flat array index (y*width+x) | — | `Get()`, `Set()`, `SetRune()`, `SetStyle()` | |

### Cell Access

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 327 | `Buffer.Get()` | 68 | method `func(x, y int) Cell` | Returns cell at coordinates; empty cell if out of bounds | `InBounds()`, `index()` | `Screen.Flush()`, `Region.Get()`, display methods | |
| 328 | `Buffer.Set()` | 78 | method `func(x, y int, c Cell)` | Sets cell with border merging; updates dirtyMaxY and dirtyRows | `InBounds()`, `index()`, `mergeBorders()` | `WriteString()`, `DrawBorder()`, `FillRect()` (border path), `Region.Set()` | Design: automatically merges border characters when overwriting |
| 329 | `Buffer.SetFast()` | 101 | method `func(x, y int, c Cell)` | Sets cell WITHOUT border merging; direct slice write for speed | — | `WriteStringFast()`, template execution | Design: bypasses border merge for known non-border content (text, progress bars) |

### Specialized Write Methods

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 330 | `partialBlocks` | 113 | `var [9]rune` | Partial block characters ▏▎▍▌▋▊▉█ for sub-character precision | — | `WriteProgressBar()` | |
| 331 | `Buffer.WriteProgressBar()` | 119 | method `func(x, y, width int, ratio float32, style Style)` | Writes progress bar with sub-character precision using partial blocks; dark gray background for empty areas | — | Template execution (ProgressNode) | Direct slice access, no bounds check per cell, no border merge. Design: calculates in eighths for smooth precision |
| 332 | `Buffer.WriteStringFast()` | 172 | method `func(x, y int, s string, style Style, maxWidth int)` | Writes string without border merging; direct slice access for max speed | — | Template execution, `Layer.SetLineString()` | |
| 333 | `Buffer.WriteSpans()` | 198 | method `func(x, y int, spans []Span, maxWidth int)` | Writes multiple styled text spans; handles double-width CJK (fills second cell with placeholder rune=0) | `runewidth.RuneWidth()`, `Span` | Template execution (RichText), `Layer.SetLine()`, `Layer.SetLineAt()` | |
| 334 | `Buffer.WriteLeader()` | 233 | method `func(x, y int, label, value string, width int, fill rune, style Style)` | Writes "Label.....Value" format with fill chars | — | Template execution (LeaderNode) | |
| 335 | `Buffer.WriteSparkline()` | 292 | method `func(x, y int, values []float64, width int, min, max float64, style Style)` | Writes sparkline chart using ▁▂▃▄▅▆▇█; auto-detects min/max if zero | `sparklineChars` | Template execution (SparklineNode) | |
| 336 | `sparklineChars` | 289 | `var []rune` | Unicode block chars for sparkline mapping | — | `WriteSparkline()` | |

### Cell Manipulation

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 337 | `Buffer.SetRune()` | 349 | method | Sets just the rune, preserving style | `InBounds()`, `index()` | — | |
| 338 | `Buffer.SetStyle()` | 358 | method | Sets just the style, preserving rune | `InBounds()`, `index()` | — | |

### Fill & Clear

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 339 | `Buffer.Fill()` | 367 | method `func(c Cell)` | Fills entire buffer with given cell | — | — | |
| 340 | `Buffer.Clear()` | 375 | method `func()` | Clears to empty cells using copy() from emptyBufferCache (memmove); sets allDirty=true, resets dirtyMaxY=0 | `emptyBufferCache`, `EmptyCell()` | `Screen.handleSignals()`, `Region.Clear()`, `Layer.Clear()` | Design: grows cache on demand; copy() uses optimized memmove |
| 341 | `Buffer.RowDirty()` | 399 | method `func(y int) bool` | Returns true if row modified since last ClearDirtyFlags; allDirty overrides | — | `Screen.Flush()` | |
| 342 | `Buffer.ClearDirtyFlags()` | 411 | method `func()` | Resets all dirty tracking; call after flush | — | `Screen.Flush()`, `Screen.FlushInline()` | |
| 343 | `Buffer.MarkAllDirty()` | 420 | method `func()` | Forces all rows dirty | — | User code / testing | |
| 344 | `Buffer.ResetDirtyMax()` | 426 | method `func()` | Resets dirtyMaxY without clearing content; use when template overwrites all cells | — | — | |
| 345 | `Buffer.ClearDirty()` | 432 | method `func()` | Clears only rows 0..dirtyMaxY; much faster when content doesn't fill buffer | `emptyBufferCache`, `copy()` | `BufferPool.Swap()` | Design: partial clear optimization — only clear what was actually written |
| 346 | `Buffer.ClearLine()` | 462 | method `func(y int)` | Clears single line to empty cells | `EmptyCell()` | `Layer.SetLine()`, `Layer.SetLineString()` | |
| 347 | `Buffer.ClearLineWithStyle()` | 475 | method `func(y int, style Style)` | Clears single line with styled space cell | — | `Layer.SetLineAt()` | |

### Rect Fill

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 348 | `Buffer.FillRect()` | 490 | method `func(x, y, width, height int, c Cell)` | Fills rectangular region; fast path for non-border cells (direct slice write), slow path for border cells (via Set with merge) | `Set()` (border path) | Template execution | Design: checks if rune is in box drawing range (0x2500-0x257F) for fast rejection |

### String Write Methods

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 349 | `Buffer.WriteString()` | 521 | method `func(x, y int, s string, style Style) int` | Writes string with border merging; returns cells written | `Set()` | `DrawPanel()`, `DrawPanelEx()` | |
| 350 | `Buffer.WriteStringClipped()` | 536 | method `func(x, y int, s string, style Style, maxWidth int) int` | Writes string stopping at maxWidth | `Set()` | — | |
| 351 | `Buffer.WriteStringPadded()` | 551 | method `func(x, y int, s string, style Style, width int)` | Writes string and pads with spaces to fill width; allows skipping Clear() | `Set()` | — | Design: avoids Clear() when UI structure is stable |

### Line Drawing

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 352 | `Buffer.HLine()` | 571 | method `func(x, y, length int, r rune, style Style)` | Draws horizontal line | `Set()` | — | |
| 353 | `Buffer.VLine()` | 578 | method `func(x, y, length int, r rune, style Style)` | Draws vertical line | `Set()` | — | |

### Box Drawing Constants

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 354 | `BoxHorizontal` | 586 | `const rune = '─'` | Horizontal box char | — | `BorderSingle`, `BorderRounded` | |
| 355 | `BoxVertical` | 587 | `const rune = '│'` | Vertical box char | — | `BorderSingle`, `BorderRounded` | |
| 356 | `BoxTopLeft` | 588 | `const rune = '┌'` | Top-left corner | — | `BorderSingle` | |
| 357 | `BoxTopRight` | 589 | `const rune = '┐'` | Top-right corner | — | `BorderSingle` | |
| 358 | `BoxBottomLeft` | 590 | `const rune = '└'` | Bottom-left corner | — | `BorderSingle` | |
| 359 | `BoxBottomRight` | 591 | `const rune = '┘'` | Bottom-right corner | — | `BorderSingle` | |
| 360 | `BoxRoundedTopLeft` | 592 | `const rune = '╭'` | Rounded top-left | — | `BorderRounded` | |
| 361 | `BoxRoundedTopRight` | 593 | `const rune = '╮'` | Rounded top-right | — | `BorderRounded` | |
| 362 | `BoxRoundedBottomLeft` | 594 | `const rune = '╰'` | Rounded bottom-left | — | `BorderRounded` | |
| 363 | `BoxRoundedBottomRight` | 595 | `const rune = '╯'` | Rounded bottom-right | — | `BorderRounded` | |
| 364 | `BoxDoubleHorizontal` | 596 | `const rune = '═'` | Double horizontal | — | `BorderDouble` | |
| 365 | `BoxDoubleVertical` | 597 | `const rune = '║'` | Double vertical | — | `BorderDouble` | |
| 366 | `BoxDoubleTopLeft` | 598 | `const rune = '╔'` | Double top-left | — | `BorderDouble` | |
| 367 | `BoxDoubleTopRight` | 599 | `const rune = '╗'` | Double top-right | — | `BorderDouble` | |
| 368 | `BoxDoubleBottomLeft` | 600 | `const rune = '╚'` | Double bottom-left | — | `BorderDouble` | |
| 369 | `BoxDoubleBottomRight` | 601 | `const rune = '╝'` | Double bottom-right | — | `BorderDouble` | |
| 370 | `BoxTeeDown` | 607 | `const rune = '┬'` | Junction: ─ meets │ from below | — | `edgesToBorderArray` | |
| 371 | `BoxTeeUp` | 608 | `const rune = '┴'` | Junction: ─ meets │ from above | — | `edgesToBorderArray` | |
| 372 | `BoxTeeRight` | 609 | `const rune = '├'` | Junction: │ meets ─ from right | — | `edgesToBorderArray` | |
| 373 | `BoxTeeLeft` | 610 | `const rune = '┤'` | Junction: │ meets ─ from left | — | `edgesToBorderArray` | |
| 374 | `BoxCross` | 611 | `const rune = '┼'` | Junction: all four directions | — | `edgesToBorderArray` | |

### Border Merge System

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 375 | `boxDrawingMin` | 615 | `const = 0x2500` | Start of Unicode box drawing range | — | `mergeBorders()`, `FillRect()` | |
| 376 | `boxDrawingMax` | 616 | `const = 0x257F` | End of Unicode box drawing range | — | `mergeBorders()`, `FillRect()` | |
| 377 | `borderEdgesArray` | 622 | `var [128]uint8` | O(1) lookup for border edge bits (index=rune-boxDrawingMin); bits: 1=top, 2=right, 4=bottom, 8=left | — | `mergeBorders()` | Design: array lookup instead of map/switch for O(1) performance |
| 378 | `edgesToBorderArray` | 642 | `var [16]rune` | O(1) lookup from merged edge bits (0-15) to result border rune | — | `mergeBorders()` | |
| 379 | `mergeBorders()` | 658 | unexported `func(existing, new rune) (rune, bool)` | Combines two border characters into one via bitwise OR of edge flags; returns merged rune and true if both were borders | `borderEdgesArray`, `edgesToBorderArray`, `boxDrawingMin`, `boxDrawingMax` | `Buffer.Set()` | Design: fast rejection for non-border chars (99% of calls), then array lookup. Elegant bitmask approach |

### BorderStyle

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 380 | `BorderStyle` | 683 | `struct` | Defines characters for border drawing: Horizontal, Vertical, 4 corners | — | `Buffer.DrawBorder()`, `HBoxNode`, `VBoxNode` | |
| 381 | `BorderSingle` | 694 | `var BorderStyle` | Single-line border (┌─┐│└─┘) | Box constants | User code, template builder | |
| 382 | `BorderRounded` | 702 | `var BorderStyle` | Rounded border (╭─╮│╰─╯) | Box constants | User code | |
| 383 | `BorderDouble` | 710 | `var BorderStyle` | Double-line border (╔═╗║╚═╝) | Box constants | User code | |
| 384 | `Buffer.DrawBorder()` | 721 | method `func(x, y, width, height int, border BorderStyle, style Style)` | Draws complete border: corners + horizontal + vertical lines | `Set()`, `NewCell()` | `DrawPanel()`, `DrawPanelEx()`, `Region.DrawBorder()` | Min size 2x2 |

### Region (Buffer View)

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 385 | `Region` | 747 | `struct` | View into a rectangular region of a Buffer; shares underlying cells | `Buffer` | `DrawPanel()`, `DrawPanelEx()` | Design: zero-copy sub-buffer abstraction |
| 386 | `Buffer.Region()` | 755 | method `func(x, y, width, height int) *Region` | Creates a Region view | — | `DrawPanel()`, `DrawPanelEx()` | |
| 387 | `Region.Width()` | 766 | method | Returns region width | — | User code | |
| 388 | `Region.Height()` | 771 | method | Returns region height | — | User code | |
| 389 | `Region.Size()` | 776 | method | Returns width, height | — | User code | |
| 390 | `Region.InBounds()` | 781 | method | Checks region-relative coordinates | — | `Get()`, `Set()`, `WriteString()` | |
| 391 | `Region.Get()` | 786 | method | Gets cell at region-relative coords | `Buffer.Get()` | User code | |
| 392 | `Region.Set()` | 794 | method | Sets cell at region-relative coords | `Buffer.Set()` | `Fill()`, `Clear()`, `DrawBorder()`, `WriteString()` | |
| 393 | `Region.Fill()` | 802 | method | Fills region with given cell | `Set()` | `Clear()` | |
| 394 | `Region.Clear()` | 811 | method | Clears region to empty cells | `Fill()`, `EmptyCell()` | User code | |
| 395 | `Region.WriteString()` | 816 | method | Writes string at region-relative coords | `Set()`, `NewCell()` | User code | |
| 396 | `Region.DrawBorder()` | 830 | method | Draws border around entire region | `Set()`, `NewCell()` | User code | |

### Buffer Debug/Utility

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 397 | `Buffer.GetLine()` | 855 | method `func(y int) string` | Returns line content as trimmed string | `Get()` | Testing/debugging | |
| 398 | `Buffer.GetLineStyled()` | 879 | method `func(y int) string` | Returns line with embedded ANSI escape codes | `Get()`, `styleToANSI()` | Testing/debugging | |
| 399 | `Buffer.styleToANSI()` | 911 | unexported method | Converts Style to ANSI escape code string | `Attribute.Has()`, `colorToANSI()` | `GetLineStyled()` | |
| 400 | `Buffer.colorToANSI()` | 943 | unexported method | Converts Color to ANSI fragment string | — | `styleToANSI()` | |
| 401 | `Buffer.String()` | 975 | method `func() string` | Returns full buffer as string with newlines (preserves trailing spaces) | `Get()` | Testing | |
| 402 | `Buffer.StringTrimmed()` | 994 | method `func() string` | Returns buffer as string with trailing spaces removed per line and trailing empty lines removed | `Get()` | Testing | |

### Buffer Copy & Resize

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 403 | `Buffer.Blit()` | 1035 | method `func(src *Buffer, srcX, srcY, dstX, dstY, width, height int)` | Copies rectangular region from src to dst; clips to both buffer bounds; row-by-row copy() for speed | — | `Layer.blit()`, `Layer.EnsureSize()` | Design: optimized row-by-row copy() instead of per-cell |
| 404 | `Buffer.CopyFrom()` | 1094 | method `func(src *Buffer)` | Bulk copy all cells from src; requires identical dimensions; sets allDirty=true | — | `App.copyToScreen()` | Design: single copy() call for entire buffer |
| 405 | `Buffer.Resize()` | 1105 | method `func(width, height int)` | Resizes buffer; preserves existing content where it fits; creates new cell array; marks allDirty | `EmptyCell()` | `Screen.handleSignals()`, `BufferPool.Resize()` | |

---

## FILE: `bufferpool.go` (88 lines)

### Type: `BufferPool` (line 11)

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 406 | `BufferPool` | 11 | `struct` | Double-buffered rendering manager; two buffers alternated via atomic swap; dirty tracking via atomic bools | `Buffer`, `atomic.Uint32`, `atomic.Bool` | `App` | Design: lock-free alternation using atomics |
| 407 | `BufferPool.buffers` | 12 | field `[2]*Buffer` | The two buffers | `Buffer` | All BufferPool methods | |
| 408 | `BufferPool.current` | 13 | field `atomic.Uint32` | Index (0 or 1) of active buffer; atomic for lock-free reads | — | `Current()`, `Swap()` | |
| 409 | `BufferPool.dirty` | 14 | field `[2]atomic.Bool` | Tracks if each buffer needs clearing; atomic for cross-goroutine safety | — | `Swap()` | |

### BufferPool Methods

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 410 | `NewBufferPool()` | 18 | `func(width, height int) *BufferPool` | Creates double-buffered pool with two NewBuffer instances | `NewBuffer()` | `App.SetView()`, `App.View()` | |
| 411 | `BufferPool.Current()` | 28 | method `func() *Buffer` | Returns currently active buffer for rendering | `atomic.Uint32.Load()` | `App.render()`, `BufferPool.Run()` | |
| 412 | `BufferPool.Swap()` | 34 | method `func() *Buffer` | Marks old buffer dirty, clears next buffer if dirty (via ClearDirty), atomically swaps; returns new current | `atomic.Uint32.Store()`, `atomic.Bool`, `Buffer.ClearDirty()` | `App.render()`, `BufferPool.Run()` | Design: only clears if needed (skip if already clean). Uses ClearDirty (partial clear) not Clear (full clear) |
| 413 | `BufferPool.Stop()` | 52 | method `func()` | No-op kept for API compatibility | — | `App.run()` (deferred) | |
| 414 | `BufferPool.Width()` | 55 | method `func() int` | Returns buffer width (from buffer 0) | `Buffer.Width()` | — | |
| 415 | `BufferPool.Height()` | 60 | method `func() int` | Returns buffer height (from buffer 0) | `Buffer.Height()` | — | |
| 416 | `BufferPool.Resize()` | 66 | method `func(width, height int)` | Resizes both buffers and marks both as clean | `Buffer.Resize()` | `App.handleResize()` | |
| 417 | `BufferPool.Run()` | 75 | method `func(ctx context.Context, frame func(buf *Buffer)) error` | Standalone render loop: gets current buffer, calls frame callback, swaps; runs until ctx cancelled | `Current()`, `Swap()` | User code (standalone usage without App) | |

---

## FILE: `cursor.go` (20 lines)

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 418 | `Cursor` | 7 | `struct` | Cursor position (X, Y), style (CursorShape), and visibility (bool) | `CursorShape` | `App.Cursor()`, `Layer.cursor`, `DefaultCursor()` | Read-only snapshot type; setting done via individual methods |
| 419 | `DefaultCursor()` | 14 | `func() Cursor` | Returns cursor with CursorBlock style and visible=true | `CursorBlock` | — | |

---

## FILE: `termios_darwin.go` (9 lines)

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 420 | `ioctlGetTermios` | 6 | `const = unix.TIOCGETA` | macOS ioctl number for getting terminal attributes | `unix.TIOCGETA` | `Screen.EnterRawMode()`, `Screen.EnterInlineMode()` | Platform-specific via build tags |
| 421 | `ioctlSetTermios` | 7 | `const = unix.TIOCSETA` | macOS ioctl number for setting terminal attributes | `unix.TIOCSETA` | `Screen.EnterRawMode()`, `Screen.ExitRawMode()`, `Screen.EnterInlineMode()`, `Screen.ExitInlineMode()`, `Screen.handleSignals()` (via ExitRawMode) | |

---

## FILE: `termios_linux.go` (9 lines)

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 422 | `ioctlGetTermios` | 6 | `const = unix.TCGETS` | Linux ioctl number for getting terminal attributes | `unix.TCGETS` | Same as darwin | Platform-specific via build tags |
| 423 | `ioctlSetTermios` | 7 | `const = unix.TCSETS` | Linux ioctl number for setting terminal attributes | `unix.TCSETS` | Same as darwin | |

---

## FILE: `jump.go` (111 lines)

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 424 | `JumpStyle` | 4 | `struct` | Configures jump label appearance; contains LabelStyle (Style) | `Style` | `App.jumpStyle`, `App.SetJumpStyle()`, `DefaultJumpStyle` | |
| 425 | `DefaultJumpStyle` | 9 | `var JumpStyle` | Default styling: Magenta + Bold | `Magenta`, `AttrBold` | `NewApp()` | |
| 426 | `JumpTarget` | 14 | `struct` | Single jumpable location: X/Y position, Label string, OnSelect callback, per-target Style override | `Style` | `JumpMode`, `App.EnterJumpMode()` | |
| 427 | `JumpMode` | 22 | `struct` | State for jump label mode: Active bool, Targets []JumpTarget, Input string | `JumpTarget` | `App.jumpMode` | |
| 428 | `labelChars` | 30 | `var []rune` | Characters for jump labels; home row first for ergonomics | — | `GenerateLabels()` | a,s,d,f,g,h,j,k,l,q,w,e,r,t,y,u,i,o,p,z,x,c,v,b,n,m |
| 429 | `GenerateLabels()` | 39 | `func(n int) []string` | Creates n unique labels; single chars for <=27, two chars for larger sets | `labelChars` | `JumpMode.AssignLabels()` | |
| 430 | `JumpMode.ClearJumpTargets()` | 69 | method | Resets targets slice to zero length (reuses backing array) and clears input | — | `App.EnterJumpMode()`, `App.ExitJumpMode()` | |
| 431 | `JumpMode.AddTarget()` | 75 | method `func(x, y int16, onSelect func(), style Style)` | Appends a new jump target | — | `App.AddJumpTarget()` | |
| 432 | `JumpMode.AssignLabels()` | 85 | method | Assigns generated labels to all collected targets | `GenerateLabels()` | `App.EnterJumpMode()` | |
| 433 | `JumpMode.FindTarget()` | 93 | method `func(label string) *JumpTarget` | Linear search for target by label | — | — | |
| 434 | `JumpMode.HasPartialMatch()` | 103 | method `func(prefix string) bool` | Checks if any target label starts with prefix (for multi-char label accumulation) | — | `App.EnterJumpMode()` unmatched handler | |

---

## FILE: `layer.go` (307 lines)

### Type: `Layer` (line 9)

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 435 | `Layer` | 9 | `struct` | Pre-rendered buffer with scroll management and cursor support; content rendered once (expensive), blitted each frame (cheap) | `Buffer`, `Cursor` | `App.activeLayer`, `LayerViewNode`, template execution | Design: separates expensive rendering from cheap per-frame blitting |
| 436 | `Layer.buffer` | 10 | field `*Buffer` | The pre-rendered content | `Buffer` | All Layer methods | |
| 437 | `Layer.scrollY` | 11 | field `int` | Current scroll position | — | Scroll methods, `blit()` | |
| 438 | `Layer.maxScroll` | 12 | field `int` | Maximum valid scroll position | — | `updateMaxScroll()`, scroll methods | |
| 439 | `Layer.viewWidth` | 15 | field `int` | Viewport width (set during layout) | — | `SetViewport()`, `NeedsRender()` | |
| 440 | `Layer.viewHeight` | 16 | field `int` | Viewport height (set during layout) | — | `SetViewport()`, `updateMaxScroll()`, scroll methods | |
| 441 | `Layer.lastRenderWidth` | 19 | field `int` | Width at last render (for change detection) | — | `NeedsRender()`, `prepare()` | |
| 442 | `Layer.lastRenderHeight` | 20 | field `int` | Height at last render | — | `prepare()` | |
| 443 | `Layer.cursor` | 23 | field `Cursor` | Cursor state in buffer-relative coordinates | `Cursor` | `SetCursor()`, `SetCursorStyle()`, `ShowCursor()`, `HideCursor()`, `Cursor()`, `ScreenCursor()` | |
| 444 | `Layer.screenX` | 26 | field `int` | Screen X offset (set by framework during blit for cursor translation) | — | `ScreenCursor()` | |
| 445 | `Layer.screenY` | 26 | field `int` | Screen Y offset | — | `ScreenCursor()` | |
| 446 | `Layer.Render` | 34 | field `func()` | Auto-render callback; called by framework before blit when viewport dimensions change | — | `NeedsRender()`, `prepare()` | Design: framework-managed re-render on viewport dimension changes |

### Layer Constructor & Content

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 447 | `NewLayer()` | 38 | `func() *Layer` | Creates empty layer | — | User code | |
| 448 | `Layer.SetContent()` | 44 | method `func(tmpl *Template, width, height int)` | Renders template into layer buffer; resets scroll | `NewBuffer()`, `Template.Execute()` | User code | |
| 449 | `Layer.SetBuffer()` | 53 | method `func(buf *Buffer)` | Directly sets layer buffer; resets scroll | — | User code | |
| 450 | `Layer.Buffer()` | 60 | method `func() *Buffer` | Returns underlying buffer | — | User code | |

### Layer Viewport & Auto-Render

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 451 | `Layer.updateMaxScroll()` | 65 | unexported method | Recalculates maxScroll from buffer height minus viewport height; clamps current scroll | — | `SetContent()`, `SetBuffer()`, `SetViewport()`, `EnsureSize()` | |
| 452 | `Layer.SetViewport()` | 82 | method `func(width, height int)` | Sets viewport dimensions; called by framework during layout | `updateMaxScroll()` | Template execution | |
| 453 | `Layer.NeedsRender()` | 91 | method `func() bool` | True if Render callback exists and (first render or width changed) | — | `prepare()` | Design: width changes always trigger re-render (text wrapping); height-only changes don't |
| 454 | `Layer.prepare()` | 101 | unexported method | If NeedsRender(), records dimensions and calls Render callback | `NeedsRender()` | Template execution (before blit) | |

### Layer Scroll API

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 455 | `Layer.ScrollY()` | 111 | method `func() int` | Returns current scroll position | — | User code | |
| 456 | `Layer.MaxScroll()` | 116 | method `func() int` | Returns maximum scroll position | — | User code | |
| 457 | `Layer.ContentHeight()` | 121 | method `func() int` | Returns total content height | — | User code | |
| 458 | `Layer.ViewportHeight()` | 129 | method `func() int` | Returns visible viewport height | — | User code | |
| 459 | `Layer.ViewportWidth()` | 134 | method `func() int` | Returns visible viewport width | — | User code | |
| 460 | `Layer.ScrollTo()` | 139 | method `func(y int)` | Sets scroll position, clamped to [0, maxScroll] | — | `ScrollDown()`, `ScrollUp()` | |
| 461 | `Layer.ScrollDown()` | 150 | method `func(n int)` | Scrolls down by n lines | `ScrollTo()` | `PageDown()`, `HalfPageDown()` | |
| 462 | `Layer.ScrollUp()` | 155 | method `func(n int)` | Scrolls up by n lines | `ScrollTo()` | `PageUp()`, `HalfPageUp()` | |
| 463 | `Layer.ScrollToTop()` | 160 | method `func()` | Scrolls to top | — | User code | |
| 464 | `Layer.ScrollToEnd()` | 165 | method `func()` | Scrolls to bottom | — | User code | |
| 465 | `Layer.PageDown()` | 170 | method `func()` | Scrolls down by viewport height | `ScrollDown()` | User code | |
| 466 | `Layer.PageUp()` | 175 | method `func()` | Scrolls up by viewport height | `ScrollUp()` | User code | |
| 467 | `Layer.HalfPageDown()` | 179 | method `func()` | Scrolls down by half viewport | `ScrollDown()` | User code | |
| 468 | `Layer.HalfPageUp()` | 184 | method `func()` | Scrolls up by half viewport | `ScrollUp()` | User code | |

### Layer Blit & Line Updates

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 469 | `Layer.blit()` | 190 | unexported method `func(dst *Buffer, dstX, dstY, width, height int)` | Copies visible portion (accounting for scrollY) to destination buffer | `Buffer.Blit()` | Template execution | |
| 470 | `Layer.SetLine()` | 200 | method `func(y int, spans []Span)` | Updates single line with styled spans; clears line first | `Buffer.ClearLine()`, `Buffer.WriteSpans()` | User code | Efficient partial update path |
| 471 | `Layer.SetLineString()` | 210 | method `func(y int, s string, style Style)` | Updates single line with plain string; clears line first | `Buffer.ClearLine()`, `Buffer.WriteStringFast()` | User code | |
| 472 | `Layer.SetLineAt()` | 221 | method `func(y, x int, spans []Span, clearStyle Style)` | Updates line at x offset with styled clear first | `Buffer.ClearLineWithStyle()`, `Buffer.WriteSpans()` | User code | |
| 473 | `Layer.EnsureSize()` | 231 | method `func(width, height int)` | Ensures buffer is at least given size; grows by creating new buffer and blitting | `NewBuffer()`, `Buffer.Blit()` | User code | |
| 474 | `Layer.Clear()` | 249 | method `func()` | Clears entire layer buffer | `Buffer.Clear()` | User code | |

### Layer Cursor API

| # | Name | Line | What | Does | Depends On | Depended On By | Notes |
|---|------|------|------|------|-----------|----------------|-------|
| 475 | `Layer.SetCursor()` | 261 | method `func(x, y int)` | Sets cursor position in buffer coordinates | — | User code | |
| 476 | `Layer.SetCursorStyle()` | 267 | method `func(style CursorShape)` | Sets cursor visual style | `CursorShape` | User code | |
| 477 | `Layer.ShowCursor()` | 272 | method `func()` | Makes cursor visible | — | User code | |
| 478 | `Layer.HideCursor()` | 277 | method `func()` | Hides cursor | — | User code | |
| 479 | `Layer.Cursor()` | 282 | method `func() Cursor` | Returns full cursor state snapshot | `Cursor` | User code | |
| 480 | `Layer.ScreenCursor()` | 289 | method `func() (x, y int, visible bool)` | Translates buffer-relative cursor to screen coordinates; accounts for scroll offset and screen position; returns false if not visible or outside viewport | — | `App.render()` | Design: layer sets screenX/screenY during blit, then render() calls this to get final screen position |

---

## CROSS-CUTTING DESIGN PATTERNS & ARCHITECTURE NOTES

### Render Pipeline (full path through the code)

1. **Trigger**: `RequestRender()` sends to `renderChan` (coalescing), OR input `afterDispatch` callback, OR `RenderNow()` direct call
2. **`render()`**: Acquires `renderMu` lock
3. **Pre-render**: Calls `onBeforeRender` callback
4. **View resolution**: viewStack top > currentView > base template
5. **Template execution**: `Template.Execute(buf, width, height)` into pool's current buffer
6. **Layer cursor**: If `activeLayer` set during execution, translates layer cursor to screen coords
7. **Post-render**: Calls `onAfterRender` callback
8. **Copy to screen**: `copyToScreen()` does bulk `CopyFrom()` into screen's back buffer
9. **Flush**: 
   - Inline: `FlushInline()` writes all lines, returns linesUsed
   - Fullscreen normal: `Flush()` does per-cell diff against front buffer, builds ANSI output into `buf`
   - Fullscreen debug: `FlushFull()` redraws everything
10. **Pool swap**: `BufferPool.Swap()` marks old dirty, clears next via `ClearDirty()` (partial clear)
11. **Cursor**: `BufferCursorColor()` + `BufferCursor()` append to same `buf`
12. **Final write**: `FlushBuffer()` — single `writer.Write()` syscall for content + cursor

### Key Design Decisions Observed

- **Single-syscall output**: Content diff and cursor ops are batched into one `bytes.Buffer`, written in one `Write()` call
- **Coalescing render channel**: `renderChan` cap 1 means at most one pending render; multiple `RequestRender()` calls collapse
- **Partial clear optimization**: `ClearDirty()` only clears rows 0..dirtyMaxY, not the entire buffer
- **memmove-based clear**: `Clear()` uses `copy()` from a pre-filled cache buffer (compiles to memmove)
- **Row-level dirty tracking**: `dirtyRows[]bool` + `allDirty` flag lets `Flush()` skip untouched rows entirely
- **Border merging via bitmask**: Overlapping border chars automatically produce correct junction chars (├, ┤, ┬, ┴, ┼) via edge-bit OR and array lookup
- **Lock-free double buffering**: `BufferPool` uses `atomic.Uint32` for buffer index and `atomic.Bool` for dirty flags
- **Allocation-free ANSI output**: `writeIntToBuf()`, `appendInt()`, stack-allocated scratch buffers throughout
- **CJK double-width support**: Cells with wide runes get a placeholder (rune=0) in the next cell; flush skips placeholders; ASCII fast path (rune < 0x1100) avoids `RuneWidth()` call
- **Platform abstraction**: Only the ioctl constants differ between darwin and linux (TIOCGETA vs TCGETS)
- **Pointer binding model**: View components accept `*string`, `*int`, `*bool`, `*[]T` etc.; pointers captured at compile time, mutations trigger re-render automatically via `RequestRender()`
- **Input stack (riffkey)**: Modal input via push/pop of routers; focus manager and text input handlers wire as "unmatched" key handlers
</task_result>