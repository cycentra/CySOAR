#!/bin/sh
# CySOAR Support System Setup Script
# This script initializes the support system module on container startup

echo "🔧 Initializing CySOAR Support System..."

# Create a wrapper script to load support handler
cat > /usr/src/node-red/load-support-handler.js << 'EOF'
// Load the support handler module
module.exports = function(RED) {
    try {
        const supportHandler = require('/usr/src/node-red/node_modules/@node-red/editor-client/support-handler.js');
        supportHandler(RED);
        RED.log.info('CySOAR Support System loaded successfully');
    } catch (error) {
        RED.log.error('Failed to load CySOAR Support System: ' + error.message);
    }
};
EOF

# Add the support handler to Node-RED's startup
# This is done by creating a file in the nodes directory that RED will auto-load
cat > /usr/src/node-red/node_modules/@node-red/editor-client/cysoar-support-init.js << 'EOF'
// CySOAR Support System Auto-Loader
module.exports = function(RED) {
    try {
        const fs = require('fs');
        const path = require('path');
        const handlerPath = path.join(__dirname, 'support-handler.js');
        
        if (fs.existsSync(handlerPath)) {
            const supportHandler = require(handlerPath);
            supportHandler(RED);
            RED.log.info('✅ CySOAR Support System initialized');
        } else {
            RED.log.warn('⚠️ CySOAR Support handler not found at: ' + handlerPath);
        }
    } catch (error) {
        RED.log.error('❌ Failed to initialize CySOAR Support System: ' + error.message);
    }
};
EOF

echo "✅ CySOAR Support System setup complete"
