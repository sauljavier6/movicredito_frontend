
import { useState } from "react";
import LoginComponent from "../../components/auth/LoginComponent";
import RegisterComponent from "../../components/auth/RegisterComponent";

const AuthPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <div>
    {isRegistering ? (
    <RegisterComponent onBack={() => setIsRegistering(false)} />
    ) : (
    <LoginComponent onRegister={() => setIsRegistering(true)} />
    )}
    </div>
  );
};

export default AuthPage;