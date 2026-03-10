/**
 * CySOAR Support Form Handler
 * Handles support request submissions, log collection, and email notifications
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

module.exports = function(RED) {
    
    /**
     * Check if SMTP is configured
     */
    function isSMTPConfigured() {
        return !!(
            process.env.SMTP_HOST &&
            process.env.SMTP_USER &&
            process.env.SMTP_PASS
        );
    }
    
    /**
     * Collect system information
     */
    async function collectSystemInfo() {
        const systemInfo = {
            hostname: os.hostname(),
            platform: os.platform(),
            arch: os.arch(),
            nodeVersion: process.version,
            nodeRedVersion: RED.settings.version || 'Unknown',
            totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
            freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
            cpuCount: os.cpus().length,
            cpuModel: os.cpus()[0]?.model || 'Unknown',
            uptime: `${(os.uptime() / 3600).toFixed(2)} hours`,
            loadAverage: os.loadavg(),
            networkInterfaces: Object.keys(os.networkInterfaces())
        };
        
        return systemInfo;
    }

    /**
     * Collect flow configuration
     */
    async function collectFlowInfo() {
        try {
            const flows = RED.nodes.getFlows();
            const flowSummary = {
                totalFlows: flows.flows.filter(f => f.type === 'tab').length,
                totalNodes: flows.flows.filter(f => f.type !== 'tab').length,
                nodeTypes: {}
            };

            // Count node types
            flows.flows.forEach(node => {
                if (node.type && node.type !== 'tab') {
                    flowSummary.nodeTypes[node.type] = (flowSummary.nodeTypes[node.type] || 0) + 1;
                }
            });

            return {
                summary: flowSummary,
                flowNames: flows.flows.filter(f => f.type === 'tab').map(f => f.label || f.id)
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Collect recent logs
     */
    async function collectRecentLogs() {
        try {
            // Try to read Docker logs if available
            const { stdout } = await execPromise('tail -n 100 /var/log/node-red.log 2>/dev/null || echo "Log file not accessible"');
            return stdout || 'Logs not available';
        } catch (error) {
            return 'Unable to collect logs: ' + error.message;
        }
    }

    /**
     * Collect error logs
     */
    async function collectErrorLogs() {
        try {
            const { stdout } = await execPromise('grep -i "error\\|warn" /var/log/node-red.log 2>/dev/null | tail -n 50 || echo "Error logs not accessible"');
            return stdout || 'No error logs available';
        } catch (error) {
            return 'Unable to collect error logs: ' + error.message;
        }
    }

    /**
     * Collect installed packages
     */
    async function collectPackageInfo() {
        try {
            const userDir = RED.settings.userDir || '/data';
            const packageJsonPath = path.join(userDir, 'package.json');
            
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                return {
                    dependencies: packageJson.dependencies || {},
                    userPackages: Object.keys(packageJson.dependencies || {}).filter(pkg => pkg.startsWith('node-red-'))
                };
            }
            
            return { error: 'package.json not found' };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Format support email
     */
    function formatSupportEmail(formData, collectedData) {
        const priority = formData.priority.toUpperCase();
        const priorityEmoji = {
            'low': '🟢',
            'medium': '🟡',
            'high': '🟠',
            'critical': '🔴'
        };

        let emailBody = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 20px; text-align: center; }
        .section { margin: 20px 0; padding: 15px; border-left: 4px solid #28a745; background: #f8f9fa; }
        .section h3 { margin-top: 0; color: #28a745; }
        .field { margin: 10px 0; }
        .field strong { display: inline-block; width: 150px; color: #555; }
        .code { background: #f4f4f4; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; overflow-x: auto; }
        .priority-critical { color: #dc3545; font-weight: bold; }
        .priority-high { color: #fd7e14; font-weight: bold; }
        .priority-medium { color: #ffc107; font-weight: bold; }
        .priority-low { color: #28a745; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${priorityEmoji[formData.priority.toLowerCase()] || '📧'} CySOAR Support Request</h1>
        <p>New support ticket received</p>
    </div>

    <div class="section">
        <h3>👤 Contact Information</h3>
        <div class="field"><strong>Name:</strong> ${formData.name}</div>
        <div class="field"><strong>Email:</strong> <a href="mailto:${formData.email}">${formData.email}</a></div>
        ${formData.company ? `<div class="field"><strong>Company:</strong> ${formData.company}</div>` : ''}
        ${formData.phone ? `<div class="field"><strong>Phone:</strong> ${formData.phone}</div>` : ''}
        <div class="field"><strong>Submitted:</strong> ${new Date().toLocaleString()}</div>
    </div>

    <div class="section">
        <h3>🎫 Issue Details</h3>
        <div class="field"><strong>Category:</strong> ${formData.category.toUpperCase()}</div>
        <div class="field"><strong>Priority:</strong> <span class="priority-${formData.priority.toLowerCase()}">${priority}</span></div>
        <div class="field"><strong>Subject:</strong> ${formData.subject}</div>
        <div class="field">
            <strong>Description:</strong><br>
            <div class="code">${formData.description.replace(/\n/g, '<br>')}</div>
        </div>
    </div>

    ${collectedData.systemInfo ? `
    <div class="section">
        <h3>💻 System Information</h3>
        <div class="code">
${Object.entries(collectedData.systemInfo).map(([key, value]) => 
    `<strong>${key}:</strong> ${typeof value === 'object' ? JSON.stringify(value) : value}`
).join('<br>')}
        </div>
    </div>
    ` : ''}

    ${collectedData.flowInfo ? `
    <div class="section">
        <h3>🔄 Flow Configuration</h3>
        <div class="field"><strong>Total Flows:</strong> ${collectedData.flowInfo.summary?.totalFlows || 0}</div>
        <div class="field"><strong>Total Nodes:</strong> ${collectedData.flowInfo.summary?.totalNodes || 0}</div>
        <div class="field">
            <strong>Node Types:</strong><br>
            <div class="code">
${Object.entries(collectedData.flowInfo.summary?.nodeTypes || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([type, count]) => `${type}: ${count}`)
    .join('<br>')}
            </div>
        </div>
    </div>
    ` : ''}

    ${collectedData.packageInfo ? `
    <div class="section">
        <h3>📦 Installed Packages</h3>
        <div class="code">
${collectedData.packageInfo.userPackages ? 
    collectedData.packageInfo.userPackages.join('<br>') : 
    'No user packages installed'}
        </div>
    </div>
    ` : ''}

    ${collectedData.recentLogs ? `
    <div class="section">
        <h3>📋 Recent Logs (Last 100 Lines)</h3>
        <div class="code" style="max-height: 300px; overflow-y: auto;">
${collectedData.recentLogs.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}
        </div>
    </div>
    ` : ''}

    ${collectedData.errorLogs ? `
    <div class="section">
        <h3>⚠️ Error & Warning Logs</h3>
        <div class="code" style="max-height: 300px; overflow-y: auto;">
${collectedData.errorLogs.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}
        </div>
    </div>
    ` : ''}

    <div class="section" style="background: #fff3cd; border-left-color: #ffc107;">
        <h3>⏭️ Next Steps</h3>
        <p>1. Review the issue details and system information above</p>
        <p>2. Reply to <strong>${formData.email}</strong> to acknowledge receipt</p>
        <p>3. Assign to appropriate support engineer based on category: <strong>${formData.category}</strong></p>
        <p>4. Target response time based on priority: <strong>${priority}</strong></p>
    </div>

    <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
        <p>This is an automated email from CySOAR Support System</p>
        <p>CySOAR v1.0.0 | Cycentra360</p>
    </div>
</body>
</html>
        `;

        return emailBody;
    }

    /**
     * Send email via nodemailer (lazy-loaded)
     */
    async function sendSupportEmail(formData, collectedData) {
        // Check if SMTP is configured
        if (!isSMTPConfigured()) {
            RED.log.warn('⚠️ SMTP not configured - support request logged locally only');
            
            // Log to Node-RED console instead
            RED.log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            RED.log.info('📧 Support Request Received (Email Not Sent)');
            RED.log.info(`From: ${formData.name} <${formData.email}>`);
            RED.log.info(`Subject: ${formData.subject}`);
            RED.log.info(`Category: ${formData.category} | Priority: ${formData.priority}`);
            RED.log.info(`Description: ${formData.description}`);
            RED.log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            // Return success - form works, just no email
            return {
                success: true,
                mode: 'local-only',
                message: 'Support request logged. Configure SMTP environment variables to enable email notifications.'
            };
        }

        // Lazy-load nodemailer only when SMTP is configured
        let nodemailer;
        try {
            nodemailer = require('nodemailer');
        } catch (error) {
            RED.log.error('❌ nodemailer module not found');
            throw new Error('Email functionality not available');
        }

        // Configure email transport
        // NOTE: Update these settings with your SMTP server details
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const priorityPrefix = {
            'critical': '[CRITICAL]',
            'high': '[HIGH]',
            'medium': '[MEDIUM]',
            'low': '[LOW]'
        };

        const mailOptions = {
            from: `"CySOAR Support System" <${process.env.SMTP_USER}>`,
            to: process.env.SUPPORT_EMAIL || 'support@cycentra.com',
            replyTo: formData.email,
            subject: `${priorityPrefix[formData.priority.toLowerCase()]} ${formData.subject}`,
            html: formatSupportEmail(formData, collectedData),
            // Add text version for fallback
            text: `
CySOAR Support Request

From: ${formData.name} (${formData.email})
Category: ${formData.category}
Priority: ${formData.priority}
Subject: ${formData.subject}

Description:
${formData.description}

System Information:
${JSON.stringify(collectedData.systemInfo, null, 2)}
            `
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            RED.log.info(`Support email sent: ${info.messageId}`);
            return { 
                success: true, 
                mode: 'email-sent',
                message: 'Support request submitted and email sent successfully',
                messageId: info.messageId 
            };
        } catch (error) {
            RED.log.error(`Failed to send support email: ${error.message}`);
            throw error;
        }
    }

    /**
     * Main handler for support form submission
     */
    RED.httpAdmin.post('/cysoar/support/submit', async (req, res) => {
        try {
            const formData = req.body;

            // Validate required fields
            if (!formData.name || !formData.email || !formData.subject || !formData.description) {
                return res.status(400).json({
                    error: 'Missing required fields'
                });
            }

            // Collect requested information
            const collectedData = {};

            if (formData.includeLogs && formData.includeLogs.includes('system')) {
                collectedData.systemInfo = await collectSystemInfo();
            }

            if (formData.includeLogs && formData.includeLogs.includes('flows')) {
                collectedData.flowInfo = await collectFlowInfo();
            }

            if (formData.includeLogs && formData.includeLogs.includes('recent')) {
                collectedData.recentLogs = await collectRecentLogs();
            }

            if (formData.includeLogs && formData.includeLogs.includes('errors')) {
                collectedData.errorLogs = await collectErrorLogs();
            }

            if (formData.includeLogs && formData.includeLogs.includes('packages')) {
                collectedData.packageInfo = await collectPackageInfo();
            }

            // Attempt to send email (or log locally if SMTP not configured)
            const result = await sendSupportEmail(formData, collectedData);

            res.json({
                success: true,
                message: result.message,
                mode: result.mode,
                ticketId: `CYSOAR-${Date.now()}`,
                smtpConfigured: isSMTPConfigured()
            });

        } catch (error) {
            RED.log.error(`Error processing support request: ${error.message}`);
            res.status(500).json({
                error: 'Failed to submit support request: ' + error.message
            });
        }
    });

    /**
     * Serve the support form HTML
     */
    RED.httpAdmin.get('/cysoar/support', (req, res) => {
        const formPath = path.join(__dirname, 'support-form.html');
        if (fs.existsSync(formPath)) {
            res.sendFile(formPath);
        } else {
            res.status(404).send('Support form not found');
        }
    });

    // Log initialization status
    if (isSMTPConfigured()) {
        RED.log.info('✅ CySOAR Support System initialized with email notifications');
    } else {
        RED.log.info('✅ CySOAR Support System initialized (local logging only - set SMTP_* env vars for email)');
    }
};
