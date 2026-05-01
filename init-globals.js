import React from 'react';
import * as ReactDOM from 'react-dom/client';
import Chart from 'chart.js/auto';

window.React = React;
window.ReactDOM = ReactDOM;
window.Chart = Chart;

// Polyfills for browser environment
if (typeof global === 'undefined') {
  window.global = window;
}
if (typeof require === 'undefined') {
  window.require = (name) => {
    console.warn(`Attempted to require('${name}'), but require is not defined. Using window fallback.`);
    return window[name];
  };
}
