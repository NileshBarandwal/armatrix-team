// ========================================
// Main Entry Point - Orchestrates All Modules
// ========================================

import { initLoader } from './animations/loader.js';
import { startWordCycling } from './animations/wordCycling.js';
import { initScrollIndicator } from './animations/scrollIndicator.js';
import { initNavigation } from './utils/navigation.js';
import { initTimeline } from './animations/timeline.js';
import { initInvestorsAnimations } from './animations/investors.js';
import { initBackgroundTransitions } from './animations/backgrounds.js';
import { initFluidSimulationOptimization } from './animations/fluidSimulation.js';
import { initMaskedVideo } from './animations/maskedVideo.js';
import { initArmCurlVideo } from './animations/armCurlVideo.js';
import { initUseCases } from './animations/useCases.js';
import { initArmIntro } from './animations/armIntro.js';

// ========================================
// Initialize on DOMContentLoaded
// ========================================
window.addEventListener('DOMContentLoaded', () => {
    // Always start at the top on page load/refresh
    window.scrollTo(0, 0);

    // Clear any hash from URL without adding to browser history
    if (window.location.hash) {
        history.replaceState(null, null, window.location.pathname + window.location.search);
    }

    // Load fluid simulation immediately (canvas is full screen)
    const script = document.createElement('script');
    script.src = 'fluid/fluid-simulation.js';
    document.body.appendChild(script);

    // Start loading animation (passes startWordCycling callback)
    initLoader(startWordCycling);

    // Initialize scroll indicator
    initScrollIndicator();

    // Initialize navigation
    initNavigation();
});

// ========================================
// Initialize GSAP Animations on Load
// ========================================
window.addEventListener('load', () => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Initialize all GSAP-based animations
    initArmIntro();
    initMaskedVideo();
    initArmCurlVideo();
    initUseCases();
    initTimeline();
    initInvestorsAnimations();
    initBackgroundTransitions();
    initFluidSimulationOptimization();

    // Refresh ScrollTrigger after all animations are established
    ScrollTrigger.refresh();
});
