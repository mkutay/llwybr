import { and, eq, isNull } from "drizzle-orm";
import { db } from "./db/drizzle";
import { actions, projects } from "./db/schema";

type Project = typeof projects.$inferSelect;
type Action = typeof actions.$inferSelect;

export async function getPopularProjects(
  top: number,
): Promise<Array<{ id: string; title: string }>> {
  const data = await db
    .select()
    .from(projects)
    .where(and(isNull(projects.archived), isNull(projects.completed)))
    .leftJoin(actions, eq(actions.projectId, projects.id));

  const projectsWithActions = data.reduce<
    Record<string, { project: Project; actions: Action[] }>
  >((acc, { projects, actions }) => {
    if (!acc[projects.id]) {
      acc[projects.id] = { project: projects, actions: [] };
    }
    if (actions) {
      acc[projects.id].actions.push(actions);
    }
    return acc;
  }, {});

  const now = new Date();

  const projectScores = Object.values(projectsWithActions).map(
    ({ project, actions: projectActions }) => {
      const totalActions = projectActions.length;
      const completedActions = projectActions.filter(
        (a) => a.completed !== null,
      ).length;

      // Get the most recent action date
      const mostRecentActionDate = projectActions.length
        ? projectActions.reduce((latest, current) => {
            const latestDate = latest.completed || latest.createdAt;
            const currentDate = current.completed || current.createdAt;
            return currentDate > latestDate ? current : latest;
          }).createdAt
        : project.createdAt;

      // Calculate days since most recent action
      const daysSinceLastAction = Math.floor(
        (now.getTime() - mostRecentActionDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      // Recency score: exponential decay (more recent = higher score)
      const recencyScore = Math.exp(-daysSinceLastAction / 35);

      // Completion rate (0 to 1)
      const completionRate =
        totalActions > 0 ? completedActions / totalActions : 0;

      // Total action count score (normalized with diminishing returns)
      const actionCountScore = Math.log(Math.max(1, totalActions));

      // Weighted popularity score
      const popularityScore =
        actionCountScore * 0.5 + completionRate * 0.8 + recencyScore * 3;

      return {
        id: project.id,
        title: project.title,
        score: popularityScore,
        totalActions,
        completedActions,
        daysSinceLastAction,
      };
    },
  );

  // Sort by score descending and return top N
  return projectScores
    .sort((a, b) => b.score - a.score)
    .slice(0, top)
    .map(({ id, title }) => ({ id, title }));
}
