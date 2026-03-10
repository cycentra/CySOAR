/* CySOAR Client-Side Customizations */
console.log('🚀 CySOAR customization script loaded!');

(function() {
    'use strict';
    
    // Replace node-red text in palette with CyCentra
    function replacePaletteText() {
        document.querySelectorAll('.red-ui-palette-module-name span, span').forEach(function(span) {
            if (span.textContent.includes('node-red')) {
                span.textContent = span.textContent.replace(/node-red/gi, 'CyCentra');
                console.log('✓ Replaced node-red with CyCentra in palette');
            }
        });
    }
    
    // Replace Node-RED in menu headers and tree lists
    function replaceMenuHeaders() {
        document.querySelectorAll('.red-ui-menu-label, .red-ui-tray-content h3, h3, .menu-header, .red-ui-treeList-label-text').forEach(function(elem) {
            if (elem.textContent.includes('Node-RED')) {
                elem.textContent = elem.textContent.replace(/Node-RED/g, 'CySOAR');
                console.log('✓ Replaced Node-RED in menu/tree');
            }
        });
    }
    
    // Remove entire CySOAR/Node-RED section from Help that contains Change Log and Tours
    function removeHelpSection() {
        var removed = 0;
        
        // Strategy: Find any list item (li) that contains "Change Log" text
        // Then remove its entire parent li container
        document.querySelectorAll('.red-ui-treeList-label-text').forEach(function(label) {
            var text = label.textContent.trim();
            
            // If this is "Change Log" or a version number, remove the entire tree branch
            if (text === 'Change Log' || text.match(/^\d+\.\d+$/)) {
                // Walk up to find the outermost li parent that we should remove
                var currentElement = label;
                var targetLi = null;
                
                // Walk up the DOM tree
                while (currentElement && currentElement !== document.body) {
                    currentElement = currentElement.parentElement;
                    
                    // Look for an li that has a sibling structure indicating it's a main branch
                    if (currentElement && currentElement.tagName === 'LI') {
                        // Check if this li's parent contains the CySOAR label
                        var parentContent = currentElement.parentElement?.parentElement;
                        if (parentContent) {
                            var parentLabel = parentContent.querySelector('.red-ui-treeList-label-text');
                            if (parentLabel && (parentLabel.textContent === 'CySOAR' || parentLabel.textContent === 'Node-RED')) {
                                targetLi = currentElement;
                                break;
                            }
                        }
                    }
                    
                    // Safety: don't go too far up
                    if (currentElement.classList.contains('red-ui-sidebar-content')) {
                        break;
                    }
                }
                
                // Remove the target li if found
                if (targetLi) {
                    targetLi.remove();
                    removed++;
                }
            }
        });
        
        // Alternative aggressive approach: Remove any expanded item that contains both types of content
        document.querySelectorAll('.red-ui-editableList-item-content.expanded').forEach(function(item) {
            var labels = item.querySelectorAll('.red-ui-treeList-label-text');
            var hasChangelog = false;
            var hasVersions = false;
            
            labels.forEach(function(label) {
                if (label.textContent === 'Change Log') hasChangelog = true;
                if (label.textContent.match(/^\d+\.\d+$/)) hasVersions = true;
            });
            
            if (hasChangelog || hasVersions) {
                var parentLi = item.closest('li');
                if (parentLi) {
                    parentLi.remove();
                    removed++;
                }
            }
        });
        
        if (removed > 0) {
            console.log('✓ Removed ' + removed + ' Help section items');
        }
        
        return removed > 0;
    }
    
    // Replace Node-RED in About section
    function replaceAboutText() {
        document.querySelectorAll('#red-ui-settings-tab-view-about p, #red-ui-settings-tab-view-about div, #red-ui-settings-tab-view-about span').forEach(function(elem) {
            if (elem.textContent.includes('Node-RED')) {
                var textNode = elem.childNodes[0];
                if (textNode && textNode.nodeType === 3) {
                    textNode.nodeValue = textNode.nodeValue.replace(/Node-RED/g, 'Cycentra SOAR');
                }
            }
        });
    }
    
    // Redirect Help menu to Support Form
    function setupSupportFormRedirect() {
        // Find the Help menu item in the main dropdown menu
        var helpMenuItem = document.querySelector('#red-ui-header-button-sidemenu');
        
        if (helpMenuItem) {
            // Add click handler to intercept Help click
            document.addEventListener('click', function(event) {
                var target = event.target;
                
                // Check if clicked element or its parents is the Help menu item
                while (target && target !== document.body) {
                    // Look for the help menu item by text content
                    if (target.textContent && 
                        (target.textContent.trim().includes('CySOAR Help') || 
                         target.textContent.trim().includes('Help') ||
                         target.classList.contains('red-ui-menu-label'))) {
                        
                        // Check if this is specifically the help menu
                        var menuLabel = target.querySelector('.red-ui-menu-label');
                        if (menuLabel && menuLabel.textContent.includes('Help')) {
                            // Prevent default help sidebar from opening
                            event.preventDefault();
                            event.stopPropagation();
                            
                            // Open support form in new tab
                            window.open('/cysoar/support', '_blank');
                            console.log('✓ Redirected to Support Form');
                            return false;
                        }
                    }
                    target = target.parentElement;
                }
            }, true); // Use capture phase to intercept early
        }
        
        // Also find and modify any direct help links
        setTimeout(function() {
            document.querySelectorAll('a[href*="help"], .red-ui-menu-item').forEach(function(link) {
                if (link.textContent && link.textContent.includes('Help')) {
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open('/cysoar/support', '_blank');
                        console.log('✓ Redirected help link to Support Form');
                        return false;
                    });
                }
            });
        }, 1000);
    }
    
    // Master function to run all replacements
    function runAllReplacements() {
        replacePaletteText();
        replaceMenuHeaders();
        removeHelpSection();
        replaceAboutText();
        setupSupportFormRedirect(); // Add support form redirect
        
        // Remove preload hiding styles after cleanup
        var hideStyle = document.getElementById('cysoar-preload-hide');
        if (hideStyle) {
            hideStyle.remove();
        }
        
        // Show help section now that it's cleaned - restore display and visibility
        var helpSidebar = document.querySelector('.red-ui-sidebar-help');
        if (helpSidebar) {
            helpSidebar.style.display = '';  // Remove display:none
            helpSidebar.style.opacity = '1';
            helpSidebar.style.visibility = 'visible';
        }
        
        // Also unhide help panels and other hidden elements
        document.querySelectorAll('.red-ui-help, .red-ui-help-title, .red-ui-panel').forEach(function(elem) {
            elem.style.display = '';
            elem.style.opacity = '1';
            elem.style.visibility = 'visible';
        });
        
        // Show tree lists
        document.querySelectorAll('.red-ui-treeList-list, .red-ui-editableList-item-content').forEach(function(elem) {
            elem.style.opacity = '1';
        });
    }
    
    // Wait for RED to initialize
    var checkInterval = setInterval(function() {
        if (typeof RED !== 'undefined') {
            console.log('✅ RED is available');
            clearInterval(checkInterval);
            
            // Run immediately and frequently at first
            setTimeout(runAllReplacements, 100);
            setTimeout(runAllReplacements, 500);
            setTimeout(runAllReplacements, 1000);
            
            // Hook into events
            if (RED.events) {
                RED.events.on('palette:open', function() {
                    setTimeout(replacePaletteText, 100);
                });
                RED.events.on('sidebar:show', function() {
                    setTimeout(runAllReplacements, 100);
                });
            }
            
            // Hook into settings/menu button click
            setTimeout(function() {
                var settingsButton = document.querySelector('#red-ui-header-button-sidemenu');
                if (settingsButton) {
                    settingsButton.addEventListener('click', function() {
                        setTimeout(runAllReplacements, 50);
                        setTimeout(runAllReplacements, 200);
                    });
                }
            }, 500);
            
            // Continue running periodically
            setInterval(runAllReplacements, 5000); // Every 5 seconds
            
            console.log('✅ CySOAR customizations active');
        }
    }, 50);
    
})();
