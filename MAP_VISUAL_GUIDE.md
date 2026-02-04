# Map Visual Guide - What You'll See

**Date**: February 5, 2026

---

## 🗺️ Map Layers Overview

Your map now has **3 main layers** working together:

```
┌─────────────────────────────────────┐
│  🏷️  LABELS (Cities, States)       │  ← TOP (Always visible)
├─────────────────────────────────────┤
│  🌲  FOREST ZONES (Colored)         │  ← MIDDLE (Toggle on/off)
├─────────────────────────────────────┤
│  🗺️  BASE MAP (Street/Satellite)    │  ← BOTTOM (Choose one)
└─────────────────────────────────────┘
```

---

## 📍 What You'll See at Different Zoom Levels

### Zoom Level 5 (India Overview - Default)
```
🇮🇳 INDIA
├─ 🏷️ Labels: Major cities (Mumbai, Delhi, Bangalore, Chennai)
├─ 🏷️ Labels: State names (Maharashtra, Karnataka, Tamil Nadu)
├─ 🌲 Forest Zones: All 10 zones visible with color coding
│   ├─ 🟢 Western Ghats (Healthy)
│   ├─ 🟡 Eastern Ghats (Moderate)
│   ├─ 🟢 Himalayan Forests (Healthy)
│   ├─ 🟠 Central Indian Forests (Poor)
│   └─ ... (6 more zones)
└─ 🗺️ Base: India outline, major roads
```

### Zoom Level 8-10 (State Level)
```
🏛️ STATE VIEW (e.g., Karnataka)
├─ 🏷️ Labels: District names (Bangalore Urban, Mysore, Mangalore)
├─ 🏷️ Labels: Medium cities and towns
├─ 🌲 Forest Zones: Detailed boundaries visible
│   └─ Example: Western Ghats section in Karnataka
└─ 🗺️ Base: State boundaries, highways, rivers
```

### Zoom Level 13+ (City/District Level)
```
🏙️ CITY VIEW (e.g., Bangalore)
├─ 🏷️ Labels: Neighborhood names (Koramangala, Whitefield)
├─ 🏷️ Labels: Street names (MG Road, Brigade Road)
├─ 🏷️ Labels: Landmarks (Parks, Hospitals, Schools)
├─ 🌲 Forest Zones: Precise boundaries if in forest area
└─ 🗺️ Base: Detailed streets, buildings (on Street view)
```

---

## 🎨 Forest Zone Color Coding

When you look at the map, you'll see colored polygons representing forest zones:

| Color | Health Status | Forest Cover | What It Means |
|-------|---------------|--------------|---------------|
| 🟢 **Green** | Healthy | 70%+ | Dense forest, good health |
| 🟡 **Amber** | Moderate | 50-70% | Moderate forest, needs monitoring |
| 🟠 **Orange** | Poor | 30-50% | Sparse forest, intervention needed |
| 🔴 **Red** | Critical | <30% | Severe deforestation, urgent action |

**Opacity**: 25% (semi-transparent so you can see the map underneath)  
**Hover Effect**: Increases to 45% opacity when you hover over a zone

---

## 🖱️ Interactive Features

### Click on a Forest Zone
```
┌─────────────────────────────────────┐
│  Western Ghats                      │
│  ─────────────────────────────────  │
│  States: Kerala, Karnataka, Tamil   │
│          Nadu, Maharashtra          │
│  Forest Cover: 75%                  │
│  NDVI: 0.72                         │
│  Risk Level: LOW                    │
│                                     │
│  Dense tropical forests with high   │
│  biodiversity. UNESCO World         │
│  Heritage Site.                     │
└─────────────────────────────────────┘
```

### Hover Over a Forest Zone
- Zone becomes **brighter** (45% opacity)
- Border becomes **thicker** (3px)
- Cursor changes to **pointer**

### Click on Map (Outside Zones)
- Sets new coordinates
- Updates lat/lng in the sidebar
- Moves the marker to clicked location

---

## 🔄 Switching Base Layers

### Street View (CartoDB Voyager)
```
✅ Best for: General navigation, city planning
✅ Shows: Roads, buildings, parks, water bodies
✅ Labels: Cities, states, streets, landmarks
✅ Forest Zones: Clearly visible on light background
```

### Satellite View (Esri World Imagery)
```
✅ Best for: Vegetation analysis, terrain study
✅ Shows: Actual satellite imagery, real terrain
✅ Labels: Cities, states (overlay on satellite)
✅ Forest Zones: Visible on real forest imagery
```

### Terrain View (OpenTopoMap)
```
✅ Best for: Elevation study, mountain ranges
✅ Shows: Topographic lines, elevation shading
✅ Labels: Cities, states, peaks, valleys
✅ Forest Zones: Visible on terrain background
```

---

## 📊 Example: Viewing Western Ghats

### Step 1: Default View (Zoom 5)
```
You see:
- 🗺️ All of India
- 🏷️ "Mumbai", "Bangalore", "Kerala" labels
- 🌲 Green polygon covering Western Ghats region
- 🟢 Color indicates healthy forest (75% cover)
```

### Step 2: Zoom to Level 8
```
You see:
- 🗺️ Western coast of India
- 🏷️ "Goa", "Mangalore", "Kochi" labels
- 🌲 Detailed Western Ghats boundary
- 🏷️ District names appear
```

### Step 3: Zoom to Level 13
```
You see:
- 🗺️ Specific forest area (e.g., near Coorg)
- 🏷️ Village names, road names
- 🌲 Precise forest zone boundary
- 🏷️ "Coorg", "Madikeri", local landmarks
```

### Step 4: Click on the Zone
```
Popup appears with:
- Zone name: "Western Ghats"
- States covered
- Forest cover: 75%
- NDVI: 0.72
- Risk level: LOW
- Description
```

---

## 🎯 What Makes This Better Than Before

### Before (Without Labels)
```
❌ No city names visible
❌ No state boundaries labeled
❌ Forest zones too faint (15% opacity)
❌ Hard to know where you are
❌ Had to guess locations
```

### After (With Labels + Enhanced Zones)
```
✅ City names at all zoom levels
✅ State names and boundaries
✅ Forest zones clearly visible (25% opacity)
✅ Easy to navigate and identify locations
✅ Professional, map-like experience
```

---

## 🚀 Try It Out!

1. **Start the app**: `npm run dev`
2. **Open the map**: You'll see India with all labels
3. **Zoom in**: Watch city names appear progressively
4. **Click forest zones**: See detailed information
5. **Switch views**: Try Street → Satellite → Terrain
6. **Hover zones**: See the highlight effect

---

## 💡 Pro Tips

1. **Finding a City**: Just zoom in and look for the label
2. **Analyzing Forest Health**: Look at zone colors (Green = Good, Red = Bad)
3. **Best View for Analysis**: Use Satellite view with labels
4. **Comparing Regions**: Zoom out to see multiple zones at once
5. **Detailed Study**: Zoom to level 13+ for street-level detail

---

**Result**: You now have a professional, fully-labeled map with clearly visible forest zones! 🎉
