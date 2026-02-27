# ThreatSense Frontend Architecture Documentation

## Executive Summary

ThreatSense is an enterprise-grade cybersecurity SaaS platform built with React 18, React Router v6, and Tailwind CSS. The application provides post-login behavioral analytics using Isolation Forest machine learning algorithms to detect anomalies, insider threats, and zero-day attacks across role-based user sessions. The frontend architecture implements a dual-module system separating Sales/Business operations from Security Operations Center (SOC) functionality, each with dedicated layouts, routing, and visual theming.

**Technology Stack:**
- React 18.3.1
- React Router DOM 6.28.0
- Tailwind CSS (utility-first styling)
- Custom SVG-based data visualizations
- Inter font family (primary typography)

**Architecture Pattern:** Component-based architecture with layout composition, route-based code splitting, and inline styling for dynamic theming.

---

## Global Architecture

### Application Structure

```
src/
├── components/          # Shared navigation and branding components
│   ├── Navbar.jsx      # Context-aware navigation bar
│   ├── Sidebar.jsx     # Sales module sidebar navigation
│   ├── SOCSidebar.jsx  # SOC module sidebar navigation
│   └── ThreatSenseLogo.jsx  # Enterprise SVG logo component
├── pages/              # Page-level components
│   ├── soc/           # SOC module pages (isolated subdirectory)
│   │   ├── SOCDashboard.jsx
│   │   ├── BlueTeam.jsx
│   │   ├── RedTeam.jsx
│   │   ├── SOCAnalyst.jsx
│   │   └── SOCLogs.jsx
│   ├── LandingPage.jsx
│   ├── Dashboard.jsx
│   ├── Departments.jsx  # Department page exports
│   ├── HR.jsx
│   ├── Sales.jsx
│   └── Support.jsx
├── App.jsx             # Root routing and layout composition
├── index.css           # Global styles and font imports
├── App.css             # Layout and animation definitions
└── layouts.css         # Reusable card and grid systems
```

### Layout System

The application implements two distinct layout wrappers:

**1. DashboardLayout (Sales/Business Module)**
- Dark navy gradient background (#0f1729 → #1a2332)
- Blue-purple-cyan radial gradient overlays (subtle, 0.08-0.15 opacity)
- 50px grid pattern with blue accent lines
- 20-second gradient pulse animation
- Fixed navbar + Sidebar navigation
- Main content area with 250px left margin

**2. SOCLayout (Security Operations Module)**
- Identical base background to DashboardLayout
- Red-orange-blue radial gradient overlays (threat-focused palette)
- Same grid pattern and animation system
- Fixed navbar + SOCSidebar navigation
- Maintains consistent spacing and structure

Both layouts use fixed positioning with z-index layering (-3 to -1) for background elements, ensuring content remains above decorative layers.

---

## Routing Structure

### Route Hierarchy

```
/ (Root)
├── / → LandingPage
├── /demo → DemoPage
├── /dashboard/* → DashboardLayout
│   ├── /dashboard → Dashboard (index)
│   ├── /dashboard/roles → RolesPage
│   ├── /dashboard/owner → Owner
│   ├── /dashboard/finance → Finance
│   ├── /dashboard/sales → Sales
│   ├── /dashboard/hr → HR
│   ├── /dashboard/support → Support
│   └── /dashboard/alerts → Alerts (placeholder)
├── /soc/* → SOCLayout
│   ├── /soc → SOCDashboard (index)
│   ├── /soc/blue → BlueTeam
│   ├── /soc/red → RedTeam
│   ├── /soc/analyst → SOCAnalyst
│   └── /soc/logs → SOCLogs
└── * → Navigate to /
```

### Navigation Logic

**Context-Aware Navbar:**
- Detects current route using useLocation() hook
- Displays "Switch to SOC" button when in /dashboard/* routes
- Displays "Back to Sales" button when in /soc/* routes
- Provides logout functionality (navigates to landing page)
- Shows "Business User" label and "Business View" badge

**Sidebar Active State:**
- Uses location.pathname comparison for active link highlighting
- Sales Sidebar: 5 menu items (Dashboard, HR, Sales, Support, SOC Team)
- SOC Sidebar: 5 menu items (Dashboard, Blue Team, Red Team, SOC Analyst, Logs)
- Active links receive distinct background color (#334155) and accent color

**Route Isolation:**
- Sales and SOC modules are completely isolated at the routing level
- No shared state between modules
- Independent navigation trees
- Separate sidebar components prevent cross-contamination

---

## Module Breakdown

### 1. Landing Page Module

**Purpose:** Marketing and authentication entry point for the platform.

**Major Sections:**
1. Hero Section with AI Security Engine visualization
2. Threat landscape explanation (3-card grid)
3. Role-Based Behavioral Intelligence selector
4. ML Intelligence Engine explanation (Isolation Forest)
5. System Architecture diagram (3-layer visualization)
6. Enterprise Value proposition (4-card grid)
7. Call-to-action section
8. Login modal overlay

**Components Used:**
- ThreatSenseLogo (36px size in navbar)
- Custom SVG network mesh animation
- Interactive role selector with state management
- Modal overlay with form handling

**Data Structures:**
```javascript
roles = {
  Owner: "description",
  Finance: "description",
  Sales: "description",
  Support: "description"
}
```

**Interaction Patterns:**
- Scroll-based reveal animations (IntersectionObserver)
- Role tab switching with active state
- Modal open/close with body scroll lock
- Email-based routing (SOC keyword detection)

**Visual Hierarchy:**
- Large hero title (gradient text)
- Animated SVG business system nodes
- Glassmorphic cards with hover effects
- Sticky navbar with scroll-based styling

---

### 2. Sales Dashboard Module

**Purpose:** CRM operations and revenue tracking with behavioral monitoring overlay.

**Major Sections:**
1. Sales Overview (KPI strip with 3 metrics)
2. Conversion Rate (circular progress chart)
3. Revenue Growth (custom SVG line chart)
4. Deal Pipeline (data table)
5. Appointments & Interactions (two-column grid)
6. Monitoring Panel (risk score overlay)

**Components Used:**
- Custom SVG circular progress chart
- Custom SVG line chart with grid lines
- Data tables with status badges
- Monitoring overlay panel

**Data Structures:**
```javascript
salesMetrics = {
  totalRevenue: string (₹ format),
  totalLeads: string,
  activeDeals: string,
  conversionRate: number
}

chartData = [
  { month: string, revenue: number }
]

deals = [
  { id, customer, company, value, status, executive, lastContact }
]
```

**Charts Used:**
- Circular progress chart (SVG-based, 180x180 viewBox)
- Line chart with grid (SVG-based, 500x250 viewBox)
- Both use custom calculations for path generation

**Currency Format:** Indian Rupee (₹) with lakhs notation

---

### 3. HR Dashboard Module

**Purpose:** Workforce management and employee lifecycle monitoring.

**Major Sections:**
1. KPI Strip (4 metrics: total, active, departed, avg tenure)
2. Department Distribution (custom SVG pie chart)
3. Employee Directory (searchable, filterable table with pagination)

**Components Used:**
- Custom SVG pie chart (500x300 viewBox)
- Search input with real-time filtering
- Department filter dropdown
- Pagination controls

**Data Structures:**
```javascript
employees = [
  { name, email, department, role, status, hireDate }
]

deptData = [
  { name, value, color }
]
```

**Interaction Patterns:**
- Search by name or email (case-insensitive)
- Filter by department (dropdown)
- Pagination (10 items per page)
- Tenure calculation (months from hire date)

---

### 4. Support Dashboard Module

**Purpose:** Customer service workflow coordination and task management.

**Major Sections:**
1. Task Scheduling (data table)
2. Workflow Coordination (Kanban-style board)
3. Deal Appointment Management (data table)

**Components Used:**
- Data tables with priority badges
- Workflow board (3 columns: Pending, In Progress, Resolved)
- Workflow cards with case information

**Data Structures:**
```javascript
tasks = [
  { taskId, client, priority, scheduledTime, assignedTo }
]

workflow = {
  pending: [{ caseId, client, assignedAgent, lastUpdate }],
  inProgress: [...],
  resolved: [...]
}
```

---

### 5. SOC Dashboard Module (Integrated)

**Purpose:** Unified Security Operations Center command center integrating analyst, blue team, and red team functions.

**Major Sections:**
1. Metrics Grid (4 KPI cards)
2. Threat Severity Panel (horizontal bar chart with 3-column grid layout)
3. Monitoring Cards (3 status indicators)
4. SOC Analyst Console (alerts, session intelligence, action buttons)
5. Blue Team Oversight (risk distribution, trend analysis, department table)
6. Red Team Simulation (controls, risk visualization, findings)
7. Lifecycle Strip (workflow visualization)

**Threat Severity Panel Design:**
- 3-column grid layout (200px | 1fr | 80px)
- Horizontal bars at 70% max width
- Muted red gradient (#8B1E1E → #B22222)
- Top 3 threats emphasized with left border and deeper shadow
- Subtle background track (rgba(148, 163, 184, 0.08))
- Rounded corners (10px radius)
- Fade-in animation (0.8s ease)

**Data Structures:**
```javascript
attackData = [
  { name: string, value: number }
].sort((a, b) => b.value - a.value)

metrics = [
  { label, value, status }
]

alerts = [
  { id, user, risk, time }
]
```

**State Management:**
- timeRange state for trend analysis toggle (24h/7d)
- No external state management library
- Local component state only

---

### 6. Blue Team Module

**Purpose:** Defensive perimeter monitoring and asset protection.

**Major Sections:**
1. Real-time Defense Grid (6 infrastructure nodes)
2. Threat Mitigation Panel (4 threat categories)
3. Overall Health Score Card

**Components Used:**
- Custom SVG icons (11 different security icons)
- Defense node cards with progress bars
- Threat metric bars with color coding
- Health score display

**Data Structures:**
```javascript
defenseNodes = [
  { name, status, load, icon }
]

threats = [
  { label, value, color, icon }
]
```

---

### 7. Red Team Module

**Purpose:** Adversary simulation and vulnerability assessment.

**Major Sections:**
1. KPI Strip (4 metrics with icons and IDs)
2. Attack Success Rate Chart (custom SVG line chart)
3. Recent Findings Panel (vulnerability list)

**Charts Used:**
- Area chart with gradient fill (700x300 viewBox)
- Red color scheme (#dc2626)
- Grid lines at 25% intervals
- Polyline with circular markers

---

### 8. SOC Analyst Module

**Purpose:** Individual analyst workspace for incident investigation.

**Major Sections:**
1. Active Incidents Panel (incident cards)
2. Real-Time Alerts Feed (alert stream)
3. Tools Section (3 tool cards)

**Data Structures:**
```javascript
incidents = [
  { id, type, severity, status, time }
]

alerts = [
  { time, message, level }
]
```

---

## UI Design System

### Color Palette

**Primary Colors:**
- Blue: #3b82f6 (primary actions, links, charts)
- Purple: #8b5cf6 (secondary accents, gradients)
- Cyan: #22d3ee (tertiary accents, highlights)

**Threat/Alert Colors:**
- Critical Red: #dc2626, #ef4444
- High Orange: #fb923c
- Medium Yellow: #f59e0b
- Low Green: #22c55e

**Neutral Colors:**
- Background Dark: #0f172a, #1a2332
- Card Background: rgba(30, 41, 59, 0.6)
- Border: rgba(59, 130, 246, 0.2-0.3)
- Text Primary: #ffffff, #e2e8f0
- Text Secondary: #94a3b8, #64748b

**SOC-Specific Colors:**
- Muted Red Gradient: #8B1E1E → #B22222
- Background Track: rgba(148, 163, 184, 0.08)
- Border Accent: rgba(220, 38, 38, 0.8)

### Typography System

**Font Family:**
- Primary: Inter (400, 500, 600, 700 weights)
- Imported via Google Fonts CDN
- Applied globally via body selector

**Font Sizes:**
- Page Title: 2rem (32px)
- Section Title: 1.75rem (28px)
- Panel Title: 1.125rem (18px)
- Body Text: 0.875rem (14px)
- Small Text: 0.75rem (12px)
- Metric Value: 1.75rem-2rem (28-32px)

### Glassmorphism Implementation

**Card Structure:**
```css
background: rgba(30, 41, 59, 0.6)
backdrop-filter: blur(20px)
border: 1px solid rgba(59, 130, 246, 0.2-0.3)
border-radius: 12-16px
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3)
```

**Hover Effects:**
```css
transform: translateY(-4px)
box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4)
transition: all 0.3s ease
```

### Animation Usage

**Gradient Pulse (Background):**
```css
@keyframes gradientPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.9; }
}
animation: gradientPulse 20s ease-in-out infinite
```

**Fade In (Content):**
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
animation: fadeIn 0.8s ease
```

**Animation Philosophy:**
- Calm and subtle only
- 60fps friendly (transform, opacity)
- Slow durations (10s+ for ambient, 0.3s for interactions)
- No neon or flashy effects

---

## Data Flow & Integration

### State Management Structure

**No External State Management:**
- All state is local component state using React hooks
- No Redux, Zustand, or Context API implementation
- Each page manages its own data independently

**useState Patterns:**
```javascript
// Sales page
const [salesMetrics, setSalesMetrics] = useState({})
const [chartData, setChartData] = useState([])

// HR page
const [searchTerm, setSearchTerm] = useState('')
const [currentPage, setCurrentPage] = useState(1)

// SOC Dashboard
const [timeRange, setTimeRange] = useState('24h')
```

### API Integration Points

**Current Implementation:**
- All data is hardcoded/mocked within components
- No actual API calls implemented
- useEffect hooks simulate data loading

**Expected Integration Points:**
1. Sales metrics endpoint
2. Deal pipeline endpoint
3. Employee directory endpoint
4. SOC threat data endpoint
5. Alert feed WebSocket connection
6. Incident management API
7. Simulation control API

### Chart Data Feeding System

**Custom SVG Charts:**
- All charts are custom-built using SVG elements
- No external charting libraries
- Data transformation happens in component logic

**Chart Data Flow:**
1. Raw data stored in component state
2. Calculations performed inline or in render logic
3. SVG paths/coordinates computed dynamically
4. Rendered directly in JSX

---

## Cross-Module Data Flow

### Navigation Context Sharing

**Shared via React Router:**
- useLocation() hook provides current pathname
- useNavigate() hook enables programmatic navigation
- No prop drilling or context required

**Module Switching:**
1. User clicks "Switch to SOC" in Navbar
2. navigate('/soc') called
3. Route changes, SOCLayout renders
4. SOCSidebar replaces Sidebar
5. Background gradient shifts to red-orange theme

### Logo Component Reuse

**ThreatSenseLogo Component:**
- Used in LandingPage navbar (36px)
- Used in Sidebar brand section (50px)
- Used in SOCSidebar brand section (50px)
- Accepts size prop for responsive sizing
- 500x500 viewBox scales proportionally

### No Shared State Between Modules

**Isolation Strategy:**
- Sales and SOC modules are completely independent
- No shared data stores
- No cross-module communication
- Each module fetches its own data

---

## Strengths

### 1. Clean Separation of Concerns
- Sales and SOC modules are architecturally isolated
- Clear routing boundaries prevent module interference
- Dedicated sidebars and layouts for each context

### 2. Consistent Design Language
- Unified glassmorphism aesthetic across all modules
- Consistent color palette and typography
- Reusable card and grid systems

### 3. Custom Data Visualization
- No external chart library dependencies
- Full control over chart styling and behavior
- Lightweight SVG-based implementations

### 4. Scalable Component Structure
- Modular page components
- Reusable UI patterns
- Clear file organization

### 5. Performance-Friendly Animations
- Transform and opacity only (GPU-accelerated)
- Slow, subtle animations
- No layout thrashing

### 6. Security-First Theming
- Distinct visual identity for SOC module
- Threat-focused color palette (muted reds)
- Professional, non-gaming aesthetic

---

## Improvement Opportunities

### 1. State Management
**Current:** Local component state only
**Opportunity:** Implement Context API or lightweight state management for user authentication state and shared configuration

### 2. API Integration
**Current:** Hardcoded mock data
**Opportunity:** Implement RESTful API client and WebSocket connections for real-time alerts

### 3. Code Splitting
**Current:** All components loaded upfront
**Opportunity:** Implement React.lazy() for route-based code splitting

### 4. TypeScript Migration
**Current:** JavaScript with no type safety
**Opportunity:** Migrate to TypeScript for type-safe props and state

### 5. Testing Infrastructure
**Current:** No tests present
**Opportunity:** Implement Jest + React Testing Library

### 6. Accessibility Enhancements
**Current:** Basic semantic HTML
**Opportunity:** Add ARIA labels, keyboard navigation, and screen reader optimization

### 7. Performance Optimization
**Current:** No optimization strategies
**Opportunity:** Implement React.memo, useMemo/useCallback, and virtual scrolling

### 8. Error Boundaries
**Current:** No error handling
**Opportunity:** Add error boundary components and graceful error UI

---

## Conclusion

ThreatSense represents a well-architected, enterprise-grade cybersecurity SaaS frontend with clear separation between business and security operations. The application demonstrates strong design consistency, custom data visualization capabilities, and a scalable component structure. The dual-module architecture effectively isolates Sales and SOC functionality while maintaining a unified design language.

The codebase is production-ready from a visual and structural perspective but requires backend integration, state management, and testing infrastructure for full deployment. The custom SVG-based charting approach provides flexibility and performance benefits while maintaining design consistency. The glassmorphism aesthetic and calm animation philosophy create a professional, enterprise-appropriate user experience.

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Maintained By:** ThreatSense Engineering Team
