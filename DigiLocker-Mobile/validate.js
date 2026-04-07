// Quick validation script - paste this into any .js file and run node filename.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating DigiLocker Project...\n');

const checks = {
  pass: 0,
  fail: 0,
  warnings: 0
};

// Check if build error file exists and is fixed
const profilePath = './app/(app)/profile.jsx';
if (fs.existsSync(profilePath)) {
  const content = fs.readFileSync(profilePath, 'utf8');
  const lines = content.split('\n');
  
  // Check for duplicate code around line 113
  let hasDuplicate = false;
  for (let i = 110; i < Math.min(120, lines.length); i++) {
    if (lines[i].includes('checkmark') && lines[i+1].includes('Save') && lines[i+2].includes('TouchableOpacity') && lines[i+3].includes('View')) {
      hasDuplicate = true;
      break;
    }
  }
  
  if (!hasDuplicate) {
    console.log('✅ profile.jsx - Build error fixed');
    checks.pass++;
  } else {
    console.log('❌ profile.jsx - Still has duplicate code');
    checks.fail++;
  }
} else {
  console.log('❌ profile.jsx - File not found');
  checks.fail++;
}

// Check if unused files still exist
const unusedFiles = [
  './screens',
  './scripts/App.js',
  './constants/createPostScreen.jsx',
  './constants/userSettings.jsx'
];

unusedFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`⚠️  ${file} - Still exists (should be deleted)`);
    checks.warnings++;
  } else {
    console.log(`✅ ${file} - Removed`);
    checks.pass++;
  }
});

// Check if create-post.jsx is fixed
const createPostPath = './app/create-post.jsx';
if (fs.existsSync(createPostPath)) {
  const content = fs.readFileSync(createPostPath, 'utf8');
  if (content.includes('from "../constants/createPostScreen"')) {
    console.log('❌ create-post.jsx - Still imports deleted file');
    checks.fail++;
  } else if (content.includes('export default function CreatePostScreen')) {
    console.log('✅ create-post.jsx - Fixed');
    checks.pass++;
  } else {
    console.log('⚠️  create-post.jsx - Unknown state');
    checks.warnings++;
  }
}

// Check for new UI components
const uiComponents = [
  './components/ui/SuccessToast.jsx',
  './components/ui/ConfirmationModal.jsx',
  './components/ui/CustomButton.jsx',
  './components/ui/ThemeToggle.jsx',
  './components/ui/QuickAccessSidebar.jsx'
];

let uiCount = 0;
uiComponents.forEach(comp => {
  if (fs.existsSync(comp)) {
    uiCount++;
  }
});

if (uiCount === 5) {
  console.log(`✅ UI Components - All ${uiCount} components present`);
  checks.pass++;
} else {
  console.log(`⚠️  UI Components - Only ${uiCount}/5 found`);
  checks.warnings++;
}

// Final summary
console.log('\n' + '='.repeat(50));
console.log('📊 Validation Summary:');
console.log('='.repeat(50));
console.log(`✅ Passed: ${checks.pass}`);
console.log(`❌ Failed: ${checks.fail}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);
console.log('='.repeat(50));

if (checks.fail === 0) {
  console.log('\n🎉 All critical checks passed!');
  if (checks.warnings > 0) {
    console.log('⚠️  Run cleanup script to remove unused files');
  } else {
    console.log('✅ Project is clean and ready to build!');
  }
} else {
  console.log('\n❌ Some issues need attention');
}
