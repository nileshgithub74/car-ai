import AddCarForm from "../_component/AddCarForm";

export const metaData = {
    title :"Cars | Vehiql Admin",
    description : " Manage Cars in your marketPlace"
}

const CarCreatepage = () => {


  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add new Car</h1>

      <AddCarForm/>




    </div>
  )
}

export default CarCreatepage;