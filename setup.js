#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🌳 Habitat Dashboard Setup\n');
console.log('This will help you configure your environment variables.\n');

const questions = [
  {
    key: 'OPENAI_API_KEY',
    question: 'Enter your OpenAI API key (required for AI chat, starts with sk-): ',
    required: true
  },
  {
    key: 'SENTINELHUB_CLIENT_ID',
    question: 'Enter Sentinel Hub Client ID (optional, press Enter to skip): ',
    required: false
  },
  {
    key: 'SENTINELHUB_CLIENT_SECRET',
    question: 'Enter Sentinel Hub Client Secret (optional, press Enter to skip): ',
    required: false
  },
  {
    key: 'OPENWEATHER_API_KEY',
    question: 'Enter OpenWeather API key (optional, press Enter to skip): ',
    required: false
  },
  {
    key: 'GFW_API_KEY',
    question: 'Enter Global Forest Watch API key (optional, press Enter to skip): ',
    required: false
  }
];

const answers = {};

function askQuestion(index) {
  if (index >= questions.length) {
    createEnvFile();
    return;
  }

  const q = questions[index];
  rl.question(q.question, (answer) => {
    if (q.required && !answer.trim()) {
      console.log(`❌ ${q.key} is required. Please try again.`);
      askQuestion(index);
    } else {
      if (answer.trim()) {
        answers[q.key] = answer.trim();
      }
      askQuestion(index + 1);
    }
  });
}

function createEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  
  let envContent = '# Habitat Dashboard Environment Variables\n\n';
  
  // Add provided values
  Object.entries(answers).forEach(([key, value]) => {
    envContent += `${key}=${value}\n`;
  });
  
  // Add default values for optional keys
  envContent += '\n# AI Provider (openai or gemini)\n';
  envContent += 'AI_PROVIDER=openai\n';
  
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Environment file created successfully!\n');
  console.log('Configuration saved to .env\n');
  console.log('Next steps:');
  console.log('  1. Run: npm run dev');
  console.log('  2. Open: http://localhost:3000');
  console.log('  3. Test the AI chat in the dashboard\n');
  console.log('📖 For more info, see README.md and SETUP.md\n');
  
  rl.close();
}

// Check if .env already exists
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  rl.question('.env file already exists. Overwrite? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      askQuestion(0);
    } else {
      console.log('\nSetup cancelled. Existing .env file kept.\n');
      rl.close();
    }
  });
} else {
  askQuestion(0);
}
