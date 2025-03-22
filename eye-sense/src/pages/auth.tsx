import React, { useState } from "react";
import loginGraphic from "../assets/Login-amico.png";
import { User } from "../types";
import { registerUser } from "../controllers/user-controller";

const Auth = () => {
  const [user, setUser] = useState<User>({
    username: "",
    password: "",
    email: "",
    display_name: "",
    organization: "",
    role: "",
  });

  return (
    <div className="max-w-4xl ml-auto mr-auto m-5 p-7 grid grid-cols-2 bg-white rounded-2xl flex items-center">
      <img src={loginGraphic} alt="" className="w-full" />

      <div className="pl-7">
        <center className="font-bold">Create an account</center>

        <p>Username</p>
        <input
          type="text"
          className="auth-input px-3 py-1 mt-1 mb-3"
          onChange={(e) => {
            const newUser = { ...user };
            newUser.username = e.target.value;
            setUser(newUser);
          }}
        />

        <p>Email</p>
        <input
          type="email"
          className="auth-input px-3 py-1 mt-1 mb-3"
          onChange={(e) => {
            const newUser = { ...user };
            newUser.email = e.target.value;
            setUser(newUser);
          }}
        />

        <p>Display name</p>
        <input
          type="text"
          className="auth-input px-3 py-1 mt-1 mb-3"
          onChange={(e) => {
            const newUser = { ...user };
            newUser.display_name = e.target.value;
            setUser(newUser);
          }}
        />

        <p>Password</p>
        <input
          type="password"
          className="auth-input px-3 py-1 mt-1 mb-3"
          onChange={(e) => {
            const newUser = { ...user };
            newUser.password = e.target.value;
            setUser(newUser);
          }}
        />

        <p>Role</p>
        <select
          className="auth-input px-3 py-1 mt-1 mb-3"
          onChange={(e) => {
            const newUser = { ...user };
            newUser.role = e.target.value;
            setUser(newUser);
          }}
        >
          <option value="" selected disabled hidden>
            Select a role...
          </option>
          <option value="layman">Layman</option>
          <option value="student">Medical student</option>
          <option value="resident">Resident</option>
          <option value="nurse">Nurse</option>
          <option value="doctor">Doctor</option>
        </select>

        <button
          className="btn blue-btn float-right"
          onClick={() => registerUser(user)}
        >
          Create
        </button>
      </div>
    </div>
  );
};

export default Auth;
