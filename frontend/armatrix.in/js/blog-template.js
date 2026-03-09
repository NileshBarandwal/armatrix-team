// Blog Template Loader
// Injects common blog structure (navbar, footer, progress bar) into blog post pages

document.addEventListener('DOMContentLoaded', function() {
    // Get blog metadata from the page
    const blogMeta = window.blogMetadata || {};

    // Create navbar
    const navbar = `
        <div class="fixed-navbar fade-in-nav">
            <div class="navbar-content">
                <div class="navbar-logo">
                    <a href="/">
                        <img src="../../assets/images/logo/Logo_2_white.webp" alt="Armatrix Logo" width="120" height="120" style="width:120px;height:120px;object-fit:contain;">
                    </a>
                </div>
                <div class="navbar-title">
                    <a href="/blog">
                        <span style="font-size: 1.5rem; font-weight: 300; color: rgba(255, 255, 255, 0.95);">→</span>
                        <span style="font-family: 'Inter', sans-serif; font-size: 1rem; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255, 255, 255, 0.95);">BLOG</span>
                    </a>
                </div>
            </div>
            <!-- Reading Progress Bar -->
            <div id="reading-progress" style="position: absolute; bottom: 24px; left: 0; height: 3px; width: 0%; background: linear-gradient(90deg, #ffc864 0%, #96b464 100%); transition: width 0.1s ease; z-index: 1000;"></div>
        </div>
    `;

    // Create blog header
    const blogHeader = `
        <div style="margin-bottom: 2rem; padding-top: 1rem;">
            <h1 style="font-family: 'Raleway', sans-serif; font-size: clamp(2.5rem, 6vw, 4rem); font-weight: 300; color: rgba(255, 255, 255, 0.95); letter-spacing: 0.02em; line-height: 1.2;">${blogMeta.title || ''}</h1>
            <div class="blog-meta">
                <span>${blogMeta.date || ''}</span>
            </div>
        </div>
    `;

    // Create featured image section
    const featuredImage = blogMeta.image ? `
        <img src="${blogMeta.image}" alt="${blogMeta.imageAlt || blogMeta.title}" class="blog-header-image" style="width:100%;height:auto;max-width:900px;display:block;">
    ` : '';

    // Create back to blog link
    const backLink = `
        <div style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <a href="/blog" style="font-family: 'Inter', sans-serif; font-size: 1rem; color: #ffc864; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Back to all articles
            </a>
        </div>
    `;


    // Inject navbar at the beginning of body
    document.body.insertAdjacentHTML('afterbegin', navbar);

    // Find the blog container and inject header and image
    const blogContainer = document.querySelector('.blog-container');
    if (blogContainer) {
        blogContainer.insertAdjacentHTML('afterbegin', blogHeader + featuredImage);

        // Find the article element and add back link after it
        const article = blogContainer.querySelector('article');
        if (article) {
            article.insertAdjacentHTML('afterend', backLink);
        }
    }

    // Inject footer via shared utility (dark variant)
    window._nextFooterDark = true;
    const footerScript = document.createElement('script');
    footerScript.src = '../../js/utils/footer.js';
    document.body.appendChild(footerScript);

    // Initialize reading progress bar
    initReadingProgress();
});

// Reading Progress Functionality
function initReadingProgress() {
    window.addEventListener('scroll', function() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Calculate scroll progress
        const scrollableHeight = documentHeight - windowHeight;
        const scrollProgress = (scrollTop / scrollableHeight) * 100;

        // Update progress bar width
        const progressBar = document.getElementById('reading-progress');
        if (progressBar) {
            progressBar.style.width = scrollProgress + '%';
        }
    });
}
