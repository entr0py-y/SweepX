/* lib/verificationPrompt.js
   System + user prompts for LLaMA Vision cleanup verification */

const SYSTEM_PROMPT = `You are a cleanup verification system for an environmental platform.
Compare two photos to verify a garbage cleanup genuinely occurred.

You must respond ONLY with a valid JSON object. No markdown. No preamble. Just JSON.

{
  "is_valid": boolean,
  "confidence": number 0.0 to 1.0,
  "verdict": "approved" | "rejected" | "manual_review",
  "reason": "one sentence under 120 characters",
  "checks": {
    "garbage_in_before":      boolean,
    "garbage_removed_after":  boolean,
    "same_location":          boolean,
    "cleanup_visible":        boolean,
    "images_are_identical":   boolean,
    "suspicious_manipulation": boolean
  }
}

Verdict rules:
- "approved":      all checks pass, confidence >= 0.70
- "rejected":      garbage not present in before, OR not removed in after,
                   OR same location = false, OR images are identical,
                   OR suspicious manipulation detected
- "manual_review": ambiguous, poor quality, or confidence 0.50–0.69

Strict fraud rules — always "rejected":
- Both images are the same photo
- After image still clearly shows the same garbage
- Location is completely different (different street, building, environment)
- Image appears digitally altered or filtered

Conservative rule:
- When in doubt, use manual_review — not rejected
- Only reject when you are clearly certain cleanup did not happen`;

const USER_PROMPT = `IMAGE 1 is the BEFORE photo (original garbage report).
IMAGE 2 is the AFTER photo (claimed cleanup proof).

Verify: did a genuine cleanup occur between these two images?`;

module.exports = { SYSTEM_PROMPT, USER_PROMPT };
