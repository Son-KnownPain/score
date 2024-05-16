function ssToast(selector, duration = 2000) {
    let timeoutID = null;
    return {
        ssStatus: {
            SUCCESS: 'SUCCESS',
            WARNING: 'WARNING',
            ERROR: 'ERROR',
        },
        ssShow(status = 'SUCCESS', message = 'Message', showDuration = duration) {
            const ssToastElm = document.querySelector(selector);
            if (ssToastElm) {
                // Clear behavior before
                if (timeoutID) clearTimeout(timeoutID)
                ssToastElm.style.display = 'none';
                // Icon
                let icon = '';
                switch(status) {
                    case 'WARNING':
                        icon = 'fa-solid fa-triangle-exclamation text-yellow-500'
                        break
                    case 'ERROR':
                        icon = 'fa-solid fa-xmark text-red-500'
                        break
                    case 'SUCCESS':
                    default:
                        icon = 'fa-regular fa-circle-check text-green-500'
                        break
                }
                // Set
                ssToastElm.classList.add("text-gray-500", "bg-white", "dark:text-gray-400", "dark:bg-gray-800", "p-4", "h-16", "rounded-lg", "flex", "items-center", "justify-center", "fixed", "inset-1", "z-10");
                ssToastElm.innerHTML = `
                    <i class="${icon} text-lg"></i>
                    <div class="ms-3 text-base font-normal">${message}</div>
                `;
                ssToastElm.style.display = 'flex';
                timeoutID = setTimeout(() => {
                    ssToastElm.style.display = 'none';
                }, showDuration)
            }
        },
    }
}