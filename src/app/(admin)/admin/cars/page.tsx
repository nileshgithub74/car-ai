import { title } from 'process'
import React from 'react'
import CarList from './_component/CarList'


export const metaData = {
    title :"Cars | Vehiql Admin",
    description : " Manage Cars in your marketPlace"
}

const CreateCarpage = () => {
  return (
    <div className='p-6'>
        <div className="text-2xl font-bold mb-6">Cars Management</div>
<CarList/>


    </div>
  )
}

export default CreateCarpage