window.dscoConfig = [
    {
        url: 'https://getdisco.github.io/js-senior-test-task/pages/1.html',
        rootEl: '.output',
        targetEl: '.form__actions > .form__action',
        fields: {
            holderName: {
                search: '[placeholder="Holder name"]',
                required: true
            },
            cardNumber: {
                search: '[placeholder="Card number"]',
                required: true
            },
            expirationDate: {
                search: '[placeholder="Expiry"]',
                required: true
            },
            cvvCvc: {
                search: '[placeholder="CVV/CVC"]',
                required: true
            }
        }
    },
    {
        url: 'https://getdisco.github.io/js-senior-test-task/pages/2.html',
        rootEl: 'body',
        targetEl: '.form__actions > .form__action',
        fields: {
            holderName: {
                search: '[placeholder="Holder name"]',
                required: false
            },
            cardNumber: {
                search: '[placeholder="Card number"]',
                required: true
            },
            expirationDate: {
                search: '[placeholder="Expiry"]',
                required: true
            },
            cvvCvc: {
                search: '[placeholder="CVV/CVC"]',
                required: true
            }
        }
    },
    {
        url: 'https://getdisco.github.io/js-senior-test-task/pages/3.html',
        rootEl: 'body',
        targetEl: '.form__actions > .form__action',
        fields: {
            holderName: {
                search: '[placeholder="Holder name"]',
                required: true
            },
            cardNumber: {
                search: '[placeholder="Card number"]',
                required: true
            },
            expirationDate: {
                search: '[placeholder="Expiry"]',
                required: true
            },
            cvvCvc: {
                search: '[placeholder="CVV/CVC"]',
                required: true
            }
        }
    }
];

const TARGET_FIELDS = {
    holderName: 'Ali Gasymov',
    cardNumber: '5403414685553195',
    expirationDate: '01/25',
    cvvCvc: '123'
}


const ERROR_ROOT_NOT_FOUND = 'Root element not found';
const ERROR_TARGET_NOT_FOUND = 'Unable to insert button. Target element not found';

const buttonConfig = {
    attribute: 'data-dsco-fill-button',
    text: 'Autofill',
    styles: {
        marginLeft: '10px'
    }
}

init();

function init() {
    const configs = window.dscoConfig;
    const currentConfig = configs.find(({ url }) => url === location.origin + location.pathname);
    
    if (!currentConfig) return;
    
    const rootEl = document.querySelector(currentConfig.rootEl);
    if (!rootEl) throw new Error(ERROR_ROOT_NOT_FOUND);
    
    const hasButton = document.querySelector(`[${buttonConfig.attribute}]`)
    
    if (hasRequiredElements(rootEl, currentConfig.fields) && !hasButton) {
        addButton();
    }
    const observerOptions = { childList: true, subtree: true };
    const observer = new MutationObserver(handleRootMutation);
    observer.observe(rootEl, observerOptions);
    
    function handleRootMutation(mutationsList) {
        for (let mutation of mutationsList) {
            const isAdded = [...mutation.addedNodes].length > 0;
            if (isAdded && hasRequiredElements(rootEl, currentConfig.fields) && !hasButton) {
                observer.disconnect();
                addButton(currentConfig);
                observer.observe(rootEl, observerOptions);
            }
        }
    }
}

function hasRequiredElements(root, fields) {
    let requiredCount = 0;
    let foundCount = 0;
    for (let key in fields) {
        if (!fields.hasOwnProperty(key) || !fields[key] || !fields[key].required) continue;
        if (root.querySelector(fields[key].search)) foundCount++;
        requiredCount++;
    }
    return requiredCount !== 0 && requiredCount === foundCount;
}

function addButton(config) {
    const targetEl = document.querySelector(config.targetEl);
    if (!targetEl) throw new Error(ERROR_TARGET_NOT_FOUND);
    
    const button = document.createElement("button");
    button.innerHTML = buttonConfig.text;
    button.setAttribute(buttonConfig.attribute, '1');
    for (let style in buttonConfig.styles) {
        button.style[style] = buttonConfig.styles[style]
    }
    button.addEventListener("click", () => {
        fillFormData(config)
    });
    targetEl.after(button);
}

function fillFormData(config) {
    const rootEl = config.rootEl && document.querySelector(config.rootEl);
    const fields = config.fields;
    for (let key in fields) {
        if (!fields.hasOwnProperty(key) || !fields[key]) continue;
        const isTargetField = Object.keys(TARGET_FIELDS).includes(key);
        const input = rootEl.querySelector(fields[key].search);
        
        if (isTargetField && input && input.nodeName === 'INPUT') {
            input.value = TARGET_FIELDS[key];
        }
    }
}
