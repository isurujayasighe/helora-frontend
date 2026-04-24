import { createContext, useContext, useMemo } from "react";
import { createMongoAbility } from "@casl/ability";
import { createContextualCan } from "@casl/react";
import type { AppAbility } from "./ability";
import { defineAbilityFromPermissions } from "./ability";

// 1. Create Context with a default empty ability
export const AbilityContext = createContext<AppAbility>(createMongoAbility());

// 2. Export <Can> component for JSX usage
export const Can = createContextualCan(AbilityContext.Consumer);

// 3. The Provider Component
export function AbilityProvider({
  permissions,
  roles,
  children,
}: {
  permissions: string[] | undefined;
  roles?: string[];
  children: React.ReactNode;
}) {
  const ability = useMemo(
    () => defineAbilityFromPermissions(permissions, roles ?? []),
    [permissions, roles]
  );

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

// 4. Hook for accessing the ability instance directly
export function useAbility() {
  return useContext(AbilityContext);
}