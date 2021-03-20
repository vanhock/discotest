window.dscoConfig = {
    targetFields: {
        holderName: 'Ali Gasymov',
        cardNumber: '5403414685553195',
        expirationDate: '01/25',
        cvvCvc: '123'
    },
    buttonConfig: {
        attribute: 'data-dsco-fill-button',
        text: 'Autofill',
        styles: {
            marginLeft: '10px'
        }
    },
    templates: [
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
            useFrame: true, // Fields located in iframe
            frameUrl: 'https://getdisco.github.io/js-senior-test-task/pages/iframe.html',
            frameEl: 'iframe',
            frameRootEl: 'body',
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
    ]
};