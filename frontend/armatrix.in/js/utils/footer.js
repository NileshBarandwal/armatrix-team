(function () {
    // When loaded via a static <script> tag, read data-dark attribute (defaults to true).
    // When loaded dynamically (e.g. from blog-template.js), read window._nextFooterDark instead,
    // because document.currentScript is null for dynamically-appended scripts.
    let dark;
    if (typeof window._nextFooterDark !== 'undefined') {
        dark = window._nextFooterDark;
        delete window._nextFooterDark;
    } else {
        dark = !document.currentScript || document.currentScript.dataset.dark !== 'false';
    }

    const footerClass = dark ? 'footer footer-dark' : 'footer';

    const html = `
    <footer class="${footerClass}">
        <div class="container">
            <div class="footer-top">
                <div class="footer-logo">
                    <img src="/assets/images/logo/registered_logo.png" alt="Armatrix Logo" width="98" height="50" loading="lazy">
                </div>
                <div class="footer-links">
                    <a href="https://drive.google.com/drive/folders/1Js1km-jlQXZ7qOTnQt3ktVlDKXLuZdQt?usp=sharing" target="_blank" rel="noopener noreferrer" class="footer-link">Media Kit</a>
                    <a href="https://drive.google.com/file/d/1ty-TytK1a0_HvLeUDKtt9Eirrw5tyJTt/view?usp=sharing" target="_blank" rel="noopener noreferrer" class="footer-link">Privacy Policy</a>
                </div>
            </div>
            <div class="footer-divider"></div>
            <div class="footer-bottom">
                <p class="footer-copyright">
                    <svg class="copyright-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M15 9.354a4 4 0 1 0 0 5.292"></path>
                    </svg>
                    Armatrix 2026 All Rights Reserved
                </p>
                <p class="footer-disclaimer">Products under development, currently not for sale</p>
            </div>
        </div>
    </footer>`;

    document.body.insertAdjacentHTML('beforeend', html);
}());
