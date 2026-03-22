# DPMS Next.js Visualisation Platform — Full Plan

## 1. System Architecture

```
Supabase
├── fault_events        (real-time fault stream)
├── spdu_readings       (raw telemetry per SPDU)
├── spdu_registry       (static: lat/lon/feeder/order)
├── transformer_status  (DCA + transformer readings)
└── accounts            (customer → SPDU mapping)
       │
       │  Supabase JS client (real-time subscriptions)
       ▼
Next.js 14 App Router
├── /dashboard          (live KPI overview)
├── /network            (3D electrical network view)
├── /map                (geospatial fault map)
├── /faults             (fault event log + analytics)
├── /accounts           (customer account management)
└── /transformer        (transformer + DCA panel)
```

---

## 2. Supabase Schema

Every table has `created_at timestamptz default now()`.

### spdu_registry — static, seeded once from spdu_registry_LCU_001.json
```sql
spdu_id       text primary key,
lcu_id        text not null,
feeder_id     int  not null,   -- 1=North 2=East 3=South 4=West
feeder_order  int  not null,   -- position along feeder (0 = closest to substation)
lat           float not null,
lon           float not null
```

### spdu_readings — appended on every LCU cycle
```sql
id            uuid primary key default gen_random_uuid(),
spdu_id       text references spdu_registry,
lcu_id        text,
v_a, v_b, v_c float,
i_a, i_b, i_c float,
p_active      float,   -- kW
q_reactive    float,   -- kVAR
pf            float,
thd_i         float,
relay_state   text,    -- 'CLOSED' | 'OPEN'
last_gasp     boolean,
timestamp     timestamptz
```

### fault_events — one row per detected fault
```sql
id            uuid primary key default gen_random_uuid(),
spdu_id       text references spdu_registry,
lcu_id        text,
fault_type    text,    -- 'Three-Phase Fault (L-L-L)', 'Arcing Fault (HIF)', etc.
severity      text,    -- 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
v_a, v_b, v_c float,
i_a, i_b, i_c float,
thd_i         float,
lat           float,
lon           float,
resolved      boolean default false,
timestamp     timestamptz
```

### transformer_status — one row per LCU DCA cycle
```sql
id                  uuid primary key default gen_random_uuid(),
lcu_id              text,
i_transformer       float,
i_spdu_sum          float,
i_line_loss         float,
i_residual          float,
dca_anomaly         boolean,
timestamp           timestamptz
```

### accounts — customer records
```sql
account_id    uuid primary key default gen_random_uuid(),
customer_name text,
meter_number  text unique,
spdu_id       text references spdu_registry,
tariff_band   text,    -- 'A' | 'B' | 'C' | 'D' | 'E'  (IKEDC bands)
credit_balance float,
relay_state   text,    -- mirrors live relay state from spdu_readings
status        text     -- 'ACTIVE' | 'DISCONNECTED' | 'SUSPENDED'
```

### silent_events — SPDUs that went silent
```sql
id         uuid primary key default gen_random_uuid(),
spdu_id    text references spdu_registry,
lcu_id     text,
cause      text,   -- 'Blackout (Last Gasp confirmed)' | 'Comms Failure (No Last Gasp)'
timestamp  timestamptz
```

---

## 3. Next.js Project Structure

```
dpms-dashboard/
├── app/
│   ├── layout.tsx                  # Root layout, sidebar nav, theme
│   ├── dashboard/page.tsx          # Live KPI overview
│   ├── network/page.tsx            # 3D network view
│   ├── map/page.tsx                # Geospatial fault map
│   ├── faults/page.tsx             # Fault event log + charts
│   ├── accounts/page.tsx           # Account management table
│   └── transformer/page.tsx        # Transformer + DCA panel
├── components/
│   ├── network/
│   │   ├── NetworkScene.tsx        # Three.js canvas root
│   │   ├── TransformerNode.tsx     # 3D transformer box
│   │   ├── SPDUNode.tsx            # 3D SPDU pole with fault colour
│   │   ├── FeederLine.tsx          # 3D cable between nodes
│   │   └── FaultIndicator.tsx      # Pulsing ring + label on fault node
│   ├── map/
│   │   ├── FaultMap.tsx            # Mapbox GL map
│   │   └── SPDUMarker.tsx          # Coloured circle marker per SPDU
│   ├── dashboard/
│   │   ├── KPICard.tsx             # Single metric card
│   │   ├── FaultRateChart.tsx      # Recharts line chart
│   │   ├── FaultTypeDonut.tsx      # Recharts pie chart
│   │   └── LiveFaultFeed.tsx       # Scrolling real-time fault list
│   ├── faults/
│   │   ├── FaultTable.tsx          # Sortable/filterable fault log
│   │   └── SeverityBadge.tsx       # CRITICAL/HIGH/MEDIUM/LOW pill
│   ├── transformer/
│   │   ├── DCAGauge.tsx            # Residual current gauge
│   │   └── TransformerChart.tsx    # i_transformer vs i_spdu_sum over time
│   └── ui/
│       ├── Sidebar.tsx
│       ├── TopBar.tsx
│       └── StatusDot.tsx           # Green/amber/red live indicator
├── lib/
│   ├── supabase.ts                 # createClient singleton
│   ├── realtime.ts                 # Supabase channel subscriptions
│   └── severity.ts                 # Severity → colour/label mapping
├── hooks/
│   ├── useFaultEvents.ts           # Real-time fault_events subscription
│   ├── useSPDUReadings.ts          # Latest reading per SPDU
│   └── useTransformerStatus.ts     # Latest DCA row
└── types/
    └── dpms.ts                     # TypeScript interfaces for all tables
```

---

## 4. Page-by-Page Specification

### /dashboard — Command Overview
- 6 KPI cards: Total SPDUs | Active Faults | CRITICAL count | Fault Rate % | Avg Voltage | DCA Residual
- Live fault feed (last 20 events, auto-scrolling, colour-coded by severity)
- Fault rate line chart — last 60 minutes, one point per minute
- Fault type donut chart — breakdown of current active faults
- All data via Supabase real-time subscription on `fault_events`

### /network — 3D Electrical Network
Built with Three.js via React Three Fiber.

**Layout logic:**
- Transformer rendered at scene origin `(0, 0, 0)` as a grey metallic box
- 4 feeders radiate outward at 0°/90°/180°/270° (N/E/S/W)
- Each SPDU is a vertical pole cylinder, positioned by `feeder_order` along its feeder axis
- Electrical lines are `TubeGeometry` connecting transformer → SPDU_001 → SPDU_002 → ... along each feeder
- Camera starts at 45° isometric angle, `OrbitControls` for rotation/zoom

**Fault visualisation:**
| State | Pole Colour | Line |
|---|---|---|
| Normal | Grey | White |
| LOW (Incipient) | Yellow | Yellow glow |
| MEDIUM (L-G, Undervoltage) | Orange | Orange |
| HIGH (Phase Failure, L-L, Theft) | Red | Red, slow pulse |
| CRITICAL (L-L-L, Arcing, Line Break) | Bright red | Red, fast pulse + floating label |
| Blackout/Silent | Black | Dashed indicator |

**Interactions:**
- Click any SPDU node → side panel: `spdu_id`, feeder, last reading (V/I/PF/THD), fault type, timestamp, linked account
- Hover → tooltip with `spdu_id` and current severity
- Top-right legend panel
- "Live" toggle — scene updates as Supabase real-time pushes new fault events

### /map — Geospatial View
Built with Mapbox GL JS via `react-map-gl`.
- Base map: Mapbox dark style centred on Lagos (6.50°N, 3.40°E)
- Each SPDU rendered as a circle marker, colour = severity (same palette as 3D view)
- Feeder lines rendered as GeoJSON `LineString` layers connecting poles in `feeder_order`
- Transformer rendered as a distinct diamond marker at substation centre
- Click marker → same side panel as 3D view
- Filter bar: filter by feeder (1–4), severity, fault type
- Heatmap layer toggle — density of faults across the network

### /faults — Fault Event Log
- Full sortable table: `timestamp | spdu_id | feeder | fault_type | severity | V_avg | I_avg | THD | resolved`
- Filter by: severity, fault_type, feeder_id, date range
- "Mark Resolved" button per row → updates `resolved = true` in Supabase
- Export to CSV button
- Bar chart: fault counts by type for selected date range
- Timeline chart: fault events over time (scatter plot, colour = severity)

### /accounts — Customer Account Management
- Table: `account_id | customer_name | meter_number | spdu_id | tariff_band | credit_balance | relay_state | status`
- Relay state column shows live CLOSED/OPEN badge (green/red)
- "Disconnect" / "Reconnect" button → updates `relay_state` in accounts table and writes a command record
- Filter by: status, tariff_band, feeder
- Search by name or meter number
- Account detail modal: full reading history for linked SPDU, fault history, credit top-up log

### /transformer — Transformer & DCA Panel
- Large DCA residual gauge (0–50A, red zone > 10A)
- Line chart: `i_transformer` vs `i_spdu_sum + i_line_loss` over last 100 cycles — the gap is the residual
- DCA anomaly event log: `timestamp | i_transformer | i_spdu_sum | i_residual`
- Transformer health KPIs: current load %, power factor, apparent power kVA

---

## 5. Key Libraries

| Purpose | Library |
|---|---|
| 3D rendering | `@react-three/fiber` + `@react-three/drei` |
| Geospatial map | `react-map-gl` + Mapbox GL JS |
| Charts | `recharts` |
| Supabase client | `@supabase/supabase-js` |
| UI components | `shadcn/ui` (Tailwind-based) |
| Animations | `framer-motion` (fault pulse effects) |
| Table | `@tanstack/react-table` |
| Date handling | `date-fns` |

---

## 6. Real-Time Data Flow

```
Supabase INSERT (from LCU)
        │
        │  Supabase Realtime channel
        ▼
useFaultEvents() hook
        │
        │  React state update
        ▼
NetworkScene re-renders affected SPDUNode colour
FaultMap re-renders affected marker colour
LiveFaultFeed prepends new row
KPI cards recount
```

One channel per table. Components consume via hooks, not direct subscriptions, so the channel is shared and not duplicated per component mount.

```ts
// lib/realtime.ts
supabase
  .channel('fault_events')
  .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'fault_events' },
      (payload) => onNewFault(payload.new))
  .subscribe()
```

---

## 7. Severity Colour System

Consistent across all views (3D, map, table, badges).

| Severity | Hex | Fault Types |
|---|---|---|
| CRITICAL | `#FF2D2D` | L-L-L, Arcing, Line Break, Blackout |
| HIGH | `#FF6B00` | Phase Failure, L-L, L-L-G, Theft, Overload |
| MEDIUM | `#FFB800` | L-G, Undervoltage, Overvoltage |
| LOW | `#4FC3F7` | Incipient Fault |
| INFO / Normal | `#22C55E` | Normal Operation |
| Silent / Unknown | `#6B7280` | Comms Failure, no data |

---

## 8. Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...
```

---

## 9. Build Order

Each step is independently testable before moving to the next.

| Step | Task | Notes |
|---|---|---|
| 1 | Supabase schema SQL | Create all 6 tables, enable real-time on `fault_events` + `spdu_readings` |
| 2 | Next.js scaffold | Install all libraries, set up `lib/supabase.ts` with env vars |
| 3 | Types + hooks | `types/dpms.ts`, `useFaultEvents`, `useSPDUReadings`, `useTransformerStatus` |
| 4 | `/dashboard` | KPI cards + live feed — confirms real-time pipeline end-to-end |
| 5 | `/faults` | Table + charts, no 3D dependency |
| 6 | `/map` | Mapbox markers + feeder lines |
| 7 | `/network` | 3D scene — most complex, but data pipeline already proven |
| 8 | `/accounts` + `/transformer` | Final pages, straightforward once UI patterns are established |
