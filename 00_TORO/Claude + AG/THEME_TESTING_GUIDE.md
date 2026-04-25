# 🎨 Theme System Testing Guide

## Overview
This document provides step-by-step verification that the dynamic theme system (Finance-First + Premium Glass) is working correctly.

---

## ✅ Pre-Testing Checklist

Before testing, verify these files exist:

- [ ] `src/styles/themes.css` — CSS variables for both themes
- [ ] `src/context/ThemeContext.tsx` — React context for theme state
- [ ] `src/components/ThemeToggle.tsx` — Theme toggle button
- [ ] `src/app/layout.tsx` — ThemeProvider wrapper + import
- [ ] `src/components/dashboard/MetricCard.tsx` — Updated with theme variables

---

## 🧪 Testing Procedure

### Test 1: Theme Selector Visibility
**Goal**: Confirm the theme toggle button appears in the sidebar

**Steps**:
1. Start dev server: `npm run dev` from `frontend/` directory
2. Open http://localhost:7000 in browser
3. Look for sidebar on the left (may be collapsed on mobile)
4. Scroll down to find section labeled **"TEMA VISUAL"**
5. Should see button with emoji (💰 or ✨)

**Expected Result**:
- Button appears below "PERÍODO DE BÓVEDA" section
- Shows emoji indicator for current theme
- Text label shows "Financiero" or "Premium" (on larger screens)

**Pass** ✅ / **Fail** ❌

---

### Test 2: Theme Toggling
**Goal**: Verify clicking the button switches themes

**Steps**:
1. Click the theme toggle button
2. Observe:
   - Button emoji changes (💰 ↔ ✨)
   - Button label text changes
   - Dashboard numbers should change size
   - Font might change (mono ↔ sans-serif)

**Expected Result**:
- Finance-First: Larger numbers (3.5rem), monospace font, high contrast
- Premium Glass: Moderate numbers (2.5rem), sans-serif, aesthetic styling
- Transition should be smooth (~0.3s)

**Pass** ✅ / **Fail** ❌

---

### Test 3: MetricCard Styling
**Goal**: Confirm MetricCard component responds to theme

**Steps**:
1. Look at main dashboard metrics:
   - "Balance Imperial"
   - "Ingresos Mensuales"
   - "Egresos Mensuales"
2. Switch theme (using toggle button)
3. Observe size and style changes

**Expected Changes**:

| Metric | Finance-First | Premium Glass |
|--------|---|---|
| Value Size | 3.5rem (56px) | 2.5rem (40px) |
| Font | IBM Plex Mono | Inter (sans-serif) |
| Color | #ffffff | #F4DBD8 |
| Card Padding | 1.5rem | 1.75rem |

**Pass** ✅ / **Fail** ❌

---

### Test 4: localStorage Persistence
**Goal**: Verify theme preference is saved and restored

**Steps**:
1. Select Finance-First theme (💰)
2. Refresh the page (F5 or Cmd+R)
3. Check if Finance-First is still selected (should be)
4. Switch to Premium Glass (✨)
5. Close browser tab / window
6. Reopen http://localhost:7000
7. Verify Premium Glass is still selected

**Expected Result**:
- Theme persists across page reloads
- localStorage key: `toro-theme`
- Values: `"finance-first"` or `"premium-glass"`

**To Verify Locally**:
Open browser DevTools → Application → Local Storage → http://localhost:7000
Should see: `toro-theme: "premium-glass"` (or finance-first)

**Pass** ✅ / **Fail** ❌

---

### Test 5: All Components Transition Smoothly
**Goal**: Confirm all dashboard elements transition smoothly

**Steps**:
1. Open dashboard with several cards visible
2. Switch theme rapidly 3-4 times
3. Observe transitions on:
   - Metric values
   - Card backgrounds
   - Borders
   - Text colors
   - Spacing

**Expected Result**:
- All transitions complete within 0.3-0.4 seconds
- No flashing or jarring changes
- No layout shifts (CLS = 0)
- Smooth color interpolation

**Pass** ✅ / **Fail** ❌

---

### Test 6: Responsive Testing
**Goal**: Verify themes work at all viewport sizes

**Steps**:
1. Test at Desktop (1280px+)
   - Full sidebar visible
   - Theme toggle has text label
2. Test at Tablet (768px)
   - May need to open sidebar menu
   - Theme toggle still works
3. Test at Mobile (375px)
   - Theme toggle visible
   - Numbers still readable
   - Card spacing appropriate

**Pass** ✅ / **Fail** ❌

---

### Test 7: CSS Variables Applied
**Goal**: Confirm CSS variables are actually used

**Steps**:
1. Open DevTools → Inspector
2. Click on a MetricCard value
3. Check Styles panel
4. Verify properties use `var(--metric-value-size)`, etc.
5. Switch theme
6. Verify computed values change

**Example Computed Styles**:
```css
/* Finance-First */
font-size: var(--metric-value-size) /* → 3.5rem */
font-family: var(--metric-font-family) /* → IBM Plex Mono */

/* Premium Glass */
font-size: var(--metric-value-size) /* → 2.5rem */
font-family: var(--metric-font-family) /* → Inter, sans-serif */
```

**Pass** ✅ / **Fail** ❌

---

### Test 8: No JavaScript Errors
**Goal**: Verify no console errors during theme switching

**Steps**:
1. Open DevTools → Console
2. Clear console (Ctrl+L or Cmd+K)
3. Switch theme multiple times
4. Check for red error messages

**Expected Result**:
- No errors in console
- Possible warnings are OK (unrelated)
- Theme context provides valid data

**Pass** ✅ / **Fail** ❌

---

## 📊 Results Summary

| Test | Pass | Notes |
|------|------|-------|
| 1. Theme Selector Visibility | [ ] | |
| 2. Theme Toggling | [ ] | |
| 3. MetricCard Styling | [ ] | |
| 4. localStorage Persistence | [ ] | |
| 5. Smooth Transitions | [ ] | |
| 6. Responsive Testing | [ ] | |
| 7. CSS Variables Applied | [ ] | |
| 8. No JavaScript Errors | [ ] | |

**Overall Status**: [ ] ✅ PASS / [ ] ⚠️ PARTIAL / [ ] ❌ FAIL

---

## 🐛 Troubleshooting

### Theme Toggle Not Visible
- [ ] Check if sidebar is visible (may be hidden on mobile)
- [ ] Scroll down in sidebar to find "TEMA VISUAL" section
- [ ] Check browser console for errors

### Theme Changes Not Visible
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Verify `themes.css` is imported in `layout.tsx`
- [ ] Check that `data-theme` attribute is set on `<html>` element
- [ ] Verify CSS file has no syntax errors

### localStorage Not Working
- [ ] Check browser privacy settings (may block localStorage)
- [ ] Verify browser isn't in private/incognito mode
- [ ] Check DevTools → Application → Storage

### Components Don't Respond to Theme
- [ ] Verify components have `'use client'` directive
- [ ] Confirm `useTheme()` hook is imported
- [ ] Check that CSS classes use `var(--metric-value-size)`, etc.

---

## 🚀 Next Steps (After Testing)

Once all tests pass:

1. **Component Adaptation** (In Progress)
   - [x] MetricCard
   - [x] RecentTransactions
   - [x] InsightCard
   - [x] FileUploadZone
   - [x] LiquidityAlert
   - [ ] FlowChart (analytics component)

2. **Unit Tests**
   - [ ] MetricCard snapshot tests for both themes
   - [ ] ThemeContext hook tests
   - [ ] ThemeToggle interaction tests
   - [ ] localStorage persistence tests

3. **Integration Tests**
   - [ ] Full dashboard theme switching
   - [ ] All components respect theme selection
   - [ ] No layout shifts (CLS)
   - [ ] Performance metrics maintained

4. **AG Integration**
   - [ ] Update CLAUDE.md with theme system status
   - [ ] Document theme variables for future components
   - [ ] Add theme testing to CI/CD pipeline

---

## 📝 Notes for Development

### CSS Variable Naming Convention
```css
/* Semantic naming for theme variables */
--metric-value-size      /* Main metric display size */
--metric-label-size      /* Label/description size */
--metric-font-family     /* Font stack (mono vs sans-serif) */
--card-bg                /* Card background */
--card-padding           /* Internal spacing */
--section-gap            /* Space between sections */
```

### Adding New Theme-Aware Components
1. Import `useTheme()` hook
2. Add `'use client'` directive
3. Use CSS classes that reference `var(--metric-value-size)`, etc.
4. Add `transition-all duration-300` for smooth changes
5. Test at both theme settings

---

*Theme System Testing Guide | Sprint 2 CP2 | Updated: 2026-04-09*
