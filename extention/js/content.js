(async function () {
    const POST_MESSAGE_TYPES = {
        FRAME_FIELDS_FOUND: 'FRAME_FIELDS_FOUND',
        FILL_FRAME_FIELDS: 'FILL_FRAME_FIELDS'
    };
    const ERROR_MESSAGES = {
        CONFIG_NOT_FOUND: 'Configuration object "dscoConfig" not found',
        ROOT_NOT_FOUND: 'Root element not found',
        TARGET_NOT_FOUND: 'Unable to insert button. Target element not found',
        MISSING_CONFIGURATION: 'Has no configuration found for this URL'
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
    
    const currentTemplate = templates.find(currentConfig => currentConfig && (currentConfig.url === path || currentConfig.frameUrl === path));
    if (!currentTemplate) return console.log(ERROR_MESSAGES.MISSING_CONFIGURATION);
    
    const frameEl = currentTemplate.frameEl && document.querySelector(currentTemplate.frameEl);
    const frameOrigin = frameEl && getOriginFromPath(frameEl.src);
    const rootOrigin = getOriginFromPath(currentTemplate.url);
    
    const isFrame = window !== window.top && currentTemplate.frameUrl === path;
    const rootEl = document.querySelector(isFrame ? currentTemplate.frameRootEl : currentTemplate.rootEl);
    
    if (!rootEl) throw new Error(ERROR_MESSAGES.ROOT_NOT_FOUND);
    
    const hasButton = document.querySelector(`[${buttonConfig.attribute}]`);
    if (isFrame) {
        initFrameScript(rootEl, currentTemplate, hasButton)
    } else {
        initMainScript(rootEl, currentTemplate, hasButton);
    }
    
    function initFrameScript(rootEl, currentConfig, hasButton) {
        if (hasRequiredElements(rootEl, currentConfig.fields) && !hasButton) {
            handleFieldsFound();
        }
        initDomObserver(() => {
            handleFieldsFound();
        });
        postMessageListener(rootOrigin, (data) => {
            const {type} = data;
            if (type === POST_MESSAGE_TYPES.FILL_FRAME_FIELDS) {
                fillFormData();
            }
        });
    }
    
    function initMainScript() {
        if (hasRequiredElements(rootEl, currentTemplate.fields) && !hasButton) {
            addButton(fillFormData);
        }
        initDomObserver(() => {
            addButton(fillFormData);
        });
        if (currentTemplate.useFrame) {
            postMessageListener(frameOrigin, (data) => {
                const {type} = data;
                console.log(data);
                if (type === POST_MESSAGE_TYPES.FRAME_FIELDS_FOUND) {
                    addButton(handleFillClick);
                }
            })
        }
    }
    
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
    
    function handleFieldsFound() {
        window.parent.postMessage({type: POST_MESSAGE_TYPES.FRAME_FIELDS_FOUND}, getOriginFromPath(currentTemplate.url));
    }
    
    function handleFillClick() {
        frameEl.contentWindow.postMessage({type: POST_MESSAGE_TYPES.FILL_FRAME_FIELDS}, getOriginFromPath(currentTemplate.frameUrl));
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
        const rootEl = currentTemplate.rootEl && document.querySelector(currentTemplate.rootEl);
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
    
    function postMessageListener(targetDomain, event) {
        const eventMethod = window.addEventListener
            ? 'addEventListener'
            : 'attachEvent';
        const eventBus = window[eventMethod];
        const messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message';
        
        eventBus(messageEvent, function (e) {
            if (e.origin !== targetDomain) {
                return;
            }
            event(e && e.data);
        });
    }
    
    function getOriginFromPath(path) {
        if (!path) return '';
        const pathArray = path.split('/');
        return pathArray[0] + '//' + pathArray[2];
    }
})();
