import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ============================================================================
 * AWS MODULE 03: COMPUTE & SCALING - SELF-TEST PRACTICE SUITE
 * ============================================================================
 * Chạy trực tiếp qua Node.js:
 * rtk node aws/03-compute-and-scaling/practice.mjs
 *
 * Yêu cầu: Tất cả 5 Thử thách phải vượt qua mọi assert mà không có Exception.
 */

console.log('=================================================');
console.log('  AWS MODULE 03: COMPUTE & SCALING TEST SUITE');
console.log('=================================================');

const cfnPath = path.join(__dirname, 'compute-asg-alb.yaml');
const cfnContent = fs.readFileSync(cfnPath, 'utf-8');

// ----------------------------------------------------------------------------
// CHALLENGE 1: Launch Template & Auto Scaling Group Capacity Bounds
// ----------------------------------------------------------------------------
function testChallenge1_AsgCapacityBounds() {
    process.stdout.write('[Test 1] Testing ASG Capacity Bounds & Multi-Subnet Spread... ');

    assert.strictEqual(/MinSize:\s*['"]?2['"]?/.test(cfnContent), true, 'MinSize must be 2 for High Availability');
    assert.strictEqual(/MaxSize:\s*['"]?10['"]?/.test(cfnContent), true, 'MaxSize must be 10');
    assert.strictEqual(/DesiredCapacity:\s*['"]?2['"]?/.test(cfnContent), true, 'DesiredCapacity must be 2');

    // Multi-Subnet deployment
    assert.strictEqual(
        cfnContent.includes('- !Ref PrivateSubnet1') && cfnContent.includes('- !Ref PrivateSubnet2'),
        true,
        'ASG must span across both PrivateSubnet1 and PrivateSubnet2'
    );

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 2: Target Tracking Dynamic Scaling Policy
// ----------------------------------------------------------------------------
function testChallenge2_TargetTrackingPolicy() {
    process.stdout.write('[Test 2] Testing Target Tracking Dynamic Scaling Policy... ');

    assert.strictEqual(/PolicyType:\s*TargetTrackingScaling/.test(cfnContent), true, 'Must use TargetTrackingScaling');
    assert.strictEqual(
        /PredefinedMetricType:\s*ASGAverageCPUUtilization/.test(cfnContent),
        true,
        'Must track ASGAverageCPUUtilization'
    );
    assert.strictEqual(/TargetValue:\s*50(\.0)?/.test(cfnContent), true, 'Must target 50% CPU utilization');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 3: Application Load Balancer Healthcheck & Draining
// ----------------------------------------------------------------------------
function testChallenge3_AlbHealthCheckAndDraining() {
    process.stdout.write('[Test 3] Testing ALB Health Checks & Connection Draining... ');

    assert.strictEqual(/HealthCheckPath:\s*\/healthz/.test(cfnContent), true, 'Must configure HealthCheckPath: /healthz');
    assert.strictEqual(/HttpCode:\s*['"]?200['"]?/.test(cfnContent), true, 'Matcher must require HTTP 200 OK');

    // Connection draining / deregistration delay
    assert.strictEqual(
        /Key:\s*deregistration_delay\.timeout_seconds[\s\S]*?Value:\s*['"]?30['"]?/.test(cfnContent),
        true,
        'Target group must configure deregistration_delay to 30 seconds'
    );

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 4: Self-Healing with ELB HealthCheckType & IMDSv2 Security
// ----------------------------------------------------------------------------
function testChallenge4_SelfHealingAndImdsv2() {
    process.stdout.write('[Test 4] Testing Self-Healing (HealthCheckType: ELB) & IMDSv2... ');

    // Must use ELB health check type for self-healing
    assert.strictEqual(
        /HealthCheckType:\s*ELB/.test(cfnContent),
        true,
        'Auto Scaling Group must set HealthCheckType: ELB to terminate unhealthy web nodes'
    );

    // Enforce IMDSv2
    assert.strictEqual(
        /HttpTokens:\s*required/.test(cfnContent),
        true,
        'Launch Template must enforce IMDSv2 (HttpTokens: required) against SSRF'
    );

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 5: Serverless Lambda Execution Pricing Math
// ----------------------------------------------------------------------------
function testChallenge5_LambdaPricingCalculation() {
    process.stdout.write('[Test 5] Simulating Lambda GB-Seconds & Execution Cost Math... ');

    function calculateLambdaCost({ invocations, memoryMb, durationMs }) {
        const memoryGb = memoryMb / 1024;
        const durationSec = durationMs / 1000;
        const totalGbSeconds = invocations * memoryGb * durationSec;

        const gbSecondRate = 0.0000166667;
        const requestRatePerMillion = 0.20;

        const computeCost = totalGbSeconds * gbSecondRate;
        const requestCost = (invocations / 1_000_000) * requestRatePerMillion;

        return {
            totalGbSeconds,
            computeCost: parseFloat(computeCost.toFixed(2)),
            requestCost: parseFloat(requestCost.toFixed(2)),
            totalCost: parseFloat((computeCost + requestCost).toFixed(2))
        };
    }

    // Calculate cost for 10 million requests, 512MB RAM, 200ms duration
    const estimate = calculateLambdaCost({
        invocations: 10_000_000,
        memoryMb: 512,
        durationMs: 200
    });

    assert.strictEqual(estimate.totalGbSeconds, 1_000_000, 'Total GB-s must be 1,000,000');
    assert.strictEqual(estimate.requestCost, 2.00, 'Request cost must be $2.00');
    assert.strictEqual(estimate.computeCost, 16.67, 'Compute cost must be $16.67');
    assert.strictEqual(estimate.totalCost, 18.67, 'Total cost must be $18.67');

    console.log('PASSED');
}

// Execute all test challenges
testChallenge1_AsgCapacityBounds();
testChallenge2_TargetTrackingPolicy();
testChallenge3_AlbHealthCheckAndDraining();
testChallenge4_SelfHealingAndImdsv2();
testChallenge5_LambdaPricingCalculation();

console.log('\n\x1b[32m[SUCCESS] All 5 AWS Compute & Scaling Challenges Passed! (5/5)\x1b[0m');
