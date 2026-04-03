# Design Document: Expense & Budget Visualizer

## Overview

The Expense & Budget Visualizer is a client-side web application built with vanilla JavaScript, HTML, and CSS. The application provides transaction management, real-time balance calculation, and visual spending analysis through a pie chart. All data persists in browser Local Storage, eliminating the need for backend infrastructure.

### Key Design Principles

- **Simplicity**: Single-page application with minimal dependencies (Chart.js only)
- **Performance**: Optimized DOM manipulation and efficient data structures
- **Responsiveness**: Mobile-first design supporting devices from 320px width
- **Reliability**: Defensive programming with error handling for storage operations

### Technology Stack

- **HTML5**: Semantic markup with accessibility considerations
- **CSS3**: Single stylesheet with flexbox layout and media queries
- **Vanilla JavaScript (ES6+)**: No frameworks, leveraging modern browser APIs
- **Chart.js**: Lightweight charting library for pie chart visualization
- **Local Storage API**: Browser-native persistence layer

## Architecture

### Application Structure

```
expense-budget-visualizer/
├── index.html          # Single-page application entry point
├── css/
│   └── styles.css      # All application styles
└── js/
    └── app.js          # All application logic
```

### Component Architecture

The application follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│           index.html (View)             │
│  ┌─────────────┐  ┌──────────────────┐ │
│  │ Input Form  │  │  Balance Display │ │
│  └─────────────┘  └──────────────────┘ │
│  ┌─────────────────────────────────────┐│
│  │      Transaction List (Scrollable)  ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │      Pie Chart (Chart.js Canvas)    ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         app.js (Controller/Model)       │
│  ┌─────────────────────────────────────┐│
│  │  TransactionManager                 ││
│  │  - addTransaction()                 ││
│  │  - deleteTransaction()              ││
│  │  - getTransactions()                ││
│  │  - calculateBalance()               ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │  StorageManager                     ││
│  │  - save()                           ││
│  │  - load()                           ││
│  │  - isAvailable()                    ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │  UIManager                          ││
│  │  - renderTransactionList()          ││
│  │  - updateBalance()                  ││
│  │  - updateChart()                    ││
│  │  - showError()                      ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│      Browser Local Storage API          │
│  Key: 'transactions'                    │
│  Value: JSON array of transaction objs  │
└─────────────────────────────────────────┘
```

### Data Flow

1. **User Input** → Form submission triggers validation
2. **Validation** → If valid, create transaction object
3. **Transaction Creation** → Add to in-memory array
4. **Persistence** → Save to Local Storage
5. **UI Update** → Render transaction list, update balance, update chart
6. **User Deletion** → Remove from array and storage, trigger UI updates

### Event-Driven Architecture

The application uses event listeners for user interactions:

- Form submission → Add transaction workflow
- Delete button clicks → Remove transaction workflow (event delegation)
- Page load → Initialize application, load data from storage

## Components and Interfaces

### 1. TransactionManager

**Responsibility**: Core business logic for transaction operations and balance calculation

**Interface**:
```javascript
class TransactionManager {
  constructor(storageManager)
  
  // Add a new transaction
  // Returns: { success: boolean, transaction?: object, error?: string }
  addTransaction(itemName, amount, category)
  
  // Delete transaction by ID
  // Returns: { success: boolean, error?: string }
  deleteTransaction(id)
  
  // Get all transactions
  // Returns: Array<Transaction>
  getTransactions()
  
  // Calculate total balance
  // Returns: number
  calculateBalance()
  
  // Get spending by category
  // Returns: Map<string, number>
  getSpendingByCategory()
}
```

**Internal State**:
- `transactions`: Array of transaction objects
- `storageManager`: Reference to StorageManager instance

**Transaction Object Structure**:
```javascript
{
  id: string,           // UUID or timestamp-based unique identifier
  itemName: string,     // User-provided item description
  amount: number,       // Positive number (validated)
  category: string,     // One of: Food, Transport, Fun, or custom
  timestamp: number     // Date.now() for creation time
}
```

### 2. StorageManager

**Responsibility**: Abstract Local Storage operations with error handling

**Interface**:
```javascript
class StorageManager {
  constructor(storageKey)
  
  // Save transactions to Local Storage
  // Returns: { success: boolean, error?: string }
  save(transactions)
  
  // Load transactions from Local Storage
  // Returns: { success: boolean, data?: Array, error?: string }
  load()
  
  // Check if Local Storage is available
  // Returns: boolean
  isAvailable()
}
```

**Error Handling**:
- Quota exceeded: Return error message
- Storage unavailable: Return error message
- Parse errors: Return empty array with warning

### 3. UIManager

**Responsibility**: DOM manipulation and visual updates

**Interface**:
```javascript
class UIManager {
  constructor(transactionManager)
  
  // Render the complete transaction list
  renderTransactionList()
  
  // Update balance display
  updateBalance()
  
  // Update pie chart with current data
  updateChart()
  
  // Show error message to user
  showError(message)
  
  // Show success feedback
  showSuccess(message)
  
  // Clear form inputs
  clearForm()
}
```

**DOM References** (cached on initialization):
- Form elements: `itemNameInput`, `amountInput`, `categorySelect`, `submitButton`
- Display elements: `balanceDisplay`, `transactionListContainer`, `chartCanvas`
- Message elements: `errorMessageContainer`

### 4. ChartManager

**Responsibility**: Chart.js integration and updates

**Interface**:
```javascript
class ChartManager {
  constructor(canvasElement)
  
  // Initialize Chart.js instance
  initialize()
  
  // Update chart with new data
  // data: Map<string, number> (category → total)
  update(data)
  
  // Destroy and recreate chart (if needed)
  reset()
}
```

**Chart Configuration**:
- Type: Pie chart
- Responsive: true
- Legend: Display category names
- Colors: Predefined palette for categories
- Animation: 200ms duration (meets performance requirement)

## Data Models

### Transaction Model

```javascript
{
  id: string,           // Unique identifier (UUID v4 or timestamp-based)
  itemName: string,     // 1-100 characters, trimmed
  amount: number,       // Positive float, max 2 decimal places
  category: string,     // Enum: Food | Transport | Fun | <custom>
  timestamp: number     // Unix timestamp (milliseconds)
}
```

**Validation Rules**:
- `id`: Must be unique, non-empty string
- `itemName`: Required, 1-100 characters after trim
- `amount`: Required, positive number, > 0
- `category`: Required, non-empty string
- `timestamp`: Required, valid Unix timestamp

### Storage Schema

**Key**: `'transactions'`

**Value**: JSON string of transaction array
```javascript
[
  {
    "id": "1234567890-abc",
    "itemName": "Lunch",
    "amount": 12.50,
    "category": "Food",
    "timestamp": 1704067200000
  },
  // ... more transactions
]
```

### Category Model

**Default Categories**: `['Food', 'Transport', 'Fun']`

**Custom Categories** (Optional Feature A):
- Stored separately in Local Storage key: `'customCategories'`
- Value: JSON array of strings
- Merged with default categories in UI

### Application State

The application maintains state in memory:

```javascript
{
  transactions: Array<Transaction>,     // All transactions
  chart: Chart,                         // Chart.js instance
  isStorageAvailable: boolean          // Storage availability flag
}
```

## Data Structures and Algorithms

### Transaction Storage

**Data Structure**: Array of transaction objects
- **Rationale**: Simple, JSON-serializable, maintains insertion order
- **Operations**:
  - Add: O(1) - push to end
  - Delete: O(n) - filter by id
  - Read all: O(1) - return reference
  - Calculate balance: O(n) - reduce sum

### Balance Calculation

```javascript
// Algorithm: Array.reduce for sum
function calculateBalance(transactions) {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}
// Time: O(n), Space: O(1)
```

### Category Aggregation

```javascript
// Algorithm: Map-based grouping
function getSpendingByCategory(transactions) {
  const categoryMap = new Map();
  for (const transaction of transactions) {
    const current = categoryMap.get(transaction.category) || 0;
    categoryMap.set(transaction.category, current + transaction.amount);
  }
  return categoryMap;
}
// Time: O(n), Space: O(k) where k = number of categories
```

### Transaction List Rendering

**Optimization**: Use DocumentFragment for batch DOM insertion
```javascript
function renderTransactionList(transactions) {
  const fragment = document.createDocumentFragment();
  for (const transaction of transactions) {
    const element = createTransactionElement(transaction);
    fragment.appendChild(element);
  }
  container.innerHTML = ''; // Clear existing
  container.appendChild(fragment); // Single reflow
}
// Time: O(n), Reflows: 1
```

### Event Delegation for Delete Buttons

**Pattern**: Single listener on parent container
```javascript
transactionListContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const id = e.target.dataset.transactionId;
    handleDelete(id);
  }
});
```
**Benefit**: O(1) listeners instead of O(n)


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Transaction Persistence Round-Trip

*For any* set of valid transactions, if they are saved to storage and then loaded back, the loaded transactions should be equivalent to the original transactions.

**Validates: Requirements 6.1, 6.3, 2.5**

### Property 2: Balance Equals Sum of Amounts

*For any* set of transactions in the application, the displayed balance should always equal the sum of all transaction amounts.

**Validates: Requirements 4.2, 4.3, 4.4, 4.5**

### Property 3: Transaction Creation Adds to List

*For any* valid transaction (non-empty item name, positive amount, valid category), when added to the application, the transaction list length should increase by one and the new transaction should appear in the list.

**Validates: Requirements 1.3, 2.1**

### Property 4: Transaction Deletion Removes from Storage and Display

*For any* transaction in the application, when deleted, it should no longer appear in the transaction list and should not exist in Local Storage.

**Validates: Requirements 3.2, 3.3, 6.2**

### Property 5: Invalid Input Rejected

*For any* transaction with empty or whitespace-only item name, or non-positive amount, the application should reject the transaction and display a validation error.

**Validates: Requirements 1.4**

### Property 6: Chart Data Reflects Category Totals

*For any* set of transactions, the data passed to the chart should contain each category with a value equal to the sum of all transaction amounts in that category.

**Validates: Requirements 5.2, 5.3, 5.4**

### Property 7: Transaction Display Contains Required Fields

*For any* transaction in the list, the rendered HTML should contain the transaction's item name, amount, and category.

**Validates: Requirements 2.2**

### Property 8: Each Transaction Has Delete Control

*For any* transaction displayed in the list, there should be an associated delete control element with the transaction's ID.

**Validates: Requirements 3.1**

### Property 9: Form Cleared After Submission

*For any* valid transaction submission, the form input fields should be empty after the transaction is created.

**Validates: Requirements 1.5**

### Property 10: Balance Updates After Deletion

*For any* transaction, when deleted, the new balance should equal the old balance minus the deleted transaction's amount.

**Validates: Requirements 3.4, 4.4**

## Error Handling

### Storage Errors

**Scenario**: Local Storage unavailable or quota exceeded

**Handling Strategy**:
1. Check storage availability on application initialization
2. If unavailable, display prominent error message to user
3. Allow application to function in memory-only mode (data lost on refresh)
4. Wrap all storage operations in try-catch blocks
5. Log errors to console for debugging

**Error Messages**:
- "Storage unavailable: Your data will not be saved between sessions"
- "Storage quota exceeded: Please delete some transactions"

### Validation Errors

**Scenario**: Invalid form input

**Handling Strategy**:
1. Validate on form submission (not on every keystroke)
2. Display specific error messages near relevant fields
3. Prevent form submission until errors are resolved
4. Clear error messages when user corrects input

**Validation Rules**:
- Item name: Required, non-empty after trim, max 100 characters
- Amount: Required, positive number, max 2 decimal places
- Category: Required, must be from available options

**Error Messages**:
- "Please enter an item name"
- "Amount must be a positive number"
- "Please select a category"

### Chart Rendering Errors

**Scenario**: Chart.js fails to load or render

**Handling Strategy**:
1. Check for Chart.js availability before initialization
2. If unavailable, display fallback message
3. Catch rendering errors and log to console
4. Provide text-based category summary as fallback

**Error Messages**:
- "Chart visualization unavailable. Category totals: [list]"

### Data Corruption

**Scenario**: Invalid data in Local Storage

**Handling Strategy**:
1. Validate loaded data structure
2. Filter out invalid transactions
3. If data is completely corrupted, clear storage and start fresh
4. Notify user of data issues

**Error Messages**:
- "Some saved transactions were invalid and have been removed"
- "Saved data was corrupted. Starting with a fresh list."

## Testing Strategy

### Overview

The testing strategy employs a dual approach combining unit tests for specific scenarios and property-based tests for comprehensive validation of universal properties.

### Unit Testing

**Purpose**: Verify specific examples, edge cases, and error conditions

**Framework**: Jest (or similar JavaScript testing framework)

**Test Categories**:

1. **Component Initialization**
   - Test that TransactionManager initializes with empty array
   - Test that StorageManager correctly detects availability
   - Test that UIManager caches DOM references correctly

2. **Edge Cases**
   - Empty transaction list displays correctly
   - Single transaction displays correctly
   - Large amounts (>1000) format correctly
   - Decimal amounts round to 2 places
   - Special characters in item names are escaped

3. **Error Conditions**
   - Storage unavailable scenario
   - Invalid JSON in storage
   - Missing required fields in transaction
   - Negative amounts rejected
   - Empty string item names rejected

4. **Integration Points**
   - Form submission triggers all necessary updates
   - Delete button click removes transaction
   - Page load initializes all components

**Example Unit Tests**:
```javascript
describe('TransactionManager', () => {
  test('empty list has zero balance', () => {
    const manager = new TransactionManager(mockStorage);
    expect(manager.calculateBalance()).toBe(0);
  });

  test('rejects negative amounts', () => {
    const result = manager.addTransaction('Test', -5, 'Food');
    expect(result.success).toBe(false);
    expect(result.error).toContain('positive');
  });
});
```

### Property-Based Testing

**Purpose**: Verify universal properties across randomized inputs

**Framework**: fast-check (JavaScript property-based testing library)

**Configuration**:
- Minimum 100 iterations per property test
- Custom generators for transaction objects
- Shrinking enabled for minimal failing examples

**Generators**:

```javascript
// Generate valid transaction objects
const transactionArbitrary = fc.record({
  id: fc.uuid(),
  itemName: fc.string({ minLength: 1, maxLength: 100 }),
  amount: fc.float({ min: 0.01, max: 10000, noNaN: true }),
  category: fc.constantFrom('Food', 'Transport', 'Fun'),
  timestamp: fc.integer({ min: 0 })
});

// Generate arrays of transactions
const transactionListArbitrary = fc.array(transactionArbitrary, { maxLength: 100 });
```

**Property Tests**:

Each property test must reference its corresponding design property:

```javascript
describe('Property 1: Transaction Persistence Round-Trip', () => {
  test('Feature: expense-budget-visualizer, Property 1: For any set of valid transactions, if they are saved to storage and then loaded back, the loaded transactions should be equivalent to the original transactions', () => {
    fc.assert(
      fc.property(transactionListArbitrary, (transactions) => {
        const storage = new StorageManager('test-key');
        storage.save(transactions);
        const result = storage.load();
        expect(result.success).toBe(true);
        expect(result.data).toEqual(transactions);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 2: Balance Equals Sum of Amounts', () => {
  test('Feature: expense-budget-visualizer, Property 2: For any set of transactions in the application, the displayed balance should always equal the sum of all transaction amounts', () => {
    fc.assert(
      fc.property(transactionListArbitrary, (transactions) => {
        const manager = new TransactionManager(mockStorage);
        manager.transactions = transactions;
        const balance = manager.calculateBalance();
        const expectedSum = transactions.reduce((sum, t) => sum + t.amount, 0);
        expect(balance).toBeCloseTo(expectedSum, 2);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 3: Transaction Creation Adds to List', () => {
  test('Feature: expense-budget-visualizer, Property 3: For any valid transaction, when added to the application, the transaction list length should increase by one', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.float({ min: 0.01, max: 10000 }),
        fc.constantFrom('Food', 'Transport', 'Fun'),
        (itemName, amount, category) => {
          const manager = new TransactionManager(mockStorage);
          const initialLength = manager.getTransactions().length;
          const result = manager.addTransaction(itemName, amount, category);
          expect(result.success).toBe(true);
          expect(manager.getTransactions().length).toBe(initialLength + 1);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 4: Transaction Deletion Removes from Storage and Display', () => {
  test('Feature: expense-budget-visualizer, Property 4: For any transaction in the application, when deleted, it should no longer appear in the transaction list', () => {
    fc.assert(
      fc.property(transactionListArbitrary, (transactions) => {
        if (transactions.length === 0) return true; // Skip empty case
        
        const manager = new TransactionManager(mockStorage);
        manager.transactions = [...transactions];
        const toDelete = transactions[0];
        
        manager.deleteTransaction(toDelete.id);
        
        const remaining = manager.getTransactions();
        expect(remaining.find(t => t.id === toDelete.id)).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 5: Invalid Input Rejected', () => {
  test('Feature: expense-budget-visualizer, Property 5: For any transaction with empty item name or non-positive amount, the application should reject it', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.string().filter(s => s.trim() === '')
        ),
        fc.float({ min: -1000, max: 0 }),
        fc.constantFrom('Food', 'Transport', 'Fun'),
        (itemName, amount, category) => {
          const manager = new TransactionManager(mockStorage);
          const result = manager.addTransaction(itemName, amount, category);
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 6: Chart Data Reflects Category Totals', () => {
  test('Feature: expense-budget-visualizer, Property 6: For any set of transactions, the chart data should contain each category with correct totals', () => {
    fc.assert(
      fc.property(transactionListArbitrary, (transactions) => {
        const manager = new TransactionManager(mockStorage);
        manager.transactions = transactions;
        const categoryData = manager.getSpendingByCategory();
        
        // Verify each category total
        const categories = [...new Set(transactions.map(t => t.category))];
        for (const category of categories) {
          const expected = transactions
            .filter(t => t.category === category)
            .reduce((sum, t) => sum + t.amount, 0);
          expect(categoryData.get(category)).toBeCloseTo(expected, 2);
        }
      }),
      { numRuns: 100 }
    );
  });
});
```

### Test Coverage Goals

- **Line Coverage**: Minimum 80%
- **Branch Coverage**: Minimum 75%
- **Function Coverage**: 100% of public methods

### Manual Testing Checklist

Due to the visual and interactive nature of the application, manual testing is required for:

1. **Visual Design**
   - Layout appears correctly on mobile (320px) and desktop (1920px)
   - Colors and typography meet design specifications
   - Chart renders correctly with various data sets

2. **User Interactions**
   - Form submission feels responsive
   - Delete buttons are easy to tap on mobile
   - Scrolling works smoothly with many transactions
   - Error messages are clearly visible

3. **Browser Compatibility**
   - Test in Chrome, Firefox, Edge, Safari
   - Verify Local Storage works in all browsers
   - Check Chart.js renders correctly in all browsers

4. **Performance**
   - Load time with 1000 transactions
   - Responsiveness of UI with large datasets
   - Chart animation smoothness

### Continuous Integration

**Recommended Setup**:
- Run unit tests and property tests on every commit
- Use GitHub Actions or similar CI/CD platform
- Fail build if any test fails or coverage drops below threshold
- Run tests in multiple browser environments using tools like Playwright or Puppeteer

