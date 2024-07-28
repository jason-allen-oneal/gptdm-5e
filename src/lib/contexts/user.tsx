"use client";

import { createContext, PropsWithChildren, useContext, useState } from "react";

interface UserContextProps {
  user: User | null;
  setUser: (u: User) => void;
}

const defaults = {
  user: null,
  setUser: (u: User) => {},
};

export const UserContext =
  createContext<UserContextProps>(defaults);

export const UserProvider = (props: PropsWithChildren) => {
  let u = defaults.user;
  console.log('props.user', JSON.stringify(props.user));
  if (props.user && props.user != undefined) {
    u = props.user
  }
  
  const [user, setUser] = useState<User | null>(u);
  return (
    <UserContext.Provider
      value={{
        user: user,
        setUser: setUser,
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};

export function useUser() {
  return useContext(UserContext);
}







