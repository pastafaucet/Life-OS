# Tesla-Style UI Component Library

A comprehensive collection of Tesla-inspired UI components for the Life OS system, featuring sophisticated gradients, smooth animations, and intelligent design patterns.

## Components Overview

### 🎴 TeslaCard
Gradient-based card component with hover effects and customizable colors.

```tsx
import { TeslaCard } from '@/components/TeslaUI';

<TeslaCard gradient="blue" hover={true} onClick={() => {}}>
  <h3>Card Title</h3>
  <p>Card content</p>
</TeslaCard>
```

**Props:**
- `gradient`: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'gray'
- `hover`: boolean (default: true)
- `onClick`: function (optional)

### 🔘 TeslaButton
Professional gradient buttons with loading states and multiple variants.

```tsx
import { TeslaButton } from '@/components/TeslaUI';

<TeslaButton variant="primary" size="md" loading={false}>
  Click Me
</TeslaButton>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `fullWidth`: boolean
- `disabled`: boolean

### 📊 TeslaProgressBar
Animated progress bars with gradient fills and percentage display.

```tsx
import { TeslaProgressBar } from '@/components/TeslaUI';

<TeslaProgressBar 
  value={75} 
  max={100} 
  label="Capacity" 
  color="blue" 
  animated={true}
/>
```

**Props:**
- `value`: number (required)
- `max`: number (default: 100)
- `color`: 'blue' | 'green' | 'orange' | 'red' | 'purple'
- `animated`: boolean (default: true)
- `showPercentage`: boolean (default: true)

### 📈 TeslaMetric
Display key metrics with trend indicators and icons.

```tsx
import { TeslaMetric } from '@/components/TeslaUI';

<TeslaMetric
  label="Task Velocity"
  value="4.2/day"
  trend="up"
  trendValue="+23%"
  color="green"
  icon="🚀"
/>
```

**Props:**
- `label`: string (required)
- `value`: string | number (required)
- `trend`: 'up' | 'down' | 'neutral'
- `trendValue`: string
- `icon`: React.ReactNode
- `color`: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray'

### 🚨 TeslaAlert
Sophisticated alert components with multiple types and dismissible options.

```tsx
import { TeslaAlert } from '@/components/TeslaUI';

<TeslaAlert 
  type="warning" 
  title="Critical Deadline" 
  dismissible={true}
  pulsing={true}
>
  Motion response due tomorrow - 5h work needed
</TeslaAlert>
```

**Props:**
- `type`: 'info' | 'success' | 'warning' | 'error' | 'critical'
- `title`: string (optional)
- `dismissible`: boolean
- `pulsing`: boolean
- `onDismiss`: function

### ⚡ TeslaGauge
Circular progress gauges with smooth animations.

```tsx
import { TeslaGauge } from '@/components/TeslaUI';

<TeslaGauge
  value={78}
  max={100}
  label="Efficiency"
  unit="%"
  color="blue"
  size="md"
/>
```

**Props:**
- `value`: number (required)
- `max`: number (default: 100)
- `min`: number (default: 0)
- `label`: string
- `unit`: string
- `color`: 'blue' | 'green' | 'orange' | 'red' | 'purple'

### 📊 TeslaChart
Interactive charts with grid lines and hover effects.

```tsx
import { TeslaChart } from '@/components/TeslaUI';

const data = [
  { label: 'Mon', value: 12 },
  { label: 'Tue', value: 19 },
  { label: 'Wed', value: 8 }
];

<TeslaChart
  data={data}
  type="bar"
  height={200}
  showGrid={true}
  showLabels={true}
/>
```

**Props:**
- `data`: Array<{ label: string; value: number; color?: string }>
- `type`: 'bar' | 'line' | 'area'
- `height`: number (default: 200)
- `showGrid`: boolean (default: true)
- `showLabels`: boolean (default: true)

### 🟢 TeslaStatusIndicator
Real-time status indicators with pulse animations.

```tsx
import { TeslaStatusIndicator } from '@/components/TeslaUI';

<TeslaStatusIndicator
  status="online"
  label="AI System"
  size="md"
  showPulse={true}
/>
```

**Props:**
- `status`: 'online' | 'offline' | 'warning' | 'error' | 'processing'
- `label`: string
- `size`: 'sm' | 'md' | 'lg'
- `showPulse`: boolean (default: true)

## Design Principles

### 🎨 Tesla-Inspired Aesthetics
- **Gradient Backgrounds**: Rich, multi-layered gradients for depth
- **Smooth Animations**: 200-500ms transitions for professional feel
- **Backdrop Blur**: Subtle glass-morphism effects
- **Intelligent Color Coding**: Semantic colors for different states

### 🚀 Performance Optimized
- **CSS-in-JS**: Tailwind classes for optimal performance
- **Minimal Re-renders**: Efficient React patterns
- **Smooth Animations**: Hardware-accelerated transforms
- **Responsive Design**: Mobile-first approach

### 🧠 AI-Enhanced UX
- **Contextual Colors**: Status-aware color schemes
- **Progressive Disclosure**: Information hierarchy
- **Predictive States**: Loading and processing indicators
- **Intelligent Feedback**: Visual confirmation of actions

## Usage Examples

### Dashboard Layout
```tsx
import { 
  TeslaCard, 
  TeslaMetric, 
  TeslaProgressBar, 
  TeslaAlert 
} from '@/components/TeslaUI';

function Dashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        <TeslaAlert type="critical" pulsing={true}>
          Motion response due tomorrow - 5h work needed
        </TeslaAlert>
        
        <TeslaCard gradient="blue">
          <h2>AI-Prioritized Task Queue</h2>
          {/* Task content */}
        </TeslaCard>
      </div>
      
      {/* Sidebar */}
      <div className="space-y-4">
        <TeslaProgressBar 
          value={78} 
          label="Capacity" 
          color="blue" 
        />
        
        <TeslaMetric
          label="Task Velocity"
          value="4.2/day"
          trend="up"
          trendValue="+23%"
          color="green"
        />
      </div>
    </div>
  );
}
```

## Integration with Life OS

These components are specifically designed for the Life OS Tesla transformation, providing:

- **Consistent Design Language**: All components follow Tesla's sophisticated aesthetic
- **AI Integration Ready**: Built-in support for AI-powered features
- **Cross-Module Compatibility**: Works seamlessly across Tasks, Legal, and other modules
- **Progressive Enhancement**: Graceful degradation for different screen sizes

## Future Enhancements

- **Dark/Light Mode**: Automatic theme switching
- **Custom Animations**: More sophisticated micro-interactions
- **Data Visualization**: Advanced chart types and real-time updates
- **Voice Integration**: Tesla-style voice command support
