import CashRegister from '../CashRegister.vue'

describe('Cash Register Unit Tests', () => {
  it('Cash Register mounts', () => {
    cy.mount(CashRegister)
  })

  it('renders properly', () => {
    cy.mount(CashRegister)
    cy.get('[data-cy="fileUploadBtn"]').should('exist').selectFile('cypress/fixtures/testinput.txt')
    cy.get('[data-cy="fileLoaded"]').should('exist').and('be.visible')
  })
})
