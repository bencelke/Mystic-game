#!/usr/bin/env tsx

import { ELDER_FUTHARK_IDS } from '../src/content/runes-ids';
import { missingIds, getRunesWithMissingInfo, getAllRunes } from '../src/lib/content/runes';

async function checkRunes() {
  console.log('🔍 Checking rune content...\n');

  try {
    // Check for missing canonical IDs
    const missing = missingIds();
    if (missing.length > 0) {
      console.error('❌ Missing canonical rune IDs:');
      missing.forEach(id => console.error(`  - ${id}`));
      console.error('');
    } else {
      console.log('✅ All 24 canonical rune IDs present');
    }

    // Check for extra IDs
    const allRunes = getAllRunes();
    const presentIds = allRunes.map(r => r.id);
    const extraIds = presentIds.filter(id => !ELDER_FUTHARK_IDS.includes(id as any));
    
    if (extraIds.length > 0) {
      console.error('❌ Extra rune IDs not in canonical list:');
      extraIds.forEach(id => console.error(`  - ${id}`));
      console.error('');
    } else {
      console.log('✅ No extra rune IDs found');
    }

    // Check for duplicates
    const duplicateIds = presentIds.filter((id, index, arr) => arr.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      console.error('❌ Duplicate rune IDs found:');
      duplicateIds.forEach(id => console.error(`  - ${id}`));
      console.error('');
    } else {
      console.log('✅ No duplicate rune IDs found');
    }

    // Check for missing info fields
    const missingInfo = getRunesWithMissingInfo();
    if (missingInfo.length > 0) {
      console.warn('⚠️  Runes with missing info field:');
      missingInfo.forEach(id => console.warn(`  - ${id}`));
      console.warn('');
    } else {
      console.log('✅ All runes have info field');
    }

    // Summary
    const hasErrors = missing.length > 0 || extraIds.length > 0 || duplicateIds.length > 0;
    
    if (hasErrors) {
      console.error('❌ Rune validation failed');
      process.exit(1);
    } else {
      console.log('✅ Rune validation passed');
      if (missingInfo.length > 0) {
        console.log(`ℹ️  ${missingInfo.length} runes need info content`);
      }
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Error validating runes:', error);
    process.exit(1);
  }
}

checkRunes();
