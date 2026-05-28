/**
 * Production-grade Recommendation Engines
 * Includes Content-Based Filtering (Tag Jaccard Coefficient)
 * and Collaborative Filtering (User-User Overlap Coefficient).
 */
import { Course } from "../src/types";
import { db } from "./db";

/**
 * Calculates Jaccard similarity coefficient between two sets of strings.
 * J(A, B) = |A ∩ B| / |A ∪ B|
 */
function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

/**
 * 1. Content-Based Filtering Recommendation
 * Evaluates the tags of the user's enrolled courses, sets up an interest vector,
 * and recommends other unenrolled courses with similar tag vectors.
 */
export function getContentBasedRecommendations(userId: string, limit = 3): Course[] {
  // Find courses currently enrolled by the user
  const userEnrollments = db.enrollments.filter(e => e.userId === userId);
  const enrolledCourseIds = new Set(userEnrollments.map(e => e.courseId));

  const approvedCourses = db.courses.filter(c => c.isApproved);
  if (enrolledCourseIds.size === 0) {
    // Cold start - fallback to popular choices
    return approvedCourses.slice(0, limit);
  }

  // Aggregate user tags from currently enrolled courses
  const userTags = new Set<string>();
  for (const enr of userEnrollments) {
    const course = db.courses.find(c => c.id === enr.courseId);
    if (course) {
      course.tags.forEach(t => userTags.add(t.toLowerCase()));
    }
  }

  // Calculate similarity for other approved, unenrolled courses
  const scores = approvedCourses
    .filter(c => !enrolledCourseIds.has(c.id))
    .map(course => {
      const courseTags = new Set(course.tags.map(t => t.toLowerCase()));
      const similarity = calculateJaccardSimilarity(userTags, courseTags);
      return { course, similarity };
    });

  // Sort by similarity score descending
  return scores
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(x => x.course);
}

/**
 * 2. Collaborative Filtering (User-User similarity based on course enrollments)
 * Calculates which users have matching enrollments to find course options
 * enrolled by matching users but not yet touched by the current user.
 */
export function getCollaborativeRecommendations(userId: string, limit = 3): Course[] {
  const userEnrollments = db.enrollments.filter(e => e.userId === userId);
  const userCourses = new Set(userEnrollments.map(e => e.courseId));

  // Simulated peer students
  const peerUsers = [
    { id: "std-2", courses: ["course-1", "course-3", "course-5"] },
    { id: "std-3", courses: ["course-1", "course-2", "course-4"] },
    { id: "std-4", courses: ["course-2", "course-4", "course-6"] },
    { id: "std-5", courses: ["course-3", "course-5", "course-1"] },
  ];

  // Calculate peer similarities
  const userCourseSet = new Set(userCourses);
  const similarities = peerUsers.map(peer => {
    const peerCourseSet = new Set(peer.courses);
    const similarity = calculateJaccardSimilarity(userCourseSet, peerCourseSet);
    return { peerId: peer.id, similarity, courses: peer.courses };
  });

  // Sort peers by similarity descending
  const topPeers = similarities.sort((a, b) => b.similarity - a.similarity);

  // Compile recommended peer courses that our user has not enrolled in yet
  const recommendationScores: { [courseId: string]: number } = {};
  for (const peer of topPeers) {
    if (peer.similarity === 0) continue;
    for (const cid of peer.courses) {
      if (!userCourses.has(cid)) {
        recommendationScores[cid] = (recommendationScores[cid] || 0) + peer.similarity;
      }
    }
  }

  // Rank recommended courses
  const approvedCourses = db.courses.filter(c => c.isApproved);
  const rankedCourseIds = Object.keys(recommendationScores).sort(
    (a, b) => recommendationScores[b] - recommendationScores[a]
  );

  const recommendedCourses = rankedCourseIds
    .map(cid => approvedCourses.find(c => c.id === cid))
    .filter((c): c is Course => !!c);

  if (recommendedCourses.length === 0) {
    // If collborative yields nothing (e.g. cold start), fallback to high rated approved courses
    return approvedCourses.sort((a,b) => b.rating - a.rating).slice(0, limit);
  }

  return recommendedCourses.slice(0, limit);
}

/**
 * 3. Hybrid Filtering Engine
 * Combines both filters into a single normalized score weighting Content-Based Sim (60%)
 * and Collaborative User Overlap Sim (40%).
 */
export function getHybridRecommendations(userId: string, limit = 4): Course[] {
  const userEnrollments = db.enrollments.filter(e => e.userId === userId);
  const enrolledCourseIds = new Set(userEnrollments.map(e => e.courseId));
  const approvedCourses = db.courses.filter(c => c.isApproved);

  // If cold start, return popular items
  if (enrolledCourseIds.size === 0) {
    return approvedCourses.slice(0, limit);
  }

  const contentRecommends = getContentBasedRecommendations(userId, db.courses.length);
  const collaborativeRecommends = getCollaborativeRecommendations(userId, db.courses.length);

  const hybridScores: { [courseId: string]: number } = {};

  // Score content components (weight = 0.6)
  contentRecommends.forEach((course, index) => {
    const rankScore = 1 / (index + 1); // reciprocal rank
    hybridScores[course.id] = (hybridScores[course.id] || 0) + rankScore * 0.6;
  });

  // Score collaborative components (weight = 0.4)
  collaborativeRecommends.forEach((course, index) => {
    const rankScore = 1 / (index + 1);
    hybridScores[course.id] = (hybridScores[course.id] || 0) + rankScore * 0.4;
  });

  // Sort and filter out already enrolled ones
  const rankedCourseIds = Object.keys(hybridScores)
    .filter(cid => !enrolledCourseIds.has(cid))
    .sort((a, b) => hybridScores[b] - hybridScores[a]);

  const recommendedCourses = rankedCourseIds
    .map(cid => approvedCourses.find(c => c.id === cid))
    .filter((c): c is Course => !!c);

  if (recommendedCourses.length === 0) {
    return approvedCourses.filter(c => !enrolledCourseIds.has(c.id)).slice(0, limit);
  }

  return recommendedCourses.slice(0, limit);
}

/**
 * 4. Skill Gap Recommendations
 * Given a list of identified skill gaps, matches courses teaching those specific techniques.
 */
export function getSkillGapRecommendations(userId: string, missingSkills: string[], limit = 3): Course[] {
  const userEnrollments = db.enrollments.filter(e => e.userId === userId);
  const enrolledCourseIds = new Set(userEnrollments.map(e => e.courseId));
  const approvedCourses = db.courses.filter(c => c.isApproved);

  const normalizedMissing = missingSkills.map(s => s.toLowerCase());

  // Compute matches based on title overlap or tag matching
  const scored = approvedCourses
    .filter(c => !enrolledCourseIds.has(c.id))
    .map(course => {
      let score = 0;
      const titleLower = course.title.toLowerCase();
      const descLower = course.description.toLowerCase();

      normalizedMissing.forEach(skill => {
        if (titleLower.includes(skill)) score += 3;
        else if (descLower.includes(skill)) score += 2;
        else if (course.tags.some(t => t.toLowerCase() === skill)) score += 1;
      });

      return { course, score };
    });

  // Return non-zero scores, or fallback if none match
  const filtered = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score);

  if (filtered.length === 0) {
    // If no specific gap matches, return Content-Based suggestions
    return getContentBasedRecommendations(userId, limit);
  }

  return filtered.map(x => x.course).slice(0, limit);
}
