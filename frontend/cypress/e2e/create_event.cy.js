import 'cypress-file-upload';
describe('workflow test', () => {

  it('checks import feature', () => {
    //open app
    cy.visit('http://localhost:3000/calendar')
    cy.get('[data-testid=\'openImportButton\']').click()

    cy.get('[data-testid=\'import-upload\']').attachFile({
      filePath:'../../src/components/calendar_component/test/Test Events Import.csv'
    })
    cy.get('[data-testid=\'import-save\']').click()

    //Navigate to march
    function navigateToMonth(destMonth) {
      cy.get('body').then($body => {
        if (!$body.text().includes(destMonth)) {
          cy.get('[data-testid=\'navigate-left\']').click();
          cy.wait(500);
          navigateToMonth(destMonth); // recursive call until detsMonth is reached
        }
      });
    }

    // Navigate to each month, check if event is there and delete it
    navigateToMonth('March 2024');
    cy.contains('Import Test 3').should('be.visible');
    cy.contains('Import Test 3').click()
    cy.get('[data-testid=\'deleteEventButton\']').click()
    cy.contains('Import Test 3').should('not.exist');

    navigateToMonth('February 2024');
    cy.contains('Import Test 2').should('be.visible');
    cy.contains('Import Test 2').click()
    cy.get('[data-testid=\'deleteEventButton\']').click()
    cy.contains('Import Test 2').should('not.exist');

    navigateToMonth('January 2024');
    cy.contains('Import Test 1').should('be.visible');
    cy.contains('Import Test 1').click()
    cy.get('[data-testid=\'deleteEventButton\']').click()
    cy.contains('Import Test 1').should('not.exist');
  });


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

const clickUntil = (clickCommand, condition, options = {}) => {
  const { timeout = Cypress.config('defaultCommandTimeout'), interval = 100 } = options;
  let promise = clickCommand();

  const checkCondition = () => {
    return Promise.resolve(condition())
        .then(result => {
          if (!result) {
            promise = clickCommand();
            return cy.wait(interval).then(checkCondition);
          }
        });
  };

  return cy.wrap(promise).then(checkCondition).timeout(timeout);
};
