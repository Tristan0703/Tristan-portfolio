/// <reference types="cypress" />

describe('RemoteViewScreen E2E Test', () => {
  beforeEach(() => {
    // Visit the root path where the app loads
    cy.visit('/');
  });

  it('should load and display the remote viewer', () => {
    // Check that the header is visible
    cy.contains('Remote Desktop Viewer').should('be.visible');
    
    // Check that the canvas is visible
    cy.get('.remote-canvas').should('be.visible');
    
    // Check the status indicator renders (auto-connects on load)
    cy.get('.status-text').should('be.visible');
    
    // Check connect button exists
    cy.contains('Connect').should('be.visible');
  });

  it('should show connecting status when connect is clicked', () => {
    // Click connect button in footer (not the overlay)
    cy.get('.btn-connect').click();
    
    // Should show CONNECTING status (at least temporarily)
    cy.contains('CONNECTING').should('be.visible');
  });

  it('should have connection info in footer', () => {
    // Footer should show the host the page was served from (auto-discovery)
    cy.contains('Host: localhost:3001').should('be.visible');
  });
});