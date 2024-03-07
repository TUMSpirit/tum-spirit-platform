describe('template spec', () => {
  it('creates event', () => {
    //open app
    cy.visit('http://localhost:3000/calendar')
    cy.get('[data-testid=\'addEventButton\']').click()
    cy.get('[data-testid=\'titleInput\']').type('Test Event');
    //enter details
    cy.get('[data-testid=\'roomNumberInput\']').type('8102.EG.116');
    cy.get('[data-testid=\'milestoneSwitch\']').click()
    //save event
    cy.get('[data-testid=\'saveEventButton\']').click()
    cy.contains('Test Event').should('be.visible');

  })


  it('edits event', () => {
    cy.visit('http://localhost:3000/calendar')
    cy.contains('Test Event').click()
    cy.get('[data-testid=\'roomNumberInput\']').should('have.value', '8102.EG.116')
    cy.get('[data-testid=\'titleInput\']').clear().type('Test Event Edit');
    cy.get('[data-testid=\'saveEventButton\']').click()
    cy.contains('Test Event').should('be.visible');

  })

  it('deletes event', () => {
    cy.visit('http://localhost:3000/calendar')
    cy.contains('Test Event Edit').click()
    cy.get('[data-testid=\'deleteEventButton\']').click()
    cy.contains('Test Event Edit').should('not.exist');

  })
})