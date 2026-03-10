/* CySOAR Preload Script - Runs IMMEDIATELY before page renders */
(function() {
    'use strict';
    
    // Add styles to hide problematic content immediately
    var hideStyle = document.createElement('style');
    hideStyle.id = 'cysoar-preload-hide';
    hideStyle.textContent = `
        /* AGGRESSIVELY hide ALL help content with display:none */
        .red-ui-sidebar-help,
        .red-ui-help,
        .red-ui-help-title,
        #red-ui-sidebar-help-shade,
        .red-ui-panel {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
        }
        
        /* Hide specific tree items that will be removed */
        .red-ui-editableList-item-content.expanded,
        .red-ui-treeList-list {
            opacity: 0 !important;
        }
    `;
    
    // Insert immediately
    (document.head || document.documentElement).appendChild(hideStyle);
    
    // Set up mutation observer to catch and hide elements as they're added
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    // Check for changelog or version numbers
                    if (node.classList && node.classList.contains('red-ui-treeList-label-text')) {
                        var text = node.textContent.trim();
                        if (text === 'Change Log' || text.match(/^\d+\.\d+$/)) {
                            // Find and hide parent li immediately
                            var li = node.closest('li');
                            if (li) {
                                li.style.display = 'none';
                            }
                        }
                    }
                    
                    // Check for tours
                    if (node.textContent && node.textContent.toLowerCase().includes('tour')) {
                        var li = node.closest('li');
                        if (li) {
                            li.style.display = 'none';
                        }
                    }
                }
            });
        });
    });
    
    // Start observing as soon as possible
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }
    
    console.log('🚀 CySOAR preload protection active');
})();
