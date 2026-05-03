import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
} from "@casl/ability";

import type { Actions, Subjects } from "./rbac.types";
import { isRbacAction } from "./rbac.types";

export type AppAbility = MongoAbility<[Actions, Subjects | string]>;

/**
 * Backend now sends permissions like:
 * dashboard:read
 * orders:create
 * group-orders:update
 * settings-permissions:manage
 *
 * So the resource can be used directly as the CASL subject.
 */
function normalizeResource(resource: string) {
  return resource.trim().toLowerCase();
}

function normalizeAction(action: string) {
  return action.trim().toLowerCase();
}

export function defineAbilityFromPermissions(
  permissions: string[] | undefined,
  roles: string[] = []
): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (roles.includes("SUPER_ADMIN")) {
    can("manage", "all");

    return build({
      detectSubjectType: (item) => item as Subjects,
    });
  }

  if (!permissions || permissions.length === 0) {
    return build({
      detectSubjectType: (item) => item as Subjects,
    });
  }

  permissions.forEach((permission) => {
    const [rawResource, rawAction] = permission.split(":");

    if (!rawResource || !rawAction) {
      console.warn(`[RBAC] Invalid permission format: ${permission}`);
      return;
    }

    const resource = normalizeResource(rawResource);
    const action = normalizeAction(rawAction);

    if (!isRbacAction(action)) {
      console.warn(`[RBAC] Unknown permission action: ${action}`);
      return;
    }

    /**
     * Important:
     * Do not map dashboard -> Dashboard anymore.
     * Keep backend Page.code as frontend subject.
     */
    can(action, resource);
  });

  return build({
    detectSubjectType: (item) => item as Subjects,
  });
}