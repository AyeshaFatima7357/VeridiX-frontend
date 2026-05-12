export interface GANTool {
  id: string;
  name: string;
  confidence_range: [number, number];
  description: string;
  danger_level: "High" | "Medium" | "Low";
  indicators: string[];
  color: string;
}

export const ganDatabase: GANTool[] = [
  {
    id: "faceswap",
    name: "FaceSwap",
    confidence_range: [75, 100],
    description:
      "Open-source face-swapping tool. Most commonly used for non-consensual deepfake content targeting women.",
    danger_level: "High",
    indicators: ["facial boundary artifacts", "unnatural blinking", "skin texture inconsistency"],
    color: "#FF3B5C",
  },
  {
    id: "deepfacelab",
    name: "DeepFaceLab",
    confidence_range: [65, 90],
    description:
      "Advanced deepfake creation software used in 95% of professional-grade deepfakes found online.",
    danger_level: "High",
    indicators: ["high resolution face replacement", "temporal flickering", "eye region artifacts"],
    color: "#FF6B35",
  },
  {
    id: "stable_diffusion",
    name: "Stable Diffusion",
    confidence_range: [60, 85],
    description:
      "AI image generation model. Used to create entirely fake but realistic-looking faces and scenes.",
    danger_level: "Medium",
    indicators: ["unnatural skin smoothness", "perfect symmetry", "background inconsistency"],
    color: "#FFB347",
  },
  {
    id: "midjourney",
    name: "Midjourney",
    confidence_range: [55, 80],
    description:
      "AI art generator increasingly used to create fake profile photos and fabricated news images.",
    danger_level: "Medium",
    indicators: ["painterly texture", "oversaturated colors", "unrealistic lighting"],
    color: "#FFB347",
  },
  {
    id: "dalle",
    name: "DALL-E",
    confidence_range: [50, 75],
    description:
      "OpenAI image generator used for creating synthetic faces and manipulated scenes.",
    danger_level: "Medium",
    indicators: ["watermark artifacts", "smooth gradients", "geometric distortions"],
    color: "#FFB347",
  },
  {
    id: "wav2lip",
    name: "Wav2Lip",
    confidence_range: [70, 95],
    description:
      "Lip-sync deepfake tool. Makes any person appear to say anything. High threat for misinformation.",
    danger_level: "High",
    indicators: ["lip boundary artifacts", "audio-visual mismatch", "lower face inconsistency"],
    color: "#FF3B5C",
  },
  {
    id: "stylegan",
    name: "StyleGAN",
    confidence_range: [65, 88],
    description:
      "NVIDIA's face generation model. Creates photorealistic fake identities used in scam profiles.",
    danger_level: "High",
    indicators: ["perfect facial symmetry", "background warping", "ear and hair artifacts"],
    color: "#FF3B5C",
  },
  {
    id: "unknown",
    name: "Unknown GAN Model",
    confidence_range: [0, 55],
    description:
      "Manipulation detected but the specific tool could not be identified. May be a newer or private model.",
    danger_level: "Low",
    indicators: ["general manipulation signals", "frequency anomalies"],
    color: "#8892A4",
  },
];
