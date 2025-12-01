# SF Formula

A powerful formula evaluation engine for TypeScript/JavaScript applications.

## Installation

```bash
npm install @sharinpix/sf-formula
```

## Import Options

This library provides multiple import paths to avoid dependency conflicts, especially with CodeMirror:

### Default Import (Compiled)

```typescript
import { formulaEval } from '@sharinpix/sf-formula';
```

### Core Functionality Only (Raw TypeScript)

```typescript
// For projects that want to avoid CodeMirror dependencies
import { formulaEval } from '@sharinpix/sf-formula/core';
```

### Raw TypeScript Source

```typescript
// Direct access to TypeScript source files
import { formulaEval } from '@sharinpix/sf-formula/src';
```

### Individual Modules

```typescript
// Import specific functionality
import { defaultFunctions } from '@sharinpix/sf-formula/functions';
import { parser } from '@sharinpix/sf-formula/parser';
```

## CodeMirror Integration

If you're using CodeMirror in your project and experiencing conflicts, use the `/core` import:

```typescript
import { formulaEval } from '@sharinpix/sf-formula/core';
import { EditorView } from '@codemirror/view'; // Your own CodeMirror version

// This avoids duplicate CodeMirror instances
const result = formulaEval('2 + 2');
```

For CodeMirror language support (syntax highlighting, autocompletion), install peer dependencies:

```bash
npm install @codemirror/language @codemirror/autocomplete @lezer/common @lezer/highlight @lezer/lr
```

Then use:

```typescript
import { languagePack } from '@sharinpix/sf-formula';
import { EditorView } from '@codemirror/view';

const view = new EditorView({
  extensions: [languagePack()],
  // ... other config
});
```

## Usage

```typescript
import { formulaEval } from '@sharinpix/sf-formula/core';

// Simple evaluation
const result = formulaEval('2 + 2'); // 4

// With variables
const context = { x: 10, y: 5 };
const result2 = formulaEval('x + y', context); // 15

// With nested objects
const context2 = { user: { age: 25 } };
const result3 = formulaEval('user.age > 18', context2); // true

// With functions
const result4 = formulaEval('IF(x > 0, "positive", "negative")', { x: 5 }); // "positive"
```

## Peer Dependencies

If you need CodeMirror integration, install these peer dependencies:

- `@codemirror/language`
- `@codemirror/autocomplete`
- `@lezer/common`
- `@lezer/highlight`
- `@lezer/lr`

## License

MIT
