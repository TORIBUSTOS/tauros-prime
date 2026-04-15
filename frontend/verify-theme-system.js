#!/usr/bin/env node

/**
 * Theme System Verification Script
 * Run this in browser console after app loads: copy-paste and execute
 *
 * Usage: Paste in DevTools console and press Enter
 */

(function verifyThemeSystem() {
  console.clear();
  console.log('%c🎨 THEME SYSTEM VERIFICATION', 'font-size: 16px; font-weight: bold; color: #C09891;');
  console.log('========================================\n');

  const checks = [];

  // Check 1: ThemeContext is working
  try {
    const htmlElement = document.documentElement;
    const currentTheme = htmlElement.getAttribute('data-theme');
    checks.push({
      name: 'Theme Context Active',
      status: currentTheme ? 'PASS' : 'FAIL',
      detail: `Current theme: ${currentTheme || 'NOT SET'}`
    });
  } catch (e) {
    checks.push({ name: 'Theme Context Active', status: 'ERROR', detail: e.message });
  }

  // Check 2: CSS Variables are loaded
  try {
    const styles = getComputedStyle(document.documentElement);
    const metricSize = styles.getPropertyValue('--metric-value-size').trim();
    const metricFont = styles.getPropertyValue('--metric-font-family').trim();
    const hasVariables = metricSize && metricFont;
    checks.push({
      name: 'CSS Variables Loaded',
      status: hasVariables ? 'PASS' : 'FAIL',
      detail: `Size: ${metricSize || 'NOT FOUND'}, Font: ${metricFont || 'NOT FOUND'}`
    });
  } catch (e) {
    checks.push({ name: 'CSS Variables Loaded', status: 'ERROR', detail: e.message });
  }

  // Check 3: localStorage for theme preference
  try {
    const savedTheme = localStorage.getItem('toro-theme');
    checks.push({
      name: 'localStorage Theme Persistence',
      status: savedTheme ? 'PASS' : 'WARN',
      detail: `Saved theme: ${savedTheme || 'None (will use default)'}`
    });
  } catch (e) {
    checks.push({ name: 'localStorage Theme Persistence', status: 'BLOCKED', detail: e.message });
  }

  // Check 4: Theme toggle button exists
  try {
    const toggleButton = Array.from(document.querySelectorAll('button')).find(btn =>
      btn.innerHTML.includes('💰') || btn.innerHTML.includes('✨')
    );
    checks.push({
      name: 'Theme Toggle Button',
      status: toggleButton ? 'PASS' : 'FAIL',
      detail: toggleButton ? 'Button found' : 'Button not found (check sidebar)'
    });
  } catch (e) {
    checks.push({ name: 'Theme Toggle Button', status: 'ERROR', detail: e.message });
  }

  // Check 5: MetricCard components exist
  try {
    const metricCards = document.querySelectorAll('[class*="metric"]');
    checks.push({
      name: 'MetricCard Components',
      status: metricCards.length > 0 ? 'PASS' : 'FAIL',
      detail: `Found ${metricCards.length} metric components`
    });
  } catch (e) {
    checks.push({ name: 'MetricCard Components', status: 'ERROR', detail: e.message });
  }

  // Check 6: CSS transition support
  try {
    const hasTransition = getComputedStyle(document.body).transition.length > 0 ||
                         document.querySelector('[class*="transition"]') !== null;
    checks.push({
      name: 'Transition Animations',
      status: hasTransition ? 'PASS' : 'WARN',
      detail: 'Smooth transitions configured'
    });
  } catch (e) {
    checks.push({ name: 'Transition Animations', status: 'WARN', detail: e.message });
  }

  // Display results
  console.table(checks);

  // Test theme switching
  console.log('\n%c📋 THEME SWITCH TEST', 'font-size: 14px; font-weight: bold; color: #C09891;');
  console.log('Run these commands to test theme switching:\n');

  console.log('%c// Switch to Finance-First theme', 'color: #888;');
  console.log('document.documentElement.setAttribute("data-theme", "finance-first"); localStorage.setItem("toro-theme", "finance-first");');

  console.log('\n%c// Switch to Premium Glass theme', 'color: #888;');
  console.log('document.documentElement.setAttribute("data-theme", "premium-glass"); localStorage.setItem("toro-theme", "premium-glass");');

  console.log('\n%c// Check current theme', 'color: #888;');
  console.log('console.log(document.documentElement.getAttribute("data-theme"));');

  // Summary
  const passCount = checks.filter(c => c.status === 'PASS').length;
  const totalCount = checks.length;
  const percentage = Math.round((passCount / totalCount) * 100);

  console.log(`\n✅ ${passCount}/${totalCount} checks passed (${percentage}%)`);

  if (percentage === 100) {
    console.log('%c✨ Theme system is fully operational!', 'font-size: 12px; color: #A3E635; font-weight: bold;');
  } else if (percentage >= 80) {
    console.log('%c⚠️  Most checks passed. Some features may be limited.', 'font-size: 12px; color: #F59E0B; font-weight: bold;');
  } else {
    console.log('%c❌ Theme system has issues. Review the checks above.', 'font-size: 12px; color: #EF4444; font-weight: bold;');
  }

  return { checks, passCount, totalCount, percentage };
})();
