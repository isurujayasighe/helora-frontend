import { useAbility } from "./AbilityProvider";
import type { Actions, Subjects } from "./rbac.types";

export function useCan(action: Actions, subject: Subjects): boolean {
  const ability = useAbility();
  return ability.can(action, subject);
}