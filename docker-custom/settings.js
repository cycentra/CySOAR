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
        }
        // Note: menu customization moved to cysoar-init.js for dynamic support form link
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