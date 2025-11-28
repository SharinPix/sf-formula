# SF Formula Demo

This demo site showcases the sf-formula library functionality with a simple web interface.

## Files Created

- `index.html` - The main HTML page with a modern, responsive design
- `demo.ts` - TypeScript code that handles the demo functionality
- `webpack.config.js` - Webpack configuration for building the demo
- `tsconfig.json` - TypeScript configuration
- `package.json` - Updated with webpack dependencies and build scripts

## Available Scripts

- `npm run build` - Build the demo in development mode
- `npm run build:prod` - Build the demo in production mode (minified)
- `npm run dev` - Start the webpack dev server with hot reload on port 8080

## Usage

1. **Build the demo:**

   ```bash
   npm run build
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

   This will open your browser automatically to `http://localhost:8080`

3. **Or serve the built files:**
   After building, you can serve the `dist/` folder with any static file server.

## Demo Features

- Interactive formula input with real-time evaluation
- Error handling and display
- Example formulas to try
- Clean, modern UI design
- Responsive design that works on mobile devices

## Next Steps

To integrate with the actual sf-formula library:

1. Import the sf-formula library in `demo.ts`
2. Replace the `mockEvaluate` method with actual library calls
3. Update the examples to showcase your library's specific features

The demo is ready to use with webpack for bundling and development!
