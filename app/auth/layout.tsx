const AuthLayout = ({
  children
}: {
  children: React.ReactNode
}) => {
  return (
    <div className="h-full flex items-center justify-center bg-[#272727]">
      {children}
    </div>
  );
}

export default AuthLayout;