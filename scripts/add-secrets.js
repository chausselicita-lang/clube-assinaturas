#!/usr/bin/env node

/**
 * Add GitHub Secrets via REST API
 * Usage: node scripts/add-secrets.js <github-token>
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`)
};

// Get GitHub token
const githubToken = process.argv[2];

if (!githubToken) {
  log.error('GitHub token required');
  console.log(`\nUsage: node scripts/add-secrets.js <github-token>`);
  console.log('\nGet a token at: https://github.com/settings/tokens/new');
  console.log('Scopes: repo, write:packages\n');
  process.exit(1);
}

// Get repo info
const repo = 'chausselicita-lang/clube-assinaturas';
const [owner, repoName] = repo.split('/');

log.info(`Repository: ${repo}`);

// Vercel credentials
const vercelProjectJson = path.join('.vercel', 'project.json');
let vercelOrgId = '';
let vercelProjectId = '';

if (fs.existsSync(vercelProjectJson)) {
  try {
    const vercelData = JSON.parse(fs.readFileSync(vercelProjectJson, 'utf8'));
    vercelOrgId = vercelData.orgId;
    vercelProjectId = vercelData.projectId;
    log.success(`Loaded Vercel credentials from .vercel/project.json`);
  } catch (e) {
    log.error(`Failed to read Vercel credentials: ${e.message}`);
  }
}

// Read Supabase from .env.local
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync('.env.local')) {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+?)(?:\r?\n|$)/);
    const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+?)(?:\r?\n|$)/);

    if (urlMatch) supabaseUrl = urlMatch[1].trim();
    if (keyMatch) supabaseKey = keyMatch[1].trim();
  } catch (e) {
    log.warn(`Could not read .env.local: ${e.message}`);
  }
}

// Secrets to add
const secrets = {
  'VERCEL_TOKEN': process.env.VERCEL_TOKEN || 'vcp_1vjnRND4MD5PQF0SYHGUw13c3Lx5eEQFG5i0c5XcMQ',
  'VERCEL_ORG_ID': vercelOrgId || process.env.VERCEL_ORG_ID || 'team_TUkp3rkTDToUqrh0jYV4VW2k',
  'VERCEL_PROJECT_ID': vercelProjectId || process.env.VERCEL_PROJECT_ID || 'prj_UYEl53CFAYLPU1XUSo1uDtmF5jqI'
};

if (supabaseUrl) secrets['NEXT_PUBLIC_SUPABASE_URL'] = supabaseUrl;
if (supabaseKey) secrets['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = supabaseKey;

// API Request helper
function makeRequest(method, pathname, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: pathname,
      method,
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'NodeJS-GitHub-Secret-Manager'
      }
    };

    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Get public key for encryption
async function getPublicKey() {
  const response = await makeRequest(
    'GET',
    `/repos/${owner}/${repoName}/actions/secrets/public-key`
  );

  if (response.status !== 200) {
    throw new Error(`Failed to get public key: ${response.status}`);
  }

  return response.data;
}

// Encrypt secret value using libsodium format
function encryptSecret(secretValue, publicKey) {
  // This is a simplified encryption - GitHub expects libsodium format
  // For production, use: https://github.com/lirael/libsodium-wrappers
  // For now, we'll try a workaround approach

  // Node crypto doesn't have libsodium's sealed boxes
  // We'll encode in a way that might work with GitHub's API
  // (Some versions accept base64 encoded values)

  try {
    // Try to use tweetsodium if available
    const sodium = require('libsodium');
    const messageBytes = Buffer.from(secretValue);
    const publicKeyBytes = Buffer.from(publicKey, 'base64');

    const encryptedBytes = sodium.crypto_box_seal(messageBytes, publicKeyBytes);
    return Buffer.from(encryptedBytes).toString('base64');
  } catch (e) {
    // Fallback: Try with minimal crypto
    // This might not work with all GitHub instances
    try {
      const box = require('tweetsodium');
      const messageBytes = Buffer.from(secretValue);
      const publicKeyBytes = Buffer.from(publicKey, 'base64');

      const encryptedBytes = box(messageBytes, publicKeyBytes);
      return Buffer.from(encryptedBytes).toString('base64');
    } catch (e2) {
      // Last resort: Just return base64 encoded
      log.warn('libsodium not available, using basic encoding');
      return Buffer.from(secretValue).toString('base64');
    }
  }
}

// Main function
async function addSecrets() {
  try {
    console.log(`\n${colors.cyan}Adding GitHub Secrets...${colors.reset}\n`);

    // Get public key
    log.info('Getting public key...');
    let publicKey;
    try {
      publicKey = await getPublicKey();
      log.success(`Public key retrieved`);
    } catch (e) {
      log.error(`Could not get public key: ${e.message}`);
      log.warn('Trying direct API call...');
      // Continue anyway
    }

    // Add each secret
    for (const [secretName, secretValue] of Object.entries(secrets)) {
      if (!secretValue) {
        log.warn(`Skipping ${secretName} (empty value)`);
        continue;
      }

      try {
        log.info(`Setting ${secretName}...`);

        const body = {
          encrypted_value: secretValue,
          key_id: publicKey?.key_id || 'key'
        };

        const response = await makeRequest(
          'PUT',
          `/repos/${owner}/${repoName}/actions/secrets/${secretName}`,
          body
        );

        if (response.status === 201 || response.status === 204) {
          log.success(`${secretName} created`);
        } else if (response.status === 422) {
          log.error(`${secretName}: Invalid encryption or format`);
          log.warn('Try adding secrets manually via GitHub UI');
        } else {
          log.error(`${secretName}: HTTP ${response.status}`);
          if (response.data?.message) {
            log.error(`  ${response.data.message}`);
          }
        }
      } catch (e) {
        log.error(`Error setting ${secretName}: ${e.message}`);
      }
    }

    console.log(`\n${colors.green}Done!${colors.reset}`);
    console.log(`Verify: https://github.com/${owner}/${repoName}/settings/secrets/actions\n`);
  } catch (e) {
    log.error(`Fatal error: ${e.message}`);
    process.exit(1);
  }
}

addSecrets().catch(e => {
  log.error(e.message);
  process.exit(1);
});
