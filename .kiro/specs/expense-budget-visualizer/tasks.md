# Implementation Plan: Expense & Budget Visualizer

## Overview

This plan implements a client-side expense tracking web application using vanilla JavaScript, HTML5, and CSS3. The application features transaction management, real-time balance calculation, and pie chart visualization with Local Storage persistence. Implementation follows a bottom-up approach: core data structures first, then business logic, then UI integration, and finally testing.

## Tasks

- [x] 1. Set up project structure and HTML foundation
  - Create index.html with semantic HTML5 structure
  - Include form elements (item name input, amount input, category select, submit button)
  - Add balance display section at top
  - Add scrollable transaction list container
  - Add canvas element for Chart.js pie chart
  - Include Chart.js CDN link in head
  - Create css/ and js/ directories
  - _Requirements: 8.5, 10.1, 10.2, 1.1, 1.2, 2.1, 4.1, 5.1_

- [ ] 2. Implement CSS styling
  - [x] 2.1 Create css/styles.css with mobile-first responsive design
    - Define CSS variables for colors and spacing
    - Style form layout with flexbox
    - Style transaction list with scrollable container
    - Style balance display prominently at top
    - Add responsive media queries (min-width: 320px)
    - Set minimum font size to 14px
    - Add visual feedback styles for buttons and interactions
    - Style error message container
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 3. Implement StorageManager class
  - [x] 3.1 Create js/app.js and implement StorageManager class
    - Implement constructor(storageKey)
    - Implement isAvailable() method to check Local Storage support
    - Implement save(transactions) method with try-catch error handling
    - Implement load() method returning {success, data, error}
    - Handle JSON parse errors and quota exceeded errors
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ]* 3.2 Write property test for StorageManager
    - **Property 1: Transaction Persistence Round-Trip**
    - **Validates: Requirements 6.1, 6.3, 2.5**
    - Generate random transaction arrays and verify save/load equivalence

- [ ] 4. Implement TransactionManager class
  - [x] 4.1 Implement TransactionManager core structure
    - Implement constructor(storageManager) initializing empty transactions array
    - Implement getTransactions() returning transaction array
    - Implement calculateBalance() using Array.reduce to sum amounts
    - Implement getSpendingByCategory() returning Map of category totals
    - _Requirements: 4.2, 4.5, 5.2_
  
  - [ ]* 4.2 Write property test for balance calculation
    - **Property 2: Balance Equals Sum of Amounts**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5**
    - Generate random transaction sets and verify balance equals sum
  
  - [x] 4.3 Implement addTransaction(itemName, amount, category) method
    - Validate itemName is non-empty after trim (1-100 chars)
    - Validate amount is positive number
    - Validate category is non-empty string
    - Generate unique ID using timestamp + random string
    - Create transaction object with id, itemName, amount, category, timestamp
    - Add to transactions array
    - Call storageManager.save()
    - Return {success: true, transaction} or {success: false, error}
    - _Requirements: 1.3, 1.4, 1.6_
  
  - [ ]* 4.4 Write property test for transaction creation
    - **Property 3: Transaction Creation Adds to List**
    - **Validates: Requirements 1.3, 2.1**
    - Generate valid transaction data and verify list length increases by one
  
  - [ ]* 4.5 Write property test for invalid input rejection
    - **Property 5: Invalid Input Rejected**
    - **Validates: Requirements 1.4**
    - Generate invalid inputs (empty names, negative amounts) and verify rejection
  
  - [x] 4.6 Implement deleteTransaction(id) method
    - Filter transactions array to remove transaction with matching id
    - Call storageManager.save() with updated array
    - Return {success: true} or {success: false, error}
    - _Requirements: 3.2, 3.3_
  
  - [ ]* 4.7 Write property test for transaction deletion
    - **Property 4: Transaction Deletion Removes from Storage and Display**
    - **Validates: Requirements 3.2, 3.3, 6.2**
    - Generate transaction list, delete random transaction, verify removal
  
  - [ ]* 4.8 Write property test for balance after deletion
    - **Property 10: Balance Updates After Deletion**
    - **Validates: Requirements 3.4, 4.4**
    - Verify new balance equals old balance minus deleted amount

- [ ] 5. Implement ChartManager class
  - [x] 5.1 Create ChartManager with Chart.js integration
    - Implement constructor(canvasElement) storing canvas reference
    - Implement initialize() creating Chart.js pie chart instance
    - Configure chart as responsive with 200ms animation
    - Define color palette for categories
    - Implement update(categoryDataMap) method
    - Extract labels and data from Map
    - Update chart data and call chart.update()
    - Handle empty data case with placeholder
    - Implement reset() method to destroy and recreate chart
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [ ]* 5.2 Write property test for chart data accuracy
    - **Property 6: Chart Data Reflects Category Totals**
    - **Validates: Requirements 5.2, 5.3, 5.4**
    - Generate transaction sets and verify chart data matches category sums

- [ ] 6. Implement UIManager class
  - [x] 6.1 Create UIManager with DOM manipulation methods
    - Implement constructor(transactionManager, chartManager)
    - Cache DOM element references (form inputs, balance display, transaction list, chart canvas)
    - Implement clearForm() to reset all input fields
    - Implement showError(message) to display validation errors
    - Implement showSuccess(message) for user feedback
    - _Requirements: 1.5, 8.4_
  
  - [x] 6.2 Implement updateBalance() method
    - Call transactionManager.calculateBalance()
    - Format balance to 2 decimal places
    - Update balance display element textContent
    - _Requirements: 4.1, 4.3, 4.4_
  
  - [x] 6.3 Implement renderTransactionList() method
    - Get transactions from transactionManager
    - Create DocumentFragment for batch DOM insertion
    - For each transaction, create list item element with item name, amount, category
    - Add delete button with data-transaction-id attribute
    - Clear transaction list container innerHTML
    - Append fragment to container (single reflow)
    - _Requirements: 2.1, 2.2, 3.1_
  
  - [ ]* 6.4 Write property test for transaction display
    - **Property 7: Transaction Display Contains Required Fields**
    - **Validates: Requirements 2.2**
    - Generate transactions and verify rendered HTML contains all fields
  
  - [ ]* 6.5 Write property test for delete controls
    - **Property 8: Each Transaction Has Delete Control**
    - **Validates: Requirements 3.1**
    - Verify each rendered transaction has delete button with correct ID
  
  - [x] 6.6 Implement updateChart() method
    - Get spending by category from transactionManager
    - Call chartManager.update() with category data
    - _Requirements: 5.3, 5.4_

- [ ] 7. Implement application initialization and event handling
  - [x] 7.1 Create application initialization function
    - Check if Local Storage is available using StorageManager.isAvailable()
    - If unavailable, display error message to user
    - Initialize StorageManager with key 'transactions'
    - Load transactions from storage
    - Initialize TransactionManager with loaded data
    - Initialize ChartManager with canvas element
    - Initialize UIManager with managers
    - Render initial transaction list
    - Update initial balance display
    - Update initial chart
    - _Requirements: 6.3, 6.4, 2.5, 4.5_
  
  - [x] 7.2 Implement form submission event handler
    - Add event listener to form submit event
    - Prevent default form submission
    - Get values from form inputs (trim itemName)
    - Parse amount as float
    - Call transactionManager.addTransaction()
    - If success: call uiManager.clearForm(), renderTransactionList(), updateBalance(), updateChart()
    - If error: call uiManager.showError() with error message
    - Ensure all UI updates complete within 100ms
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 2.4, 4.3, 5.3, 9.2_
  
  - [ ]* 7.3 Write property test for form clearing
    - **Property 9: Form Cleared After Submission**
    - **Validates: Requirements 1.5**
    - Submit valid transaction and verify form inputs are empty
  
  - [x] 7.4 Implement delete button event handler with event delegation
    - Add click event listener to transaction list container
    - Check if clicked element has 'delete-btn' class
    - Get transaction ID from data-transaction-id attribute
    - Call transactionManager.deleteTransaction(id)
    - If success: call renderTransactionList(), updateBalance(), updateChart()
    - If error: call uiManager.showError()
    - Ensure all UI updates complete within 100ms
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 2.4, 4.4, 5.4, 9.2_
  
  - [x] 7.5 Add DOMContentLoaded event listener
    - Wrap initialization function in DOMContentLoaded listener
    - Ensure all DOM elements are available before initialization
    - _Requirements: 2.5, 4.5_

- [x] 8. Checkpoint - Verify core functionality
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Add error handling and edge cases
  - [x] 9.1 Add comprehensive error handling
    - Wrap all storage operations in try-catch blocks
    - Handle storage quota exceeded errors gracefully
    - Handle JSON parse errors when loading data
    - Display user-friendly error messages for all error scenarios
    - Log errors to console for debugging
    - _Requirements: 6.4_
  
  - [x] 9.2 Handle edge cases in UI
    - Display appropriate message when transaction list is empty
    - Handle chart rendering with zero transactions (empty state)
    - Format large amounts correctly (thousands separators optional)
    - Round amounts to 2 decimal places for display
    - Escape special characters in item names for XSS prevention
    - _Requirements: 5.5, 8.4_

- [ ] 10. Performance optimization and final polish
  - [x] 10.1 Optimize performance for large datasets
    - Verify DocumentFragment usage for batch DOM updates
    - Ensure event delegation is used for delete buttons (O(1) listeners)
    - Test with 1000 transactions to verify no performance degradation
    - Verify balance updates complete within 100ms
    - Verify chart updates complete within 200ms
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 10.2 Add code comments and documentation
    - Add JSDoc comments to all class methods
    - Document complex algorithms (balance calculation, category aggregation)
    - Add inline comments for non-obvious logic
    - Ensure consistent naming conventions throughout
    - _Requirements: 10.4, 10.5_
  
  - [x] 10.3 Final cross-browser testing
    - Test in Chrome (current version)
    - Test in Firefox (current version)
    - Test in Edge (current version)
    - Test in Safari (current version)
    - Verify Chart.js renders correctly in all browsers
    - Verify Local Storage works in all browsers
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 11. Final checkpoint - Complete testing and validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation uses vanilla JavaScript (ES6+) with no frameworks except Chart.js
- All data persists in Local Storage with key 'transactions'
- Property tests should use fast-check library with minimum 100 iterations
- Unit tests should use Jest or similar JavaScript testing framework
- Focus on mobile-first responsive design (minimum 320px width)
- Ensure all user interactions provide feedback within 100ms
- Chart updates should complete within 200ms
