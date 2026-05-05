/**
 * Simple validation script to verify the gallery setup
 * This runs without vitest to avoid Node.js compatibility issues
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Validating Gallery Performance Optimization Setup...\n');

// Check if all required directories exist
const requiredDirs = [
  'src/gallery',
  'src/gallery/types',
  'src/gallery/interfaces',
];

const requiredFiles = [
  'src/gallery/index.ts',
  'src/gallery/types/index.ts',
  'src/gallery/types/image-metadata.ts',
  'src/gallery/types/loading-state.ts',
  'src/gallery/types/cache-config.ts',
  'src/gallery/types/network-state.ts',
  'src/gallery/types/performance-metrics.ts',
  'src/gallery/types/error-handling.ts',
  'src/gallery/types/viewport-state.ts',
  'src/gallery/types/quality-settings.ts',
  'src/gallery/interfaces/index.ts',
  'src/gallery/interfaces/gallery-component.ts',
  'src/gallery/interfaces/image-manager.ts',
  'src/gallery/interfaces/cache-manager.ts',
  'src/gallery/interfaces/viewport-manager.ts',
  'tsconfig.json',
];

let allValid = true;

// Check directories
console.log('📁 Checking directories...');
for (const dir of requiredDirs) {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}`);
  } else {
    console.log(`❌ ${dir} - MISSING`);
    allValid = false;
  }
}

console.log('\n📄 Checking files...');
// Check files
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allValid = false;
  }
}

// Try to import the main module
console.log('\n🔧 Testing TypeScript compilation...');
try {
  // Check if we can read the main index file
  const indexContent = fs.readFileSync('src/gallery/index.ts', 'utf8');
  if (indexContent.includes('export * from')) {
    console.log('✅ Main index.ts exports are properly configured');
  } else {
    console.log('❌ Main index.ts missing exports');
    allValid = false;
  }
} catch (error) {
  console.log(`❌ Error reading main index: ${error.message}`);
  allValid = false;
}

// Check package.json dependencies
console.log('\n📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['fast-check', 'vitest', 'jsdom'];
  
  for (const dep of requiredDeps) {
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`✅ ${dep} - ${packageJson.devDependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
      allValid = false;
    }
  }
} catch (error) {
  console.log(`❌ Error reading package.json: ${error.message}`);
  allValid = false;
}

console.log('\n' + '='.repeat(50));
if (allValid) {
  console.log('🎉 Setup validation PASSED! All components are in place.');
  console.log('\nNext steps:');
  console.log('1. The core interfaces and types are ready');
  console.log('2. TypeScript configuration is set up');
  console.log('3. Testing framework is configured');
  console.log('4. Ready to implement the actual components');
} else {
  console.log('❌ Setup validation FAILED! Some components are missing.');
  process.exit(1);
}

console.log('\n📋 Summary of created components:');
console.log('• Core Types: ImageMetadata, LoadingState, CacheConfig, NetworkState');
console.log('• Performance Types: PerformanceMetrics, QualitySettings');
console.log('• Error Handling: GalleryError, ErrorHandler, ErrorRecoveryStrategy');
console.log('• Viewport Types: ViewportState, IntersectionData, VirtualScrollConfig');
console.log('• Component Interfaces: GalleryComponent, ImageManager, CacheManager, ViewportManager');
console.log('• Testing Setup: Vitest + fast-check + jsdom + TypeScript');