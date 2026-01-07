const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <div className="flex flex-col sm:flex-row items-stretch gap-6">
        <h1 className="text-6xl font-bold mr-2 pb-1">404</h1>
        <span className="w-[2px] bg-foreground hidden sm:block"></span>{" "}
        <p className="text-2xl font-semibold flex items-center">
          Страница не найдена
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
