import LoginForm from "../../components/LoginForm";
import Logo from "../../assets/TEA Logo.png"; // Ajusta la ruta si es necesario

const LoginPage = () => {
    return (
        <div
            className="min-vh-100 d-flex flex-column justify-content-center align-items-center"
            style={{
                background: "#457b9d",
                minHeight: "100vh",
                padding: "0",
            }}
        >
            <div className="w-100" style={{ maxWidth: 420 }}>
                <div className="text-center mb-4">
                    <img
                        src={Logo}
                        alt="Diagnóstico de TEA"
                        style={{
                            width: 200,
                            height: 200,
                            objectFit: "contain",
                            background: "#fff",
                            borderRadius: "50%",
                            boxShadow: "0 2px 8px rgba(29,53,87,0.15)",
                            border: "4px solid #f3859e"
                        }}
                    />
                    <h2
                        className="fw-bold mt-3 mb-1"
                        style={{ color: "white", fontSize: "1.3rem" }}
                    >
                        INICIAR SESIÓN
                    </h2>
                </div>
                <div
                    className="p-4 m-3 rounded shadow"
                    style={{
                        background: "#fff",
                        borderTop: "6px solid #f3859e",
                        borderRadius: 18,
                    }}
                >
                    <LoginForm />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
