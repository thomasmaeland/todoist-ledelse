// Network diagnostic script
// Run this with: node network-diagnostic.js

const dns = require('dns').promises;
const https = require('https');

async function runDiagnostics() {
  console.log('🔍 Network Diagnostics\n');

  // Check DNS resolution
  console.log('1. Testing DNS resolution for Supabase...');
  try {
    const addresses = await dns.resolve4('uroyxgafjijzfdsacta.supabase.co');
    console.log('✅ DNS resolution successful:', addresses);
  } catch (error) {
    console.log('❌ DNS resolution failed:', error.message);
    console.log('   Trying alternative DNS server (8.8.8.8)...');
    try {
      const resolver = new dns.Resolver();
      resolver.setServers(['8.8.8.8']);
      const addresses = await resolver.resolve4('uroyxgafjijzfdsacta.supabase.co');
      console.log('✅ DNS with 8.8.8.8 works:', addresses);
      console.log('   → Your ISP DNS may be blocking Supabase');
    } catch (error2) {
      console.log('❌ Even 8.8.8.8 failed:', error2.message);
      console.log('   → This suggests firewall/antivirus blocking');
    }
  }

  // Check HTTPS connectivity
  console.log('\n2. Testing HTTPS connectivity to Supabase...');
  return new Promise((resolve) => {
    const options = {
      hostname: 'uroyxgafjijzfdsacta.supabase.co',
      port: 443,
      path: '/',
      method: 'HEAD',
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      console.log('✅ HTTPS connection successful (status: ' + res.statusCode + ')');
      resolve();
    });

    req.on('error', (error) => {
      console.log('❌ HTTPS connection failed:', error.message);
      console.log('   → Firewall, proxy, or antivirus may be blocking');
      resolve();
    });

    req.on('timeout', () => {
      console.log('⏱️  HTTPS connection timeout');
      console.log('   → Network/firewall may be blocking');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

runDiagnostics();
