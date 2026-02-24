task_id: ses_3a1f9779cffeJ06NH3ov9t1IxB (for resuming to continue this task if needed)

<task_result>
Now I have all the data. Here is the exhaustive catalogue:

---

# GLYPH TUI FRAMEWORK: LAYOUT SYSTEM & TEMPLATE ENGINE CATALOGUE

---

## FILE: template.go (5229 lines)

### INTERFACES

**1. Component**
- File: template.go, line 17
- What: Exported interface
- Does: Extension point for custom components that expand to built-in primitives at compile time via `Build() any`
- Depends on: nothing
- Depended on by: `compile()` (line 503-504) which calls `v.Build()` recursively

**2. Renderer**
- File: template.go, line 24
- What: Exported interface
- Does: Extension point for components that render directly to the buffer (charts, sparklines, etc.) with `MinSize()` and `Render()` methods
- Depends on: `Buffer`
- Depended on by: `compileRenderer()`, `OpCustom` rendering path

**3. forEachCompiler**
- File: template.go, line 36
- What: Unexported interface
- Does: Allows generic `ForEachC[T]` types to compile themselves into the template via `compileTo(t *Template, parent int16, depth int) int16`
- Depends on: `Template`
- Depended on by: `compile()` line 561-563

**4. listCompiler**
- File: template.go, line 40
- What: Unexported interface
- Does: Allows generic `ListC[T]` and `CheckListC[T]` types to convert themselves to `*SelectionList` for compilation
- Depends on: `SelectionList`
- Depended on by: `compile()` line 574-577

**5. bindable**
- File: template.go, line 45
- What: Unexported interface
- Does: Components that declare key bindings as data implement `bindings() []binding`, collected during compile for later wiring
- Depends on: `binding`
- Depended on by: `collectBindings()`

**6. textInputBindable**
- File: template.go, line 50
- What: Unexported interface
- Does: Implemented by `InputC` for text input routing via `textBinding() *textInputBinding`
- Depends on: `textInputBinding`
- Depended on by: `collectTextInputBinding()`

**7. templateTree**
- File: template.go, line 56
- What: Unexported interface
- Does: Implemented by compound components that compose existing building blocks into a template subtree via `toTemplate() any`
- Depends on: nothing
- Depended on by: `compile()` line 566-569

### TYPES

**8. LayoutFunc**
- File: template.go, line 61
- What: Exported type (function type)
- Does: Signature for custom layout functions — receives child sizes and available space, returns positioned rectangles
- Depends on: `ChildSize`, `Rect`
- Depended on by: `Box`, `OpLayout`, `Arrange()`

**9. ChildSize**
- File: template.go, line 64
- What: Exported struct
- Does: Represents a child's computed minimum dimensions (MinW, MinH) for custom layout functions
- Depends on: nothing
- Depended on by: `LayoutFunc`

**10. Rect**
- File: template.go, line 69
- What: Exported struct
- Does: Represents a positioned rectangle (X, Y, W, H) returned by custom layout functions
- Depends on: nothing
- Depended on by: `LayoutFunc`

**11. Box**
- File: template.go, line 75
- What: Exported struct
- Does: Container with a custom `LayoutFunc` and arbitrary children, for layouts that don't fit VBox/HBox
- Depends on: `LayoutFunc`
- Depended on by: `compile()` line 465, `compileBox()`, `Arrange()`

**12. Template**
- File: template.go, line 82
- What: Exported struct — **the core compiled UI representation**
- Does: Holds the flat op array, parallel geometry array, depth-indexed ops, scratch buffers, and all runtime state for layout and rendering
- Fields:
  - `ops []Op` — flat array of compiled operations (line 83)
  - `geom []Geom` — parallel geometry array filled at runtime (line 84)
  - `maxDepth int` — maximum tree depth for bottom-up traversal (line 87)
  - `byDepth [][]int16` — ops grouped by tree depth for traversal ordering (line 88)
  - `elemBase unsafe.Pointer` — current element base for ForEach context, set during layout/render (line 91)
  - `app *App` — reference for jump mode coordination (line 94)
  - `rowBG Color` — merged row background for SelectionList selected rows (line 97)
  - `inheritedStyle *Style` — current inherited style during render (line 100)
  - `inheritedFill Color` — cascades through nested containers (line 101)
  - `clipMaxY int16` — vertical clip: max Y coordinate for rendering, exclusive (line 104)
  - `pendingOverlays []pendingOverlay` — overlays to render after main content, cleared each frame (line 107)
  - `flexScratchIdx []int16` — scratch for flex child indices (line 110)
  - `flexScratchGrow []float32` — scratch for flex grow values (line 111)
  - `flexScratchImpl []int16` — scratch for implicit flex children (line 112)
  - `treeScratchPfx []bool` — scratch for tree node line prefix (line 113)
  - `pendingBindings []binding` — declarative bindings collected during compile (line 116)
  - `pendingTIB *textInputBinding` — text input binding for routing (line 117)
  - `pendingLogs []*LogC` — log components needing app.RequestRender wiring (line 118)
  - `pendingFocusManager *FocusManager` — focus manager for multi-input routing (line 119)
- Depends on: `Op`, `Geom`, `App`, `Color`, `Style`, `FocusManager`, `binding`, `textInputBinding`
- Depended on by: Everything. Central to the entire framework.
- **Design pattern**: Compile once, execute every frame. `Build()` does all reflection. `Execute()` is pure pointer arithmetic with zero allocation in steady state.

**13. pendingOverlay**
- File: template.go, line 123
- What: Unexported struct
- Does: Stores info needed to render an overlay after main content (holds pointer to the overlay Op)
- Depends on: `Op`
- Depended on by: `Template.pendingOverlays`, `renderOverlays()`

**14. Geom**
- File: template.go, line 160
- What: Exported struct
- Does: Runtime geometry for a single op — dimensions, local position relative to parent, and natural content height
- Fields: `W, H int16`, `LocalX, LocalY int16`, `ContentH int16`
- Depends on: nothing
- Depended on by: `Template.geom`, all layout and render methods
- **Design note**: `ContentH` stores natural height before flex distribution, so flex can calculate deltas

**15. Op**
- File: template.go, line 167
- What: Exported struct — **the instruction type for the compiled template**
- Does: Single instruction in the template's flat op array. Contains all data needed for layout and rendering of one node.
- Key fields:
  - `Kind OpKind` (line 168) — discriminator for the op type
  - `Depth int8` (line 169) — tree depth (root children = 0)
  - `Parent int16` (line 170) — parent op index, -1 for root children
  - `StaticStr string` / `StrPtr *string` / `StrOff uintptr` (lines 173-175) — **three-way value resolution** (static, pointer, or element-offset for ForEach)
  - `StaticInt int` / `IntPtr *int` / `IntOff uintptr` (lines 178-180) — same pattern for ints
  - `Width int16` / `Height int16` / `PercentWidth float32` / `FlexGrow float32` (lines 183-186) — layout hints
  - `Gap int8` (line 187) — gap between children
  - `ContentSized bool` (line 188) — has fixed-width children (don't implicit flex)
  - `FitContent bool` (line 189) — size to content instead of filling available space
  - `IsRow bool` (line 192) — true=HBox, false=VBox
  - `Border BorderStyle` / `BorderFG *Color` / `BorderBG *Color` (lines 193-195)
  - `Title string` (line 196) — border title
  - `ChildStart int16` / `ChildEnd int16` (lines 197-198) — child range in ops array
  - `CascadeStyle *Style` (line 199) — style inherited by children (**pointer for dynamic themes**)
  - `Fill Color` (line 200) — container fill color
  - `Margin [4]int16` (line 201) — outer margin: top, right, bottom, left
  - `CondPtr *bool` / `CondNode conditionNode` (lines 204-205) — for OpIf
  - `ThenTmpl *Template` / `ElseTmpl *Template` (lines 206-207) — **sub-templates** for If branches
  - `IterTmpl *Template` (line 208) — sub-template for ForEach iteration
  - `SlicePtr unsafe.Pointer` / `ElemSize uintptr` (lines 209-210) — for ForEach slice access
  - `iterGeoms []Geom` (line 213) — **per-item geometry for ForEach, reused across frames**
  - `SwitchNode switchNodeInterface` / `SwitchCases []*Template` / `SwitchDef *Template` (lines 216-218)
  - `CustomRenderer Renderer` (line 221)
  - `CustomLayout LayoutFunc` (line 224)
  - `LayerPtr *Layer` (line 227) — pointer to Layer for scrollable off-screen buffer
  - All SelectionList, Leader, Table, AutoTable, Sparkline, Spinner, Scrollbar, Tabs, TreeView, Jump, TextInput, Overlay fields (lines 237-340)
- Depends on: Everything
- Depended on by: All compile, layout, and render methods
- **Design notes**:
  - Uses **pointer semantics** — `*string`, `*int`, `*bool` are dereferenced at render time, not compile time. This is how "reactive" updates work without re-building the template.
  - The `StrOff`/`IntOff` offset pattern stores a uintptr offset from the element base, allowing per-element rebinding in ForEach without allocation.
  - `CascadeStyle *Style` is a pointer so that themes can update the style object and have changes reflected immediately at next render.

**16. OpKind**
- File: template.go, line 347
- What: Exported type (uint8 enum)
- Does: Discriminator for the 33 different op types
- Constants (lines 349-395):
  - `OpText` / `OpTextPtr` / `OpTextOff` — static, pointer, offset text
  - `OpProgress` / `OpProgressPtr` / `OpProgressOff` — progress bars
  - `OpContainer` — VBox or HBox (determined by `IsRow`)
  - `OpIf` / `OpForEach` / `OpSwitch` — control flow
  - `OpCustom` / `OpLayout` / `OpLayer` — custom renderer, custom layout, scrollable layer
  - `OpRichText` / `OpRichTextPtr` / `OpRichTextOff` — styled text spans
  - `OpSelectionList` — navigable list with marker and windowing
  - `OpLeader` / `OpLeaderPtr` / `OpLeaderIntPtr` / `OpLeaderFloatPtr` — label...value displays
  - `OpTable` / `OpAutoTable` — tables
  - `OpSparkline` / `OpSparklinePtr` — sparkline charts
  - `OpHRule` / `OpVRule` / `OpSpacer` / `OpSpinner` / `OpScrollbar` / `OpTabs` / `OpTreeView` / `OpJump` / `OpTextInput` / `OpOverlay`
- **Design note**: The Static/Ptr/Off triplet pattern (OpText/OpTextPtr/OpTextOff) is the **core reactivity mechanism**. Static = compile-time value embedded directly. Ptr = pointer dereferenced every frame. Off = offset from element base, rebound per ForEach item.

### FUNCTIONS

**17. Build**
- File: template.go, line 398
- What: Exported function
- Signature: `func Build(ui any) *Template`
- Does: **The entry point** — compiles a declarative UI tree into a flat `Template`. Pre-allocates ops, byDepth buckets, and geometry array.
- Depends on: `Template.compile()`
- Depended on by: `App.SetView()`, overlay compilation, everything that creates a template
- **Design note**: Initial capacity of 32 ops, 16 depth levels — pre-sized for typical UIs

**18. Template.SetApp**
- File: template.go, line 128
- What: Exported method
- Does: Links the template to an App for jump mode support
- Depends on: `App`

**19. Template.collectBindings**
- File: template.go, line 132
- What: Unexported method
- Does: Collects declarative key bindings from `bindable` components during compile, storing them in `pendingBindings`
- Depends on: `bindable` interface, `binding`

**20. Template.collectTextInputBinding**
- File: template.go, line 138
- What: Unexported method
- Does: Collects text input binding from `textInputBindable` components during compile
- Depends on: `textInputBindable` interface, `textInputBinding`

**21. Template.collectFocusManager**
- File: template.go, line 144
- What: Unexported method
- Does: Collects FocusManager from `InputC` or `FilterLogC` during compile (first wins)
- Depends on: `InputC`, `FilterLogC`, `FocusManager`

**22. Op.marginH / Op.marginV**
- File: template.go, lines 344-345
- What: Unexported methods
- Does: Helper methods returning total horizontal (left+right) and vertical (top+bottom) margin

**23. Template.addOp**
- File: template.go, line 424
- What: Unexported method
- Signature: `func (t *Template) addOp(op Op, depth int) int16`
- Does: Appends an op to the ops array, tracks it in byDepth, and updates maxDepth. Returns the op's index.
- **Design note**: Returns int16 — ops array is limited to 32K entries

**24. Template.compile**
- File: template.go, line 445
- What: Unexported method — **the giant type switch**
- Signature: `func (t *Template) compile(node any, parent int16, depth int, elemBase unsafe.Pointer, elemSize uintptr) int16`
- Does: The core dispatch function. Performs a type switch on the input `any` node to route to the appropriate compile function. Handles ~40 different types including both old Node-style types and new functional API types.
- Parameters:
  - `node any` — the UI node to compile
  - `parent int16` — parent op index (-1 for root)
  - `depth int` — tree depth
  - `elemBase unsafe.Pointer` — for ForEach: base address of dummy element
  - `elemSize uintptr` — for ForEach: size of one element
- Type dispatch order (lines 450-584):
  1. TextNode, ProgressNode, HBoxNode, VBoxNode (old API)
  2. IfNode, ForEachNode (control flow)
  3. Renderer interface (custom renderers)
  4. Box (custom layout)
  5. conditionNode (builder-style conditions)
  6. LayerViewNode, RichTextNode, SelectionList (old API)
  7. LeaderNode, Table, SparklineNode, HRuleNode, VRuleNode, SpacerNode, SpinnerNode, ScrollbarNode, TabsNode, TreeView, JumpNode, TextInput, OverlayNode
  8. Component interface (recursive — calls `v.Build()` and re-enters compile)
  9. VBoxC, HBoxC, TextC, SpacerC, HRuleC, VRuleC, ProgressC, SpinnerC, LeaderC, SparklineC, JumpC, LayerViewC, OverlayC, TabsC, ScrollbarC (new functional API)
  10. AutoTableC, CheckboxC, RadioC, InputC, LogC, FilterLogC (compound components)
  11. Custom (customWrapper adapter)
  12. forEachCompiler interface (generic ForEach)
  13. templateTree interface (compound components that produce subtrees)
  14. listCompiler interface (generic List/CheckList)
  15. switchNodeInterface (generic Switch)
- **Design note**: This is where ALL reflection happens at compile time. At runtime, no reflection occurs in the hot path.

**25-45. Individual compile methods** (all unexported, on Template):

| # | Method | Line | Compiles | Key Behaviour |
|---|--------|------|----------|---------------|
| 25 | `compileRenderer` | 587 | Renderer interface | Wraps as OpCustom |
| 26 | `compileCustom` | 632 | Custom struct | Wraps in customWrapper, compiles as OpCustom |
| 27 | `compileBox` | 644 | Box | Compiles as OpLayout with CustomLayout func, compiles children |
| 28 | `compileLayer` | 664 | LayerViewNode | Compiles as OpLayer with FlexGrow support |
| 29 | `compileRichText` | 675 | RichTextNode | Three-way: OpRichText (static), OpRichTextPtr (pointer), OpRichTextOff (ForEach offset) |
| 30 | `compileSelectionList` | 701 | *SelectionList | Uses reflection to analyze slice, creates dummy element for template compilation, compiles iteration template as sub-Template |
| 31 | `compileLeader` | 773 | LeaderNode | Resolves label and value (static or pointer) |
| 32 | `compileTable` | 805 | Table | Extracts rows pointer |
| 33 | `compileSparkline` | 830 | SparklineNode | Static or pointer values |
| 34 | `compileHRule` | 857 | HRuleNode | Default char '─' |
| 35 | `compileVRule` | 870 | VRuleNode | Default char '│' |
| 36 | `compileSpacer` | 883 | SpacerNode | Implicit grow=1 when no dimensions set |
| 37 | `compileSpinner` | 904 | SpinnerNode | Default frames = SpinnerBraille |
| 38 | `compileScrollbar` | 918 | ScrollbarNode | Default track/thumb chars |
| 39 | `compileTabs` | 947 | TabsNode | Default gap=2 |
| 40 | `compileTreeView` | 964 | TreeView | Default indent=2, chars ▼▶ |
| 41 | `compileJump` | 995 | JumpNode | Wrapper — compiles child inline as ChildStart..ChildEnd range |
| 42 | `compileTextInput` | 1016 | TextInput | Default placeholder=dim, cursor=inverse |
| 43 | `compileOverlay` | 1046 | OverlayNode | Compiles child as sub-Template via Build(), default centered |
| 44 | `compileText` | 1079 | TextNode | Three-way: OpText/OpTextPtr/OpTextOff. Uses `isWithinRange()` to detect ForEach context. |
| 45 | `compileProgress` | 1102 | ProgressNode | Three-way: OpProgress/OpProgressPtr/OpProgressOff |

**46. compileContainer**
- File: template.go, line 1130
- What: Unexported method
- Signature: `func (t *Template) compileContainer(children []any, gap int8, isRow bool, f flex, border BorderStyle, title string, borderFG, borderBG *Color, fill Color, inheritStyle *Style, margin [4]int16, parent int16, depth int, elemBase unsafe.Pointer, elemSize uintptr) int16`
- Does: **Core container compiler** — used by both VBox and HBox (old and new API). Adds OpContainer, then compiles all children, sets ChildStart/ChildEnd range, and detects ContentSized (any child with explicit Width).
- **Design note**: ContentSized flag bubbles up from children to influence flex distribution in parent HBox

**47. compileIf**
- File: template.go, line 1179
- What: Unexported method
- Does: Compiles IfNode — creates sub-Template for the Then branch. Bubbles up `pendingBindings` from sub-template.
- **Design note**: Control flow ops compile their branches as separate sub-Templates, not inline ops

**48. compileCondition**
- File: template.go, line 1213
- What: Unexported method
- Does: Compiles builder-style conditions (conditionNode). Detects ForEach context for offset-based rebinding. Compiles both Then and Else branches as sub-Templates.

**49. compileSwitch**
- File: template.go, line 1269
- What: Unexported method
- Does: Compiles Switch — each case and default compiled as separate sub-Templates

**50. compileForEach**
- File: template.go, line 1319
- What: Unexported method
- Does: **Key ForEach compiler**. Uses reflection to analyze the slice type, creates a dummy element, calls the render function with the dummy to get the template structure, then compiles the result with the dummy's address as `elemBase`. This is how pointer offsets are computed at compile time.
- **Design note**: The `takesPtr` check (line 1335) determines whether the render function takes `*T` or `T`, affecting how `dummyBase` is computed

**51-63. Functional API compile methods** (all on Template, lines 1379-1721):

| # | Method | Line | Type | Notes |
|---|--------|------|------|-------|
| 51 | `compileVBoxC` | 1379 | VBoxC | Delegates to compileContainer with isRow=false |
| 52 | `compileHBoxC` | 1399 | HBoxC | Delegates to compileContainer with isRow=true |
| 53 | `compileTextC` | 1419 | TextC | Three-way with Width and Margin support |
| 54 | `compileSpacerC` | 1445 | SpacerC | Same grow logic as old API |
| 55 | `compileHRuleC` | 1463 | HRuleC | |
| 56 | `compileVRuleC` | 1477 | VRuleC | |
| 57 | `compileProgressC` | 1492 | ProgressC | Reuses TextStyle for progress bar color |
| 58 | `compileSpinnerC` | 1523 | SpinnerC | |
| 59 | `compileLeaderC` | 1538 | LeaderC | Extended: supports `*int`, `*float64`, `int`, `float64` value types |
| 60 | `compileSparklineC` | 1586 | SparklineC | |
| 61 | `compileJumpC` | 1614 | JumpC | |
| 62 | `compileLayerViewC` | 1632 | LayerViewC | |
| 63 | `compileOverlayC` | 1644 | OverlayC | Multi-child: wraps in VBoxNode if >1 child |

**64. compileTabsC / compileScrollbarC**
- File: template.go, lines 1679, 1693

**65. compileAutoTableC**
- File: template.go, line 1723
- What: Unexported method
- Does: Dispatches to either `compileAutoTableReactive` (for `*[]T` pointer) or `compileAutoTableStatic` (for `[]T` value)

**66. compileAutoTableReactive**
- File: template.go, line 1741
- What: Unexported method
- Does: Compiles AutoTable backed by `*[]T` into a single `OpAutoTable` that reads through the pointer on every render frame. Resolves column configs, field indices, alignment defaults.
- **Design note**: This is the "live data" path — the table re-reads the slice each frame

**67. compileAutoTableStatic**
- File: template.go, line 1863
- What: Unexported method
- Does: Compiles static AutoTable by expanding into a VBox of HBoxes at compile time (no dynamic re-reading)

**68. autoTableResolveColumns**
- File: template.go, line 1840
- What: Unexported function
- Does: Resolves column names to struct field indices. If no explicit columns given, returns all exported fields.

**69. alignOffset**
- File: template.go, line 1809
- What: Unexported function
- Does: Calculates x offset for text alignment within a given width

**70. autoTableDefaultAlign**
- File: template.go, line 1826
- What: Unexported function
- Does: Returns sensible default alignment based on type kind (numeric=right, bool=center, string=left)

**71. compileCheckboxC**
- File: template.go, line 1999
- What: Unexported method
- Does: Compiles Checkbox into `HBox.Gap(1)(If(checked).Then(Text("☑")).Else(Text("☐")), Text(label))`

**72. compileRadioC**
- File: template.go, line 2017
- What: Unexported method
- Does: Compiles Radio into VBox/HBox of `IfOrd(selected).Eq(idx).Then(...)` items

**73. compileInputC**
- File: template.go, line 2042
- What: Unexported method
- Does: Converts `InputC` to `TextInput` and re-enters compile

### EXECUTE / LAYOUT ENGINE (Lines 2048-3378)

**74. Template.Execute**
- File: template.go, line 2049
- What: Exported method — **the main render entry point**
- Signature: `func (t *Template) Execute(buf *Buffer, screenW, screenH int16)`
- Does: Runs the four-phase pipeline:
  1. Phase 1: Width distribution (top-down) — `distributeWidths`
  2. Phase 2: Layout (bottom-up) — `layout` — computes content heights
  3. Phase 2b: Flex distribution (top-down) — `distributeFlexGrow` — expand flex children
  4. Phase 3: Render (top-down) — `render`
  5. Phase 4: Render overlays — `renderOverlays`
- **Design note**: Overlays are rendered last so they appear on top. `pendingOverlays` is cleared at start of each frame.

**75. Template.distributeWidths**
- File: template.go, line 2072
- What: Unexported method
- Does: Phase 1 — assigns W to all ops top-down. Root ops get screen width (unless FitContent). Then processes containers depth-by-depth, each setting children's widths.
- **Design note**: FitContent containers compute intrinsic width from children first

**76. Template.computeIntrinsicWidth**
- File: template.go, line 2106
- What: Unexported method
- Does: Computes minimum width needed for a ContentSized/FitContent container. VBox = max child width, HBox = sum + gaps.

**77. Template.setOpWidth**
- File: template.go, line 2167
- What: Unexported method
- Does: **The width-resolution switch** — sets a single op's width based on its Kind, explicit dimensions, and available space. Handles all 33+ op types.
- Key behaviours:
  - `OpText`: content width from string length, or explicit Width
  - `OpTextOff`: resolves via `elemBase + StrOff` pointer arithmetic
  - `OpHRule`: 0 (fill available)
  - `OpVRule`: 1 (single column)
  - `OpSpacer`: explicit or 0 (fill)
  - `OpOverlay`: 0 (floats, takes no layout space)
  - `OpIf`: evaluates condition, distributes width into the active branch's sub-template
  - `OpContainer`: explicit Width, or PercentWidth * availW, or fill
  - Non-container ops with margin get `marginH()` added

**78. Template.distributeWidthsToChildren**
- File: template.go, line 2387
- What: Unexported method
- Does: Routes to HBox or VBox child width distribution after subtracting margin and border

**79. Template.distributeVBoxChildWidths**
- File: template.go, line 2402
- What: Unexported method
- Does: VBox children fill available width — simply calls `setOpWidth` on each direct child

**80. Template.distributeHBoxChildWidths**
- File: template.go, line 2428
- What: Unexported method — **the HBox flex algorithm**
- Does: Two-pass flex distribution for HBox:
  - Pass 1: Set widths for non-flex children. Classify children into:
    - Explicit flex (FlexGrow > 0)
    - Implicit flex (containers without explicit width, percent, or ContentSized)
    - Fixed width (everything else)
  - Account for gaps
  - Pass 2: Distribute remaining width to explicit flex children proportionally. If no explicit flex but implicit flex exists, share evenly.
  - Uses `flexScratchIdx`, `flexScratchGrow`, `flexScratchImpl` scratch buffers to avoid allocation
- **Design note**: OpIf is transparent — looks at the active branch's content properties. Last flex child gets rounding remainder.

**81. Template.getIfContentOp**
- File: template.go, line 2415
- What: Unexported method
- Does: Returns the root op of an If's active branch content (for transparent flex treatment)

**82. Template.layout**
- File: template.go, line 2556
- What: Unexported method
- Does: Phase 2 — bottom-up. Deepest ops first. Assigns H and local positions.
- Per-kind height computation:
  - Text/Progress/RichText/Leader: H=1
  - AutoTable: data rows + 1 (header), clamped by scroll.maxVisible
  - Table: row count (+ header)
  - Sparkline/HRule/Spinner/TextInput: H=1
  - VRule: H=1 (stretched by flex later)
  - Spacer: explicit Height
  - Scrollbar: 1 for horizontal, explicit or 1 for vertical
  - Tabs: 3 for box style, 1 for others
  - TreeView: visible node count
  - SelectionList: slice length clamped by MaxVisible
  - Custom: from MinSize() or MeasureWithAvail()
  - Layer: explicit viewport, or FlexGrow=1 min, or pre-set viewport
  - Jump: sum of children heights (like VBox)
  - Overlay: H=0 (floats above)
  - Layout: calls layoutCustom
  - Container: calls layoutContainer

**83. Template.layoutContainer**
- File: template.go, line 2738
- What: Unexported method — **container layout core**
- Does: Positions children and computes container height for both HBox and VBox.
- For HBox (IsRow=true): 
  - Horizontal cursor, tracks maxH for row height
  - Control flow ops (OpIf, OpForEach, OpSwitch) expand to their content heights inline
  - Gap added only before visible children (not before first, not when preceding child was invisible)
- For VBox (IsRow=false):
  - Vertical cursor, stacking children
  - Same control flow handling
- Adds border and margin to final height
- Stores `ContentH` before explicit height override (for flex distribution)

**84. Template.distributeFlexGrow**
- File: template.go, line 3002
- What: Unexported method
- Does: Phase 2b — distributes remaining vertical space to flex children, top-down.
- First pass: root container fills screen height (unless explicit height or FitContent) — makes common case "just work"
- Second pass: for each container at each depth:
  - HBox: stretches children to fill row height via `stretchRowChildren`
  - VBox: distributes vertical flex via `distributeFlexInCol`

**85. Template.stretchRowChildren**
- File: template.go, line 3038
- What: Unexported method
- Does: Stretches HBox children to fill the HBox's height. Containers and Layers without explicit height grow. If ops get their content stretched too.

**86. Template.stretchIfContent**
- File: template.go, line 3069
- What: Unexported method
- Does: Stretches the active branch of an If to a given height (for HBox row stretching)

**87. Template.distributeFlexInCol**
- File: template.go, line 3094
- What: Unexported method — **VBox flex distribution core**
- Does: Distributes vertical flex space within a VBox.
  - Calculates available height from parent or root
  - Sums content heights and total flex grow
  - Flex children: Container, Layer, Spacer with FlexGrow > 0
  - OpIf wrapping a flex container also participates (via `getIfFlexGrow`)
  - Distributes remaining space proportionally (handles both expansion AND shrinkage)
  - Recalculates child positions with new heights
  - Propagates extra height to nested templates in If ops
- Uses scratch buffers for zero allocation

**88. Template.propagateFlexToIf**
- File: template.go, line 3239
- What: Unexported method
- Does: Propagates flex height to an If's active branch template — if the branch root is a flex container, updates its height and re-runs `distributeFlexGrow`

**89. Template.getIfFlexGrow**
- File: template.go, line 3264
- What: Unexported method
- Does: Returns the FlexGrow value from an If's active branch (allows If-wrapped containers to participate in flex)

**90. Template.layoutCustom**
- File: template.go, line 3290
- What: Unexported method
- Does: Handles custom layout containers (Box/Arrange). Collects child sizes, calls the LayoutFunc, applies returned Rects to children.

**91. Template.layoutForEach**
- File: template.go, line 3338
- What: Unexported method
- Does: Iterates items, layouts each via sub-template, returns total height and max width. Uses `iterGeoms` (reused across frames) for per-item geometry.

### RENDER METHODS (Lines 3380-5229)

**92. Template.render**
- File: template.go, line 3381
- What: Unexported method
- Does: Entry point for Phase 3 — calls `renderOp` for index 0

**93. applyTransform**
- File: template.go, line 3386
- What: Unexported function
- Does: Applies text transforms (uppercase, lowercase, capitalize)

**94. Template.effectiveStyle**
- File: template.go, line 3417
- What: Unexported method
- Does: Returns the style to use, merging with inherited style. Fully empty style inherits everything (except margin). Partial style merges: Attr combined, FG/BG/Transform inherited if not set. Cascaded Fill becomes BG.

**95. Template.renderOp**
- File: template.go, line 3455
- What: Unexported method — **main render dispatch**
- Does: Renders a single op at its computed position. Computes absolute position from global + local + margin offsets. Giant switch on OpKind. For containers: fills background, draws border with title, recurses children. For control flow: evaluates condition/switch, renders active branch's sub-template with propagated style/fill/clip.

**96. Template.renderSubTemplate**
- File: template.go, line 3830
- What: Unexported method
- Does: Renders a sub-template for ForEach with element-bound data. Propagates `clipMaxY`.

**97. Template.renderSubOp**
- File: template.go, line 3841
- What: Unexported method
- Does: Renders a single op in a sub-template context (ForEach). Handles `OpTextOff` by resolving `elemBase + StrOff`. Merges `rowBG` for SelectionList styling. Full recursive render for all op types.
- **Design note**: `mergeStyle` helper (line 3860) applies inherited style first, then row background

**98. Template.renderSelectionList**
- File: template.go, line 4197
- What: Unexported method
- Does: Renders selection list with marker, windowing, and vertical clip clamping. Two code paths:
  - Complex (container/layout/jump first op): full pipeline (distributeWidths → layout → renderSubTemplate)
  - Simple (text first op): fast path, no layout needed
- Handles scroll offset adjustment when selection is outside clipped window

**99-106. Specialized render methods**:

| # | Method | Line | Renders |
|---|--------|------|---------|
| 99 | `renderTreeView` | 4415 | TreeView root |
| 100 | `renderTreeNode` | 4423 | Individual tree node (recursive, DFS with line prefix scratch) |
| 101 | `renderJump` | 4482 | Jump wrapper + jump mode labels |
| 102 | `renderTextInput` | 4513 | Text input with cursor, mask, placeholder, horizontal scrolling |
| 103 | `renderOverlays` | 4614 | All pending overlays (phase 4) |
| 104 | `renderOverlay` | 4621 | Single overlay — dry-run layout for sizing, backdrop, BG fill, final render |
| 105 | `renderTabs` | 4702 | Tab headers (underline/box/bracket styles) |
| 106 | `renderScrollbar` | 4765 | Scroll indicator with proportional thumb |

**107. Template.renderTable / renderAutoTable**
- File: template.go, lines 4850, 4934
- What: Unexported methods
- Does: Table rendering. AutoTable has scroll support with internal buffer (renders all rows to internal buffer, blits visible window). Sort support with jump-mode column headers.

**108. Template.Height**
- File: template.go, line 5171
- What: Exported method
- Does: Returns computed height after layout by summing root-level op heights

**109. Template.DebugDump**
- File: template.go, line 5186
- What: Exported method
- Does: Prints op tree to stderr for debugging layout issues

**110. opKindName**
- File: template.go, line 5217
- What: Unexported function
- Does: Returns human-readable name for OpKind

**111. customWrapper**
- File: template.go, line 596
- What: Unexported struct
- Does: Adapts the `Custom` struct to the `Renderer` interface. Has special `MeasureWithAvail` that passes actual available width (vs MinSize which passes -1).

---

## FILE: flexlayout.go (652 lines)

**This is an ALTERNATIVE layout system** — a FlexNode tree that exists alongside the Template system. It appears to be an older or parallel approach based on "the validated TypeScript canvas library pattern" (line 9).

### TYPES

**112. FlexNode**
- File: flexlayout.go, line 12
- What: Exported struct
- Does: Node in an explicit layout tree. Contains tree structure (parent, children, level), sizing (percentWidth, flexGrow, explicitW/H, minW/H), calculated geometry (X, Y, W, H), layout config (layout, gap, padding, border), and content (kind, content any, style).
- **Design note**: This is a NODE-based tree (pointer-linked), contrasted with Template's FLAT ARRAY approach.

**113. FlexNodeKind**
- File: flexlayout.go, line 42
- What: Exported type (uint8 enum)
- Constants: `FlexNodeContainer`, `FlexNodeText`, `FlexNodeRichText`, `FlexNodeProgress`, `FlexNodeMeter`, `FlexNodeBar`, `FlexNodeLeader`

**114. Layout**
- File: flexlayout.go, line 55
- What: Exported interface
- Does: Defines how a container positions its children via two methods:
  - `DistributeWidths(node *FlexNode)` — called during Update phase (top-down)
  - `LayoutChildren(node *FlexNode)` — called during Layout phase (bottom-up)

**115. VerticalLayout**
- File: flexlayout.go, line 66
- What: Exported struct implementing `Layout`
- Fields: `Gap int8`, `HPad int8`, `TopPad int8`
- Does: Stacks children vertically.
- `DistributeWidths` (line 72): Children default to full available width. Percent, explicit, or minimum enforced.
- `LayoutChildren` (line 104): Two-pass — calculate content height + total flex, distribute remaining to flex children, then position. If parent height unset, calculate from content.

**116. HorizontalLayout**
- File: flexlayout.go, line 173
- What: Exported struct implementing `Layout`
- Fields: `Gap int8`, `VPad int8`, `LeftPad int8`
- Does: Arranges children horizontally.
- `DistributeWidths` (line 179): Two-pass — calculate fixed width + total flex, distribute remaining proportionally.
- `LayoutChildren` (line 227): Single pass positioning. Parent height = max child height + padding + border.

**117. FlexTree**
- File: flexlayout.go, line 262
- What: Exported struct
- Does: Manages the three-phase layout process. Contains root FlexNode, byLevel node index, maxLevel.

### FUNCTIONS

**118. NewFlexTree**
- File: flexlayout.go, line 269
- What: Exported function
- Signature: `func NewFlexTree(root *FlexNode) *FlexTree`
- Does: Creates a new layout tree, indexes all nodes by level for efficient traversal

**119. FlexTree.indexNode**
- File: flexlayout.go, line 291
- What: Unexported method
- Does: Recursively indexes nodes by tree level and sets parent pointers

**120. FlexTree.Execute**
- File: flexlayout.go, line 316
- What: Exported method
- Signature: `func (t *FlexTree) Execute(buf *Buffer, w, h int16)`
- Does: Runs the three-phase pipeline:
  1. Phase 1: Update (top-down) — distribute widths via `layout.DistributeWidths`
  2. Phase 2: Layout (bottom-up) — leaf nodes measure themselves, containers call `layout.LayoutChildren`
  3. Phase 3: Draw (top-down) — `draw()` with viewport culling

**121. FlexTree.measureLeaf**
- File: flexlayout.go, line 352
- What: Unexported method
- Does: Measures leaf nodes. Text=1 line, Progress/Meter/Bar=1 line (default 20 wide), Leader=1 line.

**122. FlexTree.draw**
- File: flexlayout.go, line 391
- What: Unexported method
- Does: Recursive draw with absolute position calculation, viewport culling, border rendering, content rendering by kind, and child recursion. Adjusts child origin for borders.

### BUILDER HELPERS

**123-132. FlexNode constructors**:

| # | Function | Line | Creates |
|---|----------|------|---------|
| 123 | `FCol` | 502 | Vertical container (VerticalLayout) |
| 124 | `FRow` | 511 | Horizontal container (HorizontalLayout) |
| 125 | `FText` | 520 | Text node |
| 126 | `FRich` | 528 | Rich text node |
| 127 | `FMeter` | 536 | Meter display ([2]int content) |
| 128 | `FBar` | 544 | Bar display ([2]int content) |
| 129 | `FLeader` | 552 | Leader node ([2]string content) |
| 130 | `FPanel` | 561 | Bordered panel with title |
| 131 | `FLED` | 572 | LED indicator (●/○) |
| 132 | `FLEDs` | 586 | Multiple LED indicators |

### CHAINABLE MODIFIERS (on *FlexNode)

**133. FlexNode.Ref** — line 595, passes node to callback
**134. FlexNode.Gap** — line 597
**135. FlexNode.Pad** — line 602
**136. FlexNode.Border** — line 608
**137. FlexNode.Width** — line 613
**138. FlexNode.Height** — line 618
**139. FlexNode.MinWidth** — line 623
**140. FlexNode.MinHeight** — line 628
**141. FlexNode.Percent** — line 633
**142. FlexNode.Grow** — line 638
**143. FlexNode.Style** — line 643
**144. FlexNode.Bold** — line 648

---

## FILE: components.go (2170 lines)

### UNEXPORTED TYPES

**145. binding**
- File: components.go, line 11
- What: Unexported struct
- Fields: `pattern string`, `handler any`
- Does: Represents a declared key binding on a component — stored as data during construction, wired to a router during setup

**146. textInputBinding**
- File: components.go, line 16
- What: Unexported struct
- Fields: `value *string`, `cursor *int`, `onChange func(string)`
- Does: Represents an InputC that wants unmatched keys routed to it

### CONTAINER COMPONENTS

**147. VBoxC**
- File: components.go, line 57
- What: Exported struct
- Fields: fill, inheritStyle, gap, border, borderFG, borderBG, title, width, height, percentWidth, flexGrow, fitContent, margin, children (all unexported)
- Does: Data type produced by the `VBox` constructor function
- Depended on by: `compileVBoxC`

**148. VBoxFn**
- File: components.go, line 74
- What: Exported type (`func(children ...any) VBoxC`)
- Does: The function type that enables the chainable modifier pattern on VBox
- **Design pattern**: `VBoxFn` methods return new `VBoxFn` values (closure wrapping), so `VBox.Fill(Red).Gap(2)(children...)` works by chaining function wrapping.

**149-163. VBoxFn chainable methods** (lines 76-203):
`Fill`, `CascadeStyle`, `Gap`, `Border`, `BorderFG`, `BorderBG`, `Title`, `Width`, `Height`, `Size`, `WidthPct`, `Grow`, `FitContent`, `Margin`, `MarginVH`, `MarginTRBL`

**164. VBox (var)**
- File: components.go, line 206
- What: Exported variable (`var VBox VBoxFn = ...`)
- Does: The vertical container constructor. A package-level variable of type VBoxFn, initialized to a function that returns `VBoxC{children: children}`.
- **Design pattern**: Using a var instead of a func allows methods on the function type. `VBox(...)` calls it as a function. `VBox.Gap(2)(...)` calls the Gap method which returns a new VBoxFn.

**165. HBoxC**
- File: components.go, line 214
- What: Exported struct (mirrors VBoxC)

**166. HBoxFn**
- File: components.go, line 231
- What: Exported type (mirrors VBoxFn)

**167-181. HBoxFn chainable methods** (lines 233-360):
Same set as VBoxFn.

**182. HBox (var)**
- File: components.go, line 363
- What: Exported variable (`var HBox HBoxFn = ...`)
- Does: The horizontal container constructor

**183. Arrange**
- File: components.go, line 378
- What: Exported function
- Signature: `func Arrange(layout LayoutFunc) func(children ...any) Box`
- Does: Creates a container with a custom layout function. Returns a function that takes children and produces a `Box`.

**184. Widget**
- File: components.go, line 397
- What: Exported function
- Signature: `func Widget(measure func(availW int16) (w, h int16), render func(buf *Buffer, x, y, w, h int16)) Custom`
- Does: Creates a fully custom component with explicit measure and render functions

### LEAF COMPONENTS

**185. TextC**
- File: components.go, line 408
- What: Exported struct
- Fields: `content any` (string or *string), `style Style`, `width int16`

**186. Text**
- File: components.go, line 414
- What: Exported function
- Signature: `func Text(content any) TextC`
- Does: Creates a text display component

**187-198. TextC methods** (lines 418-470):
`Style`, `FG`, `BG`, `Bold`, `Dim`, `Italic`, `Underline`, `Inverse`, `Strikethrough`, `Width`, `Margin`, `MarginVH`, `MarginTRBL`
- **Design note**: All methods use value receivers and return copies — enables `Text("x").Bold().FG(Red)` chaining without mutation

**199. SpacerC**
- File: components.go, line 476
- What: Exported struct

**200. Space** — line 484, creates SpacerC with defaults (implicit grow=1)
**201. SpaceH** — line 488, fixed height spacer
**202. SpaceW** — line 492, fixed width spacer

**203-208. SpacerC methods**: Width, Height, Char, Style, Grow, Margin variants

**209. HRuleC** — line 532
**210. HRule** — line 537, constructor (default char '─')
**211-214. HRuleC methods**: Char, Style, FG, BG, Bold, Margin variants

**215. VRuleC** — line 563
**216. VRule** — line 569, constructor (default char '│')
**217-221. VRuleC methods**: Char, Style, FG, BG, Bold, Height, Margin variants

**222. ProgressC** — line 600
**223. Progress** — line 606, constructor taking `any` (int or *int, 0-100)
**224-227. ProgressC methods**: Width, Style, FG, BG, Bold, Margin variants

**228. SpinnerC** — line 638
**229. Spinner** — line 644, constructor taking `*int` (frame pointer), default Braille frames
**230-233. SpinnerC methods**: Frames, Style, FG, BG, Bold, Margin variants

**234. LeaderC** — line 673
**235. Leader** — line 681, constructor `Leader(label, value any)` with default fill='.'
**236-239. LeaderC methods**: Width, Fill, Style, FG, BG, Bold, Margin variants

**240. SparklineC** — line 715
**241. Sparkline** — line 723, constructor taking `any` ([]float64 or *[]float64)
**242-245. SparklineC methods**: Width, Range, Style, FG, BG, Bold, Margin variants

**246. JumpC** — line 761
**247. Jump** — line 768, constructor `Jump(child any, onSelect func())`
**248. JumpC methods**: Style, Margin variants

**249. LayerViewC** — line 785
**250. LayerView** — line 793, constructor `LayerView(layer *Layer)`
**251-254. LayerViewC methods**: ViewHeight, ViewWidth, Grow, Margin variants

**255. OverlayC** — line 823
**256. OverlayFn** — line 834, function type for chainable overlay modifier pattern
**257-262. OverlayFn methods**: Centered, Backdrop, At, Size, BG, BackdropFG
**263. Overlay (var)** — line 886, package-level constructor

### GENERIC COMPONENTS

**264. ForEachC[T]**
- File: components.go, line 894
- What: Exported generic struct
- Fields: `items *[]T`, `template func(item *T) any`
- Does: Type-safe ForEach list rendering

**265. ForEach[T]**
- File: components.go, line 899
- What: Exported generic function
- Signature: `func ForEach[T any](items *[]T, template func(item *T) any) ForEachC[T]`
- Does: Creates a typed ForEach with pointer semantics for items

**266. ForEachC[T].compileTo**
- File: components.go, line 904
- What: Method implementing forEachCompiler
- Does: Converts to ForEachNode and delegates to `compileForEach`

**267. ListC[T]**
- File: components.go, line 912
- What: Exported generic struct (pointer receiver throughout)
- Fields: items, selected, internalSel, render, marker, markerStyle, maxVisible, style, selectedStyle, cached, declaredBindings
- Does: Navigable selection list with internal selection management

**268. List[T]**
- File: components.go, line 929
- What: Exported generic function
- Does: Creates a selectable list. Internal selection by default (`selected = &internalSel`).

**269-288. ListC[T] methods**:
- `Ref` (937), `Selection` (940), `Selected` (946) — returns *T, `Index` (958), `SetIndex` (963), `ClampSelection` (968), `Delete` (982)
- `Render` (998), `Marker` (1004), `MarkerStyle` (1010), `MaxVisible` (1016), `Style` (1022), `SelectedStyle` (1028), Margin variants
- `toSelectionList` (1050) — creates/caches the internal `*SelectionList`
- `Up/Down/PageUp/PageDown/First/Last` (1067-1082) — delegate to cached SelectionList
- `BindNav/BindPageNav/BindFirstLast/BindVimNav/BindDelete/Handle` (1084-1132) — declarative binding methods
- `bindings` (1134) — implements bindable interface

**289. TabsC** — line 1140
**290. Tabs** — line 1150, constructor
**291-294. TabsC methods**: Kind, Gap, ActiveStyle, InactiveStyle, Margin variants

**295. ScrollbarC** — line 1182
**296. Scroll** — line 1195, constructor `Scroll(contentSize, viewSize int, position *int)`
**297-303. ScrollbarC methods**: Length, Horizontal, TrackChar, ThumbChar, TrackStyle, ThumbStyle, Margin variants

### AUTOTABLE

**304. autoTableSortState** — line 1249, unexported struct tracking sort column and direction
**305. autoTableScroll** — line 1256, unexported struct managing viewport scrolling (offset, maxVisible, internal Buffer)
**306-309. autoTableScroll methods**: scrollDown, scrollUp, pageDown, pageUp, clamp

**310. AutoTableC** — line 1297, exported struct
**311. AutoTable** — line 1317, constructor `AutoTable(data any)`

**312-326. AutoTableC methods**:
- `Columns` (1327), `Headers` (1334), `Column` (1349) — column config
- `HeaderStyle` (1357), `RowStyle` (1362), `AltRowStyle` (1367), `Gap` (1372), `Border` (1377), Margin variants
- `Sortable` (1392) — allocates `autoTableSortState`, enables jump-mode column sorting
- `Scrollable` (1401) — allocates `autoTableScroll`
- `BindNav` (1413), `BindPageNav` (1435), `BindVimNav` (1458) — scroll keybindings
- `bindings` (1462) — implements bindable

**327. autoTableSort** — line 1465, sorts a `*[]T` slice in-place by field index using reflection
**328. sortSliceReflect** — line 1495, insertion sort on reflected values
**329. derefValue** — line 1514
**330. compareValues** — line 1523, reflects and compares by kind (int, uint, float, string, fallback)

### FORM COMPONENTS

**331. CheckboxC**
- File: components.go, line 1580
- What: Exported struct (pointer receiver)
- Fields: checked *bool, label, labelPtr, checkedMark, unchecked, style, declaredBindings

**332. Checkbox** — line 1591, constructor with static label (default marks ☑/☐)
**333. CheckboxPtr** — line 1601, constructor with dynamic label (*string)
**334. CheckboxC methods**: Ref, Marks, Style, Margin variants, BindToggle, Toggle, Checked

**335. RadioC**
- File: components.go, line 1658
- What: Exported struct (pointer receiver)
- Fields: selected *int, options, optionsPtr, selectedMark, unselected, style, gap, horizontal, declaredBindings

**336. Radio** — line 1671, constructor with static options (default marks ◉/○)
**337. RadioPtr** — line 1681, constructor with dynamic options
**338. RadioC methods**: Ref, Marks, Style, Margin, Gap, Horizontal, BindNav, Next, Prev, Selected, Index, getOptions

**339. CheckListC[T]**
- File: components.go, line 1775
- What: Exported generic struct (pointer receiver)
- Fields: items, checked, render, selected, internalSel, checkedMark, uncheckedMark, marker, markerStyle, style, selectedStyle, gap, declaredBindings, cached

**340. CheckList[T]** — line 1793, constructor
**341. CheckListC methods**: Checked, Render, Marks, Marker, MarkerStyle, Style, SelectedStyle, Margin, Gap, BindNav, BindPageNav, BindFirstLast, BindVimNav, BindToggle, BindDelete, Handle, Ref, Selected, Index, Delete, Up/Down/PageUp/PageDown/First/Last
**342. CheckListC[T].toSelectionList** — line 1971, **infers checked/render from struct tags** (glyph:"checked", glyph:"render") if not explicitly set. Builds render function with checkbox marks using `If(checkedFn(item)).Then(Text("☑")).Else(Text("☐"))`.

**343. InputC**
- File: components.go, line 2038
- What: Exported struct (pointer receiver)
- Fields: field InputState, placeholder, width, mask, style, declaredTIB, focused, manager
- Does: Text input with internal state management

**344. Input** — line 2052, constructor `Input() *InputC`
**345. InputC methods**: Ref, Placeholder, Width, Mask, Style, Margin, Bind, textBinding, ManagedBy, focusBinding, setFocused, Focused, Value, SetValue, Clear, State, toTextInput

**346. InputC.ManagedBy** — line 2108
- Does: Registers input with FocusManager, enables automatic focus cycling and keystroke routing. Sets `declaredTIB` and calls `fm.Register(i)`.

**347. InputC.toTextInput** — line 2156
- Does: Converts to underlying `TextInput` struct for rendering. If managed by FocusManager, wires `Focused = &i.focused`.

### UTILITY

**348. Define**
- File: components.go, line 49
- What: Exported function
- Signature: `func Define(fn func() any) any`
- Does: Creates a scoped block for local component helpers/styles. The function runs once at compile time. Pointers inside still provide dynamic values at render time.
- **Design note**: This is how you create reusable component fragments without building a full Component type.

---

## FILE: focusmanager.go (156 lines)

### INTERFACES

**349. focusable**
- File: focusmanager.go, line 6
- What: Unexported interface
- Methods: `focusBinding() *textInputBinding`, `setFocused(focused bool)`
- Does: Implemented by components that can receive keyboard focus
- Depends on: `textInputBinding`
- Depended on by: `FocusManager.Register`

### TYPES

**350. FocusManager**
- File: focusmanager.go, line 23
- What: Exported struct
- Fields:
  - `items []*focusItem` — registered focusable components
  - `current int` — currently focused index
  - `handlers []*riffkey.TextHandler` — one per item, for keystroke routing
  - `nextKey string` — key binding for next focus (default "<Tab>")
  - `prevKey string` — key binding for previous focus (default "<S-Tab>")
  - `onChange func(index int)` — callback when focus changes
- Depends on: `focusable`, `focusItem`, `riffkey.TextHandler`, `textInputBinding`
- Depended on by: `InputC.ManagedBy`, `FilterLogC`, Template.pendingFocusManager

**351. focusItem**
- File: focusmanager.go, line 33
- What: Unexported struct
- Fields: `focusable focusable`, `tib *textInputBinding`
- Does: Wraps a focusable component with its text input binding

### FUNCTIONS

**352. NewFocusManager**
- File: focusmanager.go, line 39
- What: Exported function
- Signature: `func NewFocusManager() *FocusManager`
- Does: Creates a new focus manager with default Tab/Shift-Tab bindings

**353. FocusManager.Register**
- File: focusmanager.go, line 48
- What: Exported method
- Signature: `func (fm *FocusManager) Register(f focusable) *FocusManager`
- Does: Adds a focusable component. Gets its textInputBinding, creates a `riffkey.TextHandler`, appends to items/handlers. First registered component gets initial focus.

**354. FocusManager.NextKey**
- File: focusmanager.go, line 73
- What: Exported method
- Does: Sets the key binding for moving to next focusable (default: Tab)

**355. FocusManager.PrevKey**
- File: focusmanager.go, line 79
- What: Exported method
- Does: Sets the key binding for moving to previous focusable (default: Shift-Tab)

**356. FocusManager.OnChange**
- File: focusmanager.go, line 85
- What: Exported method
- Does: Sets a callback that fires when focus changes

**357. FocusManager.Next**
- File: focusmanager.go, line 91
- Does: Moves focus to next component (calls moveFocus(1))

**358. FocusManager.Prev**
- File: focusmanager.go, line 96
- Does: Moves focus to previous component (calls moveFocus(-1))

**359. FocusManager.moveFocus**
- File: focusmanager.go, line 100
- What: Unexported method
- Does: Core focus movement — unfocuses current, wraps index with modular arithmetic, focuses new, fires onChange

**360. FocusManager.Focus**
- File: focusmanager.go, line 113
- What: Exported method
- Does: Sets focus to a specific index. No-op if already focused or out of range.

**361. FocusManager.Current**
- File: focusmanager.go, line 129
- What: Exported method
- Does: Returns the currently focused index

**362. FocusManager.HandleKey**
- File: focusmanager.go, line 134
- What: Exported method
- Signature: `func (fm *FocusManager) HandleKey(k riffkey.Key) bool`
- Does: Routes a key to the currently focused component's TextHandler. Returns true if handled.

**363. FocusManager.bindings**
- File: focusmanager.go, line 146
- What: Unexported method
- Does: Returns focus cycling key bindings (next/prev) as `[]binding` slice for wiring into the key router

---

## KEY DESIGN PATTERNS AND OBSERVATIONS

### 1. Compile-once, execute-every-frame
`Build()` does ALL reflection. `Execute()` is pure pointer arithmetic. The Template is a flat array of Ops with a parallel geometry array — no tree traversal, no interface dispatch, no allocation in steady state.

### 2. Three-way value resolution (Static/Ptr/Off)
For each value type (string, int, spans), there are three op variants:
- **Static** (OpText): value embedded at compile time
- **Ptr** (OpTextPtr): pointer dereferenced at render time — the reactivity mechanism
- **Off** (OpTextOff): uintptr offset from element base — for ForEach, rebound per-item via pointer arithmetic

### 3. Sub-template pattern
Control flow ops (If, ForEach, Switch) compile their branches as separate sub-Templates. These sub-templates share the same structure but can be independently laid out and rendered with different element bases.

### 4. Function-type-with-methods pattern
`VBoxFn`/`HBoxFn`/`OverlayFn` are function types with methods. The methods return new function values (closures), enabling `VBox.Fill(Red).Gap(2)(children...)`. The package-level vars `VBox`/`HBox`/`Overlay` are callable as functions AND have methods.

### 5. Value-receiver chaining on leaf components
`TextC`, `SpacerC`, `HRuleC`, etc. use value receivers on all methods and return copies. This enables `Text("x").Bold().FG(Red)` without mutation — each call creates a new value.

### 6. Pointer-receiver on stateful components
`ListC[T]`, `CheckboxC`, `RadioC`, `InputC`, `CheckListC[T]` use pointer receivers because they have internal state (cached SelectionList, focused state, etc.).

### 7. Scratch buffer reuse
Template reuses `flexScratchIdx`, `flexScratchGrow`, `flexScratchImpl`, `treeScratchPfx` across frames to avoid allocation in the hot layout path.

### 8. Four-phase layout pipeline
1. **Width distribution** (top-down): containers set children's widths
2. **Layout** (bottom-up): leaves compute heights, containers position children
3. **Flex distribution** (top-down): remaining space distributed to flex children
4. **Render** (top-down): draw to buffer with accumulated absolute positions

### 9. ContentSized flag propagation
When any child has explicit Width, the parent container is marked `ContentSized = true`. This prevents that container from being treated as implicit flex in an HBox — it has fixed-width content.

### 10. Style inheritance (CascadeStyle)
Containers can set `CascadeStyle *Style` which is inherited by all descendants during render. Uses a stack-like save/restore pattern in renderOp. Attributes are merged (OR'd), FG/BG inherited if not set, Fill cascades as BG through containers.

### 11. Dual API
The codebase maintains BOTH the old "Node struct" API (TextNode, HBoxNode, VBoxNode, etc. in tui.go) and the new "functional component" API (TextC/Text, VBoxC/VBox, HBoxC/HBox, etc. in components.go). Both compile down to the same Op types. The compile() type switch handles both.
</task_result>