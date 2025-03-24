import React, { useState } from "react";
import loginGraphic from "../assets/Login-amico.png";
import { User } from "../types";
import { loginUser, registerUser } from "../controllers/user-controller";

const Auth = () => {
  const [userToRegister, setUserToRegister] = useState<User>({
    username: "",
    password: "",
    email: "",
    display_name: "",
    organization: "",
    role: "",
  });
  const [userToLogin, setUserToLogin] = useState({
    username: "",
    password: "",
  });

  const [isRegistering, setIsRegistering] = useState<boolean>(true);

  return (
    <div className="max-w-4xl ml-auto mr-auto m-5 grid grid-cols-2 bg-white rounded-2xl items-center relative">
      <div className="p-10">
        <center className="font-bold">Login</center>

        <p>Username</p>
        <input
          type="text"
          className="auth-input px-3 py-1 mt-1 mb-3"
          onChange={(e) => {
            const newUser = { ...userToLogin };
            newUser.username = e.target.value;
            setUserToLogin(newUser);
          }}
        />

        <p>Password</p>
        <input
          type="password"
          className="auth-input px-3 py-1 mt-1 mb-3"
          onChange={(e) => {
            const newUser = { ...userToLogin };
            newUser.password = e.target.value;
            setUserToLogin(newUser);
          }}
        />
        <button
          className="btn blue-btn float-right"
          onClick={() => loginUser()}
        >
          Login
        </button>

        <button
          className="cursor-pointer dark-blue border-0 hover:border-b"
          onClick={() => setIsRegistering(true)}
        >
          Don't have an account?
        </button>
      </div>

      <img
        src={loginGraphic}
        alt=""
        className={
          "h-full py-10 px-5 rounded-3xl blue-bg border-7 border-white absolute transition duration-500 img-transition-start-left " +
          (isRegistering ? "" : "img-transition-end-right")
        }
      />

      <div className="p-10">
        <center className="font-bold">Create an account</center>

        <p>Username</p>
        <input
          type="text"
          className="auth-input px-3 py-1 mt-1 mb-3"
          onChange={(e) => {
            const newUser = { ...userToRegister };
            newUser.username = e.target.value;
            setUserToRegister(newUser);
          }}
        />

        <p>Display name</p>
        <input
          type="text"
          className="auth-input px-3 py-1 mt-1 mb-3"
          onChange={(e) => {
            const newUser = { ...userToRegister };
            newUser.display_name = e.target.value;
            setUserToRegister(newUser);
          }}
        />

        <p>Email</p>
        <input
          type="email"
          className="auth-input px-3 py-1 mt-1 mb-3"
          onChange={(e) => {
            const newUser = { ...userToRegister };
            newUser.email = e.target.value;
            setUserToRegister(newUser);
          }}
        />

        <p>Password</p>
        <input
          type="password"
          className="auth-input px-3 py-1 mt-1 mb-3"
          onChange={(e) => {
            const newUser = { ...userToRegister };
            newUser.password = e.target.value;
            setUserToRegister(newUser);
          }}
        />

        <p>Role</p>
        <select
          className="auth-input px-3 py-1 mt-1 mb-3"
          onChange={(e) => {
            const newUser = { ...userToRegister };
            newUser.role = e.target.value;
            setUserToRegister(newUser);
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
          onClick={() => registerUser(userToRegister)}
        >
          Register
        </button>

        <button
          className="cursor-pointer dark-blue border-0 hover:border-b"
          onClick={() => setIsRegistering(false)}
        >
          Already have an account?
        </button>
      </div>
    </div>
  );
};

export default Auth;
