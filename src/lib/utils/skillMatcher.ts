// Skill matching utility with fuzzy matching and synonym support

// Common skill synonyms
const SKILL_SYNONYMS: Record<string, string[]> = {
  javascript: ['js', 'ecmascript', 'es6', 'es2015', 'node', 'nodejs', 'node.js'],
  typescript: ['ts'],
  python: ['py'],
  'react.js': ['react', 'reactjs'],
  'vue.js': ['vue', 'vuejs'],
  'angular': ['angularjs', 'angular.js'],
  'node.js': ['node', 'nodejs', 'javascript'],
  postgresql: ['postgres', 'psql'],
  mongodb: ['mongo'],
  kubernetes: ['k8s'],
  docker: ['containerization'],
  aws: ['amazon web services'],
  gcp: ['google cloud platform', 'google cloud'],
  azure: ['microsoft azure'],
  ci: ['continuous integration'],
  cd: ['continuous deployment', 'continuous delivery'],
  'ci/cd': ['cicd', 'continuous integration', 'continuous deployment'],
  frontend: ['front-end', 'front end', 'fe'],
  backend: ['back-end', 'back end', 'be'],
  fullstack: ['full-stack', 'full stack'],
  api: ['rest', 'restful', 'rest api'],
  sql: ['structured query language'],
  nosql: ['no-sql'],
  ml: ['machine learning'],
  ai: ['artificial intelligence'],
  oop: ['object-oriented programming', 'object oriented'],
  fp: ['functional programming'],
  tdd: ['test-driven development', 'test driven development'],
  git: ['version control', 'source control'],
}

// Normalize a skill name for comparison
function normalizeSkill(skill: string): string {
  return skill
    .toLowerCase()
    .trim()
    .replace(/[._-]/g, '') // Remove dots, underscores, dashes
    .replace(/\s+/g, '') // Remove all whitespace
}

// Calculate Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

// Check if two skills match (exact, synonym, or fuzzy)
function skillsMatch(skill1: string, skill2: string, fuzzyThreshold = 0.8): boolean {
  const norm1 = normalizeSkill(skill1)
  const norm2 = normalizeSkill(skill2)

  // Exact match
  if (norm1 === norm2) {
    return true
  }

  // Check if one contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return true
  }

  // Check synonyms
  for (const [canonical, synonyms] of Object.entries(SKILL_SYNONYMS)) {
    const normalizedCanonical = normalizeSkill(canonical)
    const normalizedSynonyms = synonyms.map(normalizeSkill)

    const isSkill1InGroup = norm1 === normalizedCanonical || normalizedSynonyms.includes(norm1)
    const isSkill2InGroup = norm2 === normalizedCanonical || normalizedSynonyms.includes(norm2)

    if (isSkill1InGroup && isSkill2InGroup) {
      return true
    }
  }

  // Fuzzy matching for typos (only for longer skill names)
  if (norm1.length >= 4 && norm2.length >= 4) {
    const maxLength = Math.max(norm1.length, norm2.length)
    const distance = levenshteinDistance(norm1, norm2)
    const similarity = 1 - distance / maxLength

    if (similarity >= fuzzyThreshold) {
      return true
    }
  }

  return false
}

// Calculate skill match between CV skills and job skills
export interface SkillMatchResult {
  matched: string[]
  unmatched: string[]
  percentage: number
  matchDetails: Array<{
    jobSkill: string
    cvSkill: string
    matchType: 'exact' | 'synonym' | 'fuzzy' | 'substring'
  }>
}

export function calculateSkillMatch(
  cvSkills: string[],
  jobSkills: string[],
  fuzzyThreshold = 0.8
): SkillMatchResult {
  const matched: string[] = []
  const unmatched: string[] = []
  const matchDetails: SkillMatchResult['matchDetails'] = []

  for (const jobSkill of jobSkills) {
    let found = false
    const normJob = normalizeSkill(jobSkill)

    for (const cvSkill of cvSkills) {
      const normCv = normalizeSkill(cvSkill)

      // Exact match
      if (normJob === normCv) {
        matched.push(jobSkill)
        matchDetails.push({ jobSkill, cvSkill, matchType: 'exact' })
        found = true
        break
      }

      // Substring match
      if (normJob.includes(normCv) || normCv.includes(normJob)) {
        matched.push(jobSkill)
        matchDetails.push({ jobSkill, cvSkill, matchType: 'substring' })
        found = true
        break
      }

      // Synonym match
      let synonymMatch = false
      for (const [canonical, synonyms] of Object.entries(SKILL_SYNONYMS)) {
        const normalizedCanonical = normalizeSkill(canonical)
        const normalizedSynonyms = synonyms.map(normalizeSkill)

        const isJobInGroup = normJob === normalizedCanonical || normalizedSynonyms.includes(normJob)
        const isCvInGroup = normCv === normalizedCanonical || normalizedSynonyms.includes(normCv)

        if (isJobInGroup && isCvInGroup) {
          matched.push(jobSkill)
          matchDetails.push({ jobSkill, cvSkill, matchType: 'synonym' })
          found = true
          synonymMatch = true
          break
        }
      }

      if (synonymMatch) break

      // Fuzzy match for longer skills
      if (normJob.length >= 4 && normCv.length >= 4) {
        const maxLength = Math.max(normJob.length, normCv.length)
        const distance = levenshteinDistance(normJob, normCv)
        const similarity = 1 - distance / maxLength

        if (similarity >= fuzzyThreshold) {
          matched.push(jobSkill)
          matchDetails.push({ jobSkill, cvSkill, matchType: 'fuzzy' })
          found = true
          break
        }
      }
    }

    if (!found) {
      unmatched.push(jobSkill)
    }
  }

  const percentage = jobSkills.length > 0
    ? Math.round((matched.length / jobSkills.length) * 100)
    : 0

  return {
    matched,
    unmatched,
    percentage,
    matchDetails
  }
}
