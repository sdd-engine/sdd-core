/**
 * Topological sort of component dependencies (Kahn's algorithm).
 *
 * Usage:
 *   sdd-system tech-pack dependency-order --namespace <ns>
 */

import type { CommandResult } from '@/lib/args';
import { readV2Manifest, type V2Manifest } from './manifest';

export const dependencyOrder = async (namespace: string): Promise<CommandResult> => {
  const result = await readV2Manifest(namespace);
  if (!result.success) {
    return result;
  }

  const { manifest } = result.data as { manifest: V2Manifest };
  const components = manifest.components;
  const names = Object.keys(components);

  // Build in-degree map and adjacency list
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const name of names) {
    inDegree.set(name, 0);
    dependents.set(name, []);
  }

  for (const [name, comp] of Object.entries(components)) {
    for (const dep of comp.depends_on) {
      if (!inDegree.has(dep)) {
        return {
          success: false,
          error: `Component "${name}" depends on unknown component "${dep}"`,
        };
      }
      dependents.get(dep)!.push(name);
      inDegree.set(name, inDegree.get(name)! + 1);
    }
  }

  // Kahn's algorithm
  const queue: string[] = [];
  for (const [name, degree] of inDegree) {
    if (degree === 0) {
      queue.push(name);
    }
  }
  // Sort queue for deterministic output
  queue.sort();

  const order: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);

    const deps = dependents.get(current)!;
    // Sort for deterministic output
    deps.sort();
    for (const dep of deps) {
      const newDegree = inDegree.get(dep)! - 1;
      inDegree.set(dep, newDegree);
      if (newDegree === 0) {
        // Insert sorted
        const insertIdx = queue.findIndex((q) => q > dep);
        if (insertIdx === -1) {
          queue.push(dep);
        } else {
          queue.splice(insertIdx, 0, dep);
        }
      }
    }
  }

  if (order.length !== names.length) {
    const remaining = names.filter((n) => !order.includes(n));
    return {
      success: false,
      error: `Dependency cycle detected involving: ${remaining.join(', ')}`,
    };
  }

  return {
    success: true,
    data: { order },
  };
};
