module.exports = {
    uiPort: process.env.PORT || 1880,
    
    // User directory for flows and data
    userDir: '/data',
    
    // Flow file
    flowFile: 'flows.json',
    
    // Additional nodes directory
    nodesDir: ['/usr/src/node-red/node_modules'],
    
    // HTTP Admin Middleware to serve support form
    httpAdminMiddleware: function(req, res, next) {
        const path = require('path');
        const fs = require('fs');
        const nodemailer = require('nodemailer');
        const os = require('os');
        
        // Serve support form at /cysoar/support
        if ((req.url === '/cysoar/support' || req.url === '/cysoar/support/') && req.method === 'GET') {
            const supportFormPath = path.join(__dirname, 'branding', 'support-form.html');
            
            fs.readFile(supportFormPath, 'utf8', (err, data) => {
                if (err) {
                    res.status(404).send('Support form not found');
                    return;
                }
                res.setHeader('Content-Type', 'text/html');
                res.send(data);
            });
            return;
        }
        
        // Handle support form submission
        if ((req.url === '/cysoar/support/submit' || req.url === '/cysoar/support/submit/') && req.method === 'POST') {
            let body = '';
            
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', async () => {
                try {
                    const formData = JSON.parse(body);
                    
                    // Collect system information
                    const systemInfo = {
                        hostname: os.hostname(),
                        platform: os.platform(),
                        arch: os.arch(),
                        nodeVersion: process.version,
                        totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
                        freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
                        cpuCount: os.cpus().length,
                        uptime: `${(os.uptime() / 3600).toFixed(2)} hours`
                    };
                    
                    // Create email content
                    const emailContent = `
CySOAR Support Request

Contact Information:
- Name: ${formData.name}
- Email: ${formData.email}
- Organization: ${formData.organization || 'N/A'}
- Phone: ${formData.phone || 'N/A'}

Issue Details:
- Priority: ${formData.priority || 'Medium'}
- Category: ${formData.category || 'General'}
- Subject: ${formData.subject}
- Description:
${formData.description}

System Information:
- Hostname: ${systemInfo.hostname}
- Platform: ${systemInfo.platform} ${systemInfo.arch}
- Node.js: ${systemInfo.nodeVersion}
- Memory: ${systemInfo.freeMemory} free / ${systemInfo.totalMemory} total
- CPU: ${systemInfo.cpuCount} cores
- Uptime: ${systemInfo.uptime}

Submitted at: ${new Date().toISOString()}
                    `;
                    
                    // Check if SMTP is configured
                    const smtpConfigured = !!(
                        process.env.SMTP_HOST &&
                        process.env.SMTP_USER &&
                        process.env.SMTP_PASS
                    );
                    
                    if (smtpConfigured) {
                        // Send email
                        const transporter = nodemailer.createTransport({
                            host: process.env.SMTP_HOST || 'smtp.gmail.com',
                            port: parseInt(process.env.SMTP_PORT || '587'),
                            secure: false,
                            auth: {
                                user: process.env.SMTP_USER,
                                pass: process.env.SMTP_PASS
                            }
                        });
                        
                        await transporter.sendMail({
                            from: process.env.SMTP_USER,
                            to: process.env.SUPPORT_EMAIL || process.env.SMTP_USER,
                            subject: `CySOAR Support: ${formData.subject}`,
                            text: emailContent,
                            replyTo: formData.email
                        });
                        
                        res.json({ success: true, message: 'Support request submitted successfully' });
                    } else {
                        // SMTP not configured - just log and return success
                        console.log('Support request received (SMTP not configured):');
                        console.log(emailContent);
                        res.json({ 
                            success: true, 
                            message: 'Support request received (email not configured)',
                            warning: 'SMTP not configured - request logged to console'
                        });
                    }
                } catch (error) {
                    console.error('Error processing support request:', error);
                    res.status(500).json({ 
                        success: false, 
                        error: 'Failed to process support request: ' + error.message 
                    });
                }
            });
            return;
        }
        
        next();
    },
    
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