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

  useEffect(() => {
    getCurrentUser().then((user: User) => {
      if (!searchParams.get("organization")) {
        const orgSearchParams: string[][] = [];
        user.organizations.forEach((organization) => {
          orgSearchParams.push(["organization", organization]);
        });
        setSearchParams(new URLSearchParams(orgSearchParams));
      }

      const organizations: string[] =
        searchParams.getAll("organization") || user.organizations;

      setOrganizations(organizations);

      const orgSearchParams: string[][] = organizations.map((organization) => {
        return ["organization", organization];
      });
      getUsersWithQuery(orgSearchParams).then((data) => {
        setUsers(data);
      });
    });
  }, []);

  return (
    <div className="max-w-2xl ml-auto mr-auto p-5">
      <div className="flex">
        {organizations.map((organization, index) => {
          return (
            <div
              key={index}
              className="bg-white w-fit py-1 px-3 mb-1 mr-1 rounded-xl"
            >
              <button
                onClick={() => setSelectedOrg(organization)}
                className={organization === selectedOrg ? "font-bold" : ""}
              >
                {organization}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl p-6">
        {users.map((user: User, index) => {
          return (
            <div key={index} className="flex justify-between">
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
