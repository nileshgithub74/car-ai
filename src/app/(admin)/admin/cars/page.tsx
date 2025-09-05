import { title } from 'process'
import React from 'react'
import { CarsList } from './_component/CarList'


export const metadata = {
    title :"Cars | Vehiql Admin",
    description : " Manage Cars in your marketPlace"
}

const CreateCarpage = () => {
  return (
    <div className='p-6'>
        <div className="text-2xl font-bold mb-6">Cars Management</div>
        <CarsList/>


    </div>
  )
}

export default CreateCarpage;