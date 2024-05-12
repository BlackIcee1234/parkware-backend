import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../pages/config";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { useEffect } from "react";
import Cookies from "js-cookie";

const Header = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    const userSession = Cookies.get('user');
    console.log(userSession);
    if (!user || !userSession) {
      //router.push('/sign-up/page');
    }
  }, [user]);

  const handleLogout = () => {
    signOut(auth);
    sessionStorage.removeItem('user');
    router.push("/");
  };

  const handleLogin = () => {
    router.push("sign-in/page");
  };

  return (
    <header className="bg-gray-800 py-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-lg font-semibold">Parkware Admin</h1>
        <nav>
          {user ? (
            <button
              className="text-white font-medium py-2 px-4 rounded-md bg-red-500 hover:bg-red-600 transition-colors"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <button
              className="text-white font-medium py-2 px-4 rounded-md bg-blue-500 hover:bg-blue-600 transition-colors"
              onClick={handleLogin}
            >
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
