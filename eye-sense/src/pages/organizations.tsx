import React, { useEffect, useState } from "react";
import { User } from "../types";
import {
  getCurrentUser,
  getUsersWithQuery,
} from "../controllers/user-controller";
import { useSearchParams } from "react-router-dom";

const Organizations = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [organizations, setOrganizations] = useState<string[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  useEffect(() => {
    getCurrentUser().then((user: User) => {
      console.log("user:", user);
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

      <div className="bg-white rounded-xl p-3">
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

              <p className="capitalize font-bold">{user.role}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Organizations;
