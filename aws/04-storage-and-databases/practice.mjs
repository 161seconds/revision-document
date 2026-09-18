import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ============================================================================
 * AWS MODULE 04: STORAGE & DATABASES - SELF-TEST PRACTICE SUITE
 * ============================================================================
 * Chạy trực tiếp qua Node.js:
 * rtk node aws/04-storage-and-databases/practice.mjs
 *
 * Yêu cầu: Tất cả 5 Thử thách phải vượt qua mọi assert mà không có Exception.
 */

console.log('=================================================');
console.log('  AWS MODULE 04: STORAGE & DATABASES TEST SUITE');
console.log('=================================================');

const cfnPath = path.join(__dirname, 'storage-and-database.yaml');
const cfnContent = fs.readFileSync(cfnPath, 'utf-8');

// ----------------------------------------------------------------------------
// CHALLENGE 1: S3 Lifecycle Transition Policy Verification
// ----------------------------------------------------------------------------
function testChallenge1_S3LifecyclePolicy() {
    process.stdout.write('[Test 1] Testing S3 Lifecycle Policy Transitions & Expiration... ');

    assert.strictEqual(/TransitionInDays:\s*30[\s\S]*?StorageClass:\s*STANDARD_IA/.test(cfnContent), true, 'Must transition to STANDARD_IA at 30 days');
    assert.strictEqual(/TransitionInDays:\s*90[\s\S]*?StorageClass:\s*GLACIER/.test(cfnContent), true, 'Must transition to GLACIER at 90 days');
    assert.strictEqual(/ExpirationInDays:\s*365/.test(cfnContent), true, 'Must expire objects after 365 days');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 2: S3 KMS Encryption & Public Access Block Hardening
// ----------------------------------------------------------------------------
function testChallenge2_S3SecurityHardening() {
    process.stdout.write('[Test 2] Testing S3 KMS Encryption & 4-Way Public Access Block... ');

    assert.strictEqual(/SSEAlgorithm:\s*aws:kms/.test(cfnContent), true, 'Bucket must enforce aws:kms encryption');

    assert.strictEqual(/BlockPublicAcls:\s*true/.test(cfnContent), true, 'Must set BlockPublicAcls: true');
    assert.strictEqual(/BlockPublicPolicy:\s*true/.test(cfnContent), true, 'Must set BlockPublicPolicy: true');
    assert.strictEqual(/IgnorePublicAcls:\s*true/.test(cfnContent), true, 'Must set IgnorePublicAcls: true');
    assert.strictEqual(/RestrictPublicBuckets:\s*true/.test(cfnContent), true, 'Must set RestrictPublicBuckets: true');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 3: RDS Multi-AZ Disaster Recovery Topology
// ----------------------------------------------------------------------------
function testChallenge3_RdsMultiAzTopology() {
    process.stdout.write('[Test 3] Testing RDS Multi-AZ Disaster Recovery & Encryption... ');

    assert.strictEqual(/MultiAZ:\s*true/.test(cfnContent), true, 'RDS must be configured with MultiAZ: true');
    assert.strictEqual(/StorageEncrypted:\s*true/.test(cfnContent), true, 'RDS storage must be encrypted');
    assert.strictEqual(/PubliclyAccessible:\s*false/.test(cfnContent), true, 'RDS must NOT be publicly accessible');

    // Subnet group across 2 AZs
    assert.strictEqual(
        cfnContent.includes('- !Ref PrivateSubnet1') && cfnContent.includes('- !Ref PrivateSubnet2'),
        true,
        'DBSubnetGroup must span across PrivateSubnet1 and PrivateSubnet2'
    );

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 4: DynamoDB Composite Primary Key & GSI Partitioning
// ----------------------------------------------------------------------------
function testChallenge4_DynamoDbSchema() {
    process.stdout.write('[Test 4] Testing DynamoDB Primary Key & Global Secondary Index... ');

    // Primary Key (Composite: TenantId HASH, OrderId RANGE)
    assert.strictEqual(/AttributeName:\s*TenantId[\s\S]*?KeyType:\s*HASH/.test(cfnContent), true, 'TenantId must be HASH Partition Key');
    assert.strictEqual(/AttributeName:\s*OrderId[\s\S]*?KeyType:\s*RANGE/.test(cfnContent), true, 'OrderId must be RANGE Sort Key');

    // GSI (CustomerEmailIndex)
    assert.strictEqual(/IndexName:\s*CustomerEmailIndex/.test(cfnContent), true, 'Must declare CustomerEmailIndex GSI');
    assert.strictEqual(/AttributeName:\s*CustomerEmail[\s\S]*?KeyType:\s*HASH/.test(cfnContent), true, 'GSI must use CustomerEmail as HASH');

    // Streams
    assert.strictEqual(/StreamViewType:\s*NEW_AND_OLD_IMAGES/.test(cfnContent), true, 'Must enable CDC Stream with NEW_AND_OLD_IMAGES');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 5: DynamoDB RCU & WCU Mathematical Engine Verification
// ----------------------------------------------------------------------------
function testChallenge5_DynamoDbCapacityMath() {
    process.stdout.write('[Test 5] Simulating DynamoDB RCU & WCU Capacity Calculations... ');

    function calculateDynamoUnits({ readsPerSec, itemSizeKbRead, consistency, writesPerSec, itemSizeKbWrite }) {
        // Read calculation: 4KB blocks
        const rcuBlocksPerItem = Math.ceil(itemSizeKbRead / 4);
        let totalRcu = rcuBlocksPerItem * readsPerSec;
        if (consistency === 'eventual') {
            totalRcu = totalRcu / 2;
        }

        // Write calculation: 1KB blocks
        const wcuBlocksPerItem = Math.ceil(itemSizeKbWrite);
        const totalWcu = wcuBlocksPerItem * writesPerSec;

        return { totalRcu, totalWcu };
    }

    // Scenario 1: 200 reads/sec of 7.5KB item (Strong vs Eventual)
    const strongTest = calculateDynamoUnits({
        readsPerSec: 200,
        itemSizeKbRead: 7.5, // ceil(7.5/4) = 2 blocks
        consistency: 'strong',
        writesPerSec: 50,
        itemSizeKbWrite: 2.8 // ceil(2.8) = 3 blocks
    });

    assert.strictEqual(strongTest.totalRcu, 400, 'Strong consistent reads of 7.5KB (2 blocks) at 200/s must equal 400 RCUs');
    assert.strictEqual(strongTest.totalWcu, 150, 'Writes of 2.8KB (3 blocks) at 50/s must equal 150 WCUs');

    const eventualTest = calculateDynamoUnits({
        readsPerSec: 200,
        itemSizeKbRead: 7.5,
        consistency: 'eventual',
        writesPerSec: 10,
        itemSizeKbWrite: 1.0
    });

    assert.strictEqual(eventualTest.totalRcu, 200, 'Eventually consistent reads must be exactly half the RCUs (200 RCUs)');

    console.log('PASSED');
}

// Execute all test challenges
testChallenge1_S3LifecyclePolicy();
testChallenge2_S3SecurityHardening();
testChallenge3_RdsMultiAzTopology();
testChallenge4_DynamoDbSchema();
testChallenge5_DynamoDbCapacityMath();

console.log('\n\x1b[32m[SUCCESS] All 5 AWS Storage & Databases Challenges Passed! (5/5)\x1b[0m');
