# Design Guidelines: Design Brief & Component Showcase

## Design Approach

**Selected Approach:** Design System (Developer Tool Pattern)  
**Primary References:** Linear, Storybook, Figma, VSCode's interface philosophy  
**Rationale:** This is a developer/designer utility tool requiring clarity, efficiency, and excellent content readability over visual flair.

## Core Design Principles

1. **Content-First Architecture:** Design documentation and components are the stars
2. **Scan-First Hierarchy:** Enable quick navigation and discovery
3. **Workspace Mentality:** Professional tool aesthetic, not marketing site
4. **Contextual Density:** Detailed when needed, spacious for browsing

## Typography System

**Font Stack:**
- Primary: Inter (Google Fonts) - interface elements, navigation, labels
- Secondary: JetBrains Mono (Google Fonts) - file paths, directory names, technical labels
- Content: System default for optimal reading in design briefs

**Hierarchy:**
- Page Titles: text-3xl font-semibold
- Section Headers: text-xl font-medium  
- Tab Labels: text-sm font-medium uppercase tracking-wide
- Body/Navigation: text-base font-normal
- Metadata/Paths: text-xs font-mono
- Component Names: text-lg font-semibold

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16  
Common patterns: p-4, p-6, p-8, gap-4, gap-6, space-y-8

**Grid Structure:**
- Main Container: max-w-7xl mx-auto
- Two-Column Layout: Sidebar (w-64 fixed) + Content (flex-1)
- Component Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Page Brief Grid: grid-cols-1 md:grid-cols-2 gap-8

## Component Library

### A. Navigation & Tabs
**Primary Navigation:**
- Top bar: Full-width, h-16, sticky, includes app title and configuration access

**Tab System:**
- Horizontal tabs (Pages | Components) centered or left-aligned
- Active state with bottom border indicator (border-b-2)
- Clean transitions without animations

### B. Sidebar Navigation
**File Browser Style:**
- Tree structure for nested directories (components)
- Collapsible folders with chevron indicators (Heroicons)
- File items with subtle hover states
- Active file highlighted with distinct treatment
- Indentation: pl-4 per nesting level

### C. Content Display

**Page Brief Cards (Homepage Grid):**
- Card container: rounded-lg border with hover elevation
- Structure: Preview snippet (if available) + Filename + Metadata
- Metadata: Last modified, file path in mono font
- Click target: Entire card navigates to full brief

**Component Preview Cards:**
- Divided layout: Component render area (bg subtle) + Meta panel
- Component name prominently displayed
- File path in small mono font
- Isolated rendering with padding

**Full Page View (Design Brief):**
- Centered content column: max-w-4xl for optimal reading
- Generous vertical spacing: py-12
- Back button sits to the left of filename/path in the header
- JSX renders with full fidelity

### D. Configuration Panel
**Settings Interface:**
- Modal or slide-in panel (right-side drawer)
- Input fields for directory paths (mono font placeholders)
- Clear labels and helper text
- Save/Apply button prominently placed
- Cancel/Close option

### E. Empty States
**No Files Found:**
- Centered message with icon (Heroicons folder-open)
- Helpful text: "No design briefs found in [directory]"
- Suggestion to check configuration
- Call-to-action to configure paths

### F. Icons
**Icon Library:** Heroicons (via CDN)  
**Common Icons:**
- folder, folder-open: Directory states
- document-text: Design brief files
- cube: Components
- cog-6-tooth: Settings/configuration
- chevron-right, chevron-down: Tree navigation
- arrow-left: Back navigation

## Interaction Patterns

**Navigation Flow:**
1. Land on showcase homepage with tabs defaulting to "Pages"
2. Click tab to switch between Pages/Components
3. Click card/item to view full detail
4. Back button returns to showcase grid

**File Discovery Indication:**
- Auto-refresh when files added (if possible)
- Loading state during directory scan
- File count badge in tab labels ("Components (24)")

**Component Isolation:**
- Each component renders in contained environment
- Clear visual boundary between component and interface chrome

## Responsive Behavior

**Mobile (< 768px):**
- Sidebar collapses to hamburger menu
- Single-column card grids
- Tabs remain horizontal but allow scroll if needed

**Tablet (768px - 1024px):**
- Two-column component grid
- Sidebar visible but narrower (w-48)

**Desktop (> 1024px):**
- Full sidebar navigation
- Three-column component grid
- Optimal reading width for design briefs

## Accessibility

- Keyboard navigation through all interactive elements
- Focus indicators on all clickable items
- Semantic HTML throughout
- ARIA labels for icon-only buttons
- Skip-to-content link

## Performance Considerations

- Lazy load component previews as user scrolls
- Virtualize long file lists if directory contains 100+ items
- Memoize component renders to prevent unnecessary re-renders

## No Images/Media
This is a tool interface - no hero images or decorative media needed. Focus on chrome, navigation, and content presentation.
