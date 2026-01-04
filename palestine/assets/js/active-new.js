
/*
 ** ACTIVE.JS - UI Activation for Palestine Crisis
 ** This file bridges the old function calls with the new data managers
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log('Active.js initializing...');
    // Wait for data managers to be ready
    const waitForManagers = setInterval(function () {
        if (typeof liveTracker !== 'undefined' &&
            typeof attacksManager !== 'undefined' &&
            liveTracker.data &&
            attacksManager.attacks.length > 0) {
            clearInterval(waitForManagers);
            initializeActivations();
        }
    }, 100);
});
function initializeActivations() {
    console.log('Activating page elements...');
    /*
    ** Last Update Date Display
    */
    const updateDate = document.querySelectorAll('.last-update-wrap');
    if (updateDate && updateDate.length > 0) {
        updateDate.forEach(function (item) {
            displayLastUpdate(item);
        });
    }
    /*
    ** Worldwide Statistics Activation
    */
    const worldwide = document.querySelectorAll('.worldwide-stats');
    if (worldwide && worldwide.length > 0) {
        worldwide.forEach(function (item) {
            liveTracker.insertData(item);
        });
    }
    /*
    ** Map Statistics Report
    */
    const mapWiseReport = document.getElementById('map-status-report');
    if (mapWiseReport && typeof initializePalestineMap === 'function') {
        // This is handled in live.js
        console.log('Map initialization handled by live.js');
    }
    /*
    ** Chart Report Activation
    */
    const chartContainer = document.getElementById('chart-report');
    if (chartContainer && typeof chartReport === 'function') {
        chartReport(chartContainer);
    }
    /*
    ** Worldwide Stats with Pie Chart Activation
    */
    if (typeof worldwideWithPieChart === 'function' && liveTracker.data) {
        worldwideWithPieChart(liveTracker.data);
    }
    console.log('Active.js initialization complete!');
}
// Helper function to display last update time
function displayLastUpdate(container) {
    if (!liveTracker.data) return;
    const lastUpdateElements = container.querySelectorAll('.last-update');
    const updateTime = liveTracker.getLastUpdateTime();
    lastUpdateElements.forEach(function (elem) {
        if (updateTime > 60) {
            const hours = Math.floor(updateTime / 60);
            elem.textContent = hours + ' hour' + (hours > 1 ? 's' : '') + ' ago';
        } else {
            elem.textContent = updateTime + ' minute' + (updateTime > 1 ? 's' : '') + ' ago';
        }
    });
}
// Compatibility stubs for old function names (in case they're called elsewhere)
function getLastUpdatedTime(element, format) {
    console.warn('getLastUpdatedTime is deprecated, using new displayLastUpdate');
    displayLastUpdate(element);
}
function worldwideReport(element) {
    console.warn('worldwideReport is deprecated, using liveTracker.insertData');
    if (liveTracker && liveTracker.data) {
        liveTracker.insertData(element);
    }
}
function countryReport(element, country) {
    console.warn('countryReport is deprecated');
    // Not needed in new system
}
function reportWithDropdown(element, country) {
    console.warn('reportWithDropdown is deprecated');
    // Handled by live.js
}
function mapStatus(element) {
    console.warn('mapStatus is deprecated');
    // Handled by live.js
}
function casesByCountry() {
    console.warn('casesByCountry is deprecated');
    // Handled by live.js
}
function reportListView(element, search) {
    console.warn('reportListView is deprecated');
    // Handled by live.js
}
function miniChart() {
    console.warn('miniChart is deprecated');
    // Not needed in new system
}
function mapReport(element, country) {
    console.warn('mapReport is deprecated');
    // Not needed in new system
}