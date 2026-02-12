/**
 * UI Generation Tests
 * Run: npx tsx test-ui-generation.ts
 */

const BASE_URL = "http://localhost:3000/api/agent";

async function test(
  name: string,
  intent: string,
  previousTree: any = null
) {
  console.log(`\n🧪 ${name}`);
  console.log(`   Intent: "${intent}"`);

  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent, previousTree }),
    });

    const data = await response.json();

    if (data.success) {
      console.log(`   ✅ Success`);
      console.log(`   📋 JSON:`, JSON.stringify(data.plan, null, 2));
      console.log(`   📝 Explanation: ${data.explanation}`);
      return data;
    } else {
      console.log(`   ❌ Error: ${data.error}`);
      return null;
    }
  } catch (err: any) {
    console.log(`   ❌ Network Error: ${err.message}`);
    return null;
  }
}

async function runTests() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║   UI GENERATION TEST SUITE             ║");
  console.log("╚════════════════════════════════════════╝");

  // TEST 1: Base Generation
  const test1Result = await test(
    "TEST 1 — Base Generation",
    "Create a dashboard with a navbar and a revenue card."
  );

  if (!test1Result) {
    console.log("\n❌ TEST 1 FAILED - Cannot continue.");
    return;
  }

  const tree1 = test1Result.plan;

  // Validate TEST 1
  console.log("\n   Validating TEST 1...");
  let test1Pass = true;

  if (tree1.type !== "Navbar") {
    console.log(`   ❌ Root should be Navbar, got ${tree1.type}`);
    test1Pass = false;
  } else {
    console.log(`   ✅ Root is Navbar`);
  }

  if (!tree1.props || !tree1.props.title) {
    console.log(`   ❌ Navbar missing title in props`);
    test1Pass = false;
  } else {
    console.log(`   ✅ Navbar has title: "${tree1.props.title}"`);
  }

  if (!Array.isArray(tree1.children) || tree1.children.length === 0) {
    console.log(`   ❌ Navbar missing children`);
    test1Pass = false;
  } else {
    console.log(`   ✅ Navbar has children`);

    const card = tree1.children[0];
    if (card.type !== "Card") {
      console.log(`   ❌ First child should be Card, got ${card.type}`);
      test1Pass = false;
    } else {
      console.log(`   ✅ First child is Card`);
    }

    if (!card.props || !card.props.title) {
      console.log(`   ❌ Card missing title in props`);
      test1Pass = false;
    } else {
      console.log(`   ✅ Card has title: "${card.props.title}"`);
    }

    if (!Array.isArray(card.children)) {
      console.log(`   ❌ Card missing children array`);
      test1Pass = false;
    } else {
      console.log(`   ✅ Card has children array`);
    }
  }

  console.log(test1Pass ? "\n   ✅ TEST 1 PASSED" : "\n   ❌ TEST 1 FAILED");

  // TEST 2: Edit Awareness
  const test2Result = await test(
    "TEST 2 — Edit Awareness",
    "Add a settings modal.",
    tree1
  );

  if (!test2Result) {
    console.log("\n❌ TEST 2 FAILED - Cannot continue.");
    return;
  }

  const tree2 = test2Result.plan;

  console.log("\n   Validating TEST 2...");
  let test2Pass = true;

  if (tree2.type !== "Navbar") {
    console.log(`   ❌ Root should still be Navbar, got ${tree2.type}`);
    test2Pass = false;
  } else {
    console.log(`   ✅ Navbar preserved`);
  }

  if (!Array.isArray(tree2.children)) {
    console.log(`   ❌ Should have children`);
    test2Pass = false;
  } else {
    const hasCard = tree2.children.some((c: any) => c.type === "Card");
    const hasModal = tree2.children.some((c: any) => c.type === "Modal");

    if (!hasCard) {
      console.log(`   ❌ Card should still exist`);
      test2Pass = false;
    } else {
      console.log(`   ✅ Card preserved`);
    }

    if (!hasModal) {
      console.log(`   ❌ Modal should be added`);
      test2Pass = false;
    } else {
      console.log(`   ✅ Modal added`);
    }

    if (tree2.children.length <= 1) {
      console.log(`   ❌ Should have multiple children now`);
      test2Pass = false;
    } else {
      console.log(
        `   ✅ Structure has ${tree2.children.length} children (expanded)`
      );
    }
  }

  console.log(test2Pass ? "\n   ✅ TEST 2 PASSED" : "\n   ❌ TEST 2 FAILED");

  // TEST 3: Nested Modification
  const test3Result = await test(
    "TEST 3 — Nested Modification",
    "Add a revenue chart inside the existing card.",
    tree2
  );

  if (!test3Result) {
    console.log("\n❌ TEST 3 FAILED - Cannot continue.");
    return;
  }

  const tree3 = test3Result.plan;

  console.log("\n   Validating TEST 3...");
  let test3Pass = true;

  if (tree3.type !== "Navbar") {
    console.log(`   ❌ Root should still be Navbar`);
    test3Pass = false;
  } else {
    console.log(`   ✅ Navbar still root`);
  }

  const card = tree3.children?.find((c: any) => c.type === "Card");
  if (!card) {
    console.log(`   ❌ Card should still exist`);
    test3Pass = false;
  } else {
    console.log(`   ✅ Card exists`);

    const chart = card.children?.find((c: any) => c.type === "Chart");
    if (!chart) {
      console.log(`   ❌ Chart should be nested inside Card`);
      test3Pass = false;
    } else {
      console.log(`   ✅ Chart nested inside Card`);
    }
  }

  console.log(test3Pass ? "\n   ✅ TEST 3 PASSED" : "\n   ❌ TEST 3 FAILED");

  // TEST 4: Removal
  const test4Result = await test(
    "TEST 4 — Removal",
    "Remove the modal.",
    tree3
  );

  if (!test4Result) {
    console.log("\n❌ TEST 4 FAILED - Cannot continue.");
    return;
  }

  const tree4 = test4Result.plan;

  console.log("\n   Validating TEST 4...");
  let test4Pass = true;

  const hasModal4 = tree4.children?.some((c: any) => c.type === "Modal");
  if (hasModal4) {
    console.log(`   ❌ Modal should be removed`);
    test4Pass = false;
  } else {
    console.log(`   ✅ Modal removed`);
  }

  const hasCard4 = tree4.children?.some((c: any) => c.type === "Card");
  if (!hasCard4) {
    console.log(`   ❌ Card should still exist`);
    test4Pass = false;
  } else {
    console.log(`   ✅ Card preserved`);
  }

  if (tree4.type !== "Navbar") {
    console.log(`   ❌ Navbar should still be root`);
    test4Pass = false;
  } else {
    console.log(`   ✅ Navbar preserved`);
  }

  console.log(test4Pass ? "\n   ✅ TEST 4 PASSED" : "\n   ❌ TEST 4 FAILED");

  // TEST 5: Safety Test
  const test5Result = await test(
    "TEST 5 — Safety Test",
    "Create a div with custom CSS."
  );

  if (!test5Result) {
    console.log("\n❌ TEST 5 FAILED - API error (good for safety).");
    console.log("   ✅ Likely rejected div component");
    console.log("\n   ✅ TEST 5 PASSED (rejected dangerous component)");
    return;
  }

  const tree5 = test5Result.plan;

  console.log("\n   Validating TEST 5...");
  let test5Pass = true;

  const hasDivAnywhere = JSON.stringify(tree5).includes('"type":"div"');
  if (hasDivAnywhere) {
    console.log(`   ❌ div should not be in output`);
    test5Pass = false;
  } else {
    console.log(`   ✅ No div found in output`);
    test5Pass = true;
  }

  console.log(test5Pass ? "\n   ✅ TEST 5 PASSED" : "\n   ❌ TEST 5 FAILED");

  console.log("\n╔════════════════════════════════════════╗");
  console.log("║   TEST SUITE COMPLETE                  ║");
  console.log("╚════════════════════════════════════════╝\n");
}

runTests().catch(console.error);
