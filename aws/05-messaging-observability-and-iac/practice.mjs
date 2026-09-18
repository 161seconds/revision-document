// Module 05: Messaging, Observability & IaC - Comprehensive Verification Suite
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('------------------------------------------------------------');
console.log('AWS Cloud Architecture - Module 05 Practice Verification');
console.log('Testing Messaging, Observability & IaC Implementations');
console.log('------------------------------------------------------------\n');

// ----------------------------------------------------------------------
// Load Manifest
// ----------------------------------------------------------------------
const templatePath = path.join(__dirname, 'messaging-and-observability.yaml');
assert.ok(fs.existsSync(templatePath), 'Manifest messaging-and-observability.yaml must exist');
const templateContent = fs.readFileSync(templatePath, 'utf8');

// ======================================================================
// Challenge 1: SQS Redrive Policy & DLQ Deadlock Defense
// ======================================================================
console.log('Executing Challenge 1: SQS Redrive Policy & DLQ Deadlock Defense...');

// Verify OrdersDeadLetterQueue resource exists with 14-day retention (1209600 seconds)
assert.match(
  templateContent,
  /OrdersDeadLetterQueue:\s+Type:\s+AWS::SQS::Queue/m,
  'OrdersDeadLetterQueue resource must be defined'
);
assert.match(
  templateContent,
  /MessageRetentionPeriod:\s+1209600/,
  'DLQ retention period must be set to 14 days (1209600 seconds)'
);

// Verify OrdersPrimaryQueue exists with RedrivePolicy
assert.match(
  templateContent,
  /OrdersPrimaryQueue:\s+Type:\s+AWS::SQS::Queue/m,
  'OrdersPrimaryQueue resource must be defined'
);
assert.match(
  templateContent,
  /VisibilityTimeout:\s+300/,
  'Primary queue visibility timeout must be 300 seconds'
);
assert.match(
  templateContent,
  /ReceiveMessageWaitTimeSeconds:\s+20/,
  'Primary queue long polling must be enabled (20 seconds)'
);
assert.match(
  templateContent,
  /RedrivePolicy:\s+deadLetterTargetArn:\s+!GetAtt\s+OrdersDeadLetterQueue\.Arn\s+maxReceiveCount:\s+3/m,
  'RedrivePolicy must route to OrdersDeadLetterQueue with maxReceiveCount = 3'
);

console.log('  -> Challenge 1 PASSED: SQS DLQ and RedrivePolicy verified successfully.\n');

// ======================================================================
// Challenge 2: SNS Fanout Pattern & Subscription Filter Policy
// ======================================================================
console.log('Executing Challenge 2: SNS Fanout Pattern & Subscription Filter Policy...');

// Verify OrdersTopic exists
assert.match(
  templateContent,
  /OrdersTopic:\s+Type:\s+AWS::SNS::Topic/m,
  'OrdersTopic SNS resource must be defined'
);

// Verify OrdersQueueSubscription exists with sqs protocol and filter policy
assert.match(
  templateContent,
  /OrdersQueueSubscription:\s+Type:\s+AWS::SNS::Subscription/m,
  'OrdersQueueSubscription resource must be defined'
);
assert.match(
  templateContent,
  /Protocol:\s+sqs/,
  'Subscription protocol must be SQS'
);
assert.match(
  templateContent,
  /RawMessageDelivery:\s+true/,
  'Raw message delivery should be enabled for direct SQS payload parsing'
);
assert.match(
  templateContent,
  /FilterPolicy:\s+eventType:\s+- ORDER_CREATED\s+- ORDER_PAID/m,
  'FilterPolicy must filter for ORDER_CREATED and ORDER_PAID events'
);

// Verify SQS QueuePolicy grants sns.amazonaws.com sqs:SendMessage
assert.match(
  templateContent,
  /OrdersQueuePolicy:\s+Type:\s+AWS::SQS::QueuePolicy/m,
  'OrdersQueuePolicy must be defined to permit SNS fanout writes'
);
assert.match(
  templateContent,
  /Principal:\s+Service:\s+sns\.amazonaws\.com/m,
  'QueuePolicy must authorize sns.amazonaws.com principal'
);
assert.match(
  templateContent,
  /Action:\s+sqs:SendMessage/,
  'QueuePolicy must authorize sqs:SendMessage action'
);

console.log('  -> Challenge 2 PASSED: SNS Fanout & Subscription Filter Policy verified successfully.\n');

// ======================================================================
// Challenge 3: CloudWatch Metric Alarm Queue Depth Threshold
// ======================================================================
console.log('Executing Challenge 3: CloudWatch Metric Alarm Queue Depth Threshold...');

// Verify OrdersBacklogAlarm
assert.match(
  templateContent,
  /OrdersBacklogAlarm:\s+Type:\s+AWS::CloudWatch::Alarm/m,
  'OrdersBacklogAlarm resource must be defined'
);
assert.match(
  templateContent,
  /Namespace:\s+AWS\/SQS/,
  'CloudWatch alarm namespace must be AWS/SQS'
);
assert.match(
  templateContent,
  /MetricName:\s+ApproximateNumberOfMessagesVisible/,
  'CloudWatch alarm metric must be ApproximateNumberOfMessagesVisible'
);
assert.match(
  templateContent,
  /ComparisonOperator:\s+GreaterThanOrEqualToThreshold/,
  'ComparisonOperator must be GreaterThanOrEqualToThreshold'
);
assert.match(
  templateContent,
  /Period:\s+300/,
  'Metric evaluation period must be 300 seconds (5 minutes)'
);
assert.match(
  templateContent,
  /AlarmActions:\s+- !Ref OrdersTopic/m,
  'Alarm must send notification action to OrdersTopic'
);

console.log('  -> Challenge 3 PASSED: CloudWatch Metric Alarm verified successfully.\n');

// ======================================================================
// Challenge 4: SQS Standard vs FIFO Identifier Validation
// ======================================================================
console.log('Executing Challenge 4: SQS Standard vs FIFO Identifier Validation...');

// Template check for FIFO Queue
assert.match(
  templateContent,
  /FifoTransactionQueue:\s+Type:\s+AWS::SQS::Queue/m,
  'FifoTransactionQueue resource must be defined'
);
assert.match(
  templateContent,
  /QueueName:\s+transactions-stream\.fifo/,
  'FIFO queue name must strictly terminate with .fifo suffix'
);
assert.match(
  templateContent,
  /FifoQueue:\s+true/,
  'FifoQueue property must be boolean true'
);
assert.match(
  templateContent,
  /ContentBasedDeduplication:\s+true/,
  'ContentBasedDeduplication must be enabled for 5-minute SHA256 deduplication'
);

// Programmatic FIFO Validator function
function validateSqsQueueConfig(config) {
  if (config.fifo) {
    if (!config.name.endsWith('.fifo')) {
      throw new Error(`Invalid FIFO queue name: "${config.name}". FIFO queues must end with ".fifo"`);
    }
    if (!config.messageGroupId) {
      throw new Error('FIFO messages must specify MessageGroupId for strict ordered routing');
    }
  }
  return true;
}

// Test validation logic
assert.strictEqual(
  validateSqsQueueConfig({ fifo: true, name: 'payments.fifo', messageGroupId: 'user-982' }),
  true,
  'Valid FIFO configuration must pass'
);

assert.throws(
  () => validateSqsQueueConfig({ fifo: true, name: 'payments-queue', messageGroupId: 'user-982' }),
  /FIFO queues must end with "\.fifo"/,
  'FIFO queue lacking suffix must throw error'
);

assert.throws(
  () => validateSqsQueueConfig({ fifo: true, name: 'payments.fifo' }),
  /FIFO messages must specify MessageGroupId/,
  'FIFO message lacking MessageGroupId must throw error'
);

console.log('  -> Challenge 4 PASSED: FIFO queue constraints & deduplication rules validated.\n');

// ======================================================================
// Challenge 5: CloudTrail Audit Log & Governance Simulation
// ======================================================================
console.log('Executing Challenge 5: CloudTrail Audit Log & Governance Simulation...');

// Mock CloudTrail audit event stream
const mockCloudTrailEvents = [
  {
    eventVersion: '1.08',
    userIdentity: {
      type: 'IAMUser',
      userName: 'alice-ops',
      arn: 'arn:aws:iam::123456789012:user/alice-ops',
    },
    eventTime: '2026-09-18T10:00:00Z',
    eventSource: 'sqs.amazonaws.com',
    eventName: 'ReceiveMessage',
    awsRegion: 'us-east-1',
    sourceIPAddress: '10.0.1.45',
    requestParameters: {
      queueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789012/orders-queue-production',
    },
    responseElements: null,
  },
  {
    eventVersion: '1.08',
    userIdentity: {
      type: 'IAMUser',
      userName: 'unauthorized-dev',
      arn: 'arn:aws:iam::123456789012:user/unauthorized-dev',
    },
    eventTime: '2026-09-18T10:05:00Z',
    eventSource: 'iam.amazonaws.com',
    eventName: 'AttachUserPolicy',
    awsRegion: 'us-east-1',
    sourceIPAddress: '198.51.100.23', // External public IP
    requestParameters: {
      userName: 'unauthorized-dev',
      policyArn: 'arn:aws:iam::aws:policy/AdministratorAccess',
    },
    errorCode: 'AccessDenied',
    errorMessage: 'User is not authorized to perform: iam:AttachUserPolicy',
  },
  {
    eventVersion: '1.08',
    userIdentity: {
      type: 'AssumedRole',
      arn: 'arn:aws:sts::123456789012:assumed-role/SecOpsAdmin/session-1',
    },
    eventTime: '2026-09-18T10:10:00Z',
    eventSource: 's3.amazonaws.com',
    eventName: 'PutBucketEncryption',
    awsRegion: 'us-east-1',
    sourceIPAddress: '10.0.0.2',
    requestParameters: {
      bucketName: 'customer-data-lake',
    },
  },
];

// Governance Auditor: Scans CloudTrail stream for critical security violations
function auditCloudTrailStream(events) {
  const securityViolations = [];

  for (const event of events) {
    // Detect privilege escalation attempts (even if denied)
    if (event.eventName === 'AttachUserPolicy' || event.eventName === 'PutUserPolicy') {
      const targetPolicy = event.requestParameters?.policyArn || 'InlinePolicy';
      securityViolations.push({
        severity: event.errorCode ? 'WARNING' : 'CRITICAL',
        reason: 'Privilege escalation attempt detected',
        actor: event.userIdentity.userName || event.userIdentity.arn,
        targetPolicy,
        blocked: event.errorCode === 'AccessDenied',
      });
    }

    // Detect public non-VPC modifications
    if (event.sourceIPAddress && !event.sourceIPAddress.startsWith('10.') && !event.sourceIPAddress.startsWith('172.')) {
      if (event.eventName !== 'ConsoleLogin') {
        securityViolations.push({
          severity: 'HIGH',
          reason: 'Administrative API invocation from external IP',
          ip: event.sourceIPAddress,
          actor: event.userIdentity.userName || event.userIdentity.arn,
          api: `${event.eventSource}:${event.eventName}`,
        });
      }
    }
  }

  return securityViolations;
}

const auditFindings = auditCloudTrailStream(mockCloudTrailEvents);

assert.strictEqual(auditFindings.length, 2, 'Audit must detect exactly 2 security events from sample stream');
assert.strictEqual(auditFindings[0].actor, 'unauthorized-dev', 'First violation actor must match unauthorized-dev');
assert.strictEqual(auditFindings[0].blocked, true, 'Privilege escalation must be marked as blocked by IAM');
assert.strictEqual(auditFindings[1].ip, '198.51.100.23', 'External IP violation must match external address');

console.log('  -> Challenge 5 PASSED: CloudTrail audit log & governance simulation verified.\n');

// ----------------------------------------------------------------------
// Final Summary
// ----------------------------------------------------------------------
console.log('============================================================');
console.log('ALL 5 MODULE 05 PRACTICE VERIFICATIONS PASSED SUCCESSFULLY!');
console.log('============================================================');
