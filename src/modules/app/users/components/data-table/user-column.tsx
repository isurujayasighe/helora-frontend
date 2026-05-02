import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {  Users, Trash2, Copy, View, SettingsIcon } from "lucide-react";

import type {UserRole } from "../../types/User"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "../../api/useUserDetails";


interface ColumnProps {
  isSuperAdmin?: boolean;
  canDelete?: boolean; // 1. Added permission prop
  onView?: (tenant: User) => void;
  onDelete?: (tenant: User) => void; // 2. Added delete callback
  onRoleChange?: (userId: Number, role: UserRole) => void;
}

export const usersColumns = ({
  isSuperAdmin,
  canDelete = false, // Default to false if not passed
  onView,
  onDelete,
}: ColumnProps = {}): ColumnDef<User>[] => [
  /* -------------------------------------------------- */
  /* Selection (Admin only)                             */
  /* -------------------------------------------------- */
  ...(isSuperAdmin
    ? [
        {
          id: "select",
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
              aria-label="Select all"
              className="border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(v) => row.toggleSelected(!!v)}
              aria-label="Select row"
              className="border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
            />
          ),
          enableSorting: false,
          enableHiding: false,
          size: 40, // Fixed width for checkbox column
        } as ColumnDef<User>,
      ]
    : []),


  /* -------------------------------------------------- */
  /* Name (Main Identifier)                             */
  /* -------------------------------------------------- */
  {
    id: "name",
    header: "Name",
    accessorFn: (row) => `${row.userName ?? ""}`.trim(),
    cell: ({ row }) => {
      const { userName } = row.original;
      return (
        <div className="flex items-center gap-3 py-1">
          {/* Avatar: Styled to be subtle like the brand logos in your reference */}
          {/* <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 border border-slate-200">
             {initials || <Shield className="h-4 w-4 text-slate-400"/>}
          </div> */}

          <div className="flex flex-col">
            {/* Name: Bold and Dark (Like Product Name) */}
            <span className="text-sm ">
               {userName ? `${userName} ` : "Unknown User"}
            </span>
            {/* Email: Muted subtext (Like SKU) */}
            {/* <span className="text-xs text-slate-500 truncate max-w-[180px]">
               {email}
            </span> */}
          </div>
        </div>
      );
    },
  },

  
    {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      // Styled to match the "Category" gray badge in the reference
      <div className="flex">
        <span className="text-sm text-slate-600  ">
          {row.original.email || "-"  }
       </span>
      </div>
    ),
  },

   {
    accessorKey: "phoneNumber",
    header: "Phone",
    cell: ({ row }) => (
      // Styled to match the "Category" gray badge in the reference
      <div className="flex">
        <span className="text-sm text-slate-600  ">
          {row.original.phoneNumber || "-"  }
       </span>
      </div>
    ),
  },

  /* -------------------------------------------------- */
  /* Role (Category Style)                              */
  /* -------------------------------------------------- */
{
    id: "role", // Use 'id' since this is a computed column
    header: "Role",
    cell: ({ row }) => {
      // 1. Get environments array (safely)
      const environments = row.original.environments || [];

      // 2. Extract all role names across all environments
      // Logic: User -> Environments[] -> Roles[] -> roleName
      const roleNames = environments
        .flatMap((env) => env.roles)
        .map((role) => role.roleName);

      // 3. Remove duplicates (optional, but good if user is Admin in 2 envs)
      const uniqueRoles = [...new Set(roleNames)];

      return (
        <div className="flex items-center">
          <span className="text-sm text-slate-600">
            {uniqueRoles.length > 0 ? uniqueRoles.join(", ") : "-"}
          </span>
        </div>
      );
    },
  },

  //   {
  //   accessorKey: "phone",
  //   header: "Phone",
  //   cell: ({ row }) => (
  //     // Styled to match the "Category" gray badge in the reference
  //     <div className="flex">
  //       <span className="text-sm text-slate-600  ">
  //         {row.original.phone || "N/A"  }
  //      </span>
  //     </div>
  //   ),
  // },

  /* -------------------------------------------------- */
  /* Status (Pill Style)                                */
  /* -------------------------------------------------- */
  {
    accessorKey: "status",
    header: "Status",
    meta: { className: "w-[120px]" }, // Optional: Fixed width for alignment
    cell: ({ row }) => {
      const isActive = row.original.isActive === true;
      
      return (
        <div className="flex items-center">
            <span className={`
                inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                ${isActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }
            `}>
                {/* Status Dot */}
                <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                
                {/* Text Label */}
                {isActive ? "Active" : "Inactive"}
            </span>
        </div>
      );
    },
  },

  /* -------------------------------------------------- */
  /* Created At                                         */
  /* -------------------------------------------------- */
// {
//     accessorKey: "createdAt",
//     header: "Created Date",
//     meta: { className: "w-[150px]" }, 
//     cell: ({ getValue }) => {
//       const value = getValue<string>();
//       if (!value) return <span className="text-slate-400">—</span>;
      
//       return (
//         <span className="text-slate-600 font-mono text-xs">
//             {new Intl.DateTimeFormat("en-GB", { 
//                 weekday: 'short', // "Mon"
//                 day: '2-digit',   // "12"
//                 month: 'short',   // "Jan"
//                 year: 'numeric',  // "2026"
//                 timeZone: 'UTC'
//             }).format(new Date(value))}
//         </span>
//       );
//     },
// },

{
    accessorKey: "lastLoginAt",
    header: "Last Login",
    meta: { className: "w-[160px]" }, 
    cell: ({ getValue }) => {
      const value = getValue<string>();
      if (!value) return <span className="text-slate-400">-</span>;
      
      return (
        <span className="text-slate-600 font-mono text-xs">
            {new Intl.DateTimeFormat("en-GB", { 
                weekday: 'short', // "Mon"
                day: '2-digit',   // "12"
                month: 'short',   // "Jan"
                year: 'numeric',  // "2026"
                timeZone: 'UTC'
            }).format(new Date(value))}
        </span>
      );
    },
},


  /* -------------------------------------------------- */
  /* Actions                                            */
  /* -------------------------------------------------- */
  {
    id: "actions",
    cell: ({ row }) => {
      const data = row.original; // renamed 'user' to 'data' for generic use

      return (
        <div className="flex justify-end">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <SettingsIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-45">
              <DropdownMenuLabel>Manage Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Edit Action */}
              <DropdownMenuItem onClick={() => onView?.(data)}>
                <View className="mr-2 h-4 w-4 text-muted-foreground" />
                View Details
              </DropdownMenuItem>

              {/* Example: Duplicate (Optional based on your snippet) */}
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4 text-muted-foreground" />
                Duplicate
              </DropdownMenuItem>

              {/* Example: View Assignees (Optional) */}
              <DropdownMenuItem>
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                View Activity
              </DropdownMenuItem>

              {/* Conditional Delete Section */}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                    onClick={() => onDelete?.(data)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];