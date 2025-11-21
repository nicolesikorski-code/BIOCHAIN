/**
 * Script manual para probar CVM
 * Ejecutar: node test-cvm-manual.js
 */

import { processPDF, getCVMConfig } from './src/services/cvm.service.js'
import { hashExists, registerHash, clearAllHashes } from './src/services/deduplication.service.js'
import { processPDFInMockCVM } from './src/services/cvm-gateway-mock.service.js'

async function testCVM() {
  console.log('🧪 Testing CVM Integration...\n')

  // Test 1: Mock CVM
  console.log('1. Testing Mock CVM...')
  try {
    const mockFile = Buffer.from('test PDF content')
    const result = await processPDFInMockCVM(mockFile)
    console.log('✅ Mock CVM works!')
    console.log('   - Dataset Hash:', result.datasetHash.substring(0, 32) + '...')
    console.log('   - Mode:', result.mode)
    console.log('   - Has metadata:', !!result.summaryMetadata)
    console.log('   - Has attestation:', !!result.attestationProof)
  } catch (error) {
    console.error('❌ Mock CVM failed:', error.message)
    return
  }

  // Test 2: Deduplication
  console.log('\n2. Testing Deduplication...')
  try {
    clearAllHashes()
    const hash1 = 'test_hash_123'
    const hash2 = 'test_hash_456'

    console.log('   - Registering hash1...')
    registerHash(hash1)
    console.log('   - hash1 exists?', hashExists(hash1))
    console.log('   - hash2 exists?', hashExists(hash2))
    
    if (hashExists(hash1) && !hashExists(hash2)) {
      console.log('✅ Deduplication works!')
    } else {
      console.log('❌ Deduplication failed')
    }
  } catch (error) {
    console.error('❌ Deduplication failed:', error.message)
    return
  }

  // Test 3: CVM Manager - Mock Mode
  console.log('\n3. Testing CVM Manager (Mock Mode)...')
  try {
    const mockFile = Buffer.from('test content')
    const config = { mode: 'mock' }
    
    const result = await processPDF({
      encryptedPDFBuffer: mockFile,
      config,
    })
    
    console.log('✅ CVM Manager (Mock) works!')
    console.log('   - Mode:', result.mode)
    console.log('   - Attempted Real:', result.attemptedReal)
    console.log('   - Fallback Used:', result.fallbackUsed || false)
  } catch (error) {
    console.error('❌ CVM Manager failed:', error.message)
    return
  }

  // Test 4: CVM Config
  console.log('\n4. Testing CVM Config...')
  try {
    process.env.CVM_MODE = 'mock'
    const config = getCVMConfig()
    console.log('✅ CVM Config works!')
    console.log('   - Mode:', config.mode)
    console.log('   - Timeout:', config.timeoutMs, 'ms')
  } catch (error) {
    console.error('❌ CVM Config failed:', error.message)
    return
  }

  console.log('\n🎉 All tests passed!')
}

testCVM().catch(console.error)

