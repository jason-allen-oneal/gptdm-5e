"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

NavBar.auth = true;

function NavBar() {
  const { data: session, status } = useSession();
  let loggedIn = false;
  
  if (status == "authenticated") {
    loggedIn = true;
  }

  let userLinks: React.ReactNode;
  
  if (session) {
    userLinks = (
      <>
        <li>
          <Link href="/dashboard/">Dashboard</Link>
        </li>
        <li>
          <Link onClick={() => signOut({ callbackUrl: 'http://172.235.158.51:3000/' })} href="#">
            Logout
          </Link>
        </li>
      </>
    );
  } else {
    userLinks = (
      <>
        <li>
          <Link href="/login/">Login</Link>
        </li>
        <li>
          <Link href="/register/">Register</Link>
        </li>
      </>
    );
  }

  return (
    <div className="navbar">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">GPTDM-5e</a>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
        {session && (
          <li>
            <Link href="/chat">Chat</Link>
          </li>
        )}
          <li>
            <details>
              <summary>
                Account
              </summary>
              <ul className="p-2 bg-base-100 rounded-t-none z-10">
                {userLinks}
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default NavBar;
