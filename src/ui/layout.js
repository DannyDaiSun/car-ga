const MOBILE_UA_REGEX = /Mobi|Android|iPhone|iPod|iPad/i;

export function getMobileLayoutMode({ userAgent, width, height }) {
    if (!userAgent || !MOBILE_UA_REGEX.test(userAgent)) {
        return 'desktop';
    }

    if (typeof width === 'number' && typeof height === 'number' && width > height) {
        return 'mobile-landscape';
    }

    return 'mobile-portrait';
}

export function applyMobileLayout(doc = document, win = window) {
    const app = doc.getElementById('app');
    if (!app) return 'desktop';

    const mode = getMobileLayoutMode({
        userAgent: win.navigator.userAgent,
        width: win.innerWidth,
        height: win.innerHeight
    });

    app.classList.toggle('mobile-layout', mode !== 'desktop');
    app.classList.toggle('mobile-portrait', mode === 'mobile-portrait');
    app.classList.toggle('mobile-landscape', mode === 'mobile-landscape');

    return mode;
}
