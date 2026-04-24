import { Field } from "@/components/ui/field";
import type { User } from "../../../types/User";

export default function UserDetailsTab({
  user,
  editMode,
}: {
  user: User;
  editMode: boolean;
}) {
  return (
    <div className="space-y-4 text-sm mt-4">
      <Field >
        {editMode ? (
          <input className="input" defaultValue={`${user.name}`} />
        ) : (
          <p>{user.name}</p>
        )}
      </Field>

      <Field >
        {editMode ? (
          <input className="input" defaultValue={user.email} />
        ) : (
          <p>{user.email}</p>
        )}
      </Field>
    </div>
  );
}
