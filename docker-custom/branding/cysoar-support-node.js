/**
 * CySOAR Support System Node
 * Auto-initializing node that loads the support handler
 */

module.exports = function(RED) {
    // Initialize support system immediately when node is loaded
    try {
        const supportHandler = require('./support-handler.js');
        supportHandler(RED);
        RED.log.info('✅ CySOAR Support System initialized successfully');
    } catch (error) {
        RED.log.error('❌ Failed to initialize CySOAR Support System');
        RED.log.error('Error: ' + error.message);
        if (error.stack) {
            RED.log.error(error.stack);
        }
    }
    
    // Define a config node (hidden from palette)
    function CySOARSupportConfig(config) {
        RED.nodes.createNode(this, config);
    }
    
    RED.nodes.registerType("cysoar-support-config", CySOARSupportConfig);
};
