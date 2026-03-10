/**
 * CySOAR Support System Node
 * Auto-initializing node that loads the support handler
 */

module.exports = function(RED) {
    // Initialize support system - but don't block node loading on failure
    try {
        const supportHandler = require('./support-handler.js');
        supportHandler(RED);
        // Success logged from support-handler.js
    } catch (error) {
        // Log warning but don't throw - allows Node-RED to continue loading
        RED.log.warn('⚠️ CySOAR Support System initialization skipped');
        RED.log.warn(`Reason: ${error.message}`);
        // Container continues to work normally
    }
    
    // Define a config node (hidden from palette)
    function CySOARSupportConfig(config) {
        RED.nodes.createNode(this, config);
    }
    
    RED.nodes.registerType("cysoar-support-config", CySOARSupportConfig);
};
