module.exports = {
    uiPort: process.env.PORT || 1880,
    
    // User directory for flows and data
    userDir: '/data',
    
    // Flow file
    flowFile: 'flows.json',
    
    // Additional nodes directory
    nodesDir: ['/usr/src/node-red/node_modules'],
    
    // Editor theme
    editorTheme: {
        page: {
            title: "CySOAR - Security Orchestration & Automation",
            css: ["red/custom.css"],
            scripts: ["red/cysoar-init.js"]
        },
        header: {
            title: "CySOAR"
        },
        menu: { // Custom menu items
            "menu-item-cysoar-help": {
                label: "CySOAR Help",
                url: "/cysoar/support",
                target: "_blank"
            },
            "menu-item-keyboard-shortcuts": {
                label: "Keyboard Shortcuts",
                onselect: "RED.actions.invoke('core:show-help-tab-keyboard-shortcuts')"
            }
        }
    },
    
    // Function to initialize support system
    // This will be called by the support-handler.js module
    functionGlobalContext: {
        // Add any global context here if needed
    },
    
    // SMTP Configuration for support email (override with environment variables)
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER || 'noreply@cycentra.com',
            pass: process.env.SMTP_PASS || ''
        }
    },
    
    // Logging
    logging: {
        console: {
            level: "info",
            metrics: false,
            audit: false
        }
    }
}