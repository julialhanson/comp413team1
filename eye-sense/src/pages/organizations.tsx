import { useEffect, useState } from "react";
import { User } from "../types";
import {
  getCurrentUser,
  getUsersWithQuery,
  updateUserRole,
} from "../controllers/user-controller";
import { useSearchParams } from "react-router-dom";
import { getDisplayRoleToRole } from "../utils/func-utils";

const Organizations = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const displayRoleToRole = getDisplayRoleToRole();

  const [organizations, setOrganizations] = useState<string[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<User>();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [changedUsers, setChangedUsers] = useState<User[]>([]);

  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    getCurrentUser().then((user: User) => {
      console.log("user:", user);
      setCurrentUser(user);

      if (!searchParams.get("organization")) {
        const orgSearchParams: string[][] = user.organizations.map(
          (organization) => {
            return ["organization", organization];
          }
        );
        setSearchParams(new URLSearchParams(orgSearchParams));
      }

      const searchOrgs: string[] =
        searchParams.getAll("organization") || user.organizations;

      setOrganizations(searchOrgs);
      console.log("organizations:", searchOrgs);
      setSelectedOrg(searchOrgs[0]);

      const orgSearchParams: string[][] = searchOrgs.map((organization) => {
        return ["organization", organization];
      });
      console.log("orgSearchParams:", orgSearchParams);
      getUsersWithQuery(orgSearchParams).then((data) => {
        setUsers(data);

        console.log("data:", data);
        console.log("selectedOrg:", searchOrgs[0]);

        const newSelectedUsers = data.filter(
          (user: User) =>
            user.organizations && user.organizations.includes(searchOrgs[0])
        );
        console.log("newSelectedUsers:", newSelectedUsers);
        setSelectedUsers(newSelectedUsers);
        setChangedUsers(structuredClone(newSelectedUsers));
      });
    });
  }, [searchParams]);

  const changeSelectedOrg = (organization: string) => {
    setSelectedOrg(organization);

    const newSelectedUsers = users.filter((user) =>
      user.organizations.includes(organization)
    );
    setSelectedUsers(newSelectedUsers);
  };

  const changeUserRole = (index: number, newRole: string) => {
    const newChangedUsers = [...changedUsers];
    newChangedUsers[index].role = newRole;
    setChangedUsers(newChangedUsers);

    console.log("selectedUsers:", selectedUsers);
    console.log("changedUsers:", newChangedUsers);
  };

  const saveChangesToRoles = () => {
    changedUsers.map((changedUser: User) => {
      updateUserRole(changedUser.username, changedUser.role);
    });

    setSelectedUsers(structuredClone(changedUsers));
  };

  return (
    <div className="max-w-2xl ml-auto mr-auto p-5">
      <div className="flex justify-between">
        <div className="flex">
          {organizations.map((organization, orgIdx) => {
            return (
              <div
                key={orgIdx}
                className={`bg-white w-fit py-1 px-3 mb-2 mr-1 rounded-xl`}
              >
                <button
                  onClick={() => changeSelectedOrg(organization)}
                  className={`cursor-pointer ${
                    organization === selectedOrg ? "font-bold" : ""
                  }`}
                >
                  {organization}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex">
          {isEditing && (
            <button
              onClick={() => {
                setIsEditing(false);
                setChangedUsers(structuredClone(selectedUsers));
              }}
              className="darker-grey-btn w-fit py-1 px-3 mb-2 mr-1 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
          )}

          {currentUser?.role === "doctor" && (
            <button
              onClick={() => {
                if (isEditing) {
                  saveChangesToRoles();
                }

                setIsEditing(!isEditing);
              }}
              className="blue-btn w-fit py-1 px-3 mb-2 mr-1 rounded-xl cursor-pointer"
            >
              {isEditing ? "Save" : "Edit"}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl py-1 px-3">
        {(isEditing ? changedUsers : selectedUsers).map(
          (user: User, userIdx) => {
            return (
              <div
                key={userIdx}
                className="flex justify-between p-3 inner-line-divider"
              >
                <p
                  className={
                    currentUser?.username === user.username ? "font-bold" : ""
                  }
                >
                  {user.display_name} (
                  <span className="italic">{user.username}</span>)
                </p>

                {isEditing &&
                currentUser?.role === "doctor" &&
                currentUser.username !== user.username ? (
                  <select
                    className="text-right px-2"
                    onChange={(e) => changeUserRole(userIdx, e.target.value)}
                    value={user.role}
                  >
                    {Object.entries(displayRoleToRole).map(
                      ([role, displayRole], roleIdx) => (
                        <option key={user.username + roleIdx} value={role}>
                          {displayRole}
                        </option>
                      )
                    )}
                  </select>
                ) : (
                  <p className="capitalize font-bold">
                    {displayRoleToRole[user.role]}
                  </p>
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default Organizations;
