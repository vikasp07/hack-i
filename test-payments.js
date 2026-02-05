#!/usr/bin/env node

/**
 * Finternet Payment API Test Suite
 *
 * This script tests the payment integration endpoints.
 *
 * Usage:
 *   node test-payments.js [options]
 *
 * Options:
 *   --create     Create a test payment intent
 *   --status ID  Get status of a payment intent
 *   --cancel ID  Cancel a payment intent
 *   --mock       Use mock responses (no real API calls)
 *   --help       Show this help message
 *
 * Environment Variables:
 *   FINTERNET_API_KEY - Your Finternet API key (required for real API calls)
 *   BASE_URL - Base URL for your API (default: http://localhost:3000)
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  create: args.includes("--create"),
  status: args.includes("--status") ? args[args.indexOf("--status") + 1] : null,
  cancel: args.includes("--cancel") ? args[args.indexOf("--cancel") + 1] : null,
  mock: args.includes("--mock"),
  help: args.includes("--help") || args.includes("-h"),
};

// Help message
function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║         FINTERNET PAYMENT API TEST SUITE                       ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  node test-payments.js [options]

OPTIONS:
  --create       Create a test payment intent
  --status ID    Get status of a specific payment intent
  --cancel ID    Cancel a specific payment intent
  --mock         Use mock responses (no real API calls)
  --help, -h     Show this help message

ENVIRONMENT VARIABLES:
  FINTERNET_API_KEY  Your Finternet API key (required for real API calls)
  BASE_URL          Base URL for your API (default: http://localhost:3000)

EXAMPLES:
  # Create a test payment
  node test-payments.js --create

  # Check payment status
  node test-payments.js --status pi_test_123456

  # Cancel a payment
  node test-payments.js --cancel pi_test_123456

  # Run all tests with mock responses
  node test-payments.js --mock --create
  `);
}

// Create test payment intent
async function createTestPayment() {
  console.log("\n🔄 Creating test payment intent...\n");

  const testData = {
    amount: "10.00",
    currency: "USDC",
    type: "CONDITIONAL",
    settlementMethod: "OFF_RAMP_MOCK",
    settlementDestination: "test_account_" + Date.now(),
    description: "Test payment from test suite",
    metadata: {
      test: "true",
      timestamp: new Date().toISOString(),
    },
  };

  console.log("📤 Request Body:");
  console.log(JSON.stringify(testData, null, 2));
  console.log("");

  try {
    const response = await fetch(`${BASE_URL}/api/payments/create-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": `test_${Date.now()}`,
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();

    console.log(`📥 Response (${response.status}):`);
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log("\n✅ Payment intent created successfully!");
      console.log(`   ID: ${data.paymentIntent.id}`);
      console.log(`   Status: ${data.paymentIntent.status}`);
      console.log(
        `   Amount: ${data.paymentIntent.amount} ${data.paymentIntent.currency}`
      );
      return data.paymentIntent;
    } else {
      console.log("\n❌ Payment creation failed!");
      console.log(`   Error: ${data.error}`);
      console.log(`   Code: ${data.errorCode}`);
      return null;
    }
  } catch (error) {
    console.error("\n❌ Request failed:", error.message);
    return null;
  }
}

// Get payment status
async function getPaymentStatus(paymentIntentId) {
  console.log(`\n🔄 Fetching status for payment: ${paymentIntentId}\n`);

  try {
    const response = await fetch(
      `${BASE_URL}/api/payments/status/${encodeURIComponent(paymentIntentId)}`
    );
    const data = await response.json();

    console.log(`📥 Response (${response.status}):`);
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log("\n✅ Payment status retrieved successfully!");
      console.log(`   ID: ${data.paymentIntent.id}`);
      console.log(`   Status: ${data.paymentIntent.status}`);
      console.log(
        `   Amount: ${data.paymentIntent.amount} ${data.paymentIntent.currency}`
      );
      return data.paymentIntent;
    } else {
      console.log("\n❌ Failed to get payment status!");
      console.log(`   Error: ${data.error}`);
      return null;
    }
  } catch (error) {
    console.error("\n❌ Request failed:", error.message);
    return null;
  }
}

// Cancel payment
async function cancelPayment(paymentIntentId) {
  console.log(`\n🔄 Cancelling payment: ${paymentIntentId}\n`);

  try {
    const response = await fetch(
      `${BASE_URL}/api/payments/status/${encodeURIComponent(paymentIntentId)}`,
      {
        method: "DELETE",
      }
    );
    const data = await response.json();

    console.log(`📥 Response (${response.status}):`);
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log("\n✅ Payment cancelled successfully!");
      return true;
    } else {
      console.log("\n❌ Failed to cancel payment!");
      console.log(`   Error: ${data.error}`);
      return false;
    }
  } catch (error) {
    console.error("\n❌ Request failed:", error.message);
    return false;
  }
}

// Test API documentation endpoint
async function testApiDocs() {
  console.log("\n🔄 Testing API documentation endpoint...\n");

  try {
    const response = await fetch(`${BASE_URL}/api/payments/create-intent`);
    const data = await response.json();

    console.log(`📥 Response (${response.status}):`);
    console.log(JSON.stringify(data, null, 2));
    console.log("\n✅ API documentation retrieved successfully!");
    return true;
  } catch (error) {
    console.error("\n❌ Request failed:", error.message);
    return false;
  }
}

// Mock responses for testing without real API
function getMockPaymentIntent(id) {
  return {
    id: id || "pi_mock_" + Date.now(),
    amount: "10.00",
    currency: "USDC",
    type: "CONDITIONAL",
    status: "PENDING",
    settlementMethod: "OFF_RAMP_MOCK",
    settlementDestination: "test_account",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    metadata: { test: "true" },
  };
}

// Run tests
async function runTests() {
  console.log(
    "╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║         FINTERNET PAYMENT API TEST SUITE                       ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝"
  );
  console.log(`\n📍 Base URL: ${BASE_URL}`);
  console.log(
    `🔑 API Key: ${
      process.env.FINTERNET_API_KEY ? "***configured***" : "⚠️ NOT SET"
    }`
  );
  console.log(`🧪 Mock Mode: ${options.mock ? "ON" : "OFF"}`);

  if (options.help) {
    showHelp();
    return;
  }

  // Test API docs endpoint
  console.log("\n" + "─".repeat(60));
  console.log("TEST 1: API Documentation Endpoint");
  console.log("─".repeat(60));
  await testApiDocs();

  // Create payment if requested
  if (options.create) {
    console.log("\n" + "─".repeat(60));
    console.log("TEST 2: Create Payment Intent");
    console.log("─".repeat(60));

    if (options.mock) {
      console.log("\n📦 Using mock response");
      const mockPayment = getMockPaymentIntent();
      console.log(
        JSON.stringify({ success: true, paymentIntent: mockPayment }, null, 2)
      );
    } else {
      await createTestPayment();
    }
  }

  // Get status if requested
  if (options.status) {
    console.log("\n" + "─".repeat(60));
    console.log("TEST 3: Get Payment Status");
    console.log("─".repeat(60));

    if (options.mock) {
      console.log("\n📦 Using mock response");
      const mockPayment = getMockPaymentIntent(options.status);
      console.log(
        JSON.stringify({ success: true, paymentIntent: mockPayment }, null, 2)
      );
    } else {
      await getPaymentStatus(options.status);
    }
  }

  // Cancel payment if requested
  if (options.cancel) {
    console.log("\n" + "─".repeat(60));
    console.log("TEST 4: Cancel Payment");
    console.log("─".repeat(60));

    if (options.mock) {
      console.log("\n📦 Using mock response");
      const mockPayment = getMockPaymentIntent(options.cancel);
      mockPayment.status = "CANCELLED";
      console.log(
        JSON.stringify({ success: true, paymentIntent: mockPayment }, null, 2)
      );
    } else {
      await cancelPayment(options.cancel);
    }
  }

  // Run default tests if no specific action
  if (!options.create && !options.status && !options.cancel && !options.help) {
    console.log("\n" + "─".repeat(60));
    console.log("No specific test requested. Use --help for options.");
    console.log("─".repeat(60));
    showHelp();
  }

  console.log("\n" + "═".repeat(60));
  console.log("Tests completed!");
  console.log("═".repeat(60) + "\n");
}

// Error simulation tests
function runErrorSimulations() {
  console.log("\n" + "─".repeat(60));
  console.log("ERROR SIMULATION EXAMPLES");
  console.log("─".repeat(60));

  const errorScenarios = [
    {
      name: "Missing Amount",
      request: {
        currency: "USDC",
        type: "CONDITIONAL",
        settlementMethod: "OFF_RAMP_MOCK",
        settlementDestination: "test",
      },
      expectedError: "Missing required fields: amount",
    },
    {
      name: "Invalid Currency",
      request: {
        amount: "10.00",
        currency: "INVALID",
        type: "CONDITIONAL",
        settlementMethod: "OFF_RAMP_MOCK",
        settlementDestination: "test",
      },
      expectedError: "Invalid currency",
    },
    {
      name: "Invalid Amount Format",
      request: {
        amount: "not-a-number",
        currency: "USDC",
        type: "CONDITIONAL",
        settlementMethod: "OFF_RAMP_MOCK",
        settlementDestination: "test",
      },
      expectedError: "Invalid amount",
    },
    {
      name: "Missing API Key",
      note: "Remove FINTERNET_API_KEY from environment",
      expectedError: "FINTERNET_API_KEY is not configured",
    },
  ];

  console.log("\nError Scenarios for Testing:\n");
  errorScenarios.forEach((scenario, i) => {
    console.log(`${i + 1}. ${scenario.name}`);
    if (scenario.request) {
      console.log(`   Request: ${JSON.stringify(scenario.request)}`);
    }
    if (scenario.note) {
      console.log(`   Note: ${scenario.note}`);
    }
    console.log(`   Expected: ${scenario.expectedError}`);
    console.log("");
  });
}

// Export for programmatic use
module.exports = {
  createTestPayment,
  getPaymentStatus,
  cancelPayment,
  getMockPaymentIntent,
  runErrorSimulations,
};

// Run if called directly
runTests().catch(console.error);
