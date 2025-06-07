import React from "react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Dashboard = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/");
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-semibold text-black">Dashboard</h1>
      <div className="flex flex-col gap-4 rounded bg-indigo-300 p-2">
        <p className="text-xl">
          Name: {user?.given_name + " " + user?.family_name}
        </p>
        <p className="text-xl">Email: {user?.email}</p>
      </div>
      <LogoutLink>Log out</LogoutLink>
    </div>
  );
};

export default Dashboard;
