(async function () {
    const ERROR_MESSAGES = {
        CONFIG_NOT_FOUND: 'Configuration not found',
        ROOT_NOT_FOUND: 'Root element not found',
        TARGET_NOT_FOUND: 'Unable to insert button. Target element not found',
        MISSING_CONFIGURATION: 'Has no configuration found for this URL',
        FRAME_NOT_FOUND: 'Unable to locate iframe by frameEl',
        FRAME_LOAD_ERROR: 'Unable to load frame data'
    };
    
    const getConfig = async () =>  {
        try {
            const response = await fetch('https://vanhock.github.io/discotest/configs')
            return await response.json();
        } catch (e) {
            throw new Error(ERROR_MESSAGES.CONFIG_NOT_FOUND);
        }
    }
    
    const config = await getConfig();
    
    const buttonConfig = config.buttonConfig;
    const templates = config.templates;
    const targetFields = config.targetFields;
    const path = location.origin + location.pathname;
    const currentTemplate = templates.find(currentConfig => currentConfig && (currentConfig.url === path));
    
    if (!currentTemplate) return console.log(ERROR_MESSAGES.MISSING_CONFIGURATION);
    
    if (currentTemplate.useFrame) await initFrame();
    
    const rootEl = currentTemplate.useFrame ?
        document.querySelector(currentTemplate.frameEl).contentDocument.querySelector(currentTemplate.rootEl) :
        document.querySelector(currentTemplate.rootEl);
    
    if (!rootEl) throw new Error(ERROR_MESSAGES.ROOT_NOT_FOUND);
    const hasButton = document.querySelector(`[${buttonConfig.attribute}]`);
    
    if (hasRequiredElements(rootEl, currentTemplate.fields) && !hasButton) {
        addButton(fillFormData);
    }
    
    initDomObserver(() => {
        addButton(fillFormData);
    });
    
    function initDomObserver(callback) {
        const observerOptions = {childList: true, subtree: true};
        const hasButton = document.querySelector(`[${buttonConfig.attribute}]`)
        const handleRootMutation = (mutationsList) => {
            for (let mutation of mutationsList) {
                const isAdded = [...mutation.addedNodes].length > 0;
                if (isAdded && hasRequiredElements(rootEl, currentTemplate.fields) && !hasButton) {
                    observer.disconnect();
                    callback();
                    observer.observe(rootEl, observerOptions);
                }
            }
        }
        const observer = new MutationObserver(handleRootMutation);
        observer.observe(rootEl, observerOptions);
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
    
    function addButton(handler = () => {}) {
        const targetEl = document.querySelector(currentTemplate.targetEl);
        if (!targetEl) throw new Error(ERROR_MESSAGES.TARGET_NOT_FOUND);
        
        const button = document.createElement("button");
        button.innerHTML = buttonConfig.text;
        button.setAttribute(buttonConfig.attribute, '1');
        for (let style in buttonConfig.styles) {
            if (buttonConfig.styles.hasOwnProperty(style)) {
                button.style[style] = buttonConfig.styles[style]
            }
        }
        button.addEventListener("click", handler);
        targetEl.after(button);
    }
    
    function fillFormData() {
        const fields = currentTemplate.fields;
        for (let key in fields) {
            if (!fields.hasOwnProperty(key) || !fields[key]) continue;
            const isTargetField = Object.keys(targetFields).includes(key);
            const input = rootEl.querySelector(fields[key].search);
            
            if (isTargetField && input && input.nodeName === 'INPUT') {
                input.value = targetFields[key];
            }
        }
    }
    
    async function initFrame() {
        const frameEl = document.querySelector(currentTemplate.frameEl);
        if (!frameEl) throw new Error(ERROR_MESSAGES.FRAME_NOT_FOUND);
        try {
            const response = await fetch(frameEl.src);
            const html = await response.text();
            frameEl.removeAttribute("src");
            frameEl.contentDocument.write(html);
            return Promise.resolve()
        } catch (e) {
            throw new Error(ERROR_MESSAGES.FRAME_LOAD_ERROR);
        }
    }
})();
