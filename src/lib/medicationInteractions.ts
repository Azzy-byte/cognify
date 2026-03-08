// Known medication interaction database (common interactions for elderly care)
// Each entry: [drugA (lowercase), drugB (lowercase), severity, warning message]
const INTERACTIONS: [string, string, 'high' | 'moderate', string][] = [
  ['aspirin', 'ibuprofen', 'high', 'Taking Aspirin with Ibuprofen can increase the risk of stomach bleeding. Please confirm with your doctor.'],
  ['aspirin', 'warfarin', 'high', 'Aspirin and Warfarin together significantly increase bleeding risk. Consult your doctor immediately.'],
  ['aspirin', 'naproxen', 'high', 'Aspirin with Naproxen raises the risk of gastrointestinal bleeding.'],
  ['warfarin', 'ibuprofen', 'high', 'Warfarin and Ibuprofen together can cause dangerous bleeding. Please consult your doctor.'],
  ['warfarin', 'naproxen', 'high', 'Warfarin with Naproxen increases bleeding risk significantly.'],
  ['warfarin', 'acetaminophen', 'moderate', 'High doses of Acetaminophen may increase the effect of Warfarin. Monitor closely.'],
  ['lisinopril', 'potassium', 'high', 'Lisinopril with Potassium supplements can cause dangerously high potassium levels.'],
  ['lisinopril', 'spironolactone', 'high', 'Lisinopril and Spironolactone together can raise potassium to dangerous levels.'],
  ['lisinopril', 'ibuprofen', 'moderate', 'Ibuprofen may reduce the blood pressure-lowering effect of Lisinopril.'],
  ['lisinopril', 'naproxen', 'moderate', 'Naproxen may reduce the effectiveness of Lisinopril.'],
  ['metformin', 'alcohol', 'high', 'Metformin with alcohol increases the risk of lactic acidosis. Avoid alcohol.'],
  ['metformin', 'contrast dye', 'high', 'Metformin should be paused before contrast dye procedures. Consult your doctor.'],
  ['simvastatin', 'amlodipine', 'moderate', 'Amlodipine can increase Simvastatin levels. Maximum Simvastatin dose is 20mg with Amlodipine.'],
  ['simvastatin', 'amiodarone', 'high', 'Amiodarone increases Simvastatin levels, raising muscle damage risk.'],
  ['atorvastatin', 'clarithromycin', 'high', 'Clarithromycin can dangerously increase Atorvastatin levels.'],
  ['amlodipine', 'simvastatin', 'moderate', 'Amlodipine can increase Simvastatin levels. Limit Simvastatin to 20mg.'],
  ['metoprolol', 'verapamil', 'high', 'Metoprolol with Verapamil can cause very slow heart rate. Consult your doctor.'],
  ['metoprolol', 'diltiazem', 'high', 'Metoprolol and Diltiazem together can dangerously slow the heart.'],
  ['digoxin', 'amiodarone', 'high', 'Amiodarone increases Digoxin levels, risking toxicity. Dose adjustment needed.'],
  ['digoxin', 'verapamil', 'high', 'Verapamil increases Digoxin levels. Monitor closely.'],
  ['clopidogrel', 'omeprazole', 'moderate', 'Omeprazole may reduce the effectiveness of Clopidogrel.'],
  ['fluoxetine', 'tramadol', 'high', 'Fluoxetine with Tramadol increases serotonin syndrome risk.'],
  ['sertraline', 'tramadol', 'high', 'Sertraline with Tramadol increases serotonin syndrome risk.'],
  ['fluoxetine', 'warfarin', 'moderate', 'Fluoxetine may increase the effect of Warfarin, raising bleeding risk.'],
  ['prednisone', 'ibuprofen', 'moderate', 'Prednisone with Ibuprofen increases stomach ulcer risk.'],
  ['prednisone', 'aspirin', 'moderate', 'Prednisone with Aspirin increases gastrointestinal bleeding risk.'],
  ['gabapentin', 'morphine', 'high', 'Gabapentin with Morphine increases sedation and respiratory depression risk.'],
  ['gabapentin', 'oxycodone', 'high', 'Gabapentin with Oxycodone can cause dangerous sedation.'],
  ['hydrochlorothiazide', 'lisinopril', 'moderate', 'This combination can cause blood pressure to drop too low. Monitor closely.'],
  ['levothyroxine', 'calcium', 'moderate', 'Calcium can reduce Levothyroxine absorption. Take them at least 4 hours apart.'],
  ['levothyroxine', 'iron', 'moderate', 'Iron supplements reduce Levothyroxine absorption. Separate by 4 hours.'],
  ['ciprofloxacin', 'tizanidine', 'high', 'Ciprofloxacin drastically increases Tizanidine levels. Do not combine.'],
  ['ciprofloxacin', 'warfarin', 'moderate', 'Ciprofloxacin may increase Warfarin effect, raising bleeding risk.'],
  ['methotrexate', 'ibuprofen', 'high', 'Ibuprofen can increase Methotrexate toxicity. Avoid combining.'],
  ['methotrexate', 'naproxen', 'high', 'Naproxen can increase Methotrexate to toxic levels.'],
];

// Duplicate dose detection thresholds (common medications)
const DOSE_WARNINGS: Record<string, { maxDaily: string; unit: string }> = {
  'acetaminophen': { maxDaily: '3000mg', unit: 'mg' },
  'tylenol': { maxDaily: '3000mg', unit: 'mg' },
  'ibuprofen': { maxDaily: '1200mg', unit: 'mg' },
  'aspirin': { maxDaily: '4000mg', unit: 'mg' },
  'metformin': { maxDaily: '2000mg', unit: 'mg' },
};

export interface InteractionAlert {
  severity: 'high' | 'moderate';
  message: string;
  drugA: string;
  drugB: string;
}

export interface DuplicateAlert {
  medication: string;
  message: string;
}

function normalize(name: string): string {
  return name.toLowerCase().trim();
}

export function checkInteractions(
  newMedName: string,
  existingMeds: { name: string; dosage: string }[]
): InteractionAlert[] {
  const alerts: InteractionAlert[] = [];
  const newNorm = normalize(newMedName);

  for (const existing of existingMeds) {
    const existNorm = normalize(existing.name);
    for (const [a, b, severity, message] of INTERACTIONS) {
      if (
        (newNorm.includes(a) && existNorm.includes(b)) ||
        (newNorm.includes(b) && existNorm.includes(a))
      ) {
        alerts.push({ severity, message, drugA: newMedName, drugB: existing.name });
      }
    }
  }

  return alerts;
}

export function checkDuplicates(
  newMedName: string,
  existingMeds: { name: string; dosage: string }[]
): DuplicateAlert[] {
  const alerts: DuplicateAlert[] = [];
  const newNorm = normalize(newMedName);

  for (const existing of existingMeds) {
    if (normalize(existing.name) === newNorm) {
      alerts.push({
        medication: newMedName,
        message: `You are already taking ${existing.name} (${existing.dosage}). Adding another may cause an overdose. Please verify with your doctor.`,
      });
    }
  }

  return alerts;
}

export function checkDoseChange(
  medName: string,
  oldDosage: string,
  newDosage: string
): string | null {
  if (normalize(oldDosage) === normalize(newDosage)) return null;

  const oldNum = parseFloat(oldDosage);
  const newNum = parseFloat(newDosage);

  if (!isNaN(oldNum) && !isNaN(newNum)) {
    if (newNum > oldNum * 2) {
      return `The new dose of ${medName} (${newDosage}) is more than double the previous dose (${oldDosage}). Please confirm this change with your doctor.`;
    }
    if (newNum < oldNum * 0.5) {
      return `The new dose of ${medName} (${newDosage}) is less than half the previous dose (${oldDosage}). Sudden dose reductions can cause withdrawal effects. Consult your doctor.`;
    }
  }

  return `The dosage of ${medName} has changed from ${oldDosage} to ${newDosage}. Please confirm with your prescriber.`;
}
