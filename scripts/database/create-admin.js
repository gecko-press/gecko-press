#!/usr/bin/env node

/**
 * GeckoPress Admin User Setup Script
 *
 * This script creates the initial admin user during setup.
 *
 * Usage:
 *   node scripts/database/create-admin.js
 *
 * Required Environment Variables:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (admin privileges required)
 *
 * Optional:
 *   - ADMIN_EMAIL (default: admin@geckopress.com)
 *   - ADMIN_PASSWORD (default: randomly generated)
 */

const https = require('https');
const http = require('http');
const crypto = require('crypto');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@geckopress.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString('hex');

// Validation
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
  console.error('');
  console.error('Usage:');
  console.error('  SUPABASE_URL=https://xxx.supabase.co \\');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=eyJxxx... \\');
  console.error('  ADMIN_EMAIL=admin@example.com \\');
  console.error('  ADMIN_PASSWORD=securepassword123 \\');
  console.error('  node scripts/database/create-admin.js');
  process.exit(1);
}

/**
 * HTTP Request Helper
 */
function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = protocol.request(requestOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${response.message || body}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Create Admin User
 */
async function createAdminUser() {
  console.log('🚀 GeckoPress Admin User Setup');
  console.log('================================');
  console.log('');
  console.log(`📧 Email: ${ADMIN_EMAIL}`);
  console.log(`🔐 Password: ${ADMIN_PASSWORD}`);
  console.log('');

  try {
    // Create user using Supabase Admin API
    const user = await makeRequest(
      `${SUPABASE_URL}/auth/v1/admin/users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY
        }
      },
      {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          role: 'admin',
          name: 'Admin User'
        }
      }
    );

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('User ID:', user.id);
    console.log('');
    console.log('📝 Login credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Save these credentials securely!');
    console.log('');

    // Create default site_settings for this user
    console.log('Creating default site settings...');

    await makeRequest(
      `${SUPABASE_URL}/rest/v1/site_settings`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY,
          'Prefer': 'return=representation'
        }
      },
      {
        user_id: user.id,
        author_name: 'GeckoAuthority',
        site_url: '',
        contact_email: ADMIN_EMAIL
      }
    );

    console.log('✅ Site settings created!');
    console.log('');
    console.log('🎉 Setup complete! You can now login to /login');

  } catch (error) {
    if (error.message.includes('already registered')) {
      console.error('⚠️  User already exists with this email.');
      console.error('   If you need to reset password, use Supabase Dashboard.');
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
    process.exit(1);
  }
}

// Run
createAdminUser();
