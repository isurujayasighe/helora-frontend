import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
} from "@casl/ability";
import type { Actions, Subjects } from "./rbac.types";

export type AppAbility = MongoAbility<[Actions, Subjects]>;

const SUBJECT_MAP: Record<string, Subjects> = {
  users: "Users",
  customers: "Customers",
  categories: "Categories",
  blocks: "Blocks",
  orders: "Orders",
  audit: "Audit",
  dashboard: "Dashboard",
  settings: "Settings",
  profile: "Profile",
  support: "Support",
};

export function defineAbilityFromPermissions(
  permissions: string[] | undefined,
  roles: string[] = [],
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
    const [resource, action] = permission.split(":");

    if (!resource || !action) {
      console.warn(`[RBAC] Invalid permission format: ${permission}`);
      return;
    }

    const subject = SUBJECT_MAP[resource];

    if (!subject) {
      console.warn(`[RBAC] Unknown permission resource: ${resource}`);
      return;
    }

    if (
      action === "read" ||
      action === "create" ||
      action === "update" ||
      action === "delete" ||
      action === "manage"
    ) {
      can(action as Actions, subject);
      return;
    }

    console.warn(`[RBAC] Unknown permission action: ${action}`);
  });

  return build({
    detectSubjectType: (item) => item as Subjects,
  });
}