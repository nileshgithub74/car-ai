import { getadmin } from "@/action/admin";
import Header from "@/components/ui/Header";
import { notFound } from "next/navigation";
import React, { ReactNode } from "react";
import Sidebar from "./components/Sidebar/page";


type Props = {
  children: ReactNode;
};

const AdminLayout: React.FC<Props> = async ({ children }) => {
  const admin = await getadmin();

  if (!admin.authorized) {
    return notFound();
  }

  return (
    <div className="h-full">
      <Header isAdminPage={true} />
      <div className="flex fixed  w-56 flex-col top-20 fixed inset-y-0 z-50">
        <Sidebar/>
      </div>

      <main className=" md:pl-56 pt-[100px] h-full">{children}</main>
    </div>
  );
};

export default AdminLayout;
