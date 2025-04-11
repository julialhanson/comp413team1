import React, { useEffect, useState } from "react";
import { User } from "../types";
import {
  getCurrentUser,
  getUsersWithQuery,
} from "../controllers/user-controller";
import { useSearchParams } from "react-router-dom";

const Organizations = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (!searchParams.get("organization")) {
        setSearchParams({ organization: user.organization });
      }

      getUsersWithQuery({
        organization: searchParams.get("organization") || user.organization,
      }).then((data) => {
        setUsers(data);
      });
    });
  });

  return (
    <div className="max-w-2xl ml-auto mr-auto p-5">
      <div className="bg-white rounded-xl p-6">
        {users.map((user: User) => {
          return (
            <div className="flex justify-between">
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
