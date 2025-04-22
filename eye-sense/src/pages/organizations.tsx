import React, { useEffect, useState } from "react";
import { User } from "../types";
import {
  getCurrentUser,
  getUsersWithQuery,
} from "../controllers/user-controller";
import { useSearchParams } from "react-router-dom";
import { getDisplayRoleToRole } from "../utils/func-utils";

const Organizations = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [organizations, setOrganizations] = useState<string[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<User>();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

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

        const newSelectedUsers = data.filter((user: User) =>
          user.organizations.includes(searchOrgs[0])
        );
        console.log("newSelectedUsers:", newSelectedUsers);
        setSelectedUsers(newSelectedUsers);
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

  return (
    <div className="max-w-2xl ml-auto mr-auto p-5">
      <div className="flex justify-between">
        <div className="flex">
          {organizations.map((organization, index) => {
            return (
              <div
                key={index}
                className={`bg-white w-fit py-1 px-3 mb-2 mr-1 rounded-xl`}
              >
                <button
                  onClick={() => changeSelectedOrg(organization)}
                  className={organization === selectedOrg ? "font-bold" : ""}
                >
                  {organization}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex">
          <button
            onClick={() => setIsEditing(false)}
            className="darker-grey-btn w-fit py-1 px-3 mb-2 mr-1 rounded-xl cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={() => setIsEditing(true)}
            className="blue-btn w-fit py-1 px-3 mb-2 mr-1 rounded-xl cursor-pointer"
          >
            {isEditing ? "Save" : "Edit"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl py-1 px-3">
        {selectedUsers.map((user: User, index) => {
          return (
            <div
              key={index}
              className="flex justify-between p-3 inner-line-divider"
            >
              <p>
                {user.display_name} (
                <span className="italic">{user.username}</span>)
              </p>

              {isEditing &&
              currentUser?.role === "doctor" &&
              user.role !== "doctor" ? (
                <select className="text-right px-2">
                  {Object.entries(getDisplayRoleToRole()).map(
                    ([role, displayRole], roleIdx) => (
                      <option
                        key={user.username + roleIdx}
                        selected={role === user.role}
                        value={role}
                      >
                        {displayRole}
                      </option>
                    )
                  )}
                </select>
              ) : (
                <p className="capitalize font-bold">
                  {getDisplayRoleToRole()[user.role]}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Organizations;
