import { getadmin } from '@/action/admin'
import Header from '@/components/ui/Header';
import { notFound } from 'next/navigation';
import React from 'react'

const AdminLayout = async () => {


  const admin = await getadmin();

  if(!admin.authorized){
    return notFound();

  }
  






  return (
    <div className='h-full'>
      <Header isAdminPage={true}/>
    </div>
  )
}

export default AdminLayout