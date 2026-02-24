task_id: ses_3a1f95f23ffev5FapbT0ZRmljP (for resuming to continue this task if needed)

<task_result>
Now I have comprehensive data. Let me compile the full catalogue.

---

# COMPREHENSIVE CATALOGUE: Interactive Components and Features

## FILE: filter.go

### 1. `Filter[T any]` (struct)
- **File/Line:** filter.go:13
- **What it is:** Generic struct
- **What it does:** Provides fzf-style filtering mechanics for a slice of items -- handles query parsing, scoring, filtering, and index mapping back to the original source slice; no UI opinions.
- **Dependencies:** `FzfQuery` (fzf.go), `scored` (filter.go:24)
- **Depended on by:** `FilterListC` (filterlist.go), `FilterLogC` (filterlog.go)
- **Notable design:** Generic `[T any]`, stores pointer to source slice (`*[]T`), maintains parallel `indices` slice for mapping filtered positions back to originals. Uses insertion sort on scored matches. Reuses scratch slices (`matches`, `Items`, `indices`) across calls to avoid allocation.

**Fields:**
- `Items []T` -- exported, filtered+ranked subset; users point a `ListC` at `&f.Items`
- `source *[]T` -- unexported, pointer to the original backing slice
- `extract func(*T) string` -- unexported, extraction function for searchable text from each item
- `lastQuery string` -- unexported, deduplication guard
- `query FzfQuery` -- unexported, parsed query
- `indices []int` -- unexported, `indices[i]` = index into `*source` for `Items[i]`
- `matches []scored` -- unexported, reusable scratch buffer for scoring

### 2. `scored` (struct)
- **File/Line:** filter.go:24
- **What it is:** Unexported struct
- **What it does:** Pairs a source index with its fuzzy match score for sorting.
- **Dependencies:** None
- **Depended on by:** `Filter[T]`

**Fields:**
- `index int` -- position in source slice
- `score int` -- match score from FzfQuery.Score

### 3. `NewFilter[T any]` (function)
- **File/Line:** filter.go:31
- **What it is:** Generic constructor function
- **What it does:** Creates a `Filter[T]` over a source slice, calls `Reset()` to initialize Items to full source.
- **Dependencies:** `Filter[T]`
- **Depended on by:** `FilterList` constructor (filterlist.go:28)

### 4. `(*Filter[T]).Update` (method)
- **File/Line:** filter.go:42
- **What it is:** Method on `*Filter[T]`
- **What it does:** Re-filters the source slice with a new query string; no-op if query unchanged. Parses query via `ParseFzfQuery`, scores all source items, insertion-sorts matches by score descending then index ascending, rebuilds `Items` and `indices`.
- **Dependencies:** `ParseFzfQuery`, `FzfQuery.Score`, `FzfQuery.Empty`, `scoredLess`
- **Notable design:** Early return on unchanged query. Reuses `matches` scratch slice capacity.

### 5. `(*Filter[T]).Reset` (method)
- **File/Line:** filter.go:89
- **What it is:** Method on `*Filter[T]`
- **What it does:** Clears the filter, restoring all source items in original order. Reuses allocated capacity where possible.
- **Dependencies:** None

### 6. `(*Filter[T]).Original` (method)
- **File/Line:** filter.go:109
- **What it is:** Method on `*Filter[T]`
- **What it does:** Maps a filtered index back to a pointer into the source slice. Returns nil if out of bounds.
- **Dependencies:** `indices`

### 7. `(*Filter[T]).OriginalIndex` (method)
- **File/Line:** filter.go:123
- **What it is:** Method on `*Filter[T]`
- **What it does:** Maps a filtered index back to the index in the source slice. Returns -1 if out of bounds.
- **Dependencies:** `indices`

### 8. `(*Filter[T]).Active` (method)
- **File/Line:** filter.go:131
- **What it is:** Method on `*Filter[T]`
- **What it does:** Reports whether a filter query is currently applied (i.e., query is non-empty).
- **Dependencies:** `FzfQuery.Empty`

### 9. `(*Filter[T]).Query` (method)
- **File/Line:** filter.go:136
- **What it is:** Method on `*Filter[T]`
- **What it does:** Returns the current raw query string.

### 10. `(*Filter[T]).Len` (method)
- **File/Line:** filter.go:141
- **What it is:** Method on `*Filter[T]`
- **What it does:** Returns the number of currently visible (filtered) items.

### 11. `scoredLess` (function)
- **File/Line:** filter.go:145
- **What it is:** Unexported comparison function
- **What it does:** Compares two scored entries: higher score wins, ties broken by lower index (stable original order).
- **Dependencies:** None
- **Depended on by:** `Filter.Update`

---

## FILE: filterlist.go

### 12. `FilterListC[T any]` (struct)
- **File/Line:** filterlist.go:13
- **What it is:** Generic struct
- **What it does:** Drop-in filterable list -- composes an `InputC`, a `Filter`, and a `ListC` into a single template node. Implements `templateTree`, `bindable`, `textInputBindable`.
- **Dependencies:** `InputC` (components.go), `ListC[T]` (components.go), `Filter[T]` (filter.go), `textInputBinding` (components.go), `binding` (components.go), `BorderStyle` (buffer.go)
- **Depended on by:** User code
- **Notable design:** Wires input onChange to `sync()` which calls `filter.Update` + `list.ClampSelection`. Default nav keys are `<C-n>/<C-p>` and `<C-d>/<C-u>` (don't conflict with text input). Handle routes through `filter.Original` so callback gets source item, not filtered copy.

**Fields:**
- `input *InputC` -- the text input
- `list *ListC[T]` -- the list view
- `filter *Filter[T]` -- the filter engine
- `placeholder string` -- input placeholder
- `maxVisible int` -- max visible list items
- `border BorderStyle` -- optional border
- `title string` -- border title
- `margin [4]int16` -- TRBL margin

### 13. `FilterList[T any]` (function)
- **File/Line:** filterlist.go:27
- **What it is:** Generic constructor function
- **What it does:** Creates a `FilterListC[T]` wiring an input to a filter to a list; sets up the onChange callback and default nav bindings.
- **Dependencies:** `NewFilter`, `Input`, `List`, `textInputBinding`

### 14. `(*FilterListC[T]).toTemplate` (method)
- **File/Line:** filterlist.go:49
- **What it is:** Method implementing `templateTree` interface
- **What it does:** Returns the composed VBox template tree containing an HBox with prompt+input and the list below.
- **Dependencies:** `HBox`, `VBox`, `Text`

### 15. `(*FilterListC[T]).bindings` (method)
- **File/Line:** filterlist.go:74
- **What it is:** Method implementing `bindable` interface
- **What it does:** Delegates to the list's bindings for nav/handles.

### 16. `(*FilterListC[T]).textBinding` (method)
- **File/Line:** filterlist.go:79
- **What it is:** Method implementing `textInputBindable` interface
- **What it does:** Delegates to the input's textBinding.

### 17. `(*FilterListC[T]).sync` (method)
- **File/Line:** filterlist.go:83
- **What it is:** Unexported method
- **What it does:** Calls `filter.Update` with current input value, then `list.ClampSelection` to keep selection valid.

### 18. `(*FilterListC[T]).Placeholder` (method)
- **File/Line:** filterlist.go:89
- **What it is:** Builder method
- **What it does:** Sets the input placeholder text. Returns self for chaining.

### 19. `(*FilterListC[T]).Render` (method)
- **File/Line:** filterlist.go:95
- **What it is:** Builder method
- **What it does:** Sets the render function for each list item. Delegates to `list.Render`.

### 20. `(*FilterListC[T]).MaxVisible` (method)
- **File/Line:** filterlist.go:101
- **What it is:** Builder method
- **What it does:** Sets maximum visible items in the list.

### 21. `(*FilterListC[T]).Border` (method)
- **File/Line:** filterlist.go:107
- **What it is:** Builder method
- **What it does:** Sets border style on the container.

### 22. `(*FilterListC[T]).Title` (method)
- **File/Line:** filterlist.go:113
- **What it is:** Builder method
- **What it does:** Sets border title.

### 23. `(*FilterListC[T]).Margin` / `.MarginVH` / `.MarginTRBL` (methods)
- **File/Line:** filterlist.go:118, 123, 128
- **What they are:** Builder methods
- **What they do:** Set margin on all sides / vertical+horizontal / individual TRBL.

### 24. `(*FilterListC[T]).Handle` (method)
- **File/Line:** filterlist.go:135
- **What it is:** Builder method
- **What it does:** Registers a key binding that passes the currently selected **original source item** (not filtered copy) to the callback. Uses `fl.Selected()` internally.
- **Notable design:** The callback receives `*T` pointing into the original source slice, not the filtered copy.

### 25. `(*FilterListC[T]).HandleClear` (method)
- **File/Line:** filterlist.go:148
- **What it is:** Builder method
- **What it does:** Registers a key that clears the filter when active, or calls fallback when no filter is applied. Dual-purpose key.

### 26. `(*FilterListC[T]).BindNav` (method)
- **File/Line:** filterlist.go:162
- **What it is:** Builder method
- **What it does:** Overrides the default navigation keys by delegating to `list.BindNav`.

### 27. `(*FilterListC[T]).Selected` (method)
- **File/Line:** filterlist.go:169
- **What it is:** Method
- **What it does:** Returns a pointer to the original source item corresponding to the current list selection. Uses `filter.Original(list.Index())`.

### 28. `(*FilterListC[T]).SelectedIndex` (method)
- **File/Line:** filterlist.go:176
- **What it is:** Method
- **What it does:** Returns the index into the original source slice for the current selection. Returns -1 if nothing selected.

### 29. `(*FilterListC[T]).Clear` (method)
- **File/Line:** filterlist.go:181
- **What it is:** Method
- **What it does:** Resets the filter and input by clearing input, resetting filter, and clamping selection.

### 30. `(*FilterListC[T]).Active` (method)
- **File/Line:** filterlist.go:188
- **What it is:** Method
- **What it does:** Reports whether a filter query is currently applied.

### 31. `(*FilterListC[T]).Filter` (method)
- **File/Line:** filterlist.go:193
- **What it is:** Method
- **What it does:** Returns the underlying `*Filter[T]` for direct access.

### 32. `(*FilterListC[T]).Ref` (method)
- **File/Line:** filterlist.go:198
- **What it is:** Builder method
- **What it does:** Calls the provided function with the FilterListC pointer for capturing references. Returns self.

### 33. `(*FilterListC[T]).Marker` (method)
- **File/Line:** filterlist.go:204
- **What it is:** Builder method
- **What it does:** Sets the selection marker string. Delegates to `list.Marker`.

### 34. `(*FilterListC[T]).Style` (method)
- **File/Line:** filterlist.go:210
- **What it is:** Builder method
- **What it does:** Sets default style for non-selected rows. Delegates to `list.Style`.

### 35. `(*FilterListC[T]).SelectedStyle` (method)
- **File/Line:** filterlist.go:216
- **What it is:** Builder method
- **What it does:** Sets style for the selected row. Delegates to `list.SelectedStyle`.

---

## FILE: filterlog.go

### 36. `FilterLogC` (struct)
- **File/Line:** filterlog.go:18
- **What it is:** Struct
- **What it does:** Filterable log viewer -- composes an `InputC` and a `LogC` with fzf-style filtering. Implements `templateTree`, `bindable`, `textInputBindable`, `focusable`.
- **Dependencies:** `InputC`, `LogC`, `FzfQuery`, `textInputBinding`, `FocusManager`, `Layer`
- **Notable design:** Overrides the LogC's read loop (`startFiltered`/`readLoopFiltered`) to apply filter on each new line. Uses `syncToLayerFiltered` which is an extension method on LogC.

**Fields:**
- `input *InputC` -- text input
- `log *LogC` -- underlying log component
- `placeholder string` -- input placeholder
- `query FzfQuery` -- parsed filter query
- `lastQuery string` -- dedup guard
- `filteredLines []string` -- filtered view
- `filterMu sync.Mutex` -- filter synchronization
- `grow float32` -- flex grow factor
- `margin [4]int16` -- TRBL margins
- `focused bool` -- focus state
- `manager *FocusManager` -- optional focus manager

### 37. `FilterLog` (function)
- **File/Line:** filterlog.go:40
- **What it is:** Constructor function
- **What it does:** Creates a `FilterLogC` from an `io.Reader`, wiring the input's onChange to `updateFilter`. Sets default nav keys `<C-n>/<C-p>`, `<C-d>/<C-u>`, `<C-Home>/<C-End>`.

### 38. `(*FilterLogC).toTemplate` (method)
- **File/Line:** filterlog.go:70
- **What it is:** Method implementing `templateTree`
- **What it does:** Returns VBox containing HBox(prompt+input) and the log component.

### 39. `(*FilterLogC).bindings` (method)
- **File/Line:** filterlog.go:97
- **What it is:** Method implementing `bindable`
- **What it does:** Delegates to `log.bindings()`.

### 40. `(*FilterLogC).textBinding` (method)
- **File/Line:** filterlog.go:102
- **What it is:** Method implementing `textInputBindable`
- **What it does:** Delegates to `input.textBinding()`.

### 41. `(*FilterLogC).Placeholder` / `.MaxLines` / `.Grow` / `.Margin` / `.MarginVH` / `.MarginTRBL` (methods)
- **File/Line:** filterlog.go:107-138
- **What they are:** Builder methods
- **What they do:** Configure placeholder, max line buffer, flex grow, and margins.

### 42. `(*FilterLogC).BindNav` / `.BindPageNav` / `.BindFirstLast` / `.BindVimNav` (methods)
- **File/Line:** filterlog.go:141-164
- **What they are:** Builder methods
- **What they do:** Register scroll navigation key bindings by delegating to the internal log component.

### 43. `(*FilterLogC).Ref` (method)
- **File/Line:** filterlog.go:167
- **What it is:** Builder method
- **What it does:** Calls function with self pointer for capturing references.

### 44. `(*FilterLogC).ManagedBy` (method)
- **File/Line:** filterlog.go:173
- **What it is:** Builder method
- **What it does:** Registers with a `FocusManager` for multi-input focus cycling.
- **Dependencies:** `FocusManager`

### 45. `(*FilterLogC).focusBinding` / `.setFocused` (methods)
- **File/Line:** filterlog.go:181, 186
- **What they are:** Methods implementing `focusable` interface
- **What they do:** Return the input's text binding / set focus state on both self and input.

### 46. `(*FilterLogC).Focused` / `.NewLines` / `.Layer` / `.Clear` / `.Active` (methods)
- **File/Line:** filterlog.go:192-215
- **What they are:** Accessor/utility methods
- **What they do:** Return focus state / new line count / underlying layer / clear input+filter / report if filter active.

### 47. `(*FilterLogC).updateFilter` (method)
- **File/Line:** filterlog.go:218
- **What it is:** Unexported method
- **What it does:** Re-parses query from input value and calls `syncToLayerFiltered` on the log.

### 48. `(*LogC).syncToLayerFiltered` (method)
- **File/Line:** filterlog.go:233
- **What it is:** Method on `*LogC` (defined in filterlog.go)
- **What it does:** Writes filtered lines to the layer's buffer, or all lines if query is empty. Shows "(no matches)" if filter yields nothing.
- **Dependencies:** `FzfQuery.Score`, `NewBuffer`, `Layer.SetBuffer`

### 49. `(*FilterLogC).startFiltered` / `.readLoopFiltered` (methods)
- **File/Line:** filterlog.go:274, 279
- **What they are:** Unexported methods
- **What they do:** Start the background reader goroutine and read lines with filter application on each update (replaces LogC's normal readLoop).

### 50. `(*Template).compileFilterLogC` (method)
- **File/Line:** filterlog.go:324
- **What it is:** Compiler method on `*Template`
- **What it does:** Compiles the FilterLog component -- collects bindings, wires app for invalidation, starts reader goroutine once, compiles template tree.

---

## FILE: fzf.go

### 51. `FzfQuery` (struct)
- **File/Line:** fzf.go:35
- **What it is:** Exported struct
- **What it does:** Pre-parsed fzf query. Parse once, score many. Contains OR groups of AND term groups.
- **Dependencies:** `fzfGroup`, `fzfTerm`, `junegunn/fzf/src/algo`, `junegunn/fzf/src/util`
- **Depended on by:** `Filter[T]`, `FilterLogC`
- **Notable design:** Supports full fzf query syntax: fuzzy, exact (`'`), prefix (`^`), suffix (`$`), negation (`!`), AND (space-separated), OR (` | ` separated). Smart case sensitivity (case-sensitive if query contains uppercase).

**Fields:**
- `groups []fzfGroup` -- OR groups; at least one must match

### 52. `fzfGroup` (struct)
- **File/Line:** fzf.go:39
- **What it is:** Unexported struct
- **What it does:** Represents an AND group of terms within an FzfQuery. All terms must match for the group to match.

**Fields:**
- `terms []fzfTerm`

### 53. `fzfTermKind` (type + constants)
- **File/Line:** fzf.go:43-50
- **What it is:** Unexported type and const block
- **What it does:** Enumerates the four match kinds: `termFuzzy`, `termExact`, `termPrefix`, `termSuffix`.

### 54. `fzfTerm` (struct)
- **File/Line:** fzf.go:52
- **What it is:** Unexported struct
- **What it does:** Represents a single search term with its kind, negation flag, case sensitivity, and pattern.

**Fields:**
- `pattern string` -- the raw pattern text (lowercased if case-insensitive)
- `patRunes []rune` -- pre-converted runes for fzf algo functions
- `kind fzfTermKind` -- fuzzy/exact/prefix/suffix
- `negated bool` -- true if `!` prefix
- `caseSensitive bool` -- true if pattern contains uppercase

### 55. `init()` (function)
- **File/Line:** fzf.go:28
- **What it is:** Package init function
- **What it does:** Calls `algo.Init("default")` to initialize the fzf algorithm.

### 56. `fzfSlab` (variable)
- **File/Line:** fzf.go:32
- **What it is:** Package-level variable
- **What it does:** Pre-allocated slab for fzf scoring to avoid per-call allocation. `util.MakeSlab(100*1024, 2048)`.

### 57. `ParseFzfQuery` (function)
- **File/Line:** fzf.go:61
- **What it is:** Exported function
- **What it does:** Parses a raw query string into a reusable `FzfQuery`. Splits on ` | ` for OR groups, each group split on whitespace for AND terms.
- **Dependencies:** `parseGroup`
- **Depended on by:** `Filter.Update`, `FilterLogC.updateFilter`
- **Notable design:** Pre-counts OR groups for exact capacity allocation. Trims whitespace.

### 58. `(*FzfQuery).Empty` (method)
- **File/Line:** fzf.go:103
- **What it is:** Method
- **What it does:** Returns true if the query has no groups (empty query).

### 59. `parseGroup` (function)
- **File/Line:** fzf.go:107
- **What it is:** Unexported function
- **What it does:** Parses a single OR branch into an AND group of terms. Pre-counts tokens for exact slice capacity.
- **Dependencies:** `parseTerm`

### 60. `parseTerm` (function)
- **File/Line:** fzf.go:137
- **What it is:** Unexported function
- **What it does:** Parses a single token into an `fzfTerm` -- strips `!` for negation, `'` for exact, `^` for prefix, `$` for suffix. Determines case sensitivity via `hasUppercase`. Lowercases the pattern if case-insensitive.
- **Dependencies:** `hasUppercase`

### 61. `hasUppercase` (function)
- **File/Line:** fzf.go:166
- **What it is:** Unexported function
- **What it does:** Checks if a string contains any uppercase characters (for smart case detection).

### 62. `(*FzfQuery).Score` (method)
- **File/Line:** fzf.go:179
- **What it is:** Exported method
- **What it does:** Scores a single candidate against the parsed query. Returns `(score, matched)`. Tries all OR groups and returns the best score.
- **Dependencies:** `fzfGroup.score`

### 63. `(*fzfGroup).score` (method)
- **File/Line:** fzf.go:196
- **What it is:** Unexported method
- **What it does:** Scores a candidate against an AND group. All terms must match; returns total score.
- **Dependencies:** `fzfTerm.score`

### 64. `(*fzfTerm).score` (method)
- **File/Line:** fzf.go:208
- **What it is:** Unexported method
- **What it does:** Scores a candidate against a single term. Uses `unsafe.StringData` + `util.ToChars` for zero-copy. Dispatches to `algo.ExactMatchNaive`, `algo.PrefixMatch`, `algo.SuffixMatch`, or `algo.FuzzyMatchV2` based on term kind. Handles negation.
- **Notable design:** Uses `unsafe` for zero-copy string-to-bytes conversion. Direct dispatch (switch instead of function variable) to allow escape analysis to prove `&chars` stays on stack.

---

## FILE: jump.go

### 65. `JumpStyle` (struct)
- **File/Line:** jump.go:4
- **What it is:** Exported struct
- **What it does:** Configures the appearance of jump labels.
- **Dependencies:** `Style`

**Fields:**
- `LabelStyle Style` -- style for the label character(s)

### 66. `DefaultJumpStyle` (variable)
- **File/Line:** jump.go:9
- **What it is:** Exported package-level variable
- **What it does:** Default styling for jump labels: magenta bold.
- **Dependencies:** `JumpStyle`, `Style`, `Magenta`, `AttrBold`

### 67. `JumpTarget` (struct)
- **File/Line:** jump.go:14
- **What it is:** Exported struct
- **What it does:** Represents a single jumpable location on screen.

**Fields:**
- `X, Y int16` -- screen coordinates
- `Label string` -- the label text to display
- `OnSelect func()` -- callback when this target is selected
- `Style Style` -- per-target override (zero = use default)

### 68. `JumpMode` (struct)
- **File/Line:** jump.go:22
- **What it is:** Exported struct
- **What it does:** Holds the state for jump label mode (active state, accumulated targets, accumulated user input).
- **Dependencies:** `JumpTarget`
- **Depended on by:** `App` (app.go), `Template` (template.go)

**Fields:**
- `Active bool` -- whether jump mode is currently active
- `Targets []JumpTarget` -- all registered targets
- `Input string` -- accumulated input for multi-char labels

### 69. `labelChars` (variable)
- **File/Line:** jump.go:30
- **What it is:** Unexported package-level variable
- **What it does:** Characters used for jump labels -- home row first for ergonomics, then other letters. 27 chars total.

### 70. `GenerateLabels` (function)
- **File/Line:** jump.go:39
- **What it is:** Exported function
- **What it does:** Creates n unique labels for jump targets. Single chars for n<=27, two chars for larger sets (cartesian product of labelChars).
- **Dependencies:** `labelChars`
- **Depended on by:** `JumpMode.AssignLabels`

### 71. `(*JumpMode).ClearJumpTargets` (method)
- **File/Line:** jump.go:69
- **What it is:** Method
- **What it does:** Resets the jump targets slice for reuse (preserves capacity) and clears input.

### 72. `(*JumpMode).AddTarget` (method)
- **File/Line:** jump.go:75
- **What it is:** Method
- **What it does:** Adds a jump target during render with position, callback, and style.

### 73. `(*JumpMode).AssignLabels` (method)
- **File/Line:** jump.go:85
- **What it is:** Method
- **What it does:** Assigns labels to all collected targets using `GenerateLabels`.

### 74. `(*JumpMode).FindTarget` (method)
- **File/Line:** jump.go:93
- **What it is:** Method
- **What it does:** Finds a target by its exact label string. Returns pointer or nil.

### 75. `(*JumpMode).HasPartialMatch` (method)
- **File/Line:** jump.go:103
- **What it is:** Method
- **What it does:** Checks if any target label starts with the given prefix (for multi-char label input).

---

## FILE: layer.go

### 76. `Layer` (struct)
- **File/Line:** layer.go:9
- **What it is:** Exported struct
- **What it does:** Pre-rendered buffer with scroll management. Content rendered once (expensive), then blitted to screen each frame (cheap). If `Render` callback is set, framework calls it automatically when viewport dimensions change.
- **Dependencies:** `Buffer`, `Template`, `Cursor`, `CursorShape`
- **Depended on by:** `LayerViewC` (components.go), `LogC` (log.go), `FilterLogC` (filterlog.go)
- **Notable design:** Lazy re-rendering based on viewport size changes. Width changes always trigger re-render (text wrapping), height changes only on first render. Cursor API with scroll-aware screen coordinate translation. Separation of buffer coordinates (internal) from screen coordinates (translated at blit time).

**Fields:**
- `buffer *Buffer` -- unexported, the internal rendering buffer
- `scrollY int` -- unexported, current vertical scroll position
- `maxScroll int` -- unexported, maximum scroll position
- `viewWidth int` -- unexported, viewport width (set during layout)
- `viewHeight int` -- unexported, viewport height (set during layout)
- `lastRenderWidth int` -- unexported, tracks width at last render for change detection
- `lastRenderHeight int` -- unexported, tracks height at last render
- `cursor Cursor` -- unexported, cursor state in buffer-relative coords
- `screenX, screenY int` -- unexported, screen offset for cursor translation
- `Render func()` -- exported, callback to populate layer buffer

### 77. `NewLayer` (function)
- **File/Line:** layer.go:38
- **What it is:** Constructor function
- **What it does:** Creates a new empty layer (no buffer, no callback).

### 78. `(*Layer).SetContent` (method)
- **File/Line:** layer.go:43
- **What it is:** Method
- **What it does:** Renders a template to the layer's internal buffer. Creates new buffer, executes template, resets scroll to 0, updates maxScroll.
- **Dependencies:** `NewBuffer`, `Template.Execute`

### 79. `(*Layer).SetBuffer` (method)
- **File/Line:** layer.go:52
- **What it is:** Method
- **What it does:** Directly sets the layer's buffer (for manual buffer management). Resets scroll to 0.

### 80. `(*Layer).Buffer` (method)
- **File/Line:** layer.go:59
- **What it is:** Method
- **What it does:** Returns the underlying buffer for direct manipulation.

### 81. `(*Layer).updateMaxScroll` (method)
- **File/Line:** layer.go:65
- **What it is:** Unexported method
- **What it does:** Recalculates maximum scroll position based on buffer height minus viewport height. Clamps current scroll to new bounds.

### 82. `(*Layer).SetViewport` (method)
- **File/Line:** layer.go:82
- **What it is:** Method
- **What it does:** Sets viewport dimensions. Called internally by framework during layout. Triggers maxScroll update.

### 83. `(*Layer).NeedsRender` (method)
- **File/Line:** layer.go:91
- **What it is:** Method
- **What it does:** Returns true if Render callback exists and viewport width changed since last render (first render or width change).

### 84. `(*Layer).prepare` (method)
- **File/Line:** layer.go:101
- **What it is:** Unexported method
- **What it does:** Ensures layer is ready to blit. Called by framework before blitting. Triggers Render callback if dimensions changed.

### 85. `(*Layer).ScrollY` / `.MaxScroll` / `.ContentHeight` / `.ViewportHeight` / `.ViewportWidth` (methods)
- **File/Line:** layer.go:111-136
- **What they are:** Accessor methods
- **What they do:** Return current scroll position / max scroll / buffer height / viewport height / viewport width.

### 86. `(*Layer).ScrollTo` (method)
- **File/Line:** layer.go:139
- **What it is:** Method
- **What it does:** Sets scroll position, clamping to [0, maxScroll].

### 87. `(*Layer).ScrollDown` / `.ScrollUp` (methods)
- **File/Line:** layer.go:150, 155
- **What they are:** Methods
- **What they do:** Scroll by n lines down/up via `ScrollTo`.

### 88. `(*Layer).ScrollToTop` / `.ScrollToEnd` (methods)
- **File/Line:** layer.go:160, 165
- **What they are:** Methods
- **What they do:** Jump to top (scrollY=0) or bottom (scrollY=maxScroll).

### 89. `(*Layer).PageDown` / `.PageUp` (methods)
- **File/Line:** layer.go:170, 175
- **What they are:** Methods
- **What they do:** Scroll by one full viewport height.

### 90. `(*Layer).HalfPageDown` / `.HalfPageUp` (methods)
- **File/Line:** layer.go:180, 185
- **What they are:** Methods
- **What they do:** Scroll by half a viewport height.

### 91. `(*Layer).blit` (method)
- **File/Line:** layer.go:190
- **What it is:** Unexported method
- **What it does:** Copies the visible portion of the layer to the destination buffer at given coordinates, offset by scrollY.
- **Dependencies:** `Buffer.Blit`

### 92. `(*Layer).SetLine` (method)
- **File/Line:** layer.go:200
- **What it is:** Method
- **What it does:** Updates a single line in the buffer with styled spans. Clears line first to prevent ghost content. Efficient path for partial updates.
- **Dependencies:** `Buffer.ClearLine`, `Buffer.WriteSpans`

### 93. `(*Layer).SetLineString` (method)
- **File/Line:** layer.go:210
- **What it is:** Method
- **What it does:** Updates a single line with a plain string and style. Clears first.
- **Dependencies:** `Buffer.ClearLine`, `Buffer.WriteStringFast`

### 94. `(*Layer).SetLineAt` (method)
- **File/Line:** layer.go:221
- **What it is:** Method
- **What it does:** Updates a line with spans at a given x offset, clearing with a specified clearStyle first. Avoids creating padding spans for margins.
- **Dependencies:** `Buffer.ClearLineWithStyle`, `Buffer.WriteSpans`

### 95. `(*Layer).EnsureSize` (method)
- **File/Line:** layer.go:231
- **What it is:** Method
- **What it does:** Ensures buffer is at least the given dimensions. If growth needed, creates new buffer and copies existing content.

### 96. `(*Layer).Clear` (method)
- **File/Line:** layer.go:249
- **What it is:** Method
- **What it does:** Clears the entire layer buffer.

### 97. `(*Layer).SetCursor` / `.SetCursorStyle` / `.ShowCursor` / `.HideCursor` (methods)
- **File/Line:** layer.go:261, 267, 272, 277
- **What they are:** Cursor API methods
- **What they do:** Set cursor position in buffer coordinates / set cursor visual shape / show/hide cursor.

### 98. `(*Layer).Cursor` (method)
- **File/Line:** layer.go:282
- **What it is:** Method
- **What it does:** Returns the full cursor state struct.

### 99. `(*Layer).ScreenCursor` (method)
- **File/Line:** layer.go:289
- **What it is:** Method
- **What it does:** Returns cursor position in screen coordinates, accounting for layer's screen position and scroll offset. Returns visibility flag based on whether cursor is within the viewport.

---

## FILE: condition.go

### 100. `Condition[T comparable]` (struct)
- **File/Line:** condition.go:10
- **What it is:** Generic struct
- **What it does:** Condition builder for type-safe conditionals. The generic `*T` parameter enforces pointer-passing at compile time.
- **Dependencies:** None
- **Depended on by:** `If`

**Fields:**
- `ptr *T` -- pointer to the value being tested

### 101. `If[T comparable]` (function)
- **File/Line:** condition.go:18
- **What it is:** Generic constructor function
- **What it does:** Starts a conditional chain. Compile-time enforces pointer argument (passing a value is a compile error).
- **Dependencies:** `Condition[T]`
- **Depended on by:** User code, `CheckListC.toSelectionList` (components.go:2023)
- **Notable design:** The constraint `comparable` + pointer receiver pattern means `If(state.Count)` won't compile -- must use `If(&state.Count)`. Elegant compile-time safety.

### 102. `(*Condition[T]).Eq` (method)
- **File/Line:** condition.go:23
- **What it is:** Method
- **What it does:** Creates a `ConditionEval` checking equality: `*ptr == val`.
- **Dependencies:** `ConditionEval[T]`

### 103. `(*Condition[T]).Ne` (method)
- **File/Line:** condition.go:32
- **What it is:** Method
- **What it does:** Creates a `ConditionEval` checking inequality: `*ptr != val`.

### 104. `(*Condition[T]).Then` (method)
- **File/Line:** condition.go:44
- **What it is:** Method (shorthand)
- **What it does:** Shorthand for truthiness check -- not equal to zero value. Works for bool (true), int (non-zero), string (non-empty).
- **Notable design:** Creates a `ConditionEval` with `condOpNe` against the zero value of T, and pre-sets the `then` node.

### 105. `OrdCondition[T cmp.Ordered]` (struct)
- **File/Line:** condition.go:55
- **What it is:** Generic struct
- **What it does:** Extended condition for ordered types (int, float, string) -- supports Gt, Lt, Gte, Lte.
- **Dependencies:** `cmp.Ordered`

### 106. `IfOrd[T cmp.Ordered]` (function)
- **File/Line:** condition.go:60
- **What it is:** Generic constructor function
- **What it does:** Starts a conditional chain for ordered types.

### 107. `(*OrdCondition[T]).Eq` / `.Ne` / `.Gt` / `.Lt` / `.Gte` / `.Lte` (methods)
- **File/Line:** condition.go:65-92
- **What they are:** Methods
- **What they do:** Create `OrdConditionEval` for each comparison operator.
- **Dependencies:** `OrdConditionEval[T]`

### 108. `condOp` (type + constants)
- **File/Line:** condition.go:94-103
- **What it is:** Unexported type and const block
- **What it does:** Enumerates comparison operators: `condOpEq`, `condOpNe`, `condOpGt`, `condOpLt`, `condOpGte`, `condOpLte`.

### 109. `ConditionEval[T comparable]` (struct)
- **File/Line:** condition.go:106
- **What it is:** Generic struct
- **What it does:** Holds a comparable condition ready for Then/Else evaluation. Implements `conditionNode` interface.
- **Dependencies:** `condOp`
- **Depended on by:** Template compiler

**Fields:**
- `ptr *T` -- pointer to value
- `offset uintptr` -- offset from element base (for ForEach pointer rewriting)
- `op condOp` -- comparison operator
- `val T` -- comparison value
- `then any` -- node to render when true
- `els any` -- node to render when false

### 110. `(*ConditionEval[T]).Then` / `.Else` (methods)
- **File/Line:** condition.go:116, 122
- **What they are:** Builder methods
- **What they do:** Set the then/else branches. Return self for chaining.

### 111. `(*ConditionEval[T]).evaluate` (method)
- **File/Line:** condition.go:128
- **What it is:** Unexported method implementing `conditionNode`
- **What it does:** Checks the condition at runtime by dereferencing `ptr` and comparing with `val`.

### 112. `(*ConditionEval[T]).getThen` / `.getElse` / `.setOffset` / `.getOffset` / `.getPtrAddr` (methods)
- **File/Line:** condition.go:140-145
- **What they are:** Interface methods implementing `conditionNode`
- **What they do:** Accessors for then/else nodes, offset management for ForEach, pointer address retrieval.

### 113. `(*ConditionEval[T]).evaluateWithBase` (method)
- **File/Line:** condition.go:148
- **What it is:** Method implementing `conditionNode`
- **What it does:** Evaluates condition using an adjusted pointer from a ForEach base address. Uses `unsafe.Add` to compute actual field address.
- **Notable design:** Critical for ForEach integration -- conditions inside ForEach templates need to read from the current element, not the prototype element used at compile time.

### 114. `OrdConditionEval[T cmp.Ordered]` (struct)
- **File/Line:** condition.go:164
- **What it is:** Generic struct
- **What it does:** Same as `ConditionEval` but supports ordered comparisons (Gt, Lt, Gte, Lte). Implements `conditionNode`.
- **Notable design:** Parallel implementation to `ConditionEval` with additional comparison operators in `evaluate`/`evaluateWithBase`.

### 115. `(*OrdConditionEval[T]).Then` / `.Else` / `.evaluate` / `.getThen` / `.getElse` / `.setOffset` / `.getOffset` / `.getPtrAddr` / `.evaluateWithBase` (methods)
- **File/Line:** condition.go:174-235
- **What they are:** Methods (mirror of ConditionEval methods)
- **What they do:** Same as ConditionEval equivalents but with full ordered comparison support.

### 116. `conditionNode` (interface)
- **File/Line:** condition.go:238
- **What it is:** Unexported interface
- **What it does:** Interface for the compiler to detect and evaluate condition nodes at compile and render time.
- **Depended on by:** Template compiler

**Methods:**
- `evaluate() bool`
- `evaluateWithBase(base unsafe.Pointer) bool`
- `setOffset(offset uintptr)`
- `getOffset() uintptr`
- `getPtrAddr() uintptr`
- `getThen() any`
- `getElse() any`

### 117. Interface conformance assertions
- **File/Line:** condition.go:249-250
- **What they are:** Compile-time assertions
- **What they do:** `var _ conditionNode = (*ConditionEval[int])(nil)` and `var _ conditionNode = (*OrdConditionEval[int])(nil)` ensure both types implement the interface.

### 118. `SwitchBuilder[T comparable]` (struct)
- **File/Line:** condition.go:253
- **What it is:** Generic struct
- **What it does:** Builder for type-safe multi-way branching (like a switch statement in templates).
- **Dependencies:** `switchCase[T]`

**Fields:**
- `ptr *T` -- pointer to the value being switched on
- `cases []switchCase[T]` -- accumulated case branches
- `def any` -- default branch

### 119. `switchCase[T comparable]` (struct)
- **File/Line:** condition.go:259
- **What it is:** Unexported generic struct
- **What it does:** Pairs a value with a template node for a switch case.

### 120. `Switch[T comparable]` (function)
- **File/Line:** condition.go:270
- **What it is:** Generic constructor function
- **What it does:** Starts a multi-way branch. Type-safe via generics.
- **Depended on by:** User code (e.g., tab routing)

### 121. `(*SwitchBuilder[T]).Case` (method)
- **File/Line:** condition.go:275
- **What it is:** Builder method
- **What it does:** Adds a branch for when `*ptr == val`.

### 122. `(*SwitchBuilder[T]).Default` (method)
- **File/Line:** condition.go:282
- **What it is:** Builder method
- **What it does:** Sets the fallback node and returns a finalized `SwitchNode[T]`.

### 123. `(*SwitchBuilder[T]).End` (method)
- **File/Line:** condition.go:292
- **What it is:** Builder method
- **What it does:** Finalizes without a default (renders nothing if no match).

### 124. `SwitchNode[T comparable]` (struct)
- **File/Line:** condition.go:301
- **What it is:** Generic struct
- **What it does:** Final compiled switch statement. Implements `switchNodeInterface`.

### 125. `switchNodeInterface` (interface)
- **File/Line:** condition.go:308
- **What it is:** Unexported interface
- **What it does:** Interface for the compiler to detect switch nodes.

**Methods:**
- `evaluateSwitch() any` -- runtime: returns matching node
- `getCaseNodes() []any` -- compile-time: returns all case nodes
- `getDefaultNode() any` -- compile-time: returns default node
- `getMatchIndex() int` -- runtime: returns matching case index (-1 for default)

### 126. `(*SwitchNode[T]).evaluateSwitch` / `.getCaseNodes` / `.getDefaultNode` / `.getMatchIndex` (methods)
- **File/Line:** condition.go:315-345
- **What they are:** Methods implementing `switchNodeInterface`
- **What they do:** Evaluate the switch at runtime / return all case nodes for compilation / return default node / return matching index.

### 127. Interface conformance assertion
- **File/Line:** condition.go:347
- **What it is:** `var _ switchNodeInterface = (*SwitchNode[int])(nil)`

---

## FILE: autotable.go

### 128. `ColumnOption` (type)
- **File/Line:** autotable.go:11
- **What it is:** Function type: `func(*ColumnConfig)`
- **What it does:** Configures a single AutoTable column. Used as functional options.
- **Depended on by:** `AutoTableC.Column`, preset functions

### 129. `ColumnConfig` (struct)
- **File/Line:** autotable.go:14
- **What it is:** Exported struct
- **What it does:** Holds rendering configuration for one column -- alignment, format function, style function.

**Fields:**
- `align Align` -- column alignment
- `hasAlign bool` -- true if explicitly set (vs type default)
- `format func(any) string` -- value-to-display-text converter
- `style func(any) Style` -- per-cell style based on value

### 130. `(*ColumnConfig).Align` (method)
- **File/Line:** autotable.go:22
- **What it is:** Method
- **What it does:** Sets column alignment, marks it as explicitly set.

### 131. `(*ColumnConfig).Format` (method)
- **File/Line:** autotable.go:25
- **What it is:** Method
- **What it does:** Sets the value-to-display-text conversion function.

### 132. `(*ColumnConfig).Style` (method)
- **File/Line:** autotable.go:28
- **What it is:** Method
- **What it does:** Sets the per-cell style function.

### 133. `Number` (function)
- **File/Line:** autotable.go:36
- **What it is:** Column preset function returning `ColumnOption`
- **What it does:** Formats numeric values with comma separators. Sets right alignment.
- **Dependencies:** `formatNumber`

### 134. `Currency` (function)
- **File/Line:** autotable.go:48
- **What it is:** Column preset function returning `ColumnOption`
- **What it does:** Formats numeric values with a symbol prefix and comma separators. Sets right alignment.
- **Dependencies:** `formatNumber`

### 135. `Percent` (function)
- **File/Line:** autotable.go:58
- **What it is:** Column preset function returning `ColumnOption`
- **What it does:** Formats numeric values as percentages. Sets right alignment.
- **Dependencies:** `toFloat64`

### 136. `PercentChange` (function)
- **File/Line:** autotable.go:69
- **What it is:** Column preset function returning `ColumnOption`
- **What it does:** Formats numeric values as signed percentages with green/red coloring based on sign.
- **Dependencies:** `toFloat64`, `Green`, `Red`

### 137. `Bytes` (function)
- **File/Line:** autotable.go:90
- **What it is:** Column preset function returning `ColumnOption`
- **What it does:** Formats numeric values as human-readable byte sizes (B, KB, MB, etc.). Sets right alignment.
- **Dependencies:** `formatBytes`, `toFloat64`

### 138. `Bool` (function)
- **File/Line:** autotable.go:100
- **What it is:** Column preset function returning `ColumnOption`
- **What it does:** Formats boolean values with custom labels. Sets center alignment.

### 139. `StyleSign` (function)
- **File/Line:** autotable.go:117
- **What it is:** Style preset function returning `ColumnOption`
- **What it does:** Colors cells based on the numeric sign of the value. Takes positive and negative styles.

### 140. `StyleBool` (function)
- **File/Line:** autotable.go:129
- **What it is:** Style preset function returning `ColumnOption`
- **What it does:** Colors cells based on a boolean value.

### 141. `StyleThreshold` (function)
- **File/Line:** autotable.go:142
- **What it is:** Style preset function returning `ColumnOption`
- **What it does:** Colors cells based on numeric value thresholds: below/between/above with three styles.

### 142. `toFloat64` (function)
- **File/Line:** autotable.go:162
- **What it is:** Unexported helper function
- **What it does:** Converts common Go numeric types to float64 via type switch. Returns 0 for unrecognized types.

### 143. `formatNumber` (function)
- **File/Line:** autotable.go:194
- **What it is:** Unexported helper function
- **What it does:** Formats a numeric value with comma separators.
- **Dependencies:** `toFloat64`, `insertCommas`

### 144. `insertCommas` (function)
- **File/Line:** autotable.go:202
- **What it is:** Unexported helper function
- **What it does:** Adds thousand separators to a numeric string. Handles negatives and decimal points.

### 145. `formatBytes` (function)
- **File/Line:** autotable.go:245
- **What it is:** Unexported helper function
- **What it does:** Converts a byte count to human-readable string (e.g., "1.5 GB"). Uses log-based unit detection.

---

## FILE: log.go

### 146. `LogC` (struct)
- **File/Line:** log.go:12
- **What it is:** Exported struct
- **What it does:** Displays a scrollable log that reads from an `io.Reader`. Lines buffered internally with optional max line limit (ring buffer). Scrolling via underlying `Layer`.
- **Dependencies:** `Layer`, `Buffer`, `binding`, `io.Reader`, `sync.Mutex`, `sync.Once`
- **Depended on by:** `FilterLogC` (filterlog.go), Template compiler

**Fields:**
- `reader io.Reader` -- source reader
- `maxLines int` -- ring buffer limit
- `autoScroll bool` -- auto-scroll to bottom
- `onUpdate func()` -- callback for new lines (for `RequestRender`)
- `grow float32` -- flex grow factor
- `margin [4]int16` -- TRBL margins
- `declaredBindings []binding` -- key bindings
- `layer *Layer` -- internal layer for rendering
- `lines []string` -- buffered lines
- `mu sync.Mutex` -- thread safety
- `started sync.Once` -- goroutine start guard
- `following bool` -- true = auto-scroll active
- `newLineCount int` -- lines arrived while not following

### 147. `Log` (function)
- **File/Line:** log.go:36
- **What it is:** Constructor function
- **What it does:** Creates a `LogC` from an `io.Reader`. Sets defaults: 10000 max lines, auto-scroll on, following.

### 148. `(*LogC).MaxLines` / `.AutoScroll` / `.Grow` / `.Margin` / `.MarginVH` / `.MarginTRBL` (methods)
- **File/Line:** log.go:48-83
- **What they are:** Builder methods
- **What they do:** Configure max line buffer / auto-scroll toggle / flex grow / margins.

### 149. `(*LogC).Layer` (method)
- **File/Line:** log.go:87
- **What it is:** Method
- **What it does:** Returns the underlying layer for manual scroll control.

### 150. `(*LogC).Ref` (method)
- **File/Line:** log.go:92
- **What it is:** Builder method
- **What it does:** Calls function with self for reference capture.

### 151. `(*LogC).NewLines` (method)
- **File/Line:** log.go:99
- **What it is:** Method (thread-safe)
- **What it does:** Returns count of new lines arrived while not following. For "42 new lines ↓" indicators.

### 152. `(*LogC).resume` (method)
- **File/Line:** log.go:106
- **What it is:** Unexported method
- **What it does:** Syncs display to current buffer, resets new line count, scrolls to end, sets following=true.

### 153. `(*LogC).OnUpdate` (method)
- **File/Line:** log.go:119
- **What it is:** Builder method
- **What it does:** Sets callback for when new lines arrive. Intended for `app.RequestRender`.

### 154. `(*LogC).BindNav` / `.BindPageNav` / `.BindFirstLast` (methods)
- **File/Line:** log.go:125-149
- **What they are:** Builder methods
- **What they do:** Register key bindings for line scroll / half-page scroll / top/bottom jump. Scroll-up sets `following=false`. BindFirstLast "last" calls `resume()`.

### 155. `(*LogC).BindVimNav` (method)
- **File/Line:** log.go:153
- **What it is:** Builder method
- **What it does:** Wires standard vim keys: j/k, C-d/C-u, g/G.

### 156. `(*LogC).bindings` (method)
- **File/Line:** log.go:158
- **What it is:** Method implementing `bindable`
- **What it does:** Returns declared bindings.

### 157. `(*LogC).start` (method)
- **File/Line:** log.go:164
- **What it is:** Unexported method
- **What it does:** Starts the background reader goroutine via `go readLoop()`.

### 158. `(*LogC).readLoop` (method)
- **File/Line:** log.go:170
- **What it is:** Unexported method
- **What it does:** Reads lines from reader in background goroutine. Appends to buffer, applies ring buffer truncation if over limit, adjusts scroll position when lines dropped, syncs to layer, auto-scrolls if following, counts new lines if not following, calls onUpdate.
- **Notable design:** Uses `bufio.Scanner` with 1MB max line size. Ring buffer drops oldest lines. Scroll position adjusted when lines are dropped to keep viewing same content.

### 159. `(*LogC).syncToLayer` (method)
- **File/Line:** log.go:222
- **What it is:** Unexported method
- **What it does:** Writes all buffered lines to the layer's buffer. Creates exact-sized buffer (not EnsureSize, which only grows and would break maxScroll after ring buffer truncates).
- **Notable design:** Uses fixed 500-char buffer width. Creates fresh buffer each time rather than growing.

### 160. `(*Template).compileLogC` (method)
- **File/Line:** log.go:238
- **What it is:** Compiler method on `*Template`
- **What it does:** Compiles LogC into the template. Collects pending logs for app wiring, starts reader goroutine once, compiles as LayerView.
- **Dependencies:** `LayerView`, `compileLayerViewC`

---

## FILE: theme.go

### 161. `ThemeEx` (struct)
- **File/Line:** theme.go:5
- **What it is:** Exported struct
- **What it does:** Provides a set of styles for consistent UI appearance. Used with `CascadeStyle` on containers.
- **Dependencies:** `Style`

**Fields:**
- `Base Style` -- default text style
- `Muted Style` -- de-emphasized text
- `Accent Style` -- highlighted/important text
- `Error Style` -- error messages
- `Border Style` -- border/divider style

### 162. `ThemeDark` (variable)
- **File/Line:** theme.go:16
- **What it is:** Exported package-level variable
- **What it does:** Dark theme preset: white text, BrightBlack muted, BrightCyan accent, BrightRed error, BrightBlack border.

### 163. `ThemeLight` (variable)
- **File/Line:** theme.go:25
- **What it is:** Exported package-level variable
- **What it does:** Light theme preset: black text, BrightBlack muted, Blue accent, Red error, White border.

### 164. `ThemeMonochrome` (variable)
- **File/Line:** theme.go:34
- **What it is:** Exported package-level variable
- **What it does:** Minimal theme using only attributes: no colors, dim muted, bold accent, bold+underline error, dim border.

---

## FILE: components.go

### 165. `binding` (struct)
- **File/Line:** components.go:10
- **What it is:** Unexported struct
- **What it does:** Represents a declared key binding on a component. Stored as data during construction, wired to a router during setup.
- **Depended on by:** All bindable components (`ListC`, `FilterListC`, `LogC`, `AutoTableC`, `CheckboxC`, `RadioC`, `CheckListC`, `FilterLogC`)

**Fields:**
- `pattern string` -- key pattern (e.g., "j", "<C-d>", "<Enter>")
- `handler any` -- handler function (various signatures supported)

### 166. `textInputBinding` (struct)
- **File/Line:** components.go:16
- **What it is:** Unexported struct
- **What it does:** Represents an InputC that wants unmatched keys routed to it for text editing.
- **Depended on by:** `InputC`, `FilterListC`, `FilterLogC`, `FocusManager`

**Fields:**
- `value *string` -- pointer to the input value
- `cursor *int` -- pointer to cursor position
- `onChange func(string)` -- optional callback when value changes

### 167. `Define` (function)
- **File/Line:** components.go:49
- **What it is:** Exported function
- **What it does:** Creates a scoped block for local component helpers and styles. Runs once at compile time (when SetView is called). Just calls `fn()` and returns the result.
- **Notable design:** Simple but powerful -- allows users to define local helper functions and styles that run at template compile time while pointer bindings remain dynamic at render time.

### 168. `VBoxC` (struct)
- **File/Line:** components.go:57
- **What it is:** Exported struct (value type)
- **What it does:** Vertical container component data.

**Fields:**
- `fill Color` -- background fill color
- `inheritStyle *Style` -- cascaded style for children
- `gap int8` -- gap between children
- `border BorderStyle` -- border configuration
- `borderFG *Color` -- border foreground override
- `borderBG *Color` -- border background override
- `title string` -- border title
- `width int16` -- explicit width
- `height int16` -- explicit height
- `percentWidth float32` -- percentage width
- `flexGrow float32` -- flex grow factor
- `fitContent bool` -- size to content
- `margin [4]int16` -- TRBL margin
- `children []any` -- child nodes

### 169. `VBoxFn` (type)
- **File/Line:** components.go:74
- **What it is:** Function type: `func(children ...any) VBoxC`
- **What it does:** The callable type for VBox. Methods on VBoxFn return new VBoxFn values creating a closure chain.
- **Notable design:** Function-type-with-methods pattern. `VBox(children...)` is the simple call. `VBox.Fill(c).Gap(2)(children...)` chains options then calls. Each method wraps the previous function with an additional field set.

### 170. `VBoxFn` methods: `.Fill` / `.CascadeStyle` / `.Gap` / `.Border` / `.BorderFG` / `.BorderBG` / `.Title` / `.Width` / `.Height` / `.Size` / `.WidthPct` / `.Grow` / `.FitContent` / `.Margin` / `.MarginVH` / `.MarginTRBL`
- **File/Line:** components.go:76-203
- **What they are:** Methods on `VBoxFn` returning `VBoxFn`
- **What they do:** Each wraps the function to set the corresponding field on VBoxC.

### 171. `VBox` (variable)
- **File/Line:** components.go:206
- **What it is:** Exported package-level variable of type `VBoxFn`
- **What it does:** The vertical container constructor entry point.

### 172. `HBoxC` (struct)
- **File/Line:** components.go:214
- **What it is:** Exported struct (value type)
- **What it does:** Horizontal container component data. Same fields as VBoxC.

### 173. `HBoxFn` (type)
- **File/Line:** components.go:231
- **What it is:** Function type: `func(children ...any) HBoxC`
- **What it does:** Callable type for HBox. Same pattern as VBoxFn.

### 174. `HBoxFn` methods: `.Fill` / `.CascadeStyle` / `.Gap` / `.Border` / `.BorderFG` / `.BorderBG` / `.Title` / `.Width` / `.Height` / `.Size` / `.WidthPct` / `.Grow` / `.FitContent` / `.Margin` / `.MarginVH` / `.MarginTRBL`
- **File/Line:** components.go:233-359
- **What they are:** Methods on `HBoxFn` returning `HBoxFn`

### 175. `HBox` (variable)
- **File/Line:** components.go:363
- **What it is:** Exported package-level variable of type `HBoxFn`
- **What it does:** The horizontal container constructor entry point.

### 176. `Arrange` (function)
- **File/Line:** components.go:378
- **What it is:** Exported function
- **What it does:** Creates a container with a custom `LayoutFunc`. Returns a function that takes children and returns a `Box`.
- **Dependencies:** `LayoutFunc`, `Box`

### 177. `Widget` (function)
- **File/Line:** components.go:397
- **What it is:** Exported function
- **What it does:** Creates a fully custom component with explicit measure and render functions. Returns a `Custom` struct.
- **Dependencies:** `Custom`, `Buffer`

### 178. `TextC` (struct)
- **File/Line:** components.go:408
- **What it is:** Exported struct (value type)
- **What it does:** Text display component data.

**Fields:**
- `content any` -- string or *string
- `style Style` -- text style
- `width int16` -- explicit width (0 = content-sized)

### 179. `Text` (function)
- **File/Line:** components.go:414
- **What it is:** Constructor function
- **What it does:** Creates a TextC with the given content.

### 180. `TextC` methods: `.Style` / `.FG` / `.BG` / `.Bold` / `.Dim` / `.Italic` / `.Underline` / `.Inverse` / `.Strikethrough` / `.Width` / `.Margin` / `.MarginVH` / `.MarginTRBL`
- **File/Line:** components.go:418-470
- **What they are:** Builder methods on TextC (value receiver, return TextC)
- **What they do:** Style, color, attribute, width, and margin configuration.

### 181. `SpacerC` (struct)
- **File/Line:** components.go:476
- **What it is:** Exported struct (value type)
- **What it does:** Empty space component.

**Fields:**
- `width int16`, `height int16` -- dimensions
- `char rune` -- optional fill character
- `style Style` -- styling
- `flexGrow float32` -- flex grow factor

### 182. `Space` / `SpaceH` / `SpaceW` (functions)
- **File/Line:** components.go:484, 488, 492
- **What they are:** Constructor functions
- **What they do:** Create spacers: empty, height-only, width-only.

### 183. `SpacerC` methods: `.Width` / `.Height` / `.Char` / `.Style` / `.Grow` / `.Margin` / `.MarginVH` / `.MarginTRBL`
- **File/Line:** components.go:496-526
- **What they are:** Builder methods on SpacerC

### 184. `HRuleC` (struct)
- **File/Line:** components.go:532
- **What it is:** Exported struct (value type)
- **What it does:** Horizontal rule component.

**Fields:**
- `char rune` -- rule character (default '─')
- `style Style`

### 185. `HRule` (function)
- **File/Line:** components.go:537
- **What it is:** Constructor function
- **What it does:** Creates a horizontal rule with default '─' character.

### 186. `HRuleC` methods: `.Char` / `.Style` / `.FG` / `.BG` / `.Bold` / `.Margin` / `.MarginVH` / `.MarginTRBL`
- **File/Line:** components.go:541-557

### 187. `VRuleC` (struct)
- **File/Line:** components.go:563
- **What it is:** Exported struct (value type)
- **What it does:** Vertical rule component.

**Fields:**
- `char rune` -- rule character (default '│')
- `style Style`
- `height int16` -- explicit height

### 188. `VRule` (function)
- **File/Line:** components.go:569
- **What it is:** Constructor function
- **What it does:** Creates a vertical rule with default '│' character.

### 189. `VRuleC` methods: `.Char` / `.Style` / `.FG` / `.BG` / `.Bold` / `.Height` / `.Margin` / `.MarginVH` / `.MarginTRBL`
- **File/Line:** components.go:573-594

### 190. `ProgressC` (struct)
- **File/Line:** components.go:600
- **What it is:** Exported struct (value type)
- **What it does:** Progress bar component.

**Fields:**
- `value any` -- int (0-100) or *int for dynamic binding
- `width int16` -- bar width
- `style Style`

### 191. `Progress` (function)
- **File/Line:** components.go:606
- **What it is:** Constructor function
- **What it does:** Creates a progress bar with the given value (int or *int).

### 192. `ProgressC` methods: `.Width` / `.Style` / `.FG` / `.BG` / `.Bold` / `.Margin` / `.MarginVH` / `.MarginTRBL`
- **File/Line:** components.go:610-632

### 193. `SpinnerC` (struct)
- **File/Line:** components.go:638
- **What it is:** Exported struct (value type)
- **What it does:** Animated spinner component.

**Fields:**
- `frame *int` -- pointer to current frame index
- `frames []string` -- animation frames
- `style Style`

### 194. `Spinner` (function)
- **File/Line:** components.go:644
- **What it is:** Constructor function
- **What it does:** Creates a spinner bound to a frame pointer. Default frames: `SpinnerBraille`.

### 195. `SpinnerC` methods: `.Frames` / `.Style` / `.FG` / `.BG` / `.Bold` / `.Margin` / `.MarginVH` / `.MarginTRBL`
- **File/Line:** components.go:648-667

### 196. `LeaderC` (struct)
- **File/Line:** components.go:673
- **What it is:** Exported struct (value type)
- **What it does:** "Label.....Value" display with dots filling the space.

**Fields:**
- `label any` -- string or *string
- `value any` -- string or *string
- `width int16` -- total width (0 = fill)
- `fill rune` -- fill character (default '.')
- `style Style`

### 197. `Leader` (function)
- **File/Line:** components.go:681
- **What it is:** Constructor function
- **What it does:** Creates a leader with label and value, default '.' fill.

### 198. `LeaderC` methods: `.Width` / `.Fill` / `.Style` / `.FG` / `.BG` / `.Bold` / `.Margin` / `.MarginVH` / `.MarginTRBL`
- **File/Line:** components.go:685-709

### 199. `SparklineC` (struct)
- **File/Line:** components.go:715
- **What it is:** Exported struct (value type)
- **What it does:** Mini chart / sparkline component.

**Fields:**
- `values any` -- `[]float64` or `*[]float64` for dynamic binding
- `width int16` -- display width
- `min float64` -- range minimum
- `max float64` -- range maximum
- `style Style`

### 200. `Sparkline` (function)
- **File/Line:** components.go:723
- **What it is:** Constructor function
- **What it does:** Creates a sparkline with the given values.

### 201. `SparklineC` methods: `.Width` / `.Range` / `.Style` / `.FG` / `.BG` / `.Bold` / `.Margin` / `.MarginVH` / `.MarginTRBL`
- **File/Line:** components.go:727-755

### 202. `JumpC` (struct)
- **File/Line:** components.go:761
- **What it is:** Exported struct (value type)
- **What it does:** Wraps a child component to make it a jump target.

**Fields:**
- `child any` -- the wrapped component
- `onSelect func()` -- callback when this target is selected
- `style Style` -- optional per-target label style
- `margin [4]int16`

### 203. `Jump` (function)
- **File/Line:** components.go:768
- **What it is:** Constructor function
- **What it does:** Creates a JumpC wrapping a child with a selection callback.
- **Dependencies:** `JumpTarget`, `JumpMode`

### 204. `JumpC` methods: `.Style` / `.Margin` / `.MarginVH` / `.MarginTRBL`
- **File/Line:** components.go:772-779

### 205. `LayerViewC` (struct)
- **File/Line:** components.go:785
- **What it is:** Exported struct (value type)
- **What it does:** Component for displaying a pre-rendered `Layer` in the template tree.

**Fields:**
- `layer *Layer` -- the pre-rendered layer
- `viewHeight int16` -- viewport height
- `viewWidth int16` -- viewport width
- `flexGrow float32` -- flex grow factor
- `margin [4]int16`

### 206. `LayerView` (function)
- **File/Line:** components.go:793
- **What it is:** Constructor function
- **What it does:** Creates a `LayerViewC` for the given layer.

### 207. `LayerViewC` methods: `.ViewHeight` / `.ViewWidth` / `.Grow` / `.Margin` / `.MarginVH` / `.MarginTRBL`
- **File/Line:** components.go:797-817

### 208. `OverlayC` (struct)
- **File/Line:** components.go:823
- **What it is:** Exported struct (value type)
- **What it does:** Modal/popup overlay component.

**Fields:**
- `centered bool` -- center on screen
- `backdrop bool` -- draw dimmed backdrop behind
- `x, y int` -- explicit position
- `width, height int` -- explicit dimensions
- `backdropFG Color` -- backdrop dim color
- `bg Color` -- background color for content area
- `children []any`

### 209. `OverlayFn` (type)
- **File/Line:** components.go:834
- **What it is:** Function type: `func(children ...any) OverlayC`
- **What it does:** Callable type for Overlay. Same function-type-with-methods pattern as VBox/HBox.

### 210. `OverlayFn` methods: `.Centered` / `.Backdrop` / `.At` / `.Size` / `.BG` / `.BackdropFG`
- **File/Line:** components.go:836-884
- **What they are:** Methods on `OverlayFn` returning `OverlayFn`

### 211. `Overlay` (variable)
- **File/Line:** components.go:886
- **What it is:** Exported package-level variable of type `OverlayFn`
- **What it does:** The overlay constructor entry point.

### 212. `ForEachC[T any]` (struct)
- **File/Line:** components.go:894
- **What it is:** Generic struct (value type)
- **What it does:** List rendering component. Iterates over a slice and renders each item.
- **Dependencies:** `forEachCompiler` interface, `ForEachNode`

**Fields:**
- `items *[]T` -- pointer to slice
- `template func(item *T) any` -- per-item render function

### 213. `ForEach[T any]` (function)
- **File/Line:** components.go:899
- **What it is:** Generic constructor function
- **What it does:** Creates a `ForEachC[T]` for iterating over a slice with a render function.

### 214. `(ForEachC[T]).compileTo` (method)
- **File/Line:** components.go:904
- **What it is:** Method implementing `forEachCompiler` interface
- **What it does:** Compiles ForEach into the template by creating a `ForEachNode` and calling `t.compileForEach`.

### 215. `ListC[T any]` (struct)
- **File/Line:** components.go:912
- **What it is:** Generic struct (pointer type via pointer receiver methods)
- **What it does:** Navigable list with selection, custom rendering, and key bindings.
- **Dependencies:** `SelectionList`, `binding`
- **Depended on by:** `FilterListC`

**Fields:**
- `items *[]T` -- pointer to item slice
- `selected *int` -- pointer to selection index
- `internalSel int` -- internal selection when no external provided
- `render func(*T) any` -- custom render function
- `marker string` -- selection marker (default "> ")
- `markerStyle Style` -- marker text style
- `maxVisible int` -- max visible items
- `style Style` -- default row style
- `selectedStyle Style` -- selected row style
- `cached *SelectionList` -- cached internal SelectionList instance
- `declaredBindings []binding` -- key bindings

### 216. `List[T any]` (function)
- **File/Line:** components.go:928
- **What it is:** Generic constructor function
- **What it does:** Creates a `ListC[T]` with internal selection management, default marker "> ".
- **Notable design:** Uses `l.selected = &l.internalSel` so selection is internal by default but can be externalized via `.Selection()`.

### 217. `(*ListC[T]).Ref` (method)
- **File/Line:** components.go:937

### 218. `(*ListC[T]).Selection` (method)
- **File/Line:** components.go:940
- **What it is:** Builder method
- **What it does:** Binds the selection index to an external pointer (replaces internal selection).

### 219. `(*ListC[T]).Selected` (method)
- **File/Line:** components.go:946
- **What it is:** Method
- **What it does:** Returns pointer to currently selected item, or nil if empty/out-of-bounds.

### 220. `(*ListC[T]).Index` / `.SetIndex` (methods)
- **File/Line:** components.go:958, 963
- **What they are:** Methods
- **What they do:** Get/set the selection index.

### 221. `(*ListC[T]).ClampSelection` (method)
- **File/Line:** components.go:968
- **What it is:** Method
- **What it does:** Ensures the selection index is within bounds of the current items slice.

### 222. `(*ListC[T]).Delete` (method)
- **File/Line:** components.go:983
- **What it is:** Method
- **What it does:** Removes the currently selected item from the slice and adjusts selection.

### 223. `(*ListC[T]).Render` / `.Marker` / `.MarkerStyle` / `.MaxVisible` / `.Style` / `.SelectedStyle` / `.Margin` / `.MarginVH` / `.MarginTRBL` (methods)
- **File/Line:** components.go:998-1046
- **What they are:** Builder methods

### 224. `(*ListC[T]).toSelectionList` (method)
- **File/Line:** components.go:1050
- **What it is:** Unexported method
- **What it does:** Returns the internal `SelectionList` (creates on first call). Same instance returned for both template compilation and method calls (cached).
- **Dependencies:** `SelectionList`
- **Notable design:** Lazy initialization with caching ensures consistent reference.

### 225. `(*ListC[T]).Up` / `.Down` / `.PageUp` / `.PageDown` / `.First` / `.Last` (methods)
- **File/Line:** components.go:1067-1082
- **What they are:** Navigation methods
- **What they do:** Delegate to the cached `SelectionList`'s corresponding methods.

### 226. `(*ListC[T]).BindNav` / `.BindPageNav` / `.BindFirstLast` / `.BindVimNav` / `.BindDelete` (methods)
- **File/Line:** components.go:1084-1119
- **What they are:** Builder methods
- **What they do:** Register navigation/action key bindings.
- **Notable design:** `.BindVimNav()` chains `.BindNav("j","k").BindPageNav("<C-d>","<C-u>").BindFirstLast("g","G")`.

### 227. `(*ListC[T]).Handle` (method)
- **File/Line:** components.go:1123
- **What it is:** Builder method
- **What it does:** Registers a key binding that passes the currently selected item pointer to the callback. No-op if nothing selected.

### 228. `(*ListC[T]).bindings` (method)
- **File/Line:** components.go:1134
- **What it is:** Method implementing `bindable`

### 229. `TabsC` (struct)
- **File/Line:** components.go:1140
- **What it is:** Exported struct (value type)
- **What it does:** Tab header display component.

**Fields:**
- `labels []string` -- tab label text
- `selected *int` -- pointer to selected tab index
- `tabStyle TabsStyle` -- visual style variant
- `gap int8` -- gap between tabs (default 2)
- `activeStyle Style` -- style for active tab
- `inactiveStyle Style` -- style for inactive tabs
- `margin [4]int16`

### 230. `Tabs` (function)
- **File/Line:** components.go:1150
- **What it is:** Constructor function
- **What it does:** Creates tab headers bound to a selection pointer, default gap 2.

### 231. `TabsC` methods: `.Kind` / `.Gap` / `.ActiveStyle` / `.InactiveStyle` / `.Margin` / `.MarginVH` / `.MarginTRBL`
- **File/Line:** components.go:1154-1176

### 232. `ScrollbarC` (struct)
- **File/Line:** components.go:1182
- **What it is:** Exported struct (value type)
- **What it does:** Visual scroll indicator component (vertical or horizontal).

**Fields:**
- `contentSize int` -- total content size
- `viewSize int` -- visible viewport
- `position *int` -- pointer to scroll position
- `length int16` -- scrollbar length (0 = fill)
- `horizontal bool` -- orientation
- `trackChar rune` -- track character (default '│')
- `thumbChar rune` -- thumb character (default '█')
- `trackStyle Style`
- `thumbStyle Style`
- `margin [4]int16`

### 233. `Scroll` (function)
- **File/Line:** components.go:1195
- **What it is:** Constructor function
- **What it does:** Creates a scrollbar with content size, view size, and position pointer.

### 234. `ScrollbarC` methods: `.Length` / `.Horizontal` / `.TrackChar` / `.ThumbChar` / `.TrackStyle` / `.ThumbStyle` / `.Margin` / `.MarginVH` / `.MarginTRBL`
- **File/Line:** components.go:1205-1241

### 235. `AutoTableC` (struct)
- **File/Line:** components.go:1297
- **What it is:** Exported struct (value type)
- **What it does:** Automatic table from slice of structs. Supports column selection, custom headers, per-column formatting, sorting via jump labels, and viewport scrolling.
- **Dependencies:** `autoTableSortState`, `autoTableScroll`, `ColumnOption`, `binding`, `reflect`

**Fields:**
- `data any` -- slice of structs (pointer)
- `columns []string` -- field names to display
- `headers []string` -- custom header names
- `headerStyle Style` -- header row style (default bold)
- `rowStyle Style` -- data row style
- `altRowStyle *Style` -- alternating row style
- `gap int8` -- column gap (default 1)
- `border BorderStyle`
- `margin [4]int16`
- `columnConfigs map[string]ColumnOption` -- per-column config by field name
- `sortState *autoTableSortState` -- nil unless Sortable called
- `scroll *autoTableScroll` -- nil unless Scrollable called
- `declaredBindings []binding`

### 236. `autoTableSortState` (struct)
- **File/Line:** components.go:1249
- **What it is:** Unexported struct
- **What it does:** Tracks the current sort column and direction for AutoTable.

**Fields:**
- `col int` -- -1 = unsorted, 0..n-1 = column index
- `asc bool` -- true = ascending

### 237. `autoTableScroll` (struct)
- **File/Line:** components.go:1256
- **What it is:** Unexported struct
- **What it does:** Manages viewport scrolling for AutoTable. Renders all rows to internal buffer, blits visible window to screen.

**Fields:**
- `offset int` -- first visible data row
- `maxVisible int` -- viewport height in data rows
- `buf *Buffer` -- internal buffer for all data rows
- `bufW int` -- width for resize detection

### 238. `(*autoTableScroll).scrollDown` / `.scrollUp` / `.pageDown` / `.pageUp` / `.clamp` (methods)
- **File/Line:** components.go:1263-1295
- **What they are:** Scroll management methods
- **What they do:** Scroll by n rows / scroll up / page down / page up / clamp offset to valid range.

### 239. `AutoTable` (function)
- **File/Line:** components.go:1317
- **What it is:** Constructor function
- **What it does:** Creates an AutoTable from any slice of structs. Default header style bold, gap 1.

### 240. `AutoTableC` methods: `.Columns` / `.Headers` / `.Column` / `.HeaderStyle` / `.RowStyle` / `.AltRowStyle` / `.Gap` / `.Border` / `.Margin` / `.MarginVH` / `.MarginTRBL` / `.Sortable` / `.Scrollable` / `.BindNav` / `.BindPageNav` / `.BindVimNav` / `.bindings`
- **File/Line:** components.go:1327-1462
- **What they are:** Builder and accessor methods
- **Notable design:** `.Sortable()` creates a shared `autoTableSortState` pointer. `.Scrollable(n)` creates a shared `autoTableScroll` pointer. Both use pointer sharing so value-type copies all reference the same state. `.BindNav`/`.BindPageNav` closures capture scroll pointer and data pointer, reading current slice length at invocation time.

### 241. `autoTableSort` (function)
- **File/Line:** components.go:1465
- **What it is:** Unexported function
- **What it does:** Sorts a `*[]T` slice in-place by the given struct field index using reflection.
- **Dependencies:** `reflect`, `sortSliceReflect`

### 242. `sortSliceReflect` (function)
- **File/Line:** components.go:1495
- **What it is:** Unexported function
- **What it does:** Sorts reflected values by a struct field using insertion sort (tables are typically small).
- **Dependencies:** `derefValue`, `compareValues`

### 243. `derefValue` (function)
- **File/Line:** components.go:1514
- **What it is:** Unexported function
- **What it does:** Dereferences a pointer Value, or returns the value unchanged.

### 244. `compareValues` (function)
- **File/Line:** components.go:1523
- **What it is:** Unexported function
- **What it does:** Compares two reflected values. Handles int/uint/float/string natively, falls back to `fmt.Sprintf` string comparison.

### 245. `CheckboxC` (struct)
- **File/Line:** components.go:1580
- **What it is:** Exported struct (pointer type)
- **What it does:** Toggleable checkbox bound to a `*bool`.

**Fields:**
- `checked *bool` -- bound state
- `label string` -- static label
- `labelPtr *string` -- dynamic label
- `checkedMark string` -- checked display (default "☑")
- `unchecked string` -- unchecked display (default "☐")
- `style Style`
- `declaredBindings []binding`

### 246. `Checkbox` (function)
- **File/Line:** components.go:1591
- **What it is:** Constructor function
- **What it does:** Creates a checkbox bound to a bool pointer with a static label.

### 247. `CheckboxPtr` (function)
- **File/Line:** components.go:1601
- **What it is:** Constructor function
- **What it does:** Creates a checkbox with a dynamic label (`*string`).

### 248. `(*CheckboxC)` methods: `.Ref` / `.Marks` / `.Style` / `.Margin` / `.MarginVH` / `.MarginTRBL` / `.BindToggle` / `.bindings` / `.Toggle` / `.Checked`
- **File/Line:** components.go:1610-1655
- **What they do:** Configuration, toggle key binding, state access.

### 249. `RadioC` (struct)
- **File/Line:** components.go:1658
- **What it is:** Exported struct (pointer type)
- **What it does:** Single-selection radio group bound to `*int` (selected index).

**Fields:**
- `selected *int` -- bound selection index
- `options []string` -- static options
- `optionsPtr *[]string` -- dynamic options
- `selectedMark string` -- selected display (default "◉")
- `unselected string` -- unselected display (default "○")
- `style Style`
- `gap int8` -- spacing between options
- `horizontal bool` -- horizontal layout
- `declaredBindings []binding`

### 250. `Radio` (function)
- **File/Line:** components.go:1671
- **What it is:** Constructor function
- **What it does:** Creates a radio group with static options.

### 251. `RadioPtr` (function)
- **File/Line:** components.go:1681
- **What it is:** Constructor function
- **What it does:** Creates a radio group with dynamic options (`*[]string`).

### 252. `(*RadioC)` methods: `.Ref` / `.Marks` / `.Style` / `.Margin` / `.MarginVH` / `.MarginTRBL` / `.Gap` / `.Horizontal` / `.BindNav` / `.bindings` / `.Next` / `.Prev` / `.Selected` / `.Index` / `.getOptions`
- **File/Line:** components.go:1690-1772

### 253. `CheckListC[T any]` (struct)
- **File/Line:** components.go:1775
- **What it is:** Generic struct (pointer type)
- **What it does:** List with per-item checkboxes. Uses struct tags (`glyph:"checked"`, `glyph:"render"`) for automatic field inference.
- **Dependencies:** `SelectionList`, `binding`, `reflect`

**Fields:**
- `items *[]T` -- item slice pointer
- `checked func(*T) *bool` -- gets checked state pointer per item
- `render func(*T) any` -- custom render per item
- `selected *int` -- selection index pointer
- `internalSel int` -- internal selection
- `checkedMark string` -- default "☑"
- `uncheckedMark string` -- default "☐"
- `marker string` -- selection marker (default "> ")
- `markerStyle Style`
- `style Style`
- `selectedStyle Style`
- `gap int8`
- `declaredBindings []binding`
- `cached *SelectionList`

### 254. `CheckList[T any]` (function)
- **File/Line:** components.go:1793
- **What it is:** Generic constructor function
- **What it does:** Creates a `CheckListC[T]` with defaults.

### 255. `(*CheckListC[T])` builder methods: `.Checked` / `.Render` / `.Marks` / `.Marker` / `.MarkerStyle` / `.Style` / `.SelectedStyle` / `.Margin` / `.MarginVH` / `.MarginTRBL` / `.Gap`
- **File/Line:** components.go:1805-1862

### 256. `(*CheckListC[T])` navigation methods: `.BindNav` / `.BindPageNav` / `.BindFirstLast` / `.BindVimNav` / `.BindToggle` / `.BindDelete` / `.Handle` / `.bindings` / `.Ref`
- **File/Line:** components.go:1864-1930
- **Notable design for `.BindToggle`:** Gets the checked bool pointer for the selected item and flips it.

### 257. `(*CheckListC[T]).Selected` / `.Index` / `.Delete` (methods)
- **File/Line:** components.go:1933-1962

### 258. `(*CheckListC[T]).Up` / `.Down` / `.PageUp` / `.PageDown` / `.First` / `.Last` (methods)
- **File/Line:** components.go:1964-1969
- **What they do:** Delegate to cached SelectionList.

### 259. `(*CheckListC[T]).toSelectionList` (method)
- **File/Line:** components.go:1971
- **What it is:** Unexported method
- **What it does:** Creates the internal SelectionList with checkbox-aware rendering. Uses struct tag reflection to auto-detect `glyph:"checked"` and `glyph:"render"` fields if not explicitly set.
- **Notable design:** Automatic struct tag inference is a one-time operation at first call. Builds a render function that composes `If(checkedFn(...)).Then(checkedMark).Else(uncheckedMark)` with the render function in an HBox.

### 260. `InputC` (struct)
- **File/Line:** components.go:2038
- **What it is:** Exported struct (pointer type)
- **What it does:** Text input with internal state management. Implements `focusable`.
- **Dependencies:** `InputState`, `textInputBinding`, `FocusManager`, `TextInput`

**Fields:**
- `field InputState` -- internal state (value + cursor)
- `placeholder string`
- `width int`
- `mask rune` -- password mask character
- `style Style`
- `declaredTIB *textInputBinding` -- text input binding
- `focused bool` -- focus state
- `manager *FocusManager` -- optional focus manager

### 261. `Input` (function)
- **File/Line:** components.go:2052
- **What it is:** Constructor function
- **What it does:** Creates a text input with internal state.
- **Depended on by:** `FilterListC`, `FilterLogC`

### 262. `(*InputC)` builder methods: `.Ref` / `.Placeholder` / `.Width` / `.Mask` / `.Style` / `.Margin` / `.MarginVH` / `.MarginTRBL` / `.Bind`
- **File/Line:** components.go:2056-2102
- **Notable design for `.Bind`:** Creates a `textInputBinding` pointing to the internal field's Value and Cursor. This is how keystroke routing is wired.

### 263. `(*InputC).textBinding` (method)
- **File/Line:** components.go:2104
- **What it is:** Method implementing `textInputBindable`

### 264. `(*InputC).ManagedBy` (method)
- **File/Line:** components.go:2108
- **What it is:** Builder method
- **What it does:** Registers this input with a `FocusManager`. Creates the TIB and calls `fm.Register(i)`.

### 265. `(*InputC).focusBinding` / `.setFocused` (methods)
- **File/Line:** components.go:2120, 2125
- **What they are:** Methods implementing `focusable` interface

### 266. `(*InputC).Focused` / `.Value` / `.SetValue` / `.Clear` / `.State` (methods)
- **File/Line:** components.go:2130-2153
- **What they do:** State access methods.

### 267. `(*InputC).toTextInput` (method)
- **File/Line:** components.go:2156
- **What it is:** Unexported method
- **What it does:** Converts to the underlying `TextInput` struct for rendering. If managed by FocusManager, sets the Focused pointer for cursor visibility.

---

## FILE: tui.go (relevant items for this catalogue)

### 268. `SpinnerBraille` / `SpinnerDots` / `SpinnerLine` / `SpinnerCircle` (variables)
- **File/Line:** tui.go:368, 371, 374, 377
- **What they are:** Exported package-level variables (`[]string`)
- **What they do:** Pre-defined spinner animation frame sets.

### 269. `TabsStyle` (type + constants)
- **File/Line:** tui.go:394-399
- **What it is:** Exported type (`uint8`) and const block
- **What it does:** Defines visual style variants for tab headers: `TabsStyleUnderline`, `TabsStyleBox`, `TabsStyleBracket`.

### 270. `SelectionList` (struct)
- **File/Line:** tui.go:622
- **What it is:** Exported struct
- **What it does:** Low-level selection list used internally by `ListC` and `CheckListC`. Handles scrolling, selection movement, and visible windowing.
- **Dependencies:** `Style`
- **Depended on by:** `ListC.toSelectionList`, `CheckListC.toSelectionList`

**Fields:**
- `Items any` -- `*[]T` pointer to slice
- `Selected *int` -- selection index pointer
- `Marker string` -- selection marker text
- `MarkerStyle Style`
- `Render any` -- `func(*T) any` optional render function
- `MaxVisible int` -- max visible items
- `Style Style` -- default row style
- `SelectedStyle Style` -- selected row style
- `len int` -- cached length
- `offset int` -- scroll offset

### 271. `(*SelectionList).ensureVisible` / `.Up` / `.Down` / `.PageUp` / `.PageDown` / `.First` / `.Last` (methods)
- **File/Line:** tui.go:636-711
- **What they are:** Navigation methods
- **What they do:** Adjust scroll offset / move selection up/down/page/first/last with ensureVisible.
- **Notable design:** All navigation methods take `m any` parameter (unused, for uniform handler signature compatibility).

### 272. `InputState` (struct)
- **File/Line:** tui.go:787
- **What it is:** Exported struct
- **What it does:** Bundles text input state: value and cursor position.
- **Depended on by:** `InputC`, `TextInput`

**Fields:**
- `Value string`
- `Cursor int`

### 273. `(*InputState).Clear` (method)
- **File/Line:** tui.go:793

### 274. `FocusGroup` (struct)
- **File/Line:** tui.go:800
- **What it is:** Exported struct
- **What it does:** Tracks which field in a group is focused. Older API, simpler than `FocusManager`.

**Fields:**
- `Current int`

### 275. `TextInput` (struct)
- **File/Line:** tui.go:816
- **What it is:** Exported struct
- **What it does:** Low-level single-line text input field. Supports both field-based API (InputState+FocusGroup) and pointer-based API.
- **Depended on by:** `InputC.toTextInput`

**Fields:**
- `Field *InputState` -- bundles Value+Cursor
- `FocusGroup *FocusGroup` -- shared focus tracker
- `FocusIndex int` -- this field's index in focus group
- `Value *string` -- pointer API
- `Cursor *int` -- pointer API
- `Focused *bool` -- pointer API cursor visibility
- `Placeholder string`
- `Width int`
- `Mask rune`
- `Style Style`
- `PlaceholderStyle Style`
- `CursorStyle Style`

### 276. `Align` (type + constants)
- **File/Line:** tui.go:283-289
- **What it is:** Exported type (`uint8`) and const block
- **What it does:** Specifies text alignment: `AlignLeft`, `AlignRight`, `AlignCenter`.

### 277. `Flex` (struct)
- **File/Line:** tui.go:258
- **What it is:** Exported struct
- **What it does:** Layout properties for flex positioning: percentage width, explicit width/height, flex grow factor.
- **Depended on by:** `TextNode`, `ProgressNode`, `LayerViewNode`, `RichTextNode` (embedded)

### 278. `Custom` (struct)
- **File/Line:** tui.go:436
- **What it is:** Exported struct
- **What it does:** Fully custom component with measure and render callbacks. Escape hatch for specialized widgets.
- **Depended on by:** `Widget` function

### 279. `Span` (struct)
- **File/Line:** tui.go:714
- **What it is:** Exported struct
- **What it does:** Styled text segment within RichText or Layer line operations.

**Fields:**
- `Text string`
- `Style Style`

### 280. `Rich` / `Styled` / `Bold` / `Dim` / `Italic` / `Underline` / `Inverse` / `FG` / `BG` (functions)
- **File/Line:** tui.go:732-783
- **What they are:** Helper functions for creating styled text spans
- **What they do:** Create Span values with various styles applied.

### 281. `OverlayNode` (struct)
- **File/Line:** tui.go:841
- **What it is:** Exported struct
- **What it does:** Low-level overlay node for the template compiler. The `OverlayC`/`OverlayFn` higher-level API compiles down to this.

---

## FILE: focusmanager.go

### 282. `focusable` (interface)
- **File/Line:** focusmanager.go:6
- **What it is:** Unexported interface
- **What it does:** Implemented by components that can receive keyboard focus.
- **Depended on by:** `FocusManager`

**Methods:**
- `focusBinding() *textInputBinding`
- `setFocused(focused bool)`

### 283. `FocusManager` (struct)
- **File/Line:** focusmanager.go:23
- **What it is:** Exported struct
- **What it does:** Coordinates keyboard focus across multiple components. Wires Tab/Shift-Tab cycling and routes keystrokes to the currently focused component.
- **Dependencies:** `focusable`, `focusItem`, `textInputBinding`, `riffkey.TextHandler`, `riffkey.Key`, `binding`
- **Depended on by:** `InputC.ManagedBy`, `FilterLogC.ManagedBy`

**Fields:**
- `items []*focusItem` -- registered focusable components
- `current int` -- currently focused index
- `handlers []*riffkey.TextHandler` -- text handlers per item
- `nextKey string` -- key for next focus (default "<Tab>")
- `prevKey string` -- key for previous focus (default "<S-Tab>")
- `onChange func(index int)` -- callback on focus change

### 284. `focusItem` (struct)
- **File/Line:** focusmanager.go:33
- **What it is:** Unexported struct
- **What it does:** Pairs a focusable component with its text input binding.

### 285. `NewFocusManager` (function)
- **File/Line:** focusmanager.go:39
- **What it is:** Constructor function
- **What it does:** Creates FocusManager with default Tab/Shift-Tab bindings.

### 286. `(*FocusManager).Register` (method)
- **File/Line:** focusmanager.go:48
- **What it is:** Method
- **What it does:** Adds a focusable component. Creates riffkey.TextHandler for it. First registered component gets initial focus.

### 287. `(*FocusManager).NextKey` / `.PrevKey` / `.OnChange` (methods)
- **File/Line:** focusmanager.go:73-88
- **What they are:** Builder methods
- **What they do:** Override focus cycling keys / set change callback.

### 288. `(*FocusManager).Next` / `.Prev` / `.moveFocus` (methods)
- **File/Line:** focusmanager.go:91-110
- **What they are:** Focus movement methods
- **What they do:** Cycle focus forward/backward with wrap-around.

### 289. `(*FocusManager).Focus` (method)
- **File/Line:** focusmanager.go:113
- **What it is:** Method
- **What it does:** Sets focus to a specific index.

### 290. `(*FocusManager).Current` (method)
- **File/Line:** focusmanager.go:129

### 291. `(*FocusManager).HandleKey` (method)
- **File/Line:** focusmanager.go:134
- **What it is:** Method
- **What it does:** Routes a key to the currently focused component's text handler. Returns whether the key was consumed.

### 292. `(*FocusManager).bindings` (method)
- **File/Line:** focusmanager.go:146
- **What it is:** Method implementing `bindable`
- **What it does:** Returns focus cycling key bindings (next/prev).

---

## FILE: template.go (relevant interfaces only)

### 293. `forEachCompiler` (interface)
- **File/Line:** template.go:35
- **What it is:** Unexported interface
- **What it does:** Implemented by generic ForEach types to compile themselves into the template.

**Method:** `compileTo(t *Template, parent int16, depth int) int16`

### 294. `listCompiler` (interface)
- **File/Line:** template.go:40
- **What it is:** Unexported interface
- **What it does:** Implemented by generic List types to expose their internal SelectionList.

**Method:** `toSelectionList() *SelectionList`

### 295. `bindable` (interface)
- **File/Line:** template.go:45
- **What it is:** Unexported interface
- **What it does:** Implemented by components that declare key bindings as data.

**Method:** `bindings() []binding`

### 296. `textInputBindable` (interface)
- **File/Line:** template.go:50
- **What it is:** Unexported interface
- **What it does:** Implemented by InputC for text input routing.

**Method:** `textBinding() *textInputBinding`

### 297. `templateTree` (interface)
- **File/Line:** template.go:56
- **What it is:** Unexported interface
- **What it does:** Implemented by compound components (FilterListC, FilterLogC) that compose existing building blocks into a template subtree.

**Method:** `toTemplate() any`

### 298. `LayoutFunc` (type)
- **File/Line:** template.go:61
- **What it is:** Exported function type: `func(children []ChildSize, availW, availH int) []Rect`
- **What it does:** Custom layout function for `Arrange`/`Box`. Receives child sizes and available space, returns positioned rectangles.
- **Dependencies:** `ChildSize`, `Rect`

### 299. `ChildSize` / `Rect` (structs)
- **File/Line:** template.go:64, 69
- **What they are:** Exported structs
- **What they do:** `ChildSize` has MinW/MinH for child dimensions. `Rect` has X/Y/W/H for positioned rectangle.

### 300. `Box` (struct)
- **File/Line:** template.go:75
- **What it is:** Exported struct
- **What it does:** Container with custom layout function. Used by `Arrange`.

**Fields:**
- `Layout LayoutFunc`
- `Children []any`

---

## CROSS-CUTTING DESIGN PATTERNS

### Pattern: Function-Type-With-Methods (VBox, HBox, Overlay)
- `VBox`, `HBox`, and `Overlay` are package-level variables of function types (`VBoxFn`, `HBoxFn`, `OverlayFn`). Methods on these function types return new function values that wrap the previous one with additional field mutations. This allows `VBox.Fill(Red).Gap(2)(children...)` syntax -- options are set via method chain, then the final function is called with children.

### Pattern: Pointer Binding
- Components accept `*T` for dynamic state. The pointer is stored at compile time, dereferenced at render time. This is the core reactivity mechanism -- no signals, no subscriptions, just pointer reads.

### Pattern: Declarative Bindings
- Components accumulate `[]binding` during construction via builder methods like `BindNav`, `Handle`, etc. These are collected during template compilation (`collectBindings`) and wired to the key router during app setup. The handler field is `any` to support multiple function signatures.

### Pattern: Compile-Time Interface Detection
- The template compiler uses type switches and interface checks (`conditionNode`, `switchNodeInterface`, `forEachCompiler`, `listCompiler`, `bindable`, `textInputBindable`, `templateTree`) to detect component types and compile them appropriately.

### Pattern: ForEach Pointer Rewriting
- Conditions inside ForEach templates use `offset` and `evaluateWithBase` to adjust pointer targets per-element. The compiler calculates offsets from the prototype element used at compile time, and at render time `unsafe.Add(base, offset)` points to the correct field in each iteration's element.

### Pattern: Composition via templateTree
- `FilterListC` and `FilterLogC` implement `templateTree.toTemplate()` returning composed VBox/HBox/Input/List trees. They don't have their own render ops -- they decompose into primitives.

### Pattern: Lazy SelectionList Caching
- `ListC` and `CheckListC` lazily create a `SelectionList` on first call to `toSelectionList()`, then cache it. This ensures the same instance is used for both template compilation and runtime method calls (e.g., Up/Down navigate the same offset).

### Pattern: Builder Method Chaining (Pointer vs Value receivers)
- Value-type components (TextC, SpacerC, ProgressC, TabsC, etc.) use value receivers returning copies.
- Pointer-type components (ListC, InputC, CheckboxC, RadioC, FilterListC, FilterLogC, LogC, CheckListC) use pointer receivers returning self.
- The distinction aligns with whether the component has mutable state (pointer) or is purely declarative data (value).
</task_result>