interface Props {
  params: {
    id: string;
  };
}

const CarPage = ({ params }: Props) => {
  const { id } = params;

  return (
    <div>Car id: {id}</div>
  );
};

export default CarPage;
