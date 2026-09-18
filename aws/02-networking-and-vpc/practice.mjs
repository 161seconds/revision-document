import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ============================================================================
 * AWS MODULE 02: NETWORKING & VPC - SELF-TEST PRACTICE SUITE
 * ============================================================================
 * Chạy trực tiếp qua Node.js:
 * rtk node aws/02-networking-and-vpc/practice.mjs
 *
 * Yêu cầu: Tất cả 5 Thử thách phải vượt qua mọi assert mà không có Exception.
 */

console.log('=================================================');
console.log('  AWS MODULE 02: VPC NETWORKING TEST SUITE');
console.log('=================================================');

const cfnPath = path.join(__dirname, 'vpc-architecture.yaml');
const cfnContent = fs.readFileSync(cfnPath, 'utf-8');

// ----------------------------------------------------------------------------
// CHALLENGE 1: VPC & Subnetting CIDR Mathematics Audit
// ----------------------------------------------------------------------------
function testChallenge1_SubnetMathAndIsolation() {
    process.stdout.write('[Test 1] Testing CIDR Mathematics & AWS 5 Reserved IPs... ');

    function calculateUsableIps(cidrMask) {
        const totalIps = 2 ** (32 - cidrMask);
        const awsReserved = 5;
        return { totalIps, usableIps: totalIps - awsReserved };
    }

    const vpcMath = calculateUsableIps(16);
    assert.strictEqual(vpcMath.totalIps, 65536, '/16 total IP count must be 65,536');
    assert.strictEqual(vpcMath.usableIps, 65531, '/16 usable IP count must be 65,531 (minus 5)');

    const subnetMath = calculateUsableIps(24);
    assert.strictEqual(subnetMath.totalIps, 256, '/24 total IP count must be 256');
    assert.strictEqual(subnetMath.usableIps, 251, '/24 usable IP count must strictly be 251 (minus 5)');

    // Ensure all subnets are defined in template
    const expectedSubnets = ['10.0.1.0/24', '10.0.2.0/24', '10.0.11.0/24', '10.0.12.0/24'];
    for (const cidr of expectedSubnets) {
        assert.strictEqual(cfnContent.includes(cidr), true, `Template must contain subnet ${cidr}`);
    }

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 2: Public vs Private Routing Topology
// ----------------------------------------------------------------------------
function testChallenge2_RoutingTopology() {
    process.stdout.write('[Test 2] Testing Routing Table Topology (IGW vs NAT Gateway)... ');

    // Public route must point 0.0.0.0/0 to Internet Gateway
    assert.strictEqual(
        /PublicDefaultRoute:[\s\S]*?DestinationCidrBlock:\s*0\.0\.0\.0\/0[\s\S]*?GatewayId:\s*!Ref\s*MainIGW/.test(cfnContent),
        true,
        'Public route must route 0.0.0.0/0 to Internet Gateway'
    );

    // Private route must point 0.0.0.0/0 to NAT Gateway
    assert.strictEqual(
        /PrivateDefaultRoute:[\s\S]*?DestinationCidrBlock:\s*0\.0\.0\.0\/0[\s\S]*?NatGatewayId:\s*!Ref\s*MainNATGateway/.test(cfnContent),
        true,
        'Private route must route 0.0.0.0/0 to NAT Gateway'
    );

    // Verify NAT Gateway is positioned in Public Subnet
    assert.strictEqual(
        /MainNATGateway:[\s\S]*?SubnetId:\s*!Ref\s*PublicSubnetAZ1/.test(cfnContent),
        true,
        'NAT Gateway must be hosted in a Public Subnet'
    );

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 3: Security Group Chaining Architecture (Zero IP Hardcoding)
// ----------------------------------------------------------------------------
function testChallenge3_SecurityGroupChaining() {
    process.stdout.write('[Test 3] Testing Security Group Chaining (ALB -> App -> DB)... ');

    // 1. ALB allows 80 and 443 from anywhere
    assert.strictEqual(cfnContent.includes('ToPort: 80') && cfnContent.includes('ToPort: 443'), true, 'ALB must allow HTTP/HTTPS');

    // 2. App allows 8080 ONLY from ALB SG
    const appSgMatch = /AppSecurityGroup:[\s\S]*?SourceSecurityGroupId:\s*!Ref\s*ALBSecurityGroup/.test(cfnContent);
    assert.strictEqual(appSgMatch, true, 'App SG must chain SourceSecurityGroupId to ALBSecurityGroup');

    // 3. Database allows 5432 ONLY from App SG
    const dbSgMatch = /DatabaseSecurityGroup:[\s\S]*?SourceSecurityGroupId:\s*!Ref\s*AppSecurityGroup/.test(cfnContent);
    assert.strictEqual(dbSgMatch, true, 'Database SG must chain SourceSecurityGroupId to AppSecurityGroup');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 4: High-Availability Multi-AZ Subnet Alignment
// ----------------------------------------------------------------------------
function testChallenge4_MultiAzAlignment() {
    process.stdout.write('[Test 4] Verifying Multi-AZ Alignment Across Availability Zones... ');

    // Verify Subnets use distinct AZ indexes 0 and 1
    const az0Matches = (cfnContent.match(/!Select\s*\[0,\s*!GetAZs\s*''\]/g) || []).length;
    const az1Matches = (cfnContent.match(/!Select\s*\[1,\s*!GetAZs\s*''\]/g) || []).length;

    assert.strictEqual(az0Matches >= 2, true, 'At least 2 subnets must reside in AZ index 0');
    assert.strictEqual(az1Matches >= 2, true, 'At least 2 subnets must reside in AZ index 1');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 5: Free S3 Gateway Endpoint Cost Optimization
// ----------------------------------------------------------------------------
function testChallenge5_S3GatewayEndpoint() {
    process.stdout.write('[Test 5] Verifying S3 Gateway Endpoint Route Configuration... ');

    assert.strictEqual(/VpcEndpointType:\s*Gateway/.test(cfnContent), true, 'Must configure VPC Endpoint of type Gateway');
    assert.strictEqual(cfnContent.includes('ServiceName: !Sub com.amazonaws.${AWS::Region}.s3'), true, 'Endpoint must target S3 in current region');
    assert.strictEqual(cfnContent.includes('RouteTableIds:\n        - !Ref PrivateRouteTable'), true, 'Endpoint must attach to PrivateRouteTable');

    console.log('PASSED');
}

// Execute all test challenges
testChallenge1_SubnetMathAndIsolation();
testChallenge2_RoutingTopology();
testChallenge3_SecurityGroupChaining();
testChallenge4_MultiAzAlignment();
testChallenge5_S3GatewayEndpoint();

console.log('\n\x1b[32m[SUCCESS] All 5 AWS Networking & VPC Challenges Passed! (5/5)\x1b[0m');
