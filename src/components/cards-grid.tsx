const CardsGrid = ({ children }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
      {children}
    </div>
  );
};

export default CardsGrid;
