# ZENITH – Precision Anatomy Landmarks

This update refines the clickable body-system markers while preserving the existing ZENITH dashboard, blue wireframe astronaut, localized red organ highlights, blue scanner effects, and heart animation.

## Landmark updates
- Brain marker centred within the skull.
- Two separate eye markers aligned horizontally over the left and right eye positions.
- Muscle markers moved inward and slightly down onto the upper-arm biceps region.
- Localized brain, eye and biceps glow overlays moved to match the revised markers.

## Risk Alerts integration
The dashboard's Risk Alerts navigation embeds the existing application from the sibling `../astronaut-risk-alerts` folder. Keep both folders side by side and run this Health Analytics project to use the integrated dashboard; the Risk Alerts app and its styles remain isolated from the main page.

## Mental Wellness and Mission Environment
The Mental Wellness and Mission Environment navigation items embed the existing modules from the sibling `../Mental wellness` and `../mission-environment` folders. They share the dashboard's React instance and are rendered in isolated Shadow Roots; module state remains mounted when switching between views. The host build includes Tailwind CSS for Mission Environment's existing utility styles. Mission Environment continues to request data from NOAA's Space Weather Prediction Center.

## Overview
The Overview navigation item embeds the existing component from `../Overview/src/App.jsx` in its own Shadow Root. Its stylesheet remains isolated, while React, `lucide-react`, and Three.js resolve from the host application's dependencies. Overview's crew and alert values remain illustrative demo data.

## Run
```powershell
npm.cmd install
npm.cmd run dev
```
