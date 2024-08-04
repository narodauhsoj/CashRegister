// https://on.cypress.io/api

describe('My First Test', () => {
  it('visits the app root url', () => {
    cy.visit('/')
  })

  it('happy path - attempts to upload test file', () => {
    cy.visit('/')
    cy.get('[data-cy="fileUploadBtn"]').should('exist').selectFile('cypress/fixtures/testinput.txt')
    cy.get('[data-cy="fileLoaded"]').should('exist')
  })

  it('happy path - verifies a file uploads and a file writes', () => {
    cy.visit('/')
    cy.get('[data-cy="fileUploadBtn"]').should('exist').selectFile('cypress/fixtures/testinput.txt')
    cy.get('[data-cy="fileLoaded"]').should('exist').and('be.visible')
    cy.get('[data-cy="calculateBtn"]').should('exist').click()
    cy.get('[data-cy="outputGenerated"]').should('exist').and('be.visible')
  })
})
