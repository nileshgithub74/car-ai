import React, { ReactNode } from 'react'
type Props ={
    children:ReactNode;
}

const MainLayout :React.FC<Props> = ({ children }) => {
  return (
    <div className='container mx-auto my-32'>

        {children}
    </div>
  )
}

export default MainLayout