/**
 * Dynamic gradient adjustment for all gradient text elements
 * Adjusts gradient background-size based on actual text width
 * to ensure gradient is visible on both short and long text
 *
 * Applies to any text element with gradient using background-clip: text
 */

document.addEventListener('DOMContentLoaded', function() {
    // Select all elements with gradient text effect
    const gradientTextElements = document.querySelectorAll('.gradient-text');

    gradientTextElements.forEach(element => {
        // Skip if element already has explicit background-size set via JS
        if (element.dataset.gradientProcessed) return;
        element.dataset.gradientProcessed = 'true';

        // Create a temporary span to measure actual text width
        const span = document.createElement('span');
        span.style.cssText = 'position: absolute; visibility: hidden; white-space: nowrap;';
        const computedStyle = window.getComputedStyle(element);
        span.style.fontFamily = computedStyle.fontFamily;
        span.style.fontSize = computedStyle.fontSize;
        span.style.fontWeight = computedStyle.fontWeight;
        span.textContent = element.textContent;
        document.body.appendChild(span);

        const actualTextWidth = span.offsetWidth;
        document.body.removeChild(span);

        // Calculate background-size with smooth scaling based on text width
        // Uses linear interpolation: multiplier increases proportionally with text width
        // Formula: 1.0 + (textWidth / 500)
        // Results: 100px→1.2x, 250px→1.5x, 500px→2.0x, 750px→2.5x
        const backgroundSizeMultiplier = 1.0 + (actualTextWidth / 500);

        const backgroundSize = Math.ceil(actualTextWidth * backgroundSizeMultiplier);
        element.style.backgroundSize = `${backgroundSize}px`;
    });
});
