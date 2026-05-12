import { ganDatabase, type GANTool } from "@/data/ganDatabase";

export interface GANIdentification extends GANTool {
  matchScore: number;
}

/**
 * Identify which GAN tool likely created a deepfake.
 *
 * @param confidenceScore  0–100 manipulation probability from the detector
 * @param findings         Array of signal strings from the model breakdown
 * @returns                Matched GANTool + matchScore, or null if score < 40
 */
export function identifyGANTool(
  confidenceScore: number,
  findings: string[]
): GANIdentification | null {
  // Only run if confidence score is above 40%
  if (confidenceScore < 40) return null;

  const findingsText = findings ? findings.join(" ").toLowerCase() : "";

  // Priority matching based on specific indicator keywords
  if (
    findingsText.includes("lip") ||
    findingsText.includes("audio") ||
    findingsText.includes("mouth")
  ) {
    return { ...ganDatabase[5], matchScore: 89 }; // Wav2Lip
  }

  if (
    findingsText.includes("boundary") ||
    findingsText.includes("blinking") ||
    findingsText.includes("blink")
  ) {
    return { ...ganDatabase[0], matchScore: 84 }; // FaceSwap
  }

  if (
    findingsText.includes("temporal") ||
    findingsText.includes("flicker") ||
    findingsText.includes("resolution")
  ) {
    return { ...ganDatabase[1], matchScore: 79 }; // DeepFaceLab
  }

  if (
    findingsText.includes("symmetry") ||
    findingsText.includes("background") ||
    findingsText.includes("ear")
  ) {
    return { ...ganDatabase[6], matchScore: 74 }; // StyleGAN
  }

  if (
    findingsText.includes("smooth") ||
    findingsText.includes("texture") ||
    findingsText.includes("lighting")
  ) {
    return { ...ganDatabase[2], matchScore: 69 }; // Stable Diffusion
  }

  // Fallback: match based on confidence score range
  const matched = ganDatabase.find(
    (tool) =>
      confidenceScore >= tool.confidence_range[0] &&
      confidenceScore <= tool.confidence_range[1]
  );
  if (matched) {
    return {
      ...matched,
      matchScore: Math.round(60 + (confidenceScore / 100) * 30),
    };
  }

  // Default to unknown
  return { ...ganDatabase[7], matchScore: 45 };
}
